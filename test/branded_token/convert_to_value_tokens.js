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

contract('BrandedToken::convertToValueTokens', async () => {
  contract('Returns', async (accounts) => {
    it('Correctly converts to value tokens', async () => {
      const accountProvider = new AccountProvider(accounts);

      const {
        brandedToken,
      } = await BrandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const conversionRate = await brandedToken.conversionRate();
      const conversionRateDecimals = await brandedToken.conversionRateDecimals();

      // Conversion without loss
      //      An amount equal to multiples of the conversionRate
      //      converts without loss; e.g., when conversion is 1:3.5
      //      - conversionRate == 35
      //      - conversionRateDecimals == 1
      //      - 35 --> 10
      const brandedTokensLossless = conversionRate;
      const valueTokensLossless = await brandedToken
        .convertToValueTokens(brandedTokensLossless);

      assert.strictEqual(
        valueTokensLossless.cmp(
          brandedTokensLossless
            .mul(new BN(10).pow(conversionRateDecimals))
            .div(conversionRate),
        ),
        0,
      );

      assert.strictEqual(
        valueTokensLossless.cmp(
          new BN(10),
        ),
        0,
      );

      // Conversion with loss
      //      At other amounts of branded tokens there will be loss
      //      due to Solidity not supportin fixed or floating point
      //      math; e.g., when conversion is 1:3.5
      //      - conversionRate == 35
      //      - conversionRateDecimals == 1
      //      - 36 --> 10 value tokens, not 10.2
      const brandedTokensLoss = conversionRate.addn(1);
      const valueTokensLoss = await brandedToken
        .convertToValueTokens(brandedTokensLoss);

      assert.strictEqual(
        valueTokensLoss.cmp(
          brandedTokensLoss
            .mul(new BN(10).pow(conversionRateDecimals))
            .div(conversionRate),
        ),
        0,
      );

      // 36 also converts into 10 so there is a loss in the conversion
      assert.strictEqual(
        valueTokensLoss.cmp(
          new BN(10),
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
