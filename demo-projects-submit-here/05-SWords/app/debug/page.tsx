"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResults([])

    try {
      // 1. 测试基本连接
      console.log("1. 测试 Supabase 连接到 swordsdata 表...")
      const { data: connectionTest, error: connectionError } = await supabase.from("swordsdata").select("*").limit(1)

      setResults((prev) => [
        ...prev,
        {
          test: "swordsdata 表连接测试",
          success: !connectionError,
          data: connectionTest,
          error: connectionError?.message,
        },
      ])

      if (connectionTest && connectionTest.length > 0) {
        // 2. 分析字段结构
        const firstRecord = connectionTest[0]
        const fieldNames = Object.keys(firstRecord)

        setResults((prev) => [
          ...prev,
          {
            test: "字段名分析",
            success: true,
            data: {
              fieldNames,
              sampleRecord: firstRecord,
              hasUppercaseID: fieldNames.includes("ID"),
              hasLowercaseId: fieldNames.includes("id"),
            },
          },
        ])

        // 3. 尝试获取所有数据
        console.log("3. 获取 swordsdata 表所有数据...")
        const { data: allData, error: dataError } = await supabase.from("swordsdata").select("*")

        setResults((prev) => [
          ...prev,
          {
            test: "获取 swordsdata 所有数据",
            success: !dataError,
            data: allData,
            error: dataError?.message,
            count: allData?.length || 0,
          },
        ])

        // 4. 测试不同的ID字段排序
        if (fieldNames.includes("ID")) {
          console.log("4a. 测试使用 ID 字段排序...")
          const { data: sortedByID, error: sortErrorID } = await supabase
            .from("swordsdata")
            .select("*")
            .order("ID", { ascending: false })
            .limit(3)

          setResults((prev) => [
            ...prev,
            {
              test: "使用 ID 字段排序",
              success: !sortErrorID,
              data: sortedByID,
              error: sortErrorID?.message,
            },
          ])
        }

        if (fieldNames.includes("id")) {
          console.log("4b. 测试使用 id 字段排序...")
          const { data: sortedById, error: sortErrorId } = await supabase
            .from("swordsdata")
            .select("*")
            .order("id", { ascending: false })
            .limit(3)

          setResults((prev) => [
            ...prev,
            {
              test: "使用 id 字段排序",
              success: !sortErrorId,
              data: sortedById,
              error: sortErrorId?.message,
            },
          ])
        }

        // 5. 测试各个预期字段
        const expectedFields = ["content", "author", "origin", "user"]
        for (const field of expectedFields) {
          if (fieldNames.includes(field)) {
            const { data: fieldData, error: fieldError } = await supabase.from("swordsdata").select(field).limit(1)

            setResults((prev) => [
              ...prev,
              {
                test: `字段 '${field}' 测试`,
                success: !fieldError,
                data: fieldData,
                error: fieldError?.message,
              },
            ])
          } else {
            setResults((prev) => [
              ...prev,
              {
                test: `字段 '${field}' 测试`,
                success: false,
                error: `字段 '${field}' 不存在于表中`,
              },
            ])
          }
        }
      }
    } catch (error) {
      console.error("调试过程中出错:", error)
      setResults((prev) => [
        ...prev,
        {
          test: "异常捕获",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const createTestData = async () => {
    setLoading(true)
    try {
      console.log("创建测试数据到 swordsdata 表...")
      const { data, error } = await supabase
        .from("swordsdata")
        .insert([
          {
            content: "这是一条测试格言，用于验证数据库连接",
            author: "测试作者",
            origin: "调试工具",
            user: "调试用户",
          },
        ])
        .select()

      setResults((prev) => [
        ...prev,
        {
          test: "创建测试数据到 swordsdata",
          success: !error,
          data: data,
          error: error?.message,
        },
      ])
    } catch (error) {
      console.error("创建测试数据时出错:", error)
      setResults((prev) => [
        ...prev,
        {
          test: "创建测试数据异常",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>SwordsData 表调试工具</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testConnection} disabled={loading}>
                {loading ? "测试中..." : "完整连接测试"}
              </Button>
              <Button onClick={createTestData} disabled={loading} variant="secondary">
                创建一条测试数据
              </Button>
              <Button onClick={() => setResults([])} variant="ghost">
                清空结果
              </Button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-4 rounded">
              <p>
                <strong>数据库 URL:</strong> https://alzdsgrnwvrqecbeoply.supabase.co
              </p>
              <p>
                <strong>表名:</strong> swordsdata
              </p>
              <p>
                <strong>预期字段:</strong> ID/id, content, author, origin, user
              </p>
              <p className="mt-2 text-blue-600 dark:text-blue-400">
                <strong>注意:</strong> 此工具将自动检测字段名的大小写
              </p>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className={result.success ? "border-green-200" : "border-red-200"}>
                <CardHeader>
                  <CardTitle className={`text-lg ${result.success ? "text-green-700" : "text-red-700"}`}>
                    {result.test} {result.success ? "✅" : "❌"}
                    {result.count !== undefined && ` (${result.count} 条记录)`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.error && (
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded mb-4">
                      <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                        <strong>错误:</strong> {result.error}
                      </p>
                    </div>
                  )}

                  {result.data && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>数据:</strong>
                      </p>
                      <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(result.data, null, 2)}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
