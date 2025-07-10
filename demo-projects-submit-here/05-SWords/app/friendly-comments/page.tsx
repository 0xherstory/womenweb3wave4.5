"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  ReplyIcon,
  Send,
  Filter,
  Clock,
  UserCheck,
  ThumbsUp,
  Flag,
  Smile,
  Star,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: number
  author: string
  content: string
  timestamp: Date
  likes: number
  replies: any[]
  category: string
  isLiked: boolean
  isPinned: boolean
}

const initialComments: Comment[] = [
  {
    id: 1,
    author: "智慧探索者",
    content:
      "这个格言墙真的很棒！每天都能在这里找到新的人生感悟。特别喜欢那句'主人的工具永远不会拆毁主人的房子'，让我思考了很久。",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    likes: 15,
    replies: [
      {
        id: 101,
        author: "哲学爱好者",
        content: "同感！这句话来自奥德丽·洛德，她的思想真的很深刻。",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 8,
        isLiked: false,
      },
    ],
    category: "感悟分享",
    isLiked: false,
    isPinned: true,
  },
  {
    id: 2,
    author: "书虫小明",
    content: "推荐大家去看看书单页面，里面的《沉思录》真的值得一读。马可·奥勒留的智慧跨越了千年依然闪闪发光。",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4小时前
    likes: 23,
    replies: [],
    category: "书籍推荐",
    isLiked: true,
    isPinned: false,
  },
  {
    id: 3,
    author: "每日抽取达人",
    content:
      "今天在每日一抽中抽到了一句很棒的格言：'教育是最强有力的武器，你能用它来改变世界。'感谢这个平台让我每天都有新的收获！",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
    likes: 12,
    replies: [
      {
        id: 102,
        author: "学习者",
        content: "曼德拉的话总是那么有力量！",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 5,
        isLiked: true,
      },
      {
        id: 103,
        author: "教育工作者",
        content: "作为一名老师，这句话深深触动了我。教育确实能改变世界。",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 7,
        isLiked: false,
      },
    ],
    category: "每日抽取",
    isLiked: false,
    isPinned: false,
  },
  {
    id: 4,
    author: "区块链爱好者",
    content: "很喜欢这个平台将格言存储在区块链上的想法，这样的智慧真的值得永久保存。技术与人文的结合，太棒了！",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8小时前
    likes: 18,
    replies: [],
    category: "技术讨论",
    isLiked: false,
    isPinned: false,
  },
  {
    id: 5,
    author: "女性力量",
    content:
      "背后的女性页面让我了解了很多杰出的女性思想家和艺术家。奥德丽·洛德、西蒙娜·德·波伏瓦、弗里达·卡罗...她们的故事都很inspiring！",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小时前
    likes: 31,
    replies: [
      {
        id: 104,
        author: "艺术爱好者",
        content: "弗里达的自画像真的很震撼，她用艺术表达了女性的力量。",
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        likes: 9,
        isLiked: false,
      },
    ],
    category: "女性话题",
    isLiked: true,
    isPinned: false,
  },
]

const categories = ["全部", "感悟分享", "书籍推荐", "每日抽取", "技术讨论", "女性话题", "其他"]
const sortOptions = ["最新", "最热", "最多回复"]

export default function FriendlyCommentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [sortBy, setSortBy] = useState("最新")
  const [showAddComment, setShowAddComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [newComment, setNewComment] = useState({
    author: "",
    content: "",
    category: "感悟分享",
  })
  const [newReply, setNewReply] = useState({
    author: "",
    content: "",
  })

  const handleGoBack = () => {
    router.push("/")
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}天前`
    } else if (hours > 0) {
      return `${hours}小时前`
    } else {
      return "刚刚"
    }
  }

  const handleLikeComment = (commentId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    )
  }

  const handleLikeReply = (commentId: number, replyId: number) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    }
                  : reply,
              ),
            }
          : comment,
      ),
    )
  }

  const handleSubmitComment = () => {
    if (!newComment.author.trim() || !newComment.content.trim()) {
      toast({
        title: "请填写完整信息",
        description: "请输入您的昵称和评论内容",
        variant: "destructive",
      })
      return
    }

    const comment: Comment = {
      id: Date.now(),
      author: newComment.author.trim(),
      content: newComment.content.trim(),
      timestamp: new Date(),
      likes: 0,
      replies: [],
      category: newComment.category,
      isLiked: false,
      isPinned: false,
    }

    setComments([comment, ...comments])
    setNewComment({ author: "", content: "", category: "感悟分享" })
    setShowAddComment(false)

    toast({
      title: "评论发布成功！",
      description: "感谢您的分享，让我们一起创造友好的讨论环境。",
    })
  }

  const handleSubmitReply = (commentId: number) => {
    if (!newReply.author.trim() || !newReply.content.trim()) {
      toast({
        title: "请填写完整信息",
        description: "请输入您的昵称和回复内容",
        variant: "destructive",
      })
      return
    }

    const reply = {
      id: Date.now(),
      author: newReply.author.trim(),
      content: newReply.content.trim(),
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
    }

    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment,
      ),
    )

    setNewReply({ author: "", content: "" })
    setReplyingTo(null)

    toast({
      title: "回复发布成功！",
      description: "感谢您参与讨论！",
    })
  }

  const filteredAndSortedComments = comments
    .filter((comment) => selectedCategory === "全部" || comment.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "最热":
          return b.likes - a.likes
        case "最多回复":
          return b.replies.length - a.replies.length
        case "最新":
        default:
          return b.timestamp.getTime() - a.timestamp.getTime()
      }
    })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              友好言论墙
            </h1>
            <Button
              onClick={() => setShowAddComment(!showAddComment)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              发表评论
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-100 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
            <Smile className="w-4 h-4" />
            <span className="text-sm">
              欢迎来到友好言论墙！在这里分享您的想法，与其他用户进行友善的交流 | 当前 {comments.length} 条评论
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-neutral-900/50 border-b border-blue-200 dark:border-blue-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">分类:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    className={
                      selectedCategory === category
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">排序:</span>
              </div>
              <div className="flex gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option}
                    onClick={() => setSortBy(option)}
                    variant={sortBy === option ? "default" : "ghost"}
                    size="sm"
                    className={
                      sortBy === option
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    }
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Add Comment Form */}
        <AnimatePresence>
          {showAddComment && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    发表新评论
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-blue-700 dark:text-blue-300">
                        您的昵称 *
                      </Label>
                      <Input
                        id="author"
                        placeholder="请输入您的昵称..."
                        value={newComment.author}
                        onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                        className="bg-white/50 dark:bg-neutral-800/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-blue-700 dark:text-blue-300">
                        分类
                      </Label>
                      <select
                        id="category"
                        value={newComment.category}
                        onChange={(e) => setNewComment({ ...newComment, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-neutral-800/50 border border-blue-200 dark:border-blue-700 rounded-md text-blue-900 dark:text-blue-100"
                      >
                        {categories.slice(1).map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-blue-700 dark:text-blue-300">
                      评论内容 *
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="分享您的想法、感悟或建议..."
                      value={newComment.content}
                      onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      className="min-h-[100px] bg-white/50 dark:bg-neutral-800/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSubmitComment} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      发布评论
                    </Button>
                    <Button
                      onClick={() => setShowAddComment(false)}
                      variant="outline"
                      className="bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments List */}
        <div className="space-y-6">
          {filteredAndSortedComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <p className="text-blue-600 dark:text-blue-400 text-lg mb-2">暂无评论</p>
              <p className="text-blue-500 dark:text-blue-500 text-sm mb-4">成为第一个发表评论的人吧！</p>
              <Button onClick={() => setShowAddComment(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                发表评论
              </Button>
            </div>
          ) : (
            filteredAndSortedComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 ${comment.isPinned ? "ring-2 ring-blue-300 dark:ring-blue-600" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Comment Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-blue-900 dark:text-blue-100">{comment.author}</h3>
                              {comment.isPinned && (
                                <Badge className="bg-blue-500 text-white">
                                  <Star className="w-3 h-3 mr-1" />
                                  置顶
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                              <span>{formatTimeAgo(comment.timestamp)}</span>
                              <span>•</span>
                              <Badge
                                variant="outline"
                                className="border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400"
                              >
                                {comment.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Comment Content */}
                      <div className="pl-13">
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{comment.content}</p>
                      </div>

                      {/* Comment Actions */}
                      <div className="pl-13 flex items-center gap-4">
                        <Button
                          onClick={() => handleLikeComment(comment.id)}
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-2 ${comment.isLiked ? "text-red-500 hover:text-red-600" : "text-blue-600 hover:text-blue-700"}`}
                        >
                          <Heart className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`} />
                          <span>{comment.likes}</span>
                        </Button>
                        <Button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                          <ReplyIcon className="w-4 h-4" />
                          <span>回复</span>
                        </Button>
                        {comment.replies.length > 0 && (
                          <span className="text-sm text-blue-500 dark:text-blue-400">
                            {comment.replies.length} 条回复
                          </span>
                        )}
                      </div>

                      {/* Reply Form */}
                      <AnimatePresence>
                        {replyingTo === comment.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pl-13"
                          >
                            <Card className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                              <CardContent className="p-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="您的昵称..."
                                    value={newReply.author}
                                    onChange={(e) => setNewReply({ ...newReply, author: e.target.value })}
                                    className="bg-white/70 dark:bg-neutral-800/70"
                                  />
                                </div>
                                <Textarea
                                  placeholder="写下您的回复..."
                                  value={newReply.content}
                                  onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
                                  className="bg-white/70 dark:bg-neutral-800/70"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSubmitReply(comment.id)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Send className="w-3 h-3 mr-1" />
                                    发布回复
                                  </Button>
                                  <Button
                                    onClick={() => setReplyingTo(null)}
                                    variant="outline"
                                    size="sm"
                                    className="bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50"
                                  >
                                    取消
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="pl-13 space-y-3">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-blue-900 dark:text-blue-100">{reply.author}</span>
                                    <span className="text-xs text-blue-500 dark:text-blue-400">
                                      {formatTimeAgo(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">{reply.content}</p>
                                  <Button
                                    onClick={() => handleLikeReply(comment.id, reply.id)}
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-1 text-xs ${reply.isLiked ? "text-red-500 hover:text-red-600" : "text-blue-600 hover:text-blue-700"}`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`} />
                                    <span>{reply.likes}</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
