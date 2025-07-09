import React, { useState } from 'react';

const Header = ({ isAuthenticated, handleLogin, handleLogout, walletAddress, playerData, handleOpenDashboardModal, handleOpenThinkingToolsModal }) => {
  
  const getWalletStatus = () => {
    if (isAuthenticated && walletAddress) {
      return `已连接: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
    return "连接钱包";
  };

  return (
    <header className="flex justify-between items-center mb-10 relative">
      <div className="flex items-center">
        <div className="text-neon-blue text-shadow-neon text-3xl font-bold tracking-wider">
          认知跃迁<span className="text-neon-pink text-shadow-neon-pink">书页闯关录</span>
        </div>
        <div className="ml-4 px-3 py-1 bg-web3-primary/20 rounded-full border border-web3-primary/30 text-sm">
          <span className="text-web3-primary">WEB3</span> 版本
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="bg-dark-700 hover:bg-dark-800 px-4 py-2 rounded border border-neon-pink/30 transition-all duration-300 button-glow hover:button-glow/50 flex items-center"
          >
            <i className="fa fa-sign-out mr-2 text-neon-pink"></i>
            <span>断开连接</span>
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="bg-dark-700 hover:bg-dark-800 px-4 py-2 rounded border border-web3-primary/30 transition-all duration-300 button-glow-web3 hover:button-glow-web3/50 flex items-center"
          >
            <i className="fa fa-link mr-2 text-web3-primary"></i>
            <span>
              {isAuthenticated && walletAddress 
                ? `已连接: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "连接钱包"}
            </span>
          </button>
        )}

        <button 
          id="toolButton" 
          onClick={handleOpenThinkingToolsModal}
          disabled={!isAuthenticated}
          className={`bg-dark-700 hover:bg-dark-800 px-4 py-2 rounded border border-neon-blue/30 transition-all duration-300 button-glow-blue hover:button-glow-blue/50 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fa fa-wrench mr-2 text-neon-blue"></i>思维工具库
        </button>
        <button 
          id="rankButton" 
          onClick={handleOpenDashboardModal}
          disabled={!isAuthenticated}
          className={`bg-dark-700 hover:bg-dark-800 px-4 py-2 rounded border border-neon-pink/30 transition-all duration-300 button-glow hover:button-glow/50 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fa fa-trophy mr-2 text-neon-pink"></i>认知仪表盘
        </button>
        
        <div className="relative">
          <div id="profilePic" className="w-10 h-10 rounded-full bg-dark-700 border-2 border-neon-purple flex items-center justify-center overflow-hidden">
            <img 
              src={`https://api.dicebear.com/9.x/micah/png?seed=${encodeURIComponent(playerData?.avatarSeed || walletAddress || 'default-avatar-seed')}&hair=dannyPhantom,pixie,full&facialHairProbability=0`}
              alt="玩家头像"
              className="w-full h-full object-cover"
            />
          </div>
          {isAuthenticated && (
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full border border-dark-900"></div>
          )}
        </div>
      </div>
      
      {/* 顶部装饰线 */}
      <div className="absolute top-full left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent mt-2"></div>
    </header>
  );
};

export default Header; 