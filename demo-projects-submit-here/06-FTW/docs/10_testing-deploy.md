#调试与部署计划

## 目录结构说明

项目采用多包结构，主要包含以下目录：

```
web3-FTW/                # 项目根目录
├── client/              # 前端代码
│   ├── public/          # 静态资源
│   ├── src/             # 源代码
│   │   ├── abis/        # 合约ABI文件
│   │   ├── components/  # 组件
│   │   ├── context/     # 上下文
│   │   └── pages/       # 页面
│   └── package.json     # 前端依赖
├── contracts/           # 智能合约代码
│   ├── solidity/        # 合约源文件（Hardhat编译用）
│   │   ├── CampStorage.sol       # 存储合约
│   │   ├── CampImplementation.sol # 实现合约
│   │   ├── CampProxy.sol         # 代理合约
│   │   └── CampFactory.sol       # 工厂合约
│   ├── scripts/         # 部署脚本
│   ├── test/            # 测试文件
│   └── hardhat.config.js # Hardhat配置
├── server/              # 后端代码
│   ├── abis/            # 合约ABI文件
│   ├── models/          # 数据模型
│   ├── routes/          # API路由
│   ├── services/        # 服务
│   └── server.js        # 入口文件
└── docs/                # 文档
```

## 自动化部署测试环境

为了简化本地测试环境的部署，我们提供了一个自动化脚本。该脚本会自动完成以下任务：

1. 检查并创建必要的环境变量文件
2. 安装所有依赖
3. 启动本地区块链
4. 编译并部署智能合约
5. 更新前端和后端的合约地址配置
6. 初始化数据库
7. 启动后端服务
8. 启动前端应用

### 使用自动化脚本

```bash
# 在项目根目录执行
node setup-local-env.js
```

> **注意**: 脚本需要Node.js环境，确保已安装Node.js 14+版本。

## 手动部署测试环境

如果您想手动部署测试环境，或者自动化脚本出现问题，可以按照以下步骤操作：

### 1. 环境准备（项目根目录）

```bash
# 确认Node.js和npm已安装
node -v
npm -v
```

### 2. 合约部署（contracts目录）

```bash
# 进入合约目录
cd contracts

# 安装依赖
npm install

# 启动本地区块链
npx hardhat node

# 新开一个终端窗口，部署合约
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

部署后记录输出的合约地址，例如：
```
CampImplementation 已部署到: 0x5FbDB2315678afecb367f032d93F642f64180aa3
CampFactory 已部署到: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3. 后端服务配置（server目录）

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 创建环境变量文件
echo "PORT=3001
RPC_URL=http://localhost:8545
FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
JWT_SECRET=dev_secret_key_123
CORS_ORIGIN=http://localhost:3000" > .env

# 初始化数据库
mkdir data
sqlite3 data/web3ftw.db < models/schema.sql

# 启动后端服务
npm run dev
```

### 4. 前端应用配置（client目录）

```bash
# 进入前端目录
cd client

# 安装依赖
npm install --legacy-peer-deps

# 创建环境变量文件
echo "REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" > .env.local

# 启动前端应用
npm start
```

## 本地调试流程

### 1. MetaMask配置

1. **添加本地网络**：
   - 打开MetaMask
   - 点击网络下拉菜单 -> 添加网络 -> 添加网络手动
   - 填写以下信息：
     - 网络名称：Localhost 8545
     - RPC URL：http://localhost:8545
     - 链ID：31337
     - 货币符号：ETH

2. **导入测试账户**：
   - 点击账户图标 -> 导入账户
   - 输入私钥：`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - 这是Hardhat默认的第一个测试账户，拥有大量测试ETH

### 2. 功能测试流程

#### 2.1 创建营地（组织者操作）

1. 访问前端应用：http://localhost:3000
2. 使用MetaMask连接钱包（使用账户#0作为组织者）
3. 点击"创建营地"
4. 填写营地信息：
   - 营地名称：测试营地
   - 报名截止时间：选择未来日期
   - 结营时间：选择比报名截止时间更晚的日期
   - 关卡数量：3
   - 最小参与者数：2
   - 最大参与者数：10
   - 押金金额：0.01 ETH
5. 点击"创建"并在MetaMask中确认交易

#### 2.2 参与者报名（参与者操作）

1. 在MetaMask中切换到另一个账户（如账户#1）
2. 访问前端应用：http://localhost:3000
3. 浏览营地列表，找到刚创建的营地
4. 点击"报名"
5. 确认押金金额并在MetaMask中确认交易

#### 2.3 检查营地状态（任何人操作）

1. 如果当前时间已过报名截止时间，可以调用"检查营地状态"
2. 这将更新营地状态为"成功"或"失败"，取决于是否达到最小参与者数量

#### 2.4 配置关卡（组织者操作）

1. 切换回组织者账户（账户#0）
2. 访问营地详情页
3. 点击"配置关卡"
4. 为每个关卡设置：
   - 截止时间
   - 密码（系统会自动生成哈希）
5. 点击"提交"并在MetaMask中确认交易

#### 2.5 提交关卡密码（参与者操作）

1. 切换到参与者账户（账户#1）
2. 访问营地详情页
3. 找到当前关卡
4. 输入密码并提交
5. 在MetaMask中确认交易

#### 2.6 结营和押金处理

1. 当所有关卡截止时间过后，营地会自动进入"已结营"状态
2. 完成所有关卡的参与者可以提取押金
3. 组织者可以罚没未完成关卡参与者的押金

### 3. 调试工具

#### 3.1 浏览器开发者工具

1. 打开Chrome开发者工具（F12）
2. 使用Console标签页查看JavaScript错误和日志
3. 使用Network标签页监控API请求和Web3交互

#### 3.2 Hardhat控制台

在合约目录中，可以使用Hardhat控制台直接与合约交互：

```bash
cd contracts
npx hardhat console --network localhost
```

常用命令示例：

```javascript
// 获取工厂合约实例
const Factory = await ethers.getContractFactory("CampFactory")
const factory = await Factory.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")

// 查询营地数量
const count = await factory.getCampCount()
console.log("营地数量:", count.toString())

// 获取所有营地地址
const camps = await factory.getAllCamps()
console.log("营地地址列表:", camps)

// 连接到特定营地
const Camp = await ethers.getContractFactory("CampImplementation")
const camp = await Camp.attach(camps[0])

// 查询营地信息
const info = await camp.getCampInfo()
console.log("营地信息:", info)
```

#### 3.3 后端日志

监控后端服务的日志输出，可以获取事件监听和API调用的详细信息：

```bash
cd server
npm run dev
```

## 环境准备

### 安装必要工具

1. **Node.js 和 npm**
   ```bash
   # 检查是否已安装
   node -v
   npm -v
   
   # 如未安装，请访问 https://nodejs.org 下载并安装
   ```

2. **安装 Hardhat (以太坊开发环境)**
   ```bash
   # 在项目根目录执行
   npm install -g hardhat
   ```

3. **安装 SQLite**
   ```bash
   # 检查是否已安装
   sqlite3 --version
   
   # 如未安装，请访问 https://www.sqlite.org/download.html 下载并安装
   ```

## 智能合约调试与部署

### 合约架构说明

项目使用代理模式重构了合约以解决合约大小限制问题。主要包括以下几个合约：

1. **CampStorage.sol**：存储所有状态变量和数据结构
2. **CampImplementation.sol**：实现所有业务逻辑，继承自CampStorage
3. **CampProxy.sol**：代理合约，将调用委托给实现合约
4. **CampFactory.sol**：工厂合约，负责创建和管理代理合约实例

这种架构的优点：
- 减小了部署大小（实现合约只需部署一次）
- 保持了接口兼容性（前端和后端代码无需大改）
- 提高了可升级性（可以部署新的实现合约并更新代理）

### 本地测试网络部署

1. **安装合约依赖**
   ```bash
   # 在项目根目录执行
   cd contracts
   npm install
   ```

2. **合约文件结构准备**
   ```bash
   # 确保solidity目录中包含所有合约文件
   # 在contracts目录中执行
   ls -la solidity/
   
   # 应该能看到以下文件：
   # CampStorage.sol
   # CampImplementation.sol
   # CampProxy.sol
   # CampFactory.sol
   ```

3. **启动本地测试网络**
   ```bash
   # 在contracts目录中执行
   npx hardhat node
   ```
   这将启动一个本地以太坊测试网络，并显示可用的测试账户和私钥。

4. **编译合约**
   ```bash
   # 在contracts目录中执行
   npx hardhat compile
   ```
   编译成功后，会在`contracts/artifacts`目录生成ABI文件。

5. **部署合约到本地测试网络**
   ```bash
   # 在contracts目录中执行
   npx hardhat run scripts/deploy.js --network localhost
   ```
   部署脚本会执行以下操作：
   - 部署CampImplementation合约
   - 部署CampFactory合约
   - 自动将ABI文件复制到前端和后端目录

   部署后会输出合约地址，请记录下 CampFactory 合约地址，后续配置需要使用。

### 测试网络部署 (Goerli/Sepolia)

1. **配置测试网络**
   
   在`contracts`目录中创建 `.env` 文件（如果不存在）：
   ```bash
   # 在contracts目录中执行
   touch .env
   ```
   
   编辑 `.env` 文件，添加以下内容：
   ```
   PRIVATE_KEY=你的钱包私钥
   INFURA_API_KEY=你的Infura API密钥
   ETHERSCAN_API_KEY=你的Etherscan API密钥
   ```

2. **修改hardhat.config.js**

   确保`hardhat.config.js`包含以下配置，以优化合约大小：
   ```javascript
   module.exports = {
     solidity: {
       version: "0.8.19",
       settings: {
         optimizer: {
           enabled: true,
           runs: 200
         }
       }
     },
     // 其他配置...
   };
   ```

3. **部署到测试网络**
   ```bash
   # 在contracts目录中执行
   # 部署到Goerli测试网
   npx hardhat run scripts/deploy.js --network goerli
   
   # 或部署到Sepolia测试网
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **验证合约**
   ```bash
   # 在contracts目录中执行
   # 验证实现合约
   npx hardhat verify --network goerli 实现合约地址
   
   # 验证工厂合约
   npx hardhat verify --network goerli 工厂合约地址 实现合约地址
   ```

## 后端服务部署

### 本地开发环境

1. **安装依赖**
   ```bash
   # 在项目根目录执行
   cd server
   npm install
   ```

2. **确认ABI文件**
   
   检查`server/abis`目录中是否包含最新的ABI文件：
   ```bash
   # 在server目录中执行
   ls -la abis/
   ```
   
   如果没有最新的ABI文件，可以从合约编译后手动复制：
   ```bash
   # 在server目录中执行
   mkdir -p abis
   cp ../contracts/artifacts/solidity/CampImplementation.sol/CampImplementation.json abis/CampImplementation.json
   cp ../contracts/artifacts/solidity/CampFactory.sol/CampFactory.json abis/CampFactory.json
   ```

3. **配置环境变量**
   
   在`server`目录中创建 `.env` 文件：
   ```bash
   # 在server目录中执行
   touch .env
   ```
   
   编辑 `.env` 文件，添加以下内容：
   ```
   PORT=3001
   RPC_URL=http://localhost:8545
   FACTORY_ADDRESS=你的CampFactory合约地址
   JWT_SECRET=自定义安全密钥
   CORS_ORIGIN=http://localhost:3000
   ```

4. **初始化数据库**
   ```bash
   # 在server目录中执行
   # 数据库会在首次启动服务时自动创建
   # 如需手动初始化，可执行：
   mkdir -p data
   sqlite3 data/web3ftw.db < models/schema.sql
   ```

5. **启动后端服务**
   ```bash
   # 在server目录中执行
   npm run dev
   ```
   服务将在 http://localhost:3001 启动。

### 生产环境部署

1. **构建生产版本**
   ```bash
   # 在项目根目录执行
   cd server
   npm install
   ```

2. **配置生产环境变量**
   
   在服务器上的`server`目录中创建 `.env` 文件，添加生产环境配置：
   ```
   PORT=3001
   RPC_URL=https://主网或测试网RPC地址
   FACTORY_ADDRESS=已部署的CampFactory合约地址
   JWT_SECRET=安全的随机字符串
   CORS_ORIGIN=你的前端域名
   ```

3. **启动生产服务**
   ```bash
   # 在server目录中执行
   # 使用PM2管理Node.js进程（推荐）
   npm install -g pm2
   pm2 start server.js --name "web3-ftw-server"
   
   # 或使用nohup
   nohup node server.js > server.log 2>&1 &
   ```

## 前端测试

### 本地测试网站效果

1. **安装依赖**

   ```bash
   # 在项目根目录执行
   cd client
   npm install --legacy-peer-deps
   ```
   
   > **如果遇到依赖冲突错误**：
   >
   > 以下是解决TypeScript版本冲突的几种方法：
   >
   > **方法：使用--legacy-peer-deps标志**（推荐）
   > ```bash
   > npm install --legacy-peer-deps
   > ```
   >
   > **错误原因**：React Scripts 5.0.1与TypeScript 5.x版本不兼容，需要使用TypeScript 3.2.1或4.x版本。

   > **注意**：`npm install`可能需要较长时间执行，特别是在首次安装时。执行时会生成：
   > - `node_modules`目录：存储所有依赖包，通常很大（数百MB）
   > - `package-lock.json`文件：记录确切的依赖版本信息
   >
   > **如果执行时间过长，可尝试以下解决方案**：
   > - 使用国内镜像源：`npm install --registry=https://registry.npmmirror.com`
   > - 或永久设置镜像：`npm config set registry https://registry.npmmirror.com`
   > - 使用yarn替代：先安装yarn（`npm install -g yarn`），再执行`yarn install`
   > - 尝试增加网络超时时间：`npm install --timeout=60000`
   > - 确认磁盘空间足够（至少需要1GB空间）

2. **确认ABI文件**
   
   检查`client/src/abis`目录中是否包含最新的ABI文件：
   ```bash
   # 在client目录中执行
   ls -la src/abis/
   ```
   
   如果没有最新的ABI文件，可以从合约编译后手动复制：
   ```bash
   # 在client目录中执行
   mkdir -p src/abis
   cp ../contracts/artifacts/solidity/CampImplementation.sol/CampImplementation.json src/abis/CampImplementation.json
   cp ../contracts/artifacts/solidity/CampFactory.sol/CampFactory.json src/abis/CampFactory.json
   ```

3. **配置前端环境变量**

   在`client`目录中创建 `.env.local` 文件：
   ```bash
   # 在client目录中执行
   touch .env.local
   ```
   
   编辑 `.env.local` 文件，添加以下内容：
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_FACTORY_ADDRESS=你的CampFactory合约地址
   ```

4. **启动开发服务器**

   ```bash
   # 在client目录中执行
   npm start
   ```

   启动后，浏览器会自动打开 http://localhost:3000，显示网站首页。

## 调试工具

1. **React开发者工具**

   安装Chrome扩展：React Developer Tools

2. **控制台调试**

   使用浏览器开发者工具（F12）中的控制台查看可能的错误和警告。

3. **网络监控**

   使用开发者工具中的"网络"选项卡监控Web3 API调用。

4. **MetaMask调试**

   使用MetaMask开发者模式查看交易详情和错误信息。

5. **后端API测试**

   使用Postman或Insomnia测试后端API端点。

6. **合约交互测试**

   使用Hardhat控制台或Remix IDE进行合约交互测试：
   ```bash
   # 在contracts目录中执行
   npx hardhat console --network localhost
   ```

## 集成测试流程

1. **启动本地区块链**
   ```bash
   # 在contracts目录中执行
   npx hardhat node
   ```

2. **部署合约**
   ```bash
   # 在contracts目录中执行，新开一个终端
   npx hardhat run scripts/deploy.js --network localhost
   ```
   
   部署脚本会自动将ABI文件复制到前端和后端目录。

3. **启动后端服务**
   ```bash
   # 在server目录中执行，新开一个终端
   npm run dev
   ```

4. **启动前端应用**
   ```bash
   # 在client目录中执行，新开一个终端
   npm start
   ```

5. **测试完整流程**
   - 连接MetaMask到本地网络（http://localhost:8545）
   - 导入测试账户（使用Hardhat提供的私钥）
   - 测试创建营地、报名、提交关卡等功能

## 部署准备

### 前端构建生产版本

```bash
# 在项目根目录执行
cd client
npm run build
```

生成的静态文件将保存在`client/build`目录中，可部署到任何静态网站托管服务。

### 推荐部署平台

- **前端**:
  - Vercel
  - Netlify
  - GitHub Pages
  - AWS S3 + CloudFront
  - IPFS (去中心化部署)

- **后端**:
  - Heroku
  - AWS EC2
  - Google Cloud Run
  - Azure App Service
  - Digital Ocean Droplet

- **智能合约**:
  - 以太坊主网
  - Polygon
  - Arbitrum
  - Optimism
  - BSC

## 部署检查清单

### 前端部署

- [ ] 更新生产环境API地址
- [ ] 更新生产环境合约地址
- [ ] 确认ABI文件是最新版本
- [ ] 构建生产版本
- [ ] 测试静态文件
- [ ] 上传到托管服务
- [ ] 配置域名和SSL证书

### 后端部署

- [ ] 配置生产环境变量
- [ ] 确认ABI文件是最新版本
- [ ] 设置数据库持久化存储
- [ ] 配置安全的JWT密钥
- [ ] 设置CORS策略
- [ ] 配置PM2或其他进程管理工具
- [ ] 设置日志记录和监控

### 合约部署

- [ ] 审计合约代码
- [ ] 确认优化器设置已启用
- [ ] 测试网络验证
- [ ] 准备足够的ETH支付Gas费
- [ ] 部署实现合约
- [ ] 部署工厂合约
- [ ] 验证合约代码
- [ ] 记录合约地址

## 监控与维护

1. **设置监控**
   - 使用Sentry监控前端错误
   - 使用PM2或类似工具监控后端服务
   - 设置合约事件监听和告警

2. **定期备份**
   - 备份SQLite数据库文件
   - 备份环境配置

3. **更新计划**
   - 定期更新依赖包
   - 修复安全漏洞
   - 优化Gas使用

## 合约升级流程

如果需要升级合约逻辑，可以按照以下步骤操作：

1. **修改实现合约**
   - 更新`CampImplementation.sol`文件
   - 保持状态变量和函数接口不变

2. **部署新的实现合约**
   ```bash
   # 在contracts目录中执行
   npx hardhat run scripts/upgrade.js --network localhost
   ```

3. **更新ABI文件**
   - 确保新的ABI文件被复制到前端和后端目录

4. **测试升级后的合约**
   - 验证所有功能是否正常工作
   - 确认数据是否正确保存
