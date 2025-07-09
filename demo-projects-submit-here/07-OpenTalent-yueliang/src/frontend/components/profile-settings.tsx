"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Building, Save } from "lucide-react"

interface ProfileSettingsProps {
  userAddress: string
  userRole: "recruiter" | "jobseeker"
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export default function ProfileSettings({ userAddress, userRole, isOpen, onClose, onUpdate }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    description: "",
    skills: "",
    experience: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadUserData()
    }
  }, [isOpen])

  const loadUserData = () => {
    const savedUser = localStorage.getItem("web3_job_user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        company: userData.company || "",
        position: userData.position || "",
        description: userData.description || "",
        skills: userData.skills || "",
        experience: userData.experience || "",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const savedUser = localStorage.getItem("web3_job_user")
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        const updatedUser = {
          ...userData,
          ...formData,
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem("web3_job_user", JSON.stringify(updatedUser))
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error("更新用户信息失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {userRole === "recruiter" ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
            <span>编辑个人信息</span>
          </DialogTitle>
          <DialogDescription>
            {userRole === "recruiter" ? "更新您的公司和招聘信息" : "更新您的个人简历信息"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div className="grid md:grid-cols-2 gap-4"> */}
            <div>
              <Label htmlFor="name">{userRole === "recruiter" ? "联系人姓名" : "姓名"} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            {/* <div>
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div> */}
          {/* </div> */}

          {userRole === "recruiter" ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">公司名称 *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>
                {/* <div>
                  <Label htmlFor="position">职位 *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    required
                  />
                </div> */}
              </div>
              <div>
                <Label htmlFor="description">公司简介</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="请简要介绍您的公司..."
                  rows={4}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="skills">技能标签</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="如：React, Node.js, Python（用逗号分隔）"
                />
              </div>
              <div>
                <Label htmlFor="experience">工作经验</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="请简要描述您的工作经验..."
                  rows={6}
                />
              </div>
            </>
          )}

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
