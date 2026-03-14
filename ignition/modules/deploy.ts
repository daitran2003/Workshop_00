import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployCrowdsale = buildModule("DeployCrowdsale", (m) => {

  const ethRate = 1000; // số token nhận được khi mua bằng ETH
  const usdtRate = 100; // số token nhận được khi mua bằng USDT

  const wallet = "0x3598EC75533a49C56A8DfE40ae0694688F7E19C2"; // ví nhận ETH/USDT
  const token = "0x386E1789c3030B5C0500a4e16c467fb4A4680B07"; // địa chỉ Floppy token
  const owner = "0xD6273487c12706f83f9ea299Bd130DbEAe0349d0"; // owner contract

  const flpCrowdsale = m.contract("FLPCrowdSale", [
    ethRate,
    usdtRate,
    wallet,
    token,
    owner,
  ]);

  return { flpCrowdsale };
});

export default DeployCrowdsale;