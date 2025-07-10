import { web3Manager } from "./web3"

export interface UserProfile {
  address: string
  nickname?: string
  avatar?: string
  joinDate: Date
  totalQuotes: number
  totalComments: number
  totalLikes: number
  totalFavorites: number
  firstInteractionDate?: Date
}

// 用户资料存储键
const USER_PROFILE_KEY = "user_profile_"
const FIRST_INTERACTION_KEY = "first_interaction_"

/**
 * 获取或创建用户加入时间
 * 基于用户首次与平台交互的时间
 */
export function getUserJoinDate(address: string): Date {
  const storageKey = FIRST_INTERACTION_KEY + address.toLowerCase()
  
  // 尝试从localStorage获取首次交互时间
  const savedDate = localStorage.getItem(storageKey)
  
  if (savedDate) {
    return new Date(parseInt(savedDate))
  }
  
  // 如果没有记录，创建新的首次交互时间
  const now = Date.now()
  localStorage.setItem(storageKey, now.toString())
  return new Date(now)
}

/**
 * 记录用户首次交互
 * 用于确定用户的加入时间
 */
export function recordFirstInteraction(address: string): void {
  const storageKey = FIRST_INTERACTION_KEY + address.toLowerCase()
  
  // 只有在没有记录的情况下才记录
  if (!localStorage.getItem(storageKey)) {
    const now = Date.now()
    localStorage.setItem(storageKey, now.toString())
  }
}

/**
 * 获取用户资料
 * 包含合理的统计数据计算
 */
export async function getUserProfile(address: string): Promise<UserProfile> {
  // 记录首次交互（如果还没有记录）
  recordFirstInteraction(address)
  
  // 获取加入时间
  const joinDate = getUserJoinDate(address)
  
  // 从localStorage获取用户统计数据
  const stats = getUserStats(address)
  
  // 生成头像URL
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
  
  // 生成昵称
  const nickname = generateNickname(address)
  
  return {
    address,
    nickname,
    avatar,
    joinDate,
    totalQuotes: stats.totalQuotes,
    totalComments: stats.totalComments,
    totalLikes: stats.totalLikes,
    totalFavorites: stats.totalFavorites,
    firstInteractionDate: joinDate,
  }
}

/**
 * 获取用户统计数据
 */
function getUserStats(address: string) {
  const statsKey = "user_stats_" + address.toLowerCase()
  const savedStats = localStorage.getItem(statsKey)
  
  if (savedStats) {
    return JSON.parse(savedStats)
  }
  
  // 默认统计数据
  const defaultStats = {
    totalQuotes: 0,
    totalComments: 0,
    totalLikes: 0,
    totalFavorites: 0,
  }
  
  localStorage.setItem(statsKey, JSON.stringify(defaultStats))
  return defaultStats
}

/**
 * 更新用户统计数据
 */
export function updateUserStats(address: string, updates: Partial<{
  totalQuotes: number
  totalComments: number
  totalLikes: number
  totalFavorites: number
}>): void {
  const statsKey = "user_stats_" + address.toLowerCase()
  const currentStats = getUserStats(address)
  
  const newStats = { ...currentStats, ...updates }
  localStorage.setItem(statsKey, JSON.stringify(newStats))
}

/**
 * 生成用户昵称
 */
function generateNickname(address: string): string {
  // 使用地址后4位作为昵称
  const shortAddress = address.slice(-4)
  
  // 可以从预设的昵称列表中随机选择
  const nicknames = [
    "思考者", "哲学家", "文学家", "观察者", "探索者",
    "智慧者", "学者", "思想家", "评论家", "收藏家"
  ]
  
  const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)]
  return `${randomNickname}${shortAddress}`
}

/**
 * 格式化加入时间显示
 */
export function formatJoinDate(joinDate: Date): string {
  const now = new Date()
  const diffTime = now.getTime() - joinDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return "今天加入"
  } else if (diffDays === 1) {
    return "昨天加入"
  } else if (diffDays < 7) {
    return `${diffDays}天前加入`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}周前加入`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months}个月前加入`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years}年前加入`
  }
}

/**
 * 获取用户活跃度等级
 */
export function getUserActivityLevel(profile: UserProfile): {
  level: string
  color: string
  description: string
} {
  const totalActions = profile.totalQuotes + profile.totalComments + profile.totalLikes + profile.totalFavorites
  
  if (totalActions >= 100) {
    return {
      level: "活跃用户",
      color: "text-green-600",
      description: "高度活跃的社区成员"
    }
  } else if (totalActions >= 50) {
    return {
      level: "活跃用户",
      color: "text-blue-600", 
      description: "积极参与社区活动"
    }
  } else if (totalActions >= 20) {
    return {
      level: "普通用户",
      color: "text-yellow-600",
      description: "偶尔参与社区活动"
    }
  } else if (totalActions >= 5) {
    return {
      level: "新用户",
      color: "text-orange-600",
      description: "刚开始使用平台"
    }
  } else {
    return {
      level: "游客",
      color: "text-gray-600",
      description: "刚刚加入平台"
    }
  }
} 