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

contract('GatewayComposer::transferToken', async (accounts) => {
    describe('Negative Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Should Fail when owner is not the caller.', async () => {
            const {
                gatewayComposer,
                valueToken,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const to = accountProvider.get();
            const amount = new BN(10);
            utils.expectRevert(gatewayComposer.transferToken(
                valueToken.address,
                to,
                amount,
                { from: accountProvider.get() },
            ),
            'Should revert as msg.sender is not the owner.',
            'Only owner can call the function.');
        });

        it('Should fail when EIP20 token address is invalid.', async () => {
            const {
                gatewayComposer,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const to = accountProvider.get();
            const amount = new BN(10);
            utils.expectRevert(gatewayComposer.transferToken(
                utils.NULL_ADDRESS,
                to,
                amount,
                { from: owner },
            ),
            'Should revert as token address is null.',
            'EIP20 token address is null.');
        });

        it('Should fail when owner balance is not sufficient.', async () => {
            const {
                gatewayComposer,
                valueToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            // Set GC address balance to 0.
            await valueToken.setBalance(gatewayComposer.address, new BN(0));

            const to = accountProvider.get();
            const amount = new BN(10);
            utils.expectRevert(gatewayComposer.transferToken(
                valueToken.address,
                to,
                amount,
                { from: owner },
            ),
            "Should revert as owner doesn't have sufficient balance.");
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
            // Set GC address balance.
            await valueToken.setBalance(gatewayComposer.address, amount);
            const to = accountProvider.get();
            const executionStatus = await gatewayComposer.transferToken.call(
                valueToken.address,
                to,
                amount,
                { from: owner },
            );
            assert.strictEqual(executionStatus, true);
        });

        it('Validates destination address balance after calling transferToken.', async () => {
            const {
                gatewayComposer,
                valueToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const amount = new BN(10);
            // Set GC address balance.
            await valueToken.setBalance(gatewayComposer.address, amount);
            const to = accountProvider.get();
            const toBalanceBefore = await valueToken.balanceOf.call(to);
            const transactionResponse = await gatewayComposer.transferToken(
                valueToken.address,
                to,
                amount,
                { from: owner },
            );

            assert.strictEqual(transactionResponse.receipt.status, true);

            const toBalanceAfter = await valueToken.balanceOf.call(to);
            assert.strictEqual(
                toBalanceAfter.cmp(toBalanceBefore.add(amount)),
                0,
            );
        });
    });
});
