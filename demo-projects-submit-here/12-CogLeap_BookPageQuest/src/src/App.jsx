import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from './contexts/AuthContext'; // 引入 useAuth
import axios from 'axios'; // 引入 axios
import Header from './components/Header';
import PlayerProfile from './components/PlayerProfile';
import GameModes from './components/GameModes';
import Market from './components/Market';
import GameView from './components/GameView';
import BookLevelsModal from './components/BookLevelsModal';
import DashboardModal from './components/DashboardModal';
import InfoCard from './components/InfoCard'; // 引入新组件
import ThinkingToolsModal from './components/ThinkingToolsModal'; // 引入新组件
import apiClient from './utils/apiClient'; // 引入 apiClient
import { 
  ARG_TOKEN_ADDRESS, 
  ARG_TOKEN_ABI,
  ACHIEVEMENT_NFT_ADDRESS,
  ACHIEVEMENT_NFT_ABI
} from './contracts/config.js';

// 后端 API 地址
const API_URL = 'http://localhost:3001';

const App = () => {
  const { signer, walletAddress, isAuthenticated, handleLogin, handleLogout } = useAuth(); // 使用 AuthContext

  // App 自身的 state
  const [playerData, setPlayerData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeLevel, setActiveLevel] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [isThinkingToolsModalOpen, setIsThinkingToolsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaign'); // 将 activeTab 状态提升到 App.jsx
  
  const initialPlayerData = {
    nickname: '认知探索者',
    tier: '零维窥探者',
    winRate: 0,
    tokens: 0,
    nfts: 0,
    skills: {
      '演绎推理': 0, '归纳总结': 0, '类比应用': 0, '批判性思维': 0, '逻辑一致性': 0,
    },
    communityStats: {
        activeUsers: '12,458', submittedTactics: '3,872', discussionThreads: '15,209', mintedNfts: '8,731',
    }
  };
  
  // 获取并合并链上和链下数据
  const fetchAllPlayerData = async (currentSigner, address) => {
    try {
      const profileResponse = await apiClient.get('/api/profile');
      const offChainProfile = profileResponse.data;

      const argTokenContract = new ethers.Contract(ARG_TOKEN_ADDRESS, ARG_TOKEN_ABI, currentSigner);
      const nftContract = new ethers.Contract(ACHIEVEMENT_NFT_ADDRESS, ACHIEVEMENT_NFT_ABI, currentSigner);

      const argBalanceBigInt = await argTokenContract.balanceOf(address);
      const nftBalanceBigInt = await nftContract.balanceOf(address);
      
      const onChainData = {
          argTokens: parseFloat(ethers.formatUnits(argBalanceBigInt, 18)),
          nfts: Number(nftBalanceBigInt)
      };

      setPlayerData(prevData => ({
        ...initialPlayerData,
        ...prevData,
        ...offChainProfile,
        ...onChainData,
        // 后端返回的数据可能没有skills，需要保留
        skills: offChainProfile.skills || initialPlayerData.skills, 
      }));

    } catch (error) {
      console.error("获取玩家数据失败:", error);
      if (error.response && error.response.status === 404) {
         console.log("后端未找到用户资料，使用初始数据。");
         setPlayerData(initialPlayerData);
      }
    }
  };

  // 监听认证状态变化以获取数据或重置
  useEffect(() => {
    if (isAuthenticated && signer && walletAddress) {
      fetchAllPlayerData(signer, walletAddress);
    } else {
      setPlayerData(initialPlayerData);
    }
  }, [isAuthenticated, signer, walletAddress]);

  const handleOpenDashboardModal = () => {
    if (isAuthenticated) {
      setIsDashboardModalOpen(true);
    }
  };

  const handleCloseDashboardModal = () => setIsDashboardModalOpen(false);

  const handleLevelSelect = (level) => {
    if (isModalOpen) {
      setIsModalOpen(false);
    }
    setSelectedLevel(level);
    setIsModalOpen(true);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleSceneSelect = (scene) => {
    setCurrentScene(scene);
    setIsModalOpen(false);
  };
  
  const handleExitGame = () => {
    setCurrentScene(null);
    setIsModalOpen(true);
  };

  const handleNextScene = () => {
    if (!selectedBook || !currentScene) return;
    const chapter = selectedBook.chapters.find(ch => 
      ch.scenes.some(s => s.id === currentScene.id)
    );
    if (!chapter) return;
    const currentSceneIndex = chapter.scenes.findIndex(s => s.id === currentScene.id);
    if (currentSceneIndex > -1 && currentSceneIndex < chapter.scenes.length - 1) {
      const nextScene = chapter.scenes[currentSceneIndex + 1];
      setCurrentScene(nextScene);
    } else {
      handleExitGame(); // It's the last scene, go back to chapter list
    }
  };
  
  const handleStartChallenge = (level) => {
    setActiveLevel(level);
    setCurrentView('game');
    closeModal(); // 关闭弹窗
  };

  const handleGameEnd = () => {
    setActiveLevel(null);
    setCurrentView('dashboard');
  };

  const handleProfileUpdate = (updatedData) => {
    setPlayerData(prevData => ({ ...prevData, ...updatedData }));
  };

  const handleNicknameSave = async (newNickname) => {
    if (!isAuthenticated) return;
    try {
        const response = await apiClient.post('/api/profile', { nickname: newNickname });
        handleProfileUpdate(response.data);
    } catch(error) {
        console.error("更新个人资料失败:", error);
    }
  };

  const isLastScene = selectedBook && currentScene ? (() => {
    const chapter = selectedBook.chapters.find(ch => 
      ch.scenes.some(s => s.id === currentScene.id)
    );
    if (!chapter) return true;
    const currentSceneIndex = chapter.scenes.findIndex(s => s.id === currentScene.id);
    return currentSceneIndex === chapter.scenes.length - 1;
  })() : false;

  const handleOpenThinkingToolsModal = () => {
    if (isAuthenticated) {
      setIsThinkingToolsModalOpen(true);
    }
  };

  const handleCloseThinkingToolsModal = () => setIsThinkingToolsModalOpen(false);

  return (
    <>
      {/* Background Glows from CognitiveLeap.html */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00FFFF]/20 rounded-full filter blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF00FF]/20 rounded-full filter blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#8A4FFF]/20 rounded-full filter blur-[110px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        <Header 
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          walletAddress={walletAddress}
          playerData={playerData}
          handleOpenDashboardModal={handleOpenDashboardModal}
          handleOpenThinkingToolsModal={handleOpenThinkingToolsModal}
        />

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-fit sticky top-8 space-y-8">
            <PlayerProfile 
              playerData={playerData}
              onSaveNickname={handleNicknameSave}
              isAuthenticated={isAuthenticated}
              walletAddress={walletAddress}
            />
              <InfoCard />
            </div>
          <div className="lg:col-span-2 space-y-8">
            <GameModes 
              onBookSelect={handleBookSelect} 
              account={walletAddress}
              isAuthenticated={isAuthenticated}
              playerData={playerData}
              activeTab={activeTab} // 传递 activeTab
              setActiveTab={setActiveTab} // 传递 setActiveTab
            />
            {activeTab !== 'community' && <Market isAuthenticated={isAuthenticated} />}
            </div>
          </main>
      </div>

      {isModalOpen && (
        <BookLevelsModal 
          book={selectedBook}
          onClose={handleCloseModal}
          onSelectLevel={handleSceneSelect}
          />
        )}
        
      {currentScene && (
        <GameView 
          scene={currentScene}
          book={selectedBook}
          onExit={handleExitGame}
          setIsModalOpen={setIsModalOpen}
          onNextScene={handleNextScene}
          isLastScene={isLastScene}
        />
      )}

      {isDashboardModalOpen && (
        <DashboardModal 
          isOpen={isDashboardModalOpen} 
          onClose={handleCloseDashboardModal} 
          playerData={playerData} 
        />
      )}

      {isThinkingToolsModalOpen && (
        <ThinkingToolsModal 
          isOpen={isThinkingToolsModalOpen} 
          onClose={handleCloseThinkingToolsModal} 
        />
      )}
    </>
  );
};

export default App;
