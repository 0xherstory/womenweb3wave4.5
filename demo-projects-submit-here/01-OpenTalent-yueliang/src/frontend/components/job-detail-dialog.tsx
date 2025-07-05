"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { MapPin, DollarSign, Calendar, Building, User, Send } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string
  salaryRange: string
  requirements: string
  description: string
  postedAt: string
  recruiterAddress: string
  jobType?: string
  experienceLevel?: string
  benefits?: string
}

interface JobDetailDialogProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  userRole: "recruiter" | "jobseeker"
  userAddress: string
  hasApplied?: boolean
  onApply?: (jobId: string, coverLetter: string) => void
}

export default function JobDetailDialog({
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">{job.title}</DialogTitle>
              <DialogDescription className="text-lg font-medium text-gray-700 mb-4">{job.company}</DialogDescription>
            </div>
            {userRole === "jobseeker" && !isOwnJob && (
              <div className="ml-4">
                {hasApplied ? (
                  <Badge variant="secondary" className="text-sm">
                    已申请
                  </Badge>
                ) : (
                  <Button onClick={() => setShowApplyForm(true)} className="ml-2">
                    <Send className="h-4 w-4 mr-2" />
                    申请职位
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">{job.salaryRange}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">发布于 {new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span className="text-sm">职位ID: {job.id.slice(-6)}</span>
            </div>
          </div>

          <Separator />

          {/* 职位描述 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">职位描述</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description || "暂无详细描述"}</p>
            </div>
          </div>

          {/* 招聘要求 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">招聘要求</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
            </div>
          </div>

          {/* 额外信息 */}
          {(job.jobType || job.experienceLevel || job.benefits) && (
            <>
              <Separator />
              <div className="grid md:grid-cols-3 gap-4">
                {job.jobType && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">工作类型</h4>
                    <Badge variant="outline">{job.jobType}</Badge>
                  </div>
                )}
                {job.experienceLevel && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">经验要求</h4>
                    <Badge variant="outline">{job.experienceLevel}</Badge>
                  </div>
                )}
                {job.benefits && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">福利待遇</h4>
                    <p className="text-sm text-gray-600">{job.benefits}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 招聘方信息 */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">招聘方信息</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-4 w-4" />
              <span className="text-sm font-mono">
                {job.recruiterAddress.slice(0, 10)}...{job.recruiterAddress.slice(-8)}
              </span>
            </div>
          </div>

          {/* 申请表单 */}
          {showApplyForm && userRole === "jobseeker" && !hasApplied && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">申请这个职位</h3>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <Label htmlFor="coverLetter">求职信 *</Label>
                    <Textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="请简要介绍您的背景和为什么适合这个职位..."
                      required
                      rows={6}
                      className="mt-2"
                    />
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
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
