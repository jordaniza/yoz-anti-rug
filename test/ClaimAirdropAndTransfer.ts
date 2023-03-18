import { expect } from "chai";
import { ethers } from "hardhat";
import {
  TokenDistributor__factory,
  L2ArbitrumToken__factory,
  L2ArbitrumToken,
  TokenDistributor,
} from "../typechain-types";

// deploy the distributor

describe("Claim Airdrop and Transfer", () => {
  // let token: L2ArbitrumToken;
  // let distributor: TokenDistributor;

  // async function deployDistributor() {
  //   const distributorFactory = new TokenDistributor__factory();
  //   const tokenFactory = new L2ArbitrumToken__factory();
  //   const token = await tokenFactory.deploy();
  //   const distributor = await distributorFactory.deploy(
  //     token.address,
  //     ethers.constants.AddressZero,
  //     ethers.constants.AddressZero,
  //     0,
  //     0,
  //     ethers.constants.AddressZero
  //   );
  //   await distributor.deployed();
  //   return distributor;
  // }

  // beforeEach(async () => {
  //   distributor = await deployDistributor();
  //   token = L2ArbitrumToken__factory.connect(await distributor.token(), ethers.provider);
  // });

  it("Should deploy", async () => {
    const [owner] = await ethers.getSigners();

    const distributorFactory = new TokenDistributor__factory().connect(owner);
    const tokenFactory = new L2ArbitrumToken__factory().connect(owner);

    const token = await tokenFactory.deploy();

    const blockNumber = await distributorFactory.signer.provider?.getBlockNumber();

    if (blockNumber === undefined) {
      throw new Error("blockNumber is undefined");
    }

    const distributor = await distributorFactory.deploy(
      token.address,
      owner.address,
      owner.address,
      blockNumber + 10,
      blockNumber + 20,
      owner.address
    );
    await distributor.deployed();

    expect(distributor.address).to.not.eq(ethers.constants.AddressZero);
    expect(token.address).to.not.eq(ethers.constants.AddressZero);
  });
});
