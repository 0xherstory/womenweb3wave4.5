import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls

const DotSpinner = ({ className = '', style = {} }) => (
    <div className={`dot-spinner ${className}`} style={style}>
        {[...Array(8)].map((_, i) => (
            <div key={i} className="dot-spinner__dot" />
        ))}
    </div>
);

const EndlessContent = () => {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const fetchScenario = async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    try {
      const response = await axios.post('http://localhost:5000/api/generate-scenario', {
        gameContext: '玩家正在一个网络论坛中，需要识别帖子中的逻辑漏洞。',
        bookContent: '参考《思考，快与慢》中关于系统1（直觉）和系统2（理性）的理论。',
        gameTheme: '生活中的逻辑谬误',
      });
      // Add mock data for UI elements not provided by the AI
      setScenario({
          ...response.data,
          id: Math.floor(Math.random() * 1000) + 800,
          relatedBook: '《思考，快与慢》相关',
          options: response.data.options.map(opt => ({
              text: opt, // Assuming AI returns an array of strings
              description: "这是一个根据选项生成的描述...", // Add mock description
              reward: Math.floor(Math.random() * 20) + 10,
          })),
      });
    } catch (err) {
      console.error('Error fetching scenario:', err);
      setError('加载新挑战失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenario();
  }, []);

  // Handle initial loading and error states before the main UI is rendered
  if (!scenario) {
    if (loading) {
      return (
        <div className="bg-dark-800/70 backdrop-blur-md rounded-lg border border-neon-purple/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">随机认知挑战</h2>
            <button
              disabled={true}
              className="bg-[#2a274b] border border-neon-purple/30 text-gray-400 px-3 py-1 rounded-lg flex items-center space-x-2"
            >
              <DotSpinner style={{'--uib-size': '1.5rem', '--uib-color': '#a0a0a0'}} />
              <div className="text-left text-xs font-semibold">
                <div className="text-gray-300">加载</div>
                <div className="text-gray-500">中...</div>
              </div>
            </button>
          </div>
          <div className="bg-[#1A1833] rounded-lg border border-neon-blue/20 flex flex-col items-center justify-center" style={{ minHeight: '450px' }}>
            <DotSpinner style={{'--uib-size': '3.5rem'}} className="text-neon-blue" />
            <p className="mt-4 font-semibold tracking-wider text-neon-blue">正在生成新挑战...</p>
          </div>
          <div className="flex justify-between invisible pt-6 mt-auto">
            <button className="bg-dark-700 hover:bg-dark-600 px-6 py-3 rounded-lg border border-gray-700">提示</button>
            <button className="bg-gradient-to-r from-neon-pink to-neon-purple px-6 py-3 rounded-lg">提交答案</button>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center p-8 text-red-500">
          <p>{error}</p>
          <button onClick={fetchScenario} className="mt-4 bg-web3-primary/20 hover:bg-web3-primary/30 text-web3-primary px-4 py-2 rounded-lg transition-colors">
            重试
          </button>
        </div>
      );
    }
    return <div className="text-center p-8 text-gray-400">未能加载挑战。</div>;
  }

  return (
    <div className="bg-dark-800/70 backdrop-blur-md rounded-lg border border-neon-purple/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">随机认知挑战</h2>
        <button 
          onClick={fetchScenario} 
          disabled={loading}
          className="bg-web3-primary/20 hover:bg-web3-primary/30 text-web3-primary px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center w-28 justify-center"
        >
          {loading ? (
            <>
              <DotSpinner style={{'--uib-size': '1.5rem', '--uib-color': '#a0a0a0'}} />
              <span className='ml-2'>加载中...</span>
            </>
          ) : (
            <>
              <i className="fa fa-refresh mr-2"></i>
              <span>换一题</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-dark-700/60 rounded-lg border border-neon-blue/20 p-5 mb-6 relative">
        {loading && (
            <div className="absolute inset-0 bg-[#1A1833]/95 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <div className="text-center text-neon-blue">
                <DotSpinner style={{'--uib-size': '3.5rem'}} />
                <p className="mt-4 font-semibold tracking-wider">正在生成新挑战...</p>
                </div>
            </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="text-neon-purple font-bold mr-2">挑战 #{scenario.id}</div>
            <div className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded">
              {scenario.relatedBook}
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            <i className="fa fa-clock-o mr-1"></i> 剩余时间: 03:45
          </div>
        </div>

        <div className="bg-dark-900/70 rounded-lg p-4 border border-neon-blue/10 mb-4 relative">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-neon-blue to-neon-purple rounded"></div>
          <div className="text-lg italic">"{scenario.question}"</div>
        </div>

        <div className="space-y-3">
          {scenario.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full bg-dark-900 hover:bg-dark-700 text-left p-3 rounded-lg border transition-all duration-300 ${selectedOption === index ? 'border-neon-pink/80 button-glow' : 'border-neon-blue/20 hover:border-neon-blue/50'}`}
            >
              <div className="flex justify-between items-center">
                <div className="text-white">
                  <div className="font-medium">{option.text}</div>
                  <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${selectedOption === index ? 'bg-neon-pink/20 text-neon-pink' : 'bg-neon-blue/20 text-neon-blue'}`}>
                  +{option.reward} MIND
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button className="bg-dark-700 hover:bg-dark-600 px-6 py-3 rounded-lg border border-gray-700">
          <i className="fa fa-lightbulb-o mr-2 text-gray-400"></i>提示 (-5 MIND)
        </button>
        <button className="bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 px-6 py-3 rounded-lg transition-all duration-300 button-glow">
          <i className="fa fa-paper-plane mr-2"></i>提交答案
        </button>
      </div>
    </div>
  );
};

export default EndlessContent; 