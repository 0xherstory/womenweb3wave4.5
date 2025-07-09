const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DailyInspirationCard", function () {
  let DailyInspirationCard;
  let dailyInspirationCard;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    DailyInspirationCard = await ethers.getContractFactory("DailyInspirationCard");
    dailyInspirationCard = await DailyInspirationCard.deploy();
    await dailyInspirationCard.deployed();
  });

  describe("部署", function () {
    it("应该正确部署合约", async function () {
      expect(await dailyInspirationCard.owner()).to.equal(owner.address);
      expect(await dailyInspirationCard.totalCards()).to.equal(0);
      expect(await dailyInspirationCard.totalComments()).to.equal(0);
      expect(await dailyInspirationCard.contentLibrarySize()).to.equal(100);
    });
  });

  describe("生成每日卡片", function () {
    it("用户应该能够生成每日卡片", async function () {
      const contentIndex = 5;
      
      await expect(dailyInspirationCard.connect(user1).generateDailyCard(contentIndex))
        .to.emit(dailyInspirationCard, "CardGenerated")
        .withArgs(user1.address, 1, await ethers.provider.getBlock("latest").then(b => b.timestamp));
      
      expect(await dailyInspirationCard.totalCards()).to.equal(1);
    });

    it("用户每天只能生成一张卡片", async function () {
      const contentIndex = 5;
      
      await dailyInspirationCard.connect(user1).generateDailyCard(contentIndex);
      
      await expect(dailyInspirationCard.connect(user1).generateDailyCard(contentIndex))
        .to.be.revertedWith("Card already generated today");
    });

    it("内容索引应该在有效范围内", async function () {
      const invalidIndex = 150;
      
      await expect(dailyInspirationCard.connect(user1).generateDailyCard(invalidIndex))
        .to.be.revertedWith("Invalid content index");
    });
  });

  describe("添加评论", function () {
    beforeEach(async function () {
      await dailyInspirationCard.connect(user1).generateDailyCard(5);
    });

    it("用户应该能够为自己的卡片添加评论", async function () {
      const cardId = 1;
      const commentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("测试评论"));
      
      await expect(dailyInspirationCard.connect(user1).addComment(cardId, commentHash))
        .to.emit(dailyInspirationCard, "CommentAdded")
        .withArgs(user1.address, cardId, commentHash);
      
      expect(await dailyInspirationCard.totalComments()).to.equal(1);
    });

    it("用户不能为别人的卡片添加评论", async function () {
      const cardId = 1;
      const commentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("测试评论"));
      
      await expect(dailyInspirationCard.connect(user2).addComment(cardId, commentHash))
        .to.be.revertedWith("You can only comment on your own cards");
    });

    it("用户不能重复评论同一张卡片", async function () {
      const cardId = 1;
      const commentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("测试评论"));
      
      await dailyInspirationCard.connect(user1).addComment(cardId, commentHash);
      
      await expect(dailyInspirationCard.connect(user1).addComment(cardId, commentHash))
        .to.be.revertedWith("Already commented on this card");
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      await dailyInspirationCard.connect(user1).generateDailyCard(5);
      await dailyInspirationCard.connect(user2).generateDailyCard(3);
    });

    it("应该能够获取用户今日卡片", async function () {
      const todayCard = await dailyInspirationCard.getTodayCard(user1.address);
      
      expect(todayCard.cardId).to.equal(1);
      expect(todayCard.user).to.equal(user1.address);
      expect(todayCard.contentIndex).to.equal(5);
      expect(todayCard.exists).to.be.true;
    });

    it("应该能够获取卡片评论", async function () {
      const cardId = 1;
      const commentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("测试评论"));
      
      await dailyInspirationCard.connect(user1).addComment(cardId, commentHash);
      
      const comments = await dailyInspirationCard.getCardComments(cardId);
      
      expect(comments.length).to.equal(1);
      expect(comments[0].commentHash).to.equal(commentHash);
      expect(comments[0].user).to.equal(user1.address);
    });
  });

  describe("管理员功能", function () {
    it("只有管理员能够更新内容库大小", async function () {
      const newSize = 200;
      
      await dailyInspirationCard.updateContentLibrarySize(newSize);
      expect(await dailyInspirationCard.contentLibrarySize()).to.equal(newSize);
    });

    it("非管理员不能更新内容库大小", async function () {
      const newSize = 200;
      
      await expect(dailyInspirationCard.connect(user1).updateContentLibrarySize(newSize))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
}); 