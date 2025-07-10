"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Globe, Users2, BookOpen, Heart, Star, Calendar, Filter } from "lucide-react"
import { useState } from "react"

interface Resource {
  id: number
  title: string
  description: string
  url: string
  category: string
  source: string
  publishDate: string
  tags: string[]
  featured: boolean
  type: "article" | "ngo" | "website" | "report"
}

interface NGOPartner {
  id: number
  name: string
  description: string
  website: string
  logo: string
  focus: string[]
  status: "active" | "upcoming" | "planned"
}

const resources: Resource[] = [
  {
    id: 1,
    title: "女性主义理论的发展历程",
    description: "深入探讨从第一波女性主义到当代交叉性理论的发展脉络，分析不同时期女性主义思想的特点和贡献。",
    url: "https://example.com/feminism-theory-development",
    category: "理论研究",
    source: "学术期刊",
    publishDate: "2024-01-15",
    tags: ["女性主义", "理论", "历史", "社会学"],
    featured: true,
    type: "article",
  },
  {
    id: 2,
    title: "当代女性文学的多元声音",
    description: "分析当代女性作家如何通过文学作品表达女性经验，探讨文学中的性别议题和身份认同。",
    url: "https://example.com/contemporary-women-literature",
    category: "文学评论",
    source: "文学杂志",
    publishDate: "2024-01-10",
    tags: ["女性文学", "当代文学", "身份认同", "文学批评"],
    featured: true,
    type: "article",
  },
  {
    id: 3,
    title: "科技领域的性别平等报告",
    description: "最新的科技行业性别平等状况调研报告，包含数据分析和改进建议。",
    url: "https://example.com/tech-gender-equality-report",
    category: "研究报告",
    source: "研究机构",
    publishDate: "2023-12-20",
    tags: ["性别平等", "科技", "职场", "数据分析"],
    featured: false,
    type: "report",
  },
  {
    id: 4,
    title: "全球女性权益保护现状",
    description: "联合国妇女署发布的全球女性权益保护现状报告，涵盖教育、健康、经济参与等多个维度。",
    url: "https://example.com/global-women-rights-status",
    category: "国际报告",
    source: "联合国妇女署",
    publishDate: "2023-11-30",
    tags: ["女性权益", "全球", "联合国", "政策"],
    featured: true,
    type: "report",
  },
  {
    id: 5,
    title: "艺术中的女性视角",
    description: "探讨女性艺术家如何通过艺术作品表达独特的女性视角和社会观察。",
    url: "https://example.com/women-perspective-in-art",
    category: "艺术评论",
    source: "艺术杂志",
    publishDate: "2023-10-15",
    tags: ["女性艺术家", "艺术", "视角", "创作"],
    featured: false,
    type: "article",
  },
]

const ngoPartners: NGOPartner[] = [
  {
    id: 1,
    name: "妇女发展基金会",
    description: "致力于推动女性教育和职业发展，提供奖学金和职业培训项目。",
    website: "https://example.com/women-development-foundation",
    logo: "/placeholder.svg?height=80&width=80",
    focus: ["教育", "职业发展", "奖学金"],
    status: "active",
  },
  {
    id: 2,
    name: "性别平等研究中心",
    description: "专注于性别平等政策研究和倡导，推动相关法律法规的完善。",
    website: "https://example.com/gender-equality-research",
    logo: "/placeholder.svg?height=80&width=80",
    focus: ["政策研究", "法律倡导", "学术研究"],
    status: "upcoming",
  },
  {
    id: 3,
    name: "女性创业支持网络",
    description: "为女性创业者提供资金、导师和网络支持，促进女性在商业领域的发展。",
    website: "https://example.com/women-entrepreneur-network",
    logo: "/placeholder.svg?height=80&width=80",
    focus: ["创业支持", "商业发展", "网络建设"],
    status: "planned",
  },
]

const categories = ["全部", "理论研究", "文学评论", "研究报告", "国际报告", "艺术评论"]
const resourceTypes = ["全部", "article", "report", "website", "ngo"]

export default function ResourcesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [selectedType, setSelectedType] = useState("全部")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === "全部" || resource.category === selectedCategory
    const matchesType = selectedType === "全部" || resource.type === selectedType
    const matchesFeatured = !showFeaturedOnly || resource.featured
    return matchesCategory && matchesType && matchesFeatured
  })

  const handleGoBack = () => {
    router.push("/")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen className="w-4 h-4" />
      case "report":
        return <Globe className="w-4 h-4" />
      case "website":
        return <ExternalLink className="w-4 h-4" />
      case "ngo":
        return <Users2 className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "article":
        return "文章"
      case "report":
        return "报告"
      case "website":
        return "网站"
      case "ngo":
        return "组织"
      default:
        return "其他"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">合作中</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500 text-white">即将合作</Badge>
      case "planned":
        return <Badge className="bg-gray-500 text-white">计划中</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-orange-200 dark:border-orange-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleGoBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">
              <Globe className="w-6 h-6 text-orange-600" />
              资源推介
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-700 dark:to-amber-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4">优质资源推介</h2>
            <p className="text-xl text-orange-100 mb-6">精选网络优质文章与合作伙伴，为您提供丰富的学习资源</p>
            <div className="flex items-center justify-center gap-6 text-orange-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{resources.length} 篇精选文章</span>
              </div>
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5" />
                <span>{ngoPartners.length} 个合作伙伴</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/50 dark:bg-neutral-900/50 border-b border-orange-200 dark:border-orange-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">分类:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    className={
                      selectedCategory === category
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                variant={showFeaturedOnly ? "default" : "ghost"}
                size="sm"
                className={
                  showFeaturedOnly
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                }
              >
                <Star className="w-4 h-4 mr-1" />
                精选推荐
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            精选文章资源
          </h3>

          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-orange-400" />
              <p className="text-orange-600 dark:text-orange-400 text-lg mb-2">没有找到匹配的资源</p>
              <p className="text-orange-500 dark:text-orange-500 text-sm">尝试调整筛选条件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-neutral-900/90 group">
                    {resource.featured && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-red-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          精选
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                            {resource.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            {getTypeIcon(resource.type)}
                            <span className="text-xs">{getTypeLabel(resource.type)}</span>
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-2 line-clamp-2">
                          {resource.title}
                        </h4>

                        <p className="text-sm text-orange-700 dark:text-orange-300 mb-4 line-clamp-3">
                          {resource.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                            <Calendar className="w-3 h-3" />
                            <span>{resource.publishDate}</span>
                            <span>•</span>
                            <span>{resource.source}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {resource.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs border-orange-300 text-orange-600 dark:border-orange-600 dark:text-orange-400"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {resource.tags.length > 3 && (
                              <Badge
                                variant="outline"
                                className="text-xs border-orange-300 text-orange-600 dark:border-orange-600 dark:text-orange-400"
                              >
                                +{resource.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => typeof window !== "undefined" && window.open(resource.url, "_blank")}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        阅读文章
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* NGO Partners Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-6 flex items-center gap-2">
                            <Users2 className="w-6 h-6" />
            合作伙伴
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngoPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 hover:shadow-xl transition-all duration-300 hover:bg-white/90 dark:hover:bg-neutral-900/90">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        className="w-16 h-16 rounded-lg object-cover bg-orange-100 dark:bg-orange-900"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100">{partner.name}</h4>
                          {getStatusBadge(partner.status)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-4 flex-1">{partner.description}</p>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {partner.focus.map((focus) => (
                          <Badge
                            key={focus}
                            variant="outline"
                            className="text-xs border-orange-300 text-orange-600 dark:border-orange-600 dark:text-orange-400"
                          >
                            {focus}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        onClick={() => typeof window !== "undefined" && window.open(partner.website, "_blank")}
                        variant="outline"
                        className="w-full bg-transparent border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                        disabled={partner.status === "planned"}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {partner.status === "planned" ? "敬请期待" : "访问网站"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-800/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-4">推荐优质资源</h3>
              <p className="text-orange-700 dark:text-orange-300 mb-6 max-w-2xl mx-auto">
                如果您发现了优质的文章、报告或希望与我们合作，欢迎联系我们。我们致力于为用户提供最有价值的资源。
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  推荐资源
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                >
                  <Users2 className="w-4 h-4 mr-2" />
                  合作咨询
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
