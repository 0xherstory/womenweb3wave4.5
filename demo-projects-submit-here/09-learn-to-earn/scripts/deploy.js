const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 部署代币合约
    const LearnToken = await ethers.getContractFactory("LearnToken");
    const token = await LearnToken.deploy();
    await token.deployed();
    console.log("LearnToken deployed to:", token.address);

    // 部署NFT合约
    const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
    const nft = await AchievementNFT.deploy();
    await nft.deployed();
    console.log("AchievementNFT deployed to:", nft.address);

    // 部署奖励系统
    const RewardSystem = await ethers.getContractFactory("RewardSystem");
    const rewardSystem = await RewardSystem.deploy(token.address, nft.address);
    await rewardSystem.deployed();
    console.log("RewardSystem deployed to:", rewardSystem.address);

    // 转移代币所有权到奖励系统
    await token.transferOwnership(rewardSystem.address);
    console.log("Transferred token ownership to RewardSystem");

    // 转移NFT所有权到奖励系统
    await nft.transferOwnership(rewardSystem.address);
    console.log("Transferred NFT ownership to RewardSystem");

    // 等待交易确认
    await new Promise(resolve => setTimeout(resolve, 5000));

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });