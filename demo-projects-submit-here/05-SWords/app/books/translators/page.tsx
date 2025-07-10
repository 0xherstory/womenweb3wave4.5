"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users2, Construction, Languages } from "lucide-react"

export default function TranslatorsPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push("/books")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-purple-200 dark:border-purple-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回书籍世界
            </Button>
            <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                              <Users2 className="w-6 h-6 text-purple-600" />
              译者
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
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-purple-900 dark:text-purple-100">
                <Construction className="w-8 h-8 text-purple-600" />
                页面建设中
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto">
                  <Languages className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">译者介绍页面即将上线</h2>
                  <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
                    我们将为您介绍那些在文化交流中发挥重要作用的译者们，
                    包括他们的翻译作品、翻译理念和对文学传播的贡献。
                  </p>
                </div>

                <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">即将介绍的译者类型：</h3>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• 经典文学作品译者</li>
                    <li>• 哲学著作翻译专家</li>
                    <li>• 女性主义理论译者</li>
                    <li>• 当代文学翻译家</li>
                  </ul>
                </div>

                <Button onClick={handleGoBack} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Users2 className="w-4 h-4 mr-2" />
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
