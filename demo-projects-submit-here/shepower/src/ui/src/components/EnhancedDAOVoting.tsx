
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, Users, Globe, Heart, ShoppingCart, Palette, Gift } from 'lucide-react';

interface EnhancedDAOVotingProps {
  isUnlocked: boolean;
  onVote: () => void;
  onPurchase: (itemId: string, price: number) => void;
  sheTokens: number;
}

const EnhancedDAOVoting: React.FC<EnhancedDAOVotingProps> = ({ 
  isUnlocked, 
  onVote, 
  onPurchase,
  sheTokens
}) => {
  const [activeTab, setActiveTab] = useState<'voting' | 'marketplace'>('voting');

  const publicWelfareItems = [
    {
      id: 'sheep_companion',
      name: '阿羊小伙伴',
      description: '来自阿羊小笔友公益项目的可爱随从，陪伴你的冒险旅程',
      price: 150,
      type: '随从',
      icon: '🐑',
      project: '阿羊的小笔友'
    },
    {
      id: 'wisdom_brush',
      name: '智慧画笔',
      description: '教育公益项目设计的特殊装备，提升学习事件的成功率',
      price: 200,
      type: '装备',
      icon: '🖌️',
      project: '教育平等基金'
    },
    {
      id: 'courage_badge',
      name: '勇气徽章',
      description: '女性权益组织设计的徽章，增强面对困难时的韧性',
      price: 100,
      type: '装备',
      icon: '🏅',
      project: '女性权益联盟'
    }
  ];

  if (!isUnlocked) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg bg-gray-50">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-gray-600">DAO社区中心</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-gray-500">
            <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">完成游戏解锁社区功能</p>
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
          <CardTitle className="text-xl font-bold text-blue-800">DAO社区中心</CardTitle>
        </div>
        <Badge className="bg-green-500 text-white">
          <Users className="w-4 h-4 mr-1" />
          社区权限已激活
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 标签切换 */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'voting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('voting')}
            className="flex-1"
          >
            <Vote className="w-4 h-4 mr-1" />
            投票
          </Button>
          <Button
            variant={activeTab === 'marketplace' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('marketplace')}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            公益商城
          </Button>
        </div>

        {activeTab === 'voting' ? (
          // 投票区域
          <div className="space-y-4">
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
          </div>
        ) : (
          // 公益商城区域
          <div className="space-y-3">
            <div className="text-center mb-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
                <Gift className="w-4 h-4" />
                <span>购买收益全部支持对应公益项目</span>
              </div>
            </div>
            
            {publicWelfareItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-purple-600">
                        <Palette className="w-3 h-3 inline mr-1" />
                        {item.project}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-orange-600">{item.price} SHE</span>
                        <Button
                          size="sm"
                          onClick={() => onPurchase(item.id, item.price)}
                          disabled={sheTokens < item.price}
                          className="text-xs px-2 py-1 h-6"
                        >
                          购买
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-center text-gray-600">
          您的选择将影响真实世界的公益项目发展
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDAOVoting;
