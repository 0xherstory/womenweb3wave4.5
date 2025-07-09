import { ethers } from "ethers"

// 你的合约ABI
export const CONTRACT_ABI = 
  [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"jobId","type":"uint256"},{"indexed":true,"internalType":"address","name":"employer","type":"address"}],"name":"JobPosted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"jobId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"isActive","type":"bool"}],"name":"JobStatusChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"resumeId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"jobId","type":"uint256"},{"indexed":true,"internalType":"address","name":"jobSeeker","type":"address"}],"name":"ResumeSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"resumeId","type":"uint256"},{"indexed":true,"internalType":"address","name":"jobSeeker","type":"address"}],"name":"ResumeWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"enum JobBoard.Role","name":"role","type":"uint8"}],"name":"RoleSwitched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserRegistered","type":"event"},{"inputs":[{"internalType":"address","name":"_employer","type":"address"}],"name":"getEmployerJobs","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_jobId","type":"uint256"}],"name":"getJob","outputs":[{"internalType":"uint256","name":"jobId","type":"uint256"},{"internalType":"address","name":"employer","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_jobId","type":"uint256"}],"name":"getJobResumes","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_resumeId","type":"uint256"}],"name":"getResume","outputs":[{"internalType":"uint256","name":"resumeId","type":"uint256"},{"internalType":"address","name":"jobSeeker","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"bool","name":"isWithdrawn","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isEmployer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isJobSeeker","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"jobs","outputs":[{"internalType":"uint256","name":"jobId","type":"uint256"},{"internalType":"address","name":"employer","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"bool","name":"isActive","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"jobsByEmployer","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextJobId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextResumeId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_title","type":"string"},{"internalType":"string","name":"_description","type":"string"}],"name":"postJob","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"registerAsEmployer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"registerAsJobSeeker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"resumes","outputs":[{"internalType":"uint256","name":"resumeId","type":"uint256"},{"internalType":"address","name":"jobSeeker","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"bool","name":"isWithdrawn","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"resumesByJob","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"resumesByJobSeeker","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_jobId","type":"uint256"},{"internalType":"bool","name":"_isActive","type":"bool"}],"name":"setJobStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_jobId","type":"uint256"},{"internalType":"string","name":"_content","type":"string"}],"name":"submitResume","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"switchToEmployer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"switchToJobSeeker","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRoles","outputs":[{"internalType":"enum JobBoard.Role","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_resumeId","type":"uint256"}],"name":"withdrawResume","outputs":[],"stateMutability":"nonpayable","type":"function"}]


// 你的合约地址
export const CONTRACT_ADDRESS = "0x0f372C1f9D4776C8221a2fCb5E807a5382CAC2Ac"


export async function getContract() {
    // @ts-ignore
    const { ethereum } = window
    if (!ethereum) throw new Error("请先安装MetaMask等以太坊钱包")
    await ethereum.request({ method: "eth_requestAccounts" })
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

export async function checkUserRegistration(userAddress: string) {
  const contract = await getContract();
  const [isRecruiter, isJobSeeker] = await Promise.all([
    contract.isEmployer(userAddress),
    contract.isJobSeeker(userAddress)
  ]);
  return { isRecruiter, isJobSeeker };
}

export async function checkRoleRegistration(userAddress: string, role: "recruiter" | "jobseeker") {
  const contract = await getContract();
  return role === "recruiter" 
    ? contract.isEmployer(userAddress)
    : contract.isJobSeeker(userAddress);
}

export async function getUserStatus(userAddress:string){
  const contract = await getContract();
  return contract.userRoles(userAddress);
}

export async function switchUserRole(newRole: "recruiter" | "jobseeker") {
  const contract = await getContract();
  const tx = newRole === "recruiter" 
    ? await contract.switchToEmployer()
    : await contract.switchToJobSeeker();
  await tx.wait();
}

// 注册为招聘者
export async function registerAsEmployer() {
  const contract = await getContract()
  const tx = await contract.registerAsEmployer()
  await tx.wait()
}

// 注册为求职者
export async function registerAsJobSeeker() {
  const contract = await getContract()
  const tx = await contract.registerAsJobSeeker()
  await tx.wait()
}
  
// 发布职位到链上
export async function postJob(title: string, description: string) {
  const contract = await getContract() // 见前文
  const tx = await contract.postJob(title, description)
  const receipt = await tx.wait()
  let jobPostedEvent = null
  if (receipt && receipt.status === 1 && receipt.events) {
    jobPostedEvent = receipt.events.find(e => e.event === "JobPosted")
  }
  return {
    tx:tx,
    success: receipt.status === 1,
    event: jobPostedEvent,
    txHash: tx.hash
  }
}

export async function setJobStatus(jobId: number, isActive: boolean) {
  const contract = await getContract()
  const tx = await contract.setJobStatus(jobId, isActive)
  await tx.wait()
  return tx
}

export async function getJob(jobId: number) {
  const contract = await getContract()
  const [id, employer, title, description, isActive] = await contract.getJob(jobId)
  return { id, employer, title, description, isActive }
}

export async function getEmployerJobs(employer: string) {
  const contract = await getContract()
  const jobIds = await contract.getEmployerJobs(employer)
  
  return jobIds
}

export async function submitResume(jobId: number, content: string) {
  const contract = await getContract()
  const tx = await contract.submitResume(jobId, content)
  const receipt = await tx.wait()
  let resumeSubmittedEvent = null
  if (receipt && receipt.status === 1 && receipt.events) {
    resumeSubmittedEvent = receipt.events.find((e: any) => e.event === "ResumeSubmitted")
  }
  return {
    success: receipt.status === 1,
    event: resumeSubmittedEvent,
    txHash: tx.hash
  }
}

export async function withdrawResume(resumeId: number) {
  const contract = await getContract()
  const tx = await contract.withdrawResume(resumeId)
  await tx.wait()
}

export async function getJobResumes(jobId: number) {
  const contract = await getContract()
  const resumeIds = await contract.getJobResumes(jobId)
  // resumeIds 是 uint[]，可遍历调用 getResume
  // return resumeIds
   return resumeIds.map((id: any) => Number(id))
}

export async function getResume(resumeId: number) {
  const contract = await getContract()
  const [id, jobSeeker, content, isWithdrawn] = await contract.getResume(resumeId)
  return {
    id: Number(id),
    jobSeeker,
    content,
    isWithdrawn
  }
}

export async function getAllActiveJobs() {
    // 1. 连接合约
    // @ts-ignore
    const contract =  await getContract()

    // 2. 获取职位总数
    const nextJobId = await contract.nextJobId()
    const jobs = []
  
    // 3. 遍历所有职位编号，获取详情并筛选isActive
    for (let jobId = 0; jobId < nextJobId; jobId++) {
      const [id, employer, title, description, isActive] = await contract.getJob(jobId)
      if (isActive) {
        jobs.push({ id, employer, title, description, isActive })
      }
    }
    
    return jobs
  }

export async function loadJobsFromChain() {
  const contract = await getContract()
  const nextJobId = await contract.nextJobId()
  const jobs = []
  for (let jobId = 0; jobId < nextJobId; jobId++) {
    const [id, employer, title, description, isActive] = await contract.getJob(jobId)
    if (isActive) {
      jobs.push({
        id: id.toString(),
        title,
        company: "", // 可扩展
        location: "",
        salaryRange: "-",
        requirements: "-",
        description,
        postedAt: "-",
        updatedAt: "-",
        recruiterAddress: employer,
        applications: [],
        jobType: "",
        experienceLevel: "",
        benefits: "-",
        status: isActive ? "active" : "inactive",
        viewCount: 0,
        applicationCount: 0,
        tags: "",
      })
    }
  }
  return jobs
}
