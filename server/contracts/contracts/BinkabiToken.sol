pragma solidity ^0.4.20;
import './interfaces/StandardToken.sol';
import './interfaces/Pausable.sol';
import './BinkabiMembership.sol';

contract BinkabiToken is StandardToken, Pausable{
    string public constant name = "Binkabi";
    string public constant symbol = "BKB";
    uint256 public constant decimals = 18;
    BinkabiMembership mbship;

    address public tokenSaleAddress;
    address public tokenEscrowAddress;
    address public tokenVotingAddress;
    address public tokenMembershipAddress;
    address public binkabiDepositAddress; // MultiSigWallet
    address public binkabiTokenAdress;

    uint256 public constant binkabiDeposit = 100000000 * 10 ** decimals;

    event TokenEscrow(address _buyer, address _seller, uint256 _amount_buyer, uint256 _amount_seller);
    event TokenBonus(address _member, uint256 _amount);
    event TokenPunish(address _member, uint256 _amount);
    event MembershipWithdrawal(address _member, uint256 _amount);

    constructor(address _binkabiDepositAddress) public {
        binkabiDepositAddress = _binkabiDepositAddress;

        balances[binkabiDepositAddress] = binkabiDeposit;
        emit Transfer(0x0, binkabiDepositAddress, binkabiDeposit);
        totalSupply_ = binkabiDeposit;
    }    

    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {        
        mbship = BinkabiMembership(binkabiTokenAdress);
        if (_to == tokenMembershipAddress) {
            
            mbship.activeMember(msg.sender, _value, block.number);
        }
        return super.transfer(_to, _value);
    }

    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
        return super.approve(_spender, _value);
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return super.balanceOf(_owner);
    }

    function setBinkabiAddress(address _bnbAdress) public onlyOwner{
        binkabiTokenAdress = _bnbAdress;        
    }

    // Setup Token Sale Smart Contract
    function setTokenSaleAddress(address _tokenSaleAddress) public onlyOwner {
        if (_tokenSaleAddress != address(0)) {
            tokenSaleAddress = _tokenSaleAddress;
        }
    }

    // This function is only called by Token Sale Smart Contract
    function mint(address _recipient, uint256 _value) public whenNotPaused returns (bool) {
        require(_value > 0);
        require(msg.sender == tokenSaleAddress);

        balances[binkabiDepositAddress] = balances[binkabiDepositAddress].sub(_value);
        balances[_recipient] = balances[_recipient].add(_value);

        emit Transfer(binkabiDepositAddress, _recipient, _value);
        return true;
    }

    // Setup Token escrow Smart Contract
    function setTokenEscrowAddress(address _tokenEscrowAddress) public onlyOwner {
        if (_tokenEscrowAddress != address(0)) {
            tokenEscrowAddress = _tokenEscrowAddress;
        }
    }
    
    // This function is only called by Token escrow Smart Contract
    function escrow(address _buyer, address _seller, uint256 _amount_buyer, uint256 _amount_seller) public whenNotPaused {
        require(_amount_buyer > 0 || _amount_seller > 0);
        require(msg.sender == tokenEscrowAddress);
        
        balances[tokenEscrowAddress] = balances[tokenEscrowAddress].sub(_amount_buyer).sub(_amount_seller);
        balances[_buyer] = balances[_buyer].add(_amount_buyer);
        balances[_seller] = balances[_seller].add(_amount_seller);

        emit TokenEscrow(_buyer, _seller, _amount_buyer, _amount_seller);
    }

    // Setup Token voting Smart Contract
    function setTokenVotingAddress(address _tokenVotingAddress) public onlyOwner {
        if (_tokenVotingAddress != address(0)) {
            tokenVotingAddress = _tokenVotingAddress;
        }
    }      

    // Setup Token Membership Smart Contract
    function setTokenMembershipAddress(address _tokenMembershipAddress) public onlyOwner {
        if (_tokenMembershipAddress != address(0)) {
            tokenMembershipAddress = _tokenMembershipAddress;
        }
    }
    
    // This function is only called by Token Membership Smart Contract
    function withdrawal(address _member, uint256 _amount) whenNotPaused public {
        require(msg.sender == tokenMembershipAddress);
        balances[tokenMembershipAddress].sub(_amount);
        balances[_member].add(_amount);
        emit MembershipWithdrawal(_member, _amount);
    }

}