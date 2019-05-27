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
const { AccountProvider } = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder.js');

const web3 = require('../test_lib/web3.js');
const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');
const config = require('../test_lib/config');

const BrandedToken = artifacts.require('BrandedToken');
const EIP20TokenMockFail = artifacts.require('EIP20TokenMockFail');

contract('BrandedToken::requestStake', async () => {
  contract('Negative Tests', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Reverts if mint is not equivalent to stake', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const stake = 1;
      const mint = 0;
      const staker = accountProvider.get();

      await utils.expectRevert(
        brandedToken.requestStake(
          stake,
          mint,
          { from: staker },
        ),
        'Should revert as mint is not equivalent to stake.',
        'Mint is not equivalent to stake.',
      );
    });

    it('Reverts if staker has a stake request hash', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const stake = 1;
      const mint = await brandedToken.convertToBrandedTokens(stake);
      const staker = accountProvider.get();

      await brandedToken.requestStake(
        stake,
        mint,
        { from: staker },
      );

      await utils.expectRevert(
        brandedToken.requestStake(
          stake,
          mint,
          { from: staker },
        ),
        'Should revert as staker has a stake request hash.',
        'Staker has a stake request hash.',
      );
    });

    it('Reverts if valueToken.transferFrom returns false', async () => {
      const valueToken = await EIP20TokenMockFail.new();

      const brandedToken = await BrandedToken.new(
        valueToken.address,
        'BT',
        'BrandedToken',
        config.decimals,
        35,
        1,
        await accountProvider.get(),
      );

      const stake = 1;
      const mint = await brandedToken.convertToBrandedTokens(stake);
      const staker = accountProvider.get();

      await utils.expectRevert(
        brandedToken.requestStake(
          stake,
          mint,
          { from: staker },
        ),
        'Should revert as valueToken.transferFrom returned false.',
        'ValueToken.transferFrom returned false.',
      );
    });
  });

  contract('Event', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);


    it('Emits StakeRequested event.', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const stake = 1;
      const mint = await brandedToken.convertToBrandedTokens(stake);
      const staker = accountProvider.get();

      const transactionResponse = await brandedToken.requestStake(
        stake,
        mint,
        { from: staker },
      );

      const events = Event.decodeTransactionResponse(
        transactionResponse,
      );

      assert.strictEqual(
        events.length,
        1,
      );

      Event.assertEqual(events[0], {
        name: 'StakeRequested',
        args: {
          _stakeRequestHash: await brandedToken.stakeRequestHashes(staker),
          _staker: staker,
          _stake: new BN(stake),
          // global nonce is incremented after assignment to a stake request
          _nonce: (await brandedToken.nonce()).subn(1),
        },
      });
    });
  });

  contract('Storage', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Successfully stores stake request data', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const stake = 1;
      const mint = await brandedToken.convertToBrandedTokens(stake);
      const staker = accountProvider.get();

      const stakeRequestHash = await brandedToken.requestStake.call(
        stake,
        mint,
        { from: staker },
      );

      await brandedToken.requestStake(
        stake,
        mint,
        { from: staker },
      );

      assert.strictEqual(
        stakeRequestHash,
        await brandedToken.stakeRequestHashes(staker),
      );

      const stakeRequest = await brandedToken.stakeRequests(stakeRequestHash);

      assert.strictEqual(
        stakeRequest.staker,
        staker,
      );

      assert.strictEqual(
        stakeRequest.stake.cmp(
          new BN(stake),
        ),
        0,
      );

      assert.strictEqual(
        stakeRequest.nonce.cmp(
          // global nonce is incremented after assignment to a stake request
          (await brandedToken.nonce()).subn(1),
        ),
        0,
      );
    });

    it('Calculates stakeRequestHash per EIP 712', async () => {
      const {
        brandedToken,
        stakeRequestHash,
      } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
        accountProvider,
      );

      const BT_STAKE_REQUEST_TYPEHASH = web3.utils.soliditySha3(
        'StakeRequest(address staker,uint256 stake,uint256 nonce)',
      );
      const stakeRequest = await brandedToken.stakeRequests(stakeRequestHash);
      const calculatedHash = web3.utils.soliditySha3(
        web3.eth.abi.encodeParameters(
          [
            'bytes32',
            'address',
            'uint256',
            'uint256',
          ],
          [
            BT_STAKE_REQUEST_TYPEHASH,
            stakeRequest.staker,
            stakeRequest.stake.toNumber(),
            stakeRequest.nonce.toNumber(),
          ],
        ),
      );

      assert.strictEqual(
        calculatedHash,
        stakeRequestHash,
      );
    });
  });
});
