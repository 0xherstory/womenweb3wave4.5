import React, { useState } from 'react';

const Market = ({ isAuthenticated }) => {
  const [marketItems, setMarketItems] = useState([
    {
      id: 1,
      name: '数据核弹',
      description: '用精确数据彻底摧毁对方论点',
      price: 25,
      rarity: '稀有',
      rarityColor: 'bg-web3-primary/80',
      borderColor: 'border-neon-blue/20 hover:border-neon-blue/40',
      textColor: 'text-neon-blue',
      icon: 'fa-database'
    },
    {
      id: 2,
      name: '双标扫描仪',
      description: '瞬间识别并揭露对方的双重标准',
      price: 45,
      rarity: '史诗',
      rarityColor: 'bg-neon-purple/80',
      borderColor: 'border-neon-pink/20 hover:border-neon-pink/40',
      textColor: 'text-neon-pink',
      icon: 'fa-search'
    },
    {
      id: 3,
      name: '逻辑护盾',
      description: '抵御一次人身攻击，并恢复逻辑值',
      price: 15,
      rarity: '普通',
      rarityColor: 'bg-web3-secondary/80',
      borderColor: 'border-neon-green/20 hover:border-neon-green/40',
      textColor: 'text-neon-green',
      icon: 'fa-shield'
    }
  ]);

  const handleBuy = (item) => {
    alert(`成功购买 ${item.name}！\n花费了 ${item.price} ARG。`);
    // 在真实场景中，这里会调用智能合约方法
  };

  return (
    <div className="bg-dark-800/70 backdrop-blur-md rounded-lg border border-web3-primary/30 p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">工具市场</h2>
        <button 
          disabled={!isAuthenticated}
          className={`text-web3-primary hover:text-web3-primary/80 transition-colors ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          查看全部 <i className="fa fa-arrow-right ml-1"></i>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketItems.map(item => (
          <div key={item.id} className={`bg-dark-700/60 rounded-lg p-3 border ${item.borderColor} transition-all duration-300 flex flex-col ${!isAuthenticated ? 'opacity-60' : ''}`}>
            <div className="relative mb-2 flex-grow flex items-center justify-center">
              <div className={`w-full h-24 rounded-lg bg-dark-800/50 flex items-center justify-center`}>
                <i className={`fa ${item.icon} ${item.textColor} text-4xl`}></i>
              </div>
              <div className={`absolute top-2 right-2 ${item.rarityColor} text-white text-xs px-2 py-1 rounded`}>
                {item.rarity}
              </div>
            </div>
            <div className="text-center">
              <div className={`${item.textColor} font-medium mb-1`}>{item.name}</div>
              <div className="text-sm text-gray-300 mb-3 h-10">{item.description}</div>
            </div>
            <div className="flex justify-between items-center mt-auto">
              <div className="text-web3-primary font-bold">
                <i className="fa fa-diamond mr-1"></i> {item.price} ARG
              </div>
              <button 
                disabled={!isAuthenticated}
                onClick={() => handleBuy(item)}
                className={`bg-web3-primary/20 hover:bg-web3-primary/30 text-web3-primary text-xs px-3 py-1 rounded transition-colors ${!isAuthenticated ? 'cursor-not-allowed' : ''}`}
              >
                购买
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Market; 