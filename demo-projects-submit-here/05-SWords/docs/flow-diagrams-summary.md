# 流程图总结文档

## 项目概述
Feminist Quote Board - 女性主义格言板，一个结合传统Web技术和区块链技术的现代化知识分享平台。

## 1. 前后端交互流程图（API Flow）

### 系统架构概览
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户浏览器     │    │   Next.js 前端   │    │   数据源层      │
│                 │    │                 │    │                 │
│  - 页面浏览      │───▶│  - React组件     │───▶│  - Supabase     │
│  - 用户交互      │    │  - TypeScript   │    │  - 智能合约     │
│  - 钱包连接      │    │  - Tailwind CSS │    │  - MetaMask     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 主要API交互流程

#### 数据获取流程
```
1. 页面加载
   ↓
2. 检查数据源连接状态
   ↓
3. 并行获取数据
   ├── Supabase: getQuotes()
   └── 区块链: getLatestQuotes()
   ↓
4. 合并和排序数据
   ↓
5. 渲染到UI界面
```

#### 格言提交流程
```
1. 用户输入格言内容
   ↓
2. 选择数据存储方式
   ↓
3. 数据验证
   ↓
4. 提交到对应数据源
   ├── Supabase: addQuote() API
   └── 区块链: submitQuote() 合约调用
   ↓
5. 等待确认/响应
   ↓
6. 更新UI显示
```

#### 评论系统流程
```
1. 用户选择格言
   ↓
2. 输入评论内容
   ↓
3. 检查格言来源
   ↓
4. 提交评论
   ├── 区块链格言: commentOnQuote() 合约调用
   └── 数据库格言: 数据库评论存储
   ↓
5. 实时更新评论列表
```

### 核心API接口

| 功能 | Supabase API | 区块链 API | 说明 |
|------|-------------|-----------|------|
| 获取格言 | `getQuotes()` | `getLatestQuotes()` | 从对应数据源获取格言列表 |
| 提交格言 | `addQuote()` | `submitQuote()` | 向数据源提交新格言 |
| 删除格言 | `deleteQuote()` | ❌ 不支持 | 仅数据库支持删除 |
| 添加评论 | 数据库存储 | `commentOnQuote()` | 评论功能实现 |
| 获取评论 | 数据库查询 | `getCommentsByQuote()` | 获取格言评论 |

## 2. 钱包/合约交互路径图（Wallet Interaction Flow）

### 钱包连接流程
```
1. 检查钱包环境
   ↓
2. 请求连接钱包
   ↓
3. 用户授权连接
   ↓
4. 获取账户地址
   ↓
5. 初始化Web3管理器
   ├── 创建Provider
   ├── 创建Signer
   └── 创建合约实例
   ↓
6. 更新连接状态
```

### 智能合约交互流程

#### 格言提交到区块链
```
1. 用户输入格言内容
   ↓
2. 验证输入数据
   ↓
3. 估算Gas费用
   ↓
4. 构建交易参数
   ↓
5. 用户签名交易
   ↓
6. 发送交易到网络
   ↓
7. 等待交易确认
   ↓
8. 触发QuoteSubmitted事件
   ↓
9. 更新UI显示
```

#### 评论提交到区块链
```
1. 选择要评论的格言
   ↓
2. 输入评论内容
   ↓
3. 验证评论数据
   ↓
4. 估算Gas费用
   ↓
5. 构建评论交易
   ↓
6. 用户签名交易
   ↓
7. 发送交易到网络
   ↓
8. 等待交易确认
   ↓
9. 触发CommentSubmitted事件
   ↓
10. 更新评论列表
```

### 智能合约接口

#### 写入方法（需要签名）
```solidity
// 提交格言
function submitQuote(
    string memory content,
    string memory authorName,
    string memory origin
) external

// 添加评论
function commentOnQuote(
    uint256 quoteId,
    string memory content
) external
```

#### 读取方法（无需签名）
```solidity
// 获取格言
function getQuote(uint256 id) external view returns (Quote memory)

// 获取最新格言
function getLatestQuotes(uint256 limit) external view returns (Quote[] memory)

// 获取评论
function getCommentsByQuote(uint256 quoteId) external view returns (Comment[] memory)

// 获取统计信息
function quoteCount() external view returns (uint256)
function commentCount() external view returns (uint256)
```

### 数据结构

#### Quote结构
```solidity
struct Quote {
    uint256 id;           // 格言ID
    string content;       // 格言内容
    string authorName;    // 作者姓名
    string origin;        // 来源
    address user;         // 提交者地址
    uint256 timestamp;    // 提交时间
}
```

#### Comment结构
```solidity
struct Comment {
    uint256 id;           // 评论ID
    uint256 quoteId;      // 关联格言ID
    address commenter;    // 评论者地址
    string content;       // 评论内容
    uint256 timestamp;    // 评论时间
}
```

## 3. 错误处理机制

### 网络错误处理
- **RPC连接失败**: 自动切换到备用RPC端点
- **数据库连接失败**: 降级到只读模式
- **钱包连接失败**: 显示安装提示

### 交易错误处理
- **Gas费用不足**: 提示用户调整Gas设置
- **交易被拒绝**: 显示错误信息，允许重试
- **合约调用失败**: 回滚状态，显示详细错误

### 数据验证
- **输入验证**: 客户端和服务器端双重验证
- **数据完整性**: 检查必要字段存在性
- **格式验证**: 确保数据格式正确

## 4. 性能优化策略

### 前端优化
- **代码分割**: 按路由懒加载组件
- **缓存策略**: 合理使用React缓存
- **图片优化**: Next.js Image组件优化

### 后端优化
- **连接池**: Supabase连接池管理
- **批量查询**: 减少数据库查询次数
- **索引优化**: 数据库索引优化

### 区块链优化
- **多RPC**: 备用RPC端点提高可用性
- **Gas优化**: 智能Gas费用估算
- **批量操作**: 减少交易次数

## 5. 安全考虑

### 前端安全
- **输入验证**: 防止XSS攻击
- **钱包安全**: 安全的钱包连接流程
- **数据加密**: 敏感数据加密传输

### 后端安全
- **SQL注入防护**: 参数化查询
- **权限控制**: 适当的访问权限
- **数据备份**: 定期数据备份

### 区块链安全
- **合约审计**: 智能合约安全审计
- **访问控制**: 适当的权限管理
- **事件监听**: 安全的事件处理

## 6. 技术栈总结

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 前端框架 | Next.js | 15.2.4 | 全栈React框架 |
| UI库 | React | 19 | 用户界面库 |
| 样式 | Tailwind CSS | 3.4.17 | 原子化CSS框架 |
| 类型系统 | TypeScript | 5 | 类型安全的JavaScript |
| 数据库 | Supabase | latest | PostgreSQL数据库 |
| 区块链 | Ethers.js | latest | 以太坊交互库 |
| 钱包 | MetaMask | - | Web3钱包 |
| 动画 | Framer Motion | latest | 动画库 |
| UI组件 | Radix UI | latest | 可访问组件库 |

## 7. 部署和监控

### 部署平台
- **Vercel**: 主要部署平台
- **Netlify**: 备用部署平台
- **Railway**: 可选部署平台

### 监控指标
- **Core Web Vitals**: 页面性能指标
- **错误追踪**: 前端错误监控
- **用户行为**: 用户交互分析
- **交易状态**: 区块链交易监控
- **Gas费用**: Gas费用分析

这个总结文档提供了项目的前后端交互流程和钱包/合约交互路径的完整概览，包括技术架构、API接口、错误处理、性能优化和安全考虑等各个方面。 