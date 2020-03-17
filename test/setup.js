const ACE = artifacts.require('MockACE.sol');
const JoinSplit = artifacts.require('MockJoinSplit.sol');
const BaseFactory = artifacts.require('MockNoteRegistryFactory.sol');
const ERC20Mintable = artifacts.require('MockERC20Mintable.sol');
const ZkAsset = artifacts.require('MockZkAsset.sol');
const ZeKstament = artifacts.require('ZeKstament.sol');

const bn128 = require('@aztec/bn128');

const {
  proofs,
  constants: {
    ERC20_SCALING_FACTOR,
  },
} = require('@aztec/dev-utils');

const deployAztecEcosystem = async function (contracts) {
  contracts.ace = await ACE.new();
  await contracts.ace.setCommonReferenceString(bn128.CRS);

  contracts.joinSplit = await JoinSplit.new();
  await contracts.ace.setProof(proofs.JOIN_SPLIT_PROOF, contracts.joinSplit.address);

  contracts.noteRegistryFactory = await BaseFactory.new(contracts.ace.address);
  await contracts.ace.setFactory(
    1 * 256 ** 2 + 1 * 256 ** 1 + 1 * 256 ** 0,
    contracts.noteRegistryFactory.address,
  );

  contracts.erc20 = await ERC20Mintable.new();

  contracts.zkAsset = await ZkAsset.new(
    contracts.ace.address,
    contracts.erc20.address,
    ERC20_SCALING_FACTOR,
  );
};

const deployZeKstament = async function (contracts) {
  contracts.zekstament = await ZeKstament.new(contracts.ace.address);
};

module.exports = {
  deployAztecEcosystem,
  deployZeKstament,
};
