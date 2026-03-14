import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import * as dotenv from "dotenv"
dotenv.config()
const config: HardhatUserConfig = {
  solidity: "0.8.25",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
  },
  etherscan: {
    apiKey: process.env.API_KEY || "",
  },
  sourcify: {
  enabled: true
},
};
export default config;