import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
    CANDIDATES,
    VOTING_DURATION,
    developmentChains, networkConfig,

} from "../helper-hardhat-config"
import verify from "../utils/verify";

const deployVotingContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    let args: any = [CANDIDATES, VOTING_DURATION]

    log("----------------------------------------------------")
    log("Deploying votingContract and waiting for confirmations...")
    const votingContract = await deploy("Voting", {
        from: deployer,
        args: args,
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`VotingContract at ${votingContract.address}`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_PRIVATE_KEY) {
        await verify(votingContract.address, args)
    }
}

export default deployVotingContract
deployVotingContract.tags = ["all", "voting"]