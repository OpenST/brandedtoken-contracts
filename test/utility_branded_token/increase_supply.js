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
  AccountProvider =  utils.AccountProvider,
  { Event } = require('../test_lib/event_decoder.js');

contract('UtilityBrandedToken::increaseSupply', async (accounts) => {

  let testUtilityBrandedToken,
    internalActors,
    tokenHolder1,
    tokenHolder2,
    tokenHolder3,
    amount = 10,
    accountProvider,
    tokenHolder1Balance = 100,
    coGateway,
    worker;

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
    tokenHolder3 =  accountProvider.get();
    coGateway = accountProvider.get();

    internalActors = [];
    internalActors.push(tokenHolder1);
    internalActors.push(tokenHolder3);

    ({
      testUtilityBrandedToken,
      worker,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActors
    ));

    await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
    await testUtilityBrandedToken.mockSetCoGateway(coGateway);

  });

  describe('Negative Tests', async () => {

    it('Reverts if beneficiary address is not registered internal actor', async () => {

      await utils.expectRevert(
        testUtilityBrandedToken.increaseSupply(
          tokenHolder2,
          amount,
          { from: coGateway },
        ),
        'Beneficiary should be registered internal actor',
        'Beneficiary is not an economy actor.'
      );

    });

    it('Reverts if beneficiary address is empty', async () => {

      await utils.expectRevert(
        testUtilityBrandedToken.increaseSupply(
          '',
          amount,
          { from: coGateway },
        ),
        'Beneficiary address cannot be empty',
        'Beneficiary is not an economy actor.',
      );

    });

  });

  describe('Storage', async () => {

    it('Validate the minting of tokens', async () => {

      // Before minting
      assert.equal(await testUtilityBrandedToken.balanceOf(tokenHolder3), 0);
      assert.equal(await testUtilityBrandedToken.totalSupply(), 0);

      await testUtilityBrandedToken.increaseSupply(
        tokenHolder3,
        amount,
        { from: coGateway },
      );

      // After minting
      assert.equal(await testUtilityBrandedToken.totalSupply(), amount);
      assert.equal(await testUtilityBrandedToken.balanceOf(tokenHolder3), amount);

    });
  });

  describe('Events', async () => {

    it('Verify Minted event', async () => {

      let transactionResponse = await testUtilityBrandedToken.increaseSupply(
        tokenHolder3,
        amount,
        { from: coGateway },
      );

      let events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1,
      );
      
      Event.assertEqual(events[0],{
        name: 'Transfer',
        args: {
          _from: utils.NULL_ADDRESS,
          _to: tokenHolder3,
          _value: new web3.utils.BN(amount)
        },
      });

    });
  });
});
