pragma solidity ^0.4.20;
import './interfaces/StandardToken.sol';
import './interfaces/Pausable.sol';
import './Membership.sol';
import './TokenEscrow.sol';

contract PrivateToken is StandardToken, Pausable{
    string public constant name = "PrivateToken";
    string public constant symbol = "PVT";
    uint256 public constant decimals = 18;
    Membership mbship;
    TokenEscrow escrowContract;

    address public tokenSaleAddress;
    address public tokenEscrowAddress;
    address public tokenVotingAddress;
    address public tokenMembershipAddress;
    address public privateTokenDepositAddress; // MultiSigWallet
    address public privateTokenTokenAddress;

    uint256 public constant privateTokenDeposit = 100000000 * 10 ** decimals;

    event TokenEscrow(address _buyer, address _seller, uint256 _amount_buyer, uint256 _amount_seller);
    event TokenBonus(address _member, uint256 _amount);
    event TokenPunish(address _member, uint256 _amount);
    event MembershipWithdrawal(address _member, uint256 _amount);

    constructor(address _privateTokenDepositAddress) public {
        privateTokenDepositAddress = _privateTokenDepositAddress;

        balances[privateTokenDepositAddress] = privateTokenDeposit;
        emit Transfer(0x0, privateTokenDepositAddress, privateTokenDeposit);
        totalSupply_ = privateTokenDeposit;
    }    

    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {    
        if (_to == tokenMembershipAddress) {            
            mbship = Membership(tokenMembershipAddress);      
            mbship.activeMember(msg.sender, _value, block.number);
        }
        if (_to == tokenEscrowAddress) {
            escrowContract = TokenEscrow(privateTokenTokenAddress);
            escrowContract.updatePayment(msg.sender, _value);
        }
        return super.transfer(_to, _value);
    }

    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
        return super.approve(_spender, _value);
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return super.balanceOf(_owner);
    }

    function setPrivateTokenAddress(address _bnbAdress) public onlyOwner{
        privateTokenTokenAddress = _bnbAdress;
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

        balances[privateTokenDepositAddress] = balances[privateTokenDepositAddress].sub(_value);
        balances[_recipient] = balances[_recipient].add(_value);

        emit Transfer(privateTokenDepositAddress, _recipient, _value);
        return true;
    }

    // Setup Token escrow Smart Contract
    function setTokenEscrowAddress(address _tokenEscrowAddress) public onlyOwner {
        if (_tokenEscrowAddress != address(0)) {
            tokenEscrowAddress = _tokenEscrowAddress;
            escrowContract = TokenEscrow(_tokenEscrowAddress);
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
            mbship = Membership(_tokenMembershipAddress);
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
