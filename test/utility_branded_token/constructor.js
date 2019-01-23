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

const utils = require('../test_lib/utils');

const UtilityBrandedToken = artifacts.require('UtilityBrandedToken');
const EIP20TokenMock = artifacts.require('EIP20TokenMock');

contract('UtilityBrandedToken::constructor', async (accounts) => {
    let brandedToken;
    let organization;
    let accountProvider;

    const SYMBOL = 'MOCK';
    const NAME = 'Mock Token';
    const DECIMALS = '5';

    beforeEach(async () => {
        accountProvider = new utils.AccountProvider(accounts);
        organization = accountProvider.get();
        brandedToken = await EIP20TokenMock.new(
            SYMBOL,
            NAME,
            DECIMALS,
            { from: organization },
        );
    });

    describe('Negative Tests', async () => {
        it('Reverts if null address is passed as organization', async () => {
            await utils.expectRevert(UtilityBrandedToken.new(
                utils.NULL_ADDRESS,
                SYMBOL,
                NAME,
                DECIMALS,
                organization,
                { from: organization },
            ),
            'Token address is null',
            'Token address is null.');
        });
    });

    describe('Storage', async () => {
        it('Checks the branded token address', async () => {
            const utilityBrandedToken = await UtilityBrandedToken.new(
                brandedToken.address,
                SYMBOL,
                NAME,
                DECIMALS,
                organization,
                { from: organization },
            );

            assert.strictEqual(
                await utilityBrandedToken.brandedToken.call(),
                brandedToken.address,
                'Branded token address is incorrect',
            );
        });
    });
});
