"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet, Database, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { submitQuote, web3Manager } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"
import WalletConnect from "@/components/wallet-connect"

export default function AddQuote() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string>("")
  const [formData, setFormData] = useState({
    content: "",
    authorName: "",
    origin: "",
  })

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    const address = await web3Manager.getCurrentAccount()
    if (address) {
      setIsWalletConnected(true)
      setConnectedAddress(address)
    }
  }

  const handleWalletConnectionChange = (connected: boolean, address?: string) => {
    setIsWalletConnected(connected)
    setConnectedAddress(address || "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isWalletConnected) {
      toast({
        title: "需要连接钱包",
        description: "请先连接钱包才能提交格言到区块链",
        variant: "destructive",
      })
      return
    }

    if (!formData.content.trim()) {
      toast({
        title: "错误",
        description: "请填写格言内容",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      toast({
        title: "提交中",
        description: "正在将格言提交到区块链，请在钱包中确认交易...",
      })

      await submitQuote(formData.content.trim(), formData.authorName.trim() || "匿名", formData.origin.trim() || "未知")

      toast({
        title: "提交成功",
        description: "格言已成功记录到区块链！数据将永久保存且无法删除。",
      })

      // 清空表单
      setFormData({
        content: "",
        authorName: "",
        origin: "",
      })

      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        router.push("/quotes")
      }, 2000)
    } catch (error: any) {
      console.error("提交格言失败:", error)

      let errorMessage = "提交格言时出现错误，请重试"
      if (error.message?.includes("user rejected")) {
        errorMessage = "用户取消了交易"
      } else if (error.message?.includes("insufficient funds")) {
        errorMessage = "账户余额不足以支付交易费用"
      }

      toast({
        title: "提交失败",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push("/quotes")
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
              返回格言墙
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-500" />
              添加到区块链
            </h1>
            <WalletConnect onConnectionChange={handleWalletConnectionChange} />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Database className="w-4 h-4" />
            <span className="text-sm">新格言将被永久记录在区块链上 | 数据无法删除或修改 | 需要支付少量 Gas 费用</span>
          </div>
        </div>
      </div>

      {/* Wallet Status Banner */}
      {!isWalletConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">需要连接钱包才能将格言提交到区块链</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                添加新格言到区块链
              </CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  您的格言将被永久记录在区块链上，无法删除或修改
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 dark:text-green-300">永久存储</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-700 dark:text-blue-300">去中心化</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-700 dark:text-purple-300">不可篡改</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-slate-700 dark:text-slate-300">
                    格言内容 *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="请输入格言内容..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[120px] bg-white/50 dark:bg-neutral-800/50"
                    required
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-500">建议：简洁有力的格言更容易传播和记忆</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorName" className="text-slate-700 dark:text-slate-300">
                    作者姓名
                  </Label>
                  <Input
                    id="authorName"
                    placeholder="请输入作者姓名（可选）..."
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="bg-white/50 dark:bg-neutral-800/50"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-500">留空将显示为"匿名"</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin" className="text-slate-700 dark:text-slate-300">
                    出处
                  </Label>
                  <Input
                    id="origin"
                    placeholder="请输入出处信息（可选）..."
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="bg-white/50 dark:bg-neutral-800/50"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-500">如：书籍、演讲、文章等</p>
                </div>

                {isWalletConnected && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">
                        钱包已连接: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-green-600 dark:text-green-400">
                      <p>✓ 提交时需要支付少量 Gas 费用</p>
                      <p>✓ 交易确认后格言将永久保存在区块链上</p>
                      <p>✓ 您将成为该格言的永久记录者</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleGoBack} className="flex-1 bg-transparent">
                    取消
                  </Button>
                  <Button type="submit" disabled={loading || !isWalletConnected} className="flex-1">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        提交中...
                      </div>
                    ) : !isWalletConnected ? (
                      "请先连接钱包"
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        提交到区块链
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card className="mt-6 bg-slate-50 dark:bg-neutral-900/50 border border-slate-200/50 dark:border-neutral-700/50">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">为什么选择区块链？</h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>永久保存：数据存储在去中心化网络中，永不丢失</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>不可篡改：一旦记录，任何人都无法修改或删除</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>公开透明：所有人都可以验证和查看记录</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>所有权明确：您的钱包地址将作为永久的记录者标识</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
