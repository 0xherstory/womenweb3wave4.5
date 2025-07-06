# Web3-FTW (For The Win)

> **Challenge Camp Finish To Win - Web3 Version**  
> A blockchain-based challenge camp system that makes every challenge a step toward victory

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14.0.0-green.svg)](https://nodejs.org/)

## 🎯 Project Overview

Web3-FTW is a blockchain-based challenge camp system built on Ethereum, implementing decentralized challenge management through smart contracts. Organizers can create challenge camps, and participants can join by paying deposits. Those who complete the challenges receive their deposits back, while those who fail have their deposits forfeited to the organizers.

### 🌟 Core Features

- **Decentralized Challenge Management**: Transparent, immutable challenge system based on smart contracts
- **Deposit Incentive Mechanism**: Motivates participants to complete challenges through deposit mechanisms
- **Multi-Level Challenges**: Supports multi-level configuration with independent password verification for each level
- **Real-Time State Synchronization**: Real-time synchronization between on-chain and off-chain data for smooth user experience
- **Permission Separation Design**: Clear separation of organizer and participant permissions ensuring fairness

## 🏗️ Technical Architecture

### Overall Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend App  │    │   Backend       │    │   Smart         │
│   (React)       │    │   Service       │    │   Contracts     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│ • User Interface│    │ • API Service   │    │ • Camp Management│
│ • Wallet Connect│    │ • Event Listener│    │ • Deposit Mgmt   │
│ • State Mgmt    │    │ • Data Cache    │    │ • Password Verify│
│ • Multi-language│    │ • DB Sync       │    │ • Access Control │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (SQLite)      │
                    └─────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Description |
|-------|------------|---------|-------------|
| **Frontend** | React | 18.0.0 | UI Framework |
| **Frontend** | ethers.js | 5.7.0 | Blockchain Interaction |
| **Frontend** | SCSS | - | Style Preprocessor |
| **Backend** | Node.js | 14.0.0+ | Runtime Environment |
| **Backend** | Express.js | 4.18.0 | Web Framework |
| **Backend** | SQLite3 | - | Database |
| **Blockchain** | Solidity | 0.8.19 | Smart Contract Language |
| **Blockchain** | Hardhat | 2.17.0 | Development Framework |

## 🚀 Quick Start

### Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Installation Steps

1. **Clone Project**
```bash
git clone https://github.com/your-username/web3-FTW.git
cd web3-FTW
```

2. **Quick Deployment**
```bash
node setup-local-env.js
```

3. **Access Application**
- Frontend: http://localhost:3000

## 📖 User Guide

### Organizer Workflow

1. **Connect Wallet**: Connect to the application using MetaMask or other wallets
2. **Create Camp**: Configure camp name, time, number of levels, participant limits, etc.
3. **Configure Levels**: Set deadline and passwords for each level
4. **Manage Camp**: Monitor participant progress and handle deposit distribution

### Participant Workflow

1. **Connect Wallet**: Connect to the application using MetaMask or other wallets
2. **Browse Camps**: View available camps to participate in
3. **Register**: Pay deposit to register for a camp
4. **Complete Challenges**: Complete each level challenge on time
5. **Withdraw Deposit**: Extract deposit after completing all levels

## 🔧 Project Structure

```
web3-FTW/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── pages/         # Page Components
│   │   ├── context/       # React Context
│   │   ├── styles/        # Style Files
│   │   └── utils/         # Utility Functions
│   └── public/            # Static Resources
├── server/                # Backend Service
│   ├── models/            # Data Models
│   ├── routes/            # API Routes
│   ├── services/          # Business Services
│   └── data/              # Database Files
├── contracts/             # Smart Contracts
│   ├── solidity/          # Contract Source Code
│   ├── test/              # Test Files
│   └── scripts/           # Deployment Scripts
└── docs/                  # Project Documentation
```

## 🎨 Interface Showcase

### Homepage Design
- **Piano Keyboard Theme**: Uses piano keyboard as design element, symbolizing the ladder of challenges
- **Value Display**: Semi-transparent display of 8 core values
- **Dual Entry Design**: Two main operation entries - "Create" and "Join"

### Camp Detail Page
- **Timeline Design**: Uses piano keyboard to display camp lifecycle
- **State Visualization**: Different states distinguished by different colors
- **Action Buttons**: Display corresponding operations based on user identity and camp state

## 🔒 Security Features

### Smart Contract Security
- **Proxy Pattern**: Supports contract upgrades while maintaining data integrity
- **Access Control**: Strict permission verification mechanisms
- **Password Hashing**: Original passwords are not stored, only hash values
- **Reentrancy Protection**: Security design to prevent reentrancy attacks

### Application Security
- **Input Validation**: Comprehensive input parameter validation
- **Address Validation**: Ethereum address format validation
- **Private Key Protection**: Private keys only used temporarily in memory
- **HTTPS Transmission**: All data transmission uses HTTPS

## 📊 Data Architecture

### On-Chain Data
- **Camp Status**: Registration, opening, challenge, closing, and other states
- **Participant Information**: Registration status, completion progress, deposit status
- **Level Configuration**: Deadlines, password hashes, completion statistics
- **Fund Management**: Deposit collection, refund, forfeiture records

### Off-Chain Data
- **Camp Details**: Names, descriptions, configuration information
- **Event Logs**: Records of all smart contract events
- **User Relationships**: Relationships between organizers and participants
- **Cache Data**: Cached data to improve query performance

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Component lazy loading with React.lazy
- **State Management**: Proper use of React state and context
- **Caching Strategy**: Local caching to reduce duplicate requests

### Backend Optimization
- **Database Indexing**: Create indexes for commonly queried fields
- **Connection Pooling**: Database connection reuse
- **Event Queue**: Asynchronous processing of event synchronization

### Blockchain Optimization
- **Proxy Pattern**: Reduce deployment costs
- **Batch Operations**: Reduce transaction frequency
- **Gas Optimization**: Optimize contract code to reduce gas consumption

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ethereum](https://ethereum.org/) - Blockchain Platform
- [Hardhat](https://hardhat.org/) - Smart Contract Development Framework
- [React](https://reactjs.org/) - Frontend Framework
- [Express.js](https://expressjs.com/) - Backend Framework

---

**Web3-FTW** - Making every challenge a step toward victory 🏆

> This is an open-source project. Community contributions and feedback are welcome. If you find this project valuable, please give us a ⭐️ 