"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, LogOut, AlertCircle } from "lucide-react"
import { web3Manager, formatAddress } from "@/lib/web3"
import { useToast } from "@/hooks/use-toast"

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
}

export default function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const currentAccount = await web3Manager.getCurrentAccount()
      if (currentAccount) {
        setIsConnected(true)
        setAddress(currentAccount)
        onConnectionChange?.(true, currentAccount)
      }
    } catch (error) {
      console.error("检查钱包连接状态失败:", error)
    }
  }

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: "需要安装钱包",
        description: "请安装 MetaMask 或其他 Web3 钱包",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      const walletAddress = await web3Manager.connectWallet()

      setIsConnected(true)
      setAddress(walletAddress)
      onConnectionChange?.(true, walletAddress)

      toast({
        title: "钱包连接成功",
        description: `地址: ${formatAddress(walletAddress)}`,
      })
    } catch (error: any) {
      console.error("连接钱包失败:", error)
      toast({
        title: "连接失败",
        description: error.message || "无法连接到钱包",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress("")
    onConnectionChange?.(false)

    toast({
      title: "钱包已断开",
      description: "您已断开钱包连接",
    })
  }

  if (!window.ethereum) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">需要 Web3 钱包</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                请安装 MetaMask 或其他 Web3 钱包来使用区块链功能
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {isConnected ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">{formatAddress(address)}</span>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            断开连接
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {isConnecting ? "连接中..." : "连接钱包"}
        </Button>
      )}
    </div>
  )
}
