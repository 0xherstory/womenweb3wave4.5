import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faTimesCircle, 
  faCheckCircle, 
  faRunning, 
  faFlagCheckered, 
  faPlus,
  faCampground,
  faUser,
  faWallet,
  faUserCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Camps.scss';

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

const CampsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const { language, toggleLanguage } = useLanguage();
  
  // 从URL参数中获取默认筛选状态
  const queryParams = new URLSearchParams(location.search);
  const defaultFilter = queryParams.get('filter') || 'all';
  
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [campsData, setCampsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownActive, setDropdownActive] = useState(false);

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
    try {
      setLoading(true);
      setError(null);
      
      // 构建API URL，避免重复的/api路径
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const response = await fetch(`${apiUrl}/camps`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('获取到的营地数据:', result);
      
      if (result.success && result.data) {
        // 转换数据格式
        const formattedCamps = result.data.map(camp => ({
          id: camp.contract_address,
          name: camp.name,
          status: getStatusFromState(camp.state),
          signupDeadline: new Date(camp.signup_deadline * 1000).toISOString().split('T')[0],
          challenges: camp.challenge_count,
          participants: camp.participant_count || 0,
          date: new Date(camp.created_at * 1000).toISOString().split('T')[0],
          campEndDate: new Date(camp.camp_end_date * 1000).toISOString().split('T')[0],
          minParticipants: camp.min_participants,
          maxParticipants: camp.max_participants,
          deposit: camp.deposit_amount,
          creator: camp.organizer_address
        }));
        
        setCampsData(formattedCamps);
      } else {
        setCampsData([]);
      }
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
    fetchCampsData();
  }, []);

  // 处理筛选
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    // 更新URL参数，但不刷新页面
    const newUrl = filter === 'all' 
      ? '/camps' 
      : `/camps?filter=${filter}`;
    window.history.replaceState(null, '', newUrl);
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

  // 筛选营地数据
  const filteredCamps = activeFilter === 'all'
    ? campsData
    : campsData.filter(camp => camp.status === activeFilter);

  // 按报名截止日期倒序排列
  const sortedCamps = [...filteredCamps].sort((a, b) => 
    new Date(b.signupDeadline) - new Date(a.signupDeadline)
  );

  // 处理创建营地按钮点击
  const handleCreateCamp = () => {
    if (!isConnected) {
      // 如果未连接钱包，应该提示连接钱包
      connectWallet();
    } else {
      navigate('/create-camp');
    }
  };

  // 处理点击营地卡片
  const handleCampClick = (campId) => {
    navigate(`/camp/${campId}`);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = () => {
    setDropdownActive(!dropdownActive);
  };

  // 处理点击页面其他区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownActive && !event.target.closest('.user-menu')) {
        setDropdownActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownActive]);

  // 处理语言切换
  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  // 处理个人空间点击
  const handlePersonalSpace = () => {
    navigate('/personal');
  };

  return (
    <div className="camps-page">
      {/* 背景装饰元素 */}
      <div className="background-elements">
        <div className="bg-element bg-red"></div>
        <div className="bg-element bg-purple"></div>
      </div>
      
      {/* 顶部导航栏 */}
      <nav className="navbar">
        <div className="logo">FTW<span>.gold</span></div>
        <div className="user-menu">
          <div className="language-switcher">
            <button className="lang-btn" onClick={handleLanguageToggle}>
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
          <button className="user-btn" onClick={handleUserMenuClick}>
            <FontAwesomeIcon icon={faUser} />
          </button>
          <div className={`dropdown ${dropdownActive ? 'active' : ''}`}>
            <div className="dropdown-item">
              <FontAwesomeIcon icon={faWallet} />
              <div>
                <h4>{language === 'zh' ? '钱包' : 'Wallet'}</h4>
                {isConnected ? (
                  <p>{account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : '0x12...9c8d'}</p>
                ) : (
                  <p onClick={connectWallet} style={{ cursor: 'pointer', color: '#d32222' }}>
                    {language === 'zh' ? '连接钱包' : 'Connect Wallet'}
                  </p>
                )}
              </div>
            </div>
            <div className="dropdown-item" onClick={handlePersonalSpace}>
              <FontAwesomeIcon icon={faUserCircle} />
              <div>
                <h4>{language === 'zh' ? '个人空间' : 'Personal Space'}</h4>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主容器 */}
      <div className="container">
        <div className="header">
          <h1>{language === 'zh' ? "挑战营总览" : "Camps Overview"}</h1>
          <button className="create-btn" onClick={handleCreateCamp}>
            <FontAwesomeIcon icon={faPlus} />
            {language === 'zh' ? "创建新营地" : "Create New Camp"}
          </button>
        </div>
        
        {/* 筛选菜单 */}
        <div className="filter-menu">
          <button 
            className={`filter-btn all ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            {language === 'zh' ? "全部营地" : "All Camps"}
          </button>
          <button 
            className={`filter-btn signup ${activeFilter === 'signup' ? 'active' : ''}`}
            onClick={() => handleFilterChange('signup')}
          >
            {language === 'zh' ? "报名开始" : "Signup Open"}
          </button>
          <button 
            className={`filter-btn failed ${activeFilter === 'failed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('failed')}
          >
            {language === 'zh' ? "开营失败" : "Failed to Start"}
          </button>
          <button 
            className={`filter-btn success ${activeFilter === 'success' ? 'active' : ''}`}
            onClick={() => handleFilterChange('success')}
          >
            {language === 'zh' ? "开营成功" : "Started Successfully"}
          </button>
          <button 
            className={`filter-btn running ${activeFilter === 'running' ? 'active' : ''}`}
            onClick={() => handleFilterChange('running')}
          >
            {language === 'zh' ? "闯关模式" : "Challenge Mode"}
          </button>
          <button 
            className={`filter-btn completed ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            {language === 'zh' ? "已结营" : "Completed"}
          </button>
        </div>
      
        {/* 营地卡片网格 */}
        <div className="camps-grid">
          {loading ? (
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
          ) : sortedCamps.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faCampground} />
              <h3>
                {activeFilter === 'all' 
                  ? (language === 'zh' ? "暂无营地" : "No camps available")
                  : (language === 'zh' ? "没有找到匹配的营地" : "No matching camps found")
                }
              </h3>
              <p>
                {activeFilter === 'all'
                  ? (language === 'zh' ? "还没有创建任何营地，快来创建第一个营地吧！" : "No camps created yet, create the first one!")
                  : (language === 'zh' ? "尝试选择其他筛选条件或创建新营地" : "Try selecting other filters or create a new camp")
                }
              </p>
              {activeFilter === 'all' && (
                <button className="create-btn-empty" onClick={handleCreateCamp}>
                  <FontAwesomeIcon icon={faPlus} />
                  {language === 'zh' ? "创建营地" : "Create Camp"}
                </button>
              )}
            </div>
          ) : (
            sortedCamps.map(camp => (
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

export default CampsPage; 