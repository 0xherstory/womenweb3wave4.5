// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./CampStorage.sol";

/**
 * @title CampProxy
 * @dev 代理合约，将调用转发到实现合约
 */
contract CampProxy is CampStorage {
    // 实现合约地址
    address public implementation;
    
    // 初始化事件
    event ProxyInitialized(address implementation, bytes initData);
    
    /**
     * @dev 构造函数，设置实现合约地址并初始化
     * @param _implementation 实现合约地址
     * @param _initData 初始化数据
     */
    constructor(address _implementation, bytes memory _initData) {
        require(_implementation != address(0), "Invalid implementation address");
        implementation = _implementation;
        
        // 触发初始化事件
        emit ProxyInitialized(_implementation, _initData);
        
        // 转发初始化调用
        (bool success, ) = _implementation.delegatecall(_initData);
        require(success, "Initialization failed");
    }
    
    /**
     * @dev 回退函数，将所有调用转发到实现合约
     */
    fallback() external payable {
        address _impl = implementation;
        assembly {
            // 复制调用数据
            calldatacopy(0, 0, calldatasize())
            
            // 转发调用到实现合约
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)
            
            // 复制返回数据
            returndatacopy(0, 0, returndatasize())
            
            // 处理结果
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
    
    /**
     * @dev 接收以太币的函数
     */
    receive() external payable {}
} 