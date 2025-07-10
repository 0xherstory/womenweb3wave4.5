// 邮箱订阅相关的工具函数和类型定义

export interface SubscriptionData {
  email: string
  name?: string
  subscribeDate: Date
  isActive: boolean
  preferences?: {
    frequency: "daily" | "weekly"
    categories: string[]
    timeZone: string
  }
}

export interface EmailTemplate {
  subject: string
  content: string
  quote: {
    text: string
    author: string
    origin?: string
  }
  reflection?: string
  date: Date
}

// 模拟的订阅API函数
export async function subscribeToNewsletter(
  email: string,
  name?: string,
): Promise<{ success: boolean; message: string }> {
  // 这里应该调用实际的后端API
  // 例如：发送到邮件服务提供商（如 Mailchimp, SendGrid 等）

  try {
    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟成功响应
    console.log("订阅请求:", { email, name, timestamp: new Date() })

    return {
      success: true,
      message: "订阅成功！确认邮件已发送到您的邮箱。",
    }
  } catch (error) {
    return {
      success: false,
      message: "订阅失败，请稍后重试。",
    }
  }
}

// 取消订阅函数
export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log("取消订阅:", { email, timestamp: new Date() })

    return {
      success: true,
      message: "已成功取消订阅。",
    }
  } catch (error) {
    return {
      success: false,
      message: "取消订阅失败，请稍后重试。",
    }
  }
}

// 生成每日邮件内容
export function generateDailyEmail(quote: { content: string; authorName: string; origin?: string }): EmailTemplate {
  const reflections = [
    "这句话提醒我们思考生活的真谛，在忙碌中寻找内心的平静。",
    "智慧往往隐藏在简单的话语中，需要我们用心去体会。",
    "每一句格言都是前人智慧的结晶，值得我们深思和践行。",
    "让这句话成为今天的座右铭，指引我们前进的方向。",
    "在这个快节奏的世界里，停下来思考这些智慧的话语格外重要。",
  ]

  const randomReflection = reflections[Math.floor(Math.random() * reflections.length)]

  return {
    subject: `每日格言 - ${new Date().toLocaleDateString("zh-CN")}`,
    content: generateEmailHTML(quote, randomReflection),
    quote: {
      text: quote.content,
      author: quote.authorName,
      origin: quote.origin,
    },
    reflection: randomReflection,
    date: new Date(),
  }
}

// 生成邮件HTML内容
function generateEmailHTML(
  quote: { content: string; authorName: string; origin?: string },
  reflection: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>每日格言</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .quote { font-size: 20px; font-style: italic; text-align: center; margin: 20px 0; padding: 20px; background: white; border-left: 4px solid #667eea; border-radius: 5px; }
        .author { text-align: center; font-weight: bold; color: #666; margin-top: 10px; }
        .reflection { background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 每日格言</h1>
          <p>${new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div class="content">
          <div class="quote">
            "${quote.content}"
            <div class="author">— ${quote.authorName}</div>
            ${quote.origin ? `<div style="font-size: 14px; color: #888; margin-top: 5px;">出处：${quote.origin}</div>` : ""}
          </div>
          <div class="reflection">
            <h3>💭 今日思考</h3>
            <p>${reflection}</p>
          </div>
          <div class="footer">
            <p>感谢您的订阅！</p>
            <p><a href="#" style="color: #667eea;">管理订阅</a> | <a href="#" style="color: #dc3545;">取消订阅</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// 验证邮箱格式
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 获取订阅统计信息
export async function getSubscriptionStats(): Promise<{
  totalSubscribers: number
  activeSubscribers: number
  averageRating: number
}> {
  // 模拟统计数据
  return {
    totalSubscribers: 2847,
    activeSubscribers: 2654,
    averageRating: 4.9,
  }
}
