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

  // create aztec compatible accounts for carol and dave
  const aztecAccounts = {
    bob: secp256k1.accountFromPrivateKey(process.env.PRIVATE_KEY_BOB),
    carol: secp256k1.accountFromPrivateKey(process.env.PRIVATE_KEY_CAROL),
    dave: secp256k1.accountFromPrivateKey(process.env.PRIVATE_KEY_DAVE),
  };

  before('Deploy Contracts', async () => {
    await deployAztecEcosystem(contracts);
    await deployZeKstament(contracts);

    // mint some ERC20 tokens for bob
    // bob also approves the ACE contract to fetch tokens on his behalf
    const tokenAmount = new BN('100000000000000000000');
    await contracts.erc20.mint(aztecAccounts.bob.address, tokenAmount);
    await contracts.erc20.approve(
      contracts.ace.address,
      tokenAmount,
      { from: aztecAccounts.bob.address },
    );
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

      const testamentId = web3.utils.soliditySha3(
        { type: 'address', value: aztecAccounts.bob.address },
        { type: 'address', value: contracts.zkAsset.address },
      );

      // call should return true
      assert.deepEqual(
        await contracts.zekstament.createTestament.call(
          contracts.zkAsset.address,
          [aztecAccounts.carol.address, aztecAccounts.dave.address],
          data,
          { from: aztecAccounts.bob.address },
        ),
        testamentId,
      );

      // broadcast tx to create testament
      await contracts.zekstament.createTestament(
        contracts.zkAsset.address,
        [aztecAccounts.carol.address, aztecAccounts.dave.address],
        data,
        { from: aztecAccounts.bob.address },
      );

      const testament = await contracts.zekstament.getTestament.call(testamentId);
      assert.deepEqual(testament[0], aztecAccounts.bob.address);
      assert.deepEqual(testament[1], [aztecAccounts.carol.address, aztecAccounts.dave.address]);
      assert.deepEqual(testament[2], contracts.zkAsset.address);
      assert.deepEqual(testament[4], true);
    });
  });

  describe('Unlock Testament', () => {
    let testamentId;

    before(async () => {
      const inputNotes = [];

      const outputNotes = [
        await note.create(aztecAccounts.carol.publicKey, 25),
        await note.create(aztecAccounts.dave.publicKey, 75),
      ];

      const proof = new JoinSplitProof(
        inputNotes,
        outputNotes,
        aztecAccounts.bob.address,
        -100,
        aztecAccounts.bob.address,
      );

      const data = proof.encodeABI(contracts.joinSplit.address);

      testamentId = web3.utils.soliditySha3(
        { type: 'address', value: aztecAccounts.bob.address },
        { type: 'address', value: contracts.zkAsset.address },
      );

      // broadcast tx to create testament
      await contracts.zekstament.createTestament(
        contracts.zkAsset.address,
        [aztecAccounts.carol.address, aztecAccounts.dave.address],
        data,
        { from: aztecAccounts.bob.address },
      );

      // approve the proof to be used by a delegate (our ZeKstament contract in this case)
      await contracts.ace.publicApprove(
        contracts.zkAsset.address,
        proof.hash, -100,
        { from: aztecAccounts.bob.address },
      );
    });
    it('[unlocks an expired testament]', async () => {
      // advance the time by 53 weeks
      await timeMachine.advanceTimeAndBlock(60 * 60 * 24 * 7 * 53);

      // unlock should be possible from carol or dave
      assert.deepEqual(
        await contracts.zekstament.unlockTestament.call(
          testamentId, { from: aztecAccounts.carol.address },
        ),
        true,
      );
      assert.deepEqual(
        await contracts.zekstament.unlockTestament.call(
          testamentId, { from: aztecAccounts.dave.address },
        ),
        true,
      );

      // broadcast tx to unlock the testament
      await contracts.zekstament.unlockTestament(
        testamentId, { from: aztecAccounts.carol.address },
      );

      // verify that the testament is not active anymore
      const testamentNow = await contracts.zekstament.getTestament.call(testamentId);
      assert.deepEqual(testamentNow[4], false);
    });
  });
});
