import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { Signer } from "ethers";
import { Floppy, Vault } from "../typechain-types";

function parseEther(amount: number) {
  return ethers.parseUnits(amount.toString(), 18);
}

describe("Vault", () => {
  let owner: Signer;
  let alice: Signer;
  let bob: Signer;
  let carol: Signer;
  let vault: Vault;
  let token: Floppy;

  beforeEach(async () => {
    // Reset Hardhat network
    await ethers.provider.send("hardhat_reset", []);

    [owner, alice, bob, carol] = await ethers.getSigners();

    // Deploy Vault with initialOwner = owner.address
    const Vault = await ethers.getContractFactory("Vault", owner);
    vault = await Vault.deploy(await owner.getAddress());
    await vault.waitForDeployment();

    // Deploy Floppy token
    const Token = await ethers.getContractFactory("Floppy", owner);
    token = await Token.deploy();
    await token.waitForDeployment();

    // Set the vault's token
    await vault.setToken(token.getAddress());
  });
 /// happy Path
  it("Should deposit into the Vault", async () => {
    const aliceAddr = await alice.getAddress();
    const vaultAddr = await vault.getAddress();

    // Give alice some tokens and approve
    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));

    // Deposit
    await vault.connect(alice).deposit(parseEther(500_000));

    expect(await token.balanceOf(vaultAddr)).to.equal(parseEther(500_000));
  });

  it("Should withdraw", async () => {
    const aliceAddr = await alice.getAddress();
    const bobAddr = await bob.getAddress();
    const vaultAddr = await vault.getAddress();

    // Grant withdrawer role to Bob
    const WITHDRAWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WITHDRAWER_ROLE"));
    await vault.grantRole(WITHDRAWER_ROLE, bobAddr);

    // Enable withdraw & set max
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(1_000_000));

    // Alice deposits
    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));
    await vault.connect(alice).deposit(parseEther(500_000));

    // Bob withdraws to Alice
    await vault.connect(bob).withdraw(parseEther(300_000), aliceAddr);

    expect(await token.balanceOf(vaultAddr)).to.equal(parseEther(200_000));
    expect(await token.balanceOf(aliceAddr)).to.equal(parseEther(800_000));
  });
 /// Unhappy Path
  it("Should not deposit: Insufficient account balance", async () => {
    const aliceAddr = await alice.getAddress();
    const vaultAddr = await vault.getAddress();

    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));

    await expect(
      vault.connect(alice).deposit(parseEther(2_000_000))
    ).to.be.revertedWith("Insufficient account balance");
  });

  it("Should not withdraw: Withdraw is not available", async () => {
    const aliceAddr = await alice.getAddress();
    const bobAddr = await bob.getAddress();
    const vaultAddr = await vault.getAddress();
    const WITHDRAWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WITHDRAWER_ROLE"));

    await vault.grantRole(WITHDRAWER_ROLE, bobAddr);
    await vault.setWithdrawEnable(false);
    await vault.setMaxWithdrawAmount(parseEther(1_000_000));

    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));
    await vault.connect(alice).deposit(parseEther(500_000));

    await expect(
      vault.connect(bob).withdraw(parseEther(300_000), aliceAddr)
    ).to.be.revertedWith("Withdraw is not available");
  });

  it("Should not withdraw: Exceed maximum amount", async () => {
    const aliceAddr = await alice.getAddress();
    const bobAddr = await bob.getAddress();
    const vaultAddr = await vault.getAddress();
    const WITHDRAWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WITHDRAWER_ROLE"));

    await vault.grantRole(WITHDRAWER_ROLE, bobAddr);
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(1_000));

    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));
    await vault.connect(alice).deposit(parseEther(500_000));

    await expect(
      vault.connect(bob).withdraw(parseEther(2_000), aliceAddr)
    ).to.be.revertedWith("Exceed maximum amount");
  });

  it("Should not withdraw: Caller is not a withdrawer", async () => {
    const aliceAddr = await alice.getAddress();
    const carolAddr = await carol.getAddress();
    const vaultAddr = await vault.getAddress();
    const WITHDRAWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WITHDRAWER_ROLE"));

    await vault.grantRole(WITHDRAWER_ROLE, await bob.getAddress());
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(1_000));

    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));
    await vault.connect(alice).deposit(parseEther(500_000));

    await expect(
      vault.connect(carol).withdraw(parseEther(1_000), aliceAddr)
    ).to.be.revertedWith("Caller is not a withdrawer");
  });

  it("Should not withdraw: ERC20 transfer amount exceeds balance", async () => {
    const aliceAddr = await alice.getAddress();
    const bobAddr = await bob.getAddress();
    const vaultAddr = await vault.getAddress();
    const WITHDRAWER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WITHDRAWER_ROLE"));

    await vault.grantRole(WITHDRAWER_ROLE, bobAddr);
    await vault.setWithdrawEnable(true);
    await vault.setMaxWithdrawAmount(parseEther(5_000));

    await token.transfer(aliceAddr, parseEther(1_000_000));
    await token.connect(alice).approve(vaultAddr, parseEther(1_000_000));
    await vault.connect(alice).deposit(parseEther(2_000));

    await expect(
      vault.connect(bob).withdraw(parseEther(3_000), aliceAddr)
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
    // lưu ý dùng revertedWithCustomError(token, ...)
});
});
