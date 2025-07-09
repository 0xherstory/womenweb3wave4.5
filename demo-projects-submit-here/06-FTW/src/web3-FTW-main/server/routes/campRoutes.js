const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const campModel = require('../models/camp');
const participantModel = require('../models/participant');
const challengeModel = require('../models/challenge');
const config = require('../config');

// 权限校验中间件: 检查是否为组织者
const checkNotOrganizer = async (req, res, next) => {
  try {
    const { address: campAddress } = req.params;
    // 从请求体或查询参数中获取用户地址
    const userAddress = req.body.userAddress || req.query.userAddress || req.body.participantAddress;

    if (!userAddress) {
      return res.status(400).json({ success: false, message: '缺少用户地址' });
    }

    const camp = await campModel.getCampByContractAddress(campAddress);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }

    if (camp.organizer_address.toLowerCase() === userAddress.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        message: '组织者不能参与自己创建的营地活动',
        error: 'ORGANIZER_CANNOT_PARTICIPATE'
      });
    }

    next();
  } catch (error) {
    console.error('权限校验失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
};

// 获取所有营地
router.get('/', async (req, res) => {
  try {
    const { state, sortBy, sortDirection, limit, offset } = req.query;
    
    const options = {
      state: state !== undefined ? parseInt(state) : undefined,
      sortBy,
      sortDirection,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };
    
    const camps = await campModel.getAllCamps(options);
    res.json({ success: true, data: camps });
  } catch (error) {
    console.error('获取营地列表失败:', error);
    res.status(500).json({ success: false, message: '获取营地列表失败', error: error.message });
  }
});

// 获取单个营地详情
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    const camp = await campModel.getCampByContractAddress(address);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }
    
    res.json({ success: true, data: camp });
  } catch (error) {
    console.error('获取营地详情失败:', error);
    res.status(500).json({ success: false, message: '获取营地详情失败', error: error.message });
  }
});

// 获取用户创建的营地
router.get('/organizer/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { state, sortBy, sortDirection, limit, offset } = req.query;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的地址' });
    }
    
    const options = {
      state: state !== undefined ? parseInt(state) : undefined,
      sortBy,
      sortDirection,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };
    
    const camps = await campModel.getCampsByOrganizer(address, options);
    res.json({ success: true, data: camps });
  } catch (error) {
    console.error('获取用户创建的营地失败:', error);
    res.status(500).json({ success: false, message: '获取用户创建的营地失败', error: error.message });
  }
});

// 获取用户参与的营地
router.get('/participant/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { state, sortBy, sortDirection, limit, offset } = req.query;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的地址' });
    }
    
    const options = {
      state: state !== undefined ? parseInt(state) : undefined,
      sortBy,
      sortDirection,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };
    
    const camps = await campModel.getCampsByParticipant(address, options);
    res.json({ success: true, data: camps });
  } catch (error) {
    console.error('获取用户参与的营地失败:', error);
    res.status(500).json({ success: false, message: '获取用户参与的营地失败', error: error.message });
  }
});

// 获取用户可参与的营地
router.get('/available/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { sortBy, sortDirection, limit, offset } = req.query;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的地址' });
    }
    
    const options = {
      sortBy,
      sortDirection,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };
    
    const camps = await campModel.getAvailableCamps(address, options);
    res.json({ success: true, data: camps });
  } catch (error) {
    console.error('获取可参与的营地失败:', error);
    res.status(500).json({ success: false, message: '获取可参与的营地失败', error: error.message });
  }
});

// 获取营地参与者
router.get('/:address/participants', async (req, res) => {
  try {
    const { address } = req.params;
    const { state, sortBy, sortDirection, limit, offset } = req.query;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    const camp = await campModel.getCampByContractAddress(address);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }
    
    const options = {
      state: state !== undefined ? parseInt(state) : undefined,
      sortBy,
      sortDirection,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    };
    
    const participants = await participantModel.getParticipantsByCampId(camp.id, options);
    res.json({ success: true, data: participants });
  } catch (error) {
    console.error('获取营地参与者失败:', error);
    res.status(500).json({ success: false, message: '获取营地参与者失败', error: error.message });
  }
});

// 获取营地关卡
router.get('/:address/challenges', async (req, res) => {
  try {
    const { address } = req.params;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    const camp = await campModel.getCampByContractAddress(address);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }
    
    const challenges = await challengeModel.getChallengesByCampId(camp.id);
    res.json({ success: true, data: challenges });
  } catch (error) {
    console.error('获取营地关卡失败:', error);
    res.status(500).json({ success: false, message: '获取营地关卡失败', error: error.message });
  }
});

// 保存营地关卡数据
router.post('/:address/challenges/save', async (req, res) => {
  try {
    const { address } = req.params;
    const { challenges } = req.body;
    
    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的合约地址' });
    }
    
    // 验证请求数据
    if (!challenges || !Array.isArray(challenges)) {
      return res.status(400).json({ success: false, message: '无效的关卡数据' });
    }
    
    const camp = await campModel.getCampByContractAddress(address);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }
    
    // 批量保存关卡数据
    const challengeModel = require('../models/challenge');
    const savedChallenges = [];
    
    for (const challenge of challenges) {
      const { challengeIndex, deadline, passwordHash } = challenge;
      
      // 检查是否已存在
      const existingChallenge = await challengeModel.getChallenge(camp.id, challengeIndex);
      if (existingChallenge) {
        // 更新现有关卡
        await challengeModel.updateChallenge(camp.id, challengeIndex, {
          deadline: deadline,
          passwordHash: passwordHash,
          state: 1 // ACTIVE状态
        });
      } else {
        // 创建新关卡
        await challengeModel.createChallenge({
          campId: camp.id,
          challengeIndex: challengeIndex,
          deadline: deadline,
          passwordHash: passwordHash,
          state: 1 // ACTIVE状态
        });
      }
      
      savedChallenges.push({ challengeIndex, deadline, passwordHash });
    }
    
    console.log(`保存了 ${savedChallenges.length} 个关卡数据到数据库`);
    res.json({ success: true, data: savedChallenges });
  } catch (error) {
    console.error('保存营地关卡失败:', error);
    res.status(500).json({ success: false, message: '保存营地关卡失败', error: error.message });
  }
});

// 未来可能添加的提交挑战答案的路由，预先添加权限校验
router.post('/:address/challenges/submit', checkNotOrganizer, async (req, res) => {
  // 具体的业务逻辑...
  // 示例:
  res.json({ success: true, message: '答案提交成功 (示例)' });
});

// 创建营地（仅用于测试，实际应通过合约创建）
router.post('/', async (req, res) => {
  try {
    const {
      contractAddress,
      factoryAddress,
      organizerAddress,
      name,
      signupDeadline,
      campEndDate,
      challengeCount,
      minParticipants,
      maxParticipants,
      depositAmount
    } = req.body;
    
    // 验证必填字段
    if (!contractAddress || !organizerAddress || !name || !signupDeadline || !campEndDate) {
      return res.status(400).json({ success: false, message: '缺少必填字段' });
    }
    
    // 验证地址格式
    if (!ethers.utils.isAddress(contractAddress) || !ethers.utils.isAddress(organizerAddress)) {
      return res.status(400).json({ success: false, message: '无效的地址格式' });
    }
    
    // 检查是否已存在
    const existingCamp = await campModel.getCampByContractAddress(contractAddress);
    if (existingCamp) {
      return res.status(409).json({ success: false, message: '营地已存在' });
    }
    
    const camp = await campModel.createCamp({
      contractAddress,
      factoryAddress: factoryAddress || config.campFactoryAddress,
      organizerAddress,
      name,
      signupDeadline,
      campEndDate,
      challengeCount,
      minParticipants,
      maxParticipants,
      depositAmount
    });
    
    res.status(201).json({ success: true, data: camp });
  } catch (error) {
    console.error('创建营地失败:', error);
    res.status(500).json({ success: false, message: '创建营地失败', error: error.message });
  }
});

// 更新营地状态
router.put('/:address/status', async (req, res) => {
  try {
    const { address } = req.params;
    const { status } = req.body;

    // 验证地址格式
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ success: false, message: '无效的地址格式' });
    }

    // 获取营地信息
    const camp = await campModel.getCampByContractAddress(address);
    if (!camp) {
      return res.status(404).json({ success: false, message: '找不到营地' });
    }

    // 验证状态转换的合法性
    const validTransitions = {
      'signup': ['failed', 'success'],
      'success': ['fighting'],
      'fighting': ['ended'],
      'failed': [],
      'ended': []
    };

    if (!validTransitions[camp.status]?.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: '非法的状态转换',
        error: 'INVALID_STATUS_TRANSITION'
      });
    }

    // 更新营地状态
    await campModel.updateCampStatus(address, status);

    // 如果状态变为失败，自动处理退款逻辑
    if (status === 'failed') {
      // 获取所有参与者
      const participants = await participantModel.getParticipantsByCampAddress(address);
      
      // 更新所有参与者状态为已退款
      for (const participant of participants) {
        await participantModel.updateParticipantRefundStatus(
          address,
          participant.participant_address,
          true
        );
      }
    }

    res.json({ success: true, message: '营地状态已更新' });
  } catch (error) {
    console.error('更新营地状态失败:', error);
    res.status(500).json({ success: false, message: '更新营地状态失败', error: error.message });
  }
});

module.exports = router; 