// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AchievementNFT
 * @dev 一个 ERC721 合约，用于铸造带有元数据的成就NFT。
 * 合约的拥有者可以给玩家铸造NFT。
 */
contract AchievementNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Sophistry Hunter Achievement", "SHA") Ownable(msg.sender) {}

    /**
     * @dev 允许合约拥有者给指定地址铸造一个成就NFT。
     * @param player 接收NFT的玩家地址
     * @param _tokenURI NFT元数据的URI (例如：ipfs://... 或 https://...)
     */
    function safeMint(address player, string memory _tokenURI) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(player, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    // 以下函数是 ERC721URIStorage 的一部分，为了让合约能正常编译和运行，需要重写
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 