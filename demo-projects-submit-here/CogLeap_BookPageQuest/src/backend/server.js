import express from 'express';
import cors from 'cors';
import axios from 'axios'; // We will use axios
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; // To load .env files

// Function to generate ZhipuAI JWT token
function generateZhipuToken(apiKey, expSeconds) {
    const [id, secret] = apiKey.split('.');
    const payload = {
        api_key: id,
        exp: Math.floor(Date.now() / 1000) + expSeconds,
        timestamp: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, secret, {
        algorithm: 'HS256',
        header: {
            alg: 'HS256',
            sign_type: 'SIGN',
        },
    });
}

const app = express();

app.use(cors());
app.use(express.json());

// --- In-memory Data Stores (for demonstration) ---
const nonces = {};
let users = {}; // { address: { nickname: '...' } }
let tactics = [
    {
        id: 1,
        authorAddress: '0x123...',
        authorName: '逻辑控',
        content: "警惕'滑坡谬误'，它通过暗示一个无害的开端将不可避免地导致灾难性的后果来夸大其词。现实中，每一步都有其独立的概率，并非必然相连。",
        upvotes: 150,
        downvotes: 12,
        comments: [
            {id: 1, authorName: '辩证忍者', content: '非常经典！尤其在政策辩论中常见。'},
            {id: 2, authorName: '思想的操盘手', content: '补充一下，这通常伴随着诉诸恐惧的情绪操纵。'}
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
        id: 2,
        authorAddress: '0x456...',
        authorName: '谬误终结者',
        content: "“非黑即白”（False Dilemma）也是一个常见的陷阱。面对复杂问题时，选项往往不止两个。下次有人说“你要么支持我们，要么就是反对我们”，你就要小心了。",
        upvotes: 210,
        downvotes: 5,
        comments: [
            {id: 3, authorName: '认知探险家', content: '是的，这在简化复杂的社会议题时特别有害。'},
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
        id: 3,
        authorAddress: '0x789...',
        authorName: '辩证之王',
        content: "最近在研究\"诉诸权威\"(Appeal to Authority)谬误。当权威的观点被用作证据，但该权威在其领域之外发表言论，或者该观点本身存在争议时，这种谬误就产生了。",
        upvotes: 180,
        downvotes: 8,
        comments: [
            {id: 4, authorName: '逻辑控', content: '很好的例子！尤其是在广告中，经常有名人来推销他们并不了解的产品。'},
            {id: 5, authorName: '新手玩家', content: '这个我好像经常犯，感谢提醒！'}
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
];
let nextTacticId = 4;

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // if token is no longer valid
        req.user = user;
        next(); // move on
    });
};

// --- Endpoints ---

// Auth
app.post('/api/request-nonce', (req, res) => {
    const { address } = req.body;
    if (!address) {
        return res.status(400).json({ error: 'Address is required.' });
    }
    const nonce = `我是 ${address}，我正在于 ${new Date().toISOString()} 登录认知跃迁。随机码: ${Math.random()}`;
    nonces[address] = nonce;
    res.json({ message: nonce });
});

app.post('/api/login', (req, res) => {
    const { address, signature } = req.body;
    const nonce = nonces[address];

    if (!nonce || !signature || !address) {
        return res.status(400).json({ error: 'Address, signature, and a prior nonce request are required.' });
    }

    try {
        const recoveredAddress = ethers.verifyMessage(nonce, signature);
        
        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            delete nonces[address]; 
            if (!users[address]) {
                users[address] = {
                    nickname: `玩家${address.slice(2, 8)}`,
                    tier: '零维窥探者', // 初始段位
                    avatarSeed: address // 使用地址作为初始头像种子，确保一致性
                };
            }
            const token = jwt.sign({ address }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid signature.' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Profile
app.get('/api/profile', authenticateToken, (req, res) => {
    let userProfile = users[req.user.address];
    if (!userProfile) {
        // 如果内存中没有用户资料，创建一份默认资料
        userProfile = {
            nickname: `玩家${req.user.address.slice(2, 8)}`,
            tier: '零维窥探者',
            avatarSeed: req.user.address // 使用地址作为初始头像种子
        };
        users[req.user.address] = userProfile; // 存储到内存中
    }
    res.json(userProfile);
});

app.post('/api/profile', authenticateToken, (req, res) => {
    const { nickname } = req.body;
    if (nickname) {
        users[req.user.address].nickname = nickname;
        res.json(users[req.user.address]);
    } else {
        res.status(400).json({ error: 'Nickname is required.' });
    }
});

// Community Tactics
app.get('/api/tactics', (req, res) => {
    res.json(tactics);
});

app.post('/api/tactics', authenticateToken, (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
    }
    const newTactic = {
        id: nextTacticId++,
        authorAddress: req.user.address,
        authorName: users[req.user.address]?.nickname || `玩家${req.user.address.slice(2, 8)}`,
        content,
        upvotes: 0,
        downvotes: 0,
        comments: [],
        createdAt: new Date().toISOString()
    };
    tactics.unshift(newTactic); // Add to the beginning of the array
    res.status(201).json(tactics);
});

app.post('/api/tactics/:tacticId/comment', authenticateToken, (req, res) => {
    const tactic = tactics.find(t => t.id === parseInt(req.params.tacticId));
    const { content } = req.body;

    if (!tactic) {
        return res.status(404).json({ error: 'Tactic not found.' });
    }
    if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
    }

    const newComment = {
        id: Date.now(), // simple id
        authorName: users[req.user.address]?.nickname || `玩家${req.user.address.slice(2, 8)}`,
        content
    };

    tactic.comments.push(newComment);
    res.status(201).json(newComment);
});

// Leaderboard
app.get('/api/leaderboard', (req, res) => {
    // For demonstration, we generate some mock data. In a real app, this would come from a database.
    const mockLeaderboard = [
        { rank: 1, nickname: '逻辑控', address: '0xabc...', score: 9850, tier: '超维全知观察者', winRate: 92.5, avatarSeed: 'Sassy' },
        { rank: 2, nickname: '辩证之王', address: '0xdef...', score: 9500, tier: '高维混沌掌控者', winRate: 88.2, avatarSeed: 'Leo' },
        { rank: 3, nickname: '谬误终结者', address: '0xghi...', score: 9200, tier: '多维逻辑织网人', winRate: 85.1, avatarSeed: 'Misty' },
        { rank: 4, nickname: '认知探险家', address: '0xjkl...', score: 8900, tier: '四维时空跃迁者', winRate: 82.7, avatarSeed: 'Coco' },
        { rank: 5, nickname: '思想的操盘手', address: '0x mno...', score: 8500, tier: '三维立体洞察者', winRate: 79.3, avatarSeed: 'Max' }
    ];

    const { playerAddress } = req.query;
    if (playerAddress && !mockLeaderboard.some(p => p.address.toLowerCase() === playerAddress.toLowerCase())) {
        const playerInfo = users[playerAddress];
        mockLeaderboard.push({
            rank: 128, // a mock rank
            nickname: playerInfo?.nickname || `玩家${playerAddress.slice(2, 8)}`,
            address: playerAddress,
            score: 4200, // a mock score
            tier: playerInfo?.tier || '二维平面构筑师',
            winRate: 55.6, // Add winRate for the current player
            avatarSeed: playerInfo?.avatarSeed || playerAddress // 使用用户资料中的头像种子
        });
    }

    res.json(mockLeaderboard);
});

// AI Scenario Generation using ZhipuAI with axios
app.post('/api/generate-scenario', async (req, res) => {
    try {
        const { gameContext, bookContent, gameTheme } = req.body;
        const zhipuApiKey = process.env.ZHIPU_API_KEY;
    
        if (!zhipuApiKey) {
          return res.status(500).json({ error: 'ZhipuAI API Key not configured.' });
        }
    
        const prompt = `请根据以下游戏主题、书籍内容和情境描述，生成一个与"认知偏误"或"逻辑谬误"相关的多项选择题。
    
    游戏主题：${gameTheme || '未指定'}
    书籍内容（参考）：${bookContent || '未指定'}
    
    情境描述：${gameContext || '玩家在一个日常交流中遇到一个需要分析的论点。'}
    
    问题要求：
    - 包含一个清晰的问题。
    - 提供四个选项，其中只有一个是正确答案。
    - 确保问题和选项都符合情境、游戏主题和书籍内容。
    - 答案应该是一个常见的认知偏误或逻辑谬误。
    
    请严格以JSON格式返回，不要包含任何解释性文字或代码块标记，例如：
    {
      "question": "这位政客使用了哪种逻辑谬误？",
      "options": ["A) 诉诸权威", "B) 滑坡谬误", "C) 非黑即白", "D) 稻草人谬误"],
      "answer": "C"
    }`;
        
        const token = generateZhipuToken(zhipuApiKey, 3600); // Generate a token valid for 1 hour
        
        const response = await axios.post(
          'https://open.bigmodel.cn/api/paas/v4/chat/completions',
          {
            model: 'glm-3-turbo', // Use ZhipuAI's free model
            messages: [{ role: 'user', content: prompt }],
            // Zhipu doesn't have a specific JSON mode like OpenAI, so we rely on prompt engineering
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        // Sometimes the response might be a JSON string directly, sometimes it might be wrapped in markdown
        let scenarioText = response.data.choices[0].message.content;
        scenarioText = scenarioText.replace(/```json\n|```/g, '').trim();

        res.json(JSON.parse(scenarioText));
    
      } catch (error) {
        console.error('Error generating scenario with ZhipuAI:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to generate scenario.' });
      }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器正在端口 ${PORT} 上运行`);
});