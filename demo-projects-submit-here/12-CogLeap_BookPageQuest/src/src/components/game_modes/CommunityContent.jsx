import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // 修正导入
import apiClient from '../../utils/apiClient'; // 引入 apiClient

const TacticCard = ({ tactic, onVote, onCommentSubmit }) => {
  const [voted, setVoted] = useState(null); // 'up' | 'down' | null
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleVote = (voteType) => {
    // 纯前端投票状态更新，实际投票逻辑由父组件处理
    if (voted === voteType) {
      setVoted(null);
    } else {
      setVoted(voteType);
    }
    // onVote(tactic.id, voteType); // 将来可以连接到后端
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    onCommentSubmit(tactic.id, newComment.trim());
    setNewComment('');
  };

  return (
    <div className="bg-dark-800/60 p-5 rounded-lg border border-neon-blue/20">
      <p className="text-gray-200 text-lg mb-4">{tactic.content}</p>
      <div className="flex justify-between items-center text-sm mb-4">
        <span className="text-gray-400">由 <span className="font-semibold text-neon-pink">{tactic.authorName}</span> 于 {new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(tactic.createdAt))} 分享</span>
        <div className="flex items-center space-x-4">
          <button onClick={() => handleVote('up')} className={`flex items-center space-x-1 transition-colors ${voted === 'up' ? 'text-neon-green' : 'text-gray-400 hover:text-white'}`}>
            <i className="fa fa-thumbs-up"></i>
            <span>{tactic.upvotes}</span>
          </button>
          <button onClick={() => handleVote('down')} className={`flex items-center space-x-1 transition-colors ${voted === 'down' ? 'text-neon-pink' : 'text-gray-400 hover:text-white'}`}>
            <i className="fa fa-thumbs-down"></i>
            <span>{tactic.downvotes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 text-gray-400 hover:text-white">
             <i className="fa fa-comment"></i>
             <span>{tactic.comments.length}</span>
          </button>
        </div>
      </div>
      
      {showComments && (
        <div className="mt-4 pt-4 border-t border-neon-blue/20">
            <h4 className="text-md font-bold text-neon-blue mb-2">评论区</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neon-blue">
                {tactic.comments.length > 0 ? (
                    tactic.comments.map(comment => (
                        <div key={comment.id} className="text-sm bg-dark-900/50 p-2 rounded">
                            <span className="font-semibold text-neon-purple">{comment.authorName}: </span>
                            <span className="text-gray-300">{comment.content}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-500">还没有评论，快来抢占沙发！</p>
                )}
            </div>
             <form onSubmit={handleCommentSubmit} className="mt-3 flex space-x-2">
                <input 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="发表你的看法..."
                    className="flex-grow bg-dark-900 text-sm p-2 rounded border border-gray-600 focus:border-neon-purple"
                />
                <button type="submit" className="px-3 py-1 bg-neon-purple text-dark-900 rounded font-bold text-sm">评论</button>
            </form>
        </div>
      )}
    </div>
  );
};

const CommunityContent = () => {
  const { walletAddress, isAuthenticated } = useAuth(); // 使用 useAuth 钩子
  const [tactics, setTactics] = useState([]);
  const [newTacticContent, setNewTacticContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTactics = async () => {
      try {
      const response = await apiClient.get('/api/tactics');
      setTactics(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
      console.error("获取战术列表失败:", error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchTactics();
  }, []);

  const handleAddTactic = async (e) => {
    e.preventDefault();
    if (!newTacticContent.trim()) return;

    try {
      const response = await apiClient.post(
        '/api/tactics',
        { content: newTacticContent }
        );
      setTactics(response.data);
      setNewTacticContent('');
    } catch (error) {
      console.error("提交新战术失败:", error);
      alert(`提交失败: ${error.response?.data || error.message}`);
    }
  };
  
  const handleComment = async (tacticId, commentContent) => {
      try {
      const response = await apiClient.post(
        `/api/tactics/${tacticId}/comment`,
        { content: commentContent }
        );
      
      // 更新前端的评论列表
      const updatedTactics = tactics.map(t => {
        if (t.id === tacticId) {
          return { ...t, comments: [...t.comments, response.data] };
        }
        return t;
      });
      setTactics(updatedTactics);

    } catch (error) {
      console.error("添加评论失败:", error);
      alert(`评论失败: ${error.response?.data || error.message}`);
      }
  };

  if (isLoading) {
    return <div className="text-center p-8">正在从数据库加载社区战术...</div>;
  }

  return (
    <div>
      {/* 战术提交表单 */}
      <div className="bg-dark-800/60 p-6 rounded-lg border border-neon-purple/20 mb-8">
        <h2 className="text-2xl font-bold text-neon-purple mb-4">分享你的独门战术</h2>
        <form onSubmit={handleAddTactic}>
          <textarea
            value={newTacticContent}
            onChange={(e) => setNewTacticContent(e.target.value)}
            className="w-full h-24 p-3 bg-dark-900 rounded border border-gray-600 focus:border-neon-purple focus:ring-neon-purple transition-all text-white"
            placeholder="在这里输入你的策略战术或见解..."
          />
          <div className="text-right mt-4">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-neon-purple text-dark-900 font-bold hover:bg-purple-500 transition-all button-glow-purple"
            >
              提交分享
            </button>
          </div>
        </form>
      </div>

      {/* 战术展示列表 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-neon-blue">社区战术板</h2>
        {tactics.map(tactic => (
          <TacticCard 
            key={tactic.id} 
            tactic={tactic}
            onCommentSubmit={handleComment}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityContent; 