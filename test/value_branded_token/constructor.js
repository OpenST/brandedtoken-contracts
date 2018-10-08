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


const utils = require('../test_lib/utils.js');
const { AccountProvider } = require('../test_lib/utils.js');

const ValueBrandedToken = artifacts.require('ValueBrandedToken');

contract('ValueBrandedToken::constructor', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if valueToken is null', async () => {
            const valueToken = utils.NULL_ADDRESS;

            await utils.expectRevert(
                ValueBrandedToken.new(
                    valueToken,
                ),
                'Should revert as valueToken is null.',
                'ValueToken is null.',
            );
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully sets the constructor arguments', async () => {
            const valueToken = accountProvider.get();

            const valueBrandedToken = await ValueBrandedToken.new(
                valueToken,
            );

            assert.strictEqual(
                (await valueBrandedToken.valueToken.call()),
                valueToken,
            );
        });
    });
});