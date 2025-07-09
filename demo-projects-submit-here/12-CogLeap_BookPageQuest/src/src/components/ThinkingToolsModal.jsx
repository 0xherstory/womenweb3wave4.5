import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const toolsData = {
  '决策与判断': [
    { name: '5 Whys 分析法', description: '通过连续追问五个"为什么"来探究问题的根本原因。', scenario: '故障排除、流程优化', unlocked: true, icon: 'fa-search' },
    { name: '决策矩阵', description: '通过对多个选项的多个标准进行加权评分，来做出量化决策。', scenario: '工作选择、技术选型', unlocked: true, icon: 'fa-table' },
    { name: '反锚定清单', description: '检查决策是否受到第一信息的过度影响（锚定效应）。', scenario: '谈判、估价、投资', unlocked: true, icon: 'fa-anchor' },
    { name: '风险决策公式', description: '量化风险，计算预期价值，辅助高风险决策。', scenario: '创业、投资、项目管理', unlocked: false, icon: 'fa-calculator' },
  ],
  '问题解决': [
    { name: '第一性原理', description: '回归事物最基本的公理和假设，不被现有类比所束缚。', scenario: '颠覆式创新、商业模式重构', unlocked: true, icon: 'fa-atom' },
    { name: '逻辑树分析', description: '将复杂问题分解为多个子问题，直到可以被解决。', scenario: '战略规划、市场分析', unlocked: false, icon: 'fa-sitemap' },
    { name: '溯因推理', description: '从结果反推最可能的原因，像侦探一样思考。', scenario: '诊断问题、数据分析', unlocked: false, icon: 'fa-lightbulb-o' },
  ],
  '创新与构思': [
    { name: 'SCAMPER 模型', description: '通过七个切入点（替代、合并、调整等）激发创意。', scenario: '产品迭代、头脑风暴', unlocked: true, icon: 'fa-random' },
    { name: '逆向思考', description: '思考如何实现相反的目标，从而找到隐藏的障碍。', scenario: '风险规避、流程设计', unlocked: false, icon: 'fa-undo' },
  ],
  '沟通与协作': [
    { name: '非暴力沟通', description: '以观察、感受、需求、请求为核心，建立同理心连接。', scenario: '团队协作、伴侣沟通', unlocked: true, icon: 'fa-comments-o' },
    { name: '合作策略清单', description: '在博弈中，建立信任并寻找双赢的合作策略。', scenario: '商业谈判、团队项目', unlocked: false, icon: 'fa-handshake-o' },
  ],
};

const ToolCard = ({ tool }) => (
    <div className={`
        p-6 rounded-2xl transition-all duration-300 h-full flex flex-col
        ${tool.unlocked 
            ? 'bg-slate-800 shadow-neumorphic-dark' 
            : 'bg-slate-800/60 brightness-75'
        }
    `}>
        <div className="flex items-center gap-4">
            <div className={`
                w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                ${tool.unlocked ? 'bg-slate-800 shadow-neumorphic-dark-inset text-cyan-400' : 'bg-slate-900/50 text-slate-600'}
            `}>
                <i className={`fa ${tool.icon} text-xl`}></i>
            </div>
            <h4 className={`font-bold text-lg ${tool.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>{tool.name}</h4>
        </div>

        <p className={`text-sm mt-4 flex-grow ${tool.unlocked ? 'text-slate-400' : 'text-slate-500'}`}>{tool.description}</p>
        
        <p className={`text-xs mt-4 ${tool.unlocked ? 'text-slate-500' : 'text-slate-600'}`}>
            <span className="font-semibold">适用场景: </span>{tool.scenario}
        </p>
        
        {tool.unlocked && (
            <button className="w-full mt-5 py-2.5 px-4 rounded-xl font-bold text-sm text-cyan-300
                               bg-slate-800 shadow-neumorphic-dark-button active:shadow-neumorphic-dark-inset
                               transition-all duration-200 hover:text-cyan-200">
                加载插件
            </button>
        )}
    </div>
);

const ThinkingToolsModal = ({ onClose }) => {
    const [activeCategory, setActiveCategory] = useState(Object.keys(toolsData)[0]);

    useEffect(() => {
        const handleEsc = (event) => {
           if (event.keyCode === 27) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div 
            className="w-full max-w-6xl h-[90vh] bg-slate-800 rounded-3xl overflow-hidden flex 
                       shadow-neumorphic-dark-xl"
            onClick={e => e.stopPropagation()}
        >
            {/* Sidebar */}
            <nav className="w-1/4 p-6 border-r border-black/10 overflow-y-auto bg-slate-800 flex-shrink-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-slate-800 shadow-neumorphic-dark-inset rounded-full flex items-center justify-center">
                        <i className="fa fa-cogs text-cyan-400"></i>
                    </div>
                    <h2 className="text-xl font-bold text-slate-200">思维工具库</h2>
                </div>
                <ul className="space-y-3">
                    {Object.keys(toolsData).map(category => (
                        <li key={category}>
                            <button
                                onClick={() => setActiveCategory(category)}
                                className={`
                                    w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-200 
                                    text-base
                                    ${activeCategory === category 
                                        ? 'bg-slate-800 text-cyan-400 shadow-neumorphic-dark-inset' 
                                        : 'text-slate-400 hover:text-slate-200'
                                    }
                                `}
                            >
                                {category}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Main Content */}
            <main className="w-3/4 p-8 overflow-y-auto bg-slate-900/50">
                 <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 shadow-neumorphic-dark-button transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {toolsData[activeCategory].map(tool => (
                        <ToolCard key={tool.name} tool={tool} />
                    ))}
                </div>
            </main>
        </div>
    </div>
  );
};

export default ThinkingToolsModal; 