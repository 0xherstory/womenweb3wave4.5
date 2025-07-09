import React, { useState, useEffect } from 'react';

const GameView = ({ scene, book, onExit, setIsModalOpen, onNextScene, isLastScene }) => {
  const [chosenOption, setChosenOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when scene changes
  useEffect(() => {
    setChosenOption(null);
    setIsAnswered(false);
    setShowHint(false);
  }, [scene]);

  if (!scene) return null;

  const handleSubmit = () => {
    if (chosenOption === null) return;
    setIsAnswered(true);
  };
  
  const handleReturn = () => {
    onExit();
    if(setIsModalOpen) setIsModalOpen(true);
  }

  const getOptionClasses = (index) => {
    const base = "w-full text-left p-4 rounded-lg transition-all duration-300 border-2";
    
    if (isAnswered) {
      if (index === scene.correctIndex) {
        return `${base} bg-green-500/20 border-green-400 text-white shadow-[0_0_15px_rgba(74,222,128,0.3)]`;
      }
      if (index === chosenOption) {
        return `${base} bg-red-500/20 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]`;
      }
      return `${base} bg-black/20 border-transparent text-gray-500 opacity-60`;
    }
    
    if (index === chosenOption) {
      return `${base} bg-cyan-500/20 border-cyan-400 text-white transform-gpu scale-[1.02] shadow-[0_0_15px_rgba(34,211,238,0.4)]`;
    }

    return `${base} bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-cyan-500/70`;
  };

  const feedback = isAnswered && chosenOption !== null ? scene.options[chosenOption].feedback : null;
  const hintText = scene.options[scene.correctIndex].feedback;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-center z-50 p-4 animate-fade-in"
    >
      <div 
        className="w-full max-w-3xl bg-gradient-to-br from-[#102A3B] via-[#14142B] to-[#1F102B] rounded-2xl p-8 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] text-white"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleReturn} className="flex items-center text-gray-400 hover:text-white transition-colors">
            <i className="fa fa-arrow-left mr-2"></i>
            返回
        </button>
          <div className="text-lg text-gray-400">
            <i className="fa fa-clock-o mr-2"></i>
            <span>03:45</span>
      </div>
    </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">挑战 #{scene.id.split('_').pop()}</h2>
        </div>

        {/* Question */}
        <div className="p-6 mb-8 bg-black/40 rounded-lg border-l-4 border-cyan-500 shadow-inner shadow-black/50">
          <p className="text-lg text-gray-200 leading-relaxed">"{scene.content.replace(/"/g, '')}"</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {scene.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !isAnswered && setChosenOption(index)}
                disabled={isAnswered}
                className={getOptionClasses(index)}
              >
                <p className="font-semibold text-lg">{`${String.fromCharCode(65 + index)}. ${option.text.replace(/"/g, '')}`}</p>
              </button>
            ))}
          </div>
        
        {/* Footer & Feedback */}
        <div className="mt-8 flex justify-between items-center">
          <button onClick={() => setShowHint(true)} className="px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-colors border border-white/10">
            <i className="fa fa-lightbulb-o mr-2"></i>
            提示 (-5 MIND)
          </button>
          
          {isAnswered ? (
            isLastScene ? (
              <button 
                onClick={handleReturn}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg text-white font-bold transition-all duration-300 hover:shadow-[0_0_20px_theme(colors.cyan.400)] hover:scale-105"
              >
                完成
              </button>
            ) : (
              <button
                onClick={onNextScene}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg text-white font-bold transition-all duration-300 hover:shadow-[0_0_20px_theme(colors.cyan.400)] hover:scale-105"
              >
                下一关
              </button>
            )
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={chosenOption === null}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg text-white font-bold transition-all duration-300 enabled:hover:shadow-[0_0_20px_theme(colors.cyan.400)] enabled:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa fa-paper-plane-o mr-2"></i>
              提交答案
            </button>
          )}
        </div>
        
        {showHint && !isAnswered && (
          <div className="mt-6 p-5 bg-black/40 rounded-lg animate-fade-in border border-cyan-500/30">
            <h3 className="font-bold text-lg text-cyan-300 mb-2">原文参考：</h3>
            <p className="text-gray-300">{hintText}</p>
          </div>
        )}
        
        {isAnswered && (
           <div className="mt-6 p-5 bg-black/40 rounded-lg animate-fade-in">
             <h3 className="font-bold text-lg text-cyan-400 mb-2">认知洞察：</h3>
             <p className="text-gray-300">{feedback}</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default GameView; 