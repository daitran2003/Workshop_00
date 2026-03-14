import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FloppyModule", (m) => {
  const floppy = m.contract("Floppy");
  return { floppy };
});