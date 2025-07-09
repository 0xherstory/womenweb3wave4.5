import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CampFactoryABI from '../abis/CampFactory.json';
import CampABI from '../abis/CampImplementation.json';

// 创建上下文
const Web3Context = createContext();

// 合约地址
const FACTORY_ADDRESS = process.env.REACT_APP_FACTORY_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [factoryContract, setFactoryContract] = useState(null);
  const [campContracts, setCampContracts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 初始化Web3
  const initWeb3 = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 检查是否安装了MetaMask
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        
        // 获取网络ID
        const network = await provider.getNetwork();
        setNetworkId(network.chainId);
        
        // 初始化合约
        const factoryContract = new ethers.Contract(
          FACTORY_ADDRESS,
          CampFactoryABI,
          provider
        );
        setFactoryContract(factoryContract);
        
        // 检查是否已连接
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          setSigner(signer);
          setAccount(accounts[0]);
          setIsConnected(true);
        }
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        setLoading(false);
      } else {
        setError('请安装MetaMask钱包');
        setLoading(false);
      }
    } catch (error) {
      console.error('初始化Web3失败:', error);
      setError('初始化Web3失败: ' + error.message);
      setLoading(false);
    }
  };

  // 处理账户变化
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      if (provider) {
      setSigner(provider.getSigner());
      }
      setIsConnected(true);
    } else {
      setAccount(null);
      setSigner(null);
      setIsConnected(false);
    }
  };

  // 处理链变化
  const handleChainChanged = (chainId) => {
    window.location.reload();
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (window.ethereum) {
        // 如果 provider 为 null，先初始化一个
        if (!provider) {
          const newProvider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(newProvider);
          
          // 获取网络ID
          const network = await newProvider.getNetwork();
          setNetworkId(network.chainId);
          
          // 初始化合约
          const newFactoryContract = new ethers.Contract(
            FACTORY_ADDRESS,
            CampFactoryABI,
            newProvider
          );
          setFactoryContract(newFactoryContract);
        }
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const currentProvider = provider || new ethers.providers.Web3Provider(window.ethereum);
          const signer = currentProvider.getSigner();
          setSigner(signer);
          setAccount(accounts[0]);
          setIsConnected(true);
        }
        
        setLoading(false);
      } else {
        setError('请安装MetaMask钱包');
        setLoading(false);
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
      setError('连接钱包失败: ' + error.message);
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
  };

  // 获取营地合约实例
  const getCampContract = (campAddress) => {
    if (!provider) return null;
    
    if (!campContracts[campAddress]) {
      const contract = new ethers.Contract(
        campAddress,
        CampABI,
        signer || provider
      );
      setCampContracts(prev => ({ ...prev, [campAddress]: contract }));
      return contract;
    }
    
    return campContracts[campAddress];
  };

  // 创建营地
  const createCamp = async (params) => {
    try {
      if (!signer || !factoryContract) {
        throw new Error('未连接钱包或合约未初始化');
      }
      
      setLoading(true);
      setError(null);
      
      const connectedFactory = factoryContract.connect(signer);
      
      const tx = await connectedFactory.createCamp(
        params.name,
        params.signupDeadline,
        params.campEndDate,
        params.challengeCount,
        params.minParticipants,
        params.maxParticipants,
        params.depositAmount
      );
      
      const receipt = await tx.wait();
      
      console.log('交易收据:', receipt);
      console.log('事件列表:', receipt.events);
      
      // 从事件中获取新创建的营地地址
      const event = receipt.events.find(e => e.event === 'CampCreated');
      if (!event) {
        console.error('未找到CampCreated事件');
        throw new Error('未找到CampCreated事件');
      }
      
      console.log('CampCreated事件:', event);
      console.log('事件参数:', event.args);
      
      const campAddress = event.args.campAddress;
      console.log('新创建的营地地址:', campAddress);
      
      setLoading(false);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        campAddress
      };
    } catch (error) {
      console.error('创建营地失败:', error);
      setError('创建营地失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 参与者报名
  const register = async (campAddress, depositAmount) => {
    try {
      if (!signer) {
        throw new Error('未连接钱包');
      }
      
      setLoading(true);
      setError(null);
      
      const campContract = getCampContract(campAddress);
      
      const tx = await campContract.register({
        value: depositAmount
      });
      
      const receipt = await tx.wait();
      
      setLoading(false);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('报名失败:', error);
      setError('报名失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 检查并更新营地状态
  const checkCampState = async (campAddress) => {
    try {
      if (!signer) {
        throw new Error('未连接钱包');
      }
      
      setLoading(true);
      setError(null);
      
      const campContract = getCampContract(campAddress);
      
      const tx = await campContract.checkCampState();
      const receipt = await tx.wait();
      
      setLoading(false);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('检查营地状态失败:', error);
      setError('检查营地状态失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 配置关卡
  const configChallenges = async (campAddress, deadlines, passwordHashes) => {
    try {
      if (!signer) {
        throw new Error('未连接钱包');
      }
      
      setLoading(true);
      setError(null);
      
      const campContract = getCampContract(campAddress);
      
      const tx = await campContract.configChallenges(deadlines, passwordHashes);
      const receipt = await tx.wait();
      
      setLoading(false);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('配置关卡失败:', error);
      setError('配置关卡失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 提交关卡密码
  const submitChallengePassword = async (campAddress, challengeIndex, password) => {
    try {
      if (!signer) {
        throw new Error('未连接钱包');
      }
      
      setLoading(true);
      setError(null);
      
      const campContract = getCampContract(campAddress);
      
      const tx = await campContract.submitChallengePassword(challengeIndex, password);
      const receipt = await tx.wait();
      
      setLoading(false);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash
      };
    } catch (error) {
      console.error('提交密码失败:', error);
      setError('提交密码失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 生成密码哈希
  const generatePasswordHash = (password) => {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(password));
  };

  // 获取营地信息
  const getCampInfo = async (campAddress) => {
    try {
      if (!provider) {
        throw new Error('Web3未初始化');
      }
      
      setLoading(true);
      setError(null);
      
      const campContract = getCampContract(campAddress);
      
      const info = await campContract.getCampInfo();
      
      setLoading(false);
      
      return {
        success: true,
        data: {
          organizer: info._organizer,
          name: info._name,
          signupDeadline: info._signupDeadline.toNumber(),
          campEndDate: info._campEndDate.toNumber(),
          challengeCount: info._challengeCount,
          minParticipants: info._minParticipants,
          maxParticipants: info._maxParticipants,
          depositAmount: info._depositAmount.toString(),
          state: info._state,
          participantCount: info._participantCount,
          completedCount: info._completedCount
        }
      };
    } catch (error) {
      console.error('获取营地信息失败:', error);
      setError('获取营地信息失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 获取所有营地
  const getAllCamps = async () => {
    try {
      if (!provider || !factoryContract) {
        throw new Error('Web3未初始化');
      }
      
      setLoading(true);
      setError(null);
      
      const addresses = await factoryContract.getAllCamps();
      
      // 获取每个营地的详细信息
      const campsPromises = addresses.map(async (address) => {
        const campContract = getCampContract(address);
        const info = await campContract.getCampInfo();
        
        return {
          address,
          organizer: info._organizer,
          name: info._name,
          signupDeadline: info._signupDeadline.toNumber(),
          campEndDate: info._campEndDate.toNumber(),
          challengeCount: info._challengeCount,
          minParticipants: info._minParticipants,
          maxParticipants: info._maxParticipants,
          depositAmount: info._depositAmount.toString(),
          state: info._state,
          participantCount: info._participantCount,
          completedCount: info._completedCount
        };
      });
      
      const camps = await Promise.all(campsPromises);
      
      setLoading(false);
      
      return {
        success: true,
        data: camps
      };
    } catch (error) {
      console.error('获取所有营地失败:', error);
      setError('获取所有营地失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 获取用户创建的营地
  const getOrganizerCamps = async (address) => {
    try {
      if (!provider || !factoryContract) {
        throw new Error('Web3未初始化');
      }
      
      setLoading(true);
      setError(null);
      
      const targetAddress = address || account;
      if (!targetAddress) {
        throw new Error('未指定地址');
      }
      
      const addresses = await factoryContract.getOrganizerCamps(targetAddress);
      
      // 获取每个营地的详细信息
      const campsPromises = addresses.map(async (address) => {
        const campContract = getCampContract(address);
        const info = await campContract.getCampInfo();
        
        return {
          address,
          organizer: info._organizer,
          name: info._name,
          signupDeadline: info._signupDeadline.toNumber(),
          campEndDate: info._campEndDate.toNumber(),
          challengeCount: info._challengeCount,
          minParticipants: info._minParticipants,
          maxParticipants: info._maxParticipants,
          depositAmount: info._depositAmount.toString(),
          state: info._state,
          participantCount: info._participantCount,
          completedCount: info._completedCount
        };
      });
      
      const camps = await Promise.all(campsPromises);
      
      setLoading(false);
      
      return {
        success: true,
        data: camps
      };
    } catch (error) {
      console.error('获取用户创建的营地失败:', error);
      setError('获取用户创建的营地失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 获取用户参与的营地
  const getParticipantCamps = async (address) => {
    try {
      if (!provider || !factoryContract) {
        throw new Error('Web3未初始化');
      }
      
      setLoading(true);
      setError(null);
      
      const targetAddress = address || account;
      if (!targetAddress) {
        throw new Error('未指定地址');
      }
      
      const addresses = await factoryContract.getParticipantCamps(targetAddress);
      
      // 获取每个营地的详细信息
      const campsPromises = addresses.map(async (address) => {
        const campContract = getCampContract(address);
        const info = await campContract.getCampInfo();
        
        return {
          address,
          organizer: info._organizer,
          name: info._name,
          signupDeadline: info._signupDeadline.toNumber(),
          campEndDate: info._campEndDate.toNumber(),
          challengeCount: info._challengeCount,
          minParticipants: info._minParticipants,
          maxParticipants: info._maxParticipants,
          depositAmount: info._depositAmount.toString(),
          state: info._state,
          participantCount: info._participantCount,
          completedCount: info._completedCount
        };
      });
      
      const camps = await Promise.all(campsPromises);
      
      setLoading(false);
      
      return {
        success: true,
        data: camps
      };
    } catch (error) {
      console.error('获取用户参与的营地失败:', error);
      setError('获取用户参与的营地失败: ' + error.message);
      setLoading(false);
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 初始化
  useEffect(() => {
    initWeb3();
    
    return () => {
      // 清理事件监听
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // 上下文值
  const value = {
    provider,
    signer,
    account,
    networkId,
    isConnected,
    factoryContract,
    error,
    loading,
    connectWallet,
    disconnectWallet,
    createCamp,
    register,
    checkCampState,
    configChallenges,
    submitChallengePassword,
    generatePasswordHash,
    getCampInfo,
    getAllCamps,
    getOrganizerCamps,
    getParticipantCamps,
    getCampContract
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// 自定义Hook
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3必须在Web3Provider中使用');
  }
  return context;
};

export default Web3Context; 