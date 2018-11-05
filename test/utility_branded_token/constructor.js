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
  UtilityBrandedToken = artifacts.require('UtilityBrandedToken'),
  EIP20TokenMock = artifacts.require('EIP20TokenMock'),
  AccountProvider =  utils.AccountProvider;

contract('UtilityBrandedToken::constructor', async (accounts) => {

  let valueToken,
    organization,
    accountProvider,
    conversionRate = 5,
    conversionRateDecimals = 10;

  const SYMBOL = "MOCK",
    NAME = "Mock Token",
    DECIMALS = "5";

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    organization = accountProvider.get();
    valueToken = await EIP20TokenMock.new(
      conversionRate,
      conversionRateDecimals,
      SYMBOL,
      NAME,
      DECIMALS,
      {from: organization}
    );

  });

  describe('Negative Tests', async () => {

    it('Reverts if null address is passed as organization', async () => {

      utils.expectRevert(UtilityBrandedToken.new(
        utils.NULL_ADDRESS,
        SYMBOL,
        NAME,
        DECIMALS,
        organization,
        {from: organization}),
        'Token address is null',
        'Token address is null.'
      );

    });

  });

  describe('Storage', async () => {

    it('Checks the value token address', async () => {

      let utilityBrandedToken = await UtilityBrandedToken.new(
            valueToken.address,
            SYMBOL,
            NAME,
            DECIMALS,
            organization,
            {from: organization});

      assert.equal(await utilityBrandedToken.valueToken.call(), valueToken.address);

    });
  });
});
