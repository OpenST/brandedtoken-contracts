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

const GatewayComposer = artifacts.require('GatewayComposer');

const utils = require('../test_lib/utils');

const BrandedToken = artifacts.require('BrandedToken');
const EIP20TokenMock = artifacts.require('EIP20TokenMock');
const { AccountProvider } = require('../test_lib/utils.js');

/**
 * Deploys an EIP20TokenMock contract with the provided decimals.
 * @param {number} decimals Decimals for token.
 * @return {string} valueToken Address of token.
 */
const deployValueToken = async (decimals) => {
  const { address: valueToken } = await EIP20TokenMock.new(
    'VT',
    'ValueToken',
    decimals,
  );

  return valueToken;
};

contract('GatewayComposer::constructor', async (accounts) => {
  describe('Negative Tests', async () => {
    let accountProvider;
    let deployer;
    let owner;
    let valueToken;
    let brandedToken;

    beforeEach(async () => {
      accountProvider = new AccountProvider(accounts);
      deployer = accountProvider.get();
      owner = accountProvider.get();
      valueToken = accountProvider.get();
      brandedToken = accountProvider.get();
    });

    it('Reverts if owner address is zero.', async () => {
      await utils.expectRevert(GatewayComposer.new(
        utils.NULL_ADDRESS,
        valueToken,
        brandedToken,
        { from: deployer },
      ),
      'It should revert as owner address is zero.',
      'Owner address is zero.');
    });

    it('Reverts if ValueToken address is zero.', async () => {
      await utils.expectRevert(GatewayComposer.new(
        owner,
        utils.NULL_ADDRESS,
        brandedToken,
        { from: deployer },
      ),
      'It should revert as ValueToken address is zero.',
      'ValueToken address is zero.');
    });

    it('Reverts if branded token address is zero.', async () => {
      await utils.expectRevert(GatewayComposer.new(
        owner,
        valueToken,
        utils.NULL_ADDRESS,
        { from: deployer },
      ),
      'It should revert as BrandedToken address is zero.',
      'BrandedToken address is zero.');
    });

    it('Reverts if ValueToken address is same as owner address.', async () => {
      await utils.expectRevert(GatewayComposer.new(
        valueToken,
        valueToken,
        brandedToken,
        { from: deployer },
      ),
      'It should revert as valueToken address is same as owner address.',
      'ValueToken address is same as owner address.');
    });

    it('Reverts if BrandedToken address is same as owner address.', async () => {
      await utils.expectRevert(GatewayComposer.new(
        brandedToken,
        valueToken,
        brandedToken,
        { from: deployer },
      ),
      'It should revert as BrandedToken address is same as owner address.',
      'BrandedToken address is same as owner address.');
    });

    it('Reverts if ValueToken is not equal to BrandedToken.valueToken.', async () => {
      const decimals = 5;

      valueToken = await deployValueToken(decimals);
      brandedToken = await BrandedToken.new(
        valueToken,
        'TST',
        'Test',
        decimals,
        10,
        5,
        accountProvider.get(),
        { from: deployer },
      );
      await utils.expectRevert(GatewayComposer.new(
        owner,
        accountProvider.get(),
        brandedToken.address,
        { from: deployer },
      ),
      'It should revert as ValueToken should match BrandedToken.ValueToken.',
      'ValueToken should match BrandedToken.valueToken.');
    });
  });

  describe('Storage', async () => {
    let accountProvider;
    let deployer;
    let owner;
    let valueToken;
    let brandedToken;

    beforeEach(async () => {
      accountProvider = new AccountProvider(accounts);
      deployer = accountProvider.get();
      owner = accountProvider.get();
      const decimals = 5;

      valueToken = await deployValueToken(decimals);
      brandedToken = await BrandedToken.new(
        valueToken,
        'TST',
        'Test',
        decimals,
        10,
        5,
        accountProvider.get(),
        { from: deployer },
      );
    });

    it('Sets passed arguments correctly.', async () => {
      const gatewayComposer = await GatewayComposer.new(
        owner,
        valueToken,
        brandedToken.address,
        { from: deployer },
      );

      assert.strictEqual(await gatewayComposer.owner.call(), owner);
      assert.strictEqual(await gatewayComposer.valueToken.call(), valueToken);
      assert.strictEqual(
        await gatewayComposer.brandedToken.call(),
        brandedToken.address,
      );
    });
  });
});
