// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CampProxy.sol";

/**
 * @title CampFactory
 * @dev 负责创建和管理挑战营地合约
 */
contract CampFactory {
    // 实现合约地址
    address public campImplementation;
    
    // 存储所有创建的营地地址
    address[] public camps;
    
    // 映射：地址 => 该地址创建的所有营地
    mapping(address => address[]) public organizerToCamps;
    
    // 映射：地址 => 该地址参与的所有营地
    mapping(address => address[]) public participantToCamps;
    
    // 合约拥有者
    address public owner;
    
    // 事件
    event CampCreated(
        address indexed campAddress,
        address indexed organizer,
        string name,
        uint256 signupDeadline,
        uint256 campEndDate,
        uint8 challengeCount,
        uint16 minParticipants,
        uint16 maxParticipants,
        uint256 depositAmount
    );
    
    event ParticipantJoined(
        address indexed campAddress,
        address indexed participant
    );
    
    event ImplementationUpdated(
        address oldImplementation,
        address newImplementation
    );
    
    // 构造函数
    constructor(address _campImplementation) {
        campImplementation = _campImplementation;
        owner = msg.sender;
    }
    
    // 修饰符：只有合约拥有者可以调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev 更新实现合约地址
     * @param _newImplementation 新的实现合约地址
     */
    function updateImplementation(address _newImplementation) external onlyOwner {
        require(_newImplementation != address(0), "Invalid implementation address");
        require(_newImplementation != campImplementation, "Same implementation address");
        
        address oldImplementation = campImplementation;
        campImplementation = _newImplementation;
        
        emit ImplementationUpdated(oldImplementation, _newImplementation);
    }
    
    /**
     * @dev 创建新的挑战营地
     */
    function createCamp(
        string calldata _name,
        uint256 _signupDeadline,
        uint256 _campEndDate,
        uint8 _challengeCount,
        uint16 _minParticipants,
        uint16 _maxParticipants,
        uint256 _depositAmount
    ) external returns (address) {
        // 验证参数
        require(bytes(_name).length > 0 && bytes(_name).length <= 64, "Invalid name length");
        require(_signupDeadline > block.timestamp, "Signup deadline must be in the future");
        require(_campEndDate > _signupDeadline, "Camp end date must be after signup deadline");
        require(_challengeCount > 0, "Challenge count must be greater than 0");
        require(_minParticipants > 0, "Min participants must be greater than 0");
        require(_maxParticipants >= _minParticipants, "Max participants must be >= min participants");
        require(_depositAmount > 0, "Deposit amount must be greater than 0");
        
        // 准备初始化数据
        bytes memory initData = abi.encodeWithSignature(
            "initialize(address,string,uint256,uint256,uint8,uint16,uint16,uint256)",
            msg.sender,
            _name,
            _signupDeadline,
            _campEndDate,
            _challengeCount,
            _minParticipants,
            _maxParticipants,
            _depositAmount
        );
        
        // 创建新的代理合约
        CampProxy newCamp = new CampProxy(campImplementation, initData);
        address campAddress = address(newCamp);
        
        // 更新存储
        camps.push(campAddress);
        organizerToCamps[msg.sender].push(campAddress);
        
        // 触发事件
        emit CampCreated(
            campAddress,
            msg.sender,
            _name,
            _signupDeadline,
            _campEndDate,
            _challengeCount,
            _minParticipants,
            _maxParticipants,
            _depositAmount
        );
        
        return campAddress;
    }
    
    /**
     * @dev 注册参与者（仅由Camp合约调用）
     */
    function registerParticipant(address _participant) external {
        // 确保调用者是由此工厂创建的营地合约
        bool isCamp = false;
        for (uint i = 0; i < camps.length; i++) {
            if (camps[i] == msg.sender) {
                isCamp = true;
                break;
            }
        }
        require(isCamp, "Caller is not a registered camp");
        
        // 更新参与者映射
        participantToCamps[_participant].push(msg.sender);
        
        // 触发事件
        emit ParticipantJoined(msg.sender, _participant);
    }
    
    /**
     * @dev 获取所有营地地址
     */
    function getAllCamps() external view returns (address[] memory) {
        return camps;
    }
    
    /**
     * @dev 获取指定组织者创建的所有营地
     */
    function getCampsByOrganizer(address _organizer) external view returns (address[] memory) {
        return organizerToCamps[_organizer];
    }
    
    /**
     * @dev 获取指定参与者参与的所有营地
     */
    function getCampsByParticipant(address _participant) external view returns (address[] memory) {
        return participantToCamps[_participant];
    }
    
    /**
     * @dev 获取营地总数
     */
    function getCampCount() external view returns (uint256) {
        return camps.length;
    }
} 