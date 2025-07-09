import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

// 动态背景组件
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      opacity: Math.random() * 0.3 + 0.1,
    });

    // 初始化粒子
    for (let i = 0; i < 30; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检查
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 随机重置粒子
        if (Math.random() < 0.003) {
          particles[index] = createParticle();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)' }}
    />
  );
}

// 导航栏组件
function Navigation() {
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg neon-glow">
                🎨
              </div>
              <span className="text-xl font-bold gradient-text">
                Color See See
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <motion.button 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                首页
              </motion.button>
            </Link>
            <Link href="/bubble">
              <motion.button 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                泡泡
              </motion.button>
            </Link>
            <Link href="/mokyu">
              <motion.button 
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
              >
                木鱼
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// 主色彩展示组件
function MainColorDisplay({ result, userName }: { result: any, userName: string }) {
  return (
    <motion.div 
      className="text-center mb-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* 用户名标题 */}
      {userName && (
        <motion.h2
          className="text-2xl md:text-3xl font-bold text-cyan-300 mb-2 neon-glow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {userName}的占卜结果
        </motion.h2>
      )}
      {/* 主色块 */}
      <motion.div 
        className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl mx-auto mb-5 border-4 border-white/20"
        style={{
          background: result.hex,
          boxShadow: `0 0 48px 8px ${result.hex}99, 0 0 0 4px rgba(255,255,255,0.1)`
        }}
        animate={{ 
          boxShadow: [
            `0 0 48px 8px ${result.hex}99, 0 0 0 4px rgba(255,255,255,0.1)`,
            `0 0 64px 12px ${result.hex}cc, 0 0 0 4px rgba(255,255,255,0.2)`,
            `0 0 48px 8px ${result.hex}99, 0 0 0 4px rgba(255,255,255,0.1)`
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {result.name}
      </motion.h1>
      <motion.div 
        className="text-lg text-white/80 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {result.nameEn}
      </motion.div>
      <motion.p 
        className="text-lg text-white/90 mb-2 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {result.description}
      </motion.p>
      <motion.p 
        className="text-base text-white/60 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {result.descriptionEn}
      </motion.p>
    </motion.div>
  );
}

// 配色方案组件（小圆色块）
function ColorPalette({ palette }: { palette: any[] }) {
  return (
    <motion.div 
      className="w-full mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎨</span>
        配色方案 Palette
      </h3>
      <div className="flex flex-row gap-5 mb-2 justify-center">
        {palette.map((color, i) => (
          <div key={i} className="flex flex-col items-center">
            <div 
              className="w-8 h-8 rounded-full shadow-lg border-2 border-white/20 mb-1"
              style={{ background: color.hex }}
            />
            <div className="text-xs text-white/80 text-center max-w-[60px] leading-tight">{color.name}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// 塔罗牌组件
function TarotCard({ tarot }: { tarot: any }) {
  return (
    <motion.div 
      className="w-full mb-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
        <span className="text-2xl">🔮</span>
        塔罗角色 Tarot
      </h3>
      
      <motion.div 
        className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl mb-4 mx-auto"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <span className="text-2xl">✨</span>
      </motion.div>
      
      <div className="text-xl text-white font-bold mb-2">{tarot.card}</div>
      <div className="text-lg text-white/80 mb-2">{tarot.cardEn}</div>
      <div className="text-base text-white/60">{tarot.title}</div>
    </motion.div>
  );
}

// NFT徽章组件
function NFTBadge() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateNFT = async () => {
    setIsGenerating(true);
    // 模拟NFT生成过程
    setTimeout(() => {
      setIsGenerating(false);
      alert('NFT生成功能即将上线！');
    }, 2000);
  };
  
  return (
    <motion.div 
      className="w-full mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🪙</span>
        生成专属NFT徽章
      </h3>
      <motion.button 
        onClick={generateNFT}
        disabled={isGenerating}
        className="w-full px-8 py-4 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 text-white font-bold text-lg rounded-2xl shadow-2xl border border-white/20 hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center gap-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isGenerating ? (
          <>
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            生成中...
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="currentColor"/>
            </svg>
            生成占卜徽章NFT（敬请期待）
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

export default function Result() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const userName = typeof router.query.name === 'string' ? router.query.name : '';

  // 幽默扎心关键词
  const funnyKeywords = [
    '多巴胺', '元宇宙', 'PPT', 'WiFi', '电子木鱼', '摸鱼', '工位', 'AirDrop', '调休', '赛博', '胶原蛋白', '警戒', '吃土', '乙里乙气', '真菌', '戒断', '社死', '金融', '玄学'
  ];

  // 随机选取幽默扎心色彩
  const pickFunnyOrRandom = (data: any[]) => {
    const funny = data.filter(item =>
      funnyKeywords.some(kw => item.name.includes(kw) || item.description.includes(kw))
    );
    const pool = funny.length > 0 ? funny : data;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  // 重新占卜
  const reDivine = () => {
    setLoading(true);
    fetch('/fortuneData.json')
      .then(res => res.json())
      .then(data => {
        setResult(pickFunnyOrRandom(data));
        setLoading(false);
      });
  };

  useEffect(() => {
    if (router.isReady) {
      fetch('/fortuneData.json')
        .then(res => res.json())
        .then(data => {
          setResult(pickFunnyOrRandom(data));
          setLoading(false);
        });
    }
  }, [router.isReady]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-2xl font-bold gradient-text"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          正在解析你的链上色彩人格...
        </motion.div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">无法加载占卜结果</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>色彩占卜结果 - Color See See</title>
        <meta name="description" content="查看你的专属色彩占卜结果" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <Navigation />
        <main className="relative z-10 pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div 
              className="glass-strong p-8 md:p-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <MainColorDisplay result={result} userName={userName} />
              <ColorPalette palette={result.palette} />
              <TarotCard tarot={result.tarot} />
              <NFTBadge />
              {/* 操作按钮 */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <motion.button
                  className="btn-primary px-8 py-3 text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reDivine}
                >
                  🔄 再占卜一次
                </motion.button>
                <Link href="/">
                  <motion.button 
                    className="px-8 py-3 text-lg glass border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🏠 返回首页
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
} 