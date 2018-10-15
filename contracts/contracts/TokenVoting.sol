pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './libs/SafeMath.sol';
import './PrivateToken.sol';
import './TokenEscrow.sol';

contract TokenVoting is Pausable{
    using SafeMath for uint256;

    PrivateToken privateToken;
    TokenEscrow escrow;

    constructor(PrivateToken _privateTokenTokenAddress) public {
        privateToken = PrivateToken(_privateTokenTokenAddress);
    }

    struct Vote {
        uint256 orderId;
        uint256 score;
        address voter;
        string description;
        uint256 createdAt;
    }

    struct VoteAvg {
        uint256 totalScore;
        uint256 totalVote;
    }

    mapping (address => Vote[]) voting;
    mapping (address => VoteAvg) voteAvg;

    function rating(address _from, address _to, uint256 _orderId, uint256 _score, string _comments) public returns(bool) {
        require(_score >= 0 && _score <= 5);
        require(_from != _to);
        address _buyer = escrow.getBuyerOrder(_orderId);
        address _seller = escrow.getSellerOrder(_orderId);
        require((_buyer == _from && _seller == _to) || (_buyer == _to && _seller == _from));
        
        
        for (uint256 i = 0; i < voting[_to].length; i++) {
            if (voting[_to][i].voter == _from && voting[_to][i].orderId == _orderId){
                return false;
            }
        }

        voting[_to].push(Vote({
            orderId: _orderId,
            score: _score,
            voter: _from,
            description: _comments,
            createdAt: now
        }));

        voteAvg[_to].totalScore.add(_score);
        voteAvg[_to].totalVote.add(1);
        
        return true;

    }

    function getRating(address _delegate) public view returns(uint256, uint256, uint256) {
        uint256 _totalVote = voteAvg[_delegate].totalVote;
        uint256 _totalScore = voteAvg[_delegate].totalScore;
        uint256 _score = _totalScore.div(_totalVote);
        return (_totalVote, _totalScore, _score);
    }

    function getComment(address _delegate, uint256 _index) public view returns(string _comment) {
        _comment = voting[_delegate][_index].description;
        return _comment;
    }

    function isVoted(address _delegate, uint256 _orderId) public view returns(bool) {
        require(msg.sender != _delegate);
        
        for (uint256 i = 0; i < voting[_delegate].length; i++) {
            if (voting[_delegate][i].voter == msg.sender && voting[_delegate][i].orderId == _orderId){
                return true;
            }
        }

        return false;
    }
    
    // Setup Token escrow Smart Contract
    function setTokenEscrowAddress(address _tokenEscrowAddress) public onlyOwner {
        if (_tokenEscrowAddress != address(0)) {
            escrow = TokenEscrow(_tokenEscrowAddress);
        }
    }

}