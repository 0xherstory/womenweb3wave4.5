"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, DollarSign, Calendar, Building, User, Send, Clock, Award, Gift, Tag } from "lucide-react"
import { BaseJob } from "@/lib/types"
// interface Job {
//   id: string
//   title: string
//   company: string
//   location: string
//   salaryRange: string
//   requirements: string
//   description: string
//   postedAt: string
//   recruiterAddress: string
//   jobType?: string
//   experienceLevel?: string
//   benefits?: string
//   tags?: string
//   status?: string
//   viewCount?: number
//   applicationCount?: number
// }

interface JobDetailDialogProps {
  job: BaseJob | null
  isOpen: boolean
  onClose: () => void
  userRole: "recruiter" | "jobseeker"
  userAddress: string
  hasApplied?: boolean
  onApply?: (jobId: string, coverLetter: string) => void
}

export default function EnhancedJobDetailDialog({
  job,
  isOpen,
  onClose,
  userRole,
  userAddress,
  hasApplied = false,
  onApply,
}: JobDetailDialogProps) {
  const [coverLetter, setCoverLetter] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)

  if (!job) return null

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onApply || !coverLetter.trim()) return

    setIsApplying(true)
    try {
      await onApply(job.id, coverLetter)
      setCoverLetter("")
      setShowApplyForm(false)
      onClose()
    } catch (error) {
      console.error("申请失败:", error)
    } finally {
      setIsApplying(false)
    }
  }

  const isOwnJob = userRole === "recruiter" && job.recruiterAddress === userAddress

  // 解析标签
  const tags = job.tags
    ? job.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">{job.title}</DialogTitle>
              <DialogDescription className="text-xl font-semibold text-blue-600 mb-4">{job.company}</DialogDescription>

              {/* 状态和统计信息 */}
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant={job.status === "active" ? "default" : "secondary"}>
                  {job.status === "active" ? "招聘中" : "已关闭"}
                </Badge>
                {job.viewCount !== undefined && <span className="text-sm text-gray-500">浏览 {job.viewCount} 次</span>}
                {job.applicationCount !== undefined && (
                  <span className="text-sm text-gray-500">申请 {job.applicationCount} 人</span>
                )}
              </div>
            </div>

            {userRole === "jobseeker" && !isOwnJob && job.status === "active" && (
              <div className="ml-4">
                {hasApplied ? (
                  <Badge variant="secondary" className="text-sm px-4 py-2">
                    已申请
                  </Badge>
                ) : (
                  <Button onClick={() => setShowApplyForm(true)} size="lg" className="px-6">
                    <Send className="h-4 w-4 mr-2" />
                    立即申请
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">职位信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">工作地点</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">薪资范围</p>
                    <p className="font-medium">{job.salaryRange}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">工作类型</p>
                    <p className="font-medium">{job.jobType || "全职"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">经验要求</p>
                    <p className="font-medium">{job.experienceLevel || "不限"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">发布时间</p>
                    <p className="font-medium">
                      {new Date(job.postedAt).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 职位标签 */}
          {tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  职位标签
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 职位描述 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">职位描述</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description || "暂无详细描述"}</p>
              </div>
            </CardContent>
          </Card>

          {/* 招聘要求 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">招聘要求</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
              </div>
            </CardContent>
          </Card>

          {/* 福利待遇 */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  福利待遇
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.benefits}</p>
              </CardContent>
            </Card>
          )}

          {/* 招聘方信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Building className="h-5 w-5 mr-2" />
                招聘方信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">钱包地址:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {job.recruiterAddress.slice(0, 10)}...{job.recruiterAddress.slice(-8)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">职位ID:</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{job.id.slice(-8)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 申请表单 */}
          {showApplyForm && userRole === "jobseeker" && !hasApplied && job.status === "active" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">申请这个职位</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <Label htmlFor="coverLetter" className="text-blue-800">
                      求职信 *
                    </Label>
                    <Textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="请简要介绍您的背景和为什么适合这个职位..."
                      required
                      rows={6}
                      className="mt-2 bg-white"
                    />
                    <p className="text-xs text-gray-600 mt-1">建议包含：相关经验、技能匹配度、对职位的理解等</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowApplyForm(false)}>
                      取消
                    </Button>
                    <Button type="submit" disabled={isApplying || !coverLetter.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      {isApplying ? "提交中..." : "提交申请"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
