const { ethers } = require('ethers');
const { run, currentTimestamp } = require('../models/db');
const campModel = require('../models/camp');
const participantModel = require('../models/participant');
const config = require('../config');
const challengeModel = require('../models/challenge');

// 合约ABI
const FactoryABI = require('../abis/CampFactory.json');
const CampABI = require('../abis/CampImplementation.json');

// 提供者和合约实例
let provider;
let campFactoryContract;
let campContracts = {};

// 初始化Web3提供者和合约
function initWeb3() {
  try {
    provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    campFactoryContract = new ethers.Contract(
      config.campFactoryAddress,
      FactoryABI,
      provider
    );
    
    console.log('Web3提供者和合约已初始化');
    return true;
  } catch (error) {
    console.error('初始化Web3失败:', error);
    return false;
  }
}

// 获取营地合约实例
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

// 记录事件日志
async function logEvent(contractAddress, eventName, txHash, blockNumber, logIndex, data) {
  const now = currentTimestamp();
  
  await run(
    `INSERT INTO event_logs (
      contract_address, event_name, transaction_hash, 
      block_number, log_index, data, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      contractAddress,
      eventName,
      txHash,
      blockNumber,
      logIndex,
      JSON.stringify(data),
      now
    ]
  );
}

// 处理CampCreated事件
async function handleCampCreated(event) {
  try {
    const { campAddress, organizer, name, signupDeadline, campEndDate, challengeCount, minParticipants, maxParticipants, depositAmount } = event.args;
    
    console.log(`新营地创建: ${campAddress} - ${name}`);
    
    // 保存到数据库
    await campModel.createCamp({
      contractAddress: campAddress,
      factoryAddress: config.campFactoryAddress,
      organizerAddress: organizer,
      name,
      signupDeadline: signupDeadline.toNumber(),
      campEndDate: campEndDate.toNumber(),
      challengeCount: challengeCount,
      minParticipants: minParticipants,
      maxParticipants: maxParticipants,
      depositAmount: depositAmount.toString()
    });
    
    // 记录事件日志
    await logEvent(
      config.campFactoryAddress,
      'CampCreated',
      event.transactionHash,
      event.blockNumber,
      event.logIndex,
      {
        campAddress,
        organizer,
        name,
        signupDeadline: signupDeadline.toNumber(),
        campEndDate: campEndDate.toNumber(),
        challengeCount,
        minParticipants,
        maxParticipants,
        depositAmount: depositAmount.toString()
      }
    );
    
    // 开始监听这个新营地的事件
    listenToCampEvents(campAddress);
  } catch (error) {
    console.error('处理CampCreated事件失败:', error);
  }
}

// 处理ParticipantJoined事件
async function handleParticipantJoined(event) {
  try {
    const { campAddress, participant, timestamp } = event.args;
    
    console.log(`参与者加入: ${participant} - 营地: ${campAddress}`);
    
    // 获取营地ID
    const camp = await campModel.getCampByContractAddress(campAddress);
    if (!camp) {
      console.error(`找不到营地: ${campAddress}`);
      return;
    }
    
    // 保存到数据库
    await participantModel.createParticipant({
      campId: camp.id,
      participantAddress: participant,
      state: campModel.ParticipantState.REGISTERED,
      registrationTime: timestamp.toNumber()
    });
    
    // 更新营地参与者数量
    await campModel.updateParticipantCount(campAddress, camp.participant_count + 1);
    
    // 记录事件日志
    await logEvent(
      config.campFactoryAddress,
      'ParticipantJoined',
      event.transactionHash,
      event.blockNumber,
      event.logIndex,
      {
        campAddress,
        participant,
        timestamp: timestamp.toNumber()
      }
    );
  } catch (error) {
    console.error('处理ParticipantJoined事件失败:', error);
  }
}

// 处理CampStateChanged事件
async function handleCampStateChanged(campAddress, event) {
  try {
    const { previousState, newState, timestamp } = event.args;
    
    console.log(`营地状态变更: ${campAddress} - 从 ${previousState} 到 ${newState}`);
    
    // 更新数据库中的营地状态
    await campModel.updateCampState(campAddress, newState);
    
    // 记录事件日志
    await logEvent(
      campAddress,
      'CampStateChanged',
      event.transactionHash,
      event.blockNumber,
      event.logIndex,
      {
        previousState: previousState,
        newState: newState,
        timestamp: timestamp.toNumber()
      }
    );
  } catch (error) {
    console.error('处理CampStateChanged事件失败:', error);
  }
}

// 处理ParticipantRegistered事件
async function handleParticipantRegistered(campAddress, event) {
  try {
    const { participant, depositAmount, timestamp } = event.args;
    
    console.log(`参与者注册: ${participant} - 营地: ${campAddress}`);
    
    // 获取营地ID
    const camp = await campModel.getCampByContractAddress(campAddress);
    if (!camp) {
      console.error(`找不到营地: ${campAddress}`);
      return;
    }
    
    // 检查参与者是否已存在
    const existingParticipant = await participantModel.getParticipant(camp.id, participant);
    if (!existingParticipant) {
      // 保存到数据库
      await participantModel.createParticipant({
        campId: camp.id,
        participantAddress: participant,
        state: campModel.ParticipantState.REGISTERED,
        registrationTime: timestamp.toNumber()
      });
      
      // 更新营地参与者数量
      await campModel.updateParticipantCount(campAddress, camp.participant_count + 1);
    }
    
    // 记录事件日志
    await logEvent(
      campAddress,
      'ParticipantRegistered',
      event.transactionHash,
      event.blockNumber,
      event.logIndex,
      {
        participant,
        depositAmount: depositAmount.toString(),
        timestamp: timestamp.toNumber()
      }
    );
  } catch (error) {
    console.error('处理ParticipantRegistered事件失败:', error);
  }
}

// 处理ChallengesConfigured事件
async function handleChallengesConfigured(campAddress, event) {
  try {
    const { challengeCount, timestamp } = event.args;
    
    console.log(`关卡配置完成: ${campAddress} - 关卡数: ${challengeCount}`);
    
    // 获取营地ID
    const camp = await campModel.getCampByContractAddress(campAddress);
    if (!camp) {
      console.error(`找不到营地: ${campAddress}`);
      return;
    }
    
    // 更新营地状态为闯关模式
    await campModel.updateCampState(campAddress, campModel.CampState.CHALLENGING);
    
    // 从智能合约获取关卡数据并保存到数据库
    const campContract = getCampContract(campAddress);
    const challengeModel = require('../models/challenge');
    
    for (let i = 0; i < challengeCount; i++) {
      try {
        const challengeData = await campContract.getChallengeInfo(i);
        const { deadline, state, completedCount } = challengeData;
        
        // 检查关卡是否已存在
        const existingChallenge = await challengeModel.getChallenge(camp.id, i);
        if (existingChallenge) {
          // 更新现有关卡的截止时间
          await challengeModel.updateChallenge(camp.id, i, {
            deadline: deadline.toNumber(),
            passwordHash: existingChallenge.password_hash, // 保持原有的密码哈希
            state: state
          });
          console.log(`更新关卡 ${i} 数据: 截止时间 ${new Date(deadline.toNumber() * 1000)}`);
        } else {
          // 创建新关卡（这种情况不应该发生，因为前端应该已经保存了）
          console.warn(`关卡 ${i} 在数据库中不存在，创建新记录`);
          await challengeModel.createChallenge({
            campId: camp.id,
            challengeIndex: i,
            deadline: deadline.toNumber(),
            passwordHash: '', // 密码哈希应该由前端保存
            state: state
          });
          console.log(`创建关卡 ${i} 数据: 截止时间 ${new Date(deadline.toNumber() * 1000)}`);
        }
      } catch (error) {
        console.error(`获取关卡 ${i} 数据失败:`, error);
      }
    }
    
    // 记录事件日志
    await logEvent(
      campAddress,
      'ChallengesConfigured',
      event.transactionHash,
      event.blockNumber,
      event.logIndex,
      {
        challengeCount: challengeCount,
        timestamp: timestamp.toNumber()
      }
    );
  } catch (error) {
    console.error('处理ChallengesConfigured事件失败:', error);
  }
}

// 处理ChallengeCompleted事件
async function handleChallengeCompleted(campAddress, event) {
  try {
    const { participant, challengeIndex, timestamp } = event.args;
    
    console.log(`关卡完成: ${campAddress} - 参与者: ${participant} - 关卡: ${challengeIndex}`);
    
    // 获取营地ID
    const camp = await campModel.getCampByContractAddress(campAddress);
    if (!camp) {
      console.error(`找不到营地: ${campAddress}`);
      return;
    }
    
    // 获取参与者ID
    const participantModel = require('../models/participant');
    const participantData = await participantModel.getParticipant(camp.id, participant);
    if (!participantData) {
      console.error(`找不到参与者: ${participant}`);
      return;
    }
    
    // 获取关卡ID
    const challengeModel = require('../models/challenge');
    const challenge = await challengeModel.getChallenge(camp.id, challengeIndex);
    if (!challenge) {
      console.error(`找不到关卡: ${challengeIndex}`);
      return;
    }
    
    // 记录关卡完成
    await challengeModel.recordChallengeCompletion(challenge.id, participantData.id);
    
    // 更新参与者已完成关卡数
    await participantModel.updateCompletedChallenges(participantData.id, challengeIndex + 1);
    
    // 记录事件日志
    await logEvent(
      campAddress,
      'ChallengeCompleted',
      event.transactionHash,
      event.blockNumber,
      event.logIndex,
      {
        participant,
        challengeIndex: challengeIndex,
        timestamp: timestamp.toNumber()
      }
    );
  } catch (error) {
    console.error('处理ChallengeCompleted事件失败:', error);
  }
}

// 监听工厂合约事件
function listenToFactoryEvents() {
  console.log('开始监听工厂合约事件...');
  
  // 监听CampCreated事件
  campFactoryContract.on('CampCreated', async (...args) => {
    try {
      // 在ethers.js v5中，最后一个参数是事件对象
      const event = args[args.length - 1];
      const [campAddress, organizer, name, signupDeadline, campEndDate, challengeCount, minParticipants, maxParticipants, depositAmount] = args.slice(0, -1);
      
      console.log('捕获到CampCreated事件:', { campAddress, organizer, name });
      await handleCampCreated({
        args: { campAddress, organizer, name, signupDeadline, campEndDate, challengeCount, minParticipants, maxParticipants, depositAmount },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      });
    } catch (error) {
      console.error('处理CampCreated事件时发生错误:', error);
    }
  });
  
  // 监听ParticipantJoined事件
  campFactoryContract.on('ParticipantJoined', (...args) => {
    try {
      const event = args[args.length - 1];
      const [campAddress, participant, timestamp] = args.slice(0, -1);
      
      console.log('捕获到ParticipantJoined事件:', { campAddress, participant });
      handleParticipantJoined({
        args: { campAddress, participant, timestamp },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      });
    } catch (error) {
      console.error('处理ParticipantJoined事件时发生错误:', error);
    }
  });
}

// 监听营地合约事件
function listenToCampEvents(campAddress) {
  console.log(`开始监听营地合约事件: ${campAddress}`);
  
  const campContract = getCampContract(campAddress);
  
  // 监听CampStateChanged事件
  campContract.on('CampStateChanged', (...args) => {
    try {
      const event = args[args.length - 1];
      const [previousState, newState, timestamp] = args.slice(0, -1);
      
      console.log('捕获到CampStateChanged事件:', { campAddress, previousState, newState });
      handleCampStateChanged(campAddress, {
        args: { previousState, newState, timestamp },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      });
    } catch (error) {
      console.error('处理CampStateChanged事件时发生错误:', error);
    }
  });
  
  // 监听ParticipantRegistered事件
  campContract.on('ParticipantRegistered', (...args) => {
    try {
      const event = args[args.length - 1];
      const [participant, depositAmount, timestamp] = args.slice(0, -1);
      
      console.log('捕获到ParticipantRegistered事件:', { campAddress, participant });
      handleParticipantRegistered(campAddress, {
        args: { participant, depositAmount, timestamp },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      });
    } catch (error) {
      console.error('处理ParticipantRegistered事件时发生错误:', error);
    }
  });
  
  // 监听ChallengesConfigured事件
  campContract.on('ChallengesConfigured', (...args) => {
    try {
      const event = args[args.length - 1];
      const [challengeCount, timestamp] = args.slice(0, -1);
      
      console.log('捕获到ChallengesConfigured事件:', { campAddress, challengeCount });
      handleChallengesConfigured(campAddress, {
        args: { challengeCount, timestamp },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      });
    } catch (error) {
      console.error('处理ChallengesConfigured事件时发生错误:', error);
    }
  });
  
  // 监听ChallengeCompleted事件
  campContract.on('ChallengeCompleted', (...args) => {
    try {
      const event = args[args.length - 1];
      const [participant, challengeIndex, timestamp] = args.slice(0, -1);
      
      console.log('捕获到ChallengeCompleted事件:', { campAddress, participant, challengeIndex });
      handleChallengeCompleted(campAddress, {
        args: { participant, challengeIndex, timestamp },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        logIndex: event.logIndex
      });
    } catch (error) {
      console.error('处理ChallengeCompleted事件时发生错误:', error);
    }
  });
  
  // 可以添加更多事件监听...
}

// 加载现有的营地并监听它们的事件
async function loadExistingCamps() {
  try {
    // 从数据库获取所有营地
    const camps = await campModel.getAllCamps();
    
    console.log(`加载 ${camps.length} 个现有营地...`);
    
    // 为每个营地启动事件监听
    for (const camp of camps) {
      listenToCampEvents(camp.contract_address);
    }
  } catch (error) {
    console.error('加载现有营地失败:', error);
  }
}

// 启动事件监听服务
async function start() {
  if (initWeb3()) {
    listenToFactoryEvents();
    await loadExistingCamps();
    console.log('事件监听服务已启动');
    return true;
  }
  return false;
}

// 停止事件监听服务
function stop() {
  if (campFactoryContract) {
    campFactoryContract.removeAllListeners();
  }
  
  for (const address in campContracts) {
    campContracts[address].removeAllListeners();
  }
  
  console.log('事件监听服务已停止');
}

module.exports = {
  start,
  stop,
  initWeb3,
  listenToFactoryEvents,
  listenToCampEvents
}; 