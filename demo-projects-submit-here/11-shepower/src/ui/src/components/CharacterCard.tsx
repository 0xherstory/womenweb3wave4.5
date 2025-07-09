
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Award } from 'lucide-react';

interface CharacterCardProps {
  isRevealed: boolean;
  playerStats: {
    emotion: number;
    knowledge: number;
    resilience: number;
    influence: number;
    equality: number;
  };
}

const CharacterCard: React.FC<CharacterCardProps> = ({ isRevealed, playerStats }) => {
  const isGoodEnding = playerStats.knowledge >= 50 && playerStats.influence >= 50 && playerStats.equality >= 50;

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-purple-800">角色NFT卡牌</CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="relative">
          {isRevealed && isGoodEnding ? (
            <div className="space-y-3">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-gradient-to-r from-yellow-400 to-orange-500">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                  alt="马拉拉·优素福扎伊"
                  className="w-full h-full object-cover"
                />
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Award className="w-4 h-4 mr-1" />
                真身NFT已解锁
              </Badge>
              <div className="text-sm text-gray-700">
                <strong>马拉拉·优素福扎伊</strong>
                <br />诺贝尔和平奖得主
                <br />女孩教育倡导者
              </div>
              <div className="text-xs text-green-600 bg-green-100 rounded-lg p-2">
                🎉 传奇NFT收藏品已添加到您的钱包
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-16 h-16 text-gray-600 opacity-50" />
              </div>
              <Badge variant="secondary">神秘剪影</Badge>
              <div className="text-sm text-gray-600">
                完成挑战解锁真身NFT
              </div>
            </div>
          )}
        </div>
        
        <div className="text-xs text-purple-600 bg-purple-100 rounded-lg p-2">
          达成条件: 智识≥50, 影响力≥50, 平权值≥50
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
