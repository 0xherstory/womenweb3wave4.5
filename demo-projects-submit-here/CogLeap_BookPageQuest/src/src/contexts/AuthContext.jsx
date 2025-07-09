import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import apiClient from '../utils/apiClient';

// 1. 创建 Context
const AuthContext = createContext(null);

// 2. 创建 Provider 组件
export const AuthProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // 添加加载状态以处理初始身份验证检查

  // 登录逻辑
  const handleLogin = async () => {
    let provider;
    if (window.onekey?.ethereum) provider = new ethers.BrowserProvider(window.onekey.ethereum);
    else if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
    else return alert("请安装 OneKey 或 MetaMask 钱包！");

    try {
      setLoading(true);
      const currentSigner = await provider.getSigner();
      const address = await currentSigner.getAddress();
      
      const nonceResponse = await apiClient.post(`/api/request-nonce`, { address });
      const { message } = nonceResponse.data;

      const signature = await currentSigner.signMessage(message);
      if (!signature) {
          setLoading(false);
          return;
      };

      const loginResponse = await apiClient.post(`/api/login`, { address, signature });
      
      if (loginResponse.data.token) {
        localStorage.setItem('token', loginResponse.data.token);
        setSigner(currentSigner);
        setWalletAddress(address);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("登录失败:", error);
      alert("登录失败，详情请查看控制台。");
    } finally {
        setLoading(false);
    }
  };

  // 登出逻辑
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setSigner(null);
    setWalletAddress(null);
    console.log('已退出登录。');
  };

  // 检查现有token以自动登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          let provider;
          if (window.onekey?.ethereum) provider = new ethers.BrowserProvider(window.onekey.ethereum);
          else if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
          else {
            console.log("无法找到钱包 provider");
            setLoading(false);
            return;
          }
          const currentSigner = await provider.getSigner();
          const address = await currentSigner.getAddress();
          setSigner(currentSigner);
          setWalletAddress(address);
          setIsAuthenticated(true);
        } catch (e) {
            console.error("自动登录失败:", e);
            handleLogout(); // 如果token无效或签名失败，则登出
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const value = {
    signer,
    walletAddress,
    isAuthenticated,
    loading,
    handleLogin,
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="fixed inset-0 bg-dark-900 flex flex-col items-center justify-center z-[100]">
          <div className="text-neon-blue text-2xl font-bold mb-4">正在连接区块链...</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// 3. 创建自定义 Hook
export const useAuth = () => {
  return useContext(AuthContext);
}; 