
export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    sepolia: {
        blockConfirmations: 6,
    },
}

export const developmentChains = ["hardhat", "localhost"]

export const CANDIDATES = ['Faizan', 'Ali', 'Malik']
export const VOTING_DURATION = 200
