// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title JobBoard
 * @dev 去中心化招聘平台智能合约
 * @notice 支持雇主发布职位、求职者投递简历的完整招聘流程
 */
contract JobBoard {
    
    /**
     * @dev 用户角色枚举
     * None: 未注册用户
     * Employer: 雇主
     * JobSeeker: 求职者
     */
    enum Role { None, Employer, JobSeeker }
    
    
    
    // 用户注册和角色管理
    mapping(address => bool) public isRegistered;  // 是否注册为合约用户，确保一个钱包地址只能注册一次
    mapping(address => bool) public isEmployer;    // 是否注册为招聘者，确保一个钱包只能注册一次
    mapping(address => bool) public isJobSeeker;  // 是否注册为求职者，确保一个钱包地址只能注册一次
    mapping(address => Role) public userRoles;     // 用户钱包地址=>用户当前角色
    
    // 职位相关结构和变量
    struct Job {
        uint jobId;         // 职位编号
        address employer;   // 招聘者地址
        string title;       // 职位名称
        string description; // 职位描述
        bool isActive;      // 招聘状态：是否在招
    }
    
    uint public nextJobId = 1;                              // 招聘者下一个发布的职位的编号
    mapping(uint => Job) public jobs;                   // 职位序号=>对应职位信息
    mapping(address => uint[]) public jobsByEmployer;   // 招聘方地址=>其发布的所有职位编号
    
    // 简历相关结构和变量
    struct Resume {
        uint resumeId;      // 简历编号
        address jobSeeker;  // 求职者地址
        string content;     // 使用IPFS的CID值储存简历PDF的链接地址
        bool isWithdrawn;   // 简历的展示状态：是否隐藏
    }
    
    uint public nextResumeId = 1;                                   // 求职者的下一个简历编号
    mapping(uint => Resume) public resumes;                     // 简历序号 =>简历信息
    mapping(uint => uint[]) public resumesByJob;                // 职位序号=>简历编号
    mapping(address => uint[]) public resumesByJobSeeker;       // 求职者地址=>其上传的所有简历编号
    

    
    // 需要监听的事件
    event UserRegistered(address indexed user);  //用户注册
    
    event RoleSwitched(address indexed user, Role role);  //用户切换角色状态

    event JobPosted(uint indexed jobId, address indexed employer);  //招聘者发布职位
    
    event JobStatusChanged(uint indexed jobId, bool isActive);  //招聘状态改变
    
    event ResumeSubmitted(uint indexed resumeId, uint indexed jobId, address indexed jobSeeker); //投递简历
    
    event ResumeWithdrawn(uint indexed resumeId, address indexed jobSeeker); //撤回简历
    


   /* 权限设置板块：
   仅限注册者
   仅限招聘方
   仅限求职者 */
    modifier onlyRegistered() {
        require(isRegistered[msg.sender], "User not registered");
        _;
    }
    
    modifier onlyEmployer() {
        require(userRoles[msg.sender] == Role.Employer, "Only employers allowed");
        _;
    }
    
    modifier onlyJobSeeker() {
        require(userRoles[msg.sender] == Role.JobSeeker, "Only job seekers allowed");
        _;
    }
    

    /* 通用功能板块：
    注册为求职者（含注册为合约用户
    注册为招聘者 （含注册为合约用户
    获取某个职位详情信息
    获取某个雇主发布的所有招聘职位列表
    获取简历信息
    切换为招聘者状态
    切换为求职者状态*/
    
    // 用户注册为求职者
    function registerAsJobSeeker() external {
        Role currentRole = userRoles[msg.sender]; //获取用户当前角色状态

        require(//需要用户当前角色状态为：未注册用户 或 招聘方
            currentRole == Role.None || currentRole == Role.Employer,
            "Cannot register as job seeker more than once"
        );

        require(currentRole != Role.JobSeeker, "Already registered as job seeker"); //检查用户是否已注册为求职者
        
        if(currentRole == Role.None){  //如果未注册过则更新用户注册状态
            isRegistered[msg.sender] = true;
            emit UserRegistered(msg.sender);
        }
         
        isJobSeeker[msg.sender] = true; //更新用户求职者的注册状态
    }

    // 用户注册为招聘者
    function registerAsEmployer() external {
        Role currentRole = userRoles[msg.sender]; //获取用户当前角色状态

        require(  //需要用户当前角色状态为：未注册用户 或 求职者
            currentRole == Role.None || currentRole == Role.JobSeeker,
            "Cannot register as employer more than once"
        );

        require(currentRole != Role.Employer, "Already registered as employer");  //检查用户是否已注册为求职者

        if(currentRole == Role.None){  //如果未注册过则更新用户注册状态
            isRegistered[msg.sender] = true;
            emit UserRegistered(msg.sender);
        }

        isEmployer[msg.sender] = true;  //更新用户招聘者的注册状态        
    }

    // 切换为求职者状态
    function switchToJobSeeker() external onlyRegistered {
        require(isJobSeeker[msg.sender], "You are not registered as a job seeker");
        require(userRoles[msg.sender] != Role.JobSeeker, "Already in job seeker mode");

        userRoles[msg.sender] = Role.JobSeeker;
        emit RoleSwitched(msg.sender, Role.JobSeeker);
    }

    // 切换为招聘者状态
    function switchToEmployer() external onlyRegistered {
        require(isEmployer[msg.sender], "You are not registered as an employer");
        require(userRoles[msg.sender] != Role.Employer, "Already in employer mode");

        userRoles[msg.sender] = Role.Employer;
        emit RoleSwitched(msg.sender, Role.Employer);
    }

    
    // 获取某个职位的详细信息
    function getJob(uint _jobId) external view onlyRegistered returns (
        uint jobId,
        address employer,
        string memory title,
        string memory description,
        bool isActive
    ) {
        require(_jobId < nextJobId, "Job does not exist");
        Job storage job = jobs[_jobId];
        return (job.jobId, job.employer, job.title, job.description, job.isActive);
    }

    // 获取某个雇主发布的所有招聘职位列表
    function getEmployerJobs(address _employer) external view onlyRegistered returns (uint[] memory) {
        return jobsByEmployer[_employer];
    }

    // 获取简历信息
    function getResume(uint _resumeId) external onlyRegistered view returns (
        uint resumeId,
        address jobSeeker,
        string memory content,
        bool isWithdrawn
    ) {
        require(_resumeId < nextResumeId, "Resume does not exist");
        Resume storage resume = resumes[_resumeId];
        
        // 如果简历已撤回，只有简历所有者可以查看
        if (resume.isWithdrawn && resume.jobSeeker != msg.sender) {
            revert("Resume has been withdrawn and is not accessible");
        }
        
        //只有简历所有者或相关雇主可以查看
        if (msg.sender != resume.jobSeeker) {
            // 检查调用者是否是该简历投递过的职位的雇主
            bool isAuthorizedEmployer = false;
            
            // 遍历所有职位，查找该简历投递过的职位
            for (uint i = 0; i < nextJobId; i++) {
                uint[] memory jobResumes = resumesByJob[i];
                for (uint j = 0; j < jobResumes.length; j++) {
                    if (jobResumes[j] == _resumeId) {
                        // 找到了该简历投递的职位，检查调用者是否为该职位的雇主
                        if (jobs[i].employer == msg.sender) {
                            isAuthorizedEmployer = true;
                            break;
                        }
                    }
                }
                if (isAuthorizedEmployer) break;
            }
            
            if (!isAuthorizedEmployer) {
                revert("Only resume owner or related employers can view this resume");
            }
        }
        
        return (resume.resumeId, resume.jobSeeker, resume.content, resume.isWithdrawn);
    }
  

    /*求职者功能板块:
    简历投递
    简历撤回 */

    // 简历投递功能
    function submitResume(uint _jobId, string memory _content) external onlyJobSeeker {
        require(_jobId < nextJobId, "Job does not exist"); //职位必须已经存在
        require(jobs[_jobId].isActive, "Job is not active"); //还在招人
        require(bytes(_content).length > 0, "Resume content cannot be empty"); //简历内容不能为空
        
        uint resumeId = nextResumeId; //给简历编号
        nextResumeId++; //更新下一个简历编号
        
        //简历信息
        resumes[resumeId] = Resume({
            resumeId: resumeId,
            jobSeeker: msg.sender,
            content: _content,
            isWithdrawn: false
        });
        
        resumesByJob[_jobId].push(resumeId); //将简历更新到该职位的所有简历列表中
        resumesByJobSeeker[msg.sender].push(resumeId);//将简历更新到该用户的所有简历列表中
        
        emit ResumeSubmitted(resumeId, _jobId, msg.sender);
    }
    
    // 简历撤回功能
    function withdrawResume(uint _resumeId) external onlyJobSeeker {
        require(_resumeId < nextResumeId, "Resume does not exist");//简历必须存在
        require(resumes[_resumeId].jobSeeker == msg.sender, "Only resume owner can withdraw"); //只能撤回自己的简历
        require(!resumes[_resumeId].isWithdrawn, "Resume already withdrawn");//不能多次重复撤回
        
        resumes[_resumeId].isWithdrawn = true; //将简历标记为撤回
        
        emit ResumeWithdrawn(_resumeId, msg.sender);
    }
   
      
    /*招聘者功能板块：
    职位发布
    职位状态管理
    获取指定职位收到的所有简历列表*/   
   
    // 职位发布
    function postJob(string memory _title, string memory _description) external onlyEmployer {
        require(bytes(_title).length > 0, "Job title cannot be empty");
        require(bytes(_description).length > 0, "Job description cannot be empty");
        
        uint jobId = nextJobId;
        nextJobId++;
        
        jobs[jobId] = Job({
            jobId: jobId,
            employer: msg.sender,
            title: _title,
            description: _description,
            isActive: true
        });
        
        jobsByEmployer[msg.sender].push(jobId);
        
        emit JobPosted(jobId, msg.sender);
    }
    
    //职位状态管理
    function setJobStatus(uint _jobId, bool _isActive) external onlyEmployer {
        require(_jobId < nextJobId, "Job does not exist");
        require(jobs[_jobId].employer == msg.sender, "Only job owner can modify status");
        
        jobs[_jobId].isActive = _isActive;
        
        emit JobStatusChanged(_jobId, _isActive);
    }


    
    //获取指定职位收到的所有简历列表（已撤回的简历不会显示）
    function getJobResumes(uint _jobId) external onlyEmployer view returns (uint[] memory) {
        require(_jobId < nextJobId, "Job does not exist");
        
        uint[] memory jobResumes = resumesByJob[_jobId];
        
        // 过滤出未撤回的简历
        uint[] memory accessibleResumes = new uint[](jobResumes.length);
        uint count = 0;
        
        for (uint i = 0; i < jobResumes.length; i++) {
            if (!resumes[jobResumes[i]].isWithdrawn) {
                accessibleResumes[count] = jobResumes[i];
                count++;
            }
        }
        uint[] memory result = new uint[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = accessibleResumes[i];
        }
        
        return result;
    }
  

   
   
}
