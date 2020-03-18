const ACE = artifacts.require('./MockACE.sol');
const AddressArrayUtils = artifacts.require('./AddressArrayUtils.sol');
const ZeKstament = artifacts.require('./ZeKstament.sol');

module.exports = async (deployer) => {
  const ace = await ACE.deployed();

  return deployer.deploy(AddressArrayUtils)
    .then(async () => {
      await deployer.link(AddressArrayUtils, ZeKstament);
      await deployer.deploy(ZeKstament, ace.address);
    });
};
