import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faTimesCircle, 
  faCheckCircle, 
  faRunning, 
  faFlagCheckered,
  faUser,
  faFlag,
  faSignInAlt,
  faCampground,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Personal.scss';

// 状态映射函数
const getStatusFromState = (state) => {
  switch (state) {
    case 0: return 'signup';      // 报名阶段
    case 1: return 'failed';      // 开营失败
    case 2: return 'success';     // 开营成功
    case 3: return 'running';     // 闯关阶段
    case 4: return 'completed';   // 已结营
    default: return 'signup';
  }
};

const PersonalPage = () => {
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useWeb3();
  const { language, toggleLanguage } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('created');
  const [campsData, setCampsData] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 状态图标映射
  const statusIconMap = {
    "signup": faUserPlus,
    "failed": faTimesCircle,
    "success": faCheckCircle,
    "running": faRunning,
    "completed": faFlagCheckered
  };
  
  // 状态名称映射
  const statusNameMap = {
    "signup": language === 'zh' ? "报名开始" : "Signup Open",
    "failed": language === 'zh' ? "开营失败" : "Failed to Start",
    "success": language === 'zh' ? "开营成功" : "Started Successfully",
    "running": language === 'zh' ? "闯关模式" : "Challenge Mode",
    "completed": language === 'zh' ? "已结营" : "Completed"
  };

  // 从后端API获取营地数据
  const fetchCampsData = async () => {
    if (!account) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 构建API URL，避免重复的/api路径
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      
      // 并行获取三种类型的营地数据
      const [createdResponse, participatedResponse, availableResponse] = await Promise.all([
        fetch(`${apiUrl}/camps/organizer/${account}`),
        fetch(`${apiUrl}/camps/participant/${account}`),
        fetch(`${apiUrl}/camps/available/${account}`)
      ]);

      const [createdResult, participatedResult, availableResult] = await Promise.all([
        createdResponse.json(),
        participatedResponse.json(),
        availableResponse.json()
      ]);

      console.log('获取到的营地数据:', { createdResult, participatedResult, availableResult });

      // 转换数据格式
      const allCamps = [];
      
      // 用户创建的营地
      if (createdResult.success && createdResult.data) {
        createdResult.data.forEach(camp => {
          allCamps.push({
            id: camp.contract_address,
            name: camp.name,
            status: getStatusFromState(camp.state),
            signupDeadline: new Date(camp.signup_deadline * 1000).toISOString().split('T')[0],
            challenges: camp.challenge_count,
            participants: camp.participant_count || 0,
            date: new Date(camp.created_at * 1000).toISOString().split('T')[0],
            type: 'created'
          });
        });
      }

      // 用户参与的营地
      if (participatedResult.success && participatedResult.data) {
        participatedResult.data.forEach(camp => {
          allCamps.push({
            id: camp.contract_address,
            name: camp.name,
            status: getStatusFromState(camp.state),
            signupDeadline: new Date(camp.signup_deadline * 1000).toISOString().split('T')[0],
            challenges: camp.challenge_count,
            participants: camp.participant_count || 0,
            date: new Date(camp.created_at * 1000).toISOString().split('T')[0],
            type: 'participated'
          });
        });
      }

      // 可参与的营地
      if (availableResult.success && availableResult.data) {
        availableResult.data.forEach(camp => {
          allCamps.push({
            id: camp.contract_address,
            name: camp.name,
            status: getStatusFromState(camp.state),
            signupDeadline: new Date(camp.signup_deadline * 1000).toISOString().split('T')[0],
            challenges: camp.challenge_count,
            participants: camp.participant_count || 0,
            date: new Date(camp.created_at * 1000).toISOString().split('T')[0],
            type: 'available'
          });
        });
      }

      // 数据清洗与去重
      const campMap = new Map();
      allCamps.forEach(camp => {
        if (!campMap.has(camp.id)) {
          campMap.set(camp.id, camp);
        } else {
          const existingCamp = campMap.get(camp.id);
          // 优先保留 'created' 和 'participated' 类型
          if (camp.type === 'created') {
            campMap.set(camp.id, camp);
          } else if (camp.type === 'participated' && existingCamp.type !== 'created') {
            campMap.set(camp.id, camp);
          }
        }
      });

      const uniqueCamps = Array.from(campMap.values());
      setCampsData(uniqueCamps);
    } catch (error) {
      console.error('获取营地数据失败:', error);
      setError(error.message);
      setCampsData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载营地数据
  useEffect(() => {
    if (isConnected && account) {
      fetchCampsData();
    } else {
      setLoading(false);
    }
  }, [isConnected, account]);

  // 当activeTab变化时，过滤营地
  useEffect(() => {
    filterCamps(activeTab);
  }, [activeTab, campsData]);

  // 过滤营地数据
  const filterCamps = (type) => {
    const filtered = campsData.filter(camp => camp.type === type);
    
    // 按报名截止日期倒序排列
    const sorted = [...filtered].sort((a, b) => 
      new Date(b.signupDeadline) - new Date(a.signupDeadline)
    );
    
    setFilteredCamps(sorted);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 处理标签页切换
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 处理点击营地卡片
  const handleCampClick = (campId) => {
    navigate(`/camp/${campId}`);
  };

  // 处理语言切换
  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  // 获取空状态消息
  const getEmptyMessage = () => {
    if (activeTab === 'created') {
      return language === 'zh' 
        ? "您还没有发起任何营地，点击右上角按钮创建新营地" 
        : "You haven't created any camps yet, click the button in the top right to create a new camp";
    } else if (activeTab === 'participated') {
      return language === 'zh'
        ? "您尚未参与任何营地，快去发现并加入您感兴趣的营地吧"
        : "You haven't participated in any camps yet, go discover and join camps that interest you";
    } else {
      return language === 'zh'
        ? "当前没有可参与的营地，请稍后再来查看"
        : "There are no available camps at the moment, please check back later";
    }
  };

  return (
    <div className="personal-page">
      {/* 背景装饰元素 */}
      <div className="background-elements">
        <div className="bg-element bg-red"></div>
        <div className="bg-element bg-purple"></div>
      </div>
      
      {/* 顶部导航栏 */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')}>FTW<span>.gold</span></div>
        <div className="user-menu">
          <div className="language-switcher">
            <button className="lang-btn" onClick={handleLanguageToggle}>
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
          <button className="user-btn">
            <FontAwesomeIcon icon={faUser} />
          </button>
        </div>
      </nav>
      
      {/* 主容器 */}
      <div className="container">
        {/* 用户资料区 */}
        <div className="profile-section">
          <div className="avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="user-info">
            <h1>{language === 'zh' ? "挑战者007" : "Challenger007"}</h1>
            <p>{account || "0x7429F1b9cD45e67fE8c4d8c6b7a89c4D1"}</p>
          </div>
        </div>
        
        {/* 标签页导航 */}
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => handleTabChange('created')}
          >
            <FontAwesomeIcon icon={faFlag} /> {language === 'zh' ? "发起" : "Created"}
            <span className="count">{campsData.filter(camp => camp.type === 'created').length}</span>
          </div>
          <div 
            className={`tab ${activeTab === 'participated' ? 'active' : ''}`}
            onClick={() => handleTabChange('participated')}
          >
            <FontAwesomeIcon icon={faRunning} /> {language === 'zh' ? "已参与" : "Participated"}
            <span className="count">{campsData.filter(camp => camp.type === 'participated').length}</span>
          </div>
          <div 
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => handleTabChange('available')}
          >
            <FontAwesomeIcon icon={faSignInAlt} /> {language === 'zh' ? "可参与" : "Available"}
            <span className="count">{campsData.filter(camp => camp.type === 'available').length}</span>
          </div>
        </div>
        
        {/* 营地卡片网格 */}
        <div className="camps-grid">
          {!isConnected ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faUser} />
              <h3>{language === 'zh' ? "请先连接钱包" : "Please connect your wallet"}</h3>
              <p>{language === 'zh' ? "连接钱包后查看您的营地信息" : "Connect your wallet to view your camp information"}</p>
              <button className="connect-btn" onClick={connectWallet}>
                {language === 'zh' ? "连接钱包" : "Connect Wallet"}
              </button>
            </div>
          ) : loading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} className="loading-spinner" />
              <h3>{language === 'zh' ? "正在加载营地数据..." : "Loading camps data..."}</h3>
            </div>
          ) : error ? (
            <div className="error-state">
              <FontAwesomeIcon icon={faTimesCircle} />
              <h3>{language === 'zh' ? "加载失败" : "Loading Failed"}</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchCampsData}>
                {language === 'zh' ? "重试" : "Retry"}
              </button>
            </div>
          ) : filteredCamps.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faCampground} />
              <h3>{language === 'zh' ? "没有找到营地" : "No camps found"}</h3>
              <p>{getEmptyMessage()}</p>
            </div>
          ) : (
            filteredCamps.map(camp => (
              <div 
                key={camp.id} 
                className={`camp-card ${camp.status}`}
                onClick={() => handleCampClick(camp.id)}
              >
                <h2>{camp.name}</h2>
                <div className="camp-date">
                  {language === 'zh' ? "报名截止: " : "Deadline: "}
                  {formatDate(camp.signupDeadline)}
                </div>
                <div className="status-indicator">
                  <FontAwesomeIcon icon={statusIconMap[camp.status]} />
                  <div className="status-tooltip">{statusNameMap[camp.status]}</div>
                </div>
                <div className="camp-footer">
                  <div>
                    <div className="value">{camp.challenges}</div>
                    <div className="label">
                      {language === 'zh' ? "关卡总数" : "Challenges"}
                    </div>
                  </div>
                  <div>
                    <div className="value">{camp.participants}</div>
                    <div className="label">
                      {language === 'zh' ? "已报名人数" : "Participants"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalPage; 