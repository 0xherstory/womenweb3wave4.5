# 智能合约设计文档

## 技术栈
- **区块链网络**: Ethereum (支持本地Hardhat、Goerli测试网、Sepolia测试网)
- **智能合约语言**: Solidity ^0.8.19
- **开发框架**: Hardhat
- **数据库**: SQLite (后端数据存储，与区块链数据同步)

## 合约架构设计

### 整体架构
项目采用**代理模式**设计，实现合约的可升级性和Gas优化：

```
CampFactory (工厂合约)
    ↓ 创建
CampProxy (代理合约)
    ↓ 委托调用
CampImplementation (实现合约)
    ↓ 继承
CampStorage (存储合约)
```

### 合约文件结构
```
contracts/solidity/
├── CampFactory.sol          # 工厂合约 - 负责创建和管理营地
├── CampProxy.sol            # 代理合约 - 委托调用实现合约
├── CampImplementation.sol   # 实现合约 - 核心业务逻辑
└── CampStorage.sol          # 存储合约 - 状态变量定义
```

## 核心合约详解

### 1. CampFactory (工厂合约)

**功能职责**:
- 创建新的挑战营地合约
- 管理所有营地地址
- 维护组织者和参与者的营地映射关系
- 提供营地查询接口

**主要接口**:
```solidity
// 创建新营地
function createCamp(
    string calldata _name,
    uint256 _signupDeadline,
    uint256 _campEndDate,
    uint8 _challengeCount,
    uint16 _minParticipants,
    uint16 _maxParticipants,
    uint256 _depositAmount
) external returns (address)

// 获取所有营地
function getAllCamps() external view returns (address[] memory)

// 获取组织者的营地
function getCampsByOrganizer(address _organizer) external view returns (address[] memory)

// 获取参与者的营地
function getCampsByParticipant(address _participant) external view returns (address[] memory)
```

**关键特性**:
- 参数验证：确保营地参数的有效性
- 代理创建：使用代理模式创建营地合约
- 事件记录：记录营地创建和参与者注册事件
- 权限控制：只有合约拥有者可以更新实现合约

### 2. CampProxy (代理合约)

**功能职责**:
- 作为代理层，转发所有调用到实现合约
- 维护实现合约地址
- 处理合约初始化

**核心机制**:
```solidity
// 回退函数 - 委托调用实现合约
fallback() external payable {
    address _impl = implementation;
    assembly {
        calldatacopy(0, 0, calldatasize())
        let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)
        returndatacopy(0, 0, returndatasize())
        switch result
        case 0 { revert(0, returndatasize()) }
        default { return(0, returndatasize()) }
    }
}
```

**优势**:
- 可升级性：可以更新实现合约而不影响存储
- Gas优化：多个营地共享同一份实现代码
- 存储分离：状态变量与逻辑代码分离

### 3. CampStorage (存储合约)

**数据模型**:

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
    Withdrawn,       // 已提款
    Forfeited        // 已罚扣
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

### 4. CampImplementation (实现合约)

**核心业务逻辑**:

#### 营地生命周期管理
1. **初始化阶段**: 设置营地基本参数
2. **报名阶段**: 参与者报名并支付押金
3. **状态检查**: 报名结束后检查是否达到开营条件
4. **闯关阶段**: 组织者配置关卡，参与者进行挑战
5. **结营阶段**: 处理押金分配和状态更新

#### 主要功能接口

**参与者管理**:
```solidity
// 参与者报名
function register() external payable inState(CampState.Registration)

// 检查营地状态
function checkCampState() external
```

**关卡管理**:
```solidity
// 配置关卡
function configChallenges(
    uint256[] memory _deadlines,
    bytes32[] memory _passwordHashes
) external onlyOrganizer inState(CampState.Success)

// 提交关卡密码
function submitChallengePassword(uint8 _challengeIndex, string memory _password) 
    external inState(CampState.Challenging)

// 更新关卡状态
function updateChallengeState(uint8 _challengeIndex) external inState(CampState.Challenging)
```

**押金管理**:
```solidity
// 参与者提取押金
function withdrawDeposit() external

// 组织者罚扣押金
function forfeitDeposits() external onlyOrganizer
```

#### 安全机制

**权限控制**:
- `onlyOrganizer`: 仅组织者可调用
- `inState`: 确保营地处于正确状态
- 参与者身份验证

**参数验证**:
- 时间验证：确保截止时间在合理范围内
- 数量验证：确保参与者数量在限制范围内
- 金额验证：确保押金金额正确

**状态管理**:
- 状态机模式：确保状态转换的正确性
- 防重复操作：避免重复报名、重复提款等

## 事件系统

### 核心事件
```solidity
// 营地创建
event CampCreated(
    address indexed campAddress,
    address indexed organizer,
    string name,
    uint256 signupDeadline,
    uint256 campEndDate,
    uint8 challengeCount,
    uint16 minParticipants,
    uint16 maxParticipants,
    uint256 depositAmount
);

// 参与者注册
event ParticipantRegistered(
    address indexed participant, 
    uint256 depositAmount, 
    uint256 timestamp
);

// 营地状态变更
event CampStateChanged(
    CampState previousState, 
    CampState newState, 
    uint256 timestamp
);

// 关卡配置
event ChallengesConfigured(
    uint8 challengeCount, 
    uint256 timestamp
);

// 关卡完成
event ChallengeCompleted(
    address indexed participant, 
    uint8 challengeIndex, 
    uint256 timestamp
);

// 押金提取
event DepositWithdrawn(
    address indexed participant, 
    uint256 amount, 
    uint256 timestamp
);

// 押金罚扣
event DepositsForfeited(
    address indexed organizer, 
    uint256 amount, 
    uint16 forfeitedCount, 
    uint256 timestamp
);
```

## 密码安全机制

### 密码生成流程
1. **组织者输入**: 原始密码字符串
2. **前端处理**: 拼接关卡序号和参与者信息
3. **哈希生成**: 使用keccak256生成密码哈希
4. **合约存储**: 将哈希存储到区块链
5. **验证机制**: 参与者提交密码时验证哈希一致性

### 安全特性
- **链上不可见**: 原始密码不在区块链上存储
- **哈希验证**: 使用密码哈希进行验证
- **防暴力破解**: 密码哈希提供足够的安全性

## 部署配置

### 网络支持
- **本地开发**: Hardhat本地网络
- **测试网络**: Goerli、Sepolia
- **主网**: Ethereum主网（待部署）

### 编译配置
```javascript
solidity: {
  version: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

### Gas优化
- 使用代理模式减少部署成本
- 优化器启用减少执行成本
- 批量操作减少交易次数

## 测试策略

### 单元测试
- 合约功能测试
- 权限控制测试
- 边界条件测试
- 异常情况测试

### 集成测试
- 端到端流程测试
- 多用户交互测试
- 状态转换测试

### 安全测试
- 重入攻击防护
- 权限绕过测试
- 资金安全测试

## 升级机制

### 代理升级流程
1. 部署新的实现合约
2. 通过工厂合约更新实现地址
3. 所有代理合约自动使用新实现
4. 保持存储数据不变

### 升级注意事项
- 保持存储布局兼容性
- 测试新功能不影响现有数据
- 确保向后兼容性

---

**版本**: v1.0.0
**合约数量**: 4个核心合约
**测试覆盖率**: 待完善

