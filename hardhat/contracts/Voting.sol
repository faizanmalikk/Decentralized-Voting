// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

//please add proper comments with every function.

error Voting__NotOwner();
error Voting_VoteAlreadyGiven();
error Voting_CandidateNotFound();

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    address public owner;
    mapping(address => bool) public voters;

    uint256 public votingStart;
    uint256 public votingEnd;

    constructor(string[] memory _candidatesName, uint256 _votingDuration) {
        for (uint i = 0; i < _candidatesName.length; i++) {
            candidates.push(
                Candidate({name: _candidatesName[i], voteCount: 0})
            );
        }

        owner = msg.sender;
        votingStart = block.timestamp + 1; // add one second to avoid a race condition
        votingEnd = votingStart + (_votingDuration * 1 minutes);
    }

    modifier isOwner() {
        if (msg.sender != owner) {
            revert Voting__NotOwner();
        }
        _;
    }

    function addCandidates(string memory _newCandidate) public isOwner {
        candidates.push(Candidate({name: _newCandidate, voteCount: 0}));
    }

    function vote(uint256 _candidateIndex) public {
        if (_candidateIndex > candidates.length - 1) {
            revert Voting_CandidateNotFound();
        }

        if (voters[msg.sender]) {
            revert Voting_VoteAlreadyGiven();
        }

        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;
    }

    function getAllVotes() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256) {
        if (block.timestamp > votingEnd) {
            return 0;
        }

        return votingEnd - block.timestamp;
    }

    function getOwnerAddress() public view returns (address) {
        return owner;
    }
}
