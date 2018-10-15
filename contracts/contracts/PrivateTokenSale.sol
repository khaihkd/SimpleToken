pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './libs/SafeMath.sol';
import './libs/SafeMath.sol';
import './PrivateToken.sol';


contract PrivateTokenSale is Pausable {
    using SafeMath for uint256;
    address public privateTokenDepositAddress;
    uint256 public constant tokenExchangeRate = 1000;
    uint256 public constant totalTokenSale = 50000000 * 10 ** 18;
    uint256 public totalTokenSold = 0;


//    uint256 public constant preSaleTime = 1527465600; // 2018-05-28 00:00:00
//    uint256 public constant preSaleEnd = 1527552000; // 2018-05-29 00:00:00
//    uint256 public constant preSaleBonus = 10; // Bonus 10% pre sale
//    uint256 public constant preSaleMinContribution = 50 ether;
//    uint256 public constant preSaleMaxContribution = 100 ether;
//
//
//    uint256 public constant publicSaleTime = 1527638400; // 2018-05-30 00:00:00
//    uint256 public constant publicSaleEnd = 1590796800; // 2020-05-30 00:00:00
//    uint256 public constant publicSaleminContribution = 0.5 ether;
//    uint256 public constant publicSalemaxContribution = 10 ether;

    PrivateToken privateToken;

    event MintPrivateToken(address from, address to, uint256 val);
    event RefundPrivateToken(address to, uint256 val);
    event LogPrivateToken(address add, uint256 val);

    constructor(PrivateToken _privateTokenTokenAddress, address _privateTokenDepositAddress) public {
        privateToken = PrivateToken(_privateTokenTokenAddress);
        privateTokenDepositAddress = _privateTokenDepositAddress;
    }

    function buy(address to, uint256 val) internal returns (bool success) {
        emit MintPrivateToken(privateTokenDepositAddress, to, val);
        return privateToken.mint(to, val);
    }

    function () public payable {
        createTokens(msg.sender, msg.value);
    }

    function createTokens(address _beneficiary, uint256 _value) internal whenNotPaused {
//         require((now >= preSaleTime && now <= preSaleEnd) || (now >= publicSaleTime && now <= publicSaleEnd));

        uint256 tokens = _value.mul(tokenExchangeRate);
//         if (now >= preSaleTime && now <= preSaleEnd) {
//             require(_value >= preSaleMinContribution && _value <= preSaleMaxContribution);
//             tokens = tokens.mul((100 + preSaleBonus) / 100);
//         }
//
//         else {
//             require(_value >= publicSaleminContribution && _value <= publicSalemaxContribution);
//         }
        uint256 tokenAvailable = totalTokenSale.sub(totalTokenSold);
        uint256 etherToRefund = 0;
        uint256 currentTokenSell = 0;

        require(tokenAvailable > 0);

        if (tokens > tokenAvailable){
            currentTokenSell  = tokenAvailable;
            etherToRefund = (tokens.sub(tokenAvailable)).div(tokenExchangeRate);
        } else {
            currentTokenSell = tokens;
        }

        buy(_beneficiary, currentTokenSell);
        totalTokenSold += currentTokenSell;

        if (etherToRefund > 0){
            emit RefundPrivateToken(msg.sender, etherToRefund);
            msg.sender.transfer(etherToRefund);
        }

        privateTokenDepositAddress.transfer(msg.value);
        return;
    }
}



