const ACE = artifacts.require('./MockACE.sol');
const ZeKstament = artifacts.require('./ZeKstament.sol');

module.exports = async (deployer) => {
  const ace = await ACE.deployed();

  return deployer.deploy(ZeKstament, ace.address);
};
