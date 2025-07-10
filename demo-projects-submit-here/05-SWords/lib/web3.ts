import { ethers } from "ethers"

// 智能合约配置
export const CONTRACT_ADDRESS = "0xe2fc71225f9681418c2bf41ed64fc9cbfe7b737c"

export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quoteId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "content",
        type: "string",
      },
    ],
    name: "commentOnQuote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "quoteId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "commenter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CommentSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "authorName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "origin",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "QuoteSubmitted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        internalType: "string",
        name: "authorName",
        type: "string",
      },
      {
        internalType: "string",
        name: "origin",
        type: "string",
      },
    ],
    name: "submitQuote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "commentCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quoteId",
        type: "uint256",
      },
    ],
    name: "getCommentsByQuote",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "quoteId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "commenter",
            type: "address",
          },
          {
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct FeministQuoteBoard.Comment[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      },
    ],
    name: "getLatestQuotes",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            internalType: "string",
            name: "authorName",
            type: "string",
          },
          {
            internalType: "string",
            name: "origin",
            type: "string",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct FeministQuoteBoard.Quote[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "quoteId",
        type: "uint256",
      },
    ],
    name: "getQuote",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "content",
            type: "string",
          },
          {
            internalType: "string",
            name: "authorName",
            type: "string",
          },
          {
            internalType: "string",
            name: "origin",
            type: "string",
          },
          {
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
        ],
        internalType: "struct FeministQuoteBoard.Quote",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "quoteComments",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "quoteId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "commenter",
        type: "address",
      },
      {
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "quoteCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "quotes",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "content",
        type: "string",
      },
      {
        internalType: "string",
        name: "authorName",
        type: "string",
      },
      {
        internalType: "string",
        name: "origin",
        type: "string",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

// 类型定义
export interface Quote {
  id: number
  content: string
  authorName: string
  origin: string
  user: string
  timestamp: number
}

export interface Comment {
  id: number
  quoteId: number
  commenter: string
  content: string
  timestamp: number
}

// 多个备用RPC端点
const RPC_ENDPOINTS = [
  "https://eth.llamarpc.com",
  "https://rpc.flashbots.net",
  "https://ethereum.publicnode.com",
  "https://1rpc.io/eth",
  "https://eth.drpc.org",
]

// Web3 Provider 管理
export class Web3Manager {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private contract: ethers.Contract | null = null
  private readOnlyProvider: ethers.JsonRpcProvider | null = null

  async connectWallet(): Promise<string> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("请安装 MetaMask 或其他 Web3 钱包")
    }

    try {
      // 请求连接钱包
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // 创建 provider 和 signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      // 创建合约实例
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer)

      const address = await this.signer.getAddress()
      console.log("钱包连接成功:", address)
      return address
    } catch (error) {
      console.error("连接钱包失败:", error)
      throw error
    }
  }

  async getReadOnlyContract(): Promise<ethers.Contract> {
    if (!this.readOnlyProvider) {
      // 尝试多个RPC端点，直到找到一个可用的
      for (const endpoint of RPC_ENDPOINTS) {
        try {
          console.log(`尝试连接RPC端点: ${endpoint}`)
          const provider = new ethers.JsonRpcProvider(endpoint)

          // 测试连接
          await provider.getNetwork()

          this.readOnlyProvider = provider
          console.log(`成功连接到RPC端点: ${endpoint}`)
          break
        } catch (error) {
          console.warn(`RPC端点 ${endpoint} 连接失败:`, error)
          continue
        }
      }

      if (!this.readOnlyProvider) {
        throw new Error("无法连接到任何RPC端点，请稍后重试")
      }
    }

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.readOnlyProvider)
  }

  getContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error("请先连接钱包")
    }
    return this.contract
  }

  async getCurrentAccount(): Promise<string | null> {
    if (!this.signer) return null
    try {
      return await this.signer.getAddress()
    } catch {
      return null
    }
  }

  isConnected(): boolean {
    return this.contract !== null
  }

  // 重置连接状态
  resetConnection(): void {
    this.readOnlyProvider = null
  }
}

// 全局 Web3 管理器实例
export const web3Manager = new Web3Manager()

// 智能合约交互函数
export async function getLatestQuotes(limit = 50): Promise<Quote[]> {
  try {
    console.log("开始获取区块链格言...")
    const contract = await web3Manager.getReadOnlyContract()
    const quotes = await contract.getLatestQuotes(limit)

    const result = quotes.map((quote: any) => ({
      id: Number(quote.id),
      content: quote.content,
      authorName: quote.authorName,
      origin: quote.origin,
      user: quote.user,
      timestamp: Number(quote.timestamp),
    }))

    console.log(`成功获取 ${result.length} 条区块链格言`)
    return result
  } catch (error) {
    console.error("获取区块链格言失败:", error)

    // 重置连接以便下次重试
    web3Manager.resetConnection()

    // 抛出错误让调用方处理
    throw new Error(`区块链连接失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }
}

export async function submitQuote(content: string, authorName: string, origin: string): Promise<void> {
  try {
    const contract = web3Manager.getContract()
    const tx = await contract.submitQuote(content, authorName, origin)

    console.log("交易已提交:", tx.hash)
    await tx.wait()
    console.log("交易已确认:", tx.hash)
  } catch (error) {
    console.error("提交格言失败:", error)
    throw error
  }
}

export async function getQuote(quoteId: number): Promise<Quote> {
  try {
    const contract = await web3Manager.getReadOnlyContract()
    const quote = await contract.getQuote(quoteId)

    return {
      id: Number(quote.id),
      content: quote.content,
      authorName: quote.authorName,
      origin: quote.origin,
      user: quote.user,
      timestamp: Number(quote.timestamp),
    }
  } catch (error) {
    console.error("获取格言详情失败:", error)
    web3Manager.resetConnection()
    throw error
  }
}

export async function getCommentsByQuote(quoteId: number): Promise<Comment[]> {
  try {
    const contract = await web3Manager.getReadOnlyContract()
    const comments = await contract.getCommentsByQuote(quoteId)

    return comments.map((comment: any) => ({
      id: Number(comment.id),
      quoteId: Number(comment.quoteId),
      commenter: comment.commenter,
      content: comment.content,
      timestamp: Number(comment.timestamp),
    }))
  } catch (error) {
    console.error("获取评论失败:", error)
    web3Manager.resetConnection()
    throw error
  }
}

export async function commentOnQuote(quoteId: number, content: string): Promise<void> {
  try {
    const contract = web3Manager.getContract()
    const tx = await contract.commentOnQuote(quoteId, content)

    console.log("评论交易已提交:", tx.hash)
    await tx.wait()
    console.log("评论交易已确认:", tx.hash)
  } catch (error) {
    console.error("提交评论失败:", error)
    throw error
  }
}

export async function getQuoteCount(): Promise<number> {
  try {
    const contract = await web3Manager.getReadOnlyContract()
    const count = await contract.quoteCount()
    return Number(count)
  } catch (error) {
    console.error("获取格言数量失败:", error)
    web3Manager.resetConnection()
    throw error
  }
}

// 工具函数
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString("zh-CN")
}

// 检查区块链连接状态
export async function checkBlockchainConnection(): Promise<boolean> {
  try {
    await web3Manager.getReadOnlyContract()
    return true
  } catch (error) {
    console.warn("区块链连接检查失败:", error)
    return false
  }
}

// 声明 window.ethereum 类型
declare global {
  interface Window {
    ethereum?: any
  }
}
