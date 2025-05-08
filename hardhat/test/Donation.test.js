/* eslint-disable @typescript-eslint/no-require-imports */
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { network } = require("hardhat");

describe("DonationBox (Multi-Campaign)", function () {
  let donationBox, owner, addr1;
  let goal;
  const duration = 3600;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const DonationBox = await ethers.getContractFactory("DonationBox");
    donationBox = await DonationBox.deploy();
    await donationBox.waitForDeployment();

    goal = ethers.parseEther("1");
    await donationBox.createCampaign(goal, duration);
  });

  it("Kampanyaya bağış yapılmalı ve izlenmeli", async () => {
    const campaignId = 1;
    await donationBox.connect(addr1).donate(campaignId, {
      value: ethers.parseEther("0.5"),
    });

    const donated = await donationBox.connect(addr1).getMyDonation(campaignId);
    expect(donated).to.equal(ethers.parseEther("0.5"));
  });

  it("Zamanı geçmiş kampanyaya bağış yapılmamalı", async () => {
    const campaignId = 1;
    await network.provider.send("evm_increaseTime", [duration + 10]);
    await network.provider.send("evm_mine");

    await expect(
      donationBox.connect(addr1).donate(campaignId, {
        value: ethers.parseEther("0.1"),
      }),
    ).to.be.revertedWith("Kampanya aktif degil");
  });

  it("Hedefe ulaşıldığında sahibi çekebilmeli", async () => {
    const campaignId = 1;

    await donationBox.connect(addr1).donate(campaignId, {
      value: goal,
    });

    await expect(donationBox.connect(owner).withdraw(campaignId)).not.to.be
      .reverted;
  });

  it("Hedefe ulaşmadan para çekilememeli", async () => {
    const campaignId = 1;
    await expect(donationBox.withdraw(campaignId)).to.be.revertedWith(
      "Hedefe ulasilmadi",
    );
  });
});
