# IntentX DeFi dApp - BlockDAG Buildathon

## Overview

IntentX is a production-ready intent-based DeFi aggregator designed for the BlockDAG Buildathon, offering multi-chain support. Its core purpose is to enable users to express complex financial goals in natural language, which the system then automatically parses, optimizes, and executes across various blockchain networks. The dApp integrates three fundamental DeFi primitives: DEX trading, Lending/Borrowing, and Staking. Key capabilities include natural language intent processing, multi-chain functionality across BlockDAG Testnet, Ethereum Goerli, Polygon Mumbai, and Hardhat Local, and an "Optimistic UI" for sub-2s perceived transaction times. The project aims to provide a seamless and intuitive DeFi experience by abstracting away the underlying blockchain complexities, thereby expanding access to sophisticated financial strategies.

## User Preferences

I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture

The IntentX dApp is built with a React + TypeScript frontend, an Express + TypeScript backend, and Solidity smart contracts.

### UI/UX Decisions
The dApp features a dark theme design with a sleek, blockchain-inspired aesthetic. It utilizes Inter for UI text and JetBrains Mono for code, addresses, and numbers. Consistent spacing (p-4, p-6, p-8) is maintained throughout. Shadcn UI components with custom dark mode variants are used, and interactive elements incorporate hover-elevate and active-elevate-2 utilities. The layout includes a responsive, collapsible left sidebar for navigation and a right-aligned top bar for AI Support, theme toggling, network selection, and wallet connection.

### Technical Implementations
- **Frontend (React + TypeScript)**: Comprises a Dashboard for portfolio overview, Vaults for staking/lending interfaces, an Intent Lab for natural language input and execution, Analytics for performance tracking, an FAQ section, and an integrated AI Support Agent. Features include optimistic UI updates for rapid feedback, skeleton loading states, and multi-chain explorer URL support.
- **Backend (Express + TypeScript)**: Provides API routes for all frontend functionalities, including analytics, transactions, vaults, intents (parsing and execution), FAQ, and AI support. It uses in-memory storage (MemStorage) with comprehensive mock data, including an AI Knowledge Base for the chatbot.
- **Smart Contracts (Solidity 0.8.24)**: Deployed on BlockDAG and test networks, the core contracts include:
    - `IntentRegistry.sol`: Stores and tracks user intent metadata and status.
    - `ExecutionManager.sol`: Orchestrates intent execution by routing actions to DeFi protocols and handling multi-step processes.
    - `MockPair.sol` and `MockRouter.sol`: Simulate Uniswap V2-style DEX functionalities for swaps and liquidity management.
    - `LendingPoolMock.sol`: Emulates Aave/Compound-style lending and borrowing with interest rate models.
    - `StakingVault.sol`: Manages ERC20 token staking and continuous reward distribution.
    - `MockERC20.sol`: A utility token for testing.

### Feature Specifications
- **Natural Language Intents**: Users input text descriptions of financial goals, which are parsed into executable steps.
- **Multi-Chain Support**: Integrates with BlockDAG Testnet, Ethereum Goerli, Polygon Mumbai, and Hardhat Local, with network-specific explorer links.
- **DeFi Primitives**: Supports DEX trading (swaps), lending/borrowing, and staking/yield farming.
- **AI Support Agent**: An integrated chatbot offering conversational support, suggested prompts, FAQ retrieval, intent explanation, strategy optimization hints (Maximize Yield, Conservative, Growth, Gas Optimization), and risk alerts (Liquidation, Slippage, Impermanent Loss, Smart Contract).

### System Design Choices
- **Optimistic UI**: Provides sub-2s perceived transaction times through client-side state updates and simulated fast execution.
- **Modular Architecture**: Separation of concerns between frontend, backend, and smart contracts to facilitate development and maintenance.
- **In-memory Mock Data**: Enables rapid development and testing without external database dependencies.
- **Hardhat Development Environment**: Used for smart contract compilation, testing, and deployment across multiple networks.
- **Comprehensive Testing**: Includes E2E testing with Playwright for user workflows and unit tests with Hardhat for smart contract logic.

## External Dependencies

- **BlockDAG Testnet**: Primary blockchain network for deployment and operations.
- **Ethereum Goerli**: Test network for EVM compatibility and multi-chain testing.
- **Polygon Mumbai**: Layer 2 test network for integration and scalability testing.
- **MetaMask**: Wallet integration for user authentication and transaction signing.
- **Etherscan/Polygonscan**: Block explorers for various networks to track transactions (e.g., `goerli.etherscan.io`, `mumbai.polygonscan.com`).