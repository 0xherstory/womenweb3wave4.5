import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

describe("TreehouseTokenv0 (UUPS)", function () {
  let treehouse: any;
  let owner: any;
  let user: any;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    const TreehouseToken = await ethers.getContractFactory("TreehouseTokenv0");
    treehouse = await upgrades.deployProxy(TreehouseToken, [owner.address], {
      initializer: "initialize",
      kind: "uups",
    });

    await treehouse.waitForDeployment();
  });

  it("should mint a token with unique URI", async () => {
    const uri = "https://example.com/metadata1.json";
    const tx = await treehouse.connect(user).safeMint(uri, { value: 0 });
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);

    const tokenId = await treehouse.tokenOfOwnerByIndex(user.address, 0);
    const fetchedUri = await treehouse.tokenURI(tokenId);
    expect(fetchedUri).to.equal(uri);
  });

  it("should reject duplicate URI", async () => {
    const uri = "https://example.com/duplicate.json";
    await treehouse.connect(user).safeMint(uri, { value: 0 });

    await expect(
      treehouse.connect(user).safeMint(uri, { value: 0 })
    ).to.be.revertedWith("URI already exists - duplicate content not allowed");
  });

  it("owner can update mint fee", async () => {
    await treehouse.setMintFee(ethers.parseEther("0.01"));
    const fee = await treehouse.mintFee();
    expect(fee).to.equal(ethers.parseEther("0.01"));
  });

  it("non-owner cannot update mint fee", async () => {
    await expect(
      treehouse.connect(user).setMintFee(100)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
