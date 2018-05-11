pragma solidity ^0.4.20;
import './interfaces/Pausable.sol';
import './libs/SafeMath.sol';
import './BinkabiTokenCreate.sol';

contract BinkabiVoting is Pausable{
    using SafeMath for uint256;

    BinkabiTokenCreate binkabi;

    constructor(BinkabiTokenCreate _binkabiTokenAddress) public {
        binkabi = BinkabiTokenCreate(_binkabiTokenAddress);
    }

    struct Vote {
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

    function rating(address delegate, uint256 score, string comments) public returns(bool) {
        require(score > 0 && score < 5);
        require(msg.sender != delegate);
        
        for (uint256 i = 0; i < voting[delegate].length; i++) {
            if (voting[delegate][i].voter == msg.sender){
                return false;
            }
        }

        voting[delegate].push(Vote({
            rate: score,
            voter: msg.sender,
            description: comments,
            created_at: now
        }));

        vote_avg[delegate].total_score += score;
        vote_avg[delegate].total_vote += 1;

        //TODO: Bonus 5 BNB for voter, if score less than 2 punish seller
        binkabi.bonusMember(msg.sender, 5);
        if (score <= 2){
            binkabi.punishMember(delegate, 5);
        }
        
        return true;

    }

    function getRating(address delegate) public view returns(uint256, uint256) {
        uint256 total_vote = vote_avg[delegate].total_vote;
        uint256 total_score = vote_avg[delegate].total_score;
        uint256 rate = total_score.div(total_vote);
        return (rate, total_vote);
    }

    // function getComment(address delegate) public returns(Vote[] list_comment) {
    //     list_comment = voting[delegate];
    //     return list_comment;
    // }

    function isRated(address delegate) public view returns(bool) {
        require(msg.sender != delegate);
        bool is_rated = false;
        
        for (uint256 i = 0; i < voting[delegate].length; i++) {
            if (voting[delegate][i].voter == msg.sender){
                is_rated = true;
            }
        }

        return is_rated;
    }

}