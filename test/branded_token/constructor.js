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

const BN = require('bn.js');
const { AccountProvider } = require('../test_lib/utils.js');

const MockBrandedToken = artifacts.require('MockBrandedToken');

contract('MockBrandedToken::constructor', async () => {

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Checks that passed arguments are set correctly.', async () => {

            const eip20Token = accountProvider.get();
            const conversionRate = 10;
            const conversionRateDecimals = 5;
            const organization = accountProvider.get();

            const brandedToken = await MockBrandedToken.new(
                eip20Token,
                conversionRate,
                conversionRateDecimals,
                organization,
            );

            assert.strictEqual(
                (await brandedToken.valueToken.call()),
                eip20Token,
            );

            const contractConversionRate = (await brandedToken.conversionRate.call());
            assert.strictEqual(
              contractConversionRate.cmp(new BN(conversionRate)),
                0,
            );

            const contractConversionRateDecimals = (await brandedToken.conversionRateDecimals.call());
            assert.strictEqual(
              contractConversionRateDecimals.cmp(new BN(conversionRateDecimals)),
              0,
            );

            assert.strictEqual(
                (await brandedToken.organization.call()),
                organization,
            );

        });
    });
});
