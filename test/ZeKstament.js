const {
  JoinSplitProof,
  note,
} = require('aztec.js');

const secp256k1 = require('@aztec/secp256k1');

const timeMachine = require('ganache-time-traveler');

const {
  deployAztecEcosystem,
  deployZeKstament,
} = require('./setup');

const BN = web3.utils.BN;

contract('ZeKstament', () => {
  const contracts = {};
  let snapshot;
  let snapshotId;

  before('Deploy Contracts', async () => {
    await deployAztecEcosystem(contracts);
    await deployZeKstament(contracts);
  });

  beforeEach(async () => {
    snapshot = await timeMachine.takeSnapshot();
    snapshotId = snapshot.result;
  });

  afterEach(async () => {
    await timeMachine.revertToSnapshot(snapshotId);
  });

  describe('Deployment of ZeKstament', () => {
    it('[initializes the ACE address correctly]', async () => {
      assert.deepEqual(
        await contracts.zekstament.aceAddress.call(),
        contracts.ace.address,
      );
    });
  });

  describe('Create Testament', () => {
    it('[validates a valid proof correctly]', async () => {
      // create aztec compatible accounts for carol and dave
      const aztecAccounts = {
        bob: secp256k1.accountFromPrivateKey(process.env.PRIVATE_KEY_BOB),
        carol: secp256k1.accountFromPrivateKey(process.env.PRIVATE_KEY_CAROL),
        dave: secp256k1.accountFromPrivateKey(process.env.PRIVATE_KEY_DAVE),
      };

      // mint some ERC20 tokens for bob
      await contracts.erc20.mint(aztecAccounts.bob.address, new BN('100000000000000000000'));

      const inputNotes = [];

      // set output notes, 40 to carol and 60 to dave
      const outputNotes = [
        await note.create(aztecAccounts.carol.publicKey, 40),
        await note.create(aztecAccounts.dave.publicKey, 60),
      ];

      // create proof
      // input notes from bob
      // output notes for carol and dave
      const proof = new JoinSplitProof(
        inputNotes,
        outputNotes,
        aztecAccounts.bob.address,
        -100,
        aztecAccounts.bob.address,
      );

      const data = proof.encodeABI(contracts.joinSplit.address);

      // call should return true
      const testamentId = web3.utils.soliditySha3(
        { type: 'address', value: aztecAccounts.bob.address },
        { type: 'address', value: contracts.zkAsset.address },
      );

      assert.deepEqual(
        await contracts.zekstament.createTestament.call(
          contracts.zkAsset.address,
          data,
          { from: aztecAccounts.bob.address },
        ),
        testamentId,
      );

      // broadcast tx to create testament
      await contracts.zekstament.createTestament(
        contracts.zkAsset.address,
        data,
        { from: aztecAccounts.bob.address },
      );

      const testament = await contracts.zekstament.getTestament.call(testamentId);
      assert.deepEqual(testament[0], aztecAccounts.bob.address);
      assert.deepEqual(testament[1], contracts.zkAsset.address);
      assert.deepEqual(testament[2], data);
    });
  });
});
