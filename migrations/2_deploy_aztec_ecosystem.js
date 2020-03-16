const bn128 = require('@aztec/bn128');
const {
  proofs,
  constants: {
    addresses,
    ERC20_SCALING_FACTOR,
  }
} = require('@aztec/dev-utils');

const ACE = artifacts.require('./MockACE.sol');
const JoinSplit = artifacts.require('./MockJoinSplit.sol');
const BaseFactory = artifacts.require('./MockNoteRegistryFactory.sol');
const ERC20Mintable = artifacts.require('./MockERC20Mintable.sol');
const ZkAsset = artifacts.require('./MockZkAsset.sol');

module.exports = (deployer) => {
  return deployer.deploy(ACE)
    .then(async (ace) => {
      await ace.setCommonReferenceString(bn128.CRS);
    })
    .then(async () => {
      const joinSplit = await deployer.deploy(JoinSplit);
      const ace = await ACE.deployed();
      await ace.setProof(proofs.JOIN_SPLIT_PROOF, joinSplit.address);
    })
    .then(async () => {
      const ace = await ACE.deployed();
      const noteRegistryFactory = await deployer.deploy(BaseFactory, ace.address);
      await ace.setFactory(1 * 256 ** 2 + 1 * 256 ** 1 + 1 * 256 ** 0, noteRegistryFactory.address);
    })
    .then(async () => {
      return deployer.deploy(ERC20Mintable);
    })
    .then(async ({ address: erc20Address }) => {
      const ace = await ACE.deployed();
      return deployer.deploy(ZkAsset, ace.address, erc20Address, ERC20_SCALING_FACTOR);
    });
}
