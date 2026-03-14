import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("USDTModule", (m) => {
  const usdt = m.contract("USDT");
  return { usdt };
});