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

contract('UtilityBrandedToken::burn', async (accounts) => {

  let utilityBrandedTokenMock,
    internalActor,
    tokenHolder1,
    tokenHolder2,
    amount = 10,
    worker,
    accountProvider,
    tokenHolder1Balance = 100,
    burnAmount = 6;

  beforeEach(async function() {

    accountProvider = new AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 =  accountProvider.get();

    ({
      utilityBrandedTokenMock,
      worker
    } = await UtilityBrandedTokenUtils.createUtilityBrandedToken(
      accountProvider
    ));

    internalActor = [];
    internalActor.push(tokenHolder1);
    internalActor.push(tokenHolder2);
    await utilityBrandedTokenMock.registerInternalActor(
      internalActor,
      { from: worker },
    );

    await utilityBrandedTokenMock.setBalance(tokenHolder1, tokenHolder1Balance);

  });

  describe('Negative Tests', async () => {

    it('Reverts if ST prime is burned', async () => {

      await utilityBrandedTokenMock.settingCoGateway(tokenHolder2);
      await utilityBrandedTokenMock.mint(
        tokenHolder2,
        amount,
        { from: tokenHolder2 },
      );
      await utils.expectRevert(utilityBrandedTokenMock.burn(
        6,
        { value:web3.utils.toWei("0.5", "ether"),from: tokenHolder2 }),
        'Cannot burn ST prime.Only BT burn is allowed.',
        'msg.value is not 0',
      );

    });

  });

  describe('Storage', async () => {

    it('Validate the burning of tokens', async () => {

      let coGateway = tokenHolder2;
      await utilityBrandedTokenMock.settingCoGateway(coGateway);
      await utilityBrandedTokenMock.mint(
        coGateway,
        amount,
        { from: tokenHolder2 },
      );

      // Before burning
      assert.equal(await utilityBrandedTokenMock.balanceOf(coGateway), amount);
      assert.equal(await utilityBrandedTokenMock.totalSupply(), amount);

      await utilityBrandedTokenMock.burn(burnAmount, { from: coGateway });

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
        { from: tokenHolder2 },
      );

      let transactionResponse = await utilityBrandedTokenMock.burn(
        burnAmount,
        { from: coGateway },
      );

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
      },
      );

    });
  });
});
