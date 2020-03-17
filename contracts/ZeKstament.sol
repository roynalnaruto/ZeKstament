pragma solidity 0.5.11;

import "@aztec/protocol/contracts/interfaces/IACE.sol";
import "@aztec/protocol/contracts/interfaces/IAZTEC.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract ZeKstament is Ownable {

    struct Testament {
        address testator;
        address zkAssetAddress;
        bytes proofData;
    }

    address public aceAddress;

    mapping (bytes32 => Testament) private testaments;

    constructor(address _aceAddress) public Ownable() {
        aceAddress = _aceAddress;
    }

    function createTestament(
        address _zkAssetAddress,
        bytes memory _proofData
    ) public returns (bytes32) {
        IACE(aceAddress).validateProof(
            IAZTEC(aceAddress).JOIN_SPLIT_PROOF(),
            msg.sender, _proofData
        );

        bytes32 _testamentId = keccak256(abi.encodePacked(msg.sender, _zkAssetAddress));

        testaments[_testamentId] = Testament({
            testator: msg.sender,
            zkAssetAddress: _zkAssetAddress,
            proofData: _proofData
        });

        return _testamentId;
    }

    function getTestament(bytes32 _testamentId)
        public
        view
        returns (
            address _testator,
            address _zkAssetAddress,
            bytes memory _proofData
        )
    {
        _testator = testaments[_testamentId].testator;
        _zkAssetAddress = testaments[_testamentId].zkAssetAddress;
        _proofData = testaments[_testamentId].proofData;
    }
}
