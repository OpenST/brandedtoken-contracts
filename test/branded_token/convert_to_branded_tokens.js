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


const BN = require('bn.js');
const utils = require('../test_lib/utils.js');
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
            const valueTokens = new BN(1);
            const brandedTokens = await brandedToken.convertToBrandedTokens(valueTokens);

            // TODO: test to reflect the potential for loss in conversion
            // TODO: test to reflect actual expected number and not just operations (as in test below)
            assert.strictEqual(
                brandedTokens.cmp(
                    valueTokens.mul(conversionRate).div(new BN(10).pow(conversionRateDecimals)),
                ),
                0,
            );
        });
    });
});