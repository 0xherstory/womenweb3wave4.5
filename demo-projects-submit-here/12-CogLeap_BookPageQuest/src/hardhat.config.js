import "@nomicfoundation/hardhat-toolbox";

// 使用 dotenv 管理环境变量
import * as dotenv from "dotenv";
dotenv.config();

const { ALCHEMY_API_KEY, MUMBAI_PRIVATE_KEY, SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.19",
  networks: {
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${MUMBAI_PRIVATE_KEY}`]
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [`0x${SEPOLIA_PRIVATE_KEY}`]
    }
  }
}; 