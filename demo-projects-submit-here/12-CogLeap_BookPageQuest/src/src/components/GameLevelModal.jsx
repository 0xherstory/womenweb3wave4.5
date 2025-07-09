import React, { useEffect } from 'react';

const GameLevelModal = ({ isOpen, onClose, level, onStartChallenge }) => {
  useEffect(() => {
    // 按下 Escape 键关闭弹窗
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen || !level) return null;

  const rarityColorClasses = {
    '新手教程': 'border-neon-pink/50 text-neon-pink',
    '青铜段位': 'border-neon-blue/50 text-neon-blue',
    '白银段位': 'border-gray-500 text-gray-400',
    '黄金段位': 'border-yellow-500/50 text-yellow-500',
  };

  const getRarityClasses = (rank) => {
    return rarityColorClasses[rank] || 'border-gray-500 text-gray-400';
  };

  const handleStartMission = () => {
    alert(`任务开始：${level.title}！\n(游戏逻辑尚未实现)`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-dark-800 border border-web3-primary/30 rounded-lg shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={e => e.stopPropagation()} // 防止点击弹窗内部关闭
      >
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* 背景装饰 */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-web3-primary/10 rounded-full filter blur-[50px] -z-10"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-neon-pink/10 rounded-full filter blur-[50px] -z-10"></div>

          {/* 左侧：全息投影 */}
          <div className="flex flex-col items-center justify-center text-center md:border-r border-gray-700/50 pr-6">
            <div className="w-32 h-32 flex items-center justify-center animate-float">
              <i className={`fa ${level.icon} text-8xl ${getRarityClasses(level.rank)} text-shadow-neon`}></i>
            </div>
            <div className={`mt-4 font-bold text-lg ${getRarityClasses(level.rank)}`}>
              {level.rank}
            </div>
            <div className="text-sm text-gray-400">
              难度评估
            </div>
          </div>

          {/* 右侧：任务详情 */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-2 text-white text-shadow-web3">{level.title}</h2>
            <p className="text-gray-400 mb-6">{level.description}</p>
            
            <div className="bg-dark-900/50 p-4 rounded-lg mb-6 border border-gray-700/50">
                <h4 className="font-semibold text-web3-primary mb-2"> <i className="fa fa-quote-left mr-2"></i> 诡辩示例</h4>
                <p className="italic text-gray-300">"{level.example}"</p>
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-web3-primary mb-2"><i className="fa fa-gift mr-2"></i> 任务奖励</h4>
                <div className="flex space-x-4">
                    <div className="bg-dark-700/80 p-2 px-3 rounded-lg flex items-center">
                        <i className="fa fa-diamond text-web3-primary mr-2"></i>
                        <span className="font-bold text-white">{level.reward.arg} ARG</span>
                    </div>
                    {level.reward.nft && (
                        <div className="bg-dark-700/80 p-2 px-3 rounded-lg flex items-center">
                            <i className="fa fa-certificate text-neon-purple mr-2"></i>
                            <span className="font-bold text-white">{level.reward.nft}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded bg-dark-700 hover:bg-dark-800 border border-gray-600 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => onStartChallenge(level)}
                className="px-6 py-2 rounded bg-neon-blue text-dark-900 font-bold hover:bg-blue-400 transition-all button-glow-blue"
              >
                开始挑战
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameLevelModal; 