# Project Documentation

## 1. Project Overview
* Project Name: CogLeap_BookPageQuest
* Description: A full-stack decentralized application (DApp) designed to help users identify and understand common cognitive biases and logical fallacies through gamified learning. It combines blockchain technology (ERC-20 tokens and ERC-721 NFTs) with AI content generation to provide an interactive learning experience, community interaction, and an achievement system.
* Core Features:
    * **Authentication System**: Based on Ethereum address and signature.
    * **Cognitive Training Ground**: Learn and challenge cognitive biases and logical fallacies through structured "books," "chapters," and "scenes."
    * **Community Tactics Sharing**: Users can post, comment on, and vote for "tactics" related to cognitive biases and logical fallacies.
    * **Leaderboard**: Displays player scores and tiers.
    * **AI Scenario Generation**: Utilizes Zhipu AI to generate multiple-choice questions based on game themes and book content.
    * **In-game Currency**: ARG Token (ERC-20).
    * **Achievement System**: Achievement NFT (ERC-721).

## 2. Technology Stack

### 2.1. Frontend
* **Framework**: React.js
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **HTTP Client**: Axios
* **Web3 Library**: Ethers.js
* **UI Components**: Heroicons

### 2.2. Backend (Node.js/Express)
* **Framework**: Express.js
* **Authentication**: JWT (JSON Web Tokens)
* **Web3 Integration**: Ethers.js (for verifying Ethereum signatures)
* **CORS**: cors
* **Environment Variables**: dotenv
* **AI Integration**: Axios (for interacting with Zhipu AI API)

### 2.3. Smart Contracts (Solidity/Hardhat)
* **Development Environment**: Hardhat
* **ERC-20 Token**: ARGToken.sol (based on OpenZeppelin ERC20)
* **ERC-721 NFT**: AchievementNFT.sol (based on OpenZeppelin ERC721)
* **Access Control**: OpenZeppelin Ownable
* **Counters**: OpenZeppelin Counters

## 3. Architecture Overview

* **Frontend**: React application, interacting with backend APIs via Axios and smart contracts via Ethers.js.
* **Backend**: Node.js Express server, handling user authentication, community content, leaderboard data, and integration with Zhipu AI. It uses in-memory storage for demonstration purposes.
* **Smart Contracts**: Solidity contracts deployed on the blockchain, including the ERC-20 token (ARG) and ERC-721 Achievement NFT (SHA).

## 4. Module Details

### 4.1. Backend Modules

*   **Authentication (`/api/request-nonce`, `/api/login`)**:
    *   `request-nonce`: Generates a random nonce for signing.
    *   `login`: Verifies user signature, generates JWT.
*   **User Profile (`/api/profile`)**:
    *   Fetches and updates user nickname, tier, and other information.
*   **Community Tactics (`/api/tactics`, `/api/tactics/:tacticId/comment`)**:
    *   Fetches and posts community tactics.
    *   Adds comments to tactics.
*   **Leaderboard (`/api/leaderboard`)**:
    *   Provides mock leaderboard data.
*   **AI Scenario Generation (`/api/generate-scenario`)**:
    *   Interacts with the Zhipu AI API to generate multiple-choice questions related to cognitive biases/logical fallacies based on context.

### 4.2. Smart Contract Modules

*   **`ARGToken.sol`**:
    *   ERC-20 token for in-game economy.
    *   `mint` function: Contract owner mints new tokens.
*   **`AchievementNFT.sol`**:
    *   ERC-721 NFT for representing player achievements.
    *   `safeMint` function: Contract owner mints achievement NFTs.

### 4.3. Frontend Interaction

*   **`src/utils/apiClient.js`**:
    *   Configures Axios instance, handles all backend API requests, and automatically attaches JWT.
*   **`src/contexts/AuthContext.jsx`**:
    *   Manages user authentication status and provides authentication-related functionalities.
*   **`src/contracts/config.js`**:
    *   Stores deployed smart contract addresses for frontend application use.

### 4.4. Game Mode Modules

*   **Game Modes (src/components/GameModes.jsx, src/components/game_modes/CampaignContent.jsx)**:
    *   **Core Functionality**: Players progress through levels presented as "books," each containing multiple "chapters," which in turn are composed of a series of interactive "scenes" (multiple-choice questions). Players enhance their cognitive abilities by analyzing scenarios and selecting the correct options.
    *   **Content Structure**:
        *   **Books**: Such as "Cognitive Awakening," "Think Clearly," "Game Theory," each centered around a specific theme.
        *   **Chapters**: Subdivide book themes, containing multiple related scenes.
        *   **Scenes**: Specific challenge questions providing context, questions, options, and feedback.
    *   **Rewards**: Completing scenes and chapters earns in-game tokens and achievements.

## 5. Deployment and Running

*   **Smart Contract Deployment**: Use Hardhat script (`scripts/deploy.js`) to deploy `ARGToken` and `AchievementNFT` to an EVM-compatible chain.
*   **Frontend**: Built and run with Vite.
*   **Backend**: Node.js Express server.

## 6. Notes

*   Backend data (users, tactics, leaderboard) is currently stored in memory and will be lost upon application restart.
*   Zhipu AI API Key needs to be configured in the `.env` file.
*   After deploying contracts, you need to update the contract addresses in the frontend configuration file. 