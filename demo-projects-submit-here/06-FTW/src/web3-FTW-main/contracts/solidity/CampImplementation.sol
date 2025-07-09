// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CampStorage.sol";

/**
 * @title CampImplementation
 * @dev Camp合约的实现逻辑
 */
contract CampImplementation is CampStorage {
    // 事件定义
    event ParticipantRegistered(address indexed participant, uint256 depositAmount, uint256 timestamp);
    event CampStateChanged(CampState previousState, CampState newState, uint256 timestamp);
    event ChallengesConfigured(uint8 challengeCount, uint256 timestamp);
    event ChallengeCompleted(address indexed participant, uint8 challengeIndex, uint256 timestamp);
    event DepositWithdrawn(address indexed participant, uint256 amount, uint256 timestamp);
    event DepositsForfeited(address indexed organizer, uint256 amount, uint16 forfeitedCount, uint256 timestamp);
    
    // 修饰符
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this function");
        _;
    }
    
    modifier inState(CampState _state) {
        require(state == _state, "Camp is not in the required state");
        _;
    }
    
    /**
     * @dev 初始化函数，由代理合约调用
     */
    function initialize(
        address _organizer,
        string memory _name,
        uint256 _signupDeadline,
        uint256 _campEndDate,
        uint8 _challengeCount,
        uint16 _minParticipants,
        uint16 _maxParticipants,
        uint256 _depositAmount
    ) public {
        // 确保只能初始化一次
        require(organizer == address(0), "Already initialized");
        
        organizer = _organizer;
        name = _name;
        signupDeadline = _signupDeadline;
        campEndDate = _campEndDate;
        challengeCount = _challengeCount;
        minParticipants = _minParticipants;
        maxParticipants = _maxParticipants;
        depositAmount = _depositAmount;
        state = CampState.Registration;
        factory = msg.sender;
    }
    
    /**
     * @dev 参与者报名并支付押金
     */
    function register() external payable inState(CampState.Registration) {
        require(block.timestamp <= signupDeadline, "Registration period has ended");
        require(participantCount < maxParticipants, "Maximum participants reached");
        require(participants[msg.sender].state == ParticipantState.NotRegistered, "Already registered");
        require(msg.value == depositAmount, "Incorrect deposit amount");
        require(msg.sender != organizer, "Organizer cannot register as participant");
        
        // 初始化参与者信息
        participants[msg.sender] = Participant({
            state: ParticipantState.Registered,
            completedChallenges: 0,
            registrationTime: block.timestamp,
            challengesCompleted: new bool[](challengeCount)
        });
        
        // 将参与者地址添加到数组中
        participantAddresses.push(msg.sender);
        
        // 更新计数器
        participantCount++;
        
        // 通知工厂合约
        ICampFactory(factory).registerParticipant(msg.sender);
        
        // 触发事件
        emit ParticipantRegistered(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev 检查并更新营地状态（报名结束后）
     */
    function checkCampState() external {
        // 只有在报名阶段且报名截止日期已过时才能调用
        require(state == CampState.Registration, "Camp is not in registration state");
        require(block.timestamp > signupDeadline, "Registration period has not ended yet");
        
        CampState previousState = state;
        
        // 判断是否达到最小参与者数量
        if (participantCount < minParticipants) {
            state = CampState.Failed;
        } else {
            state = CampState.Success;
        }
        
        // 触发状态变更事件
        emit CampStateChanged(previousState, state, block.timestamp);
    }
    
    /**
     * @dev 组织者配置关卡
     * @param _deadlines 各关卡截止时间数组
     * @param _passwordHashes 各关卡密码哈希数组
     */
    function configChallenges(
        uint256[] memory _deadlines,
        bytes32[] memory _passwordHashes
    ) external onlyOrganizer inState(CampState.Success) {
        require(_deadlines.length == challengeCount, "Invalid deadlines array length");
        require(_passwordHashes.length == challengeCount, "Invalid password hashes array length");
        
        // 确保关卡尚未配置
        require(challenges.length == 0, "Challenges already configured");
        
        // 验证所有截止日期
        for (uint8 i = 0; i < challengeCount; i++) {
            require(_deadlines[i] > block.timestamp, "Deadline must be in the future");
            require(_deadlines[i] <= campEndDate, "Deadline cannot be after camp end date");
            
            challenges.push(Challenge({
                deadline: _deadlines[i],
                passwordHash: _passwordHashes[i],
                state: ChallengeState.Active,
                completedCount: 0
            }));
        }
        
        // 更新营地状态为闯关阶段
        CampState previousState = state;
        state = CampState.Challenging;
        
        // 触发事件
        emit ChallengesConfigured(challengeCount, block.timestamp);
        emit CampStateChanged(previousState, state, block.timestamp);
    }
    
    /**
     * @dev 参与者提交关卡密码
     * @param _challengeIndex 关卡索引
     * @param _password 密码原文
     */
    function submitChallengePassword(uint8 _challengeIndex, string memory _password) external inState(CampState.Challenging) {
        require(_challengeIndex < challengeCount, "Invalid challenge index");
        require(participants[msg.sender].state == ParticipantState.Registered, "Not registered or already completed");
        require(!participants[msg.sender].challengesCompleted[_challengeIndex], "Challenge already completed");
        
        Challenge storage challenge = challenges[_challengeIndex];
        require(challenge.state == ChallengeState.Active, "Challenge is not active");
        require(block.timestamp <= challenge.deadline, "Challenge deadline has passed");
        
        // 验证密码
        bytes32 passwordHash = keccak256(abi.encodePacked(_password));
        require(passwordHash == challenge.passwordHash, "Incorrect password");
        
        // 更新参与者完成状态
        participants[msg.sender].challengesCompleted[_challengeIndex] = true;
        participants[msg.sender].completedChallenges++;
        challenge.completedCount++;
        
        // 检查是否完成所有关卡
        if (participants[msg.sender].completedChallenges == challengeCount) {
            participants[msg.sender].state = ParticipantState.Completed;
            completedCount++;
        }
        
        // 触发事件
        emit ChallengeCompleted(msg.sender, _challengeIndex, block.timestamp);
    }
    
    /**
     * @dev 更新关卡状态（截止日期后）
     * @param _challengeIndex 关卡索引
     */
    function updateChallengeState(uint8 _challengeIndex) external inState(CampState.Challenging) {
        require(_challengeIndex < challengeCount, "Invalid challenge index");
        
        Challenge storage challenge = challenges[_challengeIndex];
        require(challenge.state == ChallengeState.Active, "Challenge is not active");
        require(block.timestamp > challenge.deadline, "Challenge deadline has not passed yet");
        
        // 更新关卡状态为已过期
        challenge.state = ChallengeState.Expired;
        
        // 检查是否所有关卡都已过期，如果是则结营
        bool allExpired = true;
        for (uint8 i = 0; i < challengeCount; i++) {
            if (challenges[i].state != ChallengeState.Expired) {
                allExpired = false;
                break;
            }
        }
        
        // 如果所有关卡都已过期或已到结营时间，则更新营地状态为已结营
        if (allExpired || block.timestamp > campEndDate) {
            CampState previousState = state;
            state = CampState.Completed;
            emit CampStateChanged(previousState, state, block.timestamp);
        }
    }
    
    /**
     * @dev 检查营地是否应该结营
     */
    function checkCampCompletion() external {
        // 如果已到结营时间，则更新营地状态为已结营
        if (block.timestamp > campEndDate && state == CampState.Challenging) {
            CampState previousState = state;
            state = CampState.Completed;
            emit CampStateChanged(previousState, state, block.timestamp);
        }
    }
    
    /**
     * @dev 开营失败时，参与者提取押金
     */
    function withdrawDepositOnFailure() external inState(CampState.Failed) {
        require(participants[msg.sender].state == ParticipantState.Registered, "Not eligible for refund");
        require(!depositsWithdrawn, "Deposits already withdrawn");
        
        // 更新参与者状态
        participants[msg.sender].state = ParticipantState.Withdrawn;
        
        // 转账押金
        payable(msg.sender).transfer(depositAmount);
        
        // 触发事件
        emit DepositWithdrawn(msg.sender, depositAmount, block.timestamp);
    }
    
    /**
     * @dev 组织者批量退还押金（开营失败时）
     * @param _participants 参与者地址数组
     */
    function batchRefundDeposits(address[] memory _participants) external onlyOrganizer inState(CampState.Failed) {
        require(!depositsWithdrawn, "Deposits already withdrawn");
        
        uint256 totalRefunded = 0;
        
        for (uint i = 0; i < _participants.length; i++) {
            address participant = _participants[i];
            
            if (participants[participant].state == ParticipantState.Registered) {
                // 更新参与者状态
                participants[participant].state = ParticipantState.Withdrawn;
                
                // 转账押金
                payable(participant).transfer(depositAmount);
                totalRefunded += depositAmount;
                
                // 触发事件
                emit DepositWithdrawn(participant, depositAmount, block.timestamp);
            }
        }
    }
    
    /**
     * @dev 成功完成所有关卡的参与者提取押金
     */
    function withdrawDepositOnCompletion() external inState(CampState.Completed) {
        require(participants[msg.sender].state == ParticipantState.Completed, "Not eligible for withdrawal");
        
        // 更新参与者状态
        participants[msg.sender].state = ParticipantState.Withdrawn;
        
        // 转账押金
        payable(msg.sender).transfer(depositAmount);
        
        // 触发事件
        emit DepositWithdrawn(msg.sender, depositAmount, block.timestamp);
    }
    
    /**
     * @dev 组织者提取未完成关卡参与者的押金
     */
    function forfeitDeposits() external onlyOrganizer inState(CampState.Completed) {
        require(!depositsWithdrawn, "Deposits already forfeited");
        
        // 计算可被罚没的押金总额
        uint16 forfeitedCount = 0;
        uint256 forfeitedAmount = 0;
        
        for (uint i = 0; i < participantAddresses.length; i++) {
            address participant = participantAddresses[i];
            
            if (participants[participant].state == ParticipantState.Registered) {
                // 更新参与者状态
                participants[participant].state = ParticipantState.Forfeited;
                forfeitedCount++;
                forfeitedAmount += depositAmount;
            }
        }
        
        // 标记押金已被提取
        depositsWithdrawn = true;
        
        // 转账罚没的押金给组织者
        if (forfeitedAmount > 0) {
            payable(organizer).transfer(forfeitedAmount);
            
            // 触发事件
            emit DepositsForfeited(organizer, forfeitedAmount, forfeitedCount, block.timestamp);
        }
    }
    
    /**
     * @dev 获取营地基本信息
     */
    function getCampInfo() external view returns (
        address _organizer,
        string memory _name,
        uint256 _signupDeadline,
        uint256 _campEndDate,
        uint8 _challengeCount,
        uint16 _minParticipants,
        uint16 _maxParticipants,
        uint256 _depositAmount,
        CampState _state,
        uint16 _participantCount,
        uint16 _completedCount
    ) {
        return (
            organizer,
            name,
            signupDeadline,
            campEndDate,
            challengeCount,
            minParticipants,
            maxParticipants,
            depositAmount,
            state,
            participantCount,
            completedCount
        );
    }
    
    /**
     * @dev 获取参与者信息
     * @param _participant 参与者地址
     */
    function getParticipantInfo(address _participant) external view returns (
        ParticipantState _state,
        uint8 _completedChallenges,
        uint256 _registrationTime,
        bool[] memory _challengesCompleted
    ) {
        Participant storage participant = participants[_participant];
        return (
            participant.state,
            participant.completedChallenges,
            participant.registrationTime,
            participant.challengesCompleted
        );
    }
    
    /**
     * @dev 获取关卡信息
     * @param _index 关卡索引
     */
    function getChallengeInfo(uint8 _index) external view returns (
        uint256 _deadline,
        ChallengeState _state,
        uint16 _completedCount
    ) {
        require(_index < challenges.length, "Invalid challenge index");
        Challenge storage challenge = challenges[_index];
        return (
            challenge.deadline,
            challenge.state,
            challenge.completedCount
        );
    }
    
    /**
     * @dev 获取合约余额
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
} 