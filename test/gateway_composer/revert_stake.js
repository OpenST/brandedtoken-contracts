// Copyright 2019 OpenST Ltd.
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

const utils = require('../test_lib/utils');
const { AccountProvider } = require('../test_lib/utils.js');
const web3 = require('../test_lib/web3.js');

const gatewayComposerUtils = require('./utils');

contract('GatewayComposer::revertStake', async (accounts) => {
  contract('Negative Tests', async () => {
    const accountProvider = new AccountProvider(accounts);

    it('Fails when owner is not the caller', async () => {
      const {
        gatewayComposer,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        gateway,
      } = await gatewayComposerUtils.setupGatewayPass(
        accountProvider,
      );

      const penalty = 0;
      const messageHash = web3.utils.soliditySha3('hash');

      await utils.expectRevert(
        gatewayComposer.revertStake(
          gateway.address,
          penalty,
          messageHash,
          { from: accountProvider.get() },
        ),
        'Should revert as msg.sender is not the owner.',
        'Only owner can call the function.',
      );
    });

    it('Fails when gateway address is zero', async () => {
      const {
        gatewayComposer,
        owner,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const gateway = utils.NULL_ADDRESS;
      const penalty = 0;
      const messageHash = web3.utils.soliditySha3('hash');

      await utils.expectRevert(
        gatewayComposer.revertStake(
          gateway,
          penalty,
          messageHash,
          { from: owner },
        ),
        'Should revert as gateway address is zero.',
        'Gateway address is zero.',
      );
    });

    it('Fails if valueToken transferFrom returns false', async () => {
      const {
        gatewayComposer,
        owner,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        gateway,
      } = await gatewayComposerUtils.setupGatewayPass(
        accountProvider,
      );

      const penalty = 1;
      const messageHash = web3.utils.soliditySha3('hash');

      await utils.expectRevert(
        gatewayComposer.revertStake(
          gateway.address,
          penalty,
          messageHash,
          { from: owner },
        ),
        'Should revert as valueToken.transferFrom returned false.',
      );
    });
  });

  contract('Positive Tests', async () => {
    const accountProvider = new AccountProvider(accounts);

    it('Returns true on successful execution', async () => {
      const {
        gatewayComposer,
        owner,
      } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

      const {
        gateway,
      } = await gatewayComposerUtils.setupGatewayPass(
        accountProvider,
      );

      const penalty = 0;
      const messageHash = web3.utils.soliditySha3('hash');

      assert.isOk(
        await gatewayComposer.revertStake.call(
          gateway.address,
          penalty,
          messageHash,
          { from: owner },
        ),
      );
    });
  });
});
