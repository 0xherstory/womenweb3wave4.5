// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev 这是ERC20代币标准的接口。为了让我们的合约能与任何ERC20代币（如USDC）交互，
 * 我们需要这个接口来调用其标准函数，如 transfer, transferFrom 等。
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ProofOfImpactNFT
 * @notice 这是一个简化的ERC721合约，用于铸造“影响力证明”NFT。
 * 在真实项目中，通常会使用OpenZeppelin的标准化实现。
 * 这个合约的铸造权被严格限制，只有受信任的Campaign合约才能调用。
 */
contract // SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev 这是ERC20代币标准的接口。为了让我们的合约能与任何ERC20代币（如USDC）交互，
 * 我们需要这个接口来调用其标准函数，如 transfer, transferFrom 等。
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title ProofOfImpactNFT
 * @notice 这是一个简化的ERC721合约，用于铸造“影响力证明”NFT。
 * 在真实项目中，通常会使用OpenZeppelin的标准化实现。
 * 这个合约的铸造权被严格限制，只有受信任的Campaign合约才能调用。
 */
contract ProofOfImpactNFT {
    string public name;
    string public symbol;
    uint256 private _tokenIdCounter;

    // 映射：Token ID -> 拥有者地址
    mapping(uint256 => address) private _owners;
    // 映射：地址 -> 拥有的Token数量
    mapping(address => uint256) private _balances;
    // 映射：Token ID -> 授权地址
    mapping(uint256 => address) private _tokenApprovals;

    // 拥有者地址，只有他能授权新的“铸造者”（Campaign合约）
    address public owner;

    // 映射：被授权可以铸造NFT的地址（通常是Campaign合约地址）
    mapping(address => bool) public minters;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NFT: Caller is not the owner");
        _;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "NFT: Caller is not an authorized minter");
        _;
    }

    /**
     * @dev 授权或撤销一个地址的铸造权限。
     */
    function setMinter(address _minter, bool _status) external onlyOwner {
        minters[_minter] = _status;
    }

    /**
     * @dev 核心的铸造函数，只能由被授权的minter调用。
     * @param to NFT接收者的地址
     */
    function safeMint(address to, string memory /* uri */) external onlyMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mint(to, tokenId);
        // 在真实的ERC721中，会有一个函数来设置tokenURI
        // 这里我们简化处理，可以通过事件来记录URI
        return tokenId;
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(_owners[tokenId] == address(0), "ERC721: token already minted");

        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return _balances[_owner];
    }
}


/**
 * @title Campaign
 * @notice 这是为单个求助项目创建的募款合约。它负责接收捐款、管理里程碑和按需拨款。
 * 它在项目完成后，有权调用NFT合约为捐款人铸造徽章。
 */
contract Campaign {
    address public immutable beneficiary;
    uint public immutable fundingGoal;
    IERC20 public immutable token;
    address public immutable factory; // 工厂合约地址，扮演管理者的角色
    ProofOfImpactNFT public immutable impactNFT; // 影响力NFT合约地址

    uint public totalRaised;
    mapping(address => uint) public contributions;
    address[] public donors; // 捐款人列表，用于发NFT

    struct Milestone {
        string description;
        uint amount;
        bool released;
    }
    Milestone[] public milestones;
    uint public releasedAmount; // 已释放的总金额

    bool public isFinalized; // 项目是否已最终完成

    event Donated(address indexed donor, uint amount);
    event MilestoneCreated(uint indexed milestoneId, string description, uint amount);
    event MilestoneReleased(uint indexed milestoneId);
    event CampaignFinalized(address indexed campaignAddress);

    modifier onlyFactory() {
        require(msg.sender == factory, "Campaign: Caller is not the factory");
        _;
    }

    constructor(
        address _beneficiary,
        uint _fundingGoal,
        address _tokenAddress,
        address _factory,
        address _nftAddress
    ) {
        beneficiary = _beneficiary;
        fundingGoal = _fundingGoal;
        token = IERC20(_tokenAddress);
        factory = _factory;
        impactNFT = ProofOfImpactNFT(_nftAddress);
    }

    function donate(uint _amount) external {
        require(totalRaised < fundingGoal, "Campaign: Goal already reached");
        require(_amount > 0, "Campaign: Donation must be > 0");

        if (contributions[msg.sender] == 0) {
            donors.push(msg.sender);
        }
        
        contributions[msg.sender] += _amount;
        totalRaised += _amount;

        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        emit Donated(msg.sender, _amount);
    }

    function createMilestone(string memory _description, uint _amount) external onlyFactory {
        require(totalRaised >= fundingGoal, "Campaign: Funding goal not yet reached");
        milestones.push(Milestone({
            description: _description,
            amount: _amount,
            released: false
        }));
        emit MilestoneCreated(milestones.length - 1, _description, _amount);
    }

    function releaseMilestoneFunds(uint _milestoneId) external onlyFactory {
        require(_milestoneId < milestones.length, "Campaign: Milestone does not exist");
        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.released, "Campaign: Milestone already released");

        milestone.released = true;
        releasedAmount += milestone.amount;
        token.transfer(beneficiary, milestone.amount);

        emit MilestoneReleased(_milestoneId);
    }

    /**
     * @dev 当所有里程碑都完成后，工厂可以调用此函数来最终确定项目，并为捐款人铸造NFT。
     */
    function finalizeAndMintNFTs() external onlyFactory {
        require(!isFinalized, "Campaign: Already finalized");
        // 确保所有里程碑都已释放
        uint totalMilestoneAmount = 0;
        for (uint i = 0; i < milestones.length; i++) {
            require(milestones[i].released, "Campaign: Not all milestones are released");
            totalMilestoneAmount += milestones[i].amount;
        }
        
        isFinalized = true;

        // 授权本合约成为NFT合约的铸造者
        impactNFT.setMinter(address(this), true);

        // 为每一位捐款人铸造NFT
        for (uint i = 0; i < donors.length; i++) {
            // 在实际应用中，每个NFT的URI可以不同，指向特定的元数据
            string memory tokenURI = "ipfs://your_metadata_hash_here"; 
            impactNFT.safeMint(donors[i], tokenURI);
        }

        // 完成后撤销铸造权限
        impactNFT.setMinter(address(this), false);

        emit CampaignFinalized(address(this));
    }
}


/**
 * @title CampaignFactory
 * @notice 这是协议的入口和管理者。它负责创建新的Campaign，并作为其管理者来调用特权函数。
 * 在MVP阶段，它的拥有者(owner)就是DAO的模拟。
 */
contract CampaignFactory {
    address public owner;
    address[] public deployedCampaigns;
    address public immutable impactNFTAddress;

    event CampaignCreated(address indexed campaignAddress, address indexed beneficiary, uint goal);

    modifier onlyOwner() {
        require(msg.sender == owner, "Factory: Caller is not the owner");
        _;
    }

    constructor(address _nftAddress) {
        owner = msg.sender;
        impactNFTAddress = _nftAddress;
    }

    function createCampaign(address _beneficiary, uint _fundingGoal, address _tokenAddress) external onlyOwner {
        Campaign newCampaign = new Campaign(
            _beneficiary,
            _fundingGoal,
            _tokenAddress,
            address(this), // 将本工厂合约地址作为新Campaign的管理者
            impactNFTAddress
        );
        deployedCampaigns.push(address(newCampaign));
        emit CampaignCreated(address(newCampaign), _beneficiary, _fundingGoal);
    }

    // --- 作为管理者调用Campaign的特权函数 ---

    function createCampaignMilestone(address _campaignAddress, string memory _description, uint _amount) external onlyOwner {
        Campaign(_campaignAddress).createMilestone(_description, _amount);
    }

    function releaseCampaignMilestone(address _campaignAddress, uint _milestoneId) external onlyOwner {
        Campaign(_campaignAddress).releaseMilestoneFunds(_milestoneId);
    }

    function finalizeCampaign(address _campaignAddress) external onlyOwner {
        Campaign(_campaignAddress).finalizeAndMintNFTs();
    }

    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}
 {
    string public name;
    string public symbol;
    uint256 private _tokenIdCounter;

    // 映射：Token ID -> 拥有者地址
    mapping(uint256 => address) private _owners;
    // 映射：地址 -> 拥有的Token数量
    mapping(address => uint256) private _balances;
    // 映射：Token ID -> 授权地址
    mapping(uint256 => address) private _tokenApprovals;

    // 拥有者地址，只有他能授权新的“铸造者”（Campaign合约）
    address public owner;

    // 映射：被授权可以铸造NFT的地址（通常是Campaign合约地址）
    mapping(address => bool) public minters;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NFT: Caller is not the owner");
        _;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "NFT: Caller is not an authorized minter");
        _;
    }

    /**
     * @dev 授权或撤销一个地址的铸造权限。
     */
    function setMinter(address _minter, bool _status) external onlyOwner {
        minters[_minter] = _status;
    }

    /**
     * @dev 核心的铸造函数，只能由被授权的minter调用。
     * @param to NFT接收者的地址
     */
    function safeMint(address to, string memory /* uri */) external onlyMinter returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mint(to, tokenId);
        // 在真实的ERC721中，会有一个函数来设置tokenURI
        // 这里我们简化处理，可以通过事件来记录URI
        return tokenId;
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(_owners[tokenId] == address(0), "ERC721: token already minted");

        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return _balances[_owner];
    }
}


/**
 * @title Campaign
 * @notice 这是为单个求助项目创建的募款合约。它负责接收捐款、管理里程碑和按需拨款。
 * 它在项目完成后，有权调用NFT合约为捐款人铸造徽章。
 */
contract Campaign {
    address public immutable beneficiary;
    uint public immutable fundingGoal;
    IERC20 public immutable token;
    address public immutable factory; // 工厂合约地址，扮演管理者的角色
    ProofOfImpactNFT public immutable impactNFT; // 影响力NFT合约地址

    uint public totalRaised;
    mapping(address => uint) public contributions;
    address[] public donors; // 捐款人列表，用于发NFT

    struct Milestone {
        string description;
        uint amount;
        bool released;
    }
    Milestone[] public milestones;
    uint public releasedAmount; // 已释放的总金额

    bool public isFinalized; // 项目是否已最终完成

    event Donated(address indexed donor, uint amount);
    event MilestoneCreated(uint indexed milestoneId, string description, uint amount);
    event MilestoneReleased(uint indexed milestoneId);
    event CampaignFinalized(address indexed campaignAddress);

    modifier onlyFactory() {
        require(msg.sender == factory, "Campaign: Caller is not the factory");
        _;
    }

    constructor(
        address _beneficiary,
        uint _fundingGoal,
        address _tokenAddress,
        address _factory,
        address _nftAddress
    ) {
        beneficiary = _beneficiary;
        fundingGoal = _fundingGoal;
        token = IERC20(_tokenAddress);
        factory = _factory;
        impactNFT = ProofOfImpactNFT(_nftAddress);
    }

    function donate(uint _amount) external {
        require(totalRaised < fundingGoal, "Campaign: Goal already reached");
        require(_amount > 0, "Campaign: Donation must be > 0");

        if (contributions[msg.sender] == 0) {
            donors.push(msg.sender);
        }
        
        contributions[msg.sender] += _amount;
        totalRaised += _amount;

        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        emit Donated(msg.sender, _amount);
    }

    function createMilestone(string memory _description, uint _amount) external onlyFactory {
        require(totalRaised >= fundingGoal, "Campaign: Funding goal not yet reached");
        milestones.push(Milestone({
            description: _description,
            amount: _amount,
            released: false
        }));
        emit MilestoneCreated(milestones.length - 1, _description, _amount);
    }

    function releaseMilestoneFunds(uint _milestoneId) external onlyFactory {
        require(_milestoneId < milestones.length, "Campaign: Milestone does not exist");
        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.released, "Campaign: Milestone already released");

        milestone.released = true;
        releasedAmount += milestone.amount;
        token.transfer(beneficiary, milestone.amount);

        emit MilestoneReleased(_milestoneId);
    }

    /**
     * @dev 当所有里程碑都完成后，工厂可以调用此函数来最终确定项目，并为捐款人铸造NFT。
     */
    function finalizeAndMintNFTs() external onlyFactory {
        require(!isFinalized, "Campaign: Already finalized");
        // 确保所有里程碑都已释放
        uint totalMilestoneAmount = 0;
        for (uint i = 0; i < milestones.length; i++) {
            require(milestones[i].released, "Campaign: Not all milestones are released");
            totalMilestoneAmount += milestones[i].amount;
        }
        
        isFinalized = true;

        // 授权本合约成为NFT合约的铸造者
        impactNFT.setMinter(address(this), true);

        // 为每一位捐款人铸造NFT
        for (uint i = 0; i < donors.length; i++) {
            // 在实际应用中，每个NFT的URI可以不同，指向特定的元数据
            string memory tokenURI = "ipfs://your_metadata_hash_here"; 
            impactNFT.safeMint(donors[i], tokenURI);
        }

        // 完成后撤销铸造权限
        impactNFT.setMinter(address(this), false);

        emit CampaignFinalized(address(this));
    }
}


/**
 * @title CampaignFactory
 * @notice 这是协议的入口和管理者。它负责创建新的Campaign，并作为其管理者来调用特权函数。
 * 在MVP阶段，它的拥有者(owner)就是DAO的模拟。
 */
contract CampaignFactory {
    address public owner;
    address[] public deployedCampaigns;
    address public immutable impactNFTAddress;

    event CampaignCreated(address indexed campaignAddress, address indexed beneficiary, uint goal);

    modifier onlyOwner() {
        require(msg.sender == owner, "Factory: Caller is not the owner");
        _;
    }

    constructor(address _nftAddress) {
        owner = msg.sender;
        impactNFTAddress = _nftAddress;
    }

    function createCampaign(address _beneficiary, uint _fundingGoal, address _tokenAddress) external onlyOwner {
        Campaign newCampaign = new Campaign(
            _beneficiary,
            _fundingGoal,
            _tokenAddress,
            address(this), // 将本工厂合约地址作为新Campaign的管理者
            impactNFTAddress
        );
        deployedCampaigns.push(address(newCampaign));
        emit CampaignCreated(address(newCampaign), _beneficiary, _fundingGoal);
    }

    // --- 作为管理者调用Campaign的特权函数 ---

    function createCampaignMilestone(address _campaignAddress, string memory _description, uint _amount) external onlyOwner {
        Campaign(_campaignAddress).createMilestone(_description, _amount);
    }

    function releaseCampaignMilestone(address _campaignAddress, uint _milestoneId) external onlyOwner {
        Campaign(_campaignAddress).releaseMilestoneFunds(_milestoneId);
    }

    function finalizeCampaign(address _campaignAddress) external onlyOwner {
        Campaign(_campaignAddress).finalizeAndMintNFTs();
    }

    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}
