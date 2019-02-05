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

const utils = require('../test_lib/utils');
const UtilityBrandedTokenUtils = require('./utils');
const { Event } = require('../test_lib/event_decoder.js');
const web3 = require('../test_lib/web3');

contract('UtilityBrandedToken::decreaseSupply', async (accounts) => {
  let testUtilityBrandedToken;
  let internalActors;
  let tokenHolder1;
  let tokenHolder2;
  let accountProvider;

  const amount = 10;
  const tokenHolder1Balance = 100;
  const decreasedAmount = 6;

  beforeEach(async () => {
    accountProvider = new utils.AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();

    internalActors = [];
    internalActors.push(tokenHolder1);
    internalActors.push(tokenHolder2);

    ({
      testUtilityBrandedToken,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActors,
    ));

    await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
  });

  describe('Storage', async () => {
    it('Correctly decreases the supply of tokens', async () => {
      const coGateway = tokenHolder2;
      await testUtilityBrandedToken.mockSetCoGateway(coGateway);
      await testUtilityBrandedToken.increaseSupply(
        coGateway,
        amount,
        { from: tokenHolder2 },
      );

      // Before decrease supply.
      assert.strictEqual(
        (await testUtilityBrandedToken.balanceOf(coGateway)).cmp(
          web3.utils.toBN(amount),
        ),
        0,
        `Balance of coGateway should be ${amount}`,
      );
      assert.strictEqual(
        (await testUtilityBrandedToken.totalSupply()).cmp(
          web3.utils.toBN(amount),
        ),
        0,
        `Total supply should be ${amount}`,
      );

      await testUtilityBrandedToken.decreaseSupply(decreasedAmount, { from: coGateway });

      // After decrease supply.
      assert.strictEqual(
        (await testUtilityBrandedToken.balanceOf(coGateway)).cmp(
          web3.utils.toBN(amount - decreasedAmount),
        ),
        0,
        `Balance of coGateway should be ${amount - decreasedAmount}`,
      );
      assert.strictEqual(
        (await testUtilityBrandedToken.totalSupply()).cmp(
          web3.utils.toBN(amount - decreasedAmount),
        ),
        0,
        `Total supply should be ${amount - decreasedAmount}`,
      );
    });
  });

  describe('Events', async () => {
    it('Emits a Transfer event', async () => {
      const coGateway = tokenHolder2;
      await testUtilityBrandedToken.mockSetCoGateway(coGateway);
      await testUtilityBrandedToken.increaseSupply(
        coGateway,
        amount,
        { from: tokenHolder2 },
      );

      const transactionResponse = await testUtilityBrandedToken.decreaseSupply(
        decreasedAmount,
        { from: coGateway },
      );

      const events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1,
      );

      Event.assertEqual(events[0], {
        name: 'Transfer',
        args: {
          _from: coGateway,
          _to: utils.NULL_ADDRESS,
          _value: new web3.utils.BN(decreasedAmount),
        },
      });
    });
  });
});
