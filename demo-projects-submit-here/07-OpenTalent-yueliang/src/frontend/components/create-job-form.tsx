"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { BaseJob} from "@/lib/types" 
import { postJob } from "@/lib/contract"

interface CreateJobFormProps {
  userAddress: string
  onJobCreated: (job: BaseJob) => void
  onCancel: () => void
}

export default function CreateJobForm({ userAddress, onJobCreated, onCancel }: CreateJobFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salaryRange: "",
    requirements: "",
    description: "",
    jobType: "全职",
    experienceLevel: "不限",
    benefits: "",
    tags: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "职位名称不能为空"
    }
    if (!formData.location.trim()) {
      newErrors.location = "工作地点不能为空"
    }
    if (!formData.salaryRange.trim()) {
      newErrors.salaryRange = "薪酬范围不能为空"
    }
    if (!formData.requirements.trim()) {
      newErrors.requirements = "招聘要求不能为空"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("表单提交开始", formData)

    if (!validateForm()) {
      console.log("表单验证失败", errors)
      return
    }

    setIsSubmitting(true)
    setSuccessMessage("")

    try {
      // 获取用户数据
      const userData = JSON.parse(localStorage.getItem("web3_job_user") || "{}")
      console.log("用户数据:", userData)

      // 调用链上发布职位
      const result = await postJob(formData.title.trim(), formData.description.trim())
      if (!result.success) {
        setErrors({ submit: "链上发布职位失败，请重试" })
        setIsSubmitting(false)
        return
      }

      // 创建职位对象（可用event.args.jobId等补充）
      const job: BaseJob = {
        id: result.event?.args?.jobId ? result.event.args.jobId.toString() : `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        // id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        location: formData.location.trim(),
        salaryRange: formData.salaryRange.trim(),
        requirements: formData.requirements.trim(),
        description: formData.description.trim(),
        company: userData.company || "未知公司",
        postedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recruiterAddress: userData.address || "",
        applications: [],
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        benefits: formData.benefits.trim(),
        tags: formData.tags.trim(),
        status: "active",
        viewCount: 0,
        applicationCount: 0,
      }

      console.log("创建的职位对象:", job)

      // 获取现有职位
      const savedJobs = localStorage.getItem("web3_jobs")
      const allJobs = savedJobs ? JSON.parse(savedJobs) : []
      console.log("现有职位数量:", allJobs.length)

      // 添加新职位
      allJobs.push(job)

      // 保存到localStorage
      localStorage.setItem("web3_jobs", JSON.stringify(allJobs))
      console.log("职位已保存到localStorage")

      // 显示成功消息
      setSuccessMessage("职位发布成功！")

      // 通知父组件
      onJobCreated(job)

      // 重置表单
      setFormData({
        title: "",
        location: "",
        salaryRange: "",
        requirements: "",
        description: "",
        jobType: "全职",
        experienceLevel: "不限",
        benefits: "",
        tags: "",
      })

      console.log("职位创建完成")
    } catch (error) {
      console.error("发布职位失败:", error)
      setErrors({ submit: "发布职位失败，请重试" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>发布新职位</CardTitle>
        <CardDescription>填写职位信息以吸引合适的候选人</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {errors.submit && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">职位名称 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
                placeholder="如：前端开发工程师"
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="location">工作地点 *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={errors.location ? "border-red-500" : ""}
                placeholder="如：北京、上海、远程"
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="salaryRange">薪酬范围 *</Label>
            <Input
              id="salaryRange"
              value={formData.salaryRange}
              onChange={(e) => handleInputChange("salaryRange", e.target.value)}
              className={errors.salaryRange ? "border-red-500" : ""}
              placeholder="如：15K-25K、面议"
            />
            {errors.salaryRange && <p className="text-sm text-red-500 mt-1">{errors.salaryRange}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobType">工作类型 *</Label>
              <select
                id="jobType"
                value={formData.jobType}
                onChange={(e) => handleInputChange("jobType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="全职">全职</option>
                <option value="兼职">兼职</option>
                <option value="实习">实习</option>
                <option value="远程">远程</option>
                <option value="合同工">合同工</option>
              </select>
            </div>
            <div>
              <Label htmlFor="experienceLevel">经验要求 *</Label>
              <select
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={(e) => handleInputChange("experienceLevel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="不限">不限</option>
                <option value="应届生">应届生</option>
                <option value="1-3年">1-3年</option>
                <option value="3-5年">3-5年</option>
                <option value="5-10年">5-10年</option>
                <option value="10年以上">10年以上</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="benefits">福利待遇</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange("benefits", e.target.value)}
              placeholder="如：五险一金、年终奖、带薪年假、弹性工作、股票期权等"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">职位标签</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              placeholder="如：React, Node.js, 高薪, 成长空间（用逗号分隔）"
            />
          </div>

          <div>
            <Label htmlFor="requirements">招聘要求 *</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              className={errors.requirements ? "border-red-500" : ""}
              placeholder="请详细描述职位要求，包括技能、经验、学历等..."
              rows={4}
            />
            {errors.requirements && <p className="text-sm text-red-500 mt-1">{errors.requirements}</p>}
          </div>

          <div>
            <Label htmlFor="description">职位描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="请描述工作内容、职责、团队情况等..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "发布中..." : "发布职位"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
