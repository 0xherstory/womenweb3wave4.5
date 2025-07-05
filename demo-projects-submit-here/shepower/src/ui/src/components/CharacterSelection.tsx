
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, User, Leaf, Briefcase, Wrench, Heart } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  nameEn: string;
  identity: string;
  coreIssue: string;
  available: boolean;
  icon: React.ReactNode;
  description: string;
}

interface CharacterSelectionProps {
  onSelectCharacter: (characterId: string) => void;
  onBack: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  onSelectCharacter, 
  onBack 
}) => {
  const characters: Character[] = [
    {
      id: 'malala',
      name: '马拉拉·优素福扎伊',
      nameEn: 'Malala Yousafzai',
      identity: '女孩教育倡导者、诺贝尔和平奖得主',
      coreIssue: '教育平等、女性权益',
      available: true,
      icon: <User className="w-8 h-8" />,
      description: '勇敢为女孩教育权利发声的年轻活动家'
    },
    {
      id: 'greta',
      name: '格蕾塔·通贝里',
      nameEn: 'Greta Thunberg',
      identity: '气候行动家、Z世代代表',
      coreIssue: '气候正义、青年行动',
      available: false,
      icon: <Leaf className="w-8 h-8" />,
      description: '引领全球气候运动的年轻环保活动家'
    },
    {
      id: 'justina',
      name: '贾斯汀娜·马卡多',
      nameEn: 'Justina Machado',
      identity: '代表少数族裔、职场平权',
      coreIssue: '种族平等、职场权益',
      available: false,
      icon: <Briefcase className="w-8 h-8" />,
      description: '为少数族裔职场权益奋斗的先驱者'
    },
    {
      id: 'roshni',
      name: '罗希妮·萨尔曼',
      nameEn: 'Roshni Sharma',
      identity: '印度首位女性机车司机 / STEM女性',
      coreIssue: 'STEM领域性别平等',
      available: false,
      icon: <Wrench className="w-8 h-8" />,
      description: '打破传统职业性别界限的开拓者'
    },
    {
      id: 'teresa',
      name: '特雷莎·库梅',
      nameEn: 'Teresa Kumi',
      identity: '社区自组织领袖、妇女权益',
      coreIssue: '社区建设、妇女权益',
      available: false,
      icon: <Heart className="w-8 h-8" />,
      description: '致力于社区妇女权益保护的基层领袖'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              选择你的女性角色
            </h1>
            <p className="text-lg text-gray-700">
              每个角色都有独特的人生故事和挑战
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card 
              key={character.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                character.available 
                  ? 'bg-gradient-to-br from-white to-purple-50 border-purple-200 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-100 border-gray-300 opacity-60'
              }`}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  character.available 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-400 text-gray-600'
                }`}>
                  {character.available ? character.icon : <Lock className="w-8 h-8" />}
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  {character.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{character.nameEn}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <Badge 
                  variant={character.available ? "default" : "secondary"}
                  className="text-xs"
                >
                  {character.identity}
                </Badge>
                
                <p className="text-sm text-gray-700">
                  {character.description}
                </p>
                
                <div className="text-xs text-purple-600 bg-purple-50 rounded-lg p-2">
                  核心议题: {character.coreIssue}
                </div>

                {character.available ? (
                  <Button
                    onClick={() => onSelectCharacter(character.id)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    选择角色
                  </Button>
                ) : (
                  <div className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      敬请期待
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      更多角色故事正在开发中
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-bold text-gray-800 mb-2">🌟 角色扩展计划</h3>
            <p className="text-sm text-gray-600">
              我们将持续添加更多真实女性角色的故事，每个角色都有独特的人生挑战和成长轨迹
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;
