import React, { useState } from 'react';
import { toast } from 'sonner';
import GameHeader from '@/components/GameHeader';
import EnhancedEventCard from '@/components/EnhancedEventCard';
import CharacterCard from '@/components/CharacterCard';
import EnhancedDAOVoting from '@/components/EnhancedDAOVoting';
import WelcomePage from '@/components/WelcomePage';
import CharacterSelection from '@/components/CharacterSelection';

interface PlayerStats {
  emotion: number;
  knowledge: number;
  resilience: number;
  influence: number;
  equality: number;
}

interface EventOption {
  id: string;
  text: string;
  effects: {
    emotion?: number;
    knowledge?: number;
    resilience?: number;
    influence?: number;
    equality?: number;
  };
  consequences: string;
}

const Index = () => {
  const [gameState, setGameState] = useState<'welcome' | 'character-select' | 'playing' | 'completed'>('welcome');
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    emotion: 50,
    knowledge: 30,
    resilience: 40,
    influence: 20,
    equality: 25
  });
  const [sheTokens, setSheTokens] = useState(100);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  const gameStages = [
    {
      stage: 1,
      title: "少女叛逆者",
      description: "塔利班政权开始禁止女童上学。年幼的马拉拉面临人生第一个重大选择...",
      options: [
        {
          id: "1a",
          text: "偷偷上学",
          effects: { knowledge: 5, resilience: 5, emotion: -10 },
          consequences: "勇敢但危险的选择，可能面临更多威胁"
        },
        {
          id: "1b", 
          text: "放弃上学",
          effects: { emotion: 5 },
          consequences: "安全但失去成长机会"
        },
        {
          id: "1c",
          text: "寻求家庭支持",
          effects: { emotion: -5, resilience: 3 },
          consequences: "可能解锁导师支线剧情"
        }
      ]
    },
    {
      stage: 2,
      title: "发声者",
      description: "马拉拉开始为BBC写匿名博客，记录塔利班统治下的真实生活。她的声音开始被世界听见...",
      options: [
        {
          id: "2a",
          text: "坚持写博客",
          effects: { influence: 10, emotion: -15 },
          consequences: "影响力大增，但暗杀威胁概率上升"
        },
        {
          id: "2b",
          text: "停止写作",
          effects: { emotion: 10 },
          consequences: "保持安全但失去发声机会"
        },
        {
          id: "2c",
          text: "公开真实身份",
          effects: { influence: 20, equality: 10 },
          consequences: "巨大影响力，但极高风险"
        }
      ]
    },
    {
      stage: 3,
      title: "生死转折",
      description: "2012年10月9日，马拉拉在校车上遭遇枪击。这是她人生最黑暗也是最关键的时刻...",
      options: [
        {
          id: "3a",
          text: "这是命运的考验",
          effects: { emotion: -50, resilience: 30, equality: 15 },
          consequences: "存活下来，获得传奇标签"
        }
      ]
    },
    {
      stage: 4,
      title: "全球领袖",
      description: "康复后的马拉拉受邀在联合国发表演讲。全世界都在关注这位勇敢的女孩...",
      options: [
        {
          id: "4a",
          text: "接受演讲邀请",
          effects: { influence: 30, equality: 20 },
          consequences: "成为全球女性权益象征"
        },
        {
          id: "4b",
          text: "拒绝过度曝光",
          effects: { emotion: 10 },
          consequences: "保持低调继续学业"
        },
        {
          id: "4c",
          text: "与女性联盟共创未来",
          effects: { influence: 50, equality: 30 },
          consequences: "解锁DAO投票权加成"
        }
      ]
    }
  ];

  const specialEvents = [
    {
      id: 'mentor_opportunity',
      type: 'opportunity',
      title: '意料之外的导师',
      description: '在一次偶然的社交活动中，一位在你仰慕已久的女性前辈主动向你表达了欣赏，并表示愿意在你的职业道路上提供指导和帮助。',
      triggerCondition: (stats: PlayerStats) => stats.knowledge >= 40 || stats.influence >= 30,
      options: [
        {
          id: 'mentor_a',
          text: '积极追随',
          effects: { knowledge: 15, influence: 10, resilience: 5 },
          consequences: '获得导师指导，能力大幅提升'
        },
        {
          id: 'mentor_b',
          text: '礼貌婉拒',
          effects: {},
          consequences: '保持独立，但失去成长机会'
        },
        {
          id: 'mentor_c',
          text: '表面应付',
          effects: { emotion: -5 },
          consequences: '导师关系逐渐冷却'
        }
      ]
    },
    {
      id: 'reputation_crisis',
      type: 'encounter',
      title: '名誉危机',
      description: '你突然卷入一场舆论风波，可能是被恶意诽谤，也可能是因公开言论被误解或攻击，你的名誉和公众形象面临巨大危机。',
      triggerCondition: (stats: PlayerStats) => stats.influence >= 40,
      options: [
        {
          id: 'crisis_a',
          text: '正面回应',
          effects: { emotion: -20, resilience: 15, influence: 10 },
          consequences: '勇敢澄清，虽然痛苦但获得更多尊重'
        },
        {
          id: 'crisis_b',
          text: '沉默应对',
          effects: { emotion: -10, influence: -15 },
          consequences: '等待风头过去，但声誉受损'
        },
        {
          id: 'crisis_c',
          text: '寻求公关',
          effects: { influence: 5 },
          consequences: '专业处理，花费资源但保住名声'
        }
      ]
    }
  ];

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    toast.success('钱包连接成功！', {
      description: 'Web3功能正在开发中，敬请期待完整版本'
    });
  };

  const handleStartGame = () => {
    setGameState('character-select');
  };

  const handleSelectCharacter = (characterId: string) => {
    if (characterId === 'malala') {
      setSelectedCharacter(characterId);
      setGameState('playing');
      toast.success('选择了马拉拉·优素福扎伊！', {
        description: '开始她的传奇人生旅程'
      });
    } else {
      toast.info('该角色暂未开放', {
        description: '更多角色故事正在开发中，敬请期待！'
      });
    }
  };

  const handleBackToWelcome = () => {
    setGameState('welcome');
  };

  const checkSpecialEvent = (stats: PlayerStats) => {
    const possibleEvents = specialEvents.filter(event => 
      event.triggerCondition(stats) && Math.random() < 0.3
    );
    
    if (possibleEvents.length > 0) {
      const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      setCurrentEvent(randomEvent);
      return true;
    }
    return false;
  };

  const handleOptionSelect = (option: EventOption) => {
    console.log('选择选项:', option);
    
    const newStats = { ...playerStats };
    let tokensEarned = 0;

    Object.entries(option.effects).forEach(([stat, value]) => {
      if (stat in newStats && value !== undefined) {
        (newStats as any)[stat] = Math.max(0, Math.min(100, (newStats as any)[stat] + value));
        tokensEarned += Math.abs(value);
      }
    });

    setPlayerStats(newStats);
    setSheTokens(prev => prev + tokensEarned);

    toast.success(`选择完成！获得 ${tokensEarned} SHE 代币`, {
      description: option.consequences
    });

    if (currentEvent) {
      setCurrentEvent(null);
      return;
    }

    if (currentStage < 4) {
      setTimeout(() => {
        if (!checkSpecialEvent(newStats)) {
          setCurrentStage(prev => prev + 1);
        }
      }, 2000);
    } else {
      setTimeout(() => {
        setGameCompleted(true);
        setGameState('completed');
        checkGameEnding(newStats);
      }, 2000);
    }
  };

  const checkGameEnding = (finalStats: PlayerStats) => {
    const isGoodEnding = finalStats.knowledge >= 50 && finalStats.influence >= 50 && finalStats.equality >= 50;
    
    if (isGoodEnding) {
      toast.success('🎉 恭喜！达成最佳结局！', {
        description: '马拉拉真身NFT已解锁，DAO投票权已激活！'
      });
      setSheTokens(prev => prev + 500);
    } else {
      toast('游戏完成', {
        description: '继续努力，争取解锁真身NFT！'
      });
    }
  };

  const handleVote = () => {
    setHasVoted(true);
    setSheTokens(prev => prev + 100);
    toast.success('投票成功！', {
      description: '您已支持"全球女孩教育基金"提案，获得100 SHE代币奖励！'
    });
  };

  const handlePurchase = (itemId: string, price: number) => {
    if (sheTokens >= price) {
      setSheTokens(prev => prev - price);
      toast.success('购买成功！', {
        description: '感谢您支持公益项目，收益已转给对应的公益组织！'
      });
    } else {
      toast.error('SHE代币不足', {
        description: '请继续游戏获得更多代币'
      });
    }
  };

  if (gameState === 'welcome') {
    return (
      <WelcomePage 
        onStartGame={handleStartGame}
        onConnectWallet={handleConnectWallet}
        isWalletConnected={isWalletConnected}
      />
    );
  }

  if (gameState === 'character-select') {
    return (
      <CharacterSelection 
        onSelectCharacter={handleSelectCharacter}
        onBack={handleBackToWelcome}
      />
    );
  }

  const currentStageData = gameStages[currentStage - 1];
  const isGoodEnding = playerStats.knowledge >= 50 && playerStats.influence >= 50 && playerStats.equality >= 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <GameHeader playerStats={playerStats} sheTokens={sheTokens} />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {!gameCompleted ? (
              currentEvent ? (
                <EnhancedEventCard
                  stage={currentStage}
                  title={currentEvent.title}
                  description={currentEvent.description}
                  options={currentEvent.options}
                  onOptionSelect={handleOptionSelect}
                  eventType={currentEvent.type}
                  isSpecialEvent={true}
                />
              ) : (
                <EnhancedEventCard
                  stage={currentStage}
                  title={currentStageData.title}
                  description={currentStageData.description}
                  options={currentStageData.options}
                  onOptionSelect={handleOptionSelect}
                />
              )
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  马拉拉的传奇之路完成！
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  {isGoodEnding 
                    ? "您成功引导马拉拉成为全球女性权益的象征！" 
                    : "马拉拉的故事仍在继续，每一次选择都塑造着未来..."}
                </p>
                {isGoodEnding && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-4 mb-4">
                    <h3 className="font-bold text-xl mb-2">🏆 传奇成就解锁</h3>
                    <p>马拉拉真身NFT已添加到您的收藏！</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CharacterCard isRevealed={gameCompleted} playerStats={playerStats} />
            <EnhancedDAOVoting 
              isUnlocked={true} 
              onVote={handleVote} 
              onPurchase={handlePurchase}
              sheTokens={sheTokens}
            />
            
            {gameCompleted && (
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="font-bold text-purple-800 mb-2">🌟 共创邀请</h3>
                <p className="text-sm text-gray-600 mb-3">
                  分享您的真实故事，为游戏增添更多女性视角！
                </p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
                  上传我的故事
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-lg p-6 text-center">
          <h3 className="font-bold text-gray-800 mb-2">🎮 ShePower: Genesis</h3>
          <p className="text-sm text-gray-600">
            通过真实女性故事体验性别平等之路 • Play-to-Impact • Web3 + 女性主义
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
