const hre = require("hardhat");

async function main() {
  console.log("🚀 开始部署每日鼓励卡片智能合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.utils.formatEther(await deployer.getBalance()));

  // 部署合约
  const DailyInspirationCard = await hre.ethers.getContractFactory("DailyInspirationCard");
  const dailyInspirationCard = await DailyInspirationCard.deploy();
  
  await dailyInspirationCard.deployed();

  console.log("✅ 每日鼓励卡片合约已部署到:", dailyInspirationCard.address);
  console.log("📊 合约所有者:", await dailyInspirationCard.owner());
  
  // 验证部署
  const totalCards = await dailyInspirationCard.totalCards();
  const totalComments = await dailyInspirationCard.totalComments();
  const contentLibrarySize = await dailyInspirationCard.contentLibrarySize();
  
  console.log("📈 初始统计:");
  console.log("   - 总卡片数:", totalCards.toString());
  console.log("   - 总评论数:", totalComments.toString());
  console.log("   - 内容库大小:", contentLibrarySize.toString());

  // 保存部署信息
  const deploymentInfo = {
    contractAddress: dailyInspirationCard.address,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    blockNumber: await dailyInspirationCard.deployTransaction.blockNumber
  };

  console.log("💾 部署信息已保存");
  console.log("🎉 部署完成！");
  
  return dailyInspirationCard;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 