import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// 泡泡类型
interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  popped: boolean;
  shape: 'circle' | 'star' | 'heart' | 'diamond';
  emoji: string;
}

// 粒子类型
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

// 颜色配置
const BUBBLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
];

const EMOJIS = ['😀', '😎', '🥳', '😈', '🤖', '👾', '🥶', '🥺', '😏', '😂', '😇', '🥰', '😜', '🤩', '😬', '😭', '😡', '😱', '😴', '🤡'];

// 物理引擎配置
const GRAVITY = 0.2;
const FRICTION = 0.98;
const BOUNCE = 0.7;
const WIND = 0.1;

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
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      opacity: Math.random() * 0.2 + 0.1,
    });

    // 初始化粒子
    for (let i = 0; i < 20; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (Math.random() < 0.002) {
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

// 泡泡组件
function BubbleComponent({ bubble, onPop }: { bubble: Bubble; onPop: (id: number) => void }) {
  const [isPopping, setIsPopping] = useState(false);

  const handlePop = () => {
    if (isPopping) return;
    setIsPopping(true);
    onPop(bubble.id);
  };

  const getShapePath = (shape: string, size: number) => {
    const center = size / 2;
    switch (shape) {
      case 'star':
        return `M${center},${size * 0.1} L${center + size * 0.2},${center} L${size * 0.9},${center} L${center + size * 0.1},${center + size * 0.2} L${center + size * 0.3},${size * 0.9} L${center},${center + size * 0.3} L${center - size * 0.3},${size * 0.9} L${center - size * 0.1},${center + size * 0.2} L${size * 0.1},${center} L${center - size * 0.2},${center} Z`;
      case 'heart':
        return `M${center},${size * 0.8} Q${center - size * 0.3},${center} ${center},${center - size * 0.2} Q${center + size * 0.3},${center} ${center},${size * 0.8} Z`;
      case 'diamond':
        return `M${center},${size * 0.1} L${center + size * 0.3},${center} L${center},${size * 0.9} L${center - size * 0.3},${center} Z`;
      default:
        return `M${center},${size * 0.1} A${size * 0.4},${size * 0.4} 0 1,1 ${center},${size * 0.9} A${size * 0.4},${size * 0.4} 0 1,1 ${center},${size * 0.1} Z`;
    }
  };

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: bubble.x,
        top: bubble.y,
        width: bubble.size,
        height: bubble.size,
        zIndex: 2
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isPopping ? 2 : 1, 
        opacity: isPopping ? 0 : bubble.opacity,
        x: bubble.x,
        y: bubble.y
      }}
      exit={{ scale: 2, opacity: 0 }}
      transition={{ duration: isPopping ? 0.3 : 0.1 }}
      whileHover={{ scale: 1.1 }}
      onClick={handlePop}
    >
      <svg 
        width={bubble.size} 
        height={bubble.size} 
        className="drop-shadow-lg"
        style={{
          filter: `drop-shadow(0 0 20px ${bubble.color}80)`
        }}
      >
        <defs>
          <radialGradient id={`gradient-${bubble.id}`}>
            <stop offset="0%" stopColor={bubble.color} stopOpacity="0.8" />
            <stop offset="70%" stopColor={bubble.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={bubble.color} stopOpacity="0.3" />
          </radialGradient>
        </defs>
        
        <path
          d={getShapePath(bubble.shape, bubble.size)}
          fill={`url(#gradient-${bubble.id})`}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
        />
        
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={bubble.size * 0.4}
          fill="white"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
        >
          {bubble.emoji}
        </text>
      </svg>
    </motion.div>
  );
}

// 粒子效果组件
function ParticleEffect({ particles }: { particles: Particle[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 0.8, 0],
            x: particle.x + particle.vx * 50,
            y: particle.y + particle.vy * 50,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// 游戏区域组件
function GameArea({ bubbles, particles, onPopBubble }: {
  bubbles: Bubble[];
  particles: Particle[];
  onPopBubble: (id: number) => void;
}) {
  return (
    <div className="relative w-full h-[70vh] max-w-6xl mx-auto glass rounded-3xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <BubbleComponent
            key={bubble.id}
            bubble={bubble}
            onPop={onPopBubble}
          />
        ))}
      </AnimatePresence>
      
      <ParticleEffect particles={particles} />
    </div>
  );
}

export default function BubbleGame() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleId, setParticleId] = useState(0);
  const [popMsg, setPopMsg] = useState<string | null>(null);
  const animationRef = useRef<number>();

  // web3梗提示
  const popTips = [
    '压力已上链，戳爆成功！',
    '链上泡泡，快乐无Gas费',
    '戳破焦虑，钱包余额+0',
    '泡泡已销毁，链上留痕',
    '戳爆烦恼，NFT还没到',
    '链上解压，泡泡懂你',
    '戳一下，元宇宙都震动',
    '泡泡已mint，快乐airdrop',
    '链上戳泡泡，现实少烦恼',
    '戳爆emo，web3续命',
  ];

  // 生成新泡泡
  const generateBubble = useCallback((): Bubble => {
    const size = Math.random() * 40 + 40;
    const shapes: ('circle' | 'star' | 'heart' | 'diamond')[] = ['circle', 'star', 'heart', 'diamond'];
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - size),
      y: Math.random() * (window.innerHeight * 0.5 - size) + 80,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      opacity: Math.random() * 0.3 + 0.7,
      popped: false,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    };
  }, []);

  // 生成粒子效果
  const generateParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: particleId + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 2,
        color,
        opacity: 1,
        life: 1,
        maxLife: 1
      });
    }
    setParticleId(prev => prev + particleCount);
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);
  }, [particleId]);

  // 物理更新
  const updatePhysics = useCallback(() => {
    setBubbles(prevBubbles => 
      prevBubbles.map(bubble => {
        if (bubble.popped) return bubble;
        bubble.vy += GRAVITY;
        bubble.vx *= FRICTION;
        bubble.vy *= FRICTION;
        bubble.vx += (Math.random() - 0.5) * WIND;
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        if (bubble.x <= 0 || bubble.x >= window.innerWidth - bubble.size) {
          bubble.vx *= -BOUNCE;
          bubble.x = Math.max(0, Math.min(window.innerWidth - bubble.size, bubble.x));
        }
        if (bubble.y <= 80 || bubble.y >= window.innerHeight * 0.5 - bubble.size) {
          bubble.vy *= -BOUNCE;
          bubble.y = Math.max(80, Math.min(window.innerHeight * 0.5 - bubble.size, bubble.y));
        }
        return bubble;
      })
    );
  }, []);

  // 游戏循环
  useEffect(() => {
    const gameLoop = () => {
      updatePhysics();
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoop();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [updatePhysics]);

  // 戳破泡泡
  const popBubble = (id: number) => {
    const bubble = bubbles.find(b => b.id === id);
    if (!bubble || bubble.popped) return;
    generateParticles(bubble.x + bubble.size / 2, bubble.y + bubble.size / 2, bubble.color);
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setPopMsg(popTips[Math.floor(Math.random() * popTips.length)]);
    setTimeout(() => setPopMsg(null), 1200);
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => !b.popped));
    }, 400);
  };

  // 清空泡泡
  const clearBubbles = () => {
    setBubbles([]);
    setParticles([]);
    setPopMsg(null);
  };

  // 点击主泡泡区生成泡泡
  const handleGameAreaClick = (e: React.MouseEvent) => {
    // 只在点击空白区域时生成泡泡，避免冒泡到泡泡本身
    if ((e.target as HTMLElement).id === 'bubble-game-area') {
      setBubbles(prev => [...prev, generateBubble()]);
    }
  };

  return (
    <>
      <Head>
        <title>解压泡泡 - Color See See</title>
        <meta name="description" content="链上泡泡，戳爆压力，快乐上链" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen relative flex flex-col items-center justify-center">
        <AnimatedBackground />
        <Navigation />
        <main className="relative z-10 pt-32 pb-16 w-full flex flex-col items-center">
          <div className="text-center mb-6">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-3 gradient-text neon-glow"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              🫧 链上解压泡泡
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-cyan-100 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              戳爆压力，快乐上链，泡泡都懂你！
            </motion.p>
          </div>
          <div className="flex flex-row gap-4 mb-6 justify-center">
            <motion.button
              onClick={clearBubbles}
              className="px-6 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg hover:from-purple-500 hover:to-cyan-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              🗑️ 清空泡泡
            </motion.button>
            <Link href="/">
              <motion.button
                className="px-6 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-lg hover:from-pink-500 hover:to-yellow-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                🏠 返回首页
              </motion.button>
            </Link>
          </div>
          {/* web3梗提示 */}
          <AnimatePresence>
            {popMsg && (
              <motion.div
                className="fixed top-28 left-1/2 -translate-x-1/2 bg-black/80 text-cyan-200 px-8 py-4 rounded-2xl shadow-xl text-xl font-bold z-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {popMsg}
              </motion.div>
            )}
          </AnimatePresence>
          {/* 泡泡区 */}
          <div id="bubble-game-area" className="relative w-full max-w-5xl h-[50vh] min-h-[340px] flex items-center justify-center cursor-pointer" onClick={handleGameAreaClick}>
            <GameArea 
              bubbles={bubbles.filter(b => !b.popped)}
              particles={particles}
              onPopBubble={popBubble}
            />
          </div>
        </main>
      </div>
    </>
  );
} 