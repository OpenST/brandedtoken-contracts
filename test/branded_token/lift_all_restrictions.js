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

const { AccountProvider } = require('../test_lib/utils.js');

const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::liftAllRestrictions', async () => {
  contract('Negative Tests', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Reverts if msg.sender is not the organization', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
        false,
      );

      const nonOrganization = accountProvider.get();

      await utils.expectRevert(
        brandedToken.liftAllRestrictions(
          { from: nonOrganization },
        ),
        'Should revert as msg.sender is not the organization.',
        'Only the organization is allowed to call this method.',
      );
    });
  });

  contract('Storage', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Successfully lifts all restrictions', async () => {
      const {
        brandedToken,
        staker,
        worker,
      } = await brandedTokenUtils.setupBrandedTokenAndAcceptedStakeRequest(
        accountProvider,
      );

      const to = accountProvider.get();
      const brandedTokens = 1;

      await utils.expectRevert(
        brandedToken.transfer(
          to,
          brandedTokens,
          { from: staker },
        ),
        'Should revert as msg.sender is restricted.',
        'Msg.sender is restricted.',
      );

      assert.isOk(
        await brandedToken.liftAllRestrictions.call(
          { from: worker },
        ),
      );

      await brandedToken.liftAllRestrictions(
        { from: worker },
      );

      assert.isNotOk(
        await brandedToken.isUnrestricted(
          staker,
          { from: worker },
        ),
      );

      await brandedToken.transfer(
        to,
        brandedTokens,
        { from: staker },
      );
    });
  });
});
