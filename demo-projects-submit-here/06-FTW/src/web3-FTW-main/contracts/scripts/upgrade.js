// 升级脚本 - 用于部署新的实现合约
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("开始升级合约...");

  // 1. 获取工厂合约地址（从.env文件或命令行参数）
  const factoryAddress = process.env.FACTORY_ADDRESS;
  if (!factoryAddress) {
    console.error("请设置FACTORY_ADDRESS环境变量");
    process.exit(1);
  }

  // 2. 部署新的实现合约
  const CampImplementation = await ethers.getContractFactory("CampImplementation");
  const newImplementation = await CampImplementation.deploy();
  await newImplementation.deployed();
  console.log("新的CampImplementation已部署到:", newImplementation.address);

  // 3. 获取工厂合约实例
  const CampFactory = await ethers.getContractFactory("CampFactory");
  const factory = CampFactory.attach(factoryAddress);

  // 4. 更新工厂合约中的实现合约地址
  // 注意：工厂合约需要有updateImplementation方法，如果没有，需要先修改工厂合约
  try {
    const tx = await factory.updateImplementation(newImplementation.address);
    await tx.wait();
    console.log("工厂合约已更新为使用新的实现合约");
  } catch (error) {
    console.error("更新工厂合约失败。可能需要手动部署新的工厂合约:", error.message);
    
    // 如果工厂合约没有更新方法，可以部署新的工厂合约
    console.log("正在部署新的工厂合约...");
    const newFactory = await CampFactory.deploy(newImplementation.address);
    await newFactory.deployed();
    console.log("新的CampFactory已部署到:", newFactory.address);
    console.log("请更新前端和后端中的工厂合约地址");
  }

  // 5. 复制ABI文件到前端和后端
  copyAbiFiles();

  console.log("合约升级完成!");
}

// 复制ABI文件到前端和后端
function copyAbiFiles() {
  const projectRoot = path.resolve(__dirname, '../..');
  
  // 源文件路径
  const campAbiPath = path.join(projectRoot, 'contracts/artifacts/solidity/CampImplementation.sol/CampImplementation.json');
  const factoryAbiPath = path.join(projectRoot, 'contracts/artifacts/solidity/CampFactory.sol/CampFactory.json');
  
  // 目标路径
  const clientAbisDir = path.join(projectRoot, 'client/src/abis');
  const serverAbisDir = path.join(projectRoot, 'server/abis');
  
  // 确保目录存在
  if (!fs.existsSync(clientAbisDir)) {
    fs.mkdirSync(clientAbisDir, { recursive: true });
  }
  if (!fs.existsSync(serverAbisDir)) {
    fs.mkdirSync(serverAbisDir, { recursive: true });
  }
  
  // 读取ABI文件
  const campAbi = JSON.parse(fs.readFileSync(campAbiPath, 'utf8'));
  const factoryAbi = JSON.parse(fs.readFileSync(factoryAbiPath, 'utf8'));
  
  // 创建简化版ABI文件（只包含ABI部分）
  const campAbiSimple = JSON.stringify(campAbi.abi, null, 2);
  const factoryAbiSimple = JSON.stringify(factoryAbi.abi, null, 2);
  
  // 写入前端ABI文件
  fs.writeFileSync(path.join(clientAbisDir, 'Camp.json'), campAbiSimple);
  fs.writeFileSync(path.join(clientAbisDir, 'CampFactory.json'), factoryAbiSimple);
  
  // 写入后端ABI文件
  fs.writeFileSync(path.join(serverAbisDir, 'Camp.json'), campAbiSimple);
  fs.writeFileSync(path.join(serverAbisDir, 'CampFactory.json'), factoryAbiSimple);
  
  console.log('ABI文件已复制到前端和后端目录');
}

// 运行升级
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 