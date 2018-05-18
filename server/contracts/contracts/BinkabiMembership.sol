pragma solidity ^0.4.20;

import './interfaces/Pausable.sol';
import './libs/SafeMath.sol';
import './BinkabiToken.sol';

contract BinkabiMembership is Pausable {
    using SafeMath for uint256;
    mapping (address => uint256) balances;
    BinkabiToken binkabi;

    event Withdrawal(address _holder, uint256 _amount);
    event Active(address _holder, uint256 _amount);
    event Register(address _member, string _email);

    struct Member {
        string email;
        uint256 amount;
        bool isActive;
        uint256 blockActive;
        uint256 createdAt;
    }
    mapping (address => Member) public members;
    string[] public emails;
    mapping (address => uint256) public memberActive;
    address public binkabiTokenAddress;

    modifier onlyOwnerExchange() {
        require(msg.sender == 0xD9C69E9E6949BDbf900d3A1639041069fA73C44f);
        _;
    }

    modifier onlyBinkabi() {
        require(msg.sender == binkabiTokenAddress);
        _;
    }

    constructor(BinkabiToken _binkabiTokenAddress) public {
        binkabi = BinkabiToken(_binkabiTokenAddress);
        binkabiTokenAddress = _binkabiTokenAddress;
    }

    function registerMember(string _email, address _member) onlyOwnerExchange public {
        require(memberActive[_member] <= 0);
        for (uint256 i = 0; i < emails.length; i++) {
            require(keccak256(emails[i]) != keccak256(_email));
        }
        
        members[_member] = Member({
            email: _email,
            isActive: false,
            createdAt: now,
            blockActive: 0,
            amount: 0
        });
        emails.push(_email);
        memberActive[_member] = 1;
        emit Register(_member, _email);
    }

    function getAmount(address _member) public view returns (uint256) {
        return members[_member].amount;
    }

    function activeMember(address _member, uint256 _amount, uint256 _block_number) onlyBinkabi public {
        members[_member].isActive = true;
        members[_member].amount = _amount;
        members[_member].blockActive = _block_number;
        emit Active(_member, _amount);
    }

    function memberWithdrawal(address _member, uint256 _amount) onlyOwnerExchange public {
        require(members[_member].amount >= _amount);
        binkabi.withdrawal(_member, _amount);
        members[_member].amount = members[_member].amount.sub(_amount);
        emit Withdrawal(_member, _amount);
    }

    function isMembership(address _member) onlyOwnerExchange public view returns(bool) {
        bool _isActive;
        if (members[_member].amount > 0 && members[_member].isActive == true && (block.number - 5) >= members[_member].blockActive) {
            _isActive = true;
        }
        _isActive = false;
        return _isActive;
    }
}