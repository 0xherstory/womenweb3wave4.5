// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LetterNFT
 * @dev 这是"星空宝盒"项目的核心智能合约。
 * 它继承了ERC721标准，意味着每个NFT都是独一无二的。
 * 它也继承了Ownable标准，意味着只有合约的拥有者（我们的公益社）才能铸造新的NFT。
 */
contract LetterNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter; // 一个自动计数的ID生成器

    // 构造函数：在部署合约时，会设置NFT的名字和符号。
    // 我们将合约的部署者（公益社）设置为初始的Owner。
    constructor() ERC721("WeaverLetter", "WVL") Ownable(msg.sender) {}

    /**
     * @dev 核心函数：铸造一封新的信件NFT。
     * - `recipient`: 接收这个NFT的人（女孩的钱包地址）。
     * - `tokenURI`: 一个指向信件元数据（包含图片链接）的JSON文件的链接。
     * - `onlyOwner`: 这个修饰符确保了只有合约的拥有者才能调用此函数。
     */
    function mintLetter(address recipient, string memory tokenURI)
        public
        onlyOwner
    {
        _tokenIdCounter.increment(); // ID +1
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(recipient, tokenId); // 安全地铸造NFT并发送给接收者
        _setTokenURI(tokenId, tokenURI); // 设置这个NFT对应的元数据链接
    }

    /**
     * @dev 管理函数：强制转移NFT（用于处理问题NFT）
     * 只有合约拥有者可以调用
     */
    function adminTransfer(address from, address to, uint256 tokenId)
        public
        onlyOwner
    {
        _transfer(from, to, tokenId);
    }

    /**
     * @dev 管理函数：销毁NFT（永久删除）
     * 只有合约拥有者可以调用
     */
    function burnNFT(uint256 tokenId)
        public
        onlyOwner
    {
        _burn(tokenId);
    }

    /**
     * @dev 管理函数：更新NFT的元数据URI
     * 只有合约拥有者可以调用
     */
    function updateTokenURI(uint256 tokenId, string memory newTokenURI)
        public
        onlyOwner
    {
        _setTokenURI(tokenId, newTokenURI);
    }

    // 重写必需的函数
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

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
