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

const GatewayComposer = artifacts.require('GatewayComposer');

const utils = require('../test_lib/utils');

const AccountProvider = utils.AccountProvider;

contract('GatewayComposer::constructor', async (accounts) => {
    describe('Negative Tests', async () => {
        let accountProvider;
        let deployer;
        let owner;
        let valueToken;
        let brandedToken;

        beforeEach(async () => {
            accountProvider = new AccountProvider(accounts);
            deployer = accountProvider.get();
            owner = accountProvider.get();
            valueToken = accountProvider.get();
            brandedToken = accountProvider.get();
        });

        it('Reverts if owner address is null.', async () => {
            utils.expectRevert(GatewayComposer.new(
                utils.NULL_ADDRESS,
                valueToken,
                brandedToken,
                { from: deployer },
            ),
            'Owner address is null.');
        });

        it('Reverts if value token address is null.', async () => {
            utils.expectRevert(GatewayComposer.new(
                owner,
                utils.NULL_ADDRESS,
                brandedToken,
                { from: deployer },
            ),
            'Value token address is null.');
        });

        it('Reverts if branded token address is null.', async () => {
            utils.expectRevert(GatewayComposer.new(
                owner,
                valueToken,
                utils.NULL_ADDRESS,
                { from: deployer },
            ),
            'Branded token address is null.');
        });
    });

    describe('Storage', async () => {
        let accountProvider;
        let deployer;
        let owner;
        let valueToken;
        let brandedToken;

        beforeEach(async () => {
            accountProvider = new AccountProvider(accounts);
            deployer = accountProvider.get();
            owner = accountProvider.get();
            valueToken = accountProvider.get();
            brandedToken = accountProvider.get();
        });

        it('Checks that passed arguments are set correctly.', async () => {
            const gatewayComposer = await GatewayComposer.new(
                owner,
                valueToken,
                brandedToken,
                { from: deployer },
            );

            assert.strictEqual(await gatewayComposer.owner.call(), owner);
            assert.strictEqual(await gatewayComposer.valueToken.call(), valueToken);
            assert.strictEqual(await gatewayComposer.brandedToken.call(), brandedToken);
        });
    });
});
