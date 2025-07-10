import { supabase } from "./supabase"

export type SwordsData = {
  ID?: number
  id?: number
  content: string | null
  author: string | null
  origin: string | null
  user: string | null
}

export async function getQuotes(): Promise<SwordsData[]> {
  console.log("正在从 swordsdata 表获取数据...")

  // 首先尝试获取所有数据，不指定排序
  let { data, error } = await supabase.from("swordsdata").select("*")

  if (error) {
    console.error("获取数据时出错:", error)
    throw error
  }

  console.log("成功获取原始数据:", data)

  if (data && data.length > 0) {
    // 检查第一条记录的字段名
    const firstRecord = data[0]
    console.log("第一条记录的字段:", Object.keys(firstRecord))

    // 尝试按不同的ID字段排序
    if ("ID" in firstRecord) {
      console.log("使用 ID 字段排序...")
      const { data: sortedData, error: sortError } = await supabase
        .from("swordsdata")
        .select("*")
        .order("ID", { ascending: false })

      if (!sortError && sortedData) {
        data = sortedData
      }
    } else if ("id" in firstRecord) {
      console.log("使用 id 字段排序...")
      const { data: sortedData, error: sortError } = await supabase
        .from("swordsdata")
        .select("*")
        .order("id", { ascending: false })

      if (!sortError && sortedData) {
        data = sortedData
      }
    }
  }

  console.log("最终数据:", data)
  console.log("数据条数:", data?.length || 0)
  return data || []
}

export async function addQuote(content: string, author?: string, origin?: string, user?: string): Promise<SwordsData> {
  console.log("正在添加新数据到 swordsdata 表...")

  const { data, error } = await supabase
    .from("swordsdata")
    .insert([{ content, author, origin, user }])
    .select()
    .single()

  if (error) {
    console.error("添加数据时出错:", error)
    throw error
  }

  console.log("成功添加数据:", data)
  return data
}

export async function deleteQuote(id: number): Promise<void> {
  console.log("正在删除数据，ID:", id)

  // 尝试使用不同的ID字段名
  let { error } = await supabase.from("swordsdata").delete().eq("ID", id)

  if (error) {
    console.log("使用 ID 字段删除失败，尝试 id 字段...")
    const result = await supabase.from("swordsdata").delete().eq("id", id)
    error = result.error
  }

  if (error) {
    console.error("删除数据时出错:", error)
    throw error
  }

  console.log("成功删除数据")
}

// 测试数据库连接的函数
export async function testConnection(): Promise<boolean> {
  try {
    console.log("测试 swordsdata 表连接...")
    const { data, error } = await supabase.from("swordsdata").select("*").limit(1)

    if (error) {
      console.error("数据库连接测试失败:", error)
      return false
    }

    console.log("数据库连接成功，样本数据:", data)
    return true
  } catch (error) {
    console.error("数据库连接测试异常:", error)
    return false
  }
}
