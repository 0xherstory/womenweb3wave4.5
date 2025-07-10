"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, List, Users2, Heart, ChevronRight } from "lucide-react"

interface Category {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  path: string
  count: number
}

const categories: Category[] = [
  {
    id: "booklists",
    title: "书单",
    description: "精心策划的主题书单，为您的阅读之旅提供指引",
    icon: <List className="w-8 h-8" />,
    color: "from-blue-500 to-indigo-500",
    path: "/books/booklists",
    count: 12,
  },
  {
    id: "books",
    title: "书籍",
    description: "涵盖哲学、文学、社会学等领域的优质书籍推荐",
    icon: <BookOpen className="w-8 h-8" />,
    color: "from-green-500 to-emerald-500",
    path: "/books/books",
    count: 156,
  },
  {
    id: "translators",
    title: "译者",
    description: "杰出译者介绍，了解那些为文化交流做出贡献的人",
    icon: <Users2 className="w-8 h-8" />,
    color: "from-purple-500 to-violet-500",
    path: "/books/translators",
    count: 28,
  },
  {
    id: "women",
    title: "杰出的女性",
    description: "致敬那些在文学、学术、社会运动中做出卓越贡献的女性",
    icon: <Heart className="w-8 h-8" />,
    color: "from-rose-500 to-pink-500",
    path: "/books/women",
    count: 45,
  },
]

export default function BooksPage() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push("/")
  }

  const handleCategoryClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              书籍世界
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-neutral-800 dark:to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-6">探索知识的海洋</h2>
            <p className="text-xl text-slate-200 mb-8">从精选书单到杰出译者，从经典著作到杰出女性，开启您的智慧之旅</p>
            <div className="flex items-center justify-center gap-8 text-slate-200">
              <div className="text-center">
                <div className="text-3xl font-bold">200+</div>
                <div className="text-sm">精选资源</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4</div>
                <div className="text-sm">主要分类</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-sm">无限可能</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">选择您感兴趣的领域</h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            每个分类都精心策划，为您提供高质量的内容和深度的思考
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4 + index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                transition: { duration: 0.2 },
              }}
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(category.path)}
            >
              <Card className="h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-slate-200/50 dark:border-neutral-700/50 hover:shadow-2xl transition-all duration-500 hover:bg-white/90 dark:hover:bg-neutral-900/90 overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Background Gradient */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${category.color} opacity-10 rounded-full transform translate-x-6 -translate-y-6 group-hover:scale-150 transition-transform duration-500`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {category.icon}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">{category.title}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{category.count}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{category.description}</p>

                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between group-hover:bg-slate-100 dark:group-hover:bg-neutral-800 transition-colors duration-300"
                    >
                      <span className="text-sm">探索</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>


      </div>
    </div>
  )
}
