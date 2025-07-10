"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sparkles, Gift, RefreshCw, Calendar, Star, Clock, BookOpen, Heart, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { getLatestQuotes, checkBlockchainConnection, type Quote } from "@/lib/web3"
import { getQuotes, type SwordsData } from "@/lib/quotes"
import { useToast } from "@/hooks/use-toast"

interface DrawResult {
  quote: string
  author: string
  origin?: string
  source: "blockchain" | "database"
  id: number
}

interface Book {
  id: number
  title: string
  author: string
  cover: string
  rating: number
  category: string
  description: string
  recommendation: string
  publishYear: number
  pages: number
  tags: string[]
  featured: boolean
}

// 图书数据
const books: Book[] = [
  {
    id: 1,
    title: "沉思录",
    author: "马可·奥勒留",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.8,
    category: "哲学",
    description: "古罗马皇帝马可·奥勒留的个人哲学思考，斯多葛学派的经典之作。书中充满了对人生、道德、宇宙的深刻思考。",
    recommendation: "这本书教会我们如何在困境中保持内心的平静，如何以理性和智慧面对生活的挑战。每一页都是智慧的结晶。",
    publishYear: 180,
    pages: 256,
    tags: ["古典哲学", "斯多葛主义", "人生智慧", "自我修养"],
    featured: true,
  },
  {
    id: 2,
    title: "房间里的大象",
    author: "奥德丽·洛德",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.7,
    category: "社会学",
    description: "探讨种族、性别、阶级等社会议题的深刻作品，揭示了社会中被忽视的真相。",
    recommendation: "洛德的文字犀利而深刻，她用诗人的敏感和活动家的勇气，为我们揭示了社会的复杂面貌。",
    publishYear: 1984,
    pages: 320,
    tags: ["社会批判", "女性主义", "种族问题", "身份认同"],
    featured: true,
  },
  {
    id: 3,
    title: "1984",
    author: "乔治·奥威尔",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.9,
    category: "文学",
    description: "反乌托邦小说的经典之作，描绘了一个极权主义社会的恐怖景象。",
    recommendation: "在信息时代，这本书的预言性显得格外重要。它提醒我们警惕权力的滥用和真相的扭曲。",
    publishYear: 1949,
    pages: 368,
    tags: ["反乌托邦", "政治小说", "社会批判", "经典文学"],
    featured: false,
  },
  {
    id: 4,
    title: "第二性",
    author: "西蒙娜·德·波伏瓦",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.6,
    category: "女性主义",
    description: "女性主义理论的奠基之作，深入分析了女性在社会中的地位和处境。",
    recommendation: "这本书不仅是女性主义的经典，更是所有人理解性别议题的必读之作。它挑战了传统的性别观念。",
    publishYear: 1949,
    pages: 832,
    tags: ["女性主义", "性别研究", "社会学", "哲学"],
    featured: true,
  },
  {
    id: 5,
    title: "反抗者",
    author: "阿尔贝·加缪",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.5,
    category: "哲学",
    description: "存在主义哲学家加缪对反抗精神的深刻思考，探讨了人类面对荒诞世界的态度。",
    recommendation: "加缪用优美的文字阐述了反抗的意义，不是为了胜利，而是为了保持人的尊严。",
    publishYear: 1951,
    pages: 384,
    tags: ["存在主义", "反抗精神", "人文主义", "法国文学"],
    featured: false,
  },
  {
    id: 6,
    title: "紫色",
    author: "艾丽斯·沃克",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.4,
    category: "文学",
    description: "普利策奖获奖作品，讲述了非裔美国女性的成长和觉醒故事。",
    recommendation: "这是一个关于痛苦、成长和救赎的故事。沃克用温柔而坚定的笔触，展现了女性的力量。",
    publishYear: 1982,
    pages: 304,
    tags: ["非裔文学", "女性成长", "社会现实", "普利策奖"],
    featured: false,
  },
]

export default function DailyDrawPage() {
  const router = useRouter()
  const { toast } = useToast()

  // 格言相关状态
  const [isDrawingQuote, setIsDrawingQuote] = useState(false)
  const [quoteResult, setQuoteResult] = useState<DrawResult | null>(null)
  const [hasDrawnQuoteToday, setHasDrawnQuoteToday] = useState(false)
  const [allQuotes, setAllQuotes] = useState<DrawResult[]>([])
  const [quoteDrawCount, setQuoteDrawCount] = useState(0)

  // 图书相关状态
  const [isDrawingBook, setIsDrawingBook] = useState(false)
  const [bookResult, setBookResult] = useState<Book | null>(null)
  const [hasDrawnBookToday, setHasDrawnBookToday] = useState(false)
  const [bookDrawCount, setBookDrawCount] = useState(0)

  // 系统状态
  const [loading, setLoading] = useState(true)
  const [blockchainAvailable, setBlockchainAvailable] = useState(true)
  const [blockchainError, setBlockchainError] = useState<string | null>(null)

  useEffect(() => {
    loadQuotes()
    checkTodaysDraws()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      setBlockchainError(null)

      // 首先检查区块链连接
      const isBlockchainConnected = await checkBlockchainConnection()
      setBlockchainAvailable(isBlockchainConnected)

      let blockchainQuotes: Quote[] = []
      let databaseQuotes: SwordsData[] = []

      // 并行加载数据，但区块链失败不影响数据库
      const promises = []

      if (isBlockchainConnected) {
        promises.push(
          getLatestQuotes(50).catch((error) => {
            console.warn("区块链数据加载失败:", error)
            setBlockchainAvailable(false)
            setBlockchainError(error.message || "区块链连接失败")
            return []
          }),
        )
      } else {
        promises.push(Promise.resolve([]))
        setBlockchainError("区块链服务暂时不可用")
      }

      promises.push(
        getQuotes().catch((error) => {
          console.warn("数据库数据加载失败:", error)
          return []
        }),
      )

      const [blockchainResult, databaseResult] = await Promise.all(promises)
      blockchainQuotes = blockchainResult as Quote[]
      databaseQuotes = databaseResult as SwordsData[]

      const combinedQuotes: DrawResult[] = [
        ...blockchainQuotes.map((quote: Quote) => ({
          quote: quote.content,
          author: quote.authorName,
          origin: quote.origin,
          source: "blockchain" as const,
          id: quote.id,
        })),
        ...databaseQuotes.map((quote: SwordsData) => ({
          quote: quote.content || "暂无内容",
          author: quote.author || "匿名",
          origin: quote.origin,
          source: "database" as const,
          id: quote.ID || quote.id || 0,
        })),
      ]

      const validQuotes = combinedQuotes.filter((q) => q.quote && q.quote.trim() !== "")
      setAllQuotes(validQuotes)

      console.log(`数据加载完成: 区块链 ${blockchainQuotes.length} 条, 数据库 ${databaseQuotes.length} 条`)

      // 显示加载结果提示
      if (validQuotes.length === 0) {
        toast({
          title: "数据加载失败",
          description: "无法加载任何格言数据，请检查网络连接",
          variant: "destructive",
        })
      } else if (!isBlockchainConnected && blockchainError) {
        toast({
          title: "部分功能不可用",
          description: `仅加载到数据库数据，区块链服务暂时不可用`,
        })
      }
    } catch (error) {
      console.error("加载数据时出错:", error)
      toast({
        title: "加载失败",
        description: "数据加载过程中出现错误，请刷新页面重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkTodaysDraws = () => {
    const today = new Date().toDateString()

    // 检查格言抽取
    const lastQuoteDrawDate = localStorage.getItem("lastQuoteDrawDate")
    const todayQuoteDrawCount = Number.parseInt(localStorage.getItem("todayQuoteDrawCount") || "0")

    if (lastQuoteDrawDate === today) {
      setHasDrawnQuoteToday(todayQuoteDrawCount >= 3)
      setQuoteDrawCount(todayQuoteDrawCount)
    } else {
      setHasDrawnQuoteToday(false)
      setQuoteDrawCount(0)
      localStorage.setItem("todayQuoteDrawCount", "0")
    }

    // 检查图书抽取
    const lastBookDrawDate = localStorage.getItem("lastBookDrawDate")
    const todayBookDrawCount = Number.parseInt(localStorage.getItem("todayBookDrawCount") || "0")

    if (lastBookDrawDate === today) {
      setHasDrawnBookToday(todayBookDrawCount >= 3)
      setBookDrawCount(todayBookDrawCount)
    } else {
      setHasDrawnBookToday(false)
      setBookDrawCount(0)
      localStorage.setItem("todayBookDrawCount", "0")
    }
  }

  const handleDrawQuote = async () => {
    if (allQuotes.length === 0) {
      toast({
        title: "暂无数据",
        description: "请等待格言数据加载完成或刷新页面重试",
        variant: "destructive",
      })
      return
    }

    if (hasDrawnQuoteToday) {
      toast({
        title: "今日已达上限",
        description: "格言每天最多可以抽取3次，明天再来吧！",
        variant: "destructive",
      })
      return
    }

    setIsDrawingQuote(true)
    setQuoteResult(null)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const randomIndex = Math.floor(Math.random() * allQuotes.length)
    const selectedQuote = allQuotes[randomIndex]

    setQuoteResult(selectedQuote)
    setIsDrawingQuote(false)

    const today = new Date().toDateString()
    const newCount = quoteDrawCount + 1
    setQuoteDrawCount(newCount)
    setHasDrawnQuoteToday(newCount >= 3)

    if (typeof window !== "undefined") {
      localStorage.setItem("lastQuoteDrawDate", today)
      localStorage.setItem("todayQuoteDrawCount", newCount.toString())
    }

    toast({
      title: "格言抽取成功！",
      description: `今日第${newCount}次抽取完成，还可抽取${3 - newCount}次`,
    })
  }

  const handleDrawBook = async () => {
    if (hasDrawnBookToday) {
      toast({
        title: "今日已达上限",
        description: "图书每天最多可以抽取3次，明天再来吧！",
        variant: "destructive",
      })
      return
    }

    setIsDrawingBook(true)
    setBookResult(null)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const randomIndex = Math.floor(Math.random() * books.length)
    const selectedBook = books[randomIndex]

    setBookResult(selectedBook)
    setIsDrawingBook(false)

    const today = new Date().toDateString()
    const newCount = bookDrawCount + 1
    setBookDrawCount(newCount)
    setHasDrawnBookToday(newCount >= 3)

    if (typeof window !== "undefined") {
      localStorage.setItem("lastBookDrawDate", today)
      localStorage.setItem("todayBookDrawCount", newCount.toString())
    }

    toast({
      title: "图书推荐成功！",
      description: `今日第${newCount}次抽取完成，还可抽取${3 - newCount}次`,
    })
  }

  const handleGoBack = () => {
    router.push("/")
  }

  const resetQuoteDraw = () => {
    setQuoteResult(null)
  }

  const resetBookDraw = () => {
    setBookResult(null)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-300"
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 dark:text-purple-400">正在准备抽取池...</p>
          <p className="text-sm text-purple-500 dark:text-purple-500 mt-2">连接数据库和区块链中</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-purple-200 dark:border-purple-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              每日一抽
            </h1>
            <div className="flex items-center gap-4 text-sm text-purple-600 dark:text-purple-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>格言 {quoteDrawCount}/3</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>图书 {bookDrawCount}/3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className={`border-b ${blockchainAvailable ? "bg-purple-100 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" : "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"}`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
            {blockchainAvailable ? (
              <>
                <Gift className="w-4 h-4" />
                <span className="text-sm">
                  每日双重惊喜 | 格言池: {allQuotes.length} 条 | 图书池: {books.length} 本 | 每类每日限抽3次
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  区块链服务暂时不可用，仅显示数据库内容 | 格言池: {allQuotes.length} 条 | 图书池: {books.length} 本
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 格言抽取板块 */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  智慧格言抽取
                </CardTitle>
                <p className="text-purple-100 text-center">从海量格言中为您精选今日的智慧</p>
                {!blockchainAvailable && (
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2 mt-2">
                    <p className="text-yellow-100 text-xs text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      区块链数据暂时不可用，仅显示数据库内容
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <div className="h-80 flex items-center justify-center mb-6">
                    <AnimatePresence mode="wait">
                      {isDrawingQuote ? (
                        <motion.div
                          key="drawing-quote"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-center"
                        >
                          <motion.div
                            animate={{
                              rotate: 360,
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                              scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                            }}
                            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                          >
                            <Sparkles className="w-12 h-12 text-white" />
                          </motion.div>
                          <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                            className="text-purple-600 dark:text-purple-400 font-medium"
                          >
                            正在为您抽取智慧格言...
                          </motion.p>
                        </motion.div>
                      ) : quoteResult ? (
                        <motion.div
                          key="result-quote"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="w-full"
                        >
                          <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-center mb-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                              >
                                <Star className="w-6 h-6 text-white" />
                              </motion.div>
                            </div>
                            <blockquote className="text-lg italic text-purple-800 dark:text-purple-200 text-center mb-4">
                              "{quoteResult.quote}"
                            </blockquote>
                            <div className="text-center space-y-2">
                              <cite className="text-purple-700 dark:text-purple-300 font-semibold not-italic">
                                — {quoteResult.author}
                              </cite>
                              {quoteResult.origin && (
                                <p className="text-sm text-purple-600 dark:text-purple-400">
                                  出处: {quoteResult.origin}
                                </p>
                              )}
                              <div className="flex items-center justify-center gap-2 mt-3">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    quoteResult.source === "blockchain"
                                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                      : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                  }`}
                                >
                                  {quoteResult.source === "blockchain" ? "区块链" : "数据库"}
                                </span>
                                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                                  #{quoteResult.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="waiting-quote"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center"
                        >
                          <div className="w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-dashed border-purple-300 dark:border-purple-600">
                            <Sparkles className="w-16 h-16 text-purple-500 dark:text-purple-400" />
                          </div>
                          <p className="text-purple-600 dark:text-purple-400">点击下方按钮开始抽取您的专属格言</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-4 justify-center">
                    {quoteResult ? (
                      <Button
                        onClick={resetQuoteDraw}
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新抽取
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDrawQuote}
                        disabled={isDrawingQuote || hasDrawnQuoteToday || allQuotes.length === 0}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50"
                      >
                        {isDrawingQuote ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            抽取中...
                          </div>
                        ) : hasDrawnQuoteToday ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            今日已达上限
                          </div>
                        ) : allQuotes.length === 0 ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            暂无数据
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            抽取格言
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 图书推荐板块 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <CardTitle className="flex items-center justify-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  随机图书推荐
                </CardTitle>
                <p className="text-indigo-100 text-center">发现您的下一本心爱读物</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <div className="h-80 flex items-center justify-center mb-6">
                    <AnimatePresence mode="wait">
                      {isDrawingBook ? (
                        <motion.div
                          key="drawing-book"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-center"
                        >
                          <motion.div
                            animate={{
                              rotate: 360,
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                              scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
                            }}
                            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
                          >
                            <BookOpen className="w-12 h-12 text-white" />
                          </motion.div>
                          <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                            className="text-indigo-600 dark:text-indigo-400 font-medium"
                          >
                            正在为您推荐好书...
                          </motion.p>
                        </motion.div>
                      ) : bookResult ? (
                        <motion.div
                          key="result-book"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="w-full"
                        >
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-700">
                            <div className="text-center mb-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-16 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3"
                              >
                                <BookOpen className="w-8 h-8 text-white" />
                              </motion.div>
                              <h3 className="text-xl font-bold text-indigo-800 dark:text-indigo-200 mb-1">
                                {bookResult.title}
                              </h3>
                              <p className="text-indigo-600 dark:text-indigo-400 mb-2">
                                {bookResult.author} · {bookResult.publishYear}年
                              </p>
                              <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="flex items-center gap-1">
                                  {renderStars(bookResult.rating)}
                                  <span className="text-sm text-indigo-600 dark:text-indigo-400 ml-1">
                                    {bookResult.rating}
                                  </span>
                                </div>
                                <Badge className="bg-indigo-500 text-white">{bookResult.category}</Badge>
                                {bookResult.featured && (
                                  <Badge className="bg-red-500 text-white">
                                    <Heart className="w-3 h-3 mr-1" />
                                    精选
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3 text-sm">
                              <div>
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">简介</h4>
                                <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                  {bookResult.description}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-1">推荐理由</h4>
                                <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                  {bookResult.recommendation}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-indigo-600 dark:text-indigo-400">
                                <span>{bookResult.pages} 页</span>
                                <span>•</span>
                                <span>{bookResult.tags.slice(0, 2).join(", ")}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="waiting-book"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center"
                        >
                          <div className="w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-dashed border-indigo-300 dark:border-indigo-600">
                            <BookOpen className="w-16 h-16 text-indigo-500 dark:text-indigo-400" />
                          </div>
                          <p className="text-indigo-600 dark:text-indigo-400">点击下方按钮发现您的下一本好书</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex gap-4 justify-center">
                    {bookResult ? (
                      <Button
                        onClick={resetBookDraw}
                        variant="outline"
                        className="flex items-center gap-2 bg-transparent border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新推荐
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDrawBook}
                        disabled={isDrawingBook || hasDrawnBookToday}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold"
                      >
                        {isDrawingBook ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            推荐中...
                          </div>
                        ) : hasDrawnBookToday ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            今日已达上限
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            推荐图书
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 使用说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  格言抽取规则
                </h3>
                <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>每天可以抽取3次格言，每次都是随机选择</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>抽取池包含区块链和数据库中的所有格言</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>每日0点重置抽取次数</span>
                  </div>
                  {!blockchainAvailable && (
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-500">⚠</span>
                      <span className="text-yellow-700 dark:text-yellow-400">区块链服务暂时不可用</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-purple-200/30 dark:border-purple-700/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  图书推荐规则
                </h3>
                <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>每天可以获得3次图书推荐</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>推荐池包含精选的经典和现代优秀作品</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>每本书都有详细的推荐理由和评分</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
