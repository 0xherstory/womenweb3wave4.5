"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save, Edit } from "lucide-react"
import { EditableJob, BaseJob } from "@/lib/types"
// import { Job } from "./create-job-form"
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
// }

interface EditJobDialogProps {
  job: EditableJob | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedJob: BaseJob) => void
}

export default function EditJobDialog({ job, isOpen, onClose, onUpdate }: EditJobDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    salaryRange: "",
    requirements: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        title: job.title,
        location: job.location,
        salaryRange: job.salaryRange,
        requirements: job.requirements,
        description: job.description,
      })
    }
  }, [job, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    setIsLoading(true)

    try {
      const updatedJob: EditableJob = {
        ...job,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      // 更新本地存储中的职位信息
      const savedJobs = localStorage.getItem("web3_jobs")
      if (savedJobs) {
        const allJobs = JSON.parse(savedJobs)
        const updatedJobs = allJobs.map((j: EditableJob) => (j.id === job.id ? updatedJob : j))
        localStorage.setItem("web3_jobs", JSON.stringify(updatedJobs))
      }

      onUpdate(updatedJob as BaseJob)
      onClose()
    } catch (error) {
      console.error("更新职位信息失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!job) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>编辑职位信息</span>
          </DialogTitle>
          <DialogDescription>修改职位详细信息</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">职位名称 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">工作地点 *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="salaryRange">薪酬范围 *</Label>
            <Input
              id="salaryRange"
              value={formData.salaryRange}
              onChange={(e) => handleInputChange("salaryRange", e.target.value)}
              placeholder="如：15K-25K"
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">招聘要求 *</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              placeholder="请描述职位要求..."
              required
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="description">职位描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="请描述工作内容和职责..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "保存中..." : "保存更改"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
