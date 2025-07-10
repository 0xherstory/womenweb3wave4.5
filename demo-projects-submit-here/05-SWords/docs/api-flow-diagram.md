# 前后端交互流程图（API Flow）

## 项目概述
Feminist Quote Board - 女性主义格言板，一个结合传统Web技术和区块链技术的现代化知识分享平台。

## 技术架构
- **前端**: Next.js 15.2.4 + React 19 + TypeScript
- **后端**: Supabase (PostgreSQL) + 以太坊智能合约
- **钱包**: MetaMask 等 Web3 钱包
- **UI**: Tailwind CSS + Radix UI + Framer Motion

## 前后端交互流程图

```mermaid
graph TD
    A[用户浏览器] --> B[Next.js 前端应用]
    
    %% 页面路由
    B --> C[首页 /]
    B --> D[格言墙 /quotes]
    B --> E[每日抽签 /daily-draw]
    B --> F[书籍世界 /books]
    B --> G[杰出女性 /women]
    B --> H[学习资源 /resources]
    B --> I[订阅更新 /subscribe]
    B --> J[友好评论 /friendly-comments]
    
    %% 数据源
    B --> K[Supabase 数据库]
    B --> L[以太坊智能合约]
    
    %% Supabase API 交互
    K --> K1[swordsdata 表]
    K --> K2[quotes 表]
    K --> K3[comments 表]
    K --> K4[用户配置表]
    
    %% 智能合约交互
    L --> L1[submitQuote 提交格言]
    L --> L2[commentOnQuote 添加评论]
    L --> L3[getLatestQuotes 获取格言]
    L --> L4[getCommentsByQuote 获取评论]
    
    %% 钱包连接
    B --> M[MetaMask 钱包]
    M --> M1[连接钱包]
    M --> M2[签名交易]
    M --> M3[获取账户地址]
    
    %% 主要API流程
    subgraph "数据获取流程"
        N1[页面加载] --> N2[检查数据源连接]
        N2 --> N3[并行获取数据]
        N3 --> N4[Supabase: getQuotes()]
        N3 --> N5[区块链: getLatestQuotes()]
        N4 --> N6[合并和排序数据]
        N5 --> N6
        N6 --> N7[渲染到UI]
    end
    
    subgraph "格言提交流程"
        O1[用户输入格言] --> O2[选择数据源]
        O2 --> O3{数据源选择}
        O3 -->|Supabase| O4[addQuote() API]
        O3 -->|区块链| O5[submitQuote() 合约调用]
        O4 --> O6[数据库存储]
        O5 --> O7[钱包签名]
        O7 --> O8[交易确认]
        O6 --> O9[更新UI]
        O8 --> O9
    end
    
    subgraph "评论系统流程"
        P1[用户添加评论] --> P2[检查格言来源]
        P2 --> P3{格言来源}
        P3 -->|区块链| P4[commentOnQuote() 合约调用]
        P3 -->|Supabase| P5[数据库评论存储]
        P4 --> P6[钱包签名确认]
        P5 --> P7[实时更新]
        P6 --> P7
    end
    
    subgraph "钱包交互流程"
        Q1[连接钱包按钮] --> Q2[检查 ethereum 对象]
        Q2 --> Q3[请求账户连接]
        Q3 --> Q4[获取账户地址]
        Q4 --> Q5[初始化合约实例]
        Q5 --> Q6[更新连接状态]
    end
    
    subgraph "数据同步流程"
        R1[定时同步任务] --> R2[获取区块链最新数据]
        R2 --> R3[获取数据库最新数据]
        R3 --> R4[比较数据差异]
        R4 --> R5[更新本地状态]
        R5 --> R6[触发UI更新]
    end
```

## 核心API接口

### 1. 数据库API (Supabase)

#### 获取格言列表
```typescript
// lib/quotes.ts
export async function getQuotes(): Promise<SwordsData[]>
```
- **功能**: 从 `swordsdata` 表获取所有格言
- **返回**: 格言数组，按ID倒序排列
- **错误处理**: 连接失败时抛出异常

#### 添加格言
```typescript
// lib/quotes.ts
export async function addQuote(content: string, author?: string, origin?: string, user?: string): Promise<SwordsData>
```
- **功能**: 向 `swordsdata` 表插入新格言
- **参数**: 内容、作者、来源、用户
- **返回**: 新创建的格言记录

#### 删除格言
```typescript
// lib/quotes.ts
export async function deleteQuote(id: number): Promise<void>
```
- **功能**: 从数据库删除指定格言
- **参数**: 格言ID
- **权限**: 仅支持数据库格言删除

### 2. 区块链API (智能合约)

#### 获取区块链格言
```typescript
// lib/web3.ts
export async function getLatestQuotes(limit = 50): Promise<Quote[]>
```
- **功能**: 从智能合约获取最新格言
- **参数**: 限制数量
- **返回**: 格言数组

#### 提交格言到区块链
```typescript
// lib/web3.ts
export async function submitQuote(content: string, authorName: string, origin: string): Promise<void>
```
- **功能**: 调用智能合约提交格言
- **流程**: 连接钱包 → 签名交易 → 等待确认
- **事件**: 触发 `QuoteSubmitted` 事件

#### 添加评论
```typescript
// lib/web3.ts
export async function commentOnQuote(quoteId: number, content: string): Promise<void>
```
- **功能**: 为区块链格言添加评论
- **流程**: 钱包签名 → 合约调用 → 事件触发

#### 获取评论
```typescript
// lib/web3.ts
export async function getCommentsByQuote(quoteId: number): Promise<Comment[]>
```
- **功能**: 获取指定格言的所有评论
- **返回**: 评论数组

### 3. 钱包管理API

#### 连接钱包
```typescript
// lib/web3.ts
async connectWallet(): Promise<string>
```
- **功能**: 连接MetaMask钱包
- **返回**: 钱包地址
- **错误**: 钱包未安装或连接失败

#### 获取当前账户
```typescript
// lib/web3.ts
async getCurrentAccount(): Promise<string | null>
```
- **功能**: 获取当前连接的账户地址
- **返回**: 地址或null

#### 检查连接状态
```typescript
// lib/web3.ts
isConnected(): boolean
```
- **功能**: 检查钱包连接状态

## 数据流架构

### 双数据源设计
```
用户界面
    ↓
数据管理层 (lib/quotes.ts + lib/web3.ts)
    ↓
    ├── Supabase 数据库
    │   ├── swordsdata (格言数据)
    │   ├── quotes (同步数据)
    │   └── comments (评论数据)
    │
    └── 以太坊智能合约
        ├── submitQuote (提交格言)
        ├── commentOnQuote (添加评论)
        ├── getLatestQuotes (获取格言)
        └── getCommentsByQuote (获取评论)
```

### 数据同步策略
1. **页面加载时**: 并行获取两个数据源
2. **数据合并**: 按时间戳排序，去重处理
3. **实时更新**: 监听合约事件，实时同步
4. **错误处理**: 单数据源失败不影响整体功能

## 错误处理机制

### 网络错误
- **RPC连接失败**: 自动切换到备用RPC端点
- **数据库连接失败**: 降级到只读模式
- **钱包连接失败**: 显示安装提示

### 交易错误
- **Gas费用不足**: 提示用户调整Gas设置
- **交易被拒绝**: 显示错误信息，允许重试
- **合约调用失败**: 回滚状态，显示详细错误

### 数据验证
- **输入验证**: 客户端和服务器端双重验证
- **数据完整性**: 检查必要字段存在性
- **格式验证**: 确保数据格式正确

## 性能优化

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

## 安全考虑

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