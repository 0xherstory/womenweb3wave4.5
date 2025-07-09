const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const insights = [
    {
      id: 1,
      authorAddress: '0x123...',
      authorName: '逻辑大师',
      content: '注意‘滑坡谬误’，它通过暗示一个无害的开端将不可避免地导致灾难性的后果来夸大其词。',
      upvotes: 150,
      downvotes: 12,
    },
    {
      id: 2,
      authorAddress: '0x456...',
      authorName: '辩证忍者',
      content: '警惕‘稻草人谬误’。当对方曲解你的观点，然后攻击那个被曲解的、更容易攻击的‘稻草人’时，要及时指出来，并重申你的原始立场。',
      upvotes: 95,
      downvotes: 8,
    },
    {
        id: 3,
        authorAddress: '0x789...',
        authorName: '反思者',
        content: '我们都倾向于寻找支持自己既有信念的证据，这就是‘确认偏误’。为了更客观地思考，要主动寻找与自己观点相反的信息和证据。',
        upvotes: 210,
        downvotes: 3,
      },
  ];
  
  app.get('/api/insights', (req, res) => {
    res.json(insights);
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`服务器正在端口 ${PORT} 上运行`);
  });