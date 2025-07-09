import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CreateCamp.scss';
import Navbar from '../components/Navbar';

// 自定义日期选择器样式
const customDatePickerStyles = `
  .react-datepicker__time-container .react-datepicker__time {
    background-color: #222;
  }
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
    color: #fff;
    background-color: #222;
  }
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
    background-color: #444;
  }
  .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
    background-color: #ff2a2a;
  }
  
  /* 自定义押金单位样式 */
  .wei-unit {
    font-weight: bold;
    color: #ff2a2a;
  }
  
  .deposit-info {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #aaa;
  }
  
  .deposit-note {
    margin-top: 5px;
    font-size: 0.85rem;
    color: #ff2a2a;
    font-style: italic;
  }

  /* 加载动画样式 */
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CreateCampPage = () => {
  const navigate = useNavigate();
  const { isConnected, account, createCamp, loading, error } = useWeb3();
  const { language } = useLanguage();
  
  // 表单状态
  const [name, setName] = useState('');
  const [signupDeadline, setSignupDeadline] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 默认7天后
  const [campEndDate, setCampEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 默认30天后
  const [challengeCount, setChallengeCount] = useState(3);
  const [minParticipants, setMinParticipants] = useState(5);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [depositAmount, setDepositAmount] = useState('10000000000000000'); // 默认0.01 ETH，以wei为单位
  
  // 表单验证
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // 验证表单
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = language === 'zh' ? '营地名称不能为空' : 'Camp name cannot be empty';
    }
    
    if (!signupDeadline) {
      errors.signupDeadline = language === 'zh' ? '报名截止时间不能为空' : 'Signup deadline cannot be empty';
    } else if (signupDeadline <= new Date()) {
      errors.signupDeadline = language === 'zh' ? '报名截止时间必须在当前时间之后' : 'Signup deadline must be in the future';
    }
    
    if (!campEndDate) {
      errors.campEndDate = language === 'zh' ? '结营时间不能为空' : 'Camp end date cannot be empty';
    } else if (campEndDate <= signupDeadline) {
      errors.campEndDate = language === 'zh' ? '结营时间必须在报名截止时间之后' : 'Camp end date must be after signup deadline';
    }
    
    if (challengeCount <= 0 || challengeCount > 10) {
      errors.challengeCount = language === 'zh' ? '关卡数量必须在1到10之间' : 'Challenge count must be between 1 and 10';
    }
    
    if (minParticipants <= 0) {
      errors.minParticipants = language === 'zh' ? '最小参与者数量必须大于0' : 'Minimum participants must be greater than 0';
    }
    
    if (maxParticipants <= minParticipants) {
      errors.maxParticipants = language === 'zh' ? '最大参与者数量必须大于最小参与者数量' : 'Maximum participants must be greater than minimum participants';
    }
    
    if (!depositAmount || isNaN(parseInt(depositAmount)) || parseInt(depositAmount) <= 0) {
      errors.depositAmount = language === 'zh' ? '押金金额必须大于0' : 'Deposit amount must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setFormErrors({ general: language === 'zh' ? '请先连接钱包' : 'Please connect your wallet first' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // 准备参数
      const params = {
        name,
        signupDeadline: Math.floor(signupDeadline.getTime() / 1000),
        campEndDate: Math.floor(campEndDate.getTime() / 1000),
        challengeCount,
        minParticipants,
        maxParticipants,
        depositAmount: depositAmount // 直接使用wei值
      };
      
      // 调用合约创建营地
      const result = await createCamp(params);
      
      if (result.success) {
        // 显示成功消息
        setSuccessMessage(language === 'zh' ? '营地创建成功！正在等待数据同步...' : 'Camp created successfully! Waiting for data sync...');
        
        // 等待后端事件处理完成后再跳转
        const isReady = await waitForCampDataReady(result.campAddress);
        
        if (isReady) {
          // 清除成功消息，避免状态冲突
          setSuccessMessage('');
          
          // 添加短暂延迟，确保状态清理完成
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 数据同步完成后跳转到营地详情页
          navigate(`/camp/${result.campAddress}`, { replace: true });
        } else {
          // 如果数据同步失败，跳转到个人页面，用户可以在那里找到自己的营地
          setSuccessMessage('');
          console.log('数据同步超时，跳转到个人页面');
          navigate('/personal', { replace: true });
        }
      } else {
        setFormErrors({ 
          general: language === 'zh' 
            ? `创建营地失败: ${result.error}` 
            : `Failed to create camp: ${result.error}` 
        });
      }
    } catch (error) {
      console.error('创建营地失败:', error);
      setSuccessMessage('');
      setFormErrors({ 
        general: language === 'zh' 
          ? `创建营地失败: ${error.message}` 
          : `Failed to create camp: ${error.message}` 
      });
    }
  };
  
  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 格式化显示ETH值（用于显示当前设置的押金）
  const formatWeiToEth = (wei) => {
    try {
      return ethers.utils.formatEther(wei);
    } catch (error) {
      return '0';
    }
  };

  // 处理押金输入变化（直接以wei为单位）
  const handleDepositChange = (e) => {
    const value = e.target.value.trim();
    if (value === '' || !isNaN(parseInt(value))) {
      setDepositAmount(value);
    }
  };

  // 等待营地数据在后端准备就绪
  const waitForCampDataReady = async (campAddress) => {
    const maxRetries = 5; // 减少重试次数
    const retryInterval = 1000; // 缩短间隔时间
    
    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
      try {
        // 构建API URL，避免重复的/api路径
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
        const response = await fetch(`${apiUrl}/camps/${campAddress}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log(`营地数据已准备就绪 (检查 ${retryCount + 1} 次):`, result.data);
            return true;
          }
        }
        
        console.log(`营地数据尚未准备就绪，等待中... (检查 ${retryCount + 1}/${maxRetries})`);
        
        // 只在不是最后一次重试时等待
        if (retryCount < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
      } catch (error) {
        console.warn(`检查营地数据时出错 (尝试 ${retryCount + 1}):`, error);
        
        // 只在不是最后一次重试时等待
        if (retryCount < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
      }
    }
    
    console.log(`在 ${maxRetries} 次重试后，营地数据仍未就绪`);
    return false;
  };
  
  return (
    <div className="create-camp-container">
      {/* 注入自定义样式 */}
      <style>{customDatePickerStyles}</style>
      
      {/* 导航栏 */}
      <Navbar />
      
      {/* 主容器 */}
      <div className="container">
        <button className="back-btn" onClick={handleBack}>
          <FontAwesomeIcon icon="arrow-left" />
          {language === 'zh' ? "返回" : "Back"}
        </button>
        
        <div className="form-header">
          <h1>{language === 'zh' ? "创建挑战营地" : "Create Challenge Camp"}</h1>
          <p>
            {language === 'zh' 
              ? "设置您的挑战营地参数，开启一段激动人心的学习旅程" 
              : "Set up your challenge camp parameters to start an exciting learning journey"}
          </p>
        </div>
        
        {!isConnected && (
          <div className="wallet-status-warning">
            <FontAwesomeIcon icon="exclamation-triangle" />
            <p>{language === 'zh' ? "请先连接钱包以创建营地" : "Please connect your wallet to create a camp"}</p>
            <button className="connect-wallet-btn" onClick={() => window.location.reload()}>
              {language === 'zh' ? "连接钱包" : "Connect Wallet"}
            </button>
          </div>
        )}
        
        {error && (
          <div className="error-alert">
            <FontAwesomeIcon icon="exclamation-circle" />
            <p>{error}</p>
          </div>
        )}
        
        {formErrors.general && (
          <div className="error-alert">
            <FontAwesomeIcon icon="exclamation-circle" />
            <p>{formErrors.general}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="success-alert">
            <FontAwesomeIcon icon="check-circle" />
            <p>{successMessage}</p>
            {successMessage.includes('等待数据同步') || successMessage.includes('Waiting for data sync') ? (
              <div className="loading-spinner" style={{ marginTop: '10px' }}>
                <div className="spinner"></div>
                <small style={{ marginLeft: '10px', opacity: 0.8 }}>
                  {language === 'zh' ? '请耐心等待，这通常需要几秒钟...' : 'Please wait, this usually takes a few seconds...'}
                </small>
              </div>
            ) : null}
          </div>
        )}
        
        <form className="camp-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FontAwesomeIcon icon="flag" />
              {language === 'zh' ? "营地名称" : "Camp Name"}
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.name ? 'invalid' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              placeholder={language === 'zh' ? "输入营地名称" : "Enter camp name"}
              disabled={loading}
              required
            />
            {formErrors.name && <div className="error-message">{formErrors.name}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FontAwesomeIcon icon="calendar-alt" />
              {language === 'zh' ? "报名截止时间" : "Signup Deadline"}
            </label>
            <div className="custom-datepicker-wrapper">
              <DatePicker
                selected={signupDeadline}
                onChange={(date) => setSignupDeadline(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption={language === 'zh' ? "时间" : "Time"}
                dateFormat={language === 'zh' ? "yyyy年MM月dd日 HH:mm" : "MMMM d, yyyy h:mm aa"}
                className={`form-control ${formErrors.signupDeadline ? 'invalid' : ''}`}
                disabled={loading}
              />
              <FontAwesomeIcon icon="calendar-alt" className="calendar-icon" />
            </div>
            {formErrors.signupDeadline && <div className="error-message">{formErrors.signupDeadline}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FontAwesomeIcon icon="calendar-check" />
              {language === 'zh' ? "结营时间" : "Camp End Date"}
            </label>
            <div className="custom-datepicker-wrapper">
              <DatePicker
                selected={campEndDate}
                onChange={(date) => setCampEndDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption={language === 'zh' ? "时间" : "Time"}
                dateFormat={language === 'zh' ? "yyyy年MM月dd日 HH:mm" : "MMMM d, yyyy h:mm aa"}
                className={`form-control ${formErrors.campEndDate ? 'invalid' : ''}`}
                      disabled={loading}
              />
              <FontAwesomeIcon icon="calendar-alt" className="calendar-icon" />
            </div>
            {formErrors.campEndDate && <div className="error-message">{formErrors.campEndDate}</div>}
          </div>
            
          <div className="form-group">
            <label>
              <FontAwesomeIcon icon="mountain" />
              {language === 'zh' ? "关卡数量" : "Challenge Count"}
            </label>
            <input
              type="number"
              className={`form-control ${formErrors.challengeCount ? 'invalid' : ''}`}
              value={challengeCount}
              onChange={(e) => setChallengeCount(parseInt(e.target.value) || 0)}
              min="1"
              max="10"
              disabled={loading}
              required
            />
            {formErrors.challengeCount && <div className="error-message">{formErrors.challengeCount}</div>}
          </div>
          
          <div className="range-container">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon="users" />
                {language === 'zh' ? "最小参与者数量" : "Minimum Participants"}
              </label>
              <input
                type="number"
                className={`form-control ${formErrors.minParticipants ? 'invalid' : ''}`}
                value={minParticipants}
                onChange={(e) => setMinParticipants(parseInt(e.target.value) || 0)}
                min="1"
                disabled={loading}
                required
              />
              {formErrors.minParticipants && <div className="error-message">{formErrors.minParticipants}</div>}
            </div>
            
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon="users" />
                {language === 'zh' ? "最大参与者数量" : "Maximum Participants"}
              </label>
              <input
                type="number"
                className={`form-control ${formErrors.maxParticipants ? 'invalid' : ''}`}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)}
                min="1"
                disabled={loading}
                required
              />
              {formErrors.maxParticipants && <div className="error-message">{formErrors.maxParticipants}</div>}
            </div>
          </div>
            
          <div className="form-group">
            <label>
              <FontAwesomeIcon icon="coins" />
              {language === 'zh' ? "押金金额 (" : "Deposit Amount ("}
              <span className="wei-unit">WEI</span>
              {")"}
            </label>
            <input
              type="text"
              className={`form-control ${formErrors.depositAmount ? 'invalid' : ''}`}
                value={depositAmount}
              onChange={handleDepositChange}
              placeholder={language === 'zh' ? "输入押金金额 (WEI)" : "Enter deposit amount (WEI)"}
                disabled={loading}
                required
            />
            {depositAmount && !isNaN(parseInt(depositAmount)) && (
              <div className="deposit-info">
                {language === 'zh' ? "约等于 " : "Approximately "} 
                {formatWeiToEth(depositAmount)} ETH
              </div>
            )}
            <div className="deposit-note">
              {language === 'zh' 
                ? "注意：押金金额以 WEI 为单位，1 ETH = 10^18 WEI" 
                : "Note: Deposit amount is in WEI units, 1 ETH = 10^18 WEI"}
            </div>
            {formErrors.depositAmount && <div className="error-message">{formErrors.depositAmount}</div>}
          </div>
          
          <div className="submit-btn-container">
            <button 
                  type="submit"
              className={`submit-btn ${(loading || !isConnected) ? 'disabled' : ''}`}
                  disabled={loading || !isConnected}
                >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <FontAwesomeIcon icon="flag" />
                  <span>{language === 'zh' ? "创建营地" : "Create Camp"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampPage; 