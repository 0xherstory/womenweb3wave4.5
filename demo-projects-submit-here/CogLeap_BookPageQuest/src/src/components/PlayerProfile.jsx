import React, { useState, useEffect } from 'react';

const PlayerProfile = ({ playerData, onSaveNickname, isAuthenticated, walletAddress }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (playerData) {
      setEditedName(playerData.nickname);
    }
  }, [playerData]);

  if (!playerData) {
    return (
      <aside className="bg-dark-800/60 backdrop-blur-md rounded-lg border border-neon-blue/20 p-5 h-fit sticky top-8">
        <div className="text-center text-gray-400">正在加载玩家数据...</div>
      </aside>
    );
  }

  const handleEditToggle = () => {
    if (isEditing) {
      if (editedName !== playerData.nickname && editedName.trim() !== '') {
        onSaveNickname(editedName.trim());
      }
    }
    setIsEditing(!isEditing);
  };

  const {
    nickname = '知识解构者',
    mastery = 68,
    tools = 12,
    mindValue = 85,
    wealthValue = 60,
    argTokens = 36.8,
    nfts = 5
  } = playerData;

  return (
    <div className="bg-dark-800/60 backdrop-blur-md rounded-lg border border-neon-blue/20 p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neon-blue">个人档案</h2>
        <div className="text-sm bg-neon-purple/20 px-3 py-1 rounded-full border border-neon-purple/40">
          {playerData.tier}
        </div>
      </div>
      
        <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-neon-pink/50 relative">
          <img src={`https://api.dicebear.com/9.x/micah/png?seed=${encodeURIComponent(playerData.avatarSeed || walletAddress || 'default-avatar-seed')}&hair=dannyPhantom,pixie,full&facialHairProbability=0`} alt="玩家头像" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 bg-web3-primary/80 text-white text-xs px-1 rounded">
            <i className="fa fa-book"></i>
          </div>
        </div>
        <div>
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-dark-900 border border-neon-blue text-lg font-bold w-full p-1 rounded"
                autoFocus
                onBlur={handleEditToggle}
                onKeyDown={(e) => e.key === 'Enter' && handleEditToggle()}
              />
            ) : (
            <div className="font-bold text-lg flex items-center">
              {nickname}
              {isAuthenticated && (
                <button onClick={handleEditToggle} className="text-gray-400 hover:text-white transition-colors ml-2">
                  <i className="fa fa-pencil"></i>
                </button>
              )}
          </div>
          )}
          <div className="text-gray-400 text-sm">{`掌握度: ${mastery}% | 解锁工具: ${tools}`}</div>
        </div>
      </div>
      
      {/* 能力条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>认知值（知识构建）</span>
          <span className="text-neon-blue">{`${mindValue}/100`}</span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-blue to-neon-purple" style={{width: `${mindValue}%`}}></div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>财富值（应用实践）</span>
          <span className="text-neon-pink">{`${wealthValue}/100`}</span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-pink to-neon-yellow" style={{width: `${wealthValue}%`}}></div>
        </div>
        </div>

      {/* Web3 资产 */}
      <div className="mb-6 border-t border-gray-800 pt-6">
        <h3 className="text-lg font-semibold mb-3 text-web3-primary">WEB3 资产</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-700/80 p-3 rounded-lg border border-web3-primary/30">
            <div className="flex justify-between items-center">
              <div className="text-web3-primary">
                <i className="fa fa-diamond mr-1"></i> MIND
              </div>
              <div className="font-bold">{argTokens.toFixed(1)}</div>
            </div>
            <div className="text-xs text-gray-400 mt-1">认知代币</div>
          </div>
          <div className="bg-dark-700/80 p-3 rounded-lg border border-neon-purple/30">
            <div className="flex justify-between items-center">
              <div className="text-neon-purple">
                <i className="fa fa-certificate mr-1"></i> NFT
          </div>
              <div className="font-bold">{nfts}</div>
          </div>
            <div className="text-xs text-gray-400 mt-1">知识成就</div>
          </div>
        </div>
      </div>

      {/* 已解锁思维工具 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">已解锁工具</h3>
        <div className="grid grid-cols-3 gap-2">
            <div className="bg-dark-700/80 p-2 rounded border border-neon-blue/30 text-center">
              <i className="fa fa-list-alt text-neon-blue text-xl mb-1"></i>
              <div className="text-xs">反锚定清单</div>
            </div>
            <div className="bg-dark-700/80 p-2 rounded border border-neon-pink/30 text-center">
              <i className="fa fa-calculator text-neon-pink text-xl mb-1"></i>
              <div className="text-xs">风险决策公式</div>
            </div>
            <div className="bg-dark-700/80 p-2 rounded border border-neon-purple/30 text-center">
              <i className="fa fa-check-square-o text-neon-purple text-xl mb-1"></i>
              <div className="text-xs">决策校验表</div>
            </div>
            <div className="bg-dark-700/80 p-2 rounded border border-neon-green/30 text-center">
              <i className="fa fa-users text-neon-green text-xl mb-1"></i>
              <div className="text-xs">合作策略清单</div>
            </div>
            <div className="bg-dark-700/80 p-2 rounded border border-neon-yellow/30 text-center">
              <i className="fa fa-rss text-neon-yellow text-xl mb-1"></i>
              <div className="text-xs">谈判信号设计</div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PlayerProfile; 