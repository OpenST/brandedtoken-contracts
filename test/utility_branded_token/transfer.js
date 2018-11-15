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
  UtilityBrandedTokenUtils = require('./utils'),
  AccountProvider =  utils.AccountProvider;

contract('UtilityBrandedToken::transfer', async (accounts) => {

  let utilityBrandedTokenMock,
    internalActor,
    tokenHolder1,
    tokenHolder2,
    worker,
    accountProvider,
    amount = 10,
    tokenHolder1Balance = 100;

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();

    ({
      utilityBrandedTokenMock,
      worker
    } = await UtilityBrandedTokenUtils.createUtilityBrandedToken(
      accountProvider
    ));

    internalActor = [];
    internalActor.push(tokenHolder1);

    await utilityBrandedTokenMock.registerInternalActor(
      internalActor,
      { from: worker },
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);

  });

  describe('Negative Tests', async () => {

    it('Reverts if to address is not registered internal actor', async () => {

      await utils.expectRevert(utilityBrandedTokenMock.transfer(
        tokenHolder2,
        amount,
        { from: tokenHolder1 }),
        'To address should be registered internal actor',
        'To address is not an internal actor.',
      );

    });

  });

  describe('Storage', async () => {

    it('Validate the transfer to internal actor', async () => {

      internalActor.push(tokenHolder2);

      await utilityBrandedTokenMock.registerInternalActor(
        internalActor,
        { from: worker },
      );

      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder2), 0);

      await utilityBrandedTokenMock.transfer(
        tokenHolder2,
        amount,
        { from: tokenHolder1 },
      );

      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder2),amount);

    });
  });
});
