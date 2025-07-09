"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Briefcase, Users, ArrowLeft } from "lucide-react"
import { checkUserRegistration,registerAsEmployer,registerAsJobSeeker } from "@/lib/contract"


interface UserRegistrationProps {
  userAddress: string
  onRegister: (role: "recruiter" | "jobseeker", userData: any) => void
  onLogout: () => void
  targetRole?: "recruiter" | "jobseeker"
}

export default function UserRegistration({ userAddress, onRegister, onLogout }: UserRegistrationProps) {
  // 在组件开头添加状态来跟踪是否是角色切换模式
  const [userRole, setUserRole] = useState<"recruiter" | "jobseeker" | null>(null)
  const [isRoleSwitching, setIsRoleSwitching] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"recruiter" | "jobseeker">( "jobseeker")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    description: "",
    skills: "",
    experience: "",
  })

  // 检查用户是否已经注册过
  // useEffect(() => {
  //   const savedUser = localStorage.getItem("web3_job_user")
  //   if (savedUser) {
  //     const userData = JSON.parse(savedUser)
  //     if (userData.address === userAddress) {
  //       setIsRoleSwitching(true)
  //       setFormData({
  //         name: userData.name || "",
  //         email: userData.email || "",
  //         company: userData.company || "",
  //         position: userData.position || "",
  //         description: userData.description || "",
  //         skills: userData.skills || "",
  //         experience: userData.experience || "",
  //       })
  //     }
  //   }
  // }, [userAddress])
  // useEffect(() => {
  //   if(targetRole) {
  //     setFormData({
  //       name: "",
  //       email: "",
  //       company: "",
  //       position: "",
  //       description: "",
  //       skills: "",
  //       experience: "",
  //     })
  //     setSelectedRole(targetRole)
  //     setIsRoleSwitching(false)
  //   }
  //   else {
  //     // When targetRole is null, show role selection
  //     setSelectedRole("jobseeker")
  //     setIsRoleSwitching(false)
  //   }
  // }, [targetRole])

  useEffect(() => {
    const checkRegisteredRole = async () => {
      try {
        const { isRecruiter, isJobSeeker } = await checkUserRegistration(userAddress)
      
        // Only check registration for the selected role
        if (selectedRole === "recruiter" && isRecruiter) {
          onRegister("recruiter", {});
          return;
        }
        if (selectedRole === "jobseeker" && isJobSeeker) {
          onRegister("jobseeker", {});
          return;
        }
          
          // If not registered for selected role, stay in registration form
        } catch (error) {
          console.error("合约状态检查失败:", error);
        } 
    }

    checkRegisteredRole()
  }, [userAddress])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // onRegister(selectedRole, formData)
  
    try {
      if (selectedRole === "recruiter") {
        // 调用招聘者注册合约方法
        await registerAsEmployer()
      } else {
        // 调用求职者注册合约方法
        await registerAsJobSeeker()
      }

      const user = {
        address: userAddress,
        selectedRole,
        ...formData,
        registeredAt: new Date().toISOString(),
      }
      localStorage.setItem("web3_job_user", JSON.stringify(user))
      setUserRole(selectedRole)
      // setIsRegistered(true)

      // 注册成功后执行回调
      onRegister(selectedRole, formData)
    } catch (error) {
      console.error("合约注册失败:", error)
      // 可以添加错误提示
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onLogout} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        {/* 在标题部分添加提示文本 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{isRoleSwitching ? "切换角色" : "用户注册"}</h2>
          <p className="text-gray-600 mb-2">
            钱包地址: {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
          </p>
          <p className="text-sm text-gray-500">
            {isRoleSwitching ? "选择新的角色并更新信息" : "请选择您的角色并完善信息"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>选择用户角色</CardTitle>
          <CardDescription>请选择您在平台上的身份</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedRole} onValueChange={(value: "recruiter" | "jobseeker") => setSelectedRole(value)}>
            <div className="grid md:grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-colors ${selectedRole === "recruiter" ? "ring-2 ring-blue-500" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recruiter" id="recruiter" />
                    <Label htmlFor="recruiter" className="cursor-pointer flex-1">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">招聘方</h3>
                          <p className="text-sm text-gray-600">发布职位，管理招聘</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-colors ${selectedRole === "jobseeker" ? "ring-2 ring-blue-500" : ""}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="jobseeker" id="jobseeker" />
                    <Label htmlFor="jobseeker" className="cursor-pointer flex-1">
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-semibold">求职者</h3>
                          <p className="text-sm text-gray-600">浏览职位，投递简历</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>完善个人信息</CardTitle>
          <CardDescription>
            {selectedRole === "recruiter" ? "请填写公司和招聘相关信息" : "请填写个人简历信息"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* <div className="grid md:grid-cols-2 gap-4"> */}
              <div>
                <Label htmlFor="name">{selectedRole === "recruiter" ? "联系人姓名" : "姓名"} *</Label>
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
              </div>
            </div> */}

            {selectedRole === "recruiter" ? (
              <>
                {/* <div className="grid md:grid-cols-2 gap-4"> */}
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
                {/* </div> */}
                <div>
                  <Label htmlFor="description">公司简介</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="请简要介绍您的公司..."
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
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg">
              {isRoleSwitching ? "切换角色" : "完成注册"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
