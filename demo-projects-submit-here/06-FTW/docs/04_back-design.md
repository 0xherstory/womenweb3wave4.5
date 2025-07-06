# 后端服务设计文档

## 技术栈
- **运行环境**: Node.js
- **Web框架**: Express.js
- **数据库**: SQLite
- **区块链交互**: ethers.js
- **事件处理**: 智能合约事件监听
- **日志记录**: Morgan

## 项目结构
```
server/
├── server.js                 # 主服务器文件
├── config.js                 # 配置文件
├── package.json              # 依赖管理
├── abis/                     # 智能合约ABI文件
│   ├── CampFactory.json
│   └── CampImplementation.json
├── models/                   # 数据模型层
│   ├── db.js                 # 数据库连接和工具
│   ├── schema.sql            # 数据库表结构
│   ├── camp.js               # 营地数据模型
│   ├── participant.js        # 参与者数据模型
│   └── challenge.js          # 关卡数据模型
├── routes/                   # API路由层
│   ├── campRoutes.js         # 营地相关API
│   └── web3Routes.js         # Web3交互API
├── services/                 # 业务服务层
│   ├── web3Service.js        # Web3服务
│   ├── eventListener.js      # 事件监听服务
│   └── campStatusService.js  # 营地状态服务
└── data/                     # 数据库文件
    └── web3ftw.db
```

## 核心功能

### 1. 数据缓存与聚合查询
- **营地数据缓存**: 将链上营地信息同步到本地数据库
- **参与者状态管理**: 维护参与者报名、完成状态
- **关卡配置存储**: 存储关卡截止时间和密码哈希
- **聚合查询**: 提供高效的营地列表、详情查询

### 2. 智能合约事件监听
- **实时监听**: 监听工厂合约和营地合约的所有事件
- **自动同步**: 事件触发时自动更新数据库状态
- **事件日志**: 记录所有事件用于审计和调试

### 3. API服务
- **RESTful API**: 提供标准化的HTTP接口
- **权限控制**: 实现组织者和参与者的权限分离
- **数据验证**: 输入参数验证和地址格式检查

## 数据库设计

### 表结构

#### 1. camps (营地表)
```sql
CREATE TABLE camps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_address TEXT NOT NULL UNIQUE,  -- 营地合约地址
    factory_address TEXT NOT NULL,          -- 工厂合约地址
    organizer_address TEXT NOT NULL,        -- 组织者地址
    name TEXT NOT NULL,                     -- 营地名称
    signup_deadline INTEGER NOT NULL,       -- 报名截止时间戳
    camp_end_date INTEGER NOT NULL,         -- 结营时间戳
    challenge_count INTEGER NOT NULL,       -- 挑战关卡总数
    min_participants INTEGER NOT NULL,      -- 最小参与者数量
    max_participants INTEGER NOT NULL,      -- 最大参与者数量
    deposit_amount TEXT NOT NULL,           -- 押金金额(wei)
    state INTEGER NOT NULL,                 -- 营地状态
    participant_count INTEGER NOT NULL DEFAULT 0, -- 当前参与者数量
    completed_count INTEGER NOT NULL DEFAULT 0,   -- 完成所有关卡的人数
    current_level INTEGER NOT NULL DEFAULT 1,     -- 当前关卡编号
    created_at INTEGER NOT NULL,            -- 创建时间戳
    updated_at INTEGER NOT NULL,            -- 最后更新时间戳
    ipfs_metadata TEXT                      -- IPFS元数据哈希(可选)
);
```

#### 2. participants (参与者表)
```sql
CREATE TABLE participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,               -- 关联的营地ID
    participant_address TEXT NOT NULL,      -- 参与者地址
    state INTEGER NOT NULL,                 -- 参与者状态
    completed_challenges INTEGER NOT NULL DEFAULT 0, -- 已完成关卡数
    registration_time INTEGER,              -- 报名时间戳
    created_at INTEGER NOT NULL,            -- 创建时间戳
    updated_at INTEGER NOT NULL,            -- 最后更新时间戳
    UNIQUE(camp_id, participant_address)
);
```

#### 3. challenges (关卡表)
```sql
CREATE TABLE challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camp_id INTEGER NOT NULL,               -- 关联的营地ID
    challenge_index INTEGER NOT NULL,       -- 关卡索引
    deadline INTEGER NOT NULL,              -- 关卡截止时间戳
    password_hash TEXT NOT NULL,            -- 密码哈希
    state INTEGER NOT NULL,                 -- 关卡状态
    completed_count INTEGER NOT NULL DEFAULT 0, -- 完成人数
    created_at INTEGER NOT NULL,            -- 创建时间戳
    updated_at INTEGER NOT NULL,            -- 最后更新时间戳
    UNIQUE(camp_id, challenge_index)
);
```

#### 4. challenge_completions (关卡完成记录表)
```sql
CREATE TABLE challenge_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id INTEGER NOT NULL,          -- 关联的关卡ID
    participant_id INTEGER NOT NULL,        -- 关联的参与者ID
    completed_at INTEGER NOT NULL,          -- 完成时间戳
    UNIQUE(challenge_id, participant_id)
);
```

#### 5. event_logs (事件日志表)
```sql
CREATE TABLE event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_address TEXT NOT NULL,         -- 合约地址
    event_name TEXT NOT NULL,               -- 事件名称
    transaction_hash TEXT NOT NULL,         -- 交易哈希
    block_number INTEGER NOT NULL,          -- 区块号
    log_index INTEGER NOT NULL,             -- 日志索引
    data TEXT NOT NULL,                     -- 事件数据(JSON)
    created_at INTEGER NOT NULL             -- 创建时间戳
);
```

### 状态枚举

#### 营地状态 (CampState)
- `0`: Registration - 报名阶段
- `1`: Failed - 开营失败
- `2`: Success - 开营成功
- `3`: Challenging - 闯关阶段
- `4`: Completed - 已结营

#### 参与者状态 (ParticipantState)
- `0`: NotRegistered - 未报名
- `1`: Registered - 已报名
- `2`: Completed - 已完成
- `3`: Withdrawn - 已提取
- `4`: Forfeited - 已罚没

#### 关卡状态 (ChallengeState)
- `0`: NotConfigured - 未配置
- `1`: Active - 激活
- `2`: Expired - 已过期

## API接口设计

### 营地管理API (`/api/camps`)

#### 查询接口
```javascript
// 获取所有营地
GET /api/camps
Query参数: state, sortBy, sortDirection, limit, offset

// 获取单个营地详情
GET /api/camps/:address

// 获取用户创建的营地
GET /api/camps/organizer/:address
Query参数: state, sortBy, sortDirection, limit, offset

// 获取用户参与的营地
GET /api/camps/participant/:address
Query参数: state, sortBy, sortDirection, limit, offset

// 获取用户可参与的营地
GET /api/camps/available/:address
Query参数: sortBy, sortDirection, limit, offset

// 获取营地参与者
GET /api/camps/:address/participants
Query参数: state, sortBy, sortDirection, limit, offset

// 获取营地关卡
GET /api/camps/:address/challenges
```

#### 数据操作接口
```javascript
// 保存关卡数据
POST /api/camps/:address/challenges
Body: { challenges: [{ challengeIndex, deadline, passwordHash }] }

// 更新参与者当前关卡
PUT /api/camps/:address/participants/:participantAddress/current-level
Body: { currentLevel }
```

### Web3交互API (`/api/web3`)

#### 合约操作接口
```javascript
// 创建营地
POST /api/web3/createCamp
Body: {
  name, signupDeadline, campEndDate, challengeCount,
  minParticipants, maxParticipants, depositAmount, privateKey
}

// 参与者报名
POST /api/web3/register
Body: { campAddress, depositAmount, privateKey }

// 检查营地状态
POST /api/web3/checkCampState
Body: { campAddress, privateKey }

// 配置关卡
POST /api/web3/configChallenges
Body: { campAddress, deadlines, passwords, privateKey }

// 提交密码
POST /api/web3/submitPassword
Body: { campAddress, challengeIndex, password, privateKey }

// 提取押金
POST /api/web3/withdrawDeposit
Body: { campAddress, privateKey }

// 罚扣押金
POST /api/web3/forfeitDeposits
Body: { campAddress, privateKey }
```

## 服务层设计

### 1. Web3Service (Web3服务)
**功能职责**:
- 智能合约交互
- 交易签名和发送
- 合约状态查询
- 密码哈希生成

**核心方法**:
```javascript
// 初始化Web3连接
init()

// 创建营地
createCamp(params, wallet)

// 参与者报名
register(campAddress, wallet, depositAmount)

// 检查营地状态
checkCampState(campAddress, wallet)

// 配置关卡
configChallenges(campAddress, deadlines, passwordHashes, wallet)

// 提交密码
submitPassword(campAddress, challengeIndex, password, wallet)

// 生成密码哈希
generatePasswordHash(password)
```

### 2. EventListener (事件监听服务)
**功能职责**:
- 监听智能合约事件
- 自动更新数据库状态
- 事件日志记录
- 错误处理和重试

**监听事件**:
- `CampCreated`: 营地创建事件
- `ParticipantJoined`: 参与者加入事件
- `CampStateChanged`: 营地状态变更事件
- `ParticipantRegistered`: 参与者注册事件
- `ChallengesConfigured`: 关卡配置事件
- `ChallengeCompleted`: 关卡完成事件

**核心方法**:
```javascript
// 启动事件监听
start()

// 停止事件监听
stop()

// 监听工厂合约事件
listenToFactoryEvents()

// 监听营地合约事件
listenToCampEvents(campAddress)
```

### 3. CampStatusService (营地状态服务)
**功能职责**:
- 定期检查营地状态
- 自动更新过期关卡
- 状态同步和清理

## 配置管理

### 环境配置
```javascript
const config = {
  // 服务器配置
  port: process.env.PORT || 3001,
  
  // 数据库配置
  database: {
    path: process.env.DB_PATH || './data/web3ftw.db'
  },
  
  // Web3配置
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  campFactoryAddress: process.env.FACTORY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  
  // API配置
  apiPrefix: '/api',
  
  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // 缓存配置
  cache: {
    ttl: 30 * 60 // 30分钟
  }
};
```

## 安全机制

### 1. 权限控制
- **组织者权限**: 仅组织者可配置关卡、罚扣押金
- **参与者权限**: 仅参与者可报名、提交密码、提取押金
- **地址验证**: 验证以太坊地址格式
- **私钥安全**: 私钥仅在内存中临时使用

### 2. 数据验证
- **输入验证**: 所有API输入参数验证
- **地址格式**: 以太坊地址格式检查
- **时间验证**: 确保时间戳的有效性
- **数值范围**: 确保数值在合理范围内

### 3. 错误处理
- **统一错误响应**: 标准化的错误响应格式
- **错误日志**: 详细的错误日志记录
- **事务回滚**: 数据库操作失败时自动回滚
- **重试机制**: 网络请求失败时自动重试

## 性能优化

### 1. 数据库优化
- **索引优化**: 为常用查询字段创建索引
- **查询优化**: 使用高效的SQL查询
- **连接池**: 数据库连接复用
- **批量操作**: 减少数据库交互次数

### 2. 缓存策略
- **内存缓存**: 热点数据内存缓存
- **查询缓存**: API查询结果缓存
- **缓存失效**: 智能缓存失效策略

### 3. 并发处理
- **异步处理**: 使用async/await处理异步操作
- **事件队列**: 事件处理队列化
- **连接限制**: 控制并发连接数

## 监控和日志

### 1. 日志记录
- **访问日志**: 使用Morgan记录HTTP请求
- **错误日志**: 详细的错误信息记录
- **事件日志**: 智能合约事件记录
- **性能日志**: 接口响应时间记录

### 2. 健康检查
- **服务状态**: 定期检查服务运行状态
- **数据库连接**: 监控数据库连接状态
- **Web3连接**: 监控区块链连接状态
- **事件监听**: 监控事件监听服务状态

**版本**: v1.0.0
**API数量**: 15个主要接口
**数据库表**: 5个核心表
**服务数量**: 3个核心服务