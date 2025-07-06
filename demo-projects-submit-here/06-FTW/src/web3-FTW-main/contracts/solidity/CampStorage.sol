// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title CampFactory接口
 * @dev 用于与工厂合约交互
 */
interface ICampFactory {
    function registerParticipant(address participant) external;
}

/**
 * @title CampStorage
 * @dev 存储所有Camp合约的状态变量
 */
contract CampStorage {
    // 枚举定义
    enum CampState {
        Registration,
        Failed,
        Success,
        Challenging,
        Completed
    }
    
    enum ParticipantState {
        NotRegistered,
        Registered,
        Completed,
        Withdrawn,
        Forfeited
    }
    
    enum ChallengeState {
        NotConfigured,
        Active,
        Expired
    }
    
    // 结构体定义
    struct Challenge {
        uint256 deadline;
        bytes32 passwordHash;
        ChallengeState state;
        uint16 completedCount;
    }
    
    struct Participant {
        ParticipantState state;
        uint8 completedChallenges;
        uint256 registrationTime;
        bool[] challengesCompleted;
    }
    
    // 状态变量
    address public organizer;            // 组织者地址
    string public name;                  // 营地名称
    uint256 public signupDeadline;       // 报名截止时间
    uint256 public campEndDate;          // 结营时间
    uint8 public challengeCount;         // 挑战关卡总数
    uint16 public minParticipants;       // 最小参与者数量
    uint16 public maxParticipants;       // 最大参与者数量
    uint256 public depositAmount;        // 押金金额
    address public factory;              // 工厂合约引用
    
    // 状态跟踪
    CampState public state;              // 当前营地状态
    uint16 public participantCount;      // 参与者数量
    uint16 public completedCount;        // 完成所有关卡的人数
    bool public depositsWithdrawn;       // 押金是否已被提取
    
    // 数据存储
    mapping(address => Participant) public participants;  // 参与者信息
    address[] public participantAddresses;                // 参与者地址数组
    Challenge[] public challenges;                        // 关卡信息
    
    // 防止实现合约被初始化
    bool internal initialized;
} 