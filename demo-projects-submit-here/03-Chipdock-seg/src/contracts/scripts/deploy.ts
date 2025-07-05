import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const TreehouseToken = await ethers.getContractFactory("TreehouseTokenv0");

  const proxy = await upgrades.deployProxy(TreehouseToken, [deployer.address], {
    initializer: "initialize",
    kind: "uups",
  });

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();

  console.log("TreehouseTokenv0 deployed to (proxy):", proxyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
