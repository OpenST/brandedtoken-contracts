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

const BN = require('bn.js');
const { AccountProvider } = require('../test_lib/utils.js');
const BrandedTokenUtils = require('./utils.js');

contract('BrandedToken::convertToBrandedTokens', async () => {
  contract('Returns', async (accounts) => {
    it('Correctly converts to branded tokens', async () => {
      const accountProvider = new AccountProvider(accounts);

      const {
        brandedToken,
      } = await BrandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const conversionRate = await brandedToken.conversionRate();
      const conversionRateDecimals = await brandedToken.conversionRateDecimals();

      // Conversion without loss
      //      Depending on the conversion rate, some amounts
      //      converts without loss; e.g., when conversion is 1:3.5
      //      - conversionRate == 35
      //      - conversionRateDecimals == 1
      //      - 2 --> 7
      const valueTokensLossless = new BN(2);
      const brandedTokensLossless = await brandedToken
        .convertToBrandedTokens(valueTokensLossless);

      assert.strictEqual(
        brandedTokensLossless.cmp(
          valueTokensLossless
            .mul(conversionRate)
            .div(new BN(10).pow(conversionRateDecimals)),
        ),
        0,
      );

      assert.strictEqual(
        brandedTokensLossless.cmp(
          new BN(7),
        ),
        0,
      );

      // Conversion with loss
      //      At other amounts of value tokens, there will be loss
      //      due to Solidity not supportin fixed or floating point
      //      math; e.g., when conversion is 1:3.5
      //      - conversionRate == 35
      //      - conversionRateDecimals == 1
      //      - 1 --> 3, not 3.5
      const valueTokensLoss = new BN(1);
      const brandedTokensLoss = await brandedToken
        .convertToBrandedTokens(valueTokensLoss);

      assert.strictEqual(
        brandedTokensLoss.cmp(
          valueTokensLoss
            .mul(conversionRate)
            .div(new BN(10).pow(conversionRateDecimals)),
        ),
        0,
      );

      // 1 converts to 3, not 3.5, so there is a loss
      assert.strictEqual(
        brandedTokensLoss.cmp(
          new BN(3),
        ),
        0,
      );

      // N.B.: values above are miniscule, because the
      //       decimals for the test tokens are 18; consequently,
      //       the potential for and degree of loss
      //       as indicated above is considered acceptable
    });
  });
});
