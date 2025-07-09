const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners(); // 获取部署合约的账户
    console.log("Deploying contracts with the account:", deployer.address);

    // 连接到已部署的 LearnToken 合约
    const LearnToken = await ethers.getContractAt(
        "LearnToken", // 合约名称
        "0xB6A3891E649A08085cca6c27F2bd3b7C999d1459" // 已部署的 LearnToken 合约地址
    );

    // 查询 deployer 地址的余额
    const balance = await LearnToken.balanceOf(deployer.address);
    console.log("Deployer's balance:", ethers.utils.formatUnits(balance, 18)); // 格式化为正常的数字（18 小数位）
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
