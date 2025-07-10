"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { ArrowLeft, UserCheck, MessageCircle, Heart, Bookmark, Settings, LogOut, Wallet, Star, Calendar, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { web3Manager, formatAddress, type Quote, type Comment } from "@/lib/web3"
import { getUserProfile, formatJoinDate, getUserActivityLevel, updateUserStats, type UserProfile as UserProfileType } from "@/lib/user-profile"
import { useToast } from "@/hooks/use-toast"
import WalletConnect from "@/components/wallet-connect"

// 使用从user-profile.ts导入的UserProfile类型
type UserProfile = UserProfileType

interface UserComment {
  id: number
  quoteId: number
  quoteContent: string
  content: string
  timestamp: number
}

interface UserFavorite {
  id: number
  content: string
  authorName: string
  origin: string
  timestamp: number
  isLiked: boolean
  isFavorited: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string>("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userComments, setUserComments] = useState<UserComment[]>([])
  const [userFavorites, setUserFavorites] = useState<UserFavorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  useEffect(() => {
    if (isWalletConnected && connectedAddress) {
      loadUserData()
    }
  }, [isWalletConnected, connectedAddress])

  const checkWalletConnection = async () => {
    try {
      const address = await web3Manager.getCurrentAccount()
      if (address) {
        setIsWalletConnected(true)
        setConnectedAddress(address)
      }
    } catch (error) {
      console.error("检查钱包连接状态失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnectionChange = (connected: boolean, address?: string) => {
    setIsWalletConnected(connected)
    setConnectedAddress(address || "")
  }

  const loadUserData = async () => {
    if (!connectedAddress) return

    try {
      setLoading(true)
      
      // 使用新的用户资料管理逻辑
      const profile = await getUserProfile(connectedAddress)
      setUserProfile(profile)

      // 模拟加载用户评论
      const comments: UserComment[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        quoteId: Math.floor(Math.random() * 100) + 1,
        quoteContent: "这是一条示例格言内容，展示了用户评论的上下文...",
        content: `这是用户的第${i + 1}条评论，表达了对这条格言的看法和思考。`,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      }))
      
      setUserComments(comments)

      // 模拟加载用户收藏
      const favorites: UserFavorite[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        content: `这是第${i + 1}条收藏的格言，内容深刻，值得反复品味。`,
        authorName: `作者${i + 1}`,
        origin: `来源${i + 1}`,
        timestamp: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
        isLiked: Math.random() > 0.5,
        isFavorited: true,
      }))
      
      setUserFavorites(favorites)
    } catch (error) {
      console.error("加载用户数据失败:", error)
      toast({
        title: "加载失败",
        description: "无法加载用户数据，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push("/")
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return "刚刚"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-blue-500" />
              个人中心
            </h1>
            <WalletConnect onConnectionChange={handleWalletConnectionChange} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!isWalletConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-slate-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserCheck className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">连接钱包查看个人资料</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  连接您的Web3钱包以查看个人资料、评论历史和收藏内容
                </p>
                <WalletConnect onConnectionChange={handleWalletConnectionChange} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Profile Header */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userProfile?.avatar} />
                    <AvatarFallback className="text-lg">
                      {userProfile?.nickname?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {userProfile?.nickname}
                      </h2>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        已连接
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      {formatAddress(userProfile?.address || "")}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        加入时间: {userProfile ? formatJoinDate(userProfile.joinDate) : ""}
                      </span>
                      {userProfile && (
                        <span className={`flex items-center gap-1 ${getUserActivityLevel(userProfile).color}`}>
                          <Star className="w-4 h-4" />
                          {getUserActivityLevel(userProfile).level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-neutral-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userProfile?.totalQuotes}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">发布格言</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userProfile?.totalComments}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">评论数量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{userProfile?.totalLikes}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">点赞数量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userProfile?.totalFavorites}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">收藏数量</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50">
              <CardContent className="p-0">
                <Tabs defaultValue="comments" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-neutral-800">
                    <TabsTrigger value="comments" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      我的评论
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      我的收藏
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="comments" className="p-6">
                    <div className="space-y-4">
                      {userComments.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 dark:text-slate-400">暂无评论记录</p>
                        </div>
                      ) : (
                        userComments.map((comment) => (
                          <div key={comment.id} className="border border-slate-200 dark:border-neutral-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  评论 #{comment.id}
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {getTimeAgo(comment.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="mb-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-md">
                              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                "{comment.quoteContent}"
                              </p>
                            </div>
                            <p className="text-slate-900 dark:text-white">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="favorites" className="p-6">
                    <div className="space-y-4">
                      {userFavorites.length === 0 ? (
                        <div className="text-center py-8">
                          <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600 dark:text-slate-400">暂无收藏记录</p>
                        </div>
                      ) : (
                        userFavorites.map((favorite) => (
                          <div key={favorite.id} className="border border-slate-200 dark:border-neutral-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  收藏 #{favorite.id}
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-slate-500">
                                  {getTimeAgo(favorite.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`p-1 h-auto ${favorite.isLiked ? 'text-red-500' : 'text-slate-400'}`}
                                >
                                  <Heart className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`p-1 h-auto ${favorite.isFavorited ? 'text-yellow-500' : 'text-slate-400'}`}
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-slate-900 dark:text-white mb-2 font-medium">
                              "{favorite.content}"
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                              <span>作者: {favorite.authorName}</span>
                              <span>来源: {favorite.origin}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
} 