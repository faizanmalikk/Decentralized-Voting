import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { assert, expect } from "chai"
import { Voting } from "../typechain-types"
import { CANDIDATES, VOTING_DURATION } from "../helper-hardhat-config"


describe("Voting work flow", async () => {

    let votingContract: Voting
    let deployer: string

    beforeEach(async () => {

        deployer = (await getNamedAccounts()).deployer

        await deployments.fixture(['all'])
        votingContract = await ethers.getContract('Voting', deployer)
    })

    describe("constructor", async () => {
        it("sets the candidates correctly", async () => {

            const allCandidates = await votingContract.getAllVotes()

            //checks the lengths of condidates
            assert.equal(allCandidates.length.toString(), CANDIDATES.length.toString())

            //checks the name of candidates amd voteCount
            for (let i = 0; i < CANDIDATES.length; i++) {
                assert.equal(allCandidates[i].name, CANDIDATES[i])
                assert.equal(allCandidates[i].voteCount.toString(), "0")
            }

            // Assert that the voting duration matches the initial input
            const votingStartTime = await votingContract.votingStart()
            const votingEndTime = await votingContract.votingEnd()

            expect(votingEndTime.sub(votingStartTime).div(60).toString()).to.equal(VOTING_DURATION.toString())

        })
        it("sets the owner correctly", async () => {
            let response = await votingContract.getOwnerAddress()
            assert.equal(response, deployer)
        })
    })
    describe("addCandidates", async () => {

        it("only owner can add condidates", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnected = votingContract.connect(attacker)
            await expect(attackerConnected.addCandidates("malik")).to.be.revertedWithCustomError(votingContract, 'Voting__NotOwner')
        })
        it("adds candidates correctly", async () => {
            const newCandidate = 'Rana'
            await votingContract.addCandidates(newCandidate);
            const allCandidates = await votingContract.getAllVotes()

            assert.equal(allCandidates[allCandidates.length - 1].name, newCandidate)
            assert.equal(allCandidates[allCandidates.length - 1].voteCount.toString(), "0")

        })
    })

    describe("vote", async () => {

        it("reverts if no candidate found", async () => {
            await expect(votingContract.vote(8)).to.be.revertedWithCustomError(votingContract, 'Voting_CandidateNotFound')
        })

        it("reverts if vote already given", async () => {
            await votingContract.vote(1)
            await expect(votingContract.vote(2)).to.be.revertedWithCustomError(votingContract, 'Voting_VoteAlreadyGiven')
        })
        it("sets and updates the votes correctly", async () => {
            const prevVotes = await votingContract.getAllVotes()
            await votingContract.vote(1)
            const newVotes = await votingContract.getAllVotes()

            const voters = await votingContract.voters(deployer)

            assert.equal(voters, true)
            assert.equal(prevVotes[1].voteCount.add(1).toString(), newVotes[1].voteCount.toString())

        })
    })

    describe("voting Status", async () => {

        it("should return true when voting is ongoing", async function () {

            await network.provider.send("evm_increaseTime", [1])
            await network.provider.send("evm_mine", [])

            // Call the getVotingStatus function
            const votingStatus = await votingContract.getVotingStatus();

            expect(votingStatus).to.be.true;
        });

        it("should return false when voting has not started", async function () {

            const votingStatus = await votingContract.getVotingStatus();

            // Verify that the voting status is false when voting has not started
            expect(votingStatus).to.be.false;

        });

        it("should return false when voting has ended", async function () {

            const endTime = (await votingContract.votingEnd()).toNumber() + 1

            await network.provider.send("evm_increaseTime", [endTime])
            await network.provider.send("evm_mine", [])

            // Call the getVotingStatus function
            const votingStatus = await votingContract.getVotingStatus();

            expect(votingStatus).to.be.false;

        });
    })
    describe("getRemainingTime", async () => {

        it("should return 0 if voting ended", async function () {

            const endTime = (await votingContract.votingEnd()).toNumber() + 1

            await network.provider.send("evm_increaseTime", [endTime])
            await network.provider.send("evm_mine", [])

            // Call the getVotingStatus function
            const time = await votingContract.getRemainingTime();

            assert.equal(time.toString(), '0')
        });
        it("should return time if vote is ongoing", async function () {
   
            const votingStartTime = await votingContract.votingStart()
            const votingEndTime = await votingContract.votingEnd()

            const remainingTime = await votingContract.getRemainingTime();

            expect(votingEndTime.sub(votingStartTime).toString()).to.equal(remainingTime.sub(1).toString())

        });
    })
})