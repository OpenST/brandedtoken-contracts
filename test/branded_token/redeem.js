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

const brandedTokenUtils = require('./utils');

contract('BrandedToken::redeem', async () => {
    // TODO: add negative tests

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully redeems branded tokens', async () => {
            const {
                brandedToken,
                staker,
            } = await brandedTokenUtils.setupBrandedTokenAndAcceptedStakeRequest(
                accountProvider,
            );

            // At a conversion rate of 3.5, 4 branded tokens (least divisible unit)
            // evaluates to 1 value token (least divisible unit)
            const brandedTokens = 4;
            const totalSupplyBefore = await brandedToken.totalSupply();
            const balanceBefore = await brandedToken.balanceOf(staker);

            assert.isOk(
                await brandedToken.redeem.call(
                    brandedTokens,
                    { from: staker },
                ),
            );

            await brandedToken.redeem(
                brandedTokens,
                { from: staker },
            );

            const totalSupplyAfter = await brandedToken.totalSupply();
            const balanceAfter = await brandedToken.balanceOf(staker);

            assert.strictEqual(
                totalSupplyAfter.cmp(
                    totalSupplyBefore.subn(brandedTokens),
                ),
                0,
            );

            assert.strictEqual(
                balanceAfter.cmp(
                    balanceBefore.subn(brandedTokens),
                ),
                0,
            );
        });
    });
});
