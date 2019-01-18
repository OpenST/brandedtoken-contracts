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
const { AccountProvider } = require('../test_lib/utils.js');

const utils = require('../test_lib/utils');

const BrandedToken = artifacts.require('BrandedToken');

contract('BrandedToken::constructor', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        const symbol = 'BT';
        const name = 'BrandedToken';
        const decimals = 18;
        const organization = accountProvider.get();

        it('Reverts if valueToken is zero', async () => {
            const valueToken = utils.NULL_ADDRESS;
            const conversionRate = 35;
            const conversionRateDecimals = 1;

            await utils.expectRevert(
                BrandedToken.new(
                    valueToken,
                    symbol,
                    name,
                    decimals,
                    conversionRate,
                    conversionRateDecimals,
                    organization,
                ),
                'Should revert as valueToken is zero.',
                'ValueToken is zero.',
            );
        });

        it('Reverts if conversionRate is zero', async () => {
            const valueToken = accountProvider.get();
            const conversionRate = 0;
            const conversionRateDecimals = 1;

            await utils.expectRevert(
                BrandedToken.new(
                    valueToken,
                    symbol,
                    name,
                    decimals,
                    conversionRate,
                    conversionRateDecimals,
                    organization,
                ),
                'Should revert as conversionRate is zero.',
                'ConversionRate is zero.',
            );
        });

        it('Reverts if conversionRateDecimals is greater than 5', async () => {
            const valueToken = accountProvider.get();
            const conversionRate = 35;
            const conversionRateDecimals = 6;

            await utils.expectRevert(
                BrandedToken.new(
                    valueToken,
                    symbol,
                    name,
                    decimals,
                    conversionRate,
                    conversionRateDecimals,
                    organization,
                ),
                'Should revert as conversionRateDecimals is greater than 5.',
                'ConversionRateDecimals is greater than 5.',
            );
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        const symbol = 'BT';
        const name = 'BrandedToken';
        const decimals = 18;
        const organization = accountProvider.get();

        it('Successfully sets the constructor arguments', async () => {
            const valueToken = accountProvider.get();
            const conversionRate = 35;
            const conversionRateDecimals = 1;

            const brandedToken = await BrandedToken.new(
                valueToken,
                symbol,
                name,
                decimals,
                conversionRate,
                conversionRateDecimals,
                organization,
            );

            assert.strictEqual(
                (await brandedToken.valueToken()),
                valueToken,
            );

            assert.strictEqual(
                (await brandedToken.conversionRate()).cmp(
                    new BN(conversionRate),
                ),
                0,
            );

            assert.strictEqual(
                (await brandedToken.conversionRateDecimals()).cmp(
                    new BN(conversionRateDecimals),
                ),
                0,
            );
        });
    });
});
