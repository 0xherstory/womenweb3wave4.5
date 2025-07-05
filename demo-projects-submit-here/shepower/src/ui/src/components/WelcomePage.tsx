
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Play, Crown, Sparkles } from 'lucide-react';

interface WelcomePageProps {
  onStartGame: () => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ 
  onStartGame, 
  onConnectWallet, 
  isWalletConnected 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Crown className="text-yellow-500 w-12 h-12" />
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShePower: Genesis
            </CardTitle>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            通过真实女性故事体验性别平等之路
            <br />
            <span className="text-purple-600 font-semibold">Play-to-Impact • Web3 + 女性主义</span>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            <h3 className="text-xl font-bold mb-2">游戏特色</h3>
            <ul className="text-sm space-y-1">
              <li>🎭 沉浸式叙事体验</li>
              <li>🎴 收集独特NFT角色卡</li>
              <li>🗳️ DAO社区投票影响现实</li>
              <li>💎 赚取SHE代币支持公益</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onConnectWallet}
              className={`w-full py-6 text-lg font-semibold transition-all duration-200 ${
                isWalletConnected 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              <Wallet className="w-6 h-6 mr-2" />
              {isWalletConnected ? '钱包已连接' : '连接钱包 (Web3功能开发中)'}
            </Button>

            <Button
              onClick={onStartGame}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Play className="w-6 h-6 mr-2" />
              开始游戏
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>体验女性力量，创造平等未来</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;
