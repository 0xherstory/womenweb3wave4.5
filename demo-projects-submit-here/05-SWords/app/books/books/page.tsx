"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, Construction } from "lucide-react"

export default function BooksDetailPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push("/books")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-green-200 dark:border-green-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回书籍世界
            </Button>
            <h1 className="text-2xl font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              书籍
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-green-900 dark:text-green-100">
                <Construction className="w-8 h-8 text-green-600" />
                页面建设中
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">书籍详情页面即将上线</h2>
                  <p className="text-green-700 dark:text-green-300 leading-relaxed">
                    我们正在整理和编写详细的书籍介绍，包括内容简介、作者背景、读者评价等。
                    每本书都将有完整的信息和深度的解读。
                  </p>
                </div>

                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">即将收录的书籍类型：</h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• 哲学与思辨类著作</li>
                    <li>• 女性主义理论经典</li>
                    <li>• 文学作品与评论</li>
                    <li>• 社会学研究专著</li>
                  </ul>
                </div>

                <Button onClick={handleGoBack} className="bg-green-600 hover:bg-green-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  返回书籍世界
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
