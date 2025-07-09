# OpenTalent

### **一、项目概述** Project Overview

我们构建一个去中心化的招聘平台，解决传统招聘中信任缺失、数据孤岛和中介费用高等痛点。通过区块链技术实现：

We are building a decentralized recruitment platform to address key issues in traditional hiring, such as lack of trust, data silos, and high intermediary costs. By leveraging blockchain technology, we aim to achieve:

- 职位信息透明不可篡改

       Transparent and tamper-proof job information

- 简历所有权归求职者所有

       Resume ownership returned to job seekers

- 简历提交与权限验证的自动化链上流程控制

       Automated on-chain process for resume submission and permission validation

- 降低招聘中介成本

       Significant reduction of recruitment intermediary costs

**核心创新**：链上简历流程控制 + IPFS去中心化存储 

Core Innovation: On-chain resume process control + IPFS decentralized storage

### **二、技术架构** Technical Architecture

1. **区块链层**：Blockchain Layer:
- 以太坊测试网（Sepolia）

        Ethereum Sepolia Testnet

- Solidity智能合约（管理职位/简历/申请）

        Solidity smart contracts (managing jobs, resumes, applications)

1. **存储层**：

       Storage Layer:

- 简历PDF → IPFS存储（返回CID）

       Resume PDFs → Stored on IPFS (returns CID)

- 结构化数据 → 链上存储（职位详情/申请记录）

       Structured data → Stored on-chain (job details and application records)

1. **身份系统**：

       Identity System:

- 钱包地址作为用户ID

        Wallet address as user identity

- 链上身份标记（求职者/招聘方）

       On-chain role tagging (Job Seeker / Employer)

### **三、核心功能实现** Core Functionality Implementation

### **功能流程** Function Workflow

**招聘方操作**：Employer Operations:

1. 发布职位（数据上链，Gas消耗约0.002ETH）

       Post job openings (data stored on-chain, gas cost approx. 0.002 ETH)

1. 注册为招聘方（链上标记身份）

       Register as employer (on-chain role assignment)

1. 查看申请者（获取简历CID+链上基本信息）

        View applicants (access resume CID + basic on-chain info)

**求职者操作**：Job Seeker Operations:

1. 前端上传简历PDF至IPFS（获取CID）

        Upload resume PDF to IPFS via frontend (receive CID)

1. 创建链上简历档案（存储CID+关键字段）

        Create on-chain resume record (store CID + key metadata)

1. 一键申请职位（触发智能合约事件）

       One-click job application (triggers smart contract event)

### **四、数据模型设计 Data Model Design**

| **数据类型 Data Type** | **存储位置 Storage Location** |
| --- | --- |
| 职位信息 Job Information | 链上 On-chain |
| 简历元数据 Resume Metadata | 链上 On-chain |
| PDF文件 PDF File | IPFS |
| 申请记录 Application Record | 链上 On-chain |

### **五、竞争优势 Competitive Advantages**

- 简历数据所有权回归用户

        Resume data ownership returns to users

- 防篡改的招聘过程记录

        Tamper-proof recruitment process history

- 去除中介，信息直达，显著降低招聘成本

        Elimination of intermediaries; direct communication lowers recruitment costs

> 项目价值主张：建立Web3时代的信任招聘协议，让人才价值通过区块链自由流动
> 

      Value proposition: Establish a trust-based recruitment protocol for the Web3 era, enabling talent         value to flow freely through blockchain technology
