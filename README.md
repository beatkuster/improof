# 🌱 ImProof – Impact, but with proof

<h4 align="center">
  <a href="#getting-started">Getting Started</a> |
  <a href="#architecture">Architecture</a> |
  <a href="#features">Features</a>
</h4>

## 📖 Project Story

ImProof enables people to save small amounts of money daily - not just to accumulate savings but to create real, verifiable impact. Unlike traditional donations, funds are only released when predefined, objective conditions are met. This ensures that donations trigger actual change and reach their intended impact.

ImProof enables micro-donations that are only released when verifiable impact is proven through independent, publicly available data sources. We combine smart contracts, Chainlink oracles, and ENS identities to create transparent and accountable charitable giving.

To drive meaningful change, we rely on independent, publicly available data sources that confirm whether a project meets its goals, which then triggers the release of funds. Crucially, these data sources are not controlled by the donation recipients, guaranteeing transparency and trust.

## 🏗 Built on Scaffold-ETH 2

This project is built using the Scaffold-ETH 2 framework - an open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain.

⚙️ **Tech Stack**: NextJS, RainbowKit, Foundry, Wagmi, Viem, TypeScript, Chainlink Functions, and TailwindCSS.

## 🌟 Key Features

- **🔒 Conditional Fund Release**: Donations are held in smart contracts and only released when objective conditions are verified
- **🌐 Chainlink Oracle Integration**: Uses Chainlink Functions to fetch real-world data from independent sources
- **📊 Transparent Tracking**: Real-time progress monitoring with verifiable metrics
- **💰 Stablecoin Support**: Built-in support for USDC and other stablecoins
- **🏭 Vault Factory Pattern**: Scalable architecture for creating multiple donation vaults
- **👥 ENS Integration**: Human-readable addresses for beneficiaries
- **📈 Progress Visualization**: Interactive dashboards showing donation progress and impact metrics

## 🎯 How It Works

1. **Create a Vault**: Set up a donation vault with a target amount and verifiable conditions
2. **Collect Donations**: Users contribute stablecoins to the vault over time
3. **Monitor Progress**: Track both funding progress and real-world impact metrics
4. **Verify Conditions**: Chainlink Functions fetch data from independent sources (e.g., forest monitoring APIs)
5. **Automatic Distribution**: Funds are automatically released when both funding targets and impact conditions are met

## 🏛 Architecture

### Smart Contracts

- **Vault.sol**: Individual donation vaults with Chainlink Functions integration
  - Manages deposits in specified stablecoins
  - Implements condition checking via external data sources
  - Handles automatic fund distribution when conditions are met
  
- **VaultFactory.sol**: Factory pattern for creating and managing vaults
  - Creates new Vault instances
  - Maintains registry of all vaults
  - Maps beneficiaries to their vaults

### Frontend

- **Next.js App Router**: Modern React application with TypeScript
- **Wagmi + Viem**: Ethereum wallet connection and contract interactions
- **DaisyUI**: Beautiful, accessible UI components
- **Real-time Updates**: Live vault status and condition monitoring

### Oracle Integration

- **Chainlink Functions**: Serverless compute for fetching external data
- **IPFS Data Sources**: Decentralized storage for condition verification
- **Custom JavaScript**: Flexible data processing and validation logic

## 🚀 Getting Started

### Prerequisites

- [Node.js (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/)
- [Git](https://git-scm.com/downloads)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd improof
```

2. **Install dependencies**:
```bash
yarn install
```

3. **Start local blockchain**:
```bash
yarn chain
```

4. **Deploy contracts**:
```bash
yarn deploy
```

5. **Start the frontend**:
```bash
yarn start
```

Visit `http://localhost:3000` to interact with the application.

## 🧪 Development Commands

### Smart Contract Development
```bash
# Compile contracts
yarn compile

# Run tests
yarn foundry:test

# Format contracts
yarn foundry:format

# Lint contracts
yarn foundry:lint
```

### Frontend Development
```bash
# Type checking
yarn next:check-types

# Format code
yarn next:format

# Lint code
yarn next:lint

# Build for production
yarn next:build
```

### Full Stack
```bash
# Format all code
yarn format

# Lint all code
yarn lint

# Run all tests
yarn test
```

## 📁 Project Structure

```
improof/
├── packages/
│   ├── foundry/           # Smart contracts
│   │   ├── contracts/     # Solidity contracts
│   │   ├── script/        # Deployment scripts
│   │   └── test/          # Contract tests
│   └── nextjs/            # Frontend application
│       ├── app/           # Next.js app router
│       ├── components/    # React components
│       └── hooks/         # Custom React hooks
├── GlobalForestWatchAPI_Response.json  # Sample data format
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in `packages/nextjs/`:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

### Network Configuration

Update `packages/nextjs/scaffold.config.ts` for network settings and `packages/foundry/foundry.toml` for contract deployment configuration.

## 🌍 Real-World Impact Examples

ImProof currently supports verification through:
- **🌳 Reforestation Projects**: Global Forest Watch API for tree planting verification
- **🏗 Infrastructure**: Satellite data for construction progress
- **📚 Education**: Blockchain-verified completion certificates
- **🏥 Healthcare**: Anonymized impact metrics from health organizations

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Scaffold-ETH 2](https://scaffoldeth.io)
- Powered by [Chainlink Functions](https://docs.chain.link/chainlink-functions)
- Inspired by the need for transparent, impact-driven charitable giving

---

**Ready to make an impact with proof?** Start by creating your first donation vault and connecting it to real-world verification data.