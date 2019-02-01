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

const utils = require('../test_lib/utils');
const web3 = require('../test_lib/web3');
const UtilityBrandedTokenUtils = require('./utils');

contract('UtilityBrandedToken::approve', async (accounts) => {
  let testUtilityBrandedToken;
  let internalActors;
  let tokenHolder1;
  let tokenHolder2;
  let worker;
  let accountProvider;

  const approvalAmount = 50;
  const tokenHolder1Balance = 100;

  beforeEach(async () => {
    accountProvider = new utils.AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder2 = accountProvider.get();

    internalActors = [];
    internalActors.push(tokenHolder1);

    ({
      testUtilityBrandedToken,
      worker,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActors,
    ));

    await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
  });

  describe('Negative Tests', async () => {
    it('Reverts if spender address is not registered internal actor', async () => {
      await utils.expectRevert(testUtilityBrandedToken.approve(
        tokenHolder2,
        approvalAmount,
        { from: tokenHolder1 },
      ),
      'Approval to be given to should be registered internal actor',
      'Spender is not an internal actor.');
    });
  });

  describe('Storage', async () => {
    it('Successfully approves registered internal actor', async () => {
      internalActors.push(tokenHolder2);
      await testUtilityBrandedToken.registerInternalActor(
        internalActors,
        { from: worker },
      );

      assert.strictEqual((await testUtilityBrandedToken.allowance(
        tokenHolder1,
        tokenHolder2,
      )).cmp(web3.utils.toBN(0)),
      0,
      'Allowance should be 0');

      await testUtilityBrandedToken.approve(
        tokenHolder2,
        approvalAmount,
        { from: tokenHolder1 },
      );

      assert.strictEqual((await testUtilityBrandedToken.allowance(
        tokenHolder1,
        tokenHolder2,
      )).cmp(web3.utils.toBN(approvalAmount)),
      0,
      `Allowance should be equal to ${approvalAmount}`);
    });
  });
});
