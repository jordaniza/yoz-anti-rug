import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers, upgrades } from "hardhat";
import {
  TokenDistributor__factory,
  L2ArbitrumToken__factory,
  L2ArbitrumToken,
  TokenDistributor,
} from "../typechain-types";

// deploy the distributor
async function deployDistributor() {
  const [owner] = await ethers.getSigners();

  const distributorFactory = new TokenDistributor__factory().connect(owner);
  const tokenFactory = new L2ArbitrumToken__factory().connect(owner);
  const token = await upgrades.deployProxy(
    tokenFactory,
    [owner.address, ethers.utils.parseEther((1e6).toString()), owner.address],
    { unsafeAllow: ["constructor"] }
  );
  const blockNumber = await distributorFactory.signer.provider?.getBlockNumber();

  if (blockNumber === undefined) {
    throw new Error("blockNumber is undefined");
  }

  const distributor = await distributorFactory.deploy(
    token.address,
    owner.address,
    owner.address,
    blockNumber + 10,
    blockNumber + 10_000,
    owner.address
  );
  await distributor.deployed();
  return distributor;
}

describe("Claim Airdrop and Transfer", () => {
  let token: L2ArbitrumToken;
  let distributor: TokenDistributor;
  let [owner, recipient] = [] as unknown as SignerWithAddress[];

  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();

    distributor = await deployDistributor();
    token = L2ArbitrumToken__factory.connect(await distributor.token(), owner);
  });

  it("Should deploy", async () => {
    expect(distributor.address).to.not.eq(ethers.constants.AddressZero);
    expect(token.address).to.not.eq(ethers.constants.AddressZero);
  });

  it("lets us set an address with an airdrop", async () => {
    await token.transfer(distributor.address, await token.balanceOf(owner.address));
    await distributor.setRecipients([recipient.address], [ethers.utils.parseEther("1000")]);

    const claimable = await distributor.claimableTokens(recipient.address);
    expect(claimable).to.eq(ethers.utils.parseEther("1000"));
  });

  it("lets us claim an airdrop", async () => {
    await token.transfer(distributor.address, await token.balanceOf(owner.address));
    await distributor.setRecipients([recipient.address], [ethers.utils.parseEther("1000")]);

    const block = await distributor.claimPeriodStart();
    // fast forward to the claim block
    await mine(block.add(100));

    await distributor.connect(recipient).claim();

    const claimableAfter = await distributor.claimableTokens(recipient.address);
    expect(claimableAfter).to.eq(0);

    const balance = await token.balanceOf(recipient.address);
    expect(balance).to.eq(ethers.utils.parseEther("1000"));
  });
});
