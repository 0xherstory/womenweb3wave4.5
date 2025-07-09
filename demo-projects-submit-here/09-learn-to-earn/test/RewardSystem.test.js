const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardSystem", function () {
    let token, nft, rewardSystem;
    let owner, user;

    beforeEach(async () => {
        [owner, user] = await ethers.getSigners();

        const LearnToken = await ethers.getContractFactory("LearnToken");
        token = await LearnToken.deploy();
        await token.waitForDeployment();

        const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
        nft = await AchievementNFT.deploy(owner.address);
        await nft.waitForDeployment();

        const RewardSystem = await ethers.getContractFactory("RewardSystem");
        rewardSystem = await RewardSystem.deploy(
            await token.getAddress(), // 使用getAddress()获取实际地址
            await nft.getAddress()
        );  // 使用getAddress()获取实际地址);
        await rewardSystem.waitForDeployment(); // 添加等待部署完成

        // 使用合约实例的getAddress()方法
        const rewardSystemAddress = await rewardSystem.getAddress();
        await token.transfer(rewardSystem.address, transferAmount);

        await token.transferOwnership(rewardSystem.address);
        await nft.transferOwnership(rewardSystem.address);
    });

    it("应该正确奖励完成模块的用户", async function () {
        await rewardSystem.connect(user).completeModule("intro");
        await rewardSystem.connect(user).completeModule("advanced");

        const balance = await token.balanceOf(user.address);
        expect(balance).to.equal(100 * 10 ** 18);
    });

    it("应该发放成就NFT", async function () {
        await rewardSystem.connect(user).completeModule("intro");
        await rewardSystem.connect(user).completeModule("advanced");

        const achievements = await rewardSystem.userAchievements(user.address);
        expect(achievements.length).to.equal(1);
        expect(await nft.ownerOf(1)).to.equal(user.address);
    });
});