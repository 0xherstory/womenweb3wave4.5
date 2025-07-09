import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faShieldAlt, faShieldVirus, faFlagCheckered, faMountain, faInfoCircle, faPlayCircle, faExclamationTriangle, faWallet, faCalendarAlt, faSave, faKey, faFileExport, faCopy } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/Navbar';
import { useWeb3 } from '../contexts/Web3Context';
import { useLanguage } from '../context/LanguageContext';
import { formatAddress } from '../utils/web3';

import '../styles/CreateLevel.scss';
import { library } from '@fortawesome/fontawesome-svg-core';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

// 引入FontAwesome图标库
library.add(faArrowLeft, faLock, faShieldAlt, faShieldVirus, faFlagCheckered, faMountain, faInfoCircle, faPlayCircle, faExclamationTriangle, faWallet, faCalendarAlt, faSave, faKey, faFileExport, faCopy);

const CreateLevelPage = () => {
  const { campId } = useParams();
  const navigate = useNavigate();
  const { isConnected, address, configChallenges, getCampInfo, checkCampState } = useWeb3();
  const { language } = useLanguage();
  
  // 状态
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordMode, setPasswordMode] = useState('basic'); // 'basic' 或 'advanced'
  const [passwordBase, setPasswordBase] = useState('');
  const [levelDates, setLevelDates] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formErrors, setFormErrors] = useState({
    password: '',
    dates: {}
  });
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  const [showPasswordsModal, setShowPasswordsModal] = useState(false);
  const [processingStep, setProcessingStep] = useState(''); // 'encrypting', 'saving', 'completed'

  // 获取营地数据
  useEffect(() => {
    const fetchCampData = async () => {
      try {
        setLoading(true);
        
        // 构建API URL，避免重复的/api路径
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
        const response = await fetch(`${apiUrl}/camps/${campId}`);
        
        if (!response.ok) {
          throw new Error(language === 'zh' ? '获取营地数据失败' : 'Failed to get camp data');
        }
        
        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error(language === 'zh' ? '营地数据无效' : 'Invalid camp data');
        }
        
        const campData = result.data;
        const formattedCamp = {
          id: campData.contract_address,
          name: campData.name,
          levels: campData.challenge_count,
          endDate: new Date(campData.camp_end_date * 1000).toISOString().split('T')[0],
          participants: campData.participant_count || 0,
          creator: campData.organizer_address,
          state: campData.state
        };
        
        // 检查是否为组织者
        if (address && formattedCamp.creator.toLowerCase() !== address.toLowerCase()) {
          throw new Error(language === 'zh' ? '只有组织者可以配置关卡' : 'Only organizer can configure levels');
        }
        
        // 检查营地状态
        console.log('营地状态检查:', {
          campState: campData.state,
          expectedState: 2,
          stateNames: ['Registration', 'Failed', 'Success', 'Challenging', 'Completed']
        });
        
        if (campData.state !== 2) { // 2是SUCCESS状态
          const stateNames = ['Registration', 'Failed', 'Success', 'Challenging', 'Completed'];
          const currentStateName = stateNames[campData.state] || 'Unknown';
          throw new Error(language === 'zh' 
            ? `营地当前状态不允许配置关卡。当前状态：${currentStateName}，需要状态：Success` 
            : `Camp state does not allow level configuration. Current state: ${currentStateName}, required: Success`);
        }
        
        setCamp(formattedCamp);
        setLoading(false);
      } catch (err) {
        console.error("获取营地数据错误:", err);
        setError(err.message || (language === 'zh' ? "获取数据失败，请稍后重试" : "Failed to get data, please try again"));
        setLoading(false);
      }
    };

    if (campId) {
      fetchCampData();
    }
  }, [campId, language, address]);

  // 从本地存储恢复表单数据并初始化flatpickr
  useEffect(() => {
    const savedData = localStorage.getItem('levelConfigData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setPasswordMode(parsedData.passwordMode || 'basic');
        setPasswordBase(parsedData.passwordBase || '');
        
        // 将字符串日期转换为Date对象
        const restoredLevelDates = {};
        if (parsedData.levelDates) {
          Object.keys(parsedData.levelDates).forEach(key => {
            const dateValue = parsedData.levelDates[key];
            if (dateValue) {
              // 如果是字符串，转换为Date对象
              restoredLevelDates[key] = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
            }
          });
        }
        setLevelDates(restoredLevelDates);
      } catch (e) {
        console.error('恢复表单数据失败', e);
      }
    }

    // 初始化flatpickr
    if (camp && camp.levels && !document.querySelector('.flatpickr-calendar')) {
      const today = new Date();
      const endDate = new Date(camp.endDate);
      
      // 动态加载flatpickr
      const loadFlatpickr = async () => {
        if (!window.flatpickr) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
          script.onload = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
            document.head.appendChild(link);
            initializeFlatpickrs();
          };
          document.head.appendChild(script);
        } else {
          initializeFlatpickrs();
        }
      };

      const initializeFlatpickrs = () => {
        for (let i = 1; i <= camp.levels; i++) {
          const input = document.getElementById(`level${i}Date`);
          if (input) {
            const savedDate = levelDates[i];
            
            const flatpickrInstance = window.flatpickr(input, {
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              minDate: today,
              maxDate: endDate,
              defaultDate: savedDate || null,
              minuteIncrement: 1,
              time_24hr: true,
              onChange: function(selectedDates, dateStr, instance) {
                if (selectedDates[0]) {
                  handleDateChange(i, selectedDates[0]);
                }
              }
            });

            // 设置已保存的值
            if (savedDate) {
              flatpickrInstance.setDate(savedDate);
            }
          }
        }
      };

      loadFlatpickr();
    }
  }, [camp]);

  // 保存表单数据到本地存储
  const saveFormData = () => {
    const formData = {
      passwordMode,
      passwordBase,
      levelDates
    };
    localStorage.setItem('levelConfigData', JSON.stringify(formData));
  };

  // 页面刷新确认
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (passwordBase || Object.keys(levelDates).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [passwordBase, levelDates]);

  // 处理密码模式选择
  const handleModeSelect = (mode) => {
    setPasswordMode(mode);
    saveFormData();
  };

  // 处理密码原文输入
  const handlePasswordChange = (e) => {
    setPasswordBase(e.target.value);
    saveFormData();
  };

  // 处理关卡日期选择
  const handleDateChange = (levelIndex, date) => {
    setLevelDates(prev => {
      const updated = { ...prev, [levelIndex]: date };
      // 保存更新后的数据
      const formData = {
        passwordMode,
        passwordBase,
        levelDates: updated
      };
      localStorage.setItem('levelConfigData', JSON.stringify(formData));
      
      // 显示临时成功提示
      const currentErrors = {...formErrors};
      setFormErrors({
        ...currentErrors,
        dates: {
          ...currentErrors.dates,
          [levelIndex]: language === 'zh' ? "✓ 时间已保存" : "✓ Time saved"
        }
      });
      
      // 2秒后清除成功提示
      setTimeout(() => {
        setFormErrors(prev => ({
          ...prev,
          dates: {
            ...prev.dates,
            [levelIndex]: ""
          }
        }));
      }, 2000);
      
      return updated;
    });
  };

  // 表单验证
  const validateForm = () => {
    let isValid = true;
    const errors = {
      password: '',
      dates: {}
    };
    
    // 验证密码原文
    if (!passwordBase) {
      errors.password = language === 'zh' ? "密码原文不能为空" : "Password cannot be empty";
      isValid = false;
    } else if (passwordBase.length > 128) {
      errors.password = language === 'zh' ? "密码长度不能超过128个字符" : "Password cannot exceed 128 characters";
      isValid = false;
    }
    
    // 验证日期
    if (camp) {
      const today = new Date();
      const endDate = new Date(camp.endDate);
      
      for (let i = 1; i <= camp.levels; i++) {
        if (!levelDates[i]) {
          errors.dates[i] = language === 'zh' ? "请设置关卡截止时间" : "Please set a deadline for this level";
          isValid = false;
        } else {
          const selectedDate = new Date(levelDates[i]);
          
          if (selectedDate < today) {
            errors.dates[i] = language === 'zh' ? "时间不能早于现在" : "Time cannot be earlier than now";
            isValid = false;
          } else if (selectedDate > endDate) {
            errors.dates[i] = language === 'zh' ? "时间不能晚于结营时间" : "Time cannot be later than camp end time";
            isValid = false;
          }
        }
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // 生成随机盐值
  const generateSalt = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  };

  // 使用SHA-256进行安全哈希
  const secureHash = (text, salt) => {
    // 将文本和盐值组合，然后进行SHA-256哈希
    return CryptoJS.SHA256(text + salt).toString(CryptoJS.enc.Hex);
  };

  // 生成通关密码原文
  const generatePasswords = () => {
    if (!passwordBase || !camp) return [];
    
    const passwords = [];
    const masterSalt = generateSalt(32); // 主盐值，用于增加整体安全性
    
    if (passwordMode === 'basic') {
      // 普通模式：为每个关卡生成一个密码
      for (let i = 1; i <= camp.levels; i++) {
        const levelSalt = generateSalt(16); // 每个关卡单独的盐值
        const y = `${passwordBase}_level_${i}_${masterSalt}`; // 密码原文y
        const z = secureHash(y, levelSalt); // 使用SHA-256加密，这是挑战者需要输入的密文b
        
        // 计算哈希值：keccak256(b) = c，这个c将存储到智能合约
        const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(z)).slice(2); // 移除0x前缀
        
        passwords.push({
          level: i,
          challengePassword: z, // 挑战者需要输入的密文b
          passwordHash: passwordHash, // 存储到智能合约的哈希值c
          displayText: z, // 用于显示给组织者
          salt: levelSalt // 保存盐值，方便验证
        });
      }
    } else {
      // 高级模式：为每个关卡每个参与者生成唯一密码
      for (let i = 1; i <= camp.levels; i++) {
        const levelPasswords = [];
        for (let j = 1; j <= camp.participants; j++) {
          const participantSalt = generateSalt(16); // 每个参与者单独的盐值
          const y = `${passwordBase}_level_${i}_participant_${j}_${masterSalt}`; // 密码原文y
          const z = secureHash(y, participantSalt); // 使用SHA-256加密，这是挑战者需要输入的密文b
          
          // 计算哈希值：keccak256(b) = c，这个c将存储到智能合约
          const passwordHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(z)).slice(2); // 移除0x前缀
          
          levelPasswords.push({
            level: i,
            participant: j,
            challengePassword: z, // 挑战者需要输入的密文b
            passwordHash: passwordHash, // 存储到智能合约的哈希值c
            displayText: z, // 用于显示给组织者
            salt: participantSalt // 保存盐值，方便验证
          });
        }
        passwords.push({
          level: i,
          participants: levelPasswords
        });
      }
    }
    
    return passwords;
  };
  
  // 前端加密处理
  const handleEncrypt = () => {
    setProcessingStep('encrypting');
    
    // 模拟加密处理延迟
    setTimeout(() => {
      const passwords = generatePasswords();
      setGeneratedPasswords(passwords);
      setProcessingStep('');
      setShowPasswordsModal(true);
    }, 1500);
  };
  
  // 复制密码到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(language === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };
  
  // 复制所有密文
  const copyAllPasswords = () => {
    if (!generatedPasswords || generatedPasswords.length === 0) return;
    
    let textToCopy = '';
    
    if (passwordMode === 'basic') {
      // 普通模式：复制所有关卡密文（挑战者需要输入的密文b）
      textToCopy = generatedPasswords.map(pass => 
        `${language === 'zh' ? '关卡' : 'Level'} #${pass.level}: ${pass.challengePassword}`
      ).join('\n');
    } else {
      // 高级模式：复制所有参与者密文（可能很长）
      textToCopy = language === 'zh' ? '高级模式密文数据量较大，已导出为文件' : 'Advanced mode has large amount of data, exported as file';
    }
    
    copyToClipboard(textToCopy);
  };
  
  // 导出密码为JSON文件
  const exportPasswords = () => {
    const dataStr = JSON.stringify(generatedPasswords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `level_passwords_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // 保存密码哈希到区块链
  const saveToBlockchain = async () => {
    try {
      setProcessingStep('saving');
      
      // 检查钱包连接状态
      if (!isConnected) {
        throw new Error(language === 'zh' ? '请先连接钱包' : 'Please connect wallet first');
      }
      
      // 再次检查营地状态
      console.log('保存前营地状态检查:', {
        campState: camp?.state,
        expectedState: 2,
        stateNames: ['Registration', 'Failed', 'Success', 'Challenging', 'Completed']
      });
      
      // 从智能合约直接获取状态
      try {
        const campInfo = await getCampInfo(campId);
        console.log('智能合约中的营地状态:', {
          contractState: campInfo.data?.state,
          frontendState: camp?.state,
          signupDeadline: campInfo.data?.signupDeadline,
          currentTimestamp: Math.floor(Date.now() / 1000),
          stateNames: ['Registration', 'Failed', 'Success', 'Challenging', 'Completed']
        });
        
        if (campInfo.data?.state !== 2) {
          const stateNames = ['Registration', 'Failed', 'Success', 'Challenging', 'Completed'];
          const contractStateName = stateNames[campInfo.data?.state] || 'Unknown';
          const frontendStateName = stateNames[camp?.state] || 'Unknown';
          
          // 如果合约状态是Registration且报名截止时间已过，自动更新状态
          if (campInfo.data?.state === 0 && campInfo.data?.signupDeadline < Math.floor(Date.now() / 1000)) {
            console.log('需要更新营地状态，自动调用checkCampState...');
            
            // 自动调用checkCampState
            const updateResult = await checkCampState(campId);
            if (!updateResult.success) {
              throw new Error(language === 'zh' 
                ? `更新营地状态失败: ${updateResult.error}` 
                : `Failed to update camp state: ${updateResult.error}`);
            }
            
            console.log('营地状态更新成功，重新获取状态...');
            
            // 重新获取营地状态
            const updatedCampInfo = await getCampInfo(campId);
            if (updatedCampInfo.data?.state !== 2) {
              const stateNames = ['Registration', 'Failed', 'Success', 'Challenging', 'Completed'];
              const newStateName = stateNames[updatedCampInfo.data?.state] || 'Unknown';
              throw new Error(language === 'zh' 
                ? `营地状态更新后仍不是Success状态。当前状态：${newStateName}` 
                : `Camp state is still not Success after update. Current state: ${newStateName}`);
            }
            
            console.log('营地状态已更新为Success，继续配置关卡...');
          }
          
          throw new Error(language === 'zh' 
            ? `营地状态不匹配。前端状态：${frontendStateName}，合约状态：${contractStateName}，需要状态：Success` 
            : `Camp state mismatch. Frontend state: ${frontendStateName}, Contract state: ${contractStateName}, required: Success`);
        }
      } catch (err) {
        console.error('获取智能合约状态失败:', err);
        // 如果无法获取合约状态，使用前端状态
        if (camp?.state !== 2) {
          const stateNames = ['Registration', 'Failed', 'Success', 'Challenging', 'Completed'];
          const currentStateName = stateNames[camp?.state] || 'Unknown';
          
          // 如果状态是Registration，尝试调用checkCampState
          if (camp?.state === 0) {
            console.log('营地状态为Registration，尝试调用checkCampState...');
            try {
              // 这里需要调用智能合约的checkCampState函数
              // 暂时抛出错误，提示用户先更新营地状态
              throw new Error(language === 'zh' 
                ? `营地状态为报名阶段，需要先更新营地状态。请返回营地详情页面，等待系统自动更新状态或手动触发状态更新。` 
                : `Camp is in registration state. Please return to camp detail page and wait for automatic state update or manually trigger state update.`);
            } catch (err) {
              throw err;
            }
          }
          
          throw new Error(language === 'zh' 
            ? `营地当前状态不允许配置关卡。当前状态：${currentStateName}，需要状态：Success` 
            : `Camp state does not allow level configuration. Current state: ${currentStateName}, required: Success`);
        }
      }
      
      // 准备要保存到区块链的数据
      const deadlines = [];
      const passwords = [];
      
      // 验证关卡数量
      if (!camp || !camp.levels) {
        throw new Error(language === 'zh' ? '营地关卡数量无效' : 'Invalid camp level count');
      }
      
      console.log('开始处理关卡数据:', {
        totalLevels: camp.levels,
        levelDatesKeys: Object.keys(levelDates),
        generatedPasswordsLength: generatedPasswords.length
      });
      
      for (let i = 1; i <= camp.levels; i++) {
        if (!levelDates[i]) {
          throw new Error(language === 'zh' ? `请设置第${i}关的截止时间` : `Please set deadline for level ${i}`);
        }
        
        // 确保日期是Date对象
        let dateObj = levelDates[i];
        if (typeof dateObj === 'string') {
          dateObj = new Date(dateObj);
        }
        
        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
          throw new Error(language === 'zh' ? `第${i}关的日期格式无效` : `Invalid date format for level ${i}`);
        }
        
        // 转换为时间戳
        const deadline = Math.floor(dateObj.getTime() / 1000);
        deadlines.push(deadline);
        
        // 获取对应关卡的密码哈希
        const levelPassword = generatedPasswords.find(p => p.level === i);
        if (!levelPassword) {
          throw new Error(language === 'zh' ? `第${i}关密码生成失败` : `Failed to generate password for level ${i}`);
        }
        
        // 使用正确的密码哈希值（c = hash(b)）
        let hashValue = levelPassword.passwordHash;
        
        console.log(`关卡${i}密码哈希处理:`, {
          originalHash: hashValue,
          hashLength: hashValue.length,
          hashType: typeof hashValue
        });
        
        if (hashValue.length !== 64) {
          throw new Error(language === 'zh' ? `第${i}关密码哈希格式错误，长度应为64字符，实际为${hashValue.length}字符` : `Invalid password hash format for level ${i}, expected 64 characters, got ${hashValue.length}`);
        }
        
        // 验证是否为有效的十六进制字符串
        if (!/^[0-9a-fA-F]{64}$/.test(hashValue)) {
          throw new Error(language === 'zh' ? `第${i}关密码哈希包含无效字符` : `Invalid characters in password hash for level ${i}`);
        }
        
        // 添加0x前缀（智能合约需要）
        hashValue = '0x' + hashValue;
        
        console.log(`关卡${i}最终哈希值:`, hashValue);
        passwords.push(hashValue);
      }
      
      // 添加调试信息
              console.log('配置关卡参数:', {
          campId,
          deadlines,
          passwords,
          passwordLengths: passwords.map(p => p.length),
          passwordTypes: passwords.map(p => typeof p),
          passwordSamples: passwords.map(p => p.substring(0, 10) + '...'),
          deadlineTypes: deadlines.map(d => typeof d),
          deadlineValues: deadlines,
          currentTimestamp: Math.floor(Date.now() / 1000),
          campEndDate: camp?.endDate ? Math.floor(new Date(camp.endDate).getTime() / 1000) : 'unknown'
        });
      
      // 调用Web3Context中的configChallenges函数
      const result = await configChallenges(campId, deadlines, passwords);
      
      if (!result.success) {
        throw new Error(result.error || '配置关卡失败');
      }
      
      // 保存关卡数据到后端数据库
      try {
        const challengesData = deadlines.map((deadline, index) => ({
          challengeIndex: index,
          deadline: deadline,
          passwordHash: passwords[index]
        }));
        
        console.log('准备保存关卡数据到数据库:', {
          campId,
          challengesCount: challengesData.length,
          sampleChallenge: challengesData[0]
        });
        
        // 构建API URL，避免重复的/api路径
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
        
        const saveChallengesResponse = await fetch(`${apiUrl}/camps/${campId}/challenges/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            challenges: challengesData
          })
        });
        
        if (saveChallengesResponse.ok) {
          const saveResult = await saveChallengesResponse.json();
          console.log('关卡数据保存成功:', saveResult);
        } else {
          const errorText = await saveChallengesResponse.text();
          console.warn('保存关卡数据到数据库失败:', {
            status: saveChallengesResponse.status,
            statusText: saveChallengesResponse.statusText,
            error: errorText
          });
        }
      } catch (error) {
        console.warn('保存关卡数据到数据库时出错:', error);
      }
      
      // 清除保存的表单数据
      localStorage.removeItem('levelConfigData');
      
      setProcessingStep('completed');
      
      // 3秒后关闭密码弹窗，跳转回营地详情页面
      setTimeout(() => {
        setShowPasswordsModal(false);
        navigate(`/camp/${campId}`);
      }, 3000);
    } catch (err) {
      console.error("保存到区块链出错:", err);
      setProcessingStep('');
      alert(language === 'zh' ? `操作失败: ${err.message}` : `Operation failed: ${err.message}`);
    }
  };

  // 提交表单
  const handleSubmit = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };
  
  // 返回按钮处理
  const handleBack = () => {
    if (passwordBase || Object.keys(levelDates).length > 0) {
      if (window.confirm(language === 'zh' ? '确定要返回吗？未保存的配置将会丢失。' : 'Are you sure you want to go back? Unsaved changes will be lost.')) {
        localStorage.removeItem('levelConfigData');
        navigate(`/camp/${campId}`);
      }
    } else {
      navigate(`/camp/${campId}`);
    }
  };

  // 自定义日期选择器样式
  const CustomDatePickerInput = React.forwardRef(({ value, onClick, placeholder, disabled }, ref) => (
    <div className="custom-datepicker-wrapper">
      <input
        className={`form-control`}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        ref={ref}
      />
      <FontAwesomeIcon 
        icon="calendar-alt" 
        className="calendar-icon" 
        onClick={disabled ? undefined : onClick}
      />
    </div>
  ));

  // 主渲染函数
  if (loading) {
    return (
      <div className="create-level-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === 'zh' ? "加载中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="create-level-container">
        <Navbar />
        <div className="error-container">
          <FontAwesomeIcon icon="exclamation-triangle" />
          <h2>{language === 'zh' ? "出错了" : "Error"}</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="action-btn">
            <FontAwesomeIcon icon="arrow-left" />
            {language === 'zh' ? "返回营地" : "Back to Camp"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-level-container">
      <Navbar />
      
      <div className="container">
        <div className="config-header">
          <h1>{language === 'zh' ? "配置挑战关卡" : "Configure Challenge Levels"}</h1>
          <p>{language === 'zh' ? "设置每个关卡的参数和密码，完成后将开启挑战模式" : "Set parameters and passwords for each level, then activate challenge mode"}</p>
          
          <div className="camp-info">
            <div className="info-card">
              <div className="label">{language === 'zh' ? "营地名称" : "Camp Name"}</div>
              <div className="value">{camp?.name}</div>
            </div>
            <div className="info-card">
              <div className="label">{language === 'zh' ? "关卡总数" : "Total Levels"}</div>
              <div className="value">{camp?.levels} {language === 'zh' ? "关" : ""}</div>
            </div>
            <div className="info-card">
              <div className="label">{language === 'zh' ? "结营日期" : "End Date"}</div>
              <div className="value">{camp?.endDate}</div>
            </div>
            <div className="info-card">
              <div className="label">{language === 'zh' ? "参与者" : "Participants"}</div>
              <div className="value">{camp?.participants} {language === 'zh' ? "人" : ""}</div>
            </div>
          </div>
          
          <button className="back-btn" onClick={handleBack}>
            <FontAwesomeIcon icon="arrow-left" />
            {language === 'zh' ? "返回营地" : "Back to Camp"}
          </button>
        </div>
        
        <div className="config-form">
          {/* 密码模式选择 */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon="lock" />
              {language === 'zh' ? " 密码安全等级" : " Password Security Level"}
            </h2>
            
            <div className="radio-group">
              <div 
                className={`radio-option ${passwordMode === 'basic' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('basic')}
              >
                <h3>
                  <FontAwesomeIcon icon="shield-alt" />
                  {language === 'zh' ? " 普通模式" : " Basic Mode"}
                </h3>
                <p>
                  {language === 'zh' 
                    ? "每关密文不同" 
                    : "Different passwords per level"}
                </p>
                <div className="mode-hint">
                  <FontAwesomeIcon icon="info-circle" />
                  {language === 'zh' 
                    ? "无法防止参与者之间的抄袭行为" 
                    : "Cannot prevent cheating between participants"}
                </div>
              </div>
              
              <div 
                className={`radio-option ${passwordMode === 'advanced' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('advanced')}
              >
                <h3>
                  <FontAwesomeIcon icon="shield-virus" />
                  {language === 'zh' ? " 高级模式" : " Advanced Mode"}
                </h3>
                <p>
                  {language === 'zh' 
                    ? "为每个参与者生成唯一密码" 
                    : "Generates unique passwords for each participant."}
                </p>
                <div className="mode-hint">
                  <FontAwesomeIcon icon="info-circle" />
                  {language === 'zh' 
                    ? " 每人每关密文唯一，安全性更高" 
                    : " Unique passwords per person and level"}
                </div>
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="passwordBase">
                {language === 'zh' ? "密码原文（用于生成所有关卡密码）" : "Password Base (used to generate all level passwords)"}
              </label>
              <input 
                type="text" 
                id="passwordBase" 
                className={`form-control ${formErrors.password ? 'invalid' : ''}`}
                placeholder={language === 'zh' ? "输入不可猜测的密码原文（最多128字符）" : "Enter an unpredictable password base (max 128 characters)"}
                maxLength="128"
                value={passwordBase}
                onChange={handlePasswordChange}
              />
              <div className="error-message">{formErrors.password}</div>
            </div>
          </div>
          
          {/* 关卡配置 */}
          <div className="form-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon="flag-checkered" />
              {language === 'zh' ? " 关卡配置" : " Level Configuration"}
            </h2>
            
            <div className="camp-form">
              {camp && Array.from({ length: camp.levels }, (_, i) => i + 1).map(levelIndex => (
                <div key={levelIndex} className="form-group">
                  <label htmlFor={`level${levelIndex}Date`}>
                    <FontAwesomeIcon icon="calendar-alt" />
                    {language === 'zh' ? ` 关卡 #${levelIndex} 截止时间` : ` Level #${levelIndex} Deadline`}
                  </label>
                  <input
                    type="text"
                    id={`level${levelIndex}Date`}
                    className={`form-control flatpickr-input ${formErrors.dates[levelIndex] ? 'invalid' : ''}`}
                    placeholder={language === 'zh' ? '选择截止日期和时间' : 'Select deadline date and time'}
                    readOnly
                    data-level={levelIndex}
                  />
                  <div className="error-message">{formErrors.dates[levelIndex]}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 钱包状态 */}
          <div className={`wallet-status ${isConnected ? 'wallet-connected' : 'wallet-disconnected'}`}>
            <FontAwesomeIcon icon="wallet" />
            {isConnected 
              ? <span>{language === 'zh' ? `钱包已连接：${formatAddress(address)}（组织者）` : `Wallet connected: ${formatAddress(address)} (Organizer)`}</span>
              : <span>{language === 'zh' ? "钱包未连接" : "Wallet not connected"}</span>
            }
          </div>
          
          {/* 提交按钮 */}
          <div className="submit-btn-container">
            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!isConnected}
            >
              <FontAwesomeIcon icon="play-circle" />
              {language === 'zh' ? "生成密码并开启关卡" : "Generate Passwords and Start Levels"}
            </button>
          </div>
        </div>
      </div>
      
      {/* 确认弹窗 */}
      {showConfirmModal && (
        <div className="confirm-modal active">
          <div className="modal-content">
            <h2>{language === 'zh' ? "确认生成通关密码" : "Confirm Password Generation"}</h2>
            <p>
              {language === 'zh' 
                ? "即将根据您的设置生成所有关卡密码，请选择下一步操作" 
                : "About to generate all level passwords based on your settings. Please choose the next step."}
            </p>
            
            <div className="warning-box">
              <p>
                <FontAwesomeIcon icon="exclamation-triangle" />
                {language === 'zh' 
                  ? " 重要提示：请妥善保存密码信息，密码生成后无法再次查看" 
                  : " Important: Please save password information. It cannot be viewed again after generation."}
              </p>
              <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                <li>{language === 'zh' ? "密码原文：" : "Password Base: "}<span>{passwordBase}</span></li>
                <li>
                  {language === 'zh' ? "密码模式：" : "Password Mode: "}
                  <span>{passwordMode === 'basic' ? (language === 'zh' ? "普通模式" : "Basic Mode") : (language === 'zh' ? "高级模式" : "Advanced Mode")}</span>
                </li>
                <li>{language === 'zh' ? "生成时间：" : "Generation Time: "}<span>{new Date().toLocaleString()}</span></li>
              </ul>
            </div>
            
            <div className="modal-buttons three-buttons">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setShowConfirmModal(false)}
              >
                {language === 'zh' ? "取消" : "Cancel"}
              </button>
              <button 
                className="modal-btn encrypt-btn" 
                onClick={handleEncrypt}
              >
                <FontAwesomeIcon icon="key" />
                {language === 'zh' ? "前端加密" : "Frontend Encryption"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 密码展示弹窗 */}
      {showPasswordsModal && (
        <div className="confirm-modal active">
          <div className="modal-content passwords-modal">
            <h2>
              {processingStep === 'encrypting' 
                ? (language === 'zh' ? "正在生成密码..." : "Generating passwords...") 
                : processingStep === 'saving'
                  ? (language === 'zh' ? "正在保存到区块链..." : "Saving to blockchain...")
                  : processingStep === 'completed'
                    ? (language === 'zh' ? "操作成功！" : "Operation successful!")
                    : (language === 'zh' ? "密码已生成" : "Passwords Generated")}
            </h2>
            
            {processingStep ? (
              <div className="processing-container">
                <div className="loading-spinner"></div>
                <p>
                  {processingStep === 'encrypting' 
                    ? (language === 'zh' ? "正在加密处理中，请稍候..." : "Encrypting, please wait...")
                    : processingStep === 'saving'
                      ? (language === 'zh' ? "正在将密码哈希保存到区块链..." : "Saving password hashes to blockchain...")
                      : (language === 'zh' ? "操作已完成，即将跳转..." : "Operation completed, redirecting...")}
                </p>
              </div>
            ) : (
              <>
                <div className="passwords-container">
                  {passwordMode === 'basic' ? (
                    <div className="basic-passwords">
                      <p className="passwords-intro">
                        {language === 'zh' 
                          ? "以下是生成的关卡密码，请妥善保存。参与者完成任务后，您需要向他们提供对应关卡的密文。" 
                          : "Below are the generated level passwords. Please save them securely. You'll need to provide these to participants after they complete each level."}
                      </p>
                      <div className="copy-all-container">
                        <button className="copy-all-btn" onClick={copyAllPasswords}>
                          <FontAwesomeIcon icon="copy" />
                          {language === 'zh' ? " 复制全部密文" : " Copy All Passwords"}
                        </button>
                      </div>
                      <table className="passwords-table">
                        <thead>
                          <tr>
                            <th>{language === 'zh' ? "关卡" : "Level"}</th>
                            <th>{language === 'zh' ? "密文" : "Password"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {generatedPasswords.map(pass => (
                            <tr key={pass.level}>
                              <td>{language === 'zh' ? `关卡 #${pass.level}` : `Level #${pass.level}`}</td>
                              <td className="password-cell">{pass.challengePassword}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="advanced-passwords">
                      <p className="passwords-intro">
                        {language === 'zh' 
                          ? "已为每个参与者生成唯一密码。由于数据量较大，建议导出为文件保存。" 
                          : "Unique passwords have been generated for each participant. Due to the large amount of data, we recommend exporting as a file."}
                      </p>
                      <div className="export-container">
                        <button className="export-btn" onClick={exportPasswords}>
                          <FontAwesomeIcon icon="file-export" />
                          {language === 'zh' ? " 导出密码文件" : " Export Passwords"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="modal-buttons">
                  <button 
                    className="modal-btn save-btn" 
                    onClick={saveToBlockchain}
                  >
                    <FontAwesomeIcon icon="play-circle" />
                    {language === 'zh' ? "合约密文保存" : "Save to Contract"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLevelPage; 