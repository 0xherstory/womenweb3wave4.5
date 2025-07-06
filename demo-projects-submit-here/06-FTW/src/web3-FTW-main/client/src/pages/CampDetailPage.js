import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faRunning, faCoins, faHandHoldingUsd, faPlay, faCheck, faLock, faExclamationTriangle, faCheckCircle, faClock, faUserPlus, faSpinner, faFlagCheckered } from '@fortawesome/free-solid-svg-icons';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import '../styles/CampDetail.scss';

// 引入FontAwesome图标库
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faArrowLeft, faRunning, faCoins, faHandHoldingUsd, faPlay, faCheck, faLock, faExclamationTriangle, faCheckCircle, faClock, faUserPlus, faSpinner, faFlagCheckered);

// 营地状态枚举
const CAMP_STATUS = {
  SIGNUP: 'signup',      // 报名中
  FAILED: 'failed',      // 开营失败
  SUCCESS: 'success',    // 开营成功
  FIGHTING: 'fighting',  // 闯关中
  ENDED: 'ended'        // 已结束
};

// 状态转换函数
const getStatusFromState = (state) => {
  switch (state) {
    case 0: return CAMP_STATUS.SIGNUP;
    case 1: return CAMP_STATUS.FAILED;
    case 2: return CAMP_STATUS.SUCCESS;
    case 3: return CAMP_STATUS.FIGHTING;
    case 4: return CAMP_STATUS.ENDED;
    default: return CAMP_STATUS.SIGNUP;
  }
};

// 获取状态显示文本
const getStatusText = (status, language) => {
  switch (status) {
    case CAMP_STATUS.SIGNUP:
      return language === 'zh' ? "报名进行中" : "Registration Open";
    case CAMP_STATUS.FAILED:
      return language === 'zh' ? "开营失败" : "Camp Failed";
    case CAMP_STATUS.SUCCESS:
      return language === 'zh' ? "开营成功" : "Camp Started";
    case CAMP_STATUS.FIGHTING:
      return language === 'zh' ? "闯关中" : "Challenge Mode";
    case CAMP_STATUS.ENDED:
      return language === 'zh' ? "已结束" : "Camp Ended";
    default:
      return language === 'zh' ? "未知状态" : "Unknown Status";
  }
};

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case CAMP_STATUS.SIGNUP:
      return 'status-signup';
    case CAMP_STATUS.FAILED:
      return 'status-failed';
    case CAMP_STATUS.SUCCESS:
      return 'status-success';
    case CAMP_STATUS.FIGHTING:
      return 'status-fighting';
    case CAMP_STATUS.ENDED:
      return 'status-ended';
    default:
      return '';
  }
};

const CampDetailPage = () => {
  const { language } = useLanguage();
  const { campId } = useParams();
  const { isConnected, account, register } = useWeb3();
  
  const [camp, setCamp] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'join', 'refund', 'start', 'challenge', 'penalty'
    title: '',
    text: '',
    isLoading: false,
    isError: false,
    message: ''
  });

  const closeModal = () => setModal({ isOpen: false, type: null });

  const openModal = (type) => {
    let title = '';
    let text = '';
    switch (type) {
      case 'join':
        title = language === 'zh' ? '支付押金' : 'Pay Deposit';
        text = language === 'zh' ? '确认支付押金加入营地，完成挑战后可全额返还。' : 'Confirm paying deposit to join the camp. Full refund after completing challenges.';
        break;
      case 'refund':
        title = language === 'zh' ? '押金赎回' : 'Refund Deposit';
        text = language === 'zh' ? '确认赎回您的押金？' : 'Confirm to refund your deposit?';
        break;
      case 'start':
        title = language === 'zh' ? '配置关卡' : 'Configure Challenges';
        text = language === 'zh' ? '准备配置挑战关卡，设置密码和截止时间。' : 'Ready to configure challenge levels with passwords and deadlines.';
        break;
      // Add other cases for 'challenge', 'penalty' if needed
      default:
        break;
    }
    setModal({ isOpen: true, type, title, text, isLoading: false, isError: false, message: '' });
  };
  
  const openJoinModal = () => {
    if (!camp) return;
    
    // 检查是否为组织者，如果是则显示专门的提示
    if (isCreator) {
      setModal({
        isOpen: true,
        type: 'info',
        title: language === 'zh' ? '组织者提示' : 'Organizer Notice',
        text: language === 'zh' 
          ? `您是这个营地的组织者，无法报名参与自己创建的营地。

作为组织者，您的职责包括：
• 管理营地设置和参数
• 配置挑战关卡和密码
• 监督参与者的进度
• 处理营地状态变更

当前营地状态：${getStatusText(camp.status, language)}
已报名人数：${camp.currentParticipants}/${camp.maxParticipants}人` 
          : `You are the organizer of this camp and cannot join your own camp.

As an organizer, your responsibilities include:
• Managing camp settings and parameters
• Configuring challenge levels and passwords
• Monitoring participant progress
• Handling camp status changes

Current camp status: ${getStatusText(camp.status, language)}
Registered participants: ${camp.currentParticipants}/${camp.maxParticipants}`,
        message: '',
        isLoading: false,
        isError: false
      });
      return;
    }
    
    openModal('join');
  };
  
  const fetchParticipants = useCallback(async (campAddress) => {
    try {
      // 构建API URL，避免重复的/api路径
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const response = await fetch(`${apiUrl}/camps/${campAddress}/participants`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const participantList = result.data.map((p, index) => ({
            id: `p${index + 1}`,
            name: language === 'zh' ? `参与者 ${index + 1}` : `Participant ${index + 1}`,
            address: p.participant_address,
            state: p.state,
            completedChallenges: p.completed_challenges || 0,
            registrationTime: p.registration_time
          }));
          setParticipants(participantList);
          setHasJoined(participantList.some(p => account && p.address.toLowerCase() === account.toLowerCase()));
        }
      }
    } catch (err) {
      console.warn('获取参与者数据失败:', err);
      setParticipants([]);
    }
  }, [language, account]);

  const getCampData = useCallback(async () => {
    const maxRetries = 3; // 减少重试次数
    const retryInterval = 2000;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        setLoading(true);
        setError(null);
        if (!campId) throw new Error(language === 'zh' ? "营地ID无效" : "Invalid camp ID");

        // 构建API URL，避免重复的/api路径
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
        const response = await fetch(`${apiUrl}/camps/${campId}`);
        
        if (response.status === 404 && attempt < maxRetries - 1) {
          console.log(`获取营地数据失败 (404)，将在 ${retryInterval}ms 后重试... (尝试 ${attempt + 1}/${maxRetries})`);
          attempt++;
          setLoading(false);
          await new Promise(resolve => setTimeout(resolve, retryInterval));
          continue;
        }

        if (!response.ok) {
          // 如果是连接错误（如ERR_CONNECTION_REFUSED），不要继续重试
          if (response.status === 0 || !response.status) {
            throw new Error(language === 'zh' ? '无法连接到服务器，请检查后端服务是否正常运行' : 'Cannot connect to server, please check if backend service is running');
          }
          
          const errorResult = await response.json().catch(() => ({ message: '无法获取营地数据' }));
          throw new Error(errorResult.message || '获取营地数据失败');
        }
        
        const result = await response.json();
        if (!result.success || !result.data) throw new Error('从API获取的数据无效');

        const campData = result.data;
        const formattedCamp = {
          id: campData.contract_address,
          name: campData.name,
          status: getStatusFromState(campData.state),
          signupDeadline: new Date(campData.signup_deadline * 1000),
          campEnd: new Date(campData.camp_end_date * 1000),
          minParticipants: campData.min_participants,
          maxParticipants: campData.max_participants,
          currentParticipants: campData.participant_count || 0,
          completedParticipants: campData.completed_count || 0,
          challenges: campData.challenge_count,
          currentLevel: campData.current_level || 1, // 默认从第1关开始
          deposit: campData.deposit_amount,
          creator: campData.organizer_address,
          contract: campData.contract_address,
          createdAt: new Date(campData.created_at * 1000)
        };

        setCamp(formattedCamp);
        const isCreatorCheck = account && formattedCamp.creator.toLowerCase() === account.toLowerCase();
        setIsCreator(isCreatorCheck);
        await fetchParticipants(campId);
        
        setLoading(false);
        console.log('营地数据获取成功:', formattedCamp);
        console.log('组织者检查:', {
          account,
          creator: formattedCamp.creator,
          isCreator: isCreatorCheck,
          accountLower: account?.toLowerCase(),
          creatorLower: formattedCamp.creator?.toLowerCase()
        });
        return; // 成功获取数据后退出循环

      } catch (err) {
        console.error(`获取营地数据错误 (尝试 ${attempt + 1}):`, err);
        
        // 如果是连接错误，不要重试
        if (err.message.includes('连接') || err.message.includes('connect') || err.name === 'TypeError') {
          setError(language === 'zh' ? '无法连接到服务器，请检查网络连接和后端服务状态' : 'Cannot connect to server, please check network connection and backend service status');
        setLoading(false);
          return;
        }
        
        // 如果已达到最大重试次数，则停止
        if (attempt >= maxRetries - 1) {
          setError(err.message || "获取数据失败，请稍后重试");
          setLoading(false);
          return;
        }
        
        // 否则继续重试
        attempt++;
        setLoading(false);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }, [campId, language, account, fetchParticipants]);

  useEffect(() => {
    getCampData();
  }, [getCampData]);


  const handleStartLevel = () => {
    // 跳转到关卡配置页面
    window.location.href = `/create-level/${camp.id}`;
  };

  const handleStartChallenge = () => {
    // 跳转到关卡详情页面
    window.location.href = `/level/${camp.id}`;
  };

  const handleJoin = async () => {
    if (!camp) return;
    
    // 检查钱包连接状态
    if (!isConnected) {
      setModal(prev => ({ 
        ...prev, 
        isLoading: false, 
        isError: true,
        message: language === 'zh' ? '请先连接钱包' : 'Please connect wallet first'
      }));
      return;
    }
    
    // 检查是否为组织者
    if (isCreator) {
      setModal(prev => ({ 
        ...prev, 
        isLoading: false, 
        isError: true,
        message: language === 'zh' 
          ? `您是这个营地的组织者，无法报名参与自己创建的营地。

作为组织者，您的职责包括：
• 管理营地设置和参数
• 配置挑战关卡和密码
• 监督参与者的进度
• 处理营地状态变更

当前营地状态：${getStatusText(camp.status, language)}
已报名人数：${camp.currentParticipants}/${camp.maxParticipants}人` 
          : `You are the organizer of this camp and cannot join your own camp.

As an organizer, your responsibilities include:
• Managing camp settings and parameters
• Configuring challenge levels and passwords
• Monitoring participant progress
• Handling camp status changes

Current camp status: ${getStatusText(camp.status, language)}
Registered participants: ${camp.currentParticipants}/${camp.maxParticipants}`
      }));
      return;
    }

    setModal(prev => ({ ...prev, isLoading: true, message: language === 'zh' ? '正在提交交易...' : 'Submitting transaction...' }));

    try {
      // The deposit amount from the backend is in wei, so we need to pass it as wei to the contract
      const result = await register(camp.id, camp.deposit);
      
      if (result.success) {
        setModal(prev => ({ ...prev, isLoading: false, message: language === 'zh' ? '交易成功！正在更新数据...' : 'Transaction successful! Updating data...' }));
        
        // 等待一段时间让后端处理事件
        setTimeout(async () => {
          try {
            await getCampData();
            setModal(prev => ({ ...prev, message: language === 'zh' ? '报名成功！' : 'Successfully joined!' }));
            setTimeout(() => {
      closeModal();
            }, 2000);
          } catch (error) {
            console.error('刷新数据失败:', error);
            setModal(prev => ({ ...prev, message: language === 'zh' ? '报名成功，但数据刷新失败，请手动刷新页面' : 'Joined successfully, but data refresh failed, please refresh page manually' }));
            setTimeout(() => {
              closeModal();
            }, 3000);
          }
        }, 3000);
      } else {
        throw new Error(result.error || result.message || '未知错误');
      }
    } catch (err) {
      console.error('报名失败:', err);
      
      // 解析错误信息，提供更友好的提示
      let errorMessage = err.message;
      
      // 检查是否是合约错误
      if (errorMessage.includes('Organizer cannot register as participant')) {
        errorMessage = language === 'zh' 
          ? '组织者无法报名参与自己创建的营地' 
          : 'Organizer cannot register as participant';
      } else if (errorMessage.includes('Camp is not in signup state')) {
        errorMessage = language === 'zh' 
          ? '营地当前不在报名阶段' 
          : 'Camp is not in signup state';
      } else if (errorMessage.includes('Camp is full')) {
        errorMessage = language === 'zh' 
          ? '营地名额已满' 
          : 'Camp is full';
      } else if (errorMessage.includes('Signup deadline has passed')) {
        errorMessage = language === 'zh' 
          ? '报名截止时间已过' 
          : 'Signup deadline has passed';
      } else if (errorMessage.includes('Already registered')) {
        errorMessage = language === 'zh' 
          ? '您已经报名过这个营地' 
          : 'You have already registered for this camp';
      } else if (errorMessage.includes('Insufficient deposit')) {
        errorMessage = language === 'zh' 
          ? '押金金额不足' 
          : 'Insufficient deposit amount';
      } else if (errorMessage.includes('cannot estimate gas')) {
        errorMessage = language === 'zh' 
          ? '交易可能失败，请检查营地状态和您的资格' 
          : 'Transaction may fail, please check camp status and your eligibility';
      }
      
      setModal(prev => ({ 
        ...prev, 
        isLoading: false, 
        isError: true,
        message: `${language === 'zh' ? '报名失败' : 'Failed to join'}: ${errorMessage}`
      }));
    }
  };

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address || address === ".....") return '.....';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 将wei转换为ETH
  const formatWeiToEth = (wei) => {
    if (!wei || wei === ".....") return '.....';
    try {
      return ethers.utils.formatEther(wei.toString());
    } catch (error) {
      return '.....';
    }
  };

  // 格式化日期显示（包含时间）
  const formatDateTime = (dateStr) => {
    if (!dateStr || dateStr === ".....") return '.....';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateStr;
    }
  };

  // 计算剩余时间
  const calculateTimeRemaining = (deadline) => {
    if (!deadline || deadline === ".....") return '.....';
    
    try {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const timeDiff = deadlineDate.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        return language === 'zh' ? '已截止' : 'Expired';
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        return language === 'zh' ? `剩余 ${days} 天` : `${days} days left`;
      } else if (hours > 0) {
        return language === 'zh' ? `剩余 ${hours} 小时` : `${hours} hours left`;
      } else if (minutes > 0) {
        return language === 'zh' ? `剩余 ${minutes} 分钟` : `${minutes} minutes left`;
      } else {
        return language === 'zh' ? '今天截止' : 'Expires today';
      }
    } catch (error) {
      return '.....';
    }
  };
  
  // 渲染钢琴键节点
  const renderPianoNode = (stage, name, isActive) => (
    <div className={`black-key-node ${isActive ? 'active' : ''}`}>
      <h2>{name}</h2>
    </div>
  );
  
  // 渲染状态徽章
  const renderStatusBadge = () => {
    if (!camp) return null;
    
    const statusText = getStatusText(camp.status, language);
    const statusClass = getStatusClass(camp.status);
    
    return (
      <div className={`status-badge ${statusClass}`}>
        {statusText}
      </div>
    );
  };
  
  // 渲染状态横幅
  const renderStatusBanner = () => {
    if (!camp) return null;
    
    switch (camp.status) {
      case CAMP_STATUS.FAILED:
        return (
          <div className="status-banner failure-banner">
            <h3>
              <FontAwesomeIcon icon="exclamation-triangle" style={{marginRight: '10px'}} />
              {language === 'zh' ? "开营失败原因" : "Failure Reason"}
            </h3>
            <p>
              {language === 'zh' 
                ? `本次营地报名人数为 ${camp.currentParticipants} 人，未达到最低开营人数要求（${camp.minParticipants}人）。根据营地规则，押金将退还给所有已报名参与者。`
                : `This camp has ${camp.currentParticipants} participants, which is below the minimum requirement of ${camp.minParticipants}. According to camp rules, deposits will be refunded to all registered participants.`}
            </p>
          </div>
        );
      case CAMP_STATUS.SUCCESS:
        return (
          <div className="status-banner success-banner">
            <h3>
              <FontAwesomeIcon icon="check-circle" style={{marginRight: '10px'}} />
              {language === 'zh' ? "开营成功" : "Camp Started Successfully"}
            </h3>
            <p>
              {language === 'zh'
                ? `恭喜！营地已成功开营，共有 ${camp.currentParticipants} 人参与。请等待组织者开启关卡。`
                : `Congratulations! The camp has started with ${camp.currentParticipants} participants. Please wait for the organizer to start the challenges.`}
            </p>
          </div>
        );
      case CAMP_STATUS.FIGHTING:
        return (
          <div className="status-banner fighting-banner">
            <h3>
              <FontAwesomeIcon icon="running" style={{marginRight: '10px'}} />
              {language === 'zh' ? "闯关进行中" : "Challenge Mode Active"}
            </h3>
            <p>
              {language === 'zh' 
                ? `当前已有 ${camp.completedParticipants} 人完成闯关，继续加油！`
                : `${camp.completedParticipants} participants have completed the challenges. Keep going!`}
            </p>
          </div>
        );
      case CAMP_STATUS.ENDED:
        return (
          <div className="status-banner ended-banner">
            <h3>
              <FontAwesomeIcon icon="flag-checkered" style={{marginRight: '10px'}} />
              {language === 'zh' ? "营地已结束" : "Camp Completed"}
            </h3>
            <p>
              {language === 'zh'
                ? `本次营地圆满结束！共有 ${camp.completedParticipants} 人成功通关。`
                : `The camp has successfully concluded! ${camp.completedParticipants} participants completed all challenges.`}
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  
  // 渲染参与者列表
  const renderParticipants = () => {
    if (!camp || !participants.length) return null;
    
    let title = '';
    switch (camp.status) {
      case CAMP_STATUS.SIGNUP:
      case CAMP_STATUS.SUCCESS:
        title = language === 'zh' ? "已报名参与者" : "Registered Participants";
        break;
      case CAMP_STATUS.FAILED:
      case CAMP_STATUS.ENDED:
        title = language === 'zh' ? "参与者押金状态" : "Participant Deposit Status";
        break;
      case CAMP_STATUS.FIGHTING:
        title = language === 'zh' ? "参与者进度" : "Participant Progress";
        break;
    }
    
    // 在闯关模式下按完成关卡数排序
    let sortedParticipants = [...participants];
    if (camp.status === CAMP_STATUS.FIGHTING) {
      sortedParticipants.sort((a, b) => 
        b.completedLevels - a.completedLevels || b.currentLevel - a.currentLevel);
    }
    
    // 在结营状态下，先显示已完成的参与者，再显示未完成的
    if (camp.status === CAMP_STATUS.ENDED) {
      sortedParticipants.sort((a, b) => {
        if (a.completed && !b.completed) return -1;
        if (!a.completed && b.completed) return 1;
        return 0;
      });
    }
    
    return (
      <div className="participants-section">
        <h2 className="section-title">{title}</h2>
        <div className="participants-grid">
          {sortedParticipants.map(participant => (
            <div 
              key={participant.id}
              className={`participant-card ${participant.refunded ? 'refunded' : ''} ${participant.completed ? 'completed' : ''} ${participant.completed === false ? 'failed' : ''}`}
            >
              <div className="participant-avatar">
                {participant.name.charAt(0)}
              </div>
              <div className="participant-name">{participant.name}</div>
              <div className="participant-address">
                {formatAddress(participant.address)}
              </div>
              
              {camp.status === CAMP_STATUS.FIGHTING && (
                <div className="participant-progress">
                  {language === 'zh' ? "关卡: " : "Level: "}
                  {participant.currentLevel} | 
                  {language === 'zh' ? " 完成: " : " Completed: "}
                  {participant.completedLevels}
                </div>
              )}
              
              {camp.status === CAMP_STATUS.FAILED && (
                <div className={`refund-status ${participant.refunded ? 'status-refunded' : 'status-pending'}`}>
                  {participant.refunded 
                    ? <><FontAwesomeIcon icon="check-circle" /> {language === 'zh' ? " 已退还" : " Refunded"}</>
                    : <><FontAwesomeIcon icon="clock" /> {language === 'zh' ? " 待退还" : " Pending"}</>}
                </div>
              )}
              
              {camp.status === CAMP_STATUS.ENDED && participant.completed && (
                <div className={`refund-status ${participant.refunded ? 'status-refunded' : 'status-pending'}`}>
                  {participant.refunded 
                    ? <><FontAwesomeIcon icon="check-circle" /> {language === 'zh' ? " 已赎回" : " Refunded"}</>
                    : <><FontAwesomeIcon icon="clock" /> {language === 'zh' ? " 待赎回" : " Pending"}</>}
                </div>
              )}
              
              {camp.status === CAMP_STATUS.ENDED && !participant.completed && (
                <div className="refund-status status-penalized">
                  <FontAwesomeIcon icon="exclamation-triangle" /> {language === 'zh' ? " 未通关" : " Failed"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 渲染关卡进度（闯关模式）
  const renderLevelProgress = () => {
    if (!camp || camp.status !== CAMP_STATUS.FIGHTING) return null;
    
    const progressPercent = ((camp.currentLevel - 1) / camp.challenges) * 100;
    
    return (
      <div className="participants-section">
        <h2 className="section-title">
          {language === 'zh' ? "关卡进度" : "Level Progress"}
        </h2>
        <div className="progress-container">
          <div className="progress-bar" style={{width: `${progressPercent}%`}}></div>
        </div>
        <div style={{textAlign: 'center', margin: '10px 0', fontSize: '1.2rem'}}>
          {language === 'zh' ? "已完成 " : "Completed "}
          <span id="completedLevels">{camp.currentLevel - 1}</span>/
          <span id="totalLevels">{camp.challenges}</span>
          {language === 'zh' ? " 关" : " levels"}
        </div>
        <div className="levels-container">
          {Array.from({length: camp.challenges}).map((_, i) => {
            const level = i + 1;
            let cardClass = '';
            
            if (level < camp.currentLevel) {
              cardClass = 'completed';
            } else if (level === camp.currentLevel) {
              cardClass = 'current';
            } else {
              cardClass = 'locked';
            }
            
            return (
              <div className={`level-card ${cardClass}`} key={level}>
                {level < camp.currentLevel ? <FontAwesomeIcon icon="check" /> : 
                 level > camp.currentLevel ? <FontAwesomeIcon icon="lock" /> : level}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // 渲染结营统计（已结束状态）
  const renderCompletionStats = () => {
    if (!camp || camp.status !== CAMP_STATUS.ENDED) return null;
    
    // 根据用户身份和完成状态确定按钮状态
    const canClaimRefund = hasJoined && participants.find(p => 
      p.address.toLowerCase() === account?.toLowerCase())?.completed && !participants.find(p => 
      p.address.toLowerCase() === account?.toLowerCase())?.refunded;
    
    const canApplyPenalty = isCreator && camp.failedParticipants > 0 && 
      participants.some(p => !p.completed && !p.penalized);
    
    return (
      <div className="results-stats">
        <div className="stat-card success">
          <div className="stat-value">{camp.completedParticipants}</div>
          <div className="stat-label">
            {language === 'zh' ? "通关人数" : "Completed"}
          </div>
          <button 
            className="refund-btn" 
            onClick={() => openModal('refund')}
            disabled={!canClaimRefund}
            style={{marginTop: '15px'}}
          >
            <FontAwesomeIcon icon="coins" />
            {hasJoined && participants.find(p => 
              p.address.toLowerCase() === account?.toLowerCase())?.refunded
              ? (language === 'zh' ? "已赎回" : "Refunded")
              : (language === 'zh' ? "押金赎回" : "Refund Deposit")}
          </button>
        </div>
        
        <div className="stat-card failure">
          <div className="stat-value">{camp.failedParticipants}</div>
          <div className="stat-label">
            {language === 'zh' ? "扣押人数" : "Failed"}
          </div>
          <button 
            className="penalty-btn" 
            onClick={() => openModal('penalty')}
            disabled={!canApplyPenalty}
            style={{marginTop: '15px'}}
          >
            <FontAwesomeIcon icon="hand-holding-usd" />
            {!isCreator
              ? (language === 'zh' ? "无操作权限" : "No Permission")
              : camp.failedParticipants === 0
                ? (language === 'zh' ? "无未通关者" : "No Failures")
                : participants.some(p => !p.completed && p.penalized)
                  ? (language === 'zh' ? "已罚扣" : "Penalized")
                  : (language === 'zh' ? "押金罚扣" : "Apply Penalty")}
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染节点5：结营
  const renderNode5 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 5;
    
    return (
      <div className="piano-row">
        {renderPianoNode(5, language === 'zh' ? "结营" : "Completion", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "结营时间" : "End Date"}</h3>
          <div className="value">
            {camp?.campEnd ? formatDateTime(camp.campEnd) : "-"}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.ENDED && 
              (language === 'zh' ? "已结营" : "Completed")}
            {camp?.status === CAMP_STATUS.FIGHTING && 
              (() => {
                const endDate = new Date(camp.campEnd);
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return language === 'zh' ? `剩余 ${diffDays} 天` : `${diffDays} days left`;
              })()}
            {camp?.status === CAMP_STATUS.SUCCESS && 
              (language === 'zh' ? "等待闯关" : "Waiting for challenges")}
            {camp?.status === CAMP_STATUS.SIGNUP && 
              (language === 'zh' ? "等待开营" : "Waiting to start")}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "完成率" : "Completion Rate"}</h3>
          <div className="value">
            {camp?.status === CAMP_STATUS.ENDED 
              ? `${Math.round((camp.completedParticipants / camp.currentParticipants) * 100)}%` 
              : "-"}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.ENDED 
              ? `${camp.completedParticipants}${language === 'zh' ? "人通关" : " completed"}` 
              : (language === 'zh' ? "等待数据" : "Pending")}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "奖励发放" : "Rewards"}</h3>
          <div className="value">
            {camp?.status === CAMP_STATUS.ENDED 
              ? <span style={{color: '#4CAF50'}}>{language === 'zh' ? "已完成" : "Completed"}</span> 
              : "-"}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.ENDED 
              ? camp.rewardsDate || camp.campEnd  
              : (language === 'zh' ? "等待数据" : "Pending")}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染节点4：闯关模式
  const renderNode4 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 4;
    
    return (
      <div className="piano-row">
        {renderPianoNode(4, language === 'zh' ? "闯关模式" : "Challenge", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "挑战关卡" : "Challenges"}</h3>
          <div className="value">{camp?.challenges || 0}</div>
          <div className="label">{language === 'zh' ? "总关卡数" : "Total Levels"}</div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "当前进度" : "Current Progress"}</h3>
          <div className="value">
            {camp?.status === CAMP_STATUS.FIGHTING ? (camp?.currentLevel || 1) : "-"}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.FIGHTING 
              ? (language === 'zh' ? "当前关卡" : "Current Level")
              : (language === 'zh' ? "未开始" : "Not started")}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "操作" : "Action"}</h3>
          {camp?.status !== CAMP_STATUS.FIGHTING ? (
            <div className="value">-</div>
          ) : isCreator ? (
            <>
              <button 
                className="action-btn"
                disabled
              >
                <FontAwesomeIcon icon="running" />
                {language === 'zh' ? "无法闯关" : "Cannot Challenge"}
              </button>
              <div className="label">{language === 'zh' ? "组织者不可参与" : "Organizer cannot join"}</div>
            </>
          ) : !hasJoined ? (
            <div className="value">{language === 'zh' ? "未参与此营地" : "Not joined"}</div>
          ) : (
            <button 
              className="challenge-btn action-btn"
              onClick={handleStartChallenge}
              disabled={!isConnected}
            >
              <FontAwesomeIcon icon="running" />
              {language === 'zh' ? "开始闯关" : "Start Challenge"}
            </button>
          )}
          {camp?.status === CAMP_STATUS.FIGHTING && !isCreator && hasJoined && (
            <div className="label">
              {!isConnected 
                ? (language === 'zh' ? "请先连接钱包" : "Please connect wallet first")
                : (language === 'zh' ? "进入关卡详情页面" : "Enter level detail page")}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // 渲染节点3：开营情况
  const renderNode3 = () => {
    const currentStage = getCurrentStage();
    const isActive = currentStage && currentStage.stage === 3;
    
    return (
      <div className="piano-row">
        {renderPianoNode(3, language === 'zh' ? "开营情况" : "Camp Status", isActive)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "开营状态" : "Camp Status"}</h3>
          <div className="value" style={camp?.status === CAMP_STATUS.FAILED ? {color: '#f44336'} : camp?.status !== CAMP_STATUS.SIGNUP ? {color: '#4CAF50'} : {}}>
            {camp?.status === CAMP_STATUS.SIGNUP && (language === 'zh' ? "等待开营" : "Waiting")}
            {camp?.status === CAMP_STATUS.FAILED && (language === 'zh' ? "开营失败" : "Failed")}
            {(camp?.status === CAMP_STATUS.SUCCESS || camp?.status === CAMP_STATUS.FIGHTING || camp?.status === CAMP_STATUS.ENDED) && 
              (language === 'zh' ? "已开营" : "Started")}
          </div>
          <div className="label">
            {camp?.status === CAMP_STATUS.FAILED && (language === 'zh' ? "未达人数要求" : "Insufficient participants")}
            {camp?.status !== CAMP_STATUS.SIGNUP && camp?.status !== CAMP_STATUS.FAILED && camp?.campStart}
          </div>
        </div>
        
        {camp?.status === CAMP_STATUS.FAILED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value" id="refundStatus" style={camp.refundStatus === 'completed' ? {color: '#4CAF50'} : {color: '#f44336'}}>
              {camp.refundStatus === 'completed' 
                ? (language === 'zh' ? `${camp.currentParticipants}人已退还` : `${camp.currentParticipants} refunded`)
                : (language === 'zh' ? `${camp.currentParticipants}人待退还` : `${camp.currentParticipants} pending refund`)}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${formatWeiToEth(camp.deposit)} ETH` : `Deposit: ${formatWeiToEth(camp.deposit)} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.FAILED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金操作" : "Deposit Action"}</h3>
            <button 
              className="refund-btn action-btn"
              onClick={() => openModal('refund')}
              disabled={!isCreator || camp.refundStatus === 'processing' || camp.refundStatus === 'completed'}
            >
              {camp.refundStatus === 'completed' 
                ? <><FontAwesomeIcon icon="check-circle" /> {language === 'zh' ? "已完成退还" : "Refund Completed"}</>
                : camp.refundStatus === 'processing'
                  ? <><FontAwesomeIcon icon="spinner" spin /> {language === 'zh' ? "处理中..." : "Processing..."}</>
                  : <><FontAwesomeIcon icon="coins" /> {language === 'zh' ? "退还押金" : "Refund Deposit"}</>}
            </button>
            <div className="label">
              {camp.refundStatus === 'completed'
                ? (language === 'zh' ? "押金已全部退还" : "All deposits refunded")
                : camp.refundStatus === 'processing'
                  ? (language === 'zh' ? "区块链交易处理中" : "Blockchain transaction processing")
                  : (language === 'zh' ? "组织者操作" : "Organizer action")}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.SUCCESS && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value">
              {language === 'zh' ? `${camp.currentParticipants}人押金已提交` : `${camp.currentParticipants} deposits submitted`}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${formatWeiToEth(camp.deposit)} ETH` : `Deposit: ${formatWeiToEth(camp.deposit)} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.SUCCESS && (
          <div className="white-key">
            <h3>{language === 'zh' ? "关卡操作" : "Level Action"}</h3>
            <button 
              id="startLevelBtn" 
              className="start-level-btn"
              onClick={() => openModal('start')}
              disabled={!isCreator || !isConnected}
            >
              <div className="icon">
                <FontAwesomeIcon icon="play" />
              </div>
              <h2>{language === 'zh' ? "开启关卡" : "Start Level"}</h2>
            </button>
            <div className="label">
              {!isConnected 
                ? (language === 'zh' ? "请先连接钱包" : "Please connect wallet first")
                : isCreator 
                ? (language === 'zh' ? "组织者操作" : "Organizer action")
                : (language === 'zh' ? "无操作权限" : "No permission")}
            </div>

          </div>
        )}
        
        {camp?.status === CAMP_STATUS.FIGHTING && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value">
              {language === 'zh' ? `${camp.currentParticipants}人押金锁定中` : `${camp.currentParticipants} deposits locked`}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${formatWeiToEth(camp.deposit)} ETH` : `Deposit: ${formatWeiToEth(camp.deposit)} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.FIGHTING && (
          <div className="white-key">
            <h3>{language === 'zh' ? "开营时间" : "Start Date"}</h3>
            <div className="value">{formatDateTime(camp.campEnd)}</div>
            <div className="label">
              {language === 'zh' ? "已开始" : "Started"}
            </div>
          </div>
        )}
        

        
        {camp?.status === CAMP_STATUS.ENDED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "押金状态" : "Deposit Status"}</h3>
            <div className="value">
              {language === 'zh' ? `${camp.currentParticipants}人押金锁定` : `${camp.currentParticipants} deposits locked`}
            </div>
            <div className="label">
              {language === 'zh' ? `押金金额: ${formatWeiToEth(camp.deposit)} ETH` : `Deposit: ${formatWeiToEth(camp.deposit)} ETH`}
            </div>
          </div>
        )}
        
        {camp?.status === CAMP_STATUS.ENDED && (
          <div className="white-key">
            <h3>{language === 'zh' ? "开营时间" : "Start Date"}</h3>
            <div className="value">{formatDateTime(camp.campEnd)}</div>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染节点2：报名开始
  const renderNode2 = () => {
    if (!camp) return null;
    
    if (camp.status !== CAMP_STATUS.SIGNUP) {
    return (
      <div className="piano-row">
          {renderPianoNode(2, language === 'zh' ? "报名开始" : "Registration", false)}
          <div className="white-key disabled">
          <h3>{language === 'zh' ? "报名截止" : "Registration Deadline"}</h3>
            <div className="value">{formatDateTime(camp.signupDeadline)}</div>
            <div className="label">{language === 'zh' ? "报名已结束" : "Registration Closed"}</div>
          </div>
          <div className="white-key disabled">
            <h3>{language === 'zh' ? "参与人数" : "Participants"}</h3>
            <div className="value">{camp.currentParticipants} / {camp.maxParticipants}</div>
        </div>
          <div className="white-key disabled">
            <h3>{language === 'zh' ? "报名操作" : "Join Action"}</h3>
            <button className="action-btn" disabled>
              {language === 'zh' ? "报名已结束" : "Closed"}
            </button>
            <div className="label">{language === 'zh' ? `押金: ${formatWeiToEth(camp.deposit)} ETH` : `Deposit: ${formatWeiToEth(camp.deposit)} ETH`}</div>
          </div>
        </div>
      );
    }

    const isDeadlineReached = new Date(camp.signupDeadline) < new Date();
    const isFull = camp.currentParticipants >= camp.maxParticipants;
    const canJoin = isConnected && !isDeadlineReached && !isFull && !hasJoined && !isCreator;
    const progressPercent = camp.maxParticipants > 0 ? (camp.currentParticipants / camp.maxParticipants) * 100 : 0;

    let buttonText = language === 'zh' ? "立即报名" : "Join Now";
    let buttonDisabled = !canJoin;
    let actionLabel = language === 'zh' ? `押金: ${formatWeiToEth(camp.deposit)} ETH` : `Deposit: ${formatWeiToEth(camp.deposit)} ETH`;

    if (!isConnected) {
      buttonText = language === 'zh' ? "连接钱包" : "Connect Wallet";
      buttonDisabled = true;
      actionLabel = language === 'zh' ? '请先连接钱包以报名' : 'Please connect wallet to join';
    } else if (isCreator) {
      buttonText = language === 'zh' ? "营地组织者" : "Camp Organizer";
      buttonDisabled = true;
      actionLabel = language === 'zh' ? '您是这个营地的创建者和管理者' : "You are the creator and manager of this camp";
    } else if (hasJoined) {
      buttonText = language === 'zh' ? "已报名" : "Joined";
      buttonDisabled = true;
    } else if (isFull) {
      buttonText = language === 'zh' ? "名额已满" : "Camp Full";
      buttonDisabled = true;
    } else if (isDeadlineReached) {
      buttonText = language === 'zh' ? "报名已截止" : "Registration Ended";
      buttonDisabled = true;
    }

    return (
      <div className="piano-row">
        {renderPianoNode(2, language === 'zh' ? "报名开始" : "Registration", true)}
        <div className="white-key">
          <h3>{language === 'zh' ? "报名截止" : "Registration Deadline"}</h3>
          <div className="value">{formatDateTime(camp.signupDeadline)}</div>
          <div className="label">{calculateTimeRemaining(camp.signupDeadline)}</div>
        </div>
        <div className="white-key">
          <h3>{language === 'zh' ? "参与人数" : "Participants"}</h3>
          <div className="value">
            <span>{camp.currentParticipants}</span> / {camp.maxParticipants}
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{width: `${progressPercent}%`}}></div>
          </div>
          <div className="label">
            {language === 'zh' 
              ? `上限${camp.maxParticipants}人, 最低${camp.minParticipants}人开营` 
              : `Max ${camp.maxParticipants}, Min ${camp.minParticipants} to start`}
          </div>
        </div>
          <div className="white-key">
          <h3>{language === 'zh' ? "报名操作" : "Join Action"}</h3>
          <button className="action-btn" onClick={openJoinModal} disabled={buttonDisabled}>
            <FontAwesomeIcon icon="user-plus" />
            {buttonText}
            </button>
          <div className="label">{actionLabel}</div>
            </div>
      </div>
    );
  };
  
  // 添加节点1：营地创建
  const renderNode1 = () => {
    return (
      <div className="piano-row">
        {renderPianoNode(1, language === 'zh' ? "营地创建" : "CampCreation", false)}
        
        <div className="white-key">
          <h3>{language === 'zh' ? "创建时间" : "Creation Date"}</h3>
          <div className="value">
            {formatDateTime(camp?.createdAt)}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "创建者" : "Creator"}</h3>
          <div className="value">
            {formatAddress(camp?.creator || "")}
          </div>
          <div className="label">
            {language === 'zh' ? "营地组织者" : "Camp Organizer"}
          </div>
        </div>
        
        <div className="white-key">
          <h3>{language === 'zh' ? "合约地址" : "Contract Address"}</h3>
          <div className="value">
            {formatAddress(camp?.contract || "")}
          </div>
        </div>
      </div>
    );
  };

  // 获取当前阶段
  const getCurrentStage = () => {
    if (!camp) return null;
    
    switch (camp.status) {
      case CAMP_STATUS.SIGNUP:
        return { stage: 2, name: language === 'zh' ? "报名开始" : "Registration" };
      case CAMP_STATUS.FAILED:
        return { stage: 3, name: language === 'zh' ? "开营情况" : "Camp Status" };
      case CAMP_STATUS.SUCCESS:
        return { stage: 3, name: language === 'zh' ? "开营情况" : "Camp Status" };
      case CAMP_STATUS.FIGHTING:
        return { stage: 4, name: language === 'zh' ? "闯关模式" : "Challenge Mode" };
      case CAMP_STATUS.ENDED:
        return { stage: 5, name: language === 'zh' ? "结营" : "Completed" };
      default:
        return { stage: 2, name: language === 'zh' ? "报名开始" : "Registration" };
    }
  };

  const renderGenericModal = () => {
    if (!modal.isOpen) return null;
    
    return (
      <div className="modal active">
        <div className="modal-content">
          <h2>{modal.title}</h2>
          <p>{modal.text}</p>
          
          {modal.type === 'join' && (
          <div className="camp-details">
              <div><span>{language === 'zh' ? "营地名称:" : "Camp Name:"}</span><span>{camp?.name}</span></div>
              <div><span>{language === 'zh' ? "押金金额:" : "Deposit Amount:"}</span><span>{formatWeiToEth(camp?.deposit)} ETH</span></div>
            </div>
          )}

          {(modal.isLoading || modal.message) && (
            <div className={`modal-feedback ${modal.isError ? 'error' : ''}`}>
              {modal.isLoading && <FontAwesomeIcon icon="spinner" spin />}
              <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: 'inherit'}}>{modal.message}</pre>
              </div>
          )}
          
          <div className="modal-buttons">
            {modal.type === 'info' ? (
              <button className="modal-btn confirm-btn" onClick={closeModal}>
                {language === 'zh' ? "确定" : "OK"}
            </button>
            ) : modal.type === 'start' ? (
              <>
            <button className="modal-btn cancel-btn" onClick={closeModal}>
              {language === 'zh' ? "取消" : "Cancel"}
            </button>
            <button className="modal-btn confirm-btn" onClick={handleStartLevel}>
                  {language === 'zh' ? "配置关卡" : "Configure"}
            </button>
              </>
            ) : (
              <>
                <button className="modal-btn cancel-btn" onClick={closeModal} disabled={modal.isLoading}>
              {language === 'zh' ? "取消" : "Cancel"}
            </button>
                <button className="modal-btn confirm-btn" onClick={handleJoin} disabled={modal.isLoading}>
                  {modal.isLoading ? (language === 'zh' ? '处理中...' : 'Processing...') : (language === 'zh' ? '确认' : 'Confirm')}
            </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="camp-detail-container">
      <Navbar />
      <div className="container">
        <div className="camp-header">
          <h1>{camp?.name}</h1>
          <p>
            {camp?.status === CAMP_STATUS.FAILED
              ? (language === 'zh' 
                  ? "很遗憾，本次营地未能成功开启，押金将退还给所有参与者" 
                  : "Unfortunately, this camp failed to start. Deposits will be refunded to all participants.")
              : camp?.status === CAMP_STATUS.FIGHTING
                ? (language === 'zh'
                    ? "挑战已经开始，展现你的实力，完成所有关卡！"
                    : "The challenge has begun! Show your skills and complete all levels!")
                : camp?.status === CAMP_STATUS.ENDED
                  ? (language === 'zh'
                      ? "恭喜！本次营地已圆满结束，感谢所有参与者的付出"
                      : "Congratulations! This camp has successfully completed. Thank you to all participants.")
                  : (language === 'zh' 
                      ? "在通往区块链开发的路上，每一步都是新的突破。加入我们，共同成长！" 
                      : "On the road to blockchain development, each step is a breakthrough. Join us and grow together!")}
          </p>
          {renderStatusBadge()}
        </div>
        
        {renderStatusBanner()}
        
        <div className="piano-container">
          <div className="piano">
            {renderNode5()}
            {renderNode4()}
            {renderNode3()}
            {renderNode2()}
            {renderNode1()}
          </div>
        </div>
        
        {camp?.status === CAMP_STATUS.FIGHTING && renderLevelProgress()}
        {camp?.status === CAMP_STATUS.ENDED && renderCompletionStats()}
        
        {renderParticipants()}
      </div>
      {renderGenericModal()}
    </div>
  );
};

export default CampDetailPage;