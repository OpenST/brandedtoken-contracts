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
const web3 = require('../test_lib/web3.js');

const gatewayComposerUtils = require('./utils');

contract('GatewayComposer::revokeStakeRequest', async (accounts) => {
    describe('Negative Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Fails when owner is not the caller.', async () => {
            const {
                gatewayComposer,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const stakeRequestHash = web3.utils.soliditySha3('hash');
            utils.expectRevert(gatewayComposer.revokeStakeRequest(
                stakeRequestHash,
                { from: accountProvider.get() },
            ),
            'Should revert as msg.sender is not the owner.',
            'Only owner can call the function.');
        });

        it('Fails when requestHash is invalid.', async () => {
            const {
                gatewayComposer,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const invalidStakeRequestHash = web3.utils.soliditySha3('invalid');
            utils.expectRevert(gatewayComposer.revokeStakeRequest(
                invalidStakeRequestHash,
                { from: owner },
            ),
            'Should revert as stake request not found.',
            'Stake request not found.');
        });

        it('Fails when BrandedToken revokeStakeRequest returned false.', async () => {
            const {
                gatewayComposer,
                brandedToken,
                valueToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(
                accountProvider,
                false,
            );

            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const gateway = accountProvider.get();
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            const stakeRequestHash = await gatewayComposer.requestStake.call(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );
            const transactionResponse = await gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );
            assert.strictEqual(transactionResponse.receipt.status, true);

            utils.expectRevert(gatewayComposer.revokeStakeRequest(
                stakeRequestHash,
                { from: owner },
            ),
            'Should revert as BrandedToken revokeStakeRequest returned false.',
            'BrandedToken revokeStakeRequest returned false.');
        });
    });

    describe('Positive Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Returns true on successful execution.', async () => {
            const {
                gatewayComposer,
                brandedToken,
                valueToken,
                owner,
                ownerValueTokenBalance,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const gateway = accountProvider.get();
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            const stakeRequestHash = await gatewayComposer.requestStake.call(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );
            let transactionResponse = await gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );
            assert.strictEqual(transactionResponse.receipt.status, true);

            const executionStatus = await gatewayComposer.revokeStakeRequest.call(
                stakeRequestHash,
                { from: owner },
            );
            assert.strictEqual(executionStatus, true);

            transactionResponse = await gatewayComposer.revokeStakeRequest(
                stakeRequestHash,
                { from: owner },
            );
            assert.strictEqual(transactionResponse.receipt.status, true);

            // stakeRequestHash information is deleted
            const stakeRequest = await gatewayComposer.stakeRequests.call(
                stakeRequestHash,
            );
            assert.strictEqual(
                (stakeRequest.stakeVT).cmp(new BN(0)),
                0,
            );

            // Asserts owner balance
            assert.strictEqual(
                (await valueToken.balanceOf.call(owner)).cmp(ownerValueTokenBalance),
                0,
            );
        });
    });
});
