pragma solidity 0.5.11;

import "@aztec/protocol/contracts/interfaces/IACE.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract ZeKstament is Ownable {

    IACE public ace;
    bytes public proofOutputs;

    constructor(address _aceAddress) public Ownable() {
        ace = IACE(_aceAddress);
    }

    function createTestament(uint24 _proofId, bytes memory _proofData) public returns (bool) {
        proofOutputs = ace.validateProof(_proofId, msg.sender, _proofData);
        return true;
    }
}
