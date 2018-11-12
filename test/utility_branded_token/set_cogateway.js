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

contract('UtilityBrandedToken::burn', async (accounts) => {

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
    owner,
    worker,
    accountProvider,
    tokenHolder1Balance = 100,
    coGatewayMock;

  const SYMBOL = "MOCK",
    NAME = "Mock Token",
    DECIMALS = "5";

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    organization = accountProvider.get();
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
    tokenHolder3 =  accountProvider.get();
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
      {from: organization});

    utilityBrandedTokenMock = await UtilityBrandedTokenMock.new(
      valueToken.address,
      SYMBOL,
      NAME,
      DECIMALS,
      organizationMock.address,
      {from: organization}
    );

    coGatewayMock = await CoGatewayMock.new(
      utilityBrandedTokenMock.address
    );


    internalActor = [];
    internalActor.push(tokenHolder1);
    internalActor.push(tokenHolder3);
    await utilityBrandedTokenMock.registerInternalActor(
      internalActor,
      {from: worker}
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);

  });

  describe('Negative Tests', async () => {

    it('Reverts if non-worker address sets the cogateway.', async () => {

      let non_worker = accountProvider.get();
      await utils.expectRevert(utilityBrandedTokenMock.setCoGateway(
        coGatewayMock.address,
        {from: non_worker}),
        'Worker needs to be registered to set cogateway address.' ,
        'Only whitelisted worker is allowed to call.');

    });

    it('Reverts if coGateway address is already set.', async () => {

      await utilityBrandedTokenMock.setCoGateway(
        coGatewayMock.address,
        {from: worker}
      );

      let coGatewayMock2 = await CoGatewayMock.new(
        utilityBrandedTokenMock.address
      );

      await utils.expectRevert(utilityBrandedTokenMock.setCoGateway(
        coGatewayMock2.address,
        {from: worker}),
        'Cogateway address cannot be set again.' ,
        'CoGateway address already set.');

    });

    it('Reverts if CoGateway is linked with some other utility token.', async () => {

      let utilityBrandedTokenMock2 = await UtilityBrandedTokenMock.new(
        valueToken.address,
        SYMBOL,
        NAME,
        DECIMALS,
        organizationMock.address,
        {from: organization}
      );

      let coGatewayMock2 = await CoGatewayMock.new(
        utilityBrandedTokenMock2.address
      );

      await utils.expectRevert(utilityBrandedTokenMock.setCoGateway(
        coGatewayMock2.address,
        {from: worker}),
        'CoGateway is linked to other utility token' ,
        'CoGateway is linked with some other utility token.'
      );

    });

  });

  describe('Storage', async () => {

    it('Validate the cogateway address', async () => {

      await utilityBrandedTokenMock.setCoGateway(
        coGatewayMock.address,
        {from: worker}
      );

      assert.equal(
        await utilityBrandedTokenMock.coGateway.call(),
        coGatewayMock.address
      );

    });
  });

  describe('Events', async () => {

    it('Verify CoGatewaySet event', async () => {

      let transactionResponse = await utilityBrandedTokenMock.setCoGateway(
        coGatewayMock.address,
        {from: worker}
      );

      let events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1,
      );

      Event.assertEqual(events[0],{
        name: 'CoGatewaySet',
        args: {
          _utilityToken: utilityBrandedTokenMock.address,
          _coGateway: coGatewayMock.address
        }
      });

    });
  });
});
