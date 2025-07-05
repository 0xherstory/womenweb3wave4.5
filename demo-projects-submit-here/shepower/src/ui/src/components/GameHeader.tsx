
import React from 'react';
import { Crown, Users, Heart, Brain, Shield, Sparkles } from 'lucide-react';

interface GameHeaderProps {
  playerStats: {
    emotion: number;
    knowledge: number;
    resilience: number;
    influence: number;
    equality: number;
  };
  sheTokens: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ playerStats, sheTokens }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 rounded-lg shadow-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Crown className="text-yellow-300 w-8 h-8" />
          <h1 className="text-3xl font-bold text-white">ShePower: Genesis</h1>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
          <Sparkles className="text-yellow-300 w-5 h-5" />
          <span className="text-white font-semibold">${sheTokens} SHE</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
          <Heart className="text-pink-300 w-4 h-4" />
          <span className="text-white text-sm">情绪值: {playerStats.emotion}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
          <Brain className="text-blue-300 w-4 h-4" />
          <span className="text-white text-sm">智识力量: {playerStats.knowledge}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
          <Shield className="text-green-300 w-4 h-4" />
          <span className="text-white text-sm">精神韧性: {playerStats.resilience}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
          <Users className="text-orange-300 w-4 h-4" />
          <span className="text-white text-sm">社会影响力: {playerStats.influence}</span>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
          <Sparkles className="text-yellow-300 w-4 h-4" />
          <span className="text-white text-sm">平权值: {playerStats.equality}</span>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
