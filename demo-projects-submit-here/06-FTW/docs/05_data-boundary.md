# 数据边界与存储分工说明

## 概述
Web3-FTW项目采用链上链下混合存储架构，根据数据的安全性、可访问性和性能需求进行合理分工。

## 存储架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     前端        │    │     后端        │    │     区块链      │
│   (临时存储)    │    │   (链下存储)    │    │   (链上存储)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│ • 用户会话      │    │ • 营地详情      │    │ • 营地状态      │
│ • 表单数据      │    │ • 参与者信息    │    │ • 参与者状态    │
│ • 临时密码      │    │ • 关卡配置      │    │ • 密码哈希      │
│ • UI状态        │    │ • 事件日志      │    │ • 押金管理      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 前端存储 (临时存储)

### 存储内容
- **用户会话信息**: 钱包连接状态、用户地址
- **表单数据**: 创建营地、配置关卡的临时输入
- **临时密码**: 组织者配置关卡时生成的待验证密文
- **UI状态**: 页面状态、筛选条件、加载状态
- **语言设置**: 中英文切换偏好

### 存储方式
- **内存存储**: React状态管理
- **会话存储**: 钱包连接信息
- **本地存储**: 用户偏好设置

### 特点
- 临时性：页面刷新后部分数据丢失
- 用户相关：仅与当前用户相关
- 非关键：不涉及核心业务逻辑

## 链下存储 (后端数据库)

### 数据库表结构

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

### 链下存储职责
- **数据缓存**: 缓存链上数据，提供快速查询
- **聚合查询**: 提供复杂的多表关联查询
- **事件日志**: 记录所有智能合约事件
- **状态同步**: 与链上数据保持同步
- **性能优化**: 通过索引和缓存提升查询性能

## 链上存储 (智能合约)

### 工厂合约存储 (CampFactory.sol)

#### 状态变量
```solidity
// 实现合约地址
address public campImplementation;

// 存储所有创建的营地地址
address[] public camps;

// 映射：地址 => 该地址创建的所有营地
mapping(address => address[]) public organizerToCamps;

// 映射：地址 => 该地址参与的所有营地
mapping(address => address[]) public participantToCamps;

// 合约拥有者
address public owner;
```

#### 存储职责
- **营地注册**: 记录所有创建的营地地址
- **组织者映射**: 维护组织者与营地的关系
- **参与者映射**: 维护参与者与营地的关系
- **合约管理**: 管理实现合约的升级

### 营地合约存储 (CampStorage.sol)

#### 枚举定义
```solidity
enum CampState {
    Registration,    // 报名阶段
    Failed,          // 开营失败
    Success,         // 开营成功
    Challenging,     // 闯关阶段
    Completed        // 已结营
}

enum ParticipantState {
    NotRegistered,   // 未报名
    Registered,      // 已报名
    Completed,       // 已完成
    Withdrawn,       // 已提取
    Forfeited        // 已罚没
}

enum ChallengeState {
    NotConfigured,   // 未配置
    Active,          // 进行中
    Expired          // 已过期
}
```

#### 结构体定义
```solidity
struct Challenge {
    uint256 deadline;        // 截止时间
    bytes32 passwordHash;    // 密码哈希
    ChallengeState state;    // 关卡状态
    uint16 completedCount;   // 完成人数
}

struct Participant {
    ParticipantState state;          // 参与者状态
    uint8 completedChallenges;       // 已完成关卡数
    uint256 registrationTime;        // 报名时间
    bool[] challengesCompleted;      // 各关卡完成状态
}
```

#### 状态变量
```solidity
// 营地基本信息
address public organizer;            // 组织者地址
string public name;                  // 营地名称
uint256 public signupDeadline;       // 报名截止时间
uint256 public campEndDate;          // 结营时间
uint8 public challengeCount;         // 挑战关卡总数
uint16 public minParticipants;       // 最小参与者数量
uint16 public maxParticipants;       // 最大参与者数量
uint256 public depositAmount;        // 押金金额
address public factory;              // 工厂合约引用

// 状态跟踪
CampState public state;              // 当前营地状态
uint16 public participantCount;      // 参与者数量
uint16 public completedCount;        // 完成所有关卡的人数
bool public depositsWithdrawn;       // 押金是否已被提取

// 数据存储
mapping(address => Participant) public participants;  // 参与者信息
address[] public participantAddresses;                // 参与者地址数组
Challenge[] public challenges;                        // 关卡信息
```

### 链上存储职责
- **资金管理**: 押金的收取、退还、罚没
- **状态验证**: 营地状态、参与者状态、关卡状态
- **权限控制**: 组织者权限、参与者权限验证
- **密码验证**: 关卡密码哈希验证
- **不可篡改**: 确保关键数据的不可篡改性

## 数据同步机制

### 事件驱动同步
```javascript
// 监听智能合约事件
eventListener.start().then(success => {
  if (success) {
    console.log('事件监听服务已启动');
    // 启动营地状态自动更新服务
    campStatusService.start();
  }
});
```

### 同步事件类型
- `CampCreated`: 营地创建 → 创建营地记录
- `ParticipantRegistered`: 参与者注册 → 创建参与者记录
- `CampStateChanged`: 营地状态变更 → 更新营地状态
- `ChallengesConfigured`: 关卡配置 → 创建关卡记录
- `ChallengeCompleted`: 关卡完成 → 更新完成状态

### 同步策略
- **实时同步**: 事件触发时立即同步
- **批量处理**: 多个事件批量处理
- **错误重试**: 同步失败时自动重试
- **数据验证**: 同步前后进行数据验证

## 数据安全策略

### 链上数据安全
- **不可篡改**: 关键业务数据存储在区块链上
- **密码哈希**: 原始密码不存储，只存储哈希值
- **权限控制**: 通过智能合约控制数据访问权限
- **资金安全**: 押金管理完全在链上进行

### 链下数据安全
- **数据备份**: 定期备份数据库
- **访问控制**: API接口权限控制
- **数据验证**: 输入数据格式验证
- **日志记录**: 记录所有数据操作

### 前端数据安全
- **临时存储**: 敏感数据不持久化存储
- **私钥保护**: 私钥仅在内存中临时使用
- **HTTPS传输**: 所有数据传输使用HTTPS
- **输入验证**: 前端输入数据验证

## 数据访问模式

### 查询模式
1. **前端查询**: 前端 → 后端API → 数据库
2. **链上查询**: 前端 → 智能合约 → 区块链
3. **混合查询**: 前端 → 后端API → 数据库 + 智能合约

### 写入模式
1. **链上写入**: 前端 → 智能合约 → 区块链 → 事件监听 → 数据库
2. **链下写入**: 前端 → 后端API → 数据库

### 缓存策略
- **热点数据**: 常用查询结果缓存
- **缓存失效**: 数据更新时自动失效
- **分层缓存**: 前端、后端、数据库多层缓存

## 数据一致性保证

### 最终一致性
- **事件驱动**: 通过事件确保最终一致性
- **重试机制**: 同步失败时自动重试
- **状态检查**: 定期检查数据一致性

### 事务处理
- **数据库事务**: 链下操作使用数据库事务
- **合约事务**: 链上操作使用智能合约事务
- **跨链事务**: 链上链下操作协调处理

---


**版本**: v1.0.0
**存储层数**: 3层 (前端、后端、区块链)
**数据库表**: 5个核心表
**合约存储**: 2个主要合约