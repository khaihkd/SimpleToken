pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './libs/SafeMath.sol';
import './libs/SafeMath.sol';
import './BinkabiTokenCreate.sol';


contract BinkabiTokenSale is Pausable {
    using SafeMath for uint256;
    address public binkabiDepositAddress;
    uint256 public constant tokenExchangeRate = 1000;
    uint256 public constant totalTokenSale = 50000000 * 10 ** 18;
    uint256 public totalTokenSold = 0;

    BinkabiTokenCreate binkabi;

    event MintBinkabi(address from, address to, uint256 val);
    event RefundBinkabi(address to, uint256 val);
    event LogBinkabi(address add, uint256 val);

    constructor(BinkabiTokenCreate _binkabiTokenAddress, address _binkabiDepositAddress) public {
        binkabi = BinkabiTokenCreate(_binkabiTokenAddress);
        binkabiDepositAddress = _binkabiDepositAddress;
    }

    function buy(address to, uint256 val) internal returns (bool success) {
        emit MintBinkabi(binkabiDepositAddress, to, val);
        return binkabi.mint(to, val);
    }

    function () public payable {
        createTokens(msg.sender, msg.value);
    }

    function createTokens(address _beneficiary, uint256 _value) internal whenNotPaused {
        uint256 tokens = _value.mul(tokenExchangeRate);
        uint256 tokenAvailable = totalTokenSale - totalTokenSold;
        uint256 etherToRefund = 0;
        uint256 currentTokenSell = 0;

        require(tokenAvailable > 0);

        if (tokens > tokenAvailable){
            currentTokenSell  = tokenAvailable;
            etherToRefund = (tokens - tokenAvailable).div(tokenExchangeRate);
        } else {
            currentTokenSell = tokens;
        }

        buy(_beneficiary, currentTokenSell);
        totalTokenSold += currentTokenSell;

        if (etherToRefund > 0){
            emit RefundBinkabi(msg.sender, etherToRefund);
            msg.sender.transfer(etherToRefund);
        }

        binkabiDepositAddress.transfer(msg.value);
        return;
    }
}



