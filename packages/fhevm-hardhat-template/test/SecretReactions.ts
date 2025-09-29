import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { keccak256, toUtf8Bytes } from "ethers";

const ZERO = /^0x0{64}$/;

describe("SecretReactions (local/mock)", function () {
  before(function () {
    if (!fhevm.isMock) { console.warn("Skipping local/mock tests on non-mock env"); this.skip(); }
  });

  const postId = keccak256(toUtf8Bytes("hello-world"));
  const R_UP   = keccak256(toUtf8Bytes("thumbs_up"));
  const R_HEART= keccak256(toUtf8Bytes("heart"));

  it("deploys & starts zero", async () => {
    const f = await ethers.getContractFactory("SecretReactions");
    const app = await f.deploy();
    const h = await app.getTotal(postId, R_UP);
    expect(ZERO.test(h)).to.eq(true);
  });

  it("separate totals per reaction; latest reactor rule holds", async () => {
    const [a,b] = await ethers.getSigners();
    const f = await ethers.getContractFactory("SecretReactions");
    const app = await f.deploy();
    const addr = await app.getAddress();

    // a reacts 👍 +1
    let enc = await fhevm.createEncryptedInput(addr, a.address).add32(1).encrypt();
    await (await app.connect(a).react(postId, R_UP, enc.handles[0], enc.inputProof)).wait();

    // b reacts ❤️ +2
    enc = await fhevm.createEncryptedInput(addr, b.address).add32(2).encrypt();
    await (await app.connect(b).react(postId, R_HEART, enc.handles[0], enc.inputProof)).wait();

    const hUp = await app.getTotal(postId, R_UP);
    const upA = await fhevm.userDecryptEuint(FhevmType.euint32, hUp, addr, a);
    expect(upA).to.eq(1);

    let failed = false;
    try { await fhevm.userDecryptEuint(FhevmType.euint32, hUp, addr, b); } catch { failed = true; }
    expect(failed).to.eq(true);

    const hHeart = await app.getTotal(postId, R_HEART);
    const heartB = await fhevm.userDecryptEuint(FhevmType.euint32, hHeart, addr, b);
    expect(heartB).to.eq(2);
  });

  it("unlockView grants read on current total", async () => {
    const [a,b] = await ethers.getSigners();
    const f = await ethers.getContractFactory("SecretReactions");
    const app = await f.deploy();
    const addr = await app.getAddress();

    const enc = await fhevm.createEncryptedInput(addr, b.address).add32(3).encrypt();
    await (await app.connect(b).react(postId, R_UP, enc.handles[0], enc.inputProof)).wait();

    const h = await app.getTotal(postId, R_UP);
    let failed = false;
    try { await fhevm.userDecryptEuint(FhevmType.euint32, h, addr, a); } catch { failed = true; }
    expect(failed).to.eq(true);

    await (await app.connect(a).requestTotalAccess(postId, R_UP)).wait();
    const aDec = await fhevm.userDecryptEuint(FhevmType.euint32, h, addr, a);
    expect(aDec).to.eq(3);
  });

  it("my reaction tally is private per user", async () => {
    const [a] = await ethers.getSigners();
    const f = await ethers.getContractFactory("SecretReactions");
    const app = await f.deploy();
    const addr = await app.getAddress();

    const enc = await fhevm.createEncryptedInput(addr, a.address).add32(2).encrypt();
    await (await app.connect(a).react(postId, R_HEART, enc.handles[0], enc.inputProof)).wait();

    const mine = await app.connect(a).getMyTally(postId, R_HEART);
    const mDec = await fhevm.userDecryptEuint(FhevmType.euint32, mine, addr, a);
    expect(mDec).to.eq(2);
  });
});
