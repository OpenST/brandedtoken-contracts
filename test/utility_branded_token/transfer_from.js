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

contract('UtilityBrandedToken::transferFrom', async (accounts) => {

  let utilityBrandedTokenMock,
    internalActors,
    tokenHolder1,
    tokenHolder2,
    tokenHolder3,
    amount = 10,
    worker,
    accountProvider,
    approvalAmount = 50,
    tokenHolder1Balance = 100;

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
    tokenHolder3 =  accountProvider.get();
    worker = accountProvider.get();

    internalActors = [];
    internalActors.push(tokenHolder1);
    internalActors.push(tokenHolder3);

    ({
      utilityBrandedTokenMock,
      worker,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActors
    ));

    await utilityBrandedTokenMock.registerInternalActor(
      internalActors,
      { from: worker },
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);

    await utilityBrandedTokenMock.approve(
      tokenHolder3,
      approvalAmount,
      { from: tokenHolder1 },
    );

  });

  describe('Negative Tests', async () => {

    it('Reverts if to address is not registered internal actor', async () => {

      await utils.expectRevert(utilityBrandedTokenMock.transferFrom(
        tokenHolder1,
        tokenHolder2,
        amount,
        { from: tokenHolder3 }),
        'To address should be registered internal actor',
        'To address is not an internal actor.',
      );

    });

  });

  describe('Storage', async () => {

    it('Validate the transfer to internal actor', async () => {

      internalActors.push(tokenHolder2);
      await utilityBrandedTokenMock.registerInternalActor(
        internalActors,
        { from: worker }
      );
      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder2), 0);

      await utilityBrandedTokenMock.transferFrom(
        tokenHolder1,
        tokenHolder2,
        amount,
        { from: tokenHolder3 },
      );

      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder2),amount);

    });
  });
});
