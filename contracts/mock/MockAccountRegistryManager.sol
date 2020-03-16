pragma solidity 0.5.11;

import "@aztec/protocol/contracts/AccountRegistry/AccountRegistryManager.sol";


contract MockAccountRegistryManager is AccountRegistryManager {

    constructor(
        address _behaviourAddress,
        address _aceAddress,
        address _trustedGSNSignerAddress
    ) public AccountRegistryManager (
        _behaviourAddress,
        _aceAddress,
        _trustedGSNSignerAddress
    ) {}
}
