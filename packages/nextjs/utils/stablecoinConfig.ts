import * as chains from "viem/chains";

export interface StablecoinInfo {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
}

export interface ChainStablecoins {
  [chainId: number]: StablecoinInfo[];
}

/**
 * Configuration mapping of stablecoin addresses for different chains
 * Add new chains and their respective stablecoin addresses here
 */
export const STABLECOIN_CONFIG: ChainStablecoins = {
  // Ethereum Mainnet
  [chains.mainnet.id]: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
  ],

  // Base Mainnet
  [chains.base.id]: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
    },
    {
      symbol: "USDbC",
      name: "USD Base Coin (Bridged)",
      address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA",
      decimals: 6,
    },
  ],

  // Arbitrum One
  [chains.arbitrum.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Arbitrum)",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD (Arbitrum)",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
    },
  ],

  // Optimism
  [chains.optimism.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Optimism)",
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD (Optimism)",
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
    },
  ],

  // Polygon
  [chains.polygon.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Polygon)",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
    },
    {
      symbol: "USDT",
      name: "Tether USD (Polygon)",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
    },
  ],

  // Sepolia Testnet
  [chains.sepolia.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Sepolia)",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
    },
  ],

  // Base Sepolia Testnet
  [chains.baseSepolia.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Base Sepolia)",
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      decimals: 6,
    },
  ],

  // Arbitrum Sepolia Testnet
  [chains.arbitrumSepolia.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Arbitrum Sepolia)",
      address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      decimals: 6,
    },
  ],

  // Optimism Sepolia Testnet
  [chains.optimismSepolia.id]: [
    {
      symbol: "USDC",
      name: "USD Coin (Optimism Sepolia)",
      address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
      decimals: 6,
    },
  ],

  // Local Development (Foundry/Hardhat)
  [chains.foundry.id]: [
    {
      symbol: "USDC",
      name: "USDC Mock (Local)",
      address: "0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35", // This will be updated from deployedContracts
      decimals: 6,
    },
  ],

  // Localhost (alternative)
  [chains.localhost.id]: [
    {
      symbol: "USDC",
      name: "USDC Mock (Localhost)",
      address: "0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35", // This will be updated from deployedContracts
      decimals: 6,
    },
  ],
};

/**
 * Get available stablecoins for a specific chain ID
 */
export function getStablecoinsForChain(chainId: number): StablecoinInfo[] {
  return STABLECOIN_CONFIG[chainId] || [];
}

/**
 * Get all supported chain IDs that have stablecoin configurations
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(STABLECOIN_CONFIG).map(Number);
}

/**
 * Check if a chain has any configured stablecoins
 */
export function isChainSupported(chainId: number): boolean {
  return chainId in STABLECOIN_CONFIG && STABLECOIN_CONFIG[chainId].length > 0;
}
