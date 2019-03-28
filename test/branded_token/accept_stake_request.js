// Copyright 2018 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


'use strict';

const BN = require('bn.js');
const EthUtils = require('ethereumjs-util');
const { AccountProvider } = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder.js');

const web3 = require('../test_lib/web3.js');
const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

const BrandedToken = artifacts.require('BrandedToken');
const EIP20TokenMockPass = artifacts.require('EIP20TokenMockPass');
const OrganizationMockWorker = artifacts.require('OrganizationMockWorker');

contract('BrandedToken::acceptStakeRequest', async () => {
  const r = web3.utils.soliditySha3('r');
  const s = web3.utils.soliditySha3('s');
  const v = 0;

  contract('Negative Tests', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Reverts if stake request not found', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const worker = accountProvider.get();
      const stakeRequestHash = web3.utils.utf8ToHex('stakeRequestHash');

      await utils.expectRevert(
        brandedToken.acceptStakeRequest(
          stakeRequestHash,
          r,
          s,
          v,
          { from: worker },
        ),
        'Should revert as stake request not found.',
        'Stake request not found.',
      );
    });

    it('Reverts if signer is not a worker', async () => {
      const {
        brandedToken,
        stakeRequestHash,
      } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
        accountProvider,
        false, // Use OrganizationMockFail
      );

      const worker = accountProvider.get();

      await utils.expectRevert(
        brandedToken.acceptStakeRequest(
          stakeRequestHash,
          r,
          s,
          v,
          { from: worker },
        ),
        'Should revert as signer is not a worker.',
        'Signer is not a worker.',
      );
    });
  });

  contract('Event', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Emits StakeRequestAccepted and Transfer events', async () => {
      const {
        brandedToken,
        staker,
        stake,
        stakeRequestHash,
      } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
        accountProvider,
      );

      const worker = accountProvider.get();

      const transactionResponse = await brandedToken.acceptStakeRequest(
        stakeRequestHash,
        r,
        s,
        v,
        { from: worker },
      );

      const mint = await brandedToken.convertToBrandedTokens(stake);

      const events = Event.decodeTransactionResponse(
        transactionResponse,
      );

      assert.strictEqual(
        events.length,
        2,
      );

      Event.assertEqual(events[0], {
        name: 'StakeRequestAccepted',
        args: {
          _stakeRequestHash: stakeRequestHash,
          _staker: staker,
          _stake: new BN(stake),
        },
      });

      Event.assertEqual(events[1], {
        name: 'Transfer',
        args: {
          _from: utils.NULL_ADDRESS,
          _to: staker,
          _value: mint,
        },
      });
    });
  });

  contract('Storage', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Successfully mints branded tokens', async () => {
      const {
        brandedToken,
        staker,
        stake,
        stakeRequestHash,
      } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
        accountProvider,
      );

      // N.B.: anyone can call acceptStakeRequest
      const worker = accountProvider.get();

      // Contract does not confirm that address returned from ecrecover
      //      is not a 0 address. Consequently, signature components
      //      that return a 0 address are OK so long as
      //      Organization.isWorker returns true for a 0 address
      assert.isOk(
        await brandedToken.acceptStakeRequest.call(
          stakeRequestHash,
          r,
          s,
          v,
          { from: worker },
        ),
      );

      await brandedToken.acceptStakeRequest(
        stakeRequestHash,
        r,
        s,
        v,
        { from: worker },
      );

      const mint = await brandedToken.convertToBrandedTokens(stake);

      assert.strictEqual(
        mint.cmp(
          await brandedToken.balanceOf(staker),
        ),
        0,
      );

      assert.strictEqual(
        mint.cmp(
          await brandedToken.totalSupply(),
        ),
        0,
      );
    });

    it('Verifies stake request hash signer', async () => {
      // Setup organization
      const organization = await OrganizationMockWorker.new();
      const worker = accountProvider.get();

      await organization.setWorker(worker, 0);

      // Setup brandedToken
      const brandedToken = await BrandedToken.new(
        (await EIP20TokenMockPass.new()).address,
        'BT',
        'BrandedToken',
        18,
        35,
        1,
        organization.address,
      );

      // Request stake
      const stake = 1;
      const mint = await brandedToken.convertToBrandedTokens(stake);
      const staker = accountProvider.get();

      await brandedToken.requestStake(
        stake,
        mint,
        { from: staker },
      );

      const EIP712_DOMAIN_TYPEHASH = web3.utils.soliditySha3(
        'EIP712Domain(address verifyingContract)',
      );
      const DOMAIN_SEPARATOR = web3.utils.soliditySha3(
        web3.eth.abi.encodeParameters(
          ['bytes32', 'address'],
          [EIP712_DOMAIN_TYPEHASH, brandedToken.address],
        ),
      );
      const stakeRequestHash = await brandedToken.stakeRequestHashes(staker);

      // Prepare and sign typed data, for example see:
      //      https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js
      // N.B.: below differs from the example due to sha3's deprecation. See:
      //      https://github.com/ethereumjs/ethereumjs-util/blob/master/CHANGELOG.md#600---2018-10-08
      const typedDataToSign = EthUtils.keccak(
        Buffer.concat(
          [
            Buffer.from('19', 'hex'),
            Buffer.from('01', 'hex'),
            EthUtils.toBuffer(DOMAIN_SEPARATOR),
            EthUtils.toBuffer(stakeRequestHash),
          ],
        ),
      );
      const privateKey = EthUtils.keccak('signer');
      const signer = EthUtils.privateToAddress(privateKey);
      const signature = EthUtils.ecsign(
        typedDataToSign,
        privateKey,
      );

      // Set signer as a worker
      await organization.setWorker(EthUtils.bufferToHex(signer), 0);

      // Fails with incorrect signature components
      await utils.expectRevert(
        brandedToken.acceptStakeRequest(
          stakeRequestHash,
          signature.r, // correct
          signature.s, // correct
          0, // incorrect
          { from: worker },
        ),
        'Should revert as signer is not a worker.',
        'Signer is not a worker.',
      );

      // Passes with correct signature components
      assert.isOk(
        await brandedToken.acceptStakeRequest.call(
          stakeRequestHash,
          signature.r,
          signature.s,
          signature.v,
          { from: worker },
        ),
      );
    });
  });
});
