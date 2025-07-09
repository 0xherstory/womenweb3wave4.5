export interface Application {
    id: string
    jobId: string
    applicantAddress: string
    applicantName: string
    applicantEmail: string
    coverLetter: string
    appliedAt: string
    status: "pending" | "reviewed" | "accepted" | "rejected"
    resumeId: number
  }

export interface BaseJob {
    id: string
    title: string
    company: string
    location: string
    salaryRange: string
    requirements: string
    description: string
    postedAt: string
    updatedAt: string
    recruiterAddress: string
    applications: Application[]
    jobType: string
    experienceLevel: string
    benefits: string
    status: string
    viewCount: number
    applicationCount: number
    tags: string
  }

  export type EditableJob = Omit<BaseJob, 'postedAt' | 'applications' | 'viewCount' | 'applicationCount'>&{
    
  }

  