# 项目文档 / Project Documentation

## 1. 项目概述 / Project Overview
* 项目名称 / Project Name: 认知跃迁：书页闯关录
* 描述 / Description: 一个全栈去中心化应用（DApp），旨在通过游戏化的方式帮助用户识别和理解常见的认知偏误和逻辑谬误。它结合了区块链技术（ERC-20 代币和 ERC-721 NFT）与 AI 内容生成，提供互动学习体验、社区互动和成就系统。
* 核心功能 / Core Features:
    * **认证系统**: 基于以太坊地址和签名。
    * **认知训练场**: 通过结构化的“书籍”、“章节”和“场景”学习和挑战认知偏误与逻辑谬误。
    * **社区策略分享**: 用户可以发布、评论和投票关于认知偏误和逻辑谬误的“策略”。
    * **排行榜**: 展示玩家的得分和段位。
    * **AI 场景生成**: 利用智谱 AI 根据游戏主题和书籍内容生成多项选择题。
    * **游戏内货币**: ARG Token (ERC-20)。
    * **成就系统**: Achievement NFT (ERC-721)。

## 2. 技术栈 / Technology Stack

### 2.1. 前端 / Frontend
* **框架**: React.js
* **构建工具**: Vite
* **样式**: Tailwind CSS
* **HTTP 客户端**: Axios
* **Web3 库**: Ethers.js
* **UI 组件**: Heroicons

### 2.2. 后端 / Backend (Node.js/Express)
* **框架**: Express.js
* **身份验证**: JWT (JSON Web Tokens)
* **Web3 集成**: Ethers.js (用于验证以太坊签名)
* **CORS**: cors
* **环境变量**: dotenv
* **AI 集成**: Axios (与智谱 AI API 交互)

### 2.3. 智能合约 / Smart Contracts (Solidity/Hardhat)
* **开发环境**: Hardhat
* **ERC-20 代币**: ARGToken.sol (基于 OpenZeppelin ERC20)
* **ERC-721 NFT**: AchievementNFT.sol (基于 OpenZeppelin ERC721)
* **权限管理**: OpenZeppelin Ownable
* **计数器**: OpenZeppelin Counters

## 3. 架构概览 / Architecture Overview

* **前端**: React 应用，通过 Axios 与后端 API 交互，并通过 Ethers.js 与智能合约交互。
* **后端**: Node.js Express 服务器，处理用户认证、社区内容、排行榜数据以及与智谱 AI 的集成。它使用内存存储进行演示。
* **智能合约**: 部署在区块链上的 Solidity 合约，包括 ERC-20 代币 (ARG) 和 ERC-721 成就 NFT (SHA)。

## 4. 模块详解 / Module Details

### 4.1. 后端模块 / Backend Modules

* **认证 (`/api/request-nonce`, `/api/login`)**:
    * `request-nonce`: 生成随机 nonce 用于签名。
    * `login`: 验证用户签名，生成 JWT。
* **用户资料 (`/api/profile`)**:
    * 获取和更新用户昵称、段位等信息。
* **社区策略 (`/api/tactics`, `/api/tactics/:tacticId/comment`)**:
    * 获取、发布社区策略。
    * 为策略添加评论。
* **排行榜 (`/api/leaderboard`)**:
    * 提供模拟排行榜数据。
* **AI 场景生成 (`/api/generate-scenario`)**:
    * 与智谱 AI API 交互，根据上下文生成认知偏误/逻辑谬误相关的多项选择题。

### 4.2. 智能合约模块 / Smart Contract Modules

* **`ARGToken.sol`**:
    * ERC-20 代币，用于游戏内经济。
    * `mint` 函数：合约所有者铸造新代币。
* **`AchievementNFT.sol`**:
    * ERC-721 NFT，用于表示玩家成就。
    * `safeMint` 函数：合约所有者铸造成就 NFT。

### 4.3. 前端交互 / Frontend Interaction

* **`src/utils/apiClient.js`**:
    * 配置 Axios 实例，处理所有后端 API 请求，并自动附加 JWT。
* **`src/contexts/AuthContext.jsx`**:
    * 负责管理用户的认证状态和提供认证相关的功能。
* **`src/contracts/config.js`**:
    * 存储已部署的智能合约地址，供前端应用使用。

### 4.4. 游戏模式模块 / Game Mode Modules

*   **认知训练场 (`src/components/GameModes.jsx`, `src/components/game_modes/CampaignContent.jsx`)**:
    *   **核心功能**: 玩家通过“书籍”形式的关卡，每个“书籍”包含多个“章节”，每个“章节”则由一系列互动“场景”（多项选择题）构成。玩家通过分析场景并选择正确选项来提升认知能力。
    *   **内容结构**: 
        *   **书籍**: 如《认知觉醒》、《好好思考》、《博弈论》等，每个书籍围绕一个主题。
        *   **章节**: 细分书籍主题，包含多个相关场景。
        *   **场景**: 具体的问答挑战，提供情境、问题、选项和反馈。
    *   **Rewards**: 完成场景和章节可获得游戏内代币和成就。

## 5. 部署与运行 / Deployment and Running

* **智能合约部署**: 使用 Hardhat 脚本 (`scripts/deploy.js`) 部署 `ARGToken` 和 `AchievementNFT` 到 EVM 兼容链。
* **前端**: 通过 Vite 构建和运行。
* **后端**: Node.js Express 服务器。

## 6. 注意事项 / Notes

* 后端数据（用户、策略、排行榜）当前存储在内存中，应用重启后数据会丢失。
* 智谱 AI API Key 需要在 `.env` 文件中配置。
* 部署合约后，需要更新前端配置文件中的合约地址。 