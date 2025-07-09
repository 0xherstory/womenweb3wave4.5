const hre = require("hardhat");

async function main() {
  console.log("正在准备部署合约...");

  // 部署 ARGToken 合约
  const argToken = await hre.ethers.deployContract("ARGToken");
  await argToken.waitForDeployment();
  console.log(`ARGToken (ARG) 合约已部署到地址: ${argToken.target}`);

  // 部署 AchievementNFT 合约
  const achievementNFT = await hre.ethers.deployContract("AchievementNFT");
  await achievementNFT.waitForDeployment();
  console.log(`AchievementNFT (SHA) 合约已部署到地址: ${achievementNFT.target}`);

  console.log("\n合约部署完成！");
  console.log("请将以上地址更新到前端配置文件中。");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 