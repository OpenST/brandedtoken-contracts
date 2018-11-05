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
  AccountProvider =  utils.AccountProvider;

contract('UtilityBrandedToken::approve', async (accounts) => {

  let valueToken,
    organization,
    utilityBrandedTokenMock,
    internalActor,
    organizationMock,
    tokenHolder1,
    tokenHolder2,
    conversionRate = 5,
    conversionRateDecimals = 10,
    owner,
    worker,
    accountProvider,
    approvalAmount = 50,
    expirationHeight = 1000000,
    tokenHolder1Balance = 100;

  const SYMBOL = "MOCK",
    NAME = "Mock Token",
    DECIMALS = "5";

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    organization = accountProvider.get();
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
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

    await utilityBrandedTokenMock.registerInternalActor(
      internalActor,
      {from: worker}
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);

  });

  describe('Negative Tests', async () => {

    it('Reverts if spender address is not registered internal actor', async () => {

      await utils.expectRevert(utilityBrandedTokenMock.approve(
        tokenHolder2,
        approvalAmount,
        {from: tokenHolder1}
        ),
        'Approval to be given to should be registered internal actor',
        'spender is not an internal actor.'
      );

    });

  });

  describe('Storage', async () => {

    it('Approval to registered internal actor', async () => {

      internalActor.push(tokenHolder2);
      await utilityBrandedTokenMock.registerInternalActor(
        internalActor,
        {from: worker}
      );

      assert.equal(await utilityBrandedTokenMock.allowance(
        tokenHolder1,
        tokenHolder2
        ),
        0
      );

      await utilityBrandedTokenMock.approve(
        tokenHolder2,
        approvalAmount,
        {from: tokenHolder1}
      );

      assert.equal(await utilityBrandedTokenMock.allowance(
        tokenHolder1,
        tokenHolder2),
        approvalAmount
      );

    });
  });
});
