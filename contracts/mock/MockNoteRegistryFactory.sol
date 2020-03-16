pragma solidity 0.5.11;

import "@aztec/protocol/contracts/ACE/noteRegistry/epochs/201912/base/FactoryBase201912.sol";


contract MockNoteRegistryFactory is FactoryBase201912 {

    constructor(address _aceAddress) public FactoryBase201912(_aceAddress) {}
}
