import React, { useState } from 'react';
import CampaignContent from './game_modes/CampaignContent';
import EndlessContent from './game_modes/EndlessContent';
import CommunityContent from './game_modes/CommunityContent';
import LeaderboardContent from './game_modes/LeaderboardContent';

const GameModes = ({ onBookSelect, account, isAuthenticated, playerData, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'campaign', name: '认知训练场' },
    { id: 'endless', name: '随机挑战' },
    { id: 'community', name: '实战社区' },
    { id: 'leaderboard', name: '排行榜' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'campaign':
        return <CampaignContent onBookSelect={onBookSelect} isAuthenticated={isAuthenticated} />;
      case 'endless':
        return <EndlessContent />;
      case 'community':
        return <CommunityContent account={account} />;
      case 'leaderboard':
        return <LeaderboardContent account={account} playerData={playerData} />;
      default:
        return <CampaignContent onBookSelect={onBookSelect} isAuthenticated={isAuthenticated} />;
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="flex border-b border-gray-800 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={!isAuthenticated}
            className={`px-4 py-2 font-medium transition-colors
              ${activeTab === tab.id 
                ? 'text-neon-blue border-b-2 border-neon-blue' 
                : 'text-gray-400 hover:text-white'
              }
              ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`
            }
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default GameModes;
