import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LearningPath = ({ course, userId }) => {
    const [progress, setProgress] = useState(0);
    const [currentModule, setCurrentModule] = useState(0);
    const [quizScore, setQuizScore] = useState(null);

    // 加载学习进度
    useEffect(() => {
        const loadProgress = async () => {
            const res = await axios.get(`/api/progress?userId=${userId}&courseId=${course.id}`);
            setProgress(res.data.progress);
            setCurrentModule(res.data.currentModule);
        };
        loadProgress();
    }, [userId, course.id]);

    // 更新学习进度
    const updateProgress = async (moduleId) => {
        await axios.post('/api/activity', {
            userId,
            courseId: course.id,
            activityType: 'course_progress',
            progress: moduleId / course.modules.length * 100
        });
        setCurrentModule(moduleId);
        setProgress(moduleId / course.modules.length * 100);
    };

    // 完成测验
    const completeQuiz = async (score) => {
        setQuizScore(score);
        await axios.post('/api/activity', {
            userId,
            courseId: course.id,
            activityType: 'quiz_complete',
            score
        });

        if (score >= 90) {
            // 优秀测验奖励
            await axios.post('/api/activity', {
                userId,
                courseId: course.id,
                activityType: 'quiz_excellent',
                score
            });
        }
    };

    // 完成课程
    const completeCourse = async () => {
        await axios.post('/api/activity', {
            userId,
            courseId: course.id,
            activityType: 'course_complete',
            score: progress === 100 ? 100 : 80 // 模拟课程得分
        });
        alert('恭喜完成课程！奖励已发放');
    };

    return (
        <div className="learning-path">
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
                <span>{progress}% 完成</span>
            </div>

            <div className="course-modules">
                {course.modules.map((module, index) => (
                    <div
                        key={module.id}
                        className={`module ${index <= currentModule ? 'completed' : ''}`}
                        onClick={() => index <= currentModule + 1 && updateProgress(index)}
                    >
                        <h3>{module.title}</h3>
                        <p>{module.description}</p>
                        {index === currentModule && (
                            <button onClick={() => updateProgress(index + 1)}>
                                标记完成
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {progress === 100 && !quizScore && (
                <QuizComponent
                    questions={course.quiz}
                    onComplete={completeQuiz}
                />
            )}

            {quizScore && quizScore >= 60 && (
                <div className="course-completion">
                    <h3>测验得分: {quizScore}/100</h3>
                    <button onClick={completeCourse}>完成课程</button>
                </div>
            )}
        </div>
    );
};

export default LearningPath;