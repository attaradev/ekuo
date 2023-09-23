import { expect } from "chai";
import { ethers } from "hardhat";
import { EkuoDAO, ERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("EkuoDAO", async function () {
  let ekuoDAO: EkuoDAO;
  let token: ERC20;
  let deployer: SignerWithAddress;
  let accounts: SignerWithAddress[];

  beforeEach(async () => {
    [deployer, ...accounts] = await ethers.getSigners();
    const ekuoDAOFactory = await ethers.getContractFactory("EkuoDAO");
    ekuoDAO = (await ekuoDAOFactory.deploy()) as EkuoDAO;
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

    it("Should allow members to submit proposals", async function () {
      await expect(
        ekuoDAO.submitProposal(
          "Test Proposal",
          "Test Proposal Description",
          accounts[1].address,
          ethers.utils.parseEther("500"),
        ),
      ).to.emit(ekuoDAO, "ProposalSubmitted");
    });
  });

  describe("Vote", async function () {
    it("Should not allow non members to vote on a proposal", async function () {
      await expect(ekuoDAO.connect(accounts[0]).vote(1, true)).to.revertedWith("Not member");
    });

    it("Should not allow members to vote for invalid proposals", async function () {
      await accounts[0].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      await expect(ekuoDAO.connect(accounts[0]).vote(1, true)).to.revertedWith("Invalid proposal ID");
    });

    it("Should allow members to vote on a proposal", async function () {
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await accounts[6].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("60"),
      });
      expect(await ekuoDAO.connect(accounts[6]).vote(BigInt("1"), true)).to.emit(ekuoDAO, "Vote");
    });
  });

  describe("Execute Proposal", async function () {
    it("Should allow members to execute proposal", async function () {
      await accounts[1].sendTransaction({
        to: ekuoDAO.address,
        value: ethers.utils.parseEther("600"),
      });
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );

      expect(await ekuoDAO.connect(accounts[1]).executeProposal(1))
        .to.emit(ekuoDAO, "ProposalExecuted")
        .withArgs(1, deployer.address);
    });

    it("Should not allow members to execute an invalid proposal", async function () {
      await expect(ekuoDAO.executeProposal(6)).to.be.revertedWith("Invalid proposal ID");
    });

    it("Should not allow members to execute an invalid proposal", async function () {
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await expect(ekuoDAO.executeProposal(5)).to.be.revertedWith("Invalid proposal ID");
    });
  });

  describe("Get Proposals", async function () {
    it("Should return a list of proposals", async function () {
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      await ekuoDAO.submitProposal(
        "Test Proposal",
        "Test Proposal Description",
        accounts[1].address,
        ethers.utils.parseEther("500"),
      );
      expect(await ekuoDAO.getLatestProposals()).to.have.lengthOf(5);
    });
  });
});
