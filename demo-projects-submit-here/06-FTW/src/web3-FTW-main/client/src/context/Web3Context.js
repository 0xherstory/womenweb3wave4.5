// 这是一个桥接文件，重新导出复数形式的 Web3Context
// 所有导入单数形式 '../context/Web3Context' 的文件都会使用复数形式的 Web3Context

import React from 'react';
import { Web3Provider as OriginalWeb3Provider, useWeb3 as originalUseWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import CampImplementation from '../abis/CampImplementation.json';

// 适配层，将 connectWallet 映射为 connect
export const Web3Provider = ({ children }) => {
  return (
    <OriginalWeb3Provider>
      {children}
    </OriginalWeb3Provider>
  );
};

// 适配 useWeb3 钩子，将 connectWallet 映射为 connect
export const useWeb3 = () => {
  const originalContext = originalUseWeb3();
  
  /**
   * 加入营地
   * @param {string} campAddress - 营地合约地址
   * @param {string} deposit - 所需押金 (in Ether)
   * @returns {Promise<Object>} - 交易结果
   */
  const joinCamp = async (campAddress, deposit) => {
    if (!originalContext.provider || !originalContext.address) {
      return { success: false, message: '钱包未连接' };
    }

    try {
      const campContract = new ethers.Contract(campAddress, CampImplementation.abi, originalContext.provider.getSigner());
      const depositInWei = ethers.utils.parseEther(deposit.toString());

      const tx = await campContract.join({
        value: depositInWei
      });

      const receipt = await tx.wait();
      return { success: true, receipt };
    } catch (error) {
      console.error('加入营地失败:', error);
      let message = '加入营地失败';
      if (error.code === 4001) {
        message = '用户拒绝了交易';
      } else if (error.reason) {
        message = `交易失败: ${error.reason}`;
      }
      return { success: false, message, error };
    }
  };

  // 创建一个新的对象，包含原始上下文的所有属性
  const adaptedContext = {
    ...originalContext,
    // 将 connectWallet 映射为 connect，并确保 provider 已初始化
    connect: async () => {
      try {
        // 如果 provider 为 null，先初始化一个
        if (!originalContext.provider && window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            return {
              address: accounts[0],
              signer,
              isConnected: true
            };
          }
        }
        
        // 如果 provider 已存在，调用原始的 connectWallet 方法
        return await originalContext.connectWallet();
      } catch (error) {
        console.error('连接钱包失败:', error);
        throw error;
      }
    },
    // 将 disconnectWallet 映射为 disconnect
    disconnect: originalContext.disconnectWallet,
    // 添加 joinCamp 方法
    joinCamp,
  };
  
  return adaptedContext;
}; 