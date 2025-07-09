import React from 'react';
import Link from 'next/link';

const WORD_LIBRARY = [
  '链上摸鱼',
  '钱包余额+1000',
  'FOMO警告',
  'NFT还没到',
  'Gas费降低',
  'web3续命',
  '链上佛系',
  'DAO开会',
  '元宇宙掉线',
  '撸空投',
  '链上躺平',
  '钱包见底',
  '链上emo',
  '链上乐观',
  '链上打工人'
];

const Mokyu = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        color: '#fff',
        textShadow: '0 0 16px #0ff, 0 0 32px #f0f'
      }}>
        🥁 链上敲木鱼
      </h1>
      <p style={{
        color: '#0ff',
        margin: '1rem 0 2rem 0',
        fontWeight: 'bold'
      }}>
        链上敲一敲，烦恼都跑路，web3续命！
      </p>
      <div
        style={{
          fontSize: '7rem',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
        title="点击敲木鱼"
      >
        🥁
      </div>
      <div style={{
        color: '#fff',
        fontSize: '1.2rem',
        marginBottom: '2rem'
      }}>
        
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link href="/">
          <button style={{
            padding: '0.7rem 2rem',
            borderRadius: '1rem',
            background: 'linear-gradient(90deg,#ffe066,#f783ac)',
            color: '#222',
            fontWeight: 'bold',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            🏠 返回首页
          </button>
        </Link>
        <Link href="/bubble">
          <button style={{
            padding: '0.7rem 2rem',
            borderRadius: '1rem',
            background: 'linear-gradient(90deg,#63e6be,#5f5fc4)',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            🫧 解压泡泡
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Mokyu;