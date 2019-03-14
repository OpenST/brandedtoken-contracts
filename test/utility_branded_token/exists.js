// Copyright 2019 OpenST Ltd.
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

contract('UtilityBrandedToken::constructor', async (accounts) => {
  let accountProvider;

  beforeEach(async () => {
    accountProvider = new utils.AccountProvider(accounts);
  });

  describe('Returns', async () => {
    it('Returns false if account is not an internal actor', async () => {
      const actor = await accountProvider.get();
      const {
        testUtilityBrandedToken,
      } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
        accountProvider,
        [actor],
      );

      const nonInternalAccount = await accountProvider.get();

      assert.strictEqual(
        await testUtilityBrandedToken.exists.call(nonInternalAccount),
        false,
        'It should return false for non internal actor',
      );
    });

    it('Returns true if account is an internal actor', async () => {
      const actor = await accountProvider.get();
      const {
        testUtilityBrandedToken,
      } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
        accountProvider,
        [actor],
      );

      assert.strictEqual(
        await testUtilityBrandedToken.exists.call(actor),
        true,
        'It should returns for an internal actor',
      );
    });
  });
});
