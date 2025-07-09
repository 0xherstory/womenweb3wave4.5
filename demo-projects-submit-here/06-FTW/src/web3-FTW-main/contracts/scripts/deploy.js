// 部署脚本
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("开始部署合约...");

  // 1. 部署实现合约
  const CampImplementation = await ethers.getContractFactory("CampImplementation");
  const campImplementation = await CampImplementation.deploy();
  await campImplementation.deployed();
  console.log("CampImplementation 已部署到:", campImplementation.address);

  // 2. 部署工厂合约
  const CampFactory = await ethers.getContractFactory("CampFactory");
  const campFactory = await CampFactory.deploy(campImplementation.address);
  await campFactory.deployed();
  console.log("CampFactory 已部署到:", campFactory.address);

  // 3. 复制ABI文件到前端和后端
  try {
    const copied = copyAbiFiles();
    if (copied) {
      console.log("ABI文件已成功复制到前端和后端目录");
    } else {
      console.log("ABI文件复制失败，请手动复制");
    }
  } catch (error) {
    console.error("复制ABI文件时出错:", error.message);
    console.log("请手动复制ABI文件");
  }

  console.log("合约部署完成!");
}

// 复制ABI文件到前端和后端
function copyAbiFiles() {
  try {
    // 正确设置项目根目录（向上两级）
    const projectRoot = path.resolve(__dirname, '../..');
    console.log("项目根目录:", projectRoot);
    
    // 源文件路径（修复路径，移除重复的contracts部分）
    const campAbiPath = path.join(projectRoot, 'contracts/artifacts/solidity/CampImplementation.sol/CampImplementation.json');
    const factoryAbiPath = path.join(projectRoot, 'contracts/artifacts/solidity/CampFactory.sol/CampFactory.json');
    
    console.log("检查源文件:");
    console.log("- CampImplementation路径:", campAbiPath);
    console.log("- CampImplementation存在:", fs.existsSync(campAbiPath));
    console.log("- CampFactory路径:", factoryAbiPath);
    console.log("- CampFactory存在:", fs.existsSync(factoryAbiPath));
    
    // 如果源文件不存在，抛出错误
    if (!fs.existsSync(campAbiPath) || !fs.existsSync(factoryAbiPath)) {
      throw new Error("源ABI文件不存在，请确保合约已成功编译");
    }
    
    // 目标路径
    const clientAbisDir = path.join(projectRoot, 'client/src/abis');
    const serverAbisDir = path.join(projectRoot, 'server/abis');
    
    console.log("目标目录:");
    console.log("- 前端ABI目录:", clientAbisDir);
    console.log("- 后端ABI目录:", serverAbisDir);
    
    // 确保目录存在
    if (!fs.existsSync(clientAbisDir)) {
      fs.mkdirSync(clientAbisDir, { recursive: true });
      console.log("- 创建前端ABI目录");
    }
    if (!fs.existsSync(serverAbisDir)) {
      fs.mkdirSync(serverAbisDir, { recursive: true });
      console.log("- 创建后端ABI目录");
    }
    
    // 目标文件路径
    const clientCampPath = path.join(clientAbisDir, 'CampImplementation.json');
    const clientFactoryPath = path.join(clientAbisDir, 'CampFactory.json');
    const serverCampPath = path.join(serverAbisDir, 'CampImplementation.json');
    const serverFactoryPath = path.join(serverAbisDir, 'CampFactory.json');
    
    // 删除旧的ABI文件（如果存在）
    console.log("清理旧的ABI文件:");
    const filesToDelete = [
      clientCampPath,
      clientFactoryPath,
      serverCampPath,
      serverFactoryPath,
      // 删除旧的Camp.json文件（如果存在）
      path.join(clientAbisDir, 'Camp.json'),
      path.join(serverAbisDir, 'Camp.json')
    ];
    
    filesToDelete.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`- 已删除: ${file}`);
        } catch (err) {
          console.error(`- 删除失败: ${file}`, err);
        }
      }
    });
    
    // 读取ABI文件
    const campAbi = JSON.parse(fs.readFileSync(campAbiPath, 'utf8'));
    const factoryAbi = JSON.parse(fs.readFileSync(factoryAbiPath, 'utf8'));
    
    // 创建简化版ABI文件（只包含ABI部分）
    const campAbiSimple = JSON.stringify(campAbi.abi, null, 2);
    const factoryAbiSimple = JSON.stringify(factoryAbi.abi, null, 2);
    
    // 写入前端ABI文件 - 使用与源文件一致的命名
    fs.writeFileSync(clientCampPath, campAbiSimple);
    fs.writeFileSync(clientFactoryPath, factoryAbiSimple);
    console.log("- 已写入前端ABI文件");
    
    // 写入后端ABI文件 - 使用与源文件一致的命名
    fs.writeFileSync(serverCampPath, campAbiSimple);
    fs.writeFileSync(serverFactoryPath, factoryAbiSimple);
    console.log("- 已写入后端ABI文件");
    
    // 验证文件是否成功写入
    const success = fs.existsSync(clientCampPath) && 
                   fs.existsSync(clientFactoryPath) &&
                   fs.existsSync(serverCampPath) && 
                   fs.existsSync(serverFactoryPath);
    
    if (success) {
      console.log("验证: 所有ABI文件已成功写入");
      return true;
    } else {
      console.log("验证: 部分ABI文件写入失败");
      return false;
    }
  } catch (error) {
    console.error("复制ABI文件过程中出错:", error);
    return false;
  }
}

// 运行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 