// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SheToken
 * @author Gemini for ShePower: Genesis
 * @dev $SHE代币最终版合约。实现了固定总量和初始分配。
 * 此合约在部署后，所有代币的归属即确定，不再需要Owner权限，更加去中心化。
 */
contract SheToken is ERC20 {
    // 固定的最大供应量：10亿枚（1,000,000,000 * 10^18）
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /**
     * @dev 构造函数在部署时执行一次，完成所有代币的铸造和分配。
     * @param communityPoolAddr 社区奖励池的钱包地址。
     * @param treasuryAddr 项目金库的钱包地址。
     * @param teamVestingAddr 团队锁仓合约的地址。
     * @param investorsVestingAddr 投资者锁仓合约的地址。
     * @param liquiditySaleAddr 流动性与销售的钱包地址。
     */
    constructor(
        address communityPoolAddr,
        address treasuryAddr,
        address teamVestingAddr,
        address investorsVestingAddr,
        address liquiditySaleAddr
    ) 
        ERC20("ShePower Token", "SHE") // 设置代币名称和符号
    {
        // 检查传入的地址是否有效，防止错误操作
        require(communityPoolAddr != address(0), "Invalid community pool address");
        require(treasuryAddr != address(0), "Invalid treasury address");
        require(teamVestingAddr != address(0), "Invalid team vesting address");
        require(investorsVestingAddr != address(0), "Invalid investors vesting address");
        require(liquiditySaleAddr != address(0), "Invalid liquidity/sale address");

        // 根据预设比例计算各部分代币数量
        uint256 communityAllocation = MAX_SUPPLY * 45 / 100; // 45%
        uint256 treasuryAllocation = MAX_SUPPLY * 20 / 100;  // 20%
        uint256 teamAllocation = MAX_SUPPLY * 15 / 100;      // 15%
        uint256 investorsAllocation = MAX_SUPPLY * 10 / 100; // 10%
        uint256 liquidityAllocation = MAX_SUPPLY * 10 / 100; // 10%
        
        // 执行铸造和分配
        _mint(communityPoolAddr, communityAllocation);
        _mint(treasuryAddr, treasuryAllocation);
        _mint(teamVestingAddr, teamAllocation);
        _mint(investorsVestingAddr, investorsAllocation);
        _mint(liquiditySaleAddr, liquidityAllocation);
    }
}