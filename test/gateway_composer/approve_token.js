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
const utils = require('../test_lib/utils');
const { AccountProvider } = require('../test_lib/utils.js');

const gatewayComposerUtils = require('./utils');

contract('GatewayComposer::approveToken', async (accounts) => {
    describe('Negative Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Fails when owner is not the caller.', async () => {
            const {
                gatewayComposer,
                valueToken,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const spender = accountProvider.get();
            const amount = new BN(10);
            utils.expectRevert(gatewayComposer.approveToken(
                valueToken.address,
                spender,
                amount,
                { from: accountProvider.get() },
            ),
            'Should revert as msg.sender is not the owner.',
            'Only owner can call the function.');
        });

        it('Fails when EIP20 token address is invalid.', async () => {
            const {
                gatewayComposer,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const to = accountProvider.get();
            const amount = new BN(10);
            utils.expectRevert(gatewayComposer.approveToken(
                utils.NULL_ADDRESS,
                to,
                amount,
                { from: owner },
            ),
            'Should revert as token address is null.',
            'EIP20 token address is zero.');
        });
    });

    describe('Positive Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Returns true on successful execution.', async () => {
            const {
                gatewayComposer,
                valueToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const amount = new BN(10);
            // Set GatewayComposer address balance.
            await valueToken.setBalance(gatewayComposer.address, amount);
            const to = accountProvider.get();
            const executionStatus = await gatewayComposer.approveToken.call(
                valueToken.address,
                to,
                amount,
                { from: owner },
            );
            assert.strictEqual(executionStatus, true);
        });

        it('Validates destination address allowance after calling approveToken.', async () => {
            const {
                gatewayComposer,
                valueToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const amount = new BN(10);
            // Set GatewayComposer address balance.
            await valueToken.setBalance(gatewayComposer.address, amount);
            const to = accountProvider.get();
            await gatewayComposer.approveToken(
                valueToken.address,
                to,
                amount,
                { from: owner },
            );

            const toAllowanceAfter = await valueToken.allowance.call(
                gatewayComposer.address,
                to,
            );
            assert.strictEqual(
                toAllowanceAfter.cmp(amount),
                0,
            );
        });
    });
});
