import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from '../components/Navbar';
import '../styles/Home.scss';

const HomePage = () => {
  const navigate = useNavigate();
  const { isConnected, connect } = useWeb3();
  const { language } = useLanguage();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const valueTexts = [
    { en: "Focus Task Working", zh: "聚焦突破穿透万难" },
    { en: "Favorate Team Work", zh: "心选队友共筑星河" },
    { en: "Fight The World", zh: "为了对抗世界" },
    { en: "For The Women", zh: "为了女性团结" },
    { en: "For The Web3", zh: "为了web3的明天" },
    { en: "Finish To Win", zh: "为了完成挑战" },
    { en: "First To Win", zh: "为了赢一次" },
    { en: "For The Win", zh: "为了胜利" },
  ];
  
  const handleSquareBtnClick = async (path) => {
    if (!isConnected) {
      setWalletModalOpen(true);
    } else {
      // 如果是参加按钮，跳转到挑战营总览页面并默认筛选为"报名开始"状态
      if (path === '/camps') {
        navigate('/camps?filter=signup');
      } else {
        navigate(path);
      }
    }
  };
  
  const handleWalletOptionClick = async (walletType) => {
    try {
      await connect();
      setWalletModalOpen(false);
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };
  
  // 背景阶梯动画
  useEffect(() => {
    const handleMouseMove = (e) => {
      const stairs = document.querySelectorAll('.stair');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      stairs.forEach((stair, index) => {
        const moveX = (mouseX - 0.5) * 30 * (stairs.length - index) / stairs.length;
        const moveY = (mouseY - 0.5) * 30 * (stairs.length - index) / stairs.length;
        
        stair.style.transform = `translateX(calc(-50% + ${moveX}px)) translateY(${moveY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="home-container">
      <Navbar />
      
      {/* 阶梯背景 */}
      <div className="staircase-bg">
        {valueTexts.map((text, index) => (
          <div className="stair" key={index}>
            <div className="value-text">
              {language === 'zh' ? text.zh : text.en}
            </div>
          </div>
        ))}
      </div>
      
      {/* 主内容区 */}
      <div className="hero">
        <h1>{language === 'zh' ? "迎接挑战" : "F T W"}</h1>
        <p>
          {language === 'zh' 
            ? "———  在通往胜利的阶梯上留下你的足迹  ———" 
            : "—————————  Step into victory   —————————"}
        </p>
      </div>
      
      {/* 方形按钮 */}
      <div className="square-buttons">
        <div className="square-btn left" onClick={() => handleSquareBtnClick('/create-camp')}>
          <div className="icon left">
            <FontAwesomeIcon icon="flag" />
          </div>
          <h2 className="left">{language === 'zh' ? "发起" : "Create"}</h2>
        </div>
        
        <div className="square-btn right" onClick={() => handleSquareBtnClick('/camps')}>
          <div className="icon right">
            <FontAwesomeIcon icon="running" />
          </div>
          <h2 className="right">{language === 'zh' ? "参加" : "Join"}</h2>
        </div>
      </div>
      
      {/* 钱包连接弹窗 */}
      <div className={`wallet-modal ${walletModalOpen ? 'active' : ''}`}>
        <div className="modal-content">
          <h2>{language === 'zh' ? "连接钱包" : "Connect Wallet"}</h2>
          <p>{language === 'zh' ? "开始您的挑战之旅" : "Start your challenge journey"}</p>
          
          <div className="wallet-options">
            <div className="wallet-option" onClick={() => handleWalletOptionClick('metamask')}>
              <FontAwesomeIcon icon={["fab", "ethereum"]} />
              <h3>MetaMask</h3>
            </div>
            <div className="wallet-option" onClick={() => handleWalletOptionClick('walletconnect')}>
              <FontAwesomeIcon icon="wallet" />
              <h3>WalletConnect</h3>
            </div>
            <div className="wallet-option" onClick={() => handleWalletOptionClick('coinbase')}>
              <FontAwesomeIcon icon={["fab", "bitcoin"]} />
              <h3>Coinbase Wallet</h3>
            </div>
            <div className="wallet-option" onClick={() => handleWalletOptionClick('fortmatic')}>
              <FontAwesomeIcon icon="shield-alt" />
              <h3>Fortmatic</h3>
            </div>
          </div>
          
          <button className="close-btn" onClick={() => setWalletModalOpen(false)}>
            {language === 'zh' ? "关闭" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 