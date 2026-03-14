import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VaultModule", (m) => {
  const token = m.contract("Floppy");
  const vault = m.contract("Vault", [m.getAccount(0)]);

  m.call(vault, "setToken", [token]);

  return { token, vault };
});