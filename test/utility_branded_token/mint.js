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
  CoGatewayMock = artifacts.require('CoGatewayMock'),
  AccountProvider =  utils.AccountProvider,
  { Event } = require('../test_lib/event_decoder.js');

contract('UtilityBrandedToken::mint', async (accounts) => {

  let valueToken,
    organization,
    utilityBrandedTokenMock,
    internalActor,
    organizationMock,
    tokenHolder1,
    tokenHolder2,
    tokenHolder3,
    conversionRate = 5,
    conversionRateDecimals = 10,
    amount = 10,
    owner,
    worker,
    accountProvider,
    expirationHeight = 1000000,
    tokenHolder1Balance = 100,
    coGatewayMock,
    coGateway;

  const SYMBOL = "MOCK",
    NAME = "Mock Token",
    DECIMALS = "5";

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    organization = accountProvider.get();
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
    tokenHolder3 =  accountProvider.get();
    coGateway = accountProvider.get();
    owner = accountProvider.get();
    worker = accountProvider.get();
    organizationMock = await OrganizationMock.new({from: owner});
    await organizationMock.setWorker(worker,expirationHeight, {from: owner});

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
    internalActor.push(tokenHolder3);

    await utilityBrandedTokenMock.registerInternalActor(
      internalActor,
      {from: worker}
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);
    await utilityBrandedTokenMock.settingCoGateway(coGateway);

  });

  describe('Negative Tests', async () => {

    it('Reverts if beneficiary address is not registered internal actor', async () => {

      await utils.expectRevert(
        utilityBrandedTokenMock.mint(
          tokenHolder2,
          amount,
          {from: coGateway}
        ),
        'Beneficiary should be registered internal actor',
        'beneficiary is not an economy actor.'
      );

    });

    it('Reverts if beneficiary address is empty', async () => {

      await utils.expectRevert(
        utilityBrandedTokenMock.mint(
          '',
          amount,
          {from: coGateway}
        ),
        'Beneficiary address cannot be empty',
        'beneficiary is not an economy actor.'
      );

    });

  });

  describe('Storage', async () => {

    it('Validate the minting', async () => {

      // Before minting
      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder3), 0);
      assert.equal(await utilityBrandedTokenMock.totalSupply(), 0);

      await utilityBrandedTokenMock.mint(
        tokenHolder3,
        amount,
        {from: coGateway}
      );

      // After minting
      assert.equal(await utilityBrandedTokenMock.totalSupply(), amount);
      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder3), amount);

    });
  });

  describe('Events', async () => {

    it('Verify Minted event', async () => {

      let transactionResponse = await utilityBrandedTokenMock.mint(
        tokenHolder3,
        amount,
        {from: coGateway}
      );

      let events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1
      );

      Event.assertEqual(events[0],{
        name: 'Minted',
        args: {
          _beneficiary: tokenHolder3,
          _amount: new web3.utils.BN(amount),
          _totalSupply: new web3.utils.BN(amount),
          _utilityToken: utilityBrandedTokenMock.address
        }
      });

    });
  });
});
