// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DailyInspirationCard
 * @dev 每日鼓励卡片智能合约
 * 专为女性用户设计的Web3鼓励应用
 */
contract DailyInspirationCard is Ownable, ReentrancyGuard {
    
    // 事件定义
    event CardGenerated(address indexed user, uint256 indexed cardId, uint256 timestamp);
    event CommentAdded(address indexed user, uint256 indexed cardId, bytes32 commentHash);
    
    // 结构体定义
    struct Card {
        uint256 cardId;
        address user;
        uint256 timestamp;
        uint256 contentIndex;
        bool exists;
    }
    
    struct Comment {
        bytes32 commentHash; // IPFS哈希
        address user;
        uint256 timestamp;
        bool exists;
    }
    
    // 状态变量
    mapping(address => mapping(uint256 => Card)) public userCards; // user => date => Card
    mapping(uint256 => Comment[]) public cardComments; // cardId => Comment[]
    mapping(address => uint256) public userCommentCount; // 用户评论计数
    
    uint256 public totalCards;
    uint256 public totalComments;
    uint256 public contentLibrarySize = 15; // 内容库大小，可更新
    
    // 常量
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    /**
     * @dev 生成每日卡片
     * @param contentIndex 内容索引（由前端计算）
     */
    function generateDailyCard(uint256 contentIndex) external nonReentrant {
        require(contentIndex < contentLibrarySize, "Invalid content index");
        
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        address user = msg.sender;
        
        // 检查今天是否已经生成过卡片
        require(!userCards[user][today].exists, "Card already generated today");
        
        // 创建新卡片
        Card memory newCard = Card({
            cardId: totalCards + 1,
            user: user,
            timestamp: block.timestamp,
            contentIndex: contentIndex,
            exists: true
        });
        
        userCards[user][today] = newCard;
        totalCards++;
        
        emit CardGenerated(user, newCard.cardId, block.timestamp);
    }
    
    /**
     * @dev 添加评论
     * @param cardId 卡片ID
     * @param commentHash IPFS评论内容哈希
     */
    function addComment(uint256 cardId, bytes32 commentHash) external nonReentrant {
        require(cardId > 0 && cardId <= totalCards, "Invalid card ID");
        require(commentHash != bytes32(0), "Invalid comment hash");
        
        address user = msg.sender;
        
        // 检查用户是否拥有这张卡片
        bool isOwner = false;
        for (uint256 i = 0; i < 365; i++) { // 检查过去一年的卡片
            uint256 checkDate = (block.timestamp / SECONDS_PER_DAY) - i;
            if (userCards[user][checkDate].cardId == cardId) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "You can only comment on your own cards");
        
        // 检查是否已经评论过
        Comment[] storage comments = cardComments[cardId];
        for (uint256 i = 0; i < comments.length; i++) {
            require(comments[i].user != user, "Already commented on this card");
        }
        
        // 添加评论
        Comment memory newComment = Comment({
            commentHash: commentHash,
            user: user,
            timestamp: block.timestamp,
            exists: true
        });
        
        cardComments[cardId].push(newComment);
        userCommentCount[user]++;
        totalComments++;
        
        emit CommentAdded(user, cardId, commentHash);
    }
    
    /**
     * @dev 获取用户今日卡片
     * @param user 用户地址
     * @return 卡片信息
     */
    function getTodayCard(address user) external view returns (Card memory) {
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        return userCards[user][today];
    }
    
    /**
     * @dev 获取卡片评论
     * @param cardId 卡片ID
     * @return 评论数组
     */
    function getCardComments(uint256 cardId) external view returns (Comment[] memory) {
        require(cardId > 0 && cardId <= totalCards, "Invalid card ID");
        return cardComments[cardId];
    }
    
    /**
     * @dev 获取用户历史卡片
     * @param user 用户地址
     * @param daysBack 往前多少天
     * @return 卡片数组
     */
    function getUserHistoryCards(address user, uint256 daysBack) external view returns (Card[] memory) {
        require(daysBack <= 365, "Cannot query more than 365 days");
        
        Card[] memory cards = new Card[](daysBack);
        uint256 today = block.timestamp / SECONDS_PER_DAY;
        
        for (uint256 i = 0; i < daysBack; i++) {
            uint256 checkDate = today - i;
            cards[i] = userCards[user][checkDate];
        }
        
        return cards;
    }
    
    /**
     * @dev 更新内容库大小（仅管理员）
     * @param newSize 新的大小
     */
    function updateContentLibrarySize(uint256 newSize) external onlyOwner {
        require(newSize > 0, "Size must be greater than 0");
        contentLibrarySize = newSize;
    }
    
    /**
     * @dev 获取合约统计信息
     */
    function getStats() external view returns (
        uint256 _totalCards,
        uint256 _totalComments,
        uint256 _contentLibrarySize
    ) {
        return (totalCards, totalComments, contentLibrarySize);
    }
} 