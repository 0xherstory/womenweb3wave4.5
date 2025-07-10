"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mail,
  Clock,
  Star,
  Shield,
  Zap,
  Calendar,
  Heart,
  CheckCircle,
  Sparkles,
  Globe,
  Users2,
} from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function SubscribePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "请输入邮箱",
        description: "邮箱地址是必填项",
        variant: "destructive",
      })
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "邮箱格式错误",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 这里应该调用实际的订阅API
      console.log("订阅信息:", { email, name })

      setSubscribed(true)
      toast({
        title: "订阅成功！",
        description: "欢迎加入我们的每日格言推送！请查收确认邮件。",
      })

      // 清空表单
      setEmail("")
      setName("")
    } catch (error) {
      toast({
        title: "订阅失败",
        description: "请稍后重试或联系客服",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push("/")
  }

  const features = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "每日精选",
      description: "每天早上8点准时推送一条精心挑选的格言",
      color: "text-blue-500",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "多元文化",
      description: "涵盖中外名人名言、哲学思考、人生感悟",
      color: "text-green-500",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "个性化内容",
      description: "根据用户反馈和互动，逐步优化推送内容",
      color: "text-red-500",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "隐私保护",
      description: "严格保护用户隐私，可随时取消订阅",
      color: "text-orange-500",
    },
  ]



  if (subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto text-center"
        >
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50">
            <CardContent className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">订阅成功！</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                感谢您的订阅！我们已向您的邮箱发送了确认邮件，请点击邮件中的链接完成订阅确认。
              </p>

              <div className="space-y-3 text-sm text-slate-500 dark:text-slate-500 mb-6">
                <p>📧 确认邮件已发送</p>
                <p>⏰ 每日早上8点开始推送</p>
                <p>🎯 首次推送将在确认后的次日开始</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleGoBack} variant="outline" className="flex-1 bg-transparent">
                  返回首页
                </Button>
                <Button onClick={() => router.push("/quotes")} className="flex-1">
                  浏览格言
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
              <Mail className="w-6 h-6 text-blue-500" />
              每日格言推送
            </h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">每日一句，智慧相伴</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              订阅我们的每日格言推送，让智慧的光芒照亮您的每一天
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4" />
                <span>已有 2,847 人订阅</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>4.9/5.0 用户评分</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Subscription Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50 h-fit">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  立即订阅
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">填写您的邮箱，开始您的每日智慧之旅</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                      邮箱地址 *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/50 dark:bg-neutral-800/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                      姓名 (可选)
                    </Label>
                    <Input
                      id="name"
                      placeholder="您的姓名"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/50 dark:bg-neutral-800/50"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-500">提供姓名可以让推送内容更加个性化</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">推送时间</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">每天早上 8:00 准时推送，周末不间断</p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        订阅中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        免费订阅
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
                    订阅即表示您同意接收我们的邮件推送，您可以随时取消订阅
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">为什么选择我们的推送？</h3>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-slate-200/30 dark:border-neutral-700/30 hover:bg-white/70 dark:hover:bg-neutral-900/70 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`${feature.color} mt-1`}>{feature.icon}</div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>



        {/* Sample Email Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">邮件预览</h3>
          <Card className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span className="font-medium">每日格言 - 2024年1月15日</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">今日格言</h4>
                  <blockquote className="text-xl italic text-slate-700 dark:text-slate-300 border-l-4 border-blue-500 pl-4">
                    "教育是最强有力的武器，你能用它来改变世界。"
                  </blockquote>
                  <cite className="text-sm text-slate-600 dark:text-slate-400 mt-2 block">— 纳尔逊·曼德拉</cite>
                </div>

                <div className="bg-slate-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <h5 className="font-medium text-slate-900 dark:text-white mb-2">今日思考</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    教育不仅仅是知识的传授，更是改变世界的力量。每一次学习都是对未来的投资，每一个想法都可能成为改变的种子。
                  </p>
                </div>

                <div className="text-center pt-4 border-t border-slate-200 dark:border-neutral-700">
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    感谢您的订阅 |{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                      取消订阅
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
