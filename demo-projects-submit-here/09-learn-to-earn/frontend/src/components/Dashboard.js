import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const Dashboard = ({ user }) => {
    const [tokenBalance, setTokenBalance] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [learningStats, setLearningStats] = useState({
        completedCourses: 0,
        totalEarned: 0,
        streak: 0
    });

    // 加载用户数据
    useEffect(() => {
        const loadUserData = async () => {
            // 获取代币余额
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const tokenContract = new ethers.Contract(
                process.env.REACT_APP_TOKEN_ADDRESS,
                tokenABI,
                provider
            );
            const balance = await tokenContract.balanceOf(user.address);
            setTokenBalance(ethers.utils.formatUnits(balance, 18));

            // 获取成就
            const nftContract = new ethers.Contract(
                process.env.REACT_APP_NFT_ADDRESS,
                nftABI,
                provider
            );
            const achievements = await nftContract.getUserAchievements(user.address);
            setAchievements(achievements);

            // 获取学习数据
            const statsRes = await axios.get(`/api/users/${user.id}/stats`);
            setLearningStats(statsRes.data);

            // 获取推荐
            const recRes = await axios.get(`/api/recommendations/${user.id}`);
            setRecommendations(recRes.data);
        };

        if (user) loadUserData();
    }, [user]);

    // 领取每日奖励
    const claimDailyReward = async () => {
        try {
            await axios.post('/api/activity', {
                userId: user.id,
                activityType: 'daily_login'
            });
            alert('每日奖励已领取！');
        } catch (error) {
            console.error('领取奖励失败:', error);
        }
    };

    return (
        <div className="dashboard">
            <div className="stats-card">
                <h2>学习统计</h2>
                <p>已完成课程: {learningStats.completedCourses}</p>
                <p>累计赚取: {learningStats.totalEarned} LRN</p>
                <p>连续学习: {learningStats.streak} 天</p>
                <button onClick={claimDailyReward}>领取每日奖励</button>
            </div>

            <div className="token-balance">
                <h2>我的代币</h2>
                <p>{tokenBalance} LRN</p>
            </div>

            <div className="achievements">
                <h2>成就徽章</h2>
                <div className="badges-grid">
                    {achievements.map(achv => (
                        <div key={achv.id} className="badge">
                            <img src={achv.image} alt={achv.title} />
                            <p>{achv.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="recommendations">
                <h2>为你推荐</h2>
                <div className="courses-list">
                    {recommendations.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;