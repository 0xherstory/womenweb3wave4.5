import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/apiClient';

const getRankColor = (rank) => {
  if (rank === 1) return 'text-yellow-400 border-yellow-400/50 shadow-yellow-400/30';
  if (rank === 2) return 'text-gray-300 border-gray-300/50 shadow-gray-300/20';
  if (rank === 3) return 'text-orange-400 border-orange-400/50 shadow-orange-400/20';
  return 'text-white border-transparent';
};

const LeaderboardContent = ({ playerData }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { walletAddress } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/api/leaderboard?playerAddress=${walletAddress || ''}`);
        let fetchedLeaderboardData = response.data;

        // Update the current player's entry with actual data from playerData
        if (walletAddress && playerData) {
          fetchedLeaderboardData = fetchedLeaderboardData.map(player => {
            if (player.address.toLowerCase() === walletAddress.toLowerCase()) {
              return {
                ...player,
                tier: playerData.tier, // Use tier from backend playerData
                avatarSeed: playerData.avatarSeed // Use avatarSeed from backend playerData
              };
            }
            return player;
          });
        }

        setLeaderboardData(fetchedLeaderboardData);
      } catch (error) {
        console.error("获取排行榜数据失败:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [walletAddress, playerData]); // Add playerData to dependencies

  if (isLoading) {
    return <div className="text-center p-8 text-neon-blue">正在加载排行榜...</div>;
  }

  return (
    <div className="bg-dark-900/50 p-6 rounded-xl border border-neon-blue/20">
      <h2 className="text-3xl font-bold text-neon-blue mb-6 text-center text-shadow-neon-blue">
        <i className="fa fa-globe mr-3"></i>全球认知排行榜
      </h2>
      <div className="space-y-2">
        {leaderboardData.map((player, index) => (
          <div
            key={player.address || index}
            className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
              walletAddress && player.address.toLowerCase() === walletAddress.toLowerCase()
                ? 'bg-neon-purple/20 border-2 border-neon-purple'
                : 'bg-dark-800/70'
            }`}
          >
            {/* Rank */}
            <div className={`w-16 text-center text-2xl font-bold ${getRankColor(player.rank)}`}>
              {player.rank <= 3 ? <i className="fa fa-trophy"></i> : player.rank}
            </div>
            
            {/* Player Info */}
            <div className="flex-1 flex items-center">
              <img
                src={`https://api.dicebear.com/9.x/micah/png?seed=${encodeURIComponent(player.avatarSeed || player.address || 'default-avatar-seed')}&hair=dannyPhantom,pixie,full&facialHairProbability=0`}
                alt={player.nickname}
                className="w-12 h-12 rounded-full mr-4 border-2 border-neon-purple/30 bg-dark-700"
              />
              <div>
                <div className="font-bold text-white text-lg">{player.nickname}</div>
                <div className="text-gray-400 text-xs">{player.address}</div>
              </div>
            </div>

            {/* Tier */}
            <div className="w-40 text-center font-semibold text-white">
              <span className={`px-3 py-1 rounded-full text-sm ${getRankColor(player.rank)} bg-dark-900/50`}>
                {player.tier}
              </span>
            </div>

            {/* Score */}
            <div className="w-40 text-right font-bold text-2xl text-neon-green">
              {player.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardContent; 