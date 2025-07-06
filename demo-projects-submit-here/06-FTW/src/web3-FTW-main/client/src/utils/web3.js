import { ethers } from 'ethers';

// Web3连接工具
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("没有找到MetaMask插件。请安装MetaMask以继续使用。");
    }

    // 请求账户访问
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    
    return {
      address: accounts[0],
      signer,
      networkId: network.chainId,
      isConnected: true
    };
  } catch (error) {
    console.error("连接钱包时出错:", error);
    throw error;
  }
};

// 检查钱包连接状态
export const checkWalletConnection = async () => {
  try {
    if (!window.ethereum) return { isConnected: false };
    
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      return {
        address: accounts[0],
        signer,
        networkId: network.chainId,
        isConnected: true
      };
    }
    
    return { isConnected: false };
  } catch (error) {
    console.error("检查钱包连接时出错:", error);
    return { isConnected: false };
  }
};

// 格式化地址显示
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// 监听钱包事件
export const setupWalletListeners = (handleAccountsChanged, handleChainChanged, handleDisconnect) => {
  if (!window.ethereum) return;
  
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  window.ethereum.on('chainChanged', handleChainChanged);
  window.ethereum.on('disconnect', handleDisconnect);
  
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    window.ethereum.removeListener('disconnect', handleDisconnect);
  };
}; 