"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, List, BookOpen, Construction } from "lucide-react"

export default function BooklistsPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push("/books")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-blue-200 dark:border-blue-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回书籍世界
            </Button>
            <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <List className="w-6 h-6 text-blue-600" />
              书单
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
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-blue-900 dark:text-blue-100">
                <Construction className="w-8 h-8 text-blue-600" />
                页面建设中
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
                  <List className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">书单页面即将上线</h2>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    我们正在精心策划各种主题的书单，包括女性主义经典、哲学入门、文学精选等。
                    敬请期待我们为您带来的精彩内容！
                  </p>
                </div>

                <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">即将推出的书单主题：</h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• 女性主义理论必读书单</li>
                    <li>• 哲学思辨入门指南</li>
                    <li>• 当代文学精选</li>
                    <li>• 社会学经典著作</li>
                  </ul>
                </div>

                <Button onClick={handleGoBack} className="bg-blue-600 hover:bg-blue-700 text-white">
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
