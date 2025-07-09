// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LearnToken.sol";
import "./AchievementNFT.sol";

contract RewardSystem {
    LearnToken public learnToken;
    AchievementNFT public achievementNFT;
    address public owner;

    // 学习模块 => 奖励金额
    mapping(string => uint256) public moduleRewards;
    
    // 成就ID => 是否已发放
    mapping(uint256 => bool) public achievements;
    
    // 用户地址 => 已完成的模块
    mapping(address => mapping(string => bool)) public completedModules;
    
    // 用户地址 => 已获得的成就
    mapping(address => uint256[]) public userAchievements;

    event ModuleCompleted(address indexed user, string moduleId, uint256 reward);
    event AchievementEarned(address indexed user, uint256 achievementId);

    constructor(address _tokenAddress, address _nftAddress) {
        learnToken = LearnToken(_tokenAddress);
        achievementNFT = AchievementNFT(_nftAddress);
        owner = msg.sender;
        
        // 初始化奖励规则
        moduleRewards["intro"] = 100;
        moduleRewards["advanced"] = 300;
        
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // 完成学习模块
    function completeModule(string memory moduleId) external {
        require(!completedModules[msg.sender][moduleId], "Module already completed");
        require(moduleRewards[moduleId] > 0, "Invalid module");
        
        completedModules[msg.sender][moduleId] = true;
        uint256 reward = moduleRewards[moduleId];
        
        learnToken.transfer(msg.sender, reward * 10**learnToken.decimals());
        emit ModuleCompleted(msg.sender, moduleId, reward);
        
        // 检查成就
        _checkAchievements(msg.sender);
    }

    // 发放成就NFT
    function grantAchievement(address user, uint256 achievementId) internal {
        require(!achievements[achievementId], "Achievement already granted");
        
        achievementNFT.mint(user);
        achievements[achievementId] = true;
        userAchievements[user].push(achievementId);
        
        emit AchievementEarned(user, achievementId);
    }

    // 内部成就检查逻辑
    function _checkAchievements(address user) private {
        // 示例：完成两个模块获得成就1
        if (completedModules[user]["intro"] && 
            completedModules[user]["advanced"] && 
            !achievements[1]) 
        {
            grantAchievement(user, 1);
        }
    }


    // 设置模块奖励
    function setModuleReward(string memory moduleId, uint256 reward) external onlyOwner {
        moduleRewards[moduleId] = reward;
    }
}