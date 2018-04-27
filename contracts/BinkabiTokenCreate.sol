pragma solidity ^0.4.20;
import './interfaces/StandardToken.sol';
import './interfaces/Pausable.sol';

contract BinkabiTokenCreate is StandardToken, Pausable{
    string public constant name = "Binkabi";
    string public constant symbol = "BNB";
    uint256 public constant decimals = 18;

    address public tokenSaleAddress;
    address public tokenEscrowAddress;
    address public tokenVotingAddress;
    address public binkabiDepositAddress; // MultiSigWallet

    uint256 public constant binkabiDeposit = 100000000 * 10 ** decimals;

    constructor(address _binkabiDepositAddress) public {
        binkabiDepositAddress = _binkabiDepositAddress;

        balances[binkabiDepositAddress] = binkabiDeposit;
        emit Transfer(0x0, binkabiDepositAddress, binkabiDeposit);
        totalSupply_ = binkabiDeposit;
    }    

    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool success) {
        return super.transfer(_to, _value);
    }

    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool success) {
        return super.approve(_spender, _value);
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return super.balanceOf(_owner);
    }

    // Setup Token Sale Smart Contract
    function setTokenSaleAddress(address _tokenSaleAddress) public onlyOwner {
        if (_tokenSaleAddress != address(0)) {
            tokenSaleAddress = _tokenSaleAddress;
        }
    }

    // This function is only called by Token Sale Smart Contract
    function mint(address _recipient, uint256 _value) public whenNotPaused returns (bool success) {
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
    function escrow(address buyer_seller, uint256 _amount, bool isArbiterReceiver) public whenNotPaused returns (bool success) {
        require(_amount > 0);
        require(msg.sender == tokenEscrowAddress);

        address receiver;
        address sender;
        if (isArbiterReceiver){
            receiver = tokenEscrowAddress;
            sender = buyer_seller;
        } else {
            receiver = buyer_seller;
            sender = tokenEscrowAddress;            
        }

        if (balances[sender] < _amount) {
            return false;
        }

        balances[sender] = balances[sender].sub(_amount);
        balances[receiver] = balances[receiver].add(_amount);

        emit Transfer(sender, receiver, _amount);
        return true;
    }

    // Setup Token voting Smart Contract
    function setTokenVotingAddress(address _tokenVotingAddress) public onlyOwner {
        if (_tokenVotingAddress != address(0)) {
            tokenVotingAddress = _tokenVotingAddress;
        }
    }
    
    // This function is only called by Token voting Smart Contract
    function bonusMember(address _voter, uint256 _amount) public whenNotPaused returns (bool success) {
        require(_amount > 0);
        require(msg.sender == tokenVotingAddress);
        
        balances[tokenVotingAddress] = balances[tokenVotingAddress].sub(_amount);
        balances[_voter] = balances[_voter].add(_amount);

        emit Transfer(tokenVotingAddress, _voter, _amount);
        return true;
    }
    
    // This function is called by Token voting & escrow Smart Contract
    function punishMember(address _person, uint256 _amount) public whenNotPaused returns (bool success) {
        require(_amount > 0);
        require(msg.sender == tokenVotingAddress || msg.sender == tokenEscrowAddress);
        
        balances[tokenVotingAddress] = balances[tokenVotingAddress].sub(_amount);
        balances[_person] = balances[_person].add(_amount);

        emit Transfer(tokenVotingAddress, _person, _amount);
        return true;
    }

}