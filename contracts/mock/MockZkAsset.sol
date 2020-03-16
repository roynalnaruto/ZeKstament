pragma solidity 0.5.11;

import "@aztec/protocol/contracts/ERC1724/ZkAsset.sol";


contract MockZkAsset is ZkAsset {

    constructor(
        address _aceAddress,
        address _linkedTokenAddress,
        uint256 _scalingFactor
    ) public ZkAsset(
        _aceAddress,
        _linkedTokenAddress,
        _scalingFactor
    ) {}
}
