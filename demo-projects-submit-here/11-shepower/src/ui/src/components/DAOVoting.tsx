
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, Users, Globe, Heart } from 'lucide-react';

interface DAOVotingProps {
  isUnlocked: boolean;
  onVote: () => void;
}

const DAOVoting: React.FC<DAOVotingProps> = ({ isUnlocked, onVote }) => {
  if (!isUnlocked) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg bg-gray-50">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-gray-600">DAO社区投票</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-gray-500">
            <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">完成游戏解锁投票权</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Vote className="text-blue-600 w-6 h-6" />
          <CardTitle className="text-xl font-bold text-blue-800">DAO社区投票</CardTitle>
        </div>
        <Badge className="bg-green-500 text-white">
          <Users className="w-4 h-4 mr-1" />
          投票权已激活
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="text-purple-600 w-5 h-5" />
            <h3 className="font-semibold text-gray-800">提案：全球女孩教育基金</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            支持全球范围内的女孩教育项目，为失学女童提供教育机会和资源支持。
          </p>
          <div className="flex items-center space-x-2 text-xs text-green-600">
            <Heart className="w-4 h-4" />
            <span>目标筹集: 10,000 SHE</span>
          </div>
        </div>
        
        <Button 
          onClick={onVote}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
        >
          投票支持此提案
        </Button>
        
        <div className="text-xs text-center text-gray-600">
          您的故事将被记录在区块链上，成为女性权益斗争的永恒见证
        </div>
      </CardContent>
    </Card>
  );
};

export default DAOVoting;
