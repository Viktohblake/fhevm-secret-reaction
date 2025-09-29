import { expect } from "chai";
import { ethers, fhevm, deployments } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { keccak256, toUtf8Bytes } from "ethers";

describe("SecretReactions (Sepolia)", function () {
  let addr: string;

  before(async function () {
    if (fhevm.isMock) { console.warn("Skipping Sepolia tests on mock env"); this.skip(); }
    const d = await deployments.get("SecretReactions"); // ensure deployed
    addr = d.address;
  });

  it("react +1 increases total by 1", async function () {
    this.timeout(4 * 60_000);
    const [alice] = await ethers.getSigners();
    const app = await ethers.getContractAt("SecretReactions", addr);
    const postId = keccak256(toUtf8Bytes(`hello-${Date.now()}`));
    const R_UP = keccak256(toUtf8Bytes("thumbs_up"));

    // warm-up +0
    let e0 = await fhevm.createEncryptedInput(addr, alice.address).add32(0).encrypt();
    await (await app.connect(alice).react(postId, R_UP, e0.handles[0], e0.inputProof)).wait();
    const h0 = await app.getTotal(postId, R_UP);
    const c0 = await fhevm.userDecryptEuint(FhevmType.euint32, h0, addr, alice);

    // +1
    const e1 = await fhevm.createEncryptedInput(addr, alice.address).add32(1).encrypt();
    await (await app.connect(alice).react(postId, R_UP, e1.handles[0], e1.inputProof)).wait();
    const h1 = await app.getTotal(postId, R_UP);
    const c1 = await fhevm.userDecryptEuint(FhevmType.euint32, h1, addr, alice);

    expect(Number(c1) - Number(c0)).to.eq(1);
  });
});
