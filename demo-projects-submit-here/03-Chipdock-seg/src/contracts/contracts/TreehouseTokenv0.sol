// SPDX-License-Identifier: GPL-3.0
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract TreehouseTokenv0 is 
Initializable, 
ERC721Upgradeable, 
ERC721EnumerableUpgradeable, 
ERC721URIStorageUpgradeable, 
ERC721BurnableUpgradeable, 
OwnableUpgradeable, 
UUPSUpgradeable {
    
    uint256 private _nextTokenId;
    uint256 public mintFee;
    mapping(string => bool) private _uriExists;
    
    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId, string uri);
    event URISet(uint256 indexed tokenId, string uri);
    event ContractUpgraded(address indexed previousImplementation, address indexed newImplementation);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC721_init("CHIPS", "CHIPS");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __ERC721Burnable_init();
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function safeMint(string memory uri)
        public payable
        returns (uint256)
    {
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(!_uriExists[uri], "URI already exists - duplicate content not allowed");
        if(mintFee >= 0) require(msg.value >= mintFee,"Insufficient payment");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        _uriExists[uri] = true;
        emit TokenMinted(msg.sender, tokenId, uri);
        return tokenId;
    }

    // Override burn to clean up URI tracking
    function burn(uint256 tokenId) public override {
        string memory uri = tokenURI(tokenId);
        super.burn(tokenId);
        _uriExists[uri] = false;
    }

    //uri eg: https://api.grove.storage/f60e73d835cd5b42bbf35981db20470e9c1f129668b954bc699d6d6a6abfac5a
    
    // Check if a URI has already been used
    function uriExists(string memory uri) public view returns (bool) {
        return _uriExists[uri];
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {
        emit ContractUpgraded(address(this), newImplementation);
    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function updateTokenURI(uint256 tokenId, string memory newUri) public payable{
        address owner = _ownerOf(tokenId);
        require(owner != address(0), "Token does not exist");
        require(msg.sender == owner, "Only the owner can update the URI");
        require(bytes(newUri).length > 0, "URI cannot be empty");
        require(!_uriExists[newUri], "URI already exists");
        if(mintFee >= 0) require(msg.value >= mintFee,"Insufficient payment");

        string memory oldUri = tokenURI(tokenId);
        _uriExists[oldUri] = false;

        _setTokenURI(tokenId, newUri);
        _uriExists[newUri] = true;

        emit URISet(tokenId, newUri);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._increaseBalance(account, value);
    }

    function setMintFee(uint256 fee) public onlyOwner {
        mintFee = fee;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}