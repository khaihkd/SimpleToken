pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './libs/SafeMath.sol';
import './BinkabiTokenCreate.sol';
import './BinkabiEscrow.sol';

contract BinkabiVoting is Pausable{
    using SafeMath for uint256;

    BinkabiTokenCreate binkabi;
    BinkabiEscrow escrow;

    constructor(BinkabiTokenCreate _binkabiTokenAddress) public {
        binkabi = BinkabiTokenCreate(_binkabiTokenAddress);
        escrow = BinkabiEscrow(_binkabiTokenAddress);
    }

    struct Vote {
        uint256 order_id;
        uint256 rate;
        address voter;
        string description;
        uint256 created_at;
    }

    struct VoteAvg {
        uint256 total_score;
        uint256 total_vote;
    }

    mapping (address => Vote[]) voting;
    mapping (address => VoteAvg) vote_avg;

    function rating(address _from, address _to, uint256 _order_id, uint256 score, string comments) public returns(bool) {
        require(score > 0 && score < 5);
        require(_from != _to);
        address _buyer = escrow.getBuyerOrder(_order_id);
        address _seller = escrow.getSellerOrder(_order_id);
        require((_buyer == _from && _seller == _to) || (_buyer == _to && _seller == _from));
        
        
        for (uint256 i = 0; i < voting[_to].length; i++) {
            if (voting[_to][i].voter == _from && voting[_to][i].order_id == _order_id){
                return false;
            }
        }

        voting[_to].push(Vote({
            order_id: _order_id,
            rate: score,
            voter: _from,
            description: comments,
            created_at: now
        }));

        vote_avg[_to].total_score.add(score);
        vote_avg[_to].total_vote.add(1);
        
        return true;

    }

    function getRating(address _delegate) public view returns(uint256) {
        uint256 total_vote = vote_avg[_delegate].total_vote;
        uint256 total_score = vote_avg[_delegate].total_score;
        uint256 rate = total_score.div(total_vote);
        return rate;
    }

    function getTotalRating(address _delegate) public view returns(uint256) {
        uint256 total_vote = vote_avg[_delegate].total_vote;
        return total_vote;
    }

    function getComment(address _delegate, uint256 _index) public view returns(string) {
        string _comment = voting[_delegate][_index].description;
        return _comment;
    }

    function isRated(address _delegate) public view returns(bool) {
        require(msg.sender != _delegate);
        bool is_rated = false;
        
        for (uint256 i = 0; i < voting[_delegate].length; i++) {
            if (voting[_delegate][i].voter == msg.sender){
                is_rated = true;
            }
        }

        return is_rated;
    }

}