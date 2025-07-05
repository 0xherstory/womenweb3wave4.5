"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, MapPin, DollarSign, Calendar, Send, Briefcase, Settings, Eye } from "lucide-react"
import ProfileSettings from "@/components/profile-settings"
import EnhancedJobDetailDialog from "@/components/enhanced-job-detail-dialog"
import { BaseJob } from "@/lib/types"
import { ethers } from "ethers"
import { submitResume, loadJobsFromChain } from "@/lib/contract"

interface Application {
  id: string
  jobId: string
  applicantAddress: string
  applicantName: string
  applicantEmail: string
  coverLetter: string
  appliedAt: string
  status: "pending" | "reviewed" | "accepted" | "rejected"
}

interface JobSeekerDashboardProps {
  userAddress: string
}

export default function JobSeekerDashboard({ userAddress }: JobSeekerDashboardProps) {
  const [jobs, setJobs] = useState<BaseJob[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedJob, setSelectedJob] = useState<BaseJob | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<BaseJob | null>(null)
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false)

  useEffect(() => {
    loadJobs()
    loadMyApplications()
  }, [])

  const loadJobs = async () => {
    try {
      const jobsOnChain = await loadJobsFromChain()
      if (jobsOnChain && jobsOnChain.length > 0) {
        setJobs(jobsOnChain)
        return
      }
    } catch (err) {
      // 链上获取失败，回退到本地
    }
    // 本地回退
    const savedJobs = localStorage.getItem("web3_jobs")
    if (savedJobs) {
      const allJobs = JSON.parse(savedJobs)
      const activeJobs = allJobs.filter((job: BaseJob) => job.status === "active")
      setJobs(activeJobs)
    }
  }

  const loadMyApplications = () => {
    const savedApplications = localStorage.getItem("web3_applications")
    if (savedApplications) {
      const allApplications = JSON.parse(savedApplications)
      const myApps = allApplications.filter((app: Application) => app.applicantAddress === userAddress)
      setMyApplications(myApps)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.status === "active" &&
      (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const hasApplied = (jobId: string) => {
    return myApplications.some((app) => app.jobId === jobId)
  }

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    const userData = JSON.parse(localStorage.getItem("web3_job_user") || "{}")
    const application: Application = {
      id: Date.now().toString(),
      jobId: selectedJob.id,
      applicantAddress: userAddress,
      applicantName: userData.name || "未知用户",
      applicantEmail: userData.email || "",
      coverLetter,
      appliedAt: new Date().toISOString(),
      status: "pending",
    }

    const savedApplications = localStorage.getItem("web3_applications")
    const allApplications = savedApplications ? JSON.parse(savedApplications) : []
    allApplications.push(application)
    localStorage.setItem("web3_applications", JSON.stringify(allApplications))

    setMyApplications((prev) => [...prev, application])
    setCoverLetter("")
    setIsApplyDialogOpen(false)
    setSelectedJob(null)
  }

  const handleApplyFromDetail = async (jobId: string, coverLetter: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    try {
      const result = await submitResume(Number(jobId), coverLetter)
      if (result.success) {
        alert("简历已成功投递到链上！")
      } else {
        alert("链上投递简历失败，请重试")
      }
    } catch (error) {
      alert("链上投递简历失败，请重试")
    }
  }

  const openApplyDialog = (job: BaseJob) => {
    setSelectedJob(job)
    setIsApplyDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">求职中心</h2>
          <p className="text-gray-600">浏览职位机会，投递简历</p>
        </div>
        <Button variant="outline" onClick={() => setIsProfileSettingsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          个人设置
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">浏览职位 ({filteredJobs.length})</TabsTrigger>
          <TabsTrigger value="applications">我的申请 ({myApplications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索职位、公司或地点..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无职位</h3>
                <p className="text-gray-600">目前没有匹配的职位，请稍后再试</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="text-lg font-medium text-gray-900 mt-1">
                          {job.company}
                        </CardDescription>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salaryRange}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(job.postedAt).toLocaleDateString()}
                          </span>
                          {job.jobType && (
                            <Badge variant="outline" className="text-xs">
                              {job.jobType}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSelectedJobForDetail(job)
                            setIsJobDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </Button>
                        {hasApplied(job.id) ? (
                          <Badge variant="secondary">已申请</Badge>
                        ) : (
                          <Button onClick={() => openApplyDialog(job)}>
                            <Send className="h-4 w-4 mr-2" />
                            申请职位
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">职位描述</h4>
                        <p className="text-gray-600">{job.description}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">招聘要求</h4>
                        <p className="text-gray-600">{job.requirements}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有申请记录</h3>
                <p className="text-gray-600">浏览职位并投递简历后，申请记录会在这里显示</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myApplications.map((application) => {
                const job = jobs.find((j) => j.id === application.jobId)
                return (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{job?.title || "职位已删除"}</CardTitle>
                          <CardDescription>
                            {job?.company} • 申请时间: {new Date(application.appliedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            application.status === "accepted"
                              ? "default"
                              : application.status === "rejected"
                                ? "destructive"
                                : application.status === "reviewed"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {application.status === "pending" && "待处理"}
                          {application.status === "reviewed" && "已查看"}
                          {application.status === "accepted" && "已接受"}
                          {application.status === "rejected" && "已拒绝"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">求职信</h4>
                        <p className="text-gray-600">{application.coverLetter}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申请职位</DialogTitle>
            <DialogDescription>
              {selectedJob && `申请 ${selectedJob.company} 的 ${selectedJob.title} 职位`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <Label htmlFor="coverLetter">求职信 *</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="请提供您的简历"
                required
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                提交申请
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProfileSettings
        userAddress={userAddress}
        userRole="jobseeker"
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        onUpdate={() => {}}
      />

      <EnhancedJobDetailDialog
        job={selectedJobForDetail as BaseJob | null}
        isOpen={isJobDetailOpen}
        onClose={() => {
          setIsJobDetailOpen(false)
          setSelectedJobForDetail(null)
        }}
        userRole="jobseeker"
        userAddress={userAddress}
        hasApplied={selectedJobForDetail ? hasApplied(selectedJobForDetail.id) : false}
        onApply={handleApplyFromDetail}
      />
    </div>
  )
}
