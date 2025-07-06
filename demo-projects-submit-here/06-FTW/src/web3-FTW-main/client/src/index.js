import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import './styles/globals.scss';

// Font Awesome 图标库设置
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faFlag, faCalendarAlt, faCalendarCheck, faMountain, 
  faUsers, faCoins, faCheckCircle, faArrowLeft,
  faRunning, faWallet, faShieldAlt, faUser, faSignOutAlt,
  faUserCircle, faExclamationTriangle, faExclamationCircle,
  faUserPlus, faSpinner, faFlagCheckered
} from '@fortawesome/free-solid-svg-icons';
import { faEthereum, faBitcoin } from '@fortawesome/free-brands-svg-icons';

// 添加需要使用的图标到库
library.add(
  faFlag, faCalendarAlt, faCalendarCheck, faMountain, 
  faUsers, faCoins, faCheckCircle, faArrowLeft,
  faRunning, faWallet, faShieldAlt, faEthereum, faBitcoin,
  faUser, faSignOutAlt, faUserCircle, faExclamationTriangle, faExclamationCircle,
  faUserPlus, faSpinner, faFlagCheckered
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Web3Provider>
    </BrowserRouter>
  </React.StrictMode>
); 