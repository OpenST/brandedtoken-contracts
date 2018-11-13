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

const utils = require('../test_lib/utils'),
  UtilityBrandedTokenMock = artifacts.require('UtilityBrandedTokenMock'),
  EIP20TokenMock = artifacts.require('EIP20TokenMock'),
  OrganizationMock = artifacts.require('OrganizationMock'),
  AccountProvider =  utils.AccountProvider,
  { Event } = require('../test_lib/event_decoder.js');

contract('UtilityBrandedToken::burn', async (accounts) => {

  let valueToken,
    organization,
    utilityBrandedTokenMock,
    internalActor,
    organizationMock,
    tokenHolder1,
    tokenHolder2,
    conversionRate = 5,
    conversionRateDecimals = 10,
    amount = 10,
    owner,
    worker,
    accountProvider,
    tokenHolder1Balance = 100,
    burnAmount = 6;

  const SYMBOL = "MOCK",
    NAME = "Mock Token",
    DECIMALS = "5";

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    organization = accountProvider.get();
    tokenHolder1 = accountProvider.get();
    tokenHolder2 =  accountProvider.get();
    owner = accountProvider.get();
    worker = accountProvider.get();
    organizationMock = await OrganizationMock.new({from: owner});
    await organizationMock.setWorker(worker, {from: owner});

    valueToken = await EIP20TokenMock.new(
      conversionRate,
      conversionRateDecimals,
      SYMBOL,
      NAME,
      DECIMALS,
      {from: organization}
    );

    utilityBrandedTokenMock = await UtilityBrandedTokenMock.new(
      valueToken.address,
      SYMBOL,
      NAME,
      DECIMALS,
      organizationMock.address,
      {from: organization}
    );

    internalActor = [];
    internalActor.push(tokenHolder1);
    internalActor.push(tokenHolder2);
    await utilityBrandedTokenMock.registerInternalActor(
      internalActor,
      {from: worker}
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);

  });

  describe('Negative Tests', async () => {

    it('Reverts if ST prime is burned.', async () => {

      await utilityBrandedTokenMock.settingCoGateway(tokenHolder2);
      await utilityBrandedTokenMock.mint(
        tokenHolder2,
        amount,
        {from: tokenHolder2}
      );
      await utils.expectRevert(utilityBrandedTokenMock.burn(
        6,
        {value:web3.utils.toWei("0.5", "ether"),from: tokenHolder2}),
        'Cannot burn ST prime.Only BT burn is allowed.',
        'msg.value is not 0');

    });

  });

  describe('Storage', async () => {

    it('Validate the burning', async () => {

      let coGateway = tokenHolder2;
      await utilityBrandedTokenMock.settingCoGateway(coGateway);
      await utilityBrandedTokenMock.mint(
        coGateway,
        amount,
        {from: tokenHolder2}
      );

      // Before burning
      assert.equal(await utilityBrandedTokenMock.balanceOf(coGateway), amount);
      assert.equal(await utilityBrandedTokenMock.totalSupply(), amount);

      await utilityBrandedTokenMock.burn(burnAmount, {from: coGateway});

      // After burning
      assert.equal(await utilityBrandedTokenMock.balanceOf(coGateway), amount - burnAmount);
      assert.equal(await utilityBrandedTokenMock.totalSupply(), amount - burnAmount);

    });
  });

  describe('Events', async () => {

    it('Verify Burnt event', async () => {

      let coGateway = tokenHolder2;
      await utilityBrandedTokenMock.settingCoGateway(coGateway);
      await utilityBrandedTokenMock.mint(
        coGateway,
        amount,
        {from: tokenHolder2}
      );

      let transactionResponse = await utilityBrandedTokenMock.burn(burnAmount, {from: coGateway});

      let events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1,
      );

      Event.assertEqual(events[0],{
        name: 'Burnt',
        args: {
          _account: coGateway,
          _amount: new web3.utils.BN(burnAmount),
          _totalSupply: new web3.utils.BN(amount - burnAmount),
          _utilityToken: utilityBrandedTokenMock.address
        }
      });

    });
  });
});
