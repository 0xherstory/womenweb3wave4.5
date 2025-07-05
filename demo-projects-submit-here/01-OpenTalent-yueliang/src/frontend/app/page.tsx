"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Briefcase, Users } from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import UserRegistration from "@/components/user-registration"
import RecruiterDashboard from "@/components/recruiter-dashboard"
import JobSeekerDashboard from "@/components/job-seeker-dashboard"
import {ethers} from "ethers"
import { checkUserRegistration, checkRoleRegistration,switchUserRole,getUserStatus } from "@/lib/contract"
enum Role { None, Employer, JobSeeker }

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState("")
  const [userRole, setUserRole] = useState<"recruiter" | "jobseeker" | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)

  // useEffect(() => {
  //   // Check if user is already registered
  //   const savedUser = localStorage.getItem("web3_job_user")
  //   if (savedUser) {
  //     const userData = JSON.parse(savedUser)
  //     setUserRole(userData.role)
  //     setIsRegistered(true)
  //     setUserAddress(userData.address)
  //     setIsConnected(true)
  //   }
  // }, [])
  useEffect(() => {
    const checkRegistration = async () => {
      if (!userAddress) return;
      // if (userAddress) {
      {
        try {
          const { isRecruiter, isJobSeeker } = await checkUserRegistration(userAddress);
          
          if (!isRecruiter && !isJobSeeker) {
            setIsRegistered(false);
            setUserRole(null);
            return;
          }
          
          setIsRegistered(true);

          const chainRole = await getUserStatus(userAddress);
          console.log("role",chainRole);

          setUserRole( Role[chainRole] === "Employer" ? "recruiter" : "jobseeker");
          
          // const savedUser = localStorage.getItem("web3_job_user");
          // const preferredRole = savedUser ? JSON.parse(savedUser).role : null;
  
          // setUserRole(
          //   isRecruiter && isJobSeeker ? preferredRole || "jobseeker" :
          //   isRecruiter ? "recruiter" : "jobseeker"
          // );
  
        } catch (error) {
          console.error("Registration check failed:", error);
        }
      }
    };
  
    checkRegistration();
  }, [userAddress,userRole]);


  const handleRoleSwitch = async (newRole: "recruiter" | "jobseeker") => {

    try {
      const hasRole = await checkRoleRegistration(userAddress, newRole);
      const role = await getUserStatus(userAddress);
      console.log("switch role:",Role[role]);
      // return;
      if (hasRole) {
        await switchUserRole(newRole);
        setUserRole(newRole);
        const userData = JSON.parse(localStorage.getItem("web3_job_user") || "{}");
        localStorage.setItem("web3_job_user", JSON.stringify({ ...userData, role: newRole }));
      } else {
        setIsRegistered(false);
        setUserRole(newRole);
      }
    } catch (error) {
      localStorage.removeItem("web3_job_user");
      console.error("Role switch failed:", error);
      setIsRegistered(true);
    }
  };
 
  const handleWalletConnect = (address: string) => {
    setUserAddress(address)
    setIsConnected(true)
  }

  const handleUserRegistration = (role: "recruiter" | "jobseeker", userData: any) => {
    const user = {
      address: userAddress,
      role,
      ...userData,
      registeredAt: new Date().toISOString(),
    }
    localStorage.setItem("web3_job_user", JSON.stringify(user))
    setUserRole(role)
    setIsRegistered(true)
  }

  const handleLogout = () => {
    // 清除所有本地状态
    localStorage.removeItem("web3_job_user");
    setIsConnected(false);
    setUserAddress("");
    setUserRole(null);
    setIsRegistered(false);
  
    // 清除MetaMask的选中账户（需要用户手动操作）
    if (window.ethereum?.selectedAddress) {
      window.ethereum.removeAllListeners();
      window.ethereum.emit('accountsChanged', []);
    }
  
    // 强制刷新页面确保状态重置
    window.location.reload();
  };
  
  // 添加MetaMask账户变化监听
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          handleLogout();
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // const handleRoleSwitch = () => {
  //   setUserRole(null)
  //   setIsRegistered(false)
  // }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Web3 招聘平台</h1>
            {/* <p className="text-xl text-gray-600 mb-8">基于区块链的去中心化招聘平台</p> */}
            <p className="text-xl text-gray-600 mb-8">基于区块链技术，保证数据透明和安全</p>
            {/* <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <Wallet className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>去中心化</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">基于区块链技术，保证数据透明和安全</p>
                </CardContent>
              </Card>

             <Card>
                <CardHeader>
                  <Briefcase className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle>招聘方</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">发布职位，管理招聘流程，查看候选人</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>求职者</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">浏览职位，投递简历，管理求职进度</p>
                </CardContent>
              </Card>
            </div> */}
          </div> 

          <WalletConnect onConnect={handleWalletConnect} />
        </div>
      </div>
    )
  }

  // if (!isRegistered) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  //       <div className="container mx-auto px-4 py-16">
  //         <UserRegistration userAddress={userAddress} onRegister={handleUserRegistration} onLogout={handleLogout} />
  //       </div>
  //     </div>
  //   )
  // }
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <UserRegistration 
            userAddress={userAddress}
            onRegister={handleUserRegistration}
            onLogout={handleLogout}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Web3 招聘平台</h1>
              <Badge variant={userRole === "recruiter" ? "default" : "secondary"}>
                {userRole === "recruiter" ? "招聘方" : "求职者"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>
              <Button variant="ghost" size="sm"  onClick={() => handleRoleSwitch(userRole === "recruiter" ? "jobseeker" : "recruiter")}
              >
                切换角色
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userRole === "recruiter" ? (
          <RecruiterDashboard userAddress={userAddress} />
        ) : (
          <JobSeekerDashboard userAddress={userAddress} />
        )}
      </main>
    </div>
  )
}
