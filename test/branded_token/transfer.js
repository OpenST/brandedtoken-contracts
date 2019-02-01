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

const { AccountProvider } = require('../test_lib/utils.js');

const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::transfer', async () => {
  contract('Negative Tests', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Reverts if msg.sender is restricted', async () => {
      const {
        brandedToken,
        staker,
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
    });
  });

  contract('Storage', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Successfully transfers branded tokens', async () => {
      const {
        brandedToken,
        staker,
        worker,
      } = await brandedTokenUtils.setupBrandedTokenAndAcceptedStakeRequest(
        accountProvider,
      );

      const to = accountProvider.get();
      const brandedTokens = 1;
      const restrictionLifted = [staker];

      await brandedToken.liftRestriction(
        restrictionLifted,
        { from: worker },
      );

      assert.isOk(
        await brandedToken.transfer.call(
          to,
          brandedTokens,
          { from: staker },
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
