const { ethers } = require('ethers');
const config = require('../config');
const db = require('../models/db');

// 合约ABI
const FactoryABI = require('../abis/CampFactory.json');
const CampABI = require('../abis/CampImplementation.json');

// 提供者和合约实例
let provider;
let campFactoryContract;
let campContracts = {};

/**
 * 初始化Web3提供者和合约
 */
function init() {
  try {
    provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    campFactoryContract = new ethers.Contract(
      config.campFactoryAddress,
      FactoryABI,
      provider
    );
    
    console.log('Web3服务已初始化');
    return true;
  } catch (error) {
    console.error('初始化Web3服务失败:', error);
    return false;
  }
}

/**
 * 获取营地合约实例
 * @param {string} campAddress 营地合约地址
 * @returns {ethers.Contract} 合约实例
 */
function getCampContract(campAddress) {
  if (!campContracts[campAddress]) {
    campContracts[campAddress] = new ethers.Contract(
      campAddress,
      CampABI,
      provider
    );
  }
  return campContracts[campAddress];
}

/**
 * 创建新营地
 * @param {Object} params 创建参数
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function createCamp(params, wallet) {
  try {
    const connectedFactory = campFactoryContract.connect(wallet);
    
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
    
    // 从事件中获取新创建的营地地址
    const event = receipt.events.find(e => e.event === 'CampCreated');
    const campAddress = event.args.campAddress;
    
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      campAddress
    };
  } catch (error) {
    console.error('创建营地失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 参与者报名
 * @param {string} campAddress 营地合约地址
 * @param {ethers.Wallet} wallet 钱包实例
 * @param {string} depositAmount 押金金额
 * @returns {Promise<Object>} 交易结果
 */
async function register(campAddress, wallet, depositAmount) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.register({
      value: depositAmount
    });
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('报名失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查并更新营地状态
 * @param {string} campAddress 营地合约地址
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function checkCampState(campAddress, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.checkCampState();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('检查营地状态失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 配置关卡
 * @param {string} campAddress 营地合约地址
 * @param {Array<number>} deadlines 截止时间数组
 * @param {Array<string>} passwordHashes 密码哈希数组
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function configChallenges(campAddress, deadlines, passwordHashes, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.configChallenges(deadlines, passwordHashes);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('配置关卡失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 提交关卡密码
 * @param {string} campAddress 营地合约地址
 * @param {number} challengeIndex 关卡索引
 * @param {string} password 密码
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function submitChallengePassword(campAddress, challengeIndex, password, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.submitChallengePassword(challengeIndex, password);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('提交密码失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新关卡状态
 * @param {string} campAddress 营地合约地址
 * @param {number} challengeIndex 关卡索引
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function updateChallengeState(campAddress, challengeIndex, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.updateChallengeState(challengeIndex);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('更新关卡状态失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查营地是否应该结营
 * @param {string} campAddress 营地合约地址
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function checkCampCompletion(campAddress, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.checkCampCompletion();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('检查营地完成状态失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 提取押金（开营失败时）
 * @param {string} campAddress 营地合约地址
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function withdrawDepositOnFailure(campAddress, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.withdrawDepositOnFailure();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('提取押金失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 批量退还押金（开营失败时，组织者操作）
 * @param {string} campAddress 营地合约地址
 * @param {Array<string>} participants 参与者地址数组
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function batchRefundDeposits(campAddress, participants, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.batchRefundDeposits(participants);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('批量退还押金失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 提取押金（成功完成所有关卡后）
 * @param {string} campAddress 营地合约地址
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function withdrawDepositOnCompletion(campAddress, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.withdrawDepositOnCompletion();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('提取押金失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 罚没押金（组织者操作）
 * @param {string} campAddress 营地合约地址
 * @param {ethers.Wallet} wallet 钱包实例
 * @returns {Promise<Object>} 交易结果
 */
async function forfeitDeposits(campAddress, wallet) {
  try {
    const campContract = getCampContract(campAddress).connect(wallet);
    
    const tx = await campContract.forfeitDeposits();
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('罚没押金失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取营地信息
 * @param {string} campAddress 营地合约地址
 * @returns {Promise<Object>} 营地信息
 */
async function getCampInfo(campAddress) {
  try {
    const campContract = getCampContract(campAddress);
    
    const info = await campContract.getCampInfo();
    
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
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取参与者信息
 * @param {string} campAddress 营地合约地址
 * @param {string} participantAddress 参与者地址
 * @returns {Promise<Object>} 参与者信息
 */
async function getParticipantInfo(campAddress, participantAddress) {
  try {
    const campContract = getCampContract(campAddress);
    
    const info = await campContract.getParticipantInfo(participantAddress);
    
    return {
      success: true,
      data: {
        state: info._state,
        completedChallenges: info._completedChallenges,
        registrationTime: info._registrationTime.toNumber(),
        challengesCompleted: info._challengesCompleted
      }
    };
  } catch (error) {
    console.error('获取参与者信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取关卡信息
 * @param {string} campAddress 营地合约地址
 * @param {number} challengeIndex 关卡索引
 * @returns {Promise<Object>} 关卡信息
 */
async function getChallengeInfo(campAddress, challengeIndex) {
  try {
    const campContract = getCampContract(campAddress);
    
    const info = await campContract.getChallengeInfo(challengeIndex);
    
    return {
      success: true,
      data: {
        deadline: info._deadline.toNumber(),
        state: info._state,
        completedCount: info._completedCount
      }
    };
  } catch (error) {
    console.error('获取关卡信息失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取合约余额
 * @param {string} campAddress 营地合约地址
 * @returns {Promise<Object>} 余额信息
 */
async function getBalance(campAddress) {
  try {
    const campContract = getCampContract(campAddress);
    
    const balance = await campContract.getBalance();
    
    return {
      success: true,
      data: {
        balance: balance.toString()
      }
    };
  } catch (error) {
    console.error('获取合约余额失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 生成密码哈希
 * @param {string} password 密码原文
 * @returns {string} 密码哈希
 */
function generatePasswordHash(password) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(password));
}

module.exports = {
  init,
  createCamp,
  register,
  checkCampState,
  configChallenges,
  submitChallengePassword,
  updateChallengeState,
  checkCampCompletion,
  withdrawDepositOnFailure,
  batchRefundDeposits,
  withdrawDepositOnCompletion,
  forfeitDeposits,
  getCampInfo,
  getParticipantInfo,
  getChallengeInfo,
  getBalance,
  generatePasswordHash
}; 