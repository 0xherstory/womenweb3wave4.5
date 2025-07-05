
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Gift, Zap } from 'lucide-react';

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

interface EventCardProps {
  stage: number;
  title: string;
  description: string;
  options: EventOption[];
  onOptionSelect: (option: EventOption) => void;
  isSpecialEvent?: boolean;
  eventType?: 'normal' | 'opportunity' | 'encounter';
}

const EnhancedEventCard: React.FC<EventCardProps> = ({ 
  stage, 
  title, 
  description, 
  options, 
  onOptionSelect,
  isSpecialEvent = false,
  eventType = 'normal'
}) => {
  const getStageEmoji = (stage: number) => {
    switch(stage) {
      case 1: return '🌱';
      case 2: return '🌿';
      case 3: return '🌳';
      case 4: return '🌏';
      default: return '✨';
    }
  };

  const getEventTypeIcon = () => {
    switch(eventType) {
      case 'opportunity': return <Gift className="w-6 h-6 text-green-600" />;
      case 'encounter': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default: return <Zap className="w-6 h-6 text-blue-600" />;
    }
  };

  const getEventTypeColor = () => {
    switch(eventType) {
      case 'opportunity': return 'from-green-50 to-emerald-50 border-green-200';
      case 'encounter': return 'from-red-50 to-pink-50 border-red-200';
      default: return 'from-purple-50 to-pink-50 border-purple-200';
    }
  };

  const getEventTypeBadge = () => {
    switch(eventType) {
      case 'opportunity': return <Badge className="bg-green-500 text-white">机遇事件</Badge>;
      case 'encounter': return <Badge className="bg-red-500 text-white">挑战事件</Badge>;
      default: return null;
    }
  };

  const getEffectColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatEffects = (effects: EventOption['effects']) => {
    const effectTexts: string[] = [];
    if (effects.emotion) effectTexts.push(`情绪${effects.emotion > 0 ? '+' : ''}${effects.emotion}`);
    if (effects.knowledge) effectTexts.push(`智识${effects.knowledge > 0 ? '+' : ''}${effects.knowledge}`);
    if (effects.resilience) effectTexts.push(`韧性${effects.resilience > 0 ? '+' : ''}${effects.resilience}`);
    if (effects.influence) effectTexts.push(`影响力${effects.influence > 0 ? '+' : ''}${effects.influence}`);
    if (effects.equality) effectTexts.push(`平权值${effects.equality > 0 ? '+' : ''}${effects.equality}`);
    return effectTexts.join(', ');
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto shadow-xl transform transition-all duration-300 hover:scale-105 bg-gradient-to-br ${getEventTypeColor()}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="text-4xl">{getStageEmoji(stage)}</div>
          {eventType !== 'normal' && getEventTypeIcon()}
        </div>
        
        {getEventTypeBadge()}
        
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {eventType === 'normal' ? `阶段${stage}：` : ''}{title}
        </CardTitle>
        <CardDescription className="text-lg text-gray-700 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {options.map((option, index) => (
          <div key={option.id} className="space-y-2">
            <Button
              onClick={() => onOptionSelect(option)}
              variant="outline"
              className={`w-full p-4 h-auto text-left justify-start transition-all duration-200 ${
                eventType === 'opportunity' 
                  ? 'hover:bg-green-50 hover:border-green-300' 
                  : eventType === 'encounter'
                  ? 'hover:bg-red-50 hover:border-red-300'
                  : 'hover:bg-purple-50 hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col space-y-1 w-full">
                <div className="font-semibold text-gray-800">
                  {String.fromCharCode(65 + index)}. {option.text}
                </div>
                <div className="text-sm text-gray-600">
                  {formatEffects(option.effects) && (
                    <span className={getEffectColor(Object.values(option.effects)[0] || 0)}>
                      {formatEffects(option.effects)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-purple-600 italic">
                  {option.consequences}
                </div>
              </div>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EnhancedEventCard;
