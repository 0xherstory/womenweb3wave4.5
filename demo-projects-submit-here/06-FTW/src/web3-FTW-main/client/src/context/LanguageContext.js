import React, { createContext, useState, useContext } from 'react';

// 创建语言上下文
const LanguageContext = createContext();

// 上下文提供者组件
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh'); // 默认中文
  
  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'zh' ? 'en' : 'zh'));
  };
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用上下文的自定义Hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage必须在LanguageProvider内部使用');
  }
  return context;
}; 