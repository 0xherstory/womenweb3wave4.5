// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ARGToken
 * @dev 一个简单的 ERC20 代币，用作游戏内货币。
 * 合约的拥有者可以铸造新的代币。
 */
contract ARGToken is ERC20, Ownable {
    constructor() ERC20("Argument Token", "ARG") Ownable(msg.sender) {
        // 在合约创建时，可以预先给创建者铸造一些初始代币（可选）
        // _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev 允许合约拥有者给指定地址铸造代币。
     * @param to 接收代币的地址
     * @param amount 代币数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
} 