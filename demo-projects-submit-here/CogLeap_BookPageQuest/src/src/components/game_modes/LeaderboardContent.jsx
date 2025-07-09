import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App'; 
import apiClient from '../../utils/apiClient'; // 引入 apiClient

// 根据排名获取不同的样式
const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
    case 2:
      return 'bg-gray-400/20 border-gray-400 text-gray-300';
    case 3:
      return 'bg-orange-600/20 border-orange-600 text-orange-500';
    default:
      return 'bg-dark-800 border-transparent';
  }
};
const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <i className="fa fa-trophy text-yellow-400"></i>;
      case 2: return <i className="fa fa-trophy text-gray-300"></i>;
      case 3: return <i className="fa fa-trophy text-orange-500"></i>;
      default: return rank;
    }
}

const LeaderboardContent = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { walletAddress } = useContext(AuthContext);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/api/leaderboard?playerAddress=${walletAddress || ''}`);
                setLeaderboardData(response.data);
            } catch (error) {
                console.error("获取排行榜数据失败:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [walletAddress]);

    return (
        <div>
            <div className="bg-dark-800/60 p-6 rounded-lg border border-neon-blue/20">
                <h2 className="text-2xl font-bold text-neon-blue mb-6 text-center">全球玩家排行榜</h2>
                
                <div className="space-y-3">
                    {/* 表头 */}
                    <div className="flex items-center text-sm text-gray-400 px-4">
                        <div className="w-1/6 text-center">排名</div>
                        <div className="w-3/6">玩家</div>
                        <div className="w-1/6 text-center">段位</div>
                        <div className="w-1/6 text-center">胜率</div>
                    </div>

                    {/* 列表 */}
                    {leaderboardData.length > 0 ? (
                        leaderboardData.map((player) => (
                            <div 
                                key={player.rank} 
                                className={`flex items-center p-3 rounded-lg transition-all duration-300 border ${getRankStyle(player.rank)} ${player.name === '你' ? 'border-neon-blue scale-105 shadow-neon-blue-sm' : ''}`}
                            >
                                <div className="w-1/6 text-xl font-bold text-center">{getRankIcon(player.rank)}</div>
                                <div className="w-3/6 flex items-center">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/micah/svg?seed=${player.avatarSeed}`} 
                                        alt={player.name}
                                        className="w-10 h-10 rounded-full mr-4 bg-dark-900 border-2 border-neon-purple/50"
                                    />
                                    <span className="font-semibold">{player.name}</span>
                                </div>
                                <div className="w-1/6 text-center font-semibold">{player.tier}</div>
                                <div className="w-1/6 text-center font-bold text-neon-green">{player.winRate.toFixed(1)}%</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            <p>正在加载排行榜数据...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardContent; 