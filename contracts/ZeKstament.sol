pragma solidity 0.5.11;

import "@aztec/protocol/contracts/interfaces/IACE.sol";
import "@aztec/protocol/contracts/interfaces/IAZTEC.sol";
import "@aztec/protocol/contracts/interfaces/IZkAsset.sol";
import "@aztec/protocol/contracts/libs/NoteUtils.sol";

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./libs/AddressArrayUtils.sol";


contract ZeKstament is Ownable {

    using AddressArrayUtils for address[];
    using NoteUtils for bytes;

    struct Testament {
        address testator;
        address[] nominees;
        address zkAssetAddress;
        uint256 lastActive;
        bool isActive;
        bytes proofOutputs;
    }

    address public aceAddress;

    uint256 public unlockWhenInactiveFor;

    mapping (bytes32 => Testament) private testaments;

    modifier onlyTestator(bytes32 _testamentId) {
        require(msg.sender == testaments[_testamentId].testator, "Caller not testator");
        _;
    }

    modifier onlyNominee(bytes32 _testamentId) {
        bool _exists;
        (, _exists) = testaments[_testamentId].nominees.indexOf(msg.sender);
        require(_exists == true, "Caller not among nominees");
        _;
    }

    constructor(address _aceAddress) public Ownable() {
        aceAddress = _aceAddress;
        unlockWhenInactiveFor = 52 weeks;
    }

    function createTestament(
        address _zkAssetAddress,
        address[] memory _nominees,
        bytes memory _proofData
    )
        public
        returns (bytes32 _testamentId)
    {
        bytes memory _proofOutputs = IACE(aceAddress).validateProof(
            IAZTEC(aceAddress).JOIN_SPLIT_PROOF(),
            msg.sender,
            _proofData
        );

        _testamentId = keccak256(abi.encodePacked(msg.sender, _zkAssetAddress));

        testaments[_testamentId] = Testament({
            testator: msg.sender,
            zkAssetAddress: _zkAssetAddress,
            nominees: _nominees,
            lastActive: block.timestamp,
            isActive: true,
            proofOutputs: _proofOutputs
        });

        return _testamentId;
    }

    function updateTestament(
        bytes32 _testamentId,
        address[] memory _nominees,
        bytes memory _proofData
    )
        public
        onlyTestator(_testamentId)
        returns (bool)
    {
        bytes memory _proofOutputs = IACE(aceAddress).validateProof(
            IAZTEC(aceAddress).JOIN_SPLIT_PROOF(),
            msg.sender,
            _proofData
        );

        testaments[_testamentId].nominees = _nominees;
        testaments[_testamentId].lastActive = block.timestamp;
        testaments[_testamentId].proofOutputs = _proofOutputs;

        return true;
    }

    function declareActive(bytes32 _testamentId)
        public
        onlyTestator(_testamentId)
        returns (bool)
    {
        require(testaments[_testamentId].isActive == true, "Testament is inactive");

        testaments[_testamentId].lastActive = block.timestamp;
        return true;
    }

    function unlockTestament(bytes32 _testamentId)
        public
        onlyNominee(_testamentId)
        returns (bool)
    {
        require(testaments[_testamentId].isActive == true, "Testament is inactive");

        require(
            block.timestamp - testaments[_testamentId].lastActive > unlockWhenInactiveFor,
            "Testator is still alive"
        );

        uint _proofOutputsLength = testaments[_testamentId].proofOutputs.getLength();
        for (uint i = 0; i < _proofOutputsLength; i++) {
            IZkAsset(testaments[_testamentId].zkAssetAddress).confidentialTransferFrom(
                IAZTEC(aceAddress).JOIN_SPLIT_PROOF(),
                testaments[_testamentId].proofOutputs.get(i)
            );
        }

        testaments[_testamentId].isActive = false;

        return true;
    }

    function updateUnlockWhenInactiveFor(uint256 _newUnlockWhenInactiveFor)
        public
        onlyOwner()
        returns (bool)
    {
        unlockWhenInactiveFor = _newUnlockWhenInactiveFor;
        return true;
    }

    function getTestament(bytes32 _testamentId)
        public
        view
        returns (
            address _testator,
            address[] memory _nominees,
            address _zkAssetAddress,
            uint256 _lastActive,
            bool _isActive,
            bytes memory _proofOutputs
        )
    {
        _testator = testaments[_testamentId].testator;
        _nominees = testaments[_testamentId].nominees;
        _zkAssetAddress = testaments[_testamentId].zkAssetAddress;
        _lastActive = testaments[_testamentId].lastActive;
        _isActive = testaments[_testamentId].isActive;
        _proofOutputs = testaments[_testamentId].proofOutputs;
    }
}
