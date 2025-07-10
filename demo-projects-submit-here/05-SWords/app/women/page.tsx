"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Calendar, MapPin, BookOpen, Palette, Users2, Filter } from "lucide-react"
import { useState } from "react"

interface Woman {
  id: number
  name: string
  nameEn: string
  birth: string
  death?: string
  nationality: string
  field: string
  image: string
  description: string
  achievements: string[]
  famousQuote: string
  category: string
  featured: boolean
}

const women: Woman[] = [
  {
    id: 1,
    name: "奥德丽·洛德",
    nameEn: "Audre Lorde",
    birth: "1934",
    death: "1992",
    nationality: "美国",
    field: "诗人、作家、活动家",
    image: "/placeholder.svg?height=300&width=240",
    description:
      "奥德丽·洛德是一位杰出的非裔美国诗人、作家和民权活动家。她的作品探讨了种族、性别、阶级和性取向的交叉性，为女性主义理论做出了重要贡献。",
    achievements: [
      "发表多部诗集和散文集",
      "提出'主人的工具永远不会拆毁主人的房子'等重要理论",
      "推动交叉性女性主义发展",
      "获得多项文学奖项",
    ],
    famousQuote: "主人的工具永远不会拆毁主人的房子。",
    category: "文学",
    featured: true,
  },
  {
    id: 2,
    name: "西蒙娜·德·波伏瓦",
    nameEn: "Simone de Beauvoir",
    birth: "1908",
    death: "1986",
    nationality: "法国",
    field: "哲学家、作家、女性主义者",
    image: "/placeholder.svg?height=300&width=240",
    description:
      "西蒙娜·德·波伏瓦是20世纪最重要的女性主义理论家之一。她的著作《第二性》被认为是女性主义的奠基之作，深刻分析了女性在社会中的地位。",
    achievements: ["著有《第二性》等重要著作", "存在主义哲学的重要代表", "现代女性主义运动的先驱", "获得龚古尔文学奖"],
    famousQuote: "女人不是天生的，而是后天造就的。",
    category: "哲学",
    featured: true,
  },
  {
    id: 3,
    name: "弗里达·卡罗",
    nameEn: "Frida Kahlo",
    birth: "1907",
    death: "1954",
    nationality: "墨西哥",
    field: "画家",
    image: "/placeholder.svg?height=300&width=240",
    description:
      "弗里达·卡罗是墨西哥最著名的女画家之一，以其强烈的自画像和充满象征意义的作品而闻名。她的艺术深刻反映了身体痛苦、政治信念和墨西哥文化。",
    achievements: [
      "创作了150多幅画作，其中55幅是自画像",
      "成为女性主义艺术的象征",
      "作品在全世界博物馆展出",
      "影响了无数后来的艺术家",
    ],
    famousQuote: "我画我自己的现实。",
    category: "艺术",
    featured: true,
  },
  {
    id: 4,
    name: "玛丽·居里",
    nameEn: "Marie Curie",
    birth: "1867",
    death: "1934",
    nationality: "波兰-法国",
    field: "物理学家、化学家",
    image: "/placeholder.svg?height=300&width=240",
    description:
      "玛丽·居里是历史上第一位获得诺贝尔奖的女性，也是唯一一位在两个不同科学领域获得诺贝尔奖的人。她在放射性研究方面的贡献改变了科学界。",
    achievements: [
      "两次获得诺贝尔奖（物理学和化学）",
      "发现了钋和镭两种元素",
      "创立了放射性理论",
      "第一位在巴黎大学任教的女教授",
    ],
    famousQuote: "生活中没有什么可怕的东西，只有需要理解的东西。",
    category: "科学",
    featured: false,
  },
  {
    id: 5,
    name: "弗吉尼亚·伍尔夫",
    nameEn: "Virginia Woolf",
    birth: "1882",
    death: "1941",
    nationality: "英国",
    field: "作家、评论家",
    image: "/placeholder.svg?height=300&width=240",
    description:
      "弗吉尼亚·伍尔夫是20世纪最重要的现代主义作家之一。她的意识流写作技巧和对女性心理的深刻洞察，为文学界带来了革命性的变化。",
    achievements: [
      "著有《达洛维夫人》《到灯塔去》等经典作品",
      "现代主义文学的重要代表",
      "布卢姆斯伯里文学圈的核心成员",
      "对女性主义文学理论有重要贡献",
    ],
    famousQuote: "女人要想写小说，必须有钱，还要有一间自己的房间。",
    category: "文学",
    featured: false,
  },
  {
    id: 6,
    name: "罗莎·帕克斯",
    nameEn: "Rosa Parks",
    birth: "1913",
    death: "2005",
    nationality: "美国",
    field: "民权活动家",
    image: "/placeholder.svg?height=300&width=240",
    description:
      "罗莎·帕克斯因拒绝在公交车上让座给白人而被逮捕，这一事件引发了蒙哥马利公交车抵制运动，成为美国民权运动的重要转折点。",
    achievements: ["引发蒙哥马利公交车抵制运动", "被称为'民权运动之母'", "获得总统自由勋章", "推动了美国种族平等进程"],
    famousQuote: "我没有让座，不是因为我累了，而是因为我厌倦了屈服。",
    category: "社会运动",
    featured: false,
  },
]

const categories = ["全部", "文学", "哲学", "艺术", "科学", "社会运动"]

export default function WomenPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const filteredWomen = women.filter((woman) => {
    const matchesCategory = selectedCategory === "全部" || woman.category === selectedCategory
    const matchesFeatured = !showFeaturedOnly || woman.featured
    return matchesCategory && matchesFeatured
  })

  const handleGoBack = () => {
    router.push("/")
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
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-rose-900 dark:text-rose-100 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-600" />
              背后的女性
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-700 dark:to-pink-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4">致敬伟大的女性先驱</h2>
            <p className="text-xl text-rose-100 mb-6">她们的智慧、勇气和贡献改变了世界，激励着无数后来者</p>
            <div className="flex items-center justify-center gap-6 text-rose-100">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5" />
                <span>{women.length} 位杰出女性</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>跨越多个领域</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-neutral-900/50 border-b border-rose-200 dark:border-rose-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">分类:</span>
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    className={
                      selectedCategory === category
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-900/20"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              variant={showFeaturedOnly ? "default" : "ghost"}
              size="sm"
              className={
                showFeaturedOnly
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
              }
            >
              <Heart className="w-4 h-4 mr-1" />
              精选推荐
            </Button>
          </div>
        </div>
      </div>

      {/* Women Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredWomen.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 text-rose-400" />
            <p className="text-rose-600 dark:text-rose-400 text-lg mb-2">没有找到匹配的女性</p>
            <p className="text-rose-500 dark:text-rose-500 text-sm">尝试调整筛选条件</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredWomen.map((woman, index) => (
              <motion.div
                key={woman.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-rose-200/50 dark:border-rose-700/50 hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-neutral-900/90 group overflow-hidden">
                  {woman.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-rose-500 text-white">
                        <Heart className="w-3 h-3 mr-1" />
                        精选
                      </Badge>
                    </div>
                  )}

                  <div className="relative">
                    <img
                      src={woman.image || "/placeholder.svg"}
                      alt={woman.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                        >
                          {woman.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-rose-600 dark:text-rose-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {woman.birth}-{woman.death || "现在"}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100 mb-1">{woman.name}</h3>
                      <p className="text-rose-700 dark:text-rose-300 text-sm mb-1">{woman.nameEn}</p>
                      <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 mb-3">
                        <MapPin className="w-3 h-3" />
                        <span>{woman.nationality}</span>
                        <span>•</span>
                        <span>{woman.field}</span>
                      </div>

                      <p className="text-sm text-rose-700 dark:text-rose-300 mb-4 line-clamp-3">{woman.description}</p>

                      <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg mb-4">
                        <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-200 mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          名言
                        </h4>
                        <p className="text-xs text-rose-700 dark:text-rose-300 italic">"{woman.famousQuote}"</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          主要成就
                        </h4>
                        <ul className="text-xs text-rose-700 dark:text-rose-300 space-y-1">
                          {woman.achievements.slice(0, 3).map((achievement, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-rose-500 mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                          {woman.achievements.length > 3 && (
                            <li className="text-rose-500 text-xs">还有 {woman.achievements.length - 3} 项成就...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
