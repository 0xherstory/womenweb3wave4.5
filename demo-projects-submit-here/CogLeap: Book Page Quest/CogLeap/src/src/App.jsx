import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios'; // 引入 axios
import Header from './components/Header';
import PlayerProfile from './components/PlayerProfile';
import GameModes from './components/GameModes';
import Market from './components/Market';
import GameView from './components/GameView';
import BookLevelsModal from './components/BookLevelsModal';
import { 
  ARG_TOKEN_ADDRESS, 
  ARG_TOKEN_ABI,
  ACHIEVEMENT_NFT_ADDRESS,
  ACHIEVEMENT_NFT_ABI
} from './contracts/config.js';

// 后端 API 地址
const API_URL = 'http://localhost:3001';

const App = () => {
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 新增：视图管理状态
  const [activeLevel, setActiveLevel] = useState(null); // 新增：当前激活的关卡
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentScene, setCurrentScene] = useState(null); // New state for the game scene

  const initialPlayerData = {
    nickname: '认知探索者',
    tier: '青铜',
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

  // 封装的 API 请求函数
  const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
  });

  apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, error => Promise.reject(error));
  
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

  // 登录后或页面加载时验证身份并获取数据
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        let provider;
        if (window.onekey?.ethereum) provider = new ethers.BrowserProvider(window.onekey.ethereum);
        else if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
        else {
          console.log("无法找到钱包 provider");
          setPlayerData(initialPlayerData);
          return;
        }
        try {
          const currentSigner = await provider.getSigner();
          const address = await currentSigner.getAddress();
          setSigner(currentSigner);
          setWalletAddress(address);
          setIsAuthenticated(true);
          await fetchAllPlayerData(currentSigner, address);
        } catch(e) {
            console.error("自动登录并获取数据失败:", e);
            handleLogout();
        }
      } else {
        setPlayerData(initialPlayerData);
      }
    };
    checkAuthAndFetchData();
  }, []); // 仅在组件挂载时运行一次

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

  const handleLogin = async () => {
    let provider;
    if (window.onekey?.ethereum) provider = new ethers.BrowserProvider(window.onekey.ethereum);
    else if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
    else return alert("请安装 OneKey 或 MetaMask 钱包！");

    try {
      const currentSigner = await provider.getSigner();
      const address = await currentSigner.getAddress();
      
      const response = await apiClient.post(`/api/request-nonce`, { address });
      const messageToSign = response.data.message;

      const signature = await currentSigner.signMessage(messageToSign);

      const loginResponse = await apiClient.post(`/api/login`, { address, signature });
      
      const { token } = loginResponse.data;

      localStorage.setItem('jwtToken', token);
      setSigner(currentSigner);
      setWalletAddress(address);
      setIsAuthenticated(true);
      
      await fetchAllPlayerData(currentSigner, address);
      
    } catch (error) {
      console.error("登录失败:", error);
      alert("登录失败，详情请查看控制台。");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    setIsAuthenticated(false);
    setSigner(null);
    setWalletAddress(null);
    setPlayerData(initialPlayerData); // 重置玩家数据
    console.log('已退出登录。');
  };

  const isLastScene = selectedBook && currentScene ? (() => {
    const chapter = selectedBook.chapters.find(ch => 
      ch.scenes.some(s => s.id === currentScene.id)
    );
    if (!chapter) return true;
    const currentSceneIndex = chapter.scenes.findIndex(s => s.id === currentScene.id);
    return currentSceneIndex === chapter.scenes.length - 1;
  })() : false;

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
        />

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
            <PlayerProfile 
              playerData={playerData}
              onSaveNickname={handleNicknameSave}
              isAuthenticated={isAuthenticated}
              walletAddress={walletAddress}
            />
            </div>
          <div className="lg:col-span-2 space-y-8">
            <GameModes onBookSelect={handleBookSelect} />
              <Market />
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
    </>
  );
};

export default App;
