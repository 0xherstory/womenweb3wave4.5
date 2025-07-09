// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title CharacterNFT
 * @author Gemini for ShePower: Genesis
 * @dev 角色NFT最终版合约。采用baseURI方案管理元数据，由Owner控制铸造。
 */
contract CharacterNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter; // 安全的Token ID计数器

    // 存储你的元数据文件夹在IPFS上的地址，例如: "ipfs://bafybeig.../"
    string public baseTokenURI;

    /**
     * @dev 构造函数，初始化NFT集合。
     * @param initialOwner 将被设为合约所有者的地址。
     * @param initialBaseURI 你的IPFS元数据文件夹URI。
     */
    constructor(address initialOwner, string memory initialBaseURI) 
        ERC721("ShePower Genesis Character", "SHEC") // NFT集合的名称和符号
        Ownable(initialOwner) 
    {
        baseTokenURI = initialBaseURI;
    }

    /**
     * @dev 内部函数，重写ERC721的_baseURI，使其指向我们设置的baseTokenURI。
     * OpenSea等市场会自动调用此函数来拼接完整的元数据地址。
     */
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    /**
     * @dev 铸造一个新的角色NFT。只有合约所有者（游戏服务器的钱包）才能调用。
     * @param player 接收NFT的玩家钱包地址。
     * @return newItemId 新创建的NFT的唯一ID。
     */
    function mint(address player) public onlyOwner returns (uint256) {
        uint256 newItemId = _tokenIdCounter.current();
        _mint(player, newItemId);
        _tokenIdCounter.increment();
        return newItemId;
    }
    
    /**
     * @dev 允许合约所有者在未来更新元数据的基地址。
     */
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        baseTokenURI = newBaseURI;
    }
}