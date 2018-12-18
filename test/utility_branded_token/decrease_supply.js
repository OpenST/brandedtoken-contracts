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
  AccountProvider = utils.AccountProvider,
  {Event} = require('../test_lib/event_decoder.js');

contract('UtilityBrandedToken::decreaseSupply', async (accounts) => {
  
  let testUtilityBrandedToken,
    internalActors,
    tokenHolder1,
    tokenHolder2,
    amount = 10,
    worker,
    accountProvider,
    tokenHolder1Balance = 100,
    burnAmount = 6;
  
  beforeEach(async function () {
    
    accountProvider = new AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();
    
    internalActors = [];
    internalActors.push(tokenHolder1);
    internalActors.push(tokenHolder2);
    
    ({
      testUtilityBrandedToken,
      worker,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActors
    ));
    
    await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
    
  });
  
  describe('Storage', async () => {
    
    it('Validate the burning of tokens', async () => {
      
      let coGateway = tokenHolder2;
      await testUtilityBrandedToken.mockSetCoGateway(coGateway);
      await testUtilityBrandedToken.increaseSupply(
        coGateway,
        amount,
        {from: tokenHolder2},
      );
      
      // Before decrease supply.
      assert.equal(await testUtilityBrandedToken.balanceOf(coGateway), amount);
      assert.equal(await testUtilityBrandedToken.totalSupply(), amount);
      
      await testUtilityBrandedToken.decreaseSupply(burnAmount, {from: coGateway});
      
      // After decrease supply.
      assert.equal(
        await testUtilityBrandedToken.balanceOf(coGateway),
        amount - burnAmount
      );
      assert.equal(
        await testUtilityBrandedToken.totalSupply(),
        amount - burnAmount
      );
      
    });
  });
  
  describe('Events', async () => {
    
    it('Verify Transfer event', async () => {
      
      let coGateway = tokenHolder2;
      await testUtilityBrandedToken.mockSetCoGateway(coGateway);
      await testUtilityBrandedToken.increaseSupply(
        coGateway,
        amount,
        {from: tokenHolder2},
      );
      
      let transactionResponse = await testUtilityBrandedToken.decreaseSupply(
        burnAmount,
        {from: coGateway},
      );
      
      let events = Event.decodeTransactionResponse(transactionResponse);
      
      assert.strictEqual(
        events.length,
        1,
      );
      
      Event.assertEqual(events[0], {
          name: 'Transfer',
          args: {
            _from: coGateway,
            _to: utils.NULL_ADDRESS,
            _value: new web3.utils.BN(burnAmount)
          }
        },
      );
      
    });
  });
});
