const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Camp 合约测试", function () {
  let CampFactory;
  let campFactory;
  let Camp;
  let camp;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // 获取测试账户
    [owner, user1, user2] = await ethers.getSigners();

    // 部署 CampFactory 合约
    CampFactory = await ethers.getContractFactory("CampFactory");
    campFactory = await CampFactory.deploy();
    await campFactory.deployed();

    // 创建一个新的营地
    const campName = "测试营地";
    const description = "这是一个测试营地";
    const startTime = Math.floor(Date.now() / 1000) + 3600; // 一小时后开始
    const endTime = startTime + 86400; // 一天后结束
    const registrationFee = ethers.utils.parseEther("0.01");
    
    await campFactory.createCamp(
      campName,
      description,
      startTime,
      endTime,
      registrationFee
    );

    // 获取新创建的营地地址
    const campAddress = await campFactory.camps(0);
    
    // 连接到营地合约
    Camp = await ethers.getContractFactory("Camp");
    camp = await Camp.attach(campAddress);
  });

  it("应该正确设置营地信息", async function () {
    const campInfo = await camp.getCampInfo();
    
    expect(campInfo.name).to.equal("测试营地");
    expect(campInfo.description).to.equal("这是一个测试营地");
    expect(campInfo.owner).to.equal(owner.address);
  });

  it("用户应该能够注册营地", async function () {
    const registrationFee = await camp.registrationFee();
    
    // 用户1注册营地
    await camp.connect(user1).register({ value: registrationFee });
    
    // 检查用户是否已注册
    const isRegistered = await camp.isParticipant(user1.address);
    expect(isRegistered).to.be.true;
    
    // 检查参与者数量
    const participantCount = await camp.getParticipantCount();
    expect(participantCount).to.equal(1);
  });

  it("不允许重复注册", async function () {
    const registrationFee = await camp.registrationFee();
    
    // 用户1注册营地
    await camp.connect(user1).register({ value: registrationFee });
    
    // 尝试重复注册应该失败
    await expect(
      camp.connect(user1).register({ value: registrationFee })
    ).to.be.revertedWith("已经注册");
  });

  it("不允许支付错误的注册费", async function () {
    const wrongFee = ethers.utils.parseEther("0.005"); // 错误的注册费
    
    // 尝试用错误的费用注册应该失败
    await expect(
      camp.connect(user1).register({ value: wrongFee })
    ).to.be.revertedWith("注册费用不正确");
  });
}); 