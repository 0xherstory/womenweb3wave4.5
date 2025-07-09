"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MapPin, DollarSign, Calendar, User, Briefcase, Settings, Edit, Eye } from "lucide-react"
import ProfileSettings from "@/components/profile-settings"
import EditJobDialog from "@/components/edit-job-dialog"
import EnhancedJobDetailDialog from "@/components/enhanced-job-detail-dialog"
import CreateJobForm from "@/components/create-job-form"
import { BaseJob,EditableJob, Application } from "@/lib/types"
import {ethers} from "ethers"
import { postJob,getJobResumes,getResume } from "@/lib/contract"


interface RecruiterDashboardProps {
  userAddress: string
}


export default function RecruiterDashboard({ userAddress }: RecruiterDashboardProps) {
  const [jobs, setJobs] = useState<BaseJob[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    title: "",
    location: "",
    salaryRange: "",
    requirements: "",
    description: "",
    jobType: "全职",
    experienceLevel: "不限",
    benefits: "",
    updatedAt: "",
    tags: "",
  })

  // 在组件开头添加新的状态
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<EditableJob | null>(null)
  const [isEditJobOpen, setIsEditJobOpen] = useState(false)
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<BaseJob | null>(null)
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false)

  useEffect(() => {
    loadJobs()
    loadApplications()
  }, [])

  const loadJobs = () => {
    const savedJobs = localStorage.getItem("web3_jobs")
    if (savedJobs) {
      const allJobs = JSON.parse(savedJobs)
      const myJobs = allJobs.filter((job: BaseJob) => job.recruiterAddress === userAddress)
      setJobs(myJobs)
    }
  }

  const loadApplications = () => {
    const savedApplications = localStorage.getItem("web3_applications")
    if (savedApplications) {
      const allApplications = JSON.parse(savedApplications)
      setApplications(allApplications)
    }
  }

  const handleUnlistJob = (jobId: string) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: "inactive" } : job
    )
    
    // Update local state
    setJobs(updatedJobs)
    
    // Update localStorage
    const allJobs = JSON.parse(localStorage.getItem("web3_jobs") || "[]")
    const updatedAllJobs = allJobs.map((j: BaseJob) => 
      j.id === jobId ? { ...j, status: "inactive" } : j
    )
    localStorage.setItem("web3_jobs", JSON.stringify(updatedAllJobs))
    
    alert("职位已成功下架")
  }

  const handleCreateJob1 = (e: React.FormEvent) => {
    e.preventDefault()

    // 表单验证
    if (!newJob.title.trim()) {
      alert("请填写职位名称")
      return
    }
    if (!newJob.location.trim()) {
      alert("请填写工作地点")
      return
    }
    if (!newJob.salaryRange.trim()) {
      alert("请填写薪酬范围")
      return
    }
    if (!newJob.requirements.trim()) {
      alert("请填写招聘要求")
      return
    }

    try {
      const userData = JSON.parse(localStorage.getItem("web3_job_user") || "{}")
      const job: BaseJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newJob.title.trim(),
        location: newJob.location.trim(),
        salaryRange: newJob.salaryRange.trim(),
        requirements: newJob.requirements.trim(),
        description: newJob.description.trim(),
        company: userData.company || "未知公司",
        postedAt: new Date().toISOString(),
        updatedAt: newJob.updatedAt.trim(),
        recruiterAddress: userAddress,
        applications: [],
        jobType: newJob.jobType,
        experienceLevel: newJob.experienceLevel,
        benefits: newJob.benefits.trim(),
        tags: newJob.tags.trim(),
        status: "active",
        viewCount: 0,
        applicationCount: 0,
      }

      // 获取现有职位
      const savedJobs = localStorage.getItem("web3_jobs")
      const allJobs = savedJobs ? JSON.parse(savedJobs) : []

      // 添加新职位
      allJobs.push(job)

      // 保存到localStorage
      localStorage.setItem("web3_jobs", JSON.stringify(allJobs))

      // 更新本地状态
      setJobs((prev) => [...prev, job])

      // 重置表单
      setNewJob({
        title: "",
        location: "",
        salaryRange: "",
        requirements: "",
        description: "",
        jobType: "全职",
        experienceLevel: "不限",
        benefits: "",
        updatedAt: "",
        tags: "",
      })

      // 关闭对话框
      setIsCreateJobOpen(false)

      // 显示成功消息
      alert("职位发布成功！")

      // 重新加载数据以确保同步
      loadJobs()
    } catch (error) {
      console.error("发布职位失败:", error)
      alert("发布职位失败，请重试")
    }
  }

  const handleCreateJob = async (formData: {
    title: string
    location: string
    salaryRange: string
    requirements: string
    description: string
    jobType: string
    experienceLevel: string
    benefits: string
    tags: string
  }) => {
    try {
      // 调用合约方法
      const tx = await postJob(formData.title, formData.requirements);
      
      // 等待交易确认
      await tx.tx.wait();
  
      // 创建本地职位对象
      const userData = JSON.parse(localStorage.getItem("web3_job_user") || "{}");
      const newJob: BaseJob = {
        id: `job_${tx.txHash}`, // 使用交易哈希作为唯一ID
        ...formData,
        company: userData.company || "未知公司",
        postedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        recruiterAddress: userAddress,
        applications: [],
        status: "active",
        viewCount: 0,
        applicationCount: 0
      };
  
      // 更新本地状态
      setJobs(prev => [...prev, newJob]);
      
      // 更新本地存储
      const savedJobs = localStorage.getItem("web3_jobs") || "[]";
      const allJobs = JSON.parse(savedJobs);
      localStorage.setItem("web3_jobs", JSON.stringify([...allJobs, newJob]));
      
      // 关闭对话框
      setIsCreateJobOpen(false);
      alert("职位已成功发布到区块链！");
    } catch (error) {
      console.error("发布失败:", error);
      alert("发布到区块链失败，请检查钱包连接");
    }
  }

  const getJobApplications = (jobId: string) => {
    return applications.filter((app) => app.jobId === jobId)
  }
// 在组件状态后添加新状态
const [loadingResume, setLoadingResume] = useState(false)
const [resumeContent, setResumeContent] = useState<string>("")

  // 添加查看简历的函数
const handleViewResume = async (applicationId: string) => {
  try {
    setLoadingResume(true)
    const application = applications.find(app => app.id === applicationId)
    
    if (!application?.resumeId) {
      throw new Error("未找到简历信息")
    }

    // 与合约交互获取简历内容
    const resumeContent = await getResume(application.resumeId)
    
    // 如果返回的是IPFS哈希，则处理IPFS内容
    if (resumeContent.content.startsWith("ipfs://")) {
      const ipfsHash = resumeContent.content.replace("ipfs://", "")
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`)
      const data = await response.text()
      setResumeContent(data)
    } else {
      setResumeContent(resumeContent.content)
    }

    // 在新窗口打开简历内容
    const resumeWindow = window.open("", "_blank")
    resumeWindow?.document.write(`<pre>${resumeContent}</pre>`)
    
  } catch (error) {
    console.error("获取简历失败:", error)
    alert("获取简历失败: " + error.message)
  } finally {
    setLoadingResume(false)
  }
}

  const updateApplicationStatus = (applicationId: string, status: Application["status"]) => {
    const updatedApplications = applications.map((app) => (app.id === applicationId ? { ...app, status } : app))
    setApplications(updatedApplications)
    localStorage.setItem("web3_applications", JSON.stringify(updatedApplications))
  }

  // 添加处理职位更新的函数
  const handleJobUpdate = (updatedJob: BaseJob) => {
    setJobs((prev) => prev.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
  }

  // 添加编辑职位的函数
  const handleEditJob = (job: EditableJob) => {
    setEditingJob(job)
    setIsEditJobOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">招聘管理</h2>
          <p className="text-gray-600">管理您的职位发布和申请</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsProfileSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            个人设置
          </Button>
          <Dialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                发布职位
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <CreateJobForm
                userAddress={userAddress}
                onJobCreated={handleCreateJob}
                onCancel={() => setIsCreateJobOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">我的职位 ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">收到的申请 ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有发布职位</h3>
                <p className="text-gray-600 mb-4">点击上方按钮发布您的第一个职位</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-2">
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
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{getJobApplications(job.id).length} 申请</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant={job.status === "active" ? "default" : "destructive"}>
                        {job.status === "active" ? "展示中" : "已下架"}
                      </Badge>
                      <div className="text-sm text-gray-500">职位ID: {job.id.slice(-6)}</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedJobForDetail(job)
                            setIsJobDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleUnlistJob(job.id)}
                        >
                          下架
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">还没有收到申请</h3>
                <p className="text-gray-600">当有求职者申请您的职位时，会在这里显示</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => {
                const job = jobs.find((j) => j.id === application.jobId)
                return (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{application.applicantName}</CardTitle>
                          <CardDescription>申请职位: {job?.title || "未知职位"}</CardDescription>
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
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">邮箱: </span>
                          <span className="text-sm text-gray-600">{application.applicantEmail}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">钱包地址: </span>
                          <span className="text-sm text-gray-600 font-mono">
                            {application.applicantAddress.slice(0, 10)}...{application.applicantAddress.slice(-8)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">求职信: </span>
                          <p className="text-sm text-gray-600 mt-1">{application.coverLetter}</p>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, "accepted")}
                            disabled={application.status === "accepted"}
                          >
                            接受
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationStatus(application.id, "reviewed")}
                            disabled={application.status === "reviewed" || application.status === "accepted"}
                          >
                            标记已查看
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(application.id, "rejected")}
                            disabled={application.status === "rejected"}
                          >
                            拒绝
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <ProfileSettings
        userAddress={userAddress}
        userRole="recruiter"
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        onUpdate={() => {}}
      />

      <EditJobDialog
        job={editingJob}
        isOpen={isEditJobOpen}
        onClose={() => {
          setIsEditJobOpen(false)
          setEditingJob(null)
        }}
        onUpdate={handleJobUpdate}
      />
      <EnhancedJobDetailDialog
        job={selectedJobForDetail}
        isOpen={isJobDetailOpen}
        onClose={() => {
          setIsJobDetailOpen(false)
          setSelectedJobForDetail(null)
        }}
        userRole="recruiter"
        userAddress={userAddress}
      />
    </div>
  )
}
