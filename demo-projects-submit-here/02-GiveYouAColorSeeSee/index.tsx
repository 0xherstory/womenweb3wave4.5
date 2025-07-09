import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';

function WalletConnect() {
  const [connected, setConnected] = useState(false);
  return (
    <motion.button
      className={`btn-neon w-full md:w-auto mb-2 text-base ${connected ? 'ring-2 ring-green-400' : ''}`}
      whileHover={{ scale: 1.05 }}
      onClick={() => setConnected(!connected)}
    >
      {connected ? '已连接钱包' : '连接Web3钱包'}
    </motion.button>
  );
}

function NFTEntry() {
  return (
    <motion.button
      className="btn-neon w-full md:w-auto mb-2 text-base border-pink-400/40 hover:border-pink-400"
      whileHover={{ scale: 1.05 }}
      onClick={() => alert('NFT生成功能即将上线，敬请期待！')}
    >
      🪙 生成专属NFT
    </motion.button>
  );
}

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [randomWord, setRandomWord] = useState('');

  const handleDivine = () => {
    if (!name.trim() || !randomWord.trim()) return;
    router.push({ pathname: '/result', query: { name } });
  };

  return (
    <>
      <Head>
        <title>Color See See - Web3色彩占卜</title>
        <meta name="description" content="Web3色彩占卜，探索你的链上色彩人格" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-x-hidden px-2">
        {/* 霓虹主标题 */}
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold text-center mb-3 neon-glow bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_32px_#0ff] font-[Orbitron,PressStart2P,sans-serif]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Give You A Color See See
        </motion.h1>
        {/* 副标题 */}
        <motion.p
          className="text-lg md:text-2xl text-center text-cyan-200 font-bold mb-8 tracking-wide drop-shadow-[0_0_8px_#0ff] font-[Orbitron,PressStart2P,sans-serif]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Web3色彩占卜
        </motion.p>
        {/* 输入卡片（毛玻璃+霓虹边框） */}
        <motion.div
          className="glass-neon p-8 w-full max-w-2xl mx-auto flex flex-col items-center mb-10 z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="w-full flex flex-col md:flex-row gap-4 mb-5 justify-center">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入你的名字..."
              className="input-neon w-full"
              maxLength={16}
            />
            <input
              type="text"
              value={randomWord}
              onChange={e => setRandomWord(e.target.value)}
              placeholder="输入一个随机词语（比如：月亮）"
              className="input-neon w-full"
              maxLength={16}
            />
            <motion.button
              onClick={handleDivine}
              className="btn-neon w-full md:w-auto bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-purple-500 hover:to-cyan-400 text-white"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              disabled={!name.trim() || !randomWord.trim()}
            >
              🎯 开始占卜
            </motion.button>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full justify-center mt-2">
            <WalletConnect />
            <NFTEntry />
          </div>
        </motion.div>
        {/* 互动小游戏入口（毛玻璃霓虹卡片） */}
        <div className="flex flex-row gap-8 mb-8 mt-1 w-full max-w-3xl justify-center z-10">
          <Link href="/bubble">
            <motion.div
              className="glass-neon flex flex-col items-center justify-center px-8 py-8 rounded-2xl cursor-pointer group w-60 h-44 relative border-2 border-cyan-400/40 hover:border-cyan-400 shadow-lg hover:shadow-[0_0_32px_8px_#0ff8] transition-all"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-6xl mb-3 drop-shadow-[0_0_16px_#0ff]">🫧</span>
              <span className="text-2xl mb-1 font-[PressStart2P,Orbitron,sans-serif]">解压泡泡</span>
              <span className="text-xs text-cyan-100 mt-1 font-mono">链上戳爆压力</span>
            </motion.div>
          </Link>
          <Link href="/mokyu">
            <motion.div
              className="glass-neon flex flex-col items-center justify-center px-8 py-8 rounded-2xl cursor-pointer group w-60 h-44 relative border-2 border-pink-400/40 hover:border-pink-400 shadow-lg hover:shadow-[0_0_32px_8px_#f0f8] transition-all"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-6xl mb-3 drop-shadow-[0_0_16px_#f0f]">🥁</span>
              <span className="text-2xl mb-1 font-[PressStart2P,Orbitron,sans-serif]">敲木鱼</span>
              <span className="text-xs text-pink-100 mt-1 font-mono">链上敲一敲，佛系续命</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  );
}
