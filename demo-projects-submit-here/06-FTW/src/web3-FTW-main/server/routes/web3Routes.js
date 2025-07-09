const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const web3Service = require('../services/web3Service');
const campModel = require('../models/camp');
const challengeModel = require('../models/challenge');
const config = require('../config');

// 创建营地
router.post('/createCamp', async (req, res) => {
  try {
    const {
      name,
      signupDeadline,
      campEndDate,
      challengeCount,
      minParticipants,
      maxParticipants,
      depositAmount,
      privateKey
    } = req.body;
    
    // 验证必填字段
    if (!name || !signupDeadline || !campEndDate || !challengeCount || !minParticipants || !maxParticipants || !depositAmount || !privateKey) {
      return res.status(400).json({ success: false, message: '缺少必填字段' });
    }
    
    // 创建钱包实例
    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(config.rpcUrl));
    } catch (error) {
      return res.status(400).json({ success: false, message: '无效的私钥', error: error.message });
    }
    
    // 调用Web3服务创建营地
    const result = await web3Service.createCamp({
      name,
      signupDeadline,
      campEndDate,
      challengeCount,
      minParticipants,
      maxParticipants,
      depositAmount
    }, wallet);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '创建营地失败', error: result.error });
    }
    
    res.json({
      success: true,
      message: '营地创建成功',
      data: {
        transactionHash: result.transactionHash,
        campAddress: result.campAddress
      }
    });
  } catch (error) {
    console.error('创建营地失败:', error);
    res.status(500).json({ success: false, message: '创建营地失败', error: error.message });
  }
});

// 参与者报名
router.post('/register', async (req, res) => {
  try {
    const { campAddress, depositAmount, privateKey } = req.body;
    
    // 验证必填字段
    if (!campAddress || !depositAmount || !privateKey) {
      return res.status(400).json({ success: false, message: '缺少必填字段' });
    }
    
    // 验证地址格式
    if (!ethers.utils.isAddress(campAddress)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 创建钱包实例
    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(config.rpcUrl));
    } catch (error) {
      return res.status(400).json({ success: false, message: '无效的私钥', error: error.message });
    }
    
    // 调用Web3服务报名
    const result = await web3Service.register(campAddress, wallet, depositAmount);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '报名失败', error: result.error });
    }
    
    res.json({
      success: true,
      message: '报名成功',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('报名失败:', error);
    res.status(500).json({ success: false, message: '报名失败', error: error.message });
  }
});

// 检查并更新营地状态
router.post('/checkCampState', async (req, res) => {
  try {
    const { campAddress, privateKey } = req.body;
    
    // 验证必填字段
    if (!campAddress || !privateKey) {
      return res.status(400).json({ success: false, message: '缺少必填字段' });
    }
    
    // 验证地址格式
    if (!ethers.utils.isAddress(campAddress)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 创建钱包实例
    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(config.rpcUrl));
    } catch (error) {
      return res.status(400).json({ success: false, message: '无效的私钥', error: error.message });
    }
    
    // 调用Web3服务检查营地状态
    const result = await web3Service.checkCampState(campAddress, wallet);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '检查营地状态失败', error: result.error });
    }
    
    res.json({
      success: true,
      message: '检查营地状态成功',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('检查营地状态失败:', error);
    res.status(500).json({ success: false, message: '检查营地状态失败', error: error.message });
  }
});

// 配置关卡
router.post('/configChallenges', async (req, res) => {
  try {
    const { campAddress, deadlines, passwords, privateKey } = req.body;
    
    // 验证必填字段
    if (!campAddress || !deadlines || !passwords || !privateKey) {
      return res.status(400).json({ success: false, message: '缺少必填字段' });
    }
    
    // 验证地址格式
    if (!ethers.utils.isAddress(campAddress)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 验证数组长度一致
    if (deadlines.length !== passwords.length) {
      return res.status(400).json({ success: false, message: '截止时间和密码数组长度不一致' });
    }
    
    // 创建钱包实例
    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(config.rpcUrl));
    } catch (error) {
      return res.status(400).json({ success: false, message: '无效的私钥', error: error.message });
    }
    
    // 生成密码哈希
    const passwordHashes = passwords.map(password => web3Service.generatePasswordHash(password));
    
    // 调用Web3服务配置关卡
    const result = await web3Service.configChallenges(campAddress, deadlines, passwordHashes, wallet);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '配置关卡失败', error: result.error });
    }
    
    // 获取营地ID
    const camp = await campModel.getCampByContractAddress(campAddress);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }
    
    // 保存关卡信息到数据库
    const challengesData = deadlines.map((deadline, index) => ({
      campId: camp.id,
      challengeIndex: index,
      deadline,
      passwordHash: passwordHashes[index],
      state: campModel.ChallengeState.ACTIVE
    }));
    
    await challengeModel.createChallenges(challengesData);
    
    res.json({
      success: true,
      message: '配置关卡成功',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('配置关卡失败:', error);
    res.status(500).json({ success: false, message: '配置关卡失败', error: error.message });
  }
});

// 提交关卡密码
router.post('/submitChallengePassword', async (req, res) => {
  try {
    const { campAddress, challengeIndex, password, privateKey } = req.body;
    
    // 验证必填字段
    if (!campAddress || challengeIndex === undefined || !password || !privateKey) {
      return res.status(400).json({ success: false, message: '缺少必填字段' });
    }
    
    // 验证地址格式
    if (!ethers.utils.isAddress(campAddress)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 创建钱包实例
    let wallet;
    try {
      wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider(config.rpcUrl));
    } catch (error) {
      return res.status(400).json({ success: false, message: '无效的私钥', error: error.message });
    }
    
    // 调用Web3服务提交密码
    const result = await web3Service.submitChallengePassword(campAddress, challengeIndex, password, wallet);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '提交密码失败', error: result.error });
    }
    
    res.json({
      success: true,
      message: '提交密码成功',
      data: {
        transactionHash: result.transactionHash
      }
    });
  } catch (error) {
    console.error('提交密码失败:', error);
    res.status(500).json({ success: false, message: '提交密码失败', error: error.message });
  }
});

// 获取营地信息
router.get('/campInfo/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 调用Web3服务获取营地信息
    const result = await web3Service.getCampInfo(address);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '获取营地信息失败', error: result.error });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取营地信息失败:', error);
    res.status(500).json({ success: false, message: '获取营地信息失败', error: error.message });
  }
});

// 获取参与者信息
router.get('/participantInfo/:campAddress/:participantAddress', async (req, res) => {
  try {
    const { campAddress, participantAddress } = req.params;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(campAddress) || !ethers.utils.isAddress(participantAddress)) {
      return res.status(400).json({ success: false, message: '无效的地址' });
    }
    
    // 调用Web3服务获取参与者信息
    const result = await web3Service.getParticipantInfo(campAddress, participantAddress);
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '获取参与者信息失败', error: result.error });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取参与者信息失败:', error);
    res.status(500).json({ success: false, message: '获取参与者信息失败', error: error.message });
  }
});

// 获取关卡信息
router.get('/challengeInfo/:campAddress/:challengeIndex', async (req, res) => {
  try {
    const { campAddress, challengeIndex } = req.params;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(campAddress)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 调用Web3服务获取关卡信息
    const result = await web3Service.getChallengeInfo(campAddress, parseInt(challengeIndex));
    
    if (!result.success) {
      return res.status(500).json({ success: false, message: '获取关卡信息失败', error: result.error });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取关卡信息失败:', error);
    res.status(500).json({ success: false, message: '获取关卡信息失败', error: error.message });
  }
});

// 生成密码哈希（仅用于测试）
router.post('/generatePasswordHash', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ success: false, message: '缺少密码' });
    }
    
    const hash = web3Service.generatePasswordHash(password);
    
    res.json({
      success: true,
      data: {
        password,
        hash
      }
    });
  } catch (error) {
    console.error('生成密码哈希失败:', error);
    res.status(500).json({ success: false, message: '生成密码哈希失败', error: error.message });
  }
});

module.exports = router; 