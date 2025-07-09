import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect } from 'react';


const dashboardData = {
  cognitiveScore: 78,
  kpis: [
    { name: '已解锁技能', value: 8, icon: 'fa-unlock-alt' },
    { name: 'MIND 代币收益', value: '1,250', icon: 'fa-diamond' },
    { name: '知识成就 (NFT)', value: 3, icon: 'fa-trophy' },
  ],
  radarData: {
    labels: ['批判性思维', '系统性思考', '同理心认知', '逆境韧性', '创新构思'],
    values: [80, 65, 75, 60, 85],
  },
  strengths: ['创新构思', '批判性思维'],
  growthAreas: ['逆境韧性', '系统性思考'],
};

const RadarChart = ({ data, size = 370 }) => {
    const center = size / 2;
    const chartRadius = center * 0.65; // Make chart larger to reduce whitespace

    const points = data.values.map((value, i, arr) => {
        const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2;
        const x = center + (value / 100) * chartRadius * Math.cos(angle);
        const y = center + (value / 100) * chartRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid lines */}
            {[...Array(5)].map((_, i, arr) => (
                <circle key={i} cx={center} cy={center} r={(chartRadius * (i + 1)) / arr.length} fill="none" stroke="rgba(0, 255, 255, 0.1)" />
            ))}
            {/* Axes and Labels */}
            {data.labels.map((label, i, arr) => {
                const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2;
                const labelRadius = chartRadius + 20; // Position labels outside the chart
                
                const getTextAnchor = (angle) => {
                    const cosAngle = Math.cos(angle);
                    if (cosAngle > 0.1) return 'start';
                    if (cosAngle < -0.1) return 'end';
                    return 'middle';
                };
                
                const textAnchor = getTextAnchor(angle);
                let x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);
                
                // Adjust x for side labels to pull them inwards
                if (textAnchor === 'start') {
                    x -= 10;
                } else if (textAnchor === 'end') {
                    x += 10;
                }

                return (
                    <g key={i}>
                        <line x1={center} y1={center} x2={center + chartRadius * Math.cos(angle)} y2={center + chartRadius * Math.sin(angle)} stroke="rgba(0, 255, 255, 0.1)" />
                        <text x={x} y={y} dy="0.3em" textAnchor={textAnchor} fill="white" fontSize="12">
                            {label}
                        </text>
                    </g>
                );
            })}
            {/* Data shape */}
            <polygon points={points} fill="rgba(0, 255, 255, 0.4)" stroke="#00FFFF" strokeWidth="2" />
            {/* Data points and values */}
            {data.values.map((value, i, arr) => {
                const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2;
                const pointRadius = (value / 100) * chartRadius;
                const x = center + pointRadius * Math.cos(angle);
                const y = center + pointRadius * Math.sin(angle);

                const textX = center + (pointRadius + 15) * Math.cos(angle);
                const textY = center + (pointRadius + 15) * Math.sin(angle);

                return (
                    <g key={i}>
                        <circle cx={x} cy={y} r="3" fill="#00FFFF" />
                        <text x={textX} y={textY} dy="0.3em" textAnchor="middle" fill="#00FFFF" fontSize="10">
                            {value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

const DashboardModal = ({ onClose }) => {
    useEffect(() => {
        const handleEsc = (event) => {
           if (event.keyCode === 27) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="w-full max-w-5xl bg-dark-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-neon-pink/20" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-neon-pink/20 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white"><i className="fa fa-tachometer mr-3 text-neon-pink"></i>认知仪表盘</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-dark-800 hover:bg-neon-pink/50 flex items-center justify-center text-white">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Left Panel: KPIs and Analysis */}
                <div className="md:col-span-1 space-y-6">
                    {/* KPIs */}
                    <div className="bg-dark-800/60 p-5 rounded-lg border border-neon-pink/10">
                        <h3 className="font-bold text-white mb-4">关键指标</h3>
                        <div className="space-y-4">
                            {dashboardData.kpis.map(kpi => (
                                <div key={kpi.name} className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-300">
                                        <i className={`fa ${kpi.icon} w-6 text-neon-pink/80`}></i>
                                        <span>{kpi.name}</span>
                                    </div>
                                    <span className="font-bold text-white text-lg">{kpi.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Analysis */}
                    <div className="bg-dark-800/60 p-5 rounded-lg border border-neon-pink/10">
                        <h3 className="font-bold text-white mb-4">优势与成长点</h3>
                        <div>
                            <h4 className="font-semibold text-green-400 mb-2">当前优势</h4>
                            <div className="flex flex-wrap gap-2">
                                {dashboardData.strengths.map(s => <span key={s} className="bg-green-400/20 text-green-300 text-sm px-2 py-1 rounded-full">{s}</span>)}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold text-yellow-400 mb-2">成长区域</h4>
                            <div className="flex flex-wrap gap-2">
                                {dashboardData.growthAreas.map(s => <span key={s} className="bg-yellow-400/20 text-yellow-300 text-sm px-2 py-1 rounded-full">{s}</span>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Radar Chart */}
                <div className="md:col-span-2 bg-dark-800/60 p-5 rounded-lg border border-neon-pink/10 flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-white mb-4">核心能力罗盘</h3>
                    <RadarChart data={dashboardData.radarData} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardModal; 