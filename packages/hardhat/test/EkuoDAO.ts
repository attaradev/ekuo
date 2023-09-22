import { expect } from "chai";
import { ethers } from "hardhat";
import { EkuoDAO, ERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("EkuoDAO", async function () {
  let ekuoDAO: EkuoDAO;
  let token: ERC20;
  const [deployer, ...accounts]: SignerWithAddress[] = await ethers.getSigners();

  before(async () => {
    const ekuoDAOFactory = await ethers.getContractFactory("EkuoDAO");
    ekuoDAO = (await ekuoDAOFactory.deploy(1)) as EkuoDAO;
    await ekuoDAO.deployed();
    token = await ethers.getContractAt("ERC20", await ekuoDAO.tokenAddress());
  });

  describe("Deployment", function () {
    it("Should mint 100,000,000 EKUO tokens", async function () {
      expect(await token.totalSupply()).to.equal(ethers.utils.parseEther("100000000"));
    });

    it("Should transfer 10,000,000 EKUO tokens to the deployer", async function () {
      expect(await token.balanceOf(deployer.address)).to.equal(ethers.utils.parseEther("10000000"));
    });
  });

  describe("Receive", function () {
    it("Should receive and send EKUO tokens to sender", async function () {
      expect(await token.balanceOf(accounts[0].address)).to.equal(ethers.utils.parseEther("0"));
      await accounts[0].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("10"),
      });
      expect(await token.balanceOf(accounts[0].address)).to.equal(ethers.utils.parseEther("10"));
    });
  });

  describe("Submit Proposal", async function () {
    it("Should not allow non members to submit proposals", async function () {
      await expect(
        ekuoDAO
          .connect(accounts[1])
          .submitProposal(
            "Test Proposal",
            "Test Proposal Description",
            accounts[1].address,
            ethers.utils.parseEther("1000"),
          ),
      ).to.be.revertedWith("Not member");
    });

    it("Should not allow members to submit proposals with invalid amount", async function () {
      await expect(
        ekuoDAO.submitProposal(
          "Test Proposal",
          "Test Proposal Description",
          accounts[1].address,
          ethers.utils.parseEther("100000000"),
        ),
      ).to.be.revertedWith("Amount too high");
      await expect(
        ekuoDAO.submitProposal(
          "Test Proposal",
          "Test Proposal Description",
          accounts[1].address,
          ethers.utils.parseEther("50"),
        ),
      ).to.be.revertedWith("Amount too low");
    });
  });

  describe("Vote", async function () {
    beforeEach(async () => {
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await accounts[1].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await accounts[4].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await accounts[5].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
    });

    it("Should not allow non members to vote on a proposal", async function () {
      await expect(ekuoDAO.connect(accounts[3]).vote(1, true)).to.revertedWith("Not member");
    });

    it("Should not allow members to vote for invalid proposals", async function () {
      await expect(ekuoDAO.connect(accounts[4]).vote(5, true)).to.revertedWith("Invalid proposal ID");
    });

    it("Should not allow members to vote twice", async function () {
      await ekuoDAO.connect(accounts[1]).vote(1, true);
      await expect(ekuoDAO.connect(accounts[1]).vote(1, true)).to.revertedWith("Already voted");
    });

    it("Should allow members to vote on a proposal", async function () {
      await accounts[6].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });

      expect(await ekuoDAO.connect(accounts[6]).vote(1, true))
        .to.emit(ekuoDAO, "Vote")
        .withArgs(1, accounts[6].address, true);
    });
  });

  describe("Execute Proposal", async function () {
    it("Should allow members to execute proposal", async function () {
      await accounts[1].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await accounts[4].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await accounts[5].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await accounts[6].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await ekuoDAO
        .connect(accounts[6])
        .submitProposal(
          "Test Proposal",
          "Test Proposal Description",
          accounts[1].address,
          ethers.utils.parseEther("500"),
        );

      expect(await ekuoDAO.executeProposal(1))
        .to.emit(ekuoDAO, "ProposalExecuted")
        .withArgs(1, deployer.address);
    });

    it("Should not allow members to execute an invalid proposal", async function () {
      await expect(ekuoDAO.executeProposal(6)).to.be.revertedWith("Invalid proposal ID");
    });

    it("Should not allow members to execute an invalid proposal", async function () {
      await ekuoDAO
        .connect(accounts[5])
        .submitProposal(
          "Test Proposal",
          "Test Proposal Description",
          accounts[1].address,
          ethers.utils.parseEther("500"),
        );
      await expect(ekuoDAO.executeProposal(5)).to.be.revertedWith("Quorum not reached");
    });
  });
});
