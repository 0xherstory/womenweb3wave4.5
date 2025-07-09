import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Navbar = () => {
  const { isConnected, connect, disconnect, account } = useWeb3();
  const { language, toggleLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  // 点击外部关闭下拉菜单
  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-menu')) {
      setDropdownOpen(false);
    }
  };
  
  // 添加点击外部关闭下拉菜单的事件监听
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };
  
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        FTW<span>.gold</span>
      </Link>
      
      <div className="user-menu">
        <div className="language-switcher">
          <button className="lang-btn" onClick={toggleLanguage}>
            {language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
        
        <button className="user-btn" onClick={toggleDropdown}>
          <FontAwesomeIcon icon="user" className="user-icon" />
        </button>
        
        <div className={`dropdown ${dropdownOpen ? 'active' : ''}`}>
          <div className="dropdown-item" onClick={isConnected ? disconnect : handleConnect}>
            <FontAwesomeIcon icon={isConnected ? "sign-out-alt" : "wallet"} />
            <div>
              <h4>
                {isConnected 
                  ? (language === 'zh' ? '断开连接' : 'Disconnect') 
                  : (language === 'zh' ? '连接钱包' : 'Connect Wallet')}
              </h4>
              {isConnected && <p>{truncateAddress(account)}</p>}
            </div>
          </div>
          
          {isConnected && (
            <Link to="/personal" className="dropdown-item">
              <FontAwesomeIcon icon="user-circle" />
              <div>
                <h4>{language === 'zh' ? '个人空间' : 'Profile'}</h4>
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 