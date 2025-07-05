# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a blockchain-based donation platform called "ImProof" built on the Scaffold-ETH 2 framework. The platform allows users to create donation vaults with specific targets and distribute funds to beneficiaries when conditions are met.

### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, React 19, TailwindCSS, DaisyUI
- **Smart Contracts**: Solidity with Foundry framework
- **Blockchain**: Ethereum-compatible (currently configured for local Foundry network)
- **Web3 Integration**: Viem, Wagmi, RainbowKit for wallet connections
- **Package Manager**: Yarn workspaces

## Architecture

### Smart Contract Architecture
The core smart contract system consists of:

1. **Vault Contract** (`packages/foundry/contracts/Vault.sol`):
   - Manages individual donation vaults
   - Handles deposits in specified stablecoins (currently USDC)
   - Tracks donor contributions and vault balances
   - Distributes funds to beneficiaries when target amount is reached

2. **VaultFactory Contract** (`packages/foundry/contracts/VaultFactory.sol`):
   - Factory pattern for creating new Vault instances
   - Maintains registry of all vaults and maps beneficiaries to their vaults
   - Provides view functions for vault discovery

### Frontend Architecture
- **App Router**: Next.js 13+ app directory structure
- **Component Library**: Custom scaffold-eth components in `components/scaffold-eth/`
- **Hooks**: Custom React hooks in `hooks/scaffold-eth/` for blockchain interactions
- **State Management**: Zustand for global state
- **Styling**: TailwindCSS with DaisyUI components

## Common Development Commands

### Smart Contract Development
```bash
# Start local blockchain
yarn chain

# Deploy contracts to local network
yarn deploy

# Compile contracts
yarn compile

# Run smart contract tests
yarn foundry:test

# Format smart contracts
yarn foundry:format

# Lint smart contracts
yarn foundry:lint
```

### Frontend Development
```bash
# Start development server
yarn start

# Build for production
yarn next:build

# Run type checking
yarn next:check-types

# Format frontend code
yarn next:format

# Lint frontend code
yarn next:lint
```

### Full Stack Development
```bash
# Format all code (frontend + contracts)
yarn format

# Lint all code (frontend + contracts)
yarn lint

# Run all tests
yarn test
```

## Development Workflow

### Setting Up Development Environment
1. Install dependencies: `yarn install`
2. Start local blockchain: `yarn chain` (in separate terminal)
3. Deploy contracts: `yarn deploy`
4. Start frontend: `yarn start`

### Testing
- Smart contract tests are in `packages/foundry/test/`
- Use `yarn foundry:test` to run Foundry tests
- Frontend testing setup follows Next.js conventions

### Smart Contract Deployment
- Deploy scripts are in `packages/foundry/script/`
- Local deployments use Foundry's local network
- Contract addresses are auto-generated in `packages/nextjs/contracts/deployedContracts.ts`

## Configuration Files

### Key Configuration Files
- `packages/foundry/foundry.toml`: Foundry configuration with RPC endpoints
- `packages/nextjs/scaffold.config.ts`: Frontend network and API configuration
- `packages/nextjs/next.config.ts`: Next.js configuration
- Root `package.json`: Workspace configuration and top-level scripts

### Environment Variables
- `ALCHEMY_API_KEY`: For testnet/mainnet deployments
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: For WalletConnect integration
- `NEXT_PUBLIC_ALCHEMY_API_KEY`: For frontend RPC calls

## Important Notes

### Smart Contract Security
- The Vault contract uses OpenZeppelin's ERC20 interface
- Deposits require token approval from the depositor
- Distribution logic currently checks if vault balance exceeds target amount
- TODO: Implement proper condition checking for fund distribution

### Frontend Integration
- The app uses wagmi hooks for blockchain interactions
- Contract addresses are automatically imported from deployedContracts.ts
- The scaffold-eth framework provides ready-to-use components for common Web3 operations

### Development Patterns
- Smart contracts follow Solidity best practices with clear state variable naming
- Frontend components use TypeScript with proper type definitions
- The scaffold-eth pattern provides automatic contract hot-reloading during development