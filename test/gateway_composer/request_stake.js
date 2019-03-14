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

const utils = require('../test_lib/utils');
const gatewayComposerUtils = require('./utils');


contract('GatewayComposer::requestStake', async (accounts) => {
  describe('Negative Tests', async () => {
    const accountProvider = new AccountProvider(accounts);
    let gasPrice;
    let gasLimit;
    let gateway;
    let beneficiary;
    let nonce;

    beforeEach(async () => {
      gateway = accountProvider.get();
      beneficiary = accountProvider.get();
      gasPrice = 1;
      gasLimit = 1;
      nonce = 1;
    });

    it('Fails when msg.sender is not owner.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);


      await utils.expectRevert(gatewayComposer.requestStake(
        0,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: accountProvider.get() },
      ),
      'Should revert because only owner can call requestStake.',
      'Only owner can call the function.');
    });

    it('Fails when stake amount is 0.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
      await utils.expectRevert(gatewayComposer.requestStake(
        0,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      ),
      'Should revert because stake amount is zero.',
      'Stake amount is zero.');
    });

    it('Fails when minted amount is not equal to converted staked amount.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const invalidMintAmount = 0;
      await utils.expectRevert(gatewayComposer.requestStake(
        stakeAmount,
        invalidMintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      ),
      'Should revert because minted BrandedToken is not equal to '
             + 'converted staked ValueToken.',
      '_mintBT should match converted _stakeVT.');
    });

    it('Fails when gateway address is zero.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
      await utils.expectRevert(gatewayComposer.requestStake(
        stakeAmount,
        mintAmount,
        utils.NULL_ADDRESS,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      ),
      'Should revert because gateway address is zero.',
      'Gateway address is zero.');
    });

    it('Fails when gateway address is same as owner address.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
      await utils.expectRevert(gatewayComposer.requestStake(
        stakeAmount,
        mintAmount,
        owner,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      ),
      'Should revert because gateway address and owner address are same.',
      'Gateway address is same as owner address.');
    });

    it('Fails when beneficiary address is zero.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
      await utils.expectRevert(gatewayComposer.requestStake(
        stakeAmount,
        mintAmount,
        gateway,
        utils.NULL_ADDRESS,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      ),
      'Should revert because beneficiary address is zero.',
      'Beneficiary address is zero.');
    });

    it('Fails when gateway composer is not approved for staked value tokens.', async () => {
      const {
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const stakeAmount = 1;
      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
      await utils.expectRevert(gatewayComposer.requestStake(
        stakeAmount,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      ),
      'Should revert because ValueToken transferFrom returned false.');
    });
  });

  describe('Positive Tests', async () => {
    const accountProvider = new AccountProvider(accounts);
    let gasPrice;
    let gasLimit;
    let gateway;
    let beneficiary;
    let nonce;

    beforeEach(async () => {
      gateway = accountProvider.get();
      beneficiary = accountProvider.get();
      gasPrice = 1;
      gasLimit = 1;
      nonce = 1;
    });

    it('Returns stake request hash.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);
      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(
        stakeAmount,
      );
      const stakeRequestHash = await gatewayComposer.requestStake.call(
        stakeAmount,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      );
      await gatewayComposer.requestStake(
        stakeAmount,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      );

      // Validated that stakeRequestHash is present in
      // BrandedToken.stakeRequestHashes
      const stakeRequest = await brandedToken.stakeRequests
        .call(stakeRequestHash);
      assert.strictEqual(
        stakeRequest.staker,
        gatewayComposer.address,
      );
    });

    it('Sets passed arguments correctly.', async () => {
      const {
        valueToken,
        gatewayComposer,
        owner,
        brandedToken,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        stakeAmount,
      } = await gatewayComposerUtils.approveGatewayComposer(
        valueToken,
        gatewayComposer,
        owner,
      );

      const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
      const stakeRequestHash = await gatewayComposer.requestStake.call(
        stakeAmount,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      );

      await gatewayComposer.requestStake(
        stakeAmount,
        mintAmount,
        gateway,
        beneficiary,
        gasPrice,
        gasLimit,
        nonce,
        { from: owner },
      );

      const stakeRequest = await gatewayComposer.stakeRequests
        .call(stakeRequestHash);
      assert.strictEqual(
        (stakeRequest.stakeVT).cmp(new BN(stakeAmount)),
        0,
      );
      assert.strictEqual(
        stakeRequest.gateway,
        gateway,
      );
      assert.strictEqual(
        stakeRequest.beneficiary,
        beneficiary,
      );
      assert.strictEqual(
        (stakeRequest.gasPrice).cmp(new BN(gasPrice)),
        0,
      );
      assert.strictEqual(
        (stakeRequest.gasLimit).cmp(new BN(gasLimit)),
        0,
      );
      assert.strictEqual(
        (stakeRequest.nonce).cmp(new BN(nonce)),
        0,
      );
      // Validated that stakeRequestHash is present in BrandedToken.stakeRequestHashes
      const btStakeRequest = await brandedToken.stakeRequests.call(
        stakeRequestHash,
      );
      assert.strictEqual(btStakeRequest.staker, gatewayComposer.address);

      // Validate BrandedToken valuetoken balance.
      const btValueTokenBalance = await valueToken.balanceOf
        .call(brandedToken.address);
      assert.strictEqual(
        btValueTokenBalance.cmp(new BN(stakeAmount)),
        0,
      );
    });
  });
});
