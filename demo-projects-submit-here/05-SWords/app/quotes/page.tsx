"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, MessageCircle, Database, RefreshCw, Trash2, Heart, Bookmark } from "lucide-react"
import { useEffect, useState } from "react"
import { getQuotes, deleteQuote, testConnection, type SwordsData } from "@/lib/quotes"
import { getLatestQuotes, getQuoteCount, formatAddress, formatTimestamp, type Quote } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"
import { useLikesFavorites } from "@/hooks/use-likes-favorites"
import { updateUserStats } from "@/lib/user-profile"
import WalletConnect from "@/components/wallet-connect"

type DataSource = "supabase" | "blockchain" | "both"

interface CombinedQuote {
  id: number | string
  content: string
  author?: string
  authorName?: string
  origin?: string
  user?: string
  timestamp?: number
  source: "supabase" | "blockchain"
  supabaseId?: number
  blockchainId?: number
}

export default function QuotesWall() {
  const router = useRouter()
  const { toast } = useToast()
  const { isLiked, isFavorited, toggleLike, toggleFavorite } = useLikesFavorites()
  const [supabaseQuotes, setSupabaseQuotes] = useState<SwordsData[]>([])
  const [blockchainQuotes, setBlockchainQuotes] = useState<Quote[]>([])
  const [combinedQuotes, setCombinedQuotes] = useState<CombinedQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<DataSource>("both")
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null)
  const [blockchainCount, setBlockchainCount] = useState(0)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string>("")

  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    combineAndFilterQuotes()
  }, [supabaseQuotes, blockchainQuotes, dataSource])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([loadSupabaseData(), loadBlockchainData()])
    setLoading(false)
  }

  const loadSupabaseData = async () => {
    try {
      console.log("开始连接 Supabase 数据库...")
      const isConnected = await testConnection()
      setSupabaseConnected(isConnected)

      if (isConnected) {
        const data = await getQuotes()
        console.log("从 Supabase 获取到的数据:", data)
        setSupabaseQuotes(data)
      }
    } catch (error) {
      console.error("加载 Supabase 数据时出错:", error)
      setSupabaseConnected(false)
    }
  }

  const loadBlockchainData = async () => {
    try {
      console.log("开始从智能合约获取格言...")
      const [quotesData, count] = await Promise.all([getLatestQuotes(50), getQuoteCount()])
      console.log("从智能合约获取到的数据:", quotesData)
      setBlockchainQuotes(quotesData)
      setBlockchainCount(count)
    } catch (error) {
      console.error("加载智能合约数据时出错:", error)
    }
  }

  const combineAndFilterQuotes = () => {
    let combined: CombinedQuote[] = []

    // 添加 Supabase 数据
    if (dataSource === "supabase" || dataSource === "both") {
      const supabaseConverted: CombinedQuote[] = supabaseQuotes.map((quote) => ({
        id: `supabase-${quote.ID || quote.id}`,
        content: quote.content || "暂无内容",
        author: quote.author || undefined,
        origin: quote.origin || undefined,
        user: quote.user || undefined,
        source: "supabase" as const,
        supabaseId: quote.ID || quote.id,
      }))
      combined = [...combined, ...supabaseConverted]
    }

    // 添加区块链数据
    if (dataSource === "blockchain" || dataSource === "both") {
      const blockchainConverted: CombinedQuote[] = blockchainQuotes.map((quote) => ({
        id: `blockchain-${quote.id}`,
        content: quote.content,
        authorName: quote.authorName,
        origin: quote.origin,
        user: quote.user,
        timestamp: quote.timestamp,
        source: "blockchain" as const,
        blockchainId: quote.id,
      }))
      combined = [...combined, ...blockchainConverted]
    }

    // 按时间戳排序（如果有的话）
    combined.sort((a, b) => {
      const aTime = a.timestamp || 0
      const bTime = b.timestamp || 0
      return bTime - aTime
    })

    setCombinedQuotes(combined)
  }

  const handleDeleteQuote = async (quote: CombinedQuote) => {
    if (quote.source === "supabase" && quote.supabaseId) {
      try {
        await deleteQuote(quote.supabaseId)
        setSupabaseQuotes(supabaseQuotes.filter((q) => (q.ID || q.id) !== quote.supabaseId))
        toast({
          title: "删除成功",
          description: "记录已从数据库中删除",
        })
      } catch (error) {
        toast({
          title: "删除失败",
          description: "删除记录时出现错误",
          variant: "destructive",
        })
      }
    } else if (quote.source === "blockchain") {
      toast({
        title: "无法删除",
        description: "区块链上的数据无法删除",
        variant: "destructive",
      })
    }
  }

  const handleWalletConnectionChange = (connected: boolean, address?: string) => {
    setIsWalletConnected(connected)
    setConnectedAddress(address || "")
  }

  const handleGoBack = () => {
    router.push("/")
  }

  const handleAddQuote = () => {
    router.push("/quotes/add")
  }

  const handleViewComments = (quote: CombinedQuote) => {
    if (quote.source === "blockchain" && quote.blockchainId) {
      router.push(`/quotes/${quote.blockchainId}/comments`)
    } else {
      toast({
        title: "功能提示",
        description: "评论功能仅支持区块链格言",
        variant: "destructive",
      })
    }
  }

  const handleLikeQuote = (quote: CombinedQuote) => {
    if (!isWalletConnected) {
      toast({
        title: "需要连接钱包",
        description: "请先连接钱包才能点赞",
        variant: "destructive",
      })
      return
    }
    
    const wasLiked = isLiked(quote.id.toString())
    toggleLike(quote.id.toString())
    
    // 更新用户统计数据
    if (connectedAddress) {
      const currentStats = JSON.parse(localStorage.getItem("user_stats_" + connectedAddress.toLowerCase()) || "{}")
      const newLikes = wasLiked ? Math.max(0, (currentStats.totalLikes || 0) - 1) : (currentStats.totalLikes || 0) + 1
      updateUserStats(connectedAddress, { totalLikes: newLikes })
    }
    
    toast({
      title: wasLiked ? "取消点赞" : "点赞成功",
      description: wasLiked ? "已取消点赞" : "已添加到您的点赞列表",
    })
  }

  const handleFavoriteQuote = (quote: CombinedQuote) => {
    if (!isWalletConnected) {
      toast({
        title: "需要连接钱包",
        description: "请先连接钱包才能收藏",
        variant: "destructive",
      })
      return
    }
    
    const wasFavorited = isFavorited(quote.id.toString())
    toggleFavorite(quote.id.toString())
    
    // 更新用户统计数据
    if (connectedAddress) {
      const currentStats = JSON.parse(localStorage.getItem("user_stats_" + connectedAddress.toLowerCase()) || "{}")
      const newFavorites = wasFavorited ? Math.max(0, (currentStats.totalFavorites || 0) - 1) : (currentStats.totalFavorites || 0) + 1
      updateUserStats(connectedAddress, { totalFavorites: newFavorites })
    }
    
    toast({
      title: wasFavorited ? "取消收藏" : "收藏成功",
      description: wasFavorited ? "已取消收藏" : "已添加到您的收藏列表",
    })
  }

  const getTextSize = (content: string) => {
    const length = content?.length || 0
    if (length < 50) return "text-xl leading-relaxed"
    if (length < 150) return "text-lg leading-relaxed"
    if (length < 300) return "text-base leading-relaxed"
    return "text-sm leading-relaxed"
  }

  const getSourceBadge = (source: "supabase" | "blockchain") => {
    if (source === "supabase") {
      return (
        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
          数据库
        </span>
      )
    } else {
      return (
        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
          区块链
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">正在加载数据...</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">同时连接数据库和区块链</p>
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

            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">格言墙</h1>
            </div>

            <div className="flex items-center gap-3">
              <WalletConnect onConnectionChange={handleWalletConnectionChange} />
              <Button
                onClick={loadAllData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
                刷新
              </Button>
              <Button onClick={handleAddQuote} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Plus className="w-4 h-4" />
                添加格言
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Filter */}
      <div className="bg-slate-100 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">数据源:</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setDataSource("both")}
                  variant={dataSource === "both" ? "default" : "ghost"}
                  size="sm"
                >
                  全部显示
                </Button>
                <Button
                  onClick={() => setDataSource("supabase")}
                  variant={dataSource === "supabase" ? "default" : "ghost"}
                  size="sm"
                >
                  仅数据库
                </Button>
                <Button
                  onClick={() => setDataSource("blockchain")}
                  variant={dataSource === "blockchain" ? "default" : "ghost"}
                  size="sm"
                >
                  仅区块链
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${supabaseConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span>数据库: {supabaseQuotes.length} 条</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>区块链: {blockchainQuotes.length} 条</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Database className="w-4 h-4" />
            <span className="text-sm">
              混合数据源 | 数据库 {supabaseQuotes.length} 条 + 区块链 {blockchainQuotes.length} 条 = 总计{" "}
              {combinedQuotes.length} 条记录 | 新格言将添加到区块链
            </span>
          </div>
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="container mx-auto px-4 py-8">
        {combinedQuotes.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-2">
              {dataSource === "supabase"
                ? "数据库中暂无数据"
                : dataSource === "blockchain"
                  ? "区块链中暂无数据"
                  : "暂无数据"}
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mb-4">添加第一条格言到区块链！</p>
            <Button onClick={handleAddQuote} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加格言到区块链
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          >
            {combinedQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                className="break-inside-avoid mb-6"
              >
                <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50 hover:shadow-lg transition-all duration-300 hover:bg-white/90 dark:hover:bg-neutral-900/90 group">
                  <CardContent className="p-6 relative">
                    {/* 删除按钮 - 仅对数据库数据显示 */}
                    {quote.source === "supabase" && (
                      <Button
                        onClick={() => handleDeleteQuote(quote)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="space-y-4">
                      <blockquote className={`text-slate-700 dark:text-slate-300 italic ${getTextSize(quote.content)}`}>
                        "{quote.content}"
                      </blockquote>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {(quote.author || quote.authorName) && (
                            <cite className="text-slate-900 dark:text-white font-semibold not-italic text-sm">
                              — {quote.author || quote.authorName}
                            </cite>
                          )}
                          <div className="flex items-center gap-2">
                            {getSourceBadge(quote.source)}
                            {quote.source === "blockchain" && quote.blockchainId && (
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                                #{quote.blockchainId}
                              </span>
                            )}
                          </div>
                        </div>

                        {quote.origin && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">出处: {quote.origin}</div>
                        )}

                        {quote.source === "blockchain" && (
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                            <div className="flex items-center gap-2">
                              <span>发布者: {formatAddress(quote.user || "")}</span>
                              {quote.user?.toLowerCase() === connectedAddress.toLowerCase() && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                                  我的
                                </span>
                              )}
                            </div>
                            {quote.timestamp && <span>{formatTimestamp(quote.timestamp)}</span>}
                          </div>
                        )}

                        {quote.source === "supabase" && quote.user && (
                          <div className="text-xs text-slate-500 dark:text-slate-500">用户: {quote.user}</div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-neutral-700">
                          <div className="flex items-center gap-2">
                            {quote.source === "blockchain" ? (
                              <Button
                                onClick={() => handleViewComments(quote)}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              >
                                <MessageCircle className="w-4 h-4" />
                                查看评论
                              </Button>
                            ) : (
                              <div className="text-xs text-slate-400 dark:text-slate-600">传统数据库存储</div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`p-1 h-auto transition-colors ${
                                isLiked(quote.id.toString())
                                  ? "text-red-500 bg-red-50 dark:bg-red-950"
                                  : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              }`}
                              onClick={() => handleLikeQuote(quote)}
                            >
                              <Heart className={`w-4 h-4 ${isLiked(quote.id.toString()) ? "fill-current" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`p-1 h-auto transition-colors ${
                                isFavorited(quote.id.toString())
                                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                                  : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                              }`}
                              onClick={() => handleFavoriteQuote(quote)}
                            >
                              <Bookmark className={`w-4 h-4 ${isFavorited(quote.id.toString()) ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
