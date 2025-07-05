"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        throw new Error("请安装 MetaMask 钱包")
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("未找到钱包账户")
      }

      const address = accounts[0]
      onConnect(address)
    } catch (err: any) {
      if (err.code === 4001) {
        setError("用户拒绝连接钱包")
      } else {
        setError(err.message || "连接钱包失败")
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (window.ethereum && window.ethereum.close) {
        await window.ethereum.close()
      }
      if (window.ethereum && window.ethereum.disconnect) {
        await window.ethereum.disconnect()
      }
      localStorage.removeItem("walletconnect")
    } catch (error) {
      console.error("断开连接失败:", error)
    }
  }

  // Mock connection for demo purposes
  const mockConnect = () => {
    const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
    onConnect(mockAddress)
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <CardTitle>连接钱包</CardTitle>
          <CardDescription>请连接您的Web3钱包以开始使用平台</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={connectWallet} disabled={isConnecting} className="w-full" size="lg">
            {isConnecting ? "连接中..." : "连接 MetaMask"}
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-500">或</span>
          </div>

          <Button onClick={mockConnect} variant="outline" className="w-full bg-transparent" size="lg">
            演示模式（模拟连接）
          </Button>

          <p className="text-xs text-gray-500 text-center">演示模式将生成一个模拟钱包地址用于测试</p>
        </CardContent>
      </Card>
    </div>
  )
}
