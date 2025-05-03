/* eslint-disable @typescript-eslint/no-require-imports */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationBox (Multi-Campaign)", function () {
  let donationBox, owner, addr1;
  let goal;
  const duration = 3600;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const DonationBox = await ethers.getContractFactory("DonationBox");
    donationBox = await DonationBox.deploy();
    await donationBox.waitForDeployment();

    goal = ethers.utils.parseEther("1");
    await donationBox.createCampaign(goal, duration);
  });

  it("Kampanyaya bağış yapılmalı ve izlenmeli", async () => {
    const campaignId = 1;
    await donationBox.connect(addr1).donate(campaignId, {
      value: ethers.utils.parseEther("0.5"),
    });

    const donated = await donationBox.getMyDonation(campaignId);
    expect(donated).to.equal(ethers.utils.parseEther("0.5"));
  });

  it("Zamanı geçmiş kampanyaya bağış yapılmamalı", async () => {
    const campaignId = 1;
    await network.provider.send("evm_increaseTime", [duration + 10]);
    await network.provider.send("evm_mine");

    await expect(
      donationBox.connect(addr1).donate(campaignId, {
        value: ethers.utils.parseEther("0.1"),
      }),
    ).to.be.revertedWith("Campaign not active");
  });

  it("Hedefe ulaşıldığında sahibi çekebilmeli", async () => {
    const campaignId = 1;

    await donationBox.connect(addr1).donate(campaignId, {
      value: goal,
    });

    const before = await ethers.provider.getBalance(owner.address);
    const tx = await donationBox.withdraw(campaignId);
    const receipt = await tx.wait();
    const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    const after = await ethers.provider.getBalance(owner.address);

    expect(after).to.be.above(before.sub(gas));
  });

  it("Hedefe ulaşmadan para çekilememeli", async () => {
    const campaignId = 1;
    await expect(donationBox.withdraw(campaignId)).to.be.revertedWith(
      "Goal not reached",
    );
  });
});
