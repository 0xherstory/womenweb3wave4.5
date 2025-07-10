"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Construction, Crown } from "lucide-react"

export default function BooksWomenPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push("/books")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-rose-200 dark:border-rose-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回书籍世界
            </Button>
            <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-100 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600" />
              杰出的女性
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
          <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-rose-200/50 dark:border-rose-700/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-rose-900 dark:text-rose-100">
                <Construction className="w-8 h-8 text-rose-600" />
                页面建设中
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="w-12 h-12 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-100 mb-4">杰出女性介绍页面即将上线</h2>
                  <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                    我们将为您详细介绍那些在文学、学术、社会运动等领域做出卓越贡献的女性，
                    展现她们的思想、成就和对世界的影响。
                  </p>
                </div>

                <div className="bg-rose-100 dark:bg-rose-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-rose-800 dark:text-rose-200 mb-2">即将介绍的杰出女性：</h3>
                  <ul className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                    <li>• 文学领域的女性作家</li>
                    <li>• 哲学思想家与理论家</li>
                    <li>• 社会运动的领导者</li>
                    <li>• 科学研究的先驱者</li>
                  </ul>
                </div>

                <Button onClick={handleGoBack} className="bg-rose-600 hover:bg-rose-700 text-white">
                  <Heart className="w-4 h-4 mr-2" />
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
