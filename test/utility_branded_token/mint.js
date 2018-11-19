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

contract('UtilityBrandedToken::mint', async (accounts) => {

  let utilityBrandedTokenMock,
    internalActor,
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

    internalActor = [];
    internalActor.push(tokenHolder1);
    internalActor.push(tokenHolder3);

    ({
      utilityBrandedTokenMock,
      worker,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActor
    ));

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);
    await utilityBrandedTokenMock.mockSetCoGateway(coGateway);

  });

  describe('Negative Tests', async () => {

    it('Reverts if beneficiary address is not registered internal actor', async () => {

      await utils.expectRevert(
        utilityBrandedTokenMock.mint(
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
        utilityBrandedTokenMock.mint(
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
      assert.equal(await utilityBrandedTokenMock.balanceOf(tokenHolder3), 0);
      assert.equal(await utilityBrandedTokenMock.totalSupply(), 0);

      await utilityBrandedTokenMock.mint(
        tokenHolder3,
        amount,
        { from: coGateway },
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
        { from: coGateway },
      );

      let events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1,
      );

      Event.assertEqual(events[0],{
        name: 'Minted',
        args: {
          _beneficiary: tokenHolder3,
          _amount: new web3.utils.BN(amount),
          _totalSupply: new web3.utils.BN(amount),
          _utilityToken: utilityBrandedTokenMock.address
        },
      });

    });
  });
});
