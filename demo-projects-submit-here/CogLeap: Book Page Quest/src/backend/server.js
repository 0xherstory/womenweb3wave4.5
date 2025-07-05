import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// 从 ../src/contracts/config.js 导入 ABI
import { ARG_TOKEN_ABI, ACHIEVEMENT_NFT_ABI, ARG_TOKEN_ADDRESS, ACHIEVEMENT_NFT_ADDRESS } from '../src/contracts/config.js';

config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const BACKEND_WALLET_PRIVATE_KEY = process.env.BACKEND_WALLET_PRIVATE_KEY;

if (!JWT_SECRET || !SEPOLIA_RPC_URL || !BACKEND_WALLET_PRIVATE_KEY) {
  console.error("错误：缺少必要的环境变量。请检查你的 .env 文件。");
  process.exit(1);
}

// 设置 Ethers Provider 和 Wallet
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(BACKEND_WALLET_PRIVATE_KEY, provider);

// 加载智能合约
const argTokenContract = new ethers.Contract(ARG_TOKEN_ADDRESS, ARG_TOKEN_ABI, wallet);
const achievementNftContract = new ethers.Contract(ACHIEVEMENT_NFT_ADDRESS, ACHIEVEMENT_NFT_ABI, wallet);

console.log(`后端钱包地址: ${wallet.address}`);
console.log(`ARG Token 合约地址: ${ARG_TOKEN_ADDRESS}`);
console.log(`Achievement NFT 合约地址: ${ACHIEVEMENT_NFT_ADDRESS}`);

// ===============================================
// 模拟数据库
// ===============================================
const users = {
  // 'address': { nickname: 'xxx', ... }
};
const userProfiles = {};

// 新增：社区内容的内存数据库
const initialTactics = [
  {
    id: 1,
    authorAddress: '0x123...',
    authorName: '逻辑大师',
    content: '当对方使用"诉诸传统"时，可以反问："传统一定是对的吗？我们是否应该用现在的标准来审视旧的习惯？"',
    upvotes: 128,
    downvotes: 5,
    createdAt: new Date('2024-05-20T10:00:00Z'),
    comments: [
        { id: 101, authorName: '辩论新手', content: '这招好用！', createdAt: new Date() }
    ]
  },
  {
    id: 2,
    authorAddress: '0x456...',
    authorName: '辩证忍者',
    content: '警惕‘稻草人谬误’。当对方曲解你的观点，然后攻击那个被曲解的、更容易攻击的‘稻草人’时，要及时指出来，并重申你的原始立场。',
    upvotes: 95,
    downvotes: 8,
    createdAt: new Date('2024-05-22T14:30:00Z'),
    comments: [
      { id: 201, authorName: '学习者', content: '经常遇到这种情况，感谢分享！', createdAt: new Date() },
      { id: 202, authorName: '反思者', content: '是的，核心是要拉回真正的议题。', createdAt: new Date() }
    ]
  },
  {
    id: 3,
    authorAddress: '0x789...',
    authorName: '反思者',
    content: '我们都倾向于寻找支持自己既有信念的证据，这就是‘确认偏误’。为了更客观地思考，要主动寻找与自己观点相反的信息和证据。',
    upvotes: 210,
    downvotes: 3,
    createdAt: new Date('2024-05-24T09:00:00Z'),
    comments: []
  },
];
const tactics = [...initialTactics];
let nextTacticId = 4;

// 游戏中每个选项对应的胜利/失败消息
const gameResponses = {
  // ... existing code ...
  // ... existing code ...
  // ... existing code ...
};

// 存储用户登录时生成的 nonce
const nonces = {};

// 为已有用户添加模拟数据
const sampleUsersForLeaderboard = [
    { address: '0x1111111111111111111111111111111111111111', nickname: '诡辩终结者', tier: '王者', winRate: 98.5, avatarSeed: 'terminator' },
    { address: '0x2222222222222222222222222222222222222222', nickname: '逻辑之神', tier: '大师', winRate: 95.2, avatarSeed: 'logic-god' },
    { address: '0x3333333333333333333333333333333333333333', nickname: '反讽公爵', tier: '大师', winRate: 94.8, avatarSeed: 'irony-duke' },
    { address: '0x4444444444444444444444444444444444444444', nickname: '推理之星', tier: '钻石', winRate: 92.1, avatarSeed: 'deduction-star' },
];

sampleUsersForLeaderboard.forEach(user => {
    if (!users[user.address.toLowerCase()]) {
        users[user.address.toLowerCase()] = { 
            nickname: user.nickname,
            tier: user.tier,
            winRate: user.winRate,
            tokens: 100,
            nfts: [],
            wins: Math.round((user.winRate / 100) * 50), // 根据胜率模拟一个值
            totalGames: 50 // 假设一个基础游戏数
        };
    }
});

// ===============================================
// 中间件
// ===============================================
// 中间件：验证 JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // 如果没有 token，则未授权

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // 如果 token 无效，则禁止访问
    req.user = user; // 将解码后的用户信息附加到请求对象上
    next();
  });
};

app.post('/api/login', async (req, res) => {
    const { address, signature } = req.body;
    if (!address || !signature) {
        return res.status(400).send('需要提供地址和签名');
    }
    const lowerCaseAddress = address.toLowerCase();

    if (!nonces[lowerCaseAddress]) {
        return res.status(400).send('请先请求签名消息');
    }

    const message = `欢迎来到诡辩猎手训练场！请签名以验证您的身份。Nonce: ${nonces[lowerCaseAddress]}`;

    try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() === lowerCaseAddress) {
            const token = jwt.sign({ address: lowerCaseAddress }, JWT_SECRET, { expiresIn: '1h' });
            // 登录成功后删除nonce，防止重放攻击
            delete nonces[lowerCaseAddress]; 
            
            // 如果是新用户，在数据库中为他创建一个档案
            if (!users[lowerCaseAddress]) {
                users[lowerCaseAddress] = {
                    nickname: `玩家...${lowerCaseAddress.slice(-4)}`,
                    tier: '新秀',
                    winRate: 0,
                    tokens: 0,
                    nfts: [],
                    wins: 0,
                    totalGames: 0
                };
            }

            res.json({ token });
        } else {
            res.status(401).send('签名验证失败');
        }
    } catch (error) {
        console.error('登录验证时出错:', error);
        res.status(500).send('内部服务器错误');
    }
});

// 登录请求，获取nonce
app.post('/api/request-nonce', (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ message: '需要提供钱包地址' });
    }
    const lowerCaseAddress = address.toLowerCase();
    
    // 生成一个随机的 nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    // 将 nonce 与用户地址关联存储起来
    nonces[lowerCaseAddress] = nonce;

    const message = `欢迎来到诡辩猎手训练场！请签名以验证您的身份。Nonce: ${nonce}`;
    
    res.json({ message });
});

// 获取用户个人资料（受保护）
app.get('/api/profile', authenticateToken, (req, res) => {
  const userAddress = req.user.address;
  if (!userProfiles[userAddress]) {
    userProfiles[userAddress] = {
      name: '新手辩手', rank: '黑铁段位', winRate: 0, debatesDefeated: 0,
      logicValue: 50, ironyValue: 50, unlockedWeapons: [],
      skills: { '演绎推理': 50, '归纳总结': 50, '类比应用': 50, '批判性思维': 50, '逻辑一致性': 50 },
    };
  }
  res.json(userProfiles[userAddress]);
});

// 更新用户个人资料（受保护）
app.post('/api/profile', authenticateToken, (req, res) => {
  const userAddress = req.user.address;
  const { name } = req.body;
  if (!name) return res.status(400).send('昵称不能为空');
  const updatedProfile = { ...userProfiles[userAddress], name: name };
  userProfiles[userAddress] = updatedProfile;
  res.status(200).json(updatedProfile);
});

// 游戏结果记录 API (虚拟)
app.post('/api/record-game-result', (req, res) => {
  const { address, result } = req.body; // result: 'win' or 'loss'
  if (!address || !result) {
    return res.status(400).json({ message: 'Address and result are required' });
  }

  const userAddress = address.toLowerCase();
  if (!users[userAddress]) {
    // 如果用户不存在，为他创建一个档案
    users[userAddress] = { 
      nickname: `玩家${address.slice(2, 8)}`,
      tier: '新秀',
      winRate: 0,
      tokens: 0,
      nfts: [],
      wins: 0,
      totalGames: 0
    };
  }

  const user = users[userAddress];

  // --- 更新战绩 ---
  user.totalGames = (user.totalGames || 0) + 1;

  if (result === 'win') {
    user.wins = (user.wins || 0) + 1;
    
    // --- 发放虚拟奖励 ---
    const tokenReward = 10;
    user.tokens = (user.tokens || 0) + tokenReward;

    const shouldGetNft = user.nfts.length === 0 && user.wins % 3 === 0; // 每赢3次，如果没有NFT，就给一个
    let nftReward = null;
    if (shouldGetNft) {
      const newNftId = user.nfts.length + 1;
      nftReward = { id: newNftId, name: `胜利勋章 #${newNftId}` };
      user.nfts.push(nftReward);
    }
    
    console.log(`记录到玩家 ${userAddress} 的一次胜利。`);
    
    user.winRate = (user.wins / user.totalGames) * 100;
    
    res.json({ 
        message: '胜利！奖励已发放。', 
        tokenReward, 
        nftReward, 
        playerData: user 
    });

  } else if (result === 'loss') {
    console.log(`记录到玩家 ${userAddress} 的一次失败。`);
    user.winRate = (user.wins / user.totalGames) * 100;
    res.json({ 
        message: '失败了，再接再厉！',
        playerData: user
    });
  } else {
    res.status(400).json({ message: 'Invalid result type' });
  }
});

// ===============================================
// API 路由
// ===============================================

// 获取所有战术
app.get('/api/tactics', (req, res) => {
  res.json(tactics);
});

// 提交新战术
app.post('/api/tactics', authenticateToken, (req, res) => {
  const { content } = req.body;
  const userAddress = req.user.address;

  if (!content || content.trim() === '') {
    return res.status(400).send('战术内容不能为空');
  }

  // 从用户资料中获取昵称，如果不存在则使用匿名
  const authorName = userProfiles[userAddress]?.name || '匿名辩手';

  const newTactic = {
    id: nextTacticId++,
    authorAddress: userAddress,
    authorName,
    content: content.trim(),
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date(),
    comments: []
  };

  tactics.push(newTactic);

  // 返回最新的完整列表
  const sortedTactics = tactics.sort((a, b) => b.createdAt - a.createdAt);
  res.status(201).json(sortedTactics);
});

// 为战术添加评论
app.post('/api/tactics/:tacticId/comment', authenticateToken, (req, res) => {
  const { content } = req.body;
  const { tacticId } = req.params;
  const userAddress = req.user.address;

  if (!content || content.trim() === '') {
    return res.status(400).send('评论内容不能为空');
  }

  const tactic = tactics.find(t => t.id === parseInt(tacticId));
  if (!tactic) {
    return res.status(404).send('战术不存在');
  }
  
  const authorName = userProfiles[userAddress]?.name || '匿名辩手';

  const newComment = {
    id: Date.now(), // 简单用时间戳作为ID
    authorName,
    content: content.trim(),
    createdAt: new Date()
  };

  tactic.comments.push(newComment);

  res.status(201).json(newComment);
});

// 排行榜 API
app.get('/api/leaderboard', (req, res) => {
    const playerAddress = req.query.playerAddress ? req.query.playerAddress.toLowerCase() : null;

    let rankedData = Object.entries(users)
        .map(([address, data]) => ({
            address: address,
            name: data.nickname || `玩家...${address.slice(-4)}`,
            tier: data.tier || '新秀',
            winRate: data.winRate || 0,
            avatarSeed: address,
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .map((player, index) => ({
            ...player,
            rank: index + 1,
        }));

    // 先在完整列表里标记出当前玩家
    let playerIndex = -1;
    if (playerAddress) {
        playerIndex = rankedData.findIndex(p => p.address === playerAddress);
        if (playerIndex !== -1) {
            rankedData[playerIndex].name = '你';
        }
    }
    
    // 默认取前10名
    let finalData = rankedData.slice(0, 10);

    // 如果玩家存在，且排名在10名之外 (数组索引 > 9)
    if (playerIndex > 9) {
        // 用玩家数据替换掉最后一名
        finalData.pop(); 
        finalData.push(rankedData[playerIndex]);
    }
    
    res.json(finalData);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});