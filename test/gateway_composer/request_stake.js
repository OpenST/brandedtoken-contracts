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

const utils = require('../test_lib/utils');
const gatewayComposerUtils = require('./utils');


contract('GatewayComposer::requestStake', async (accounts) => {
    describe('Negative Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Fails when msg.sender is not owner.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
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
            utils.expectRevert(gatewayComposer.requestStake(
                0,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: accountProvider.get() },
            ),
            'Should revert because only owner can call requestStake.',
            'Only owner can call the function.');
        });

        it('Fails when stake amount is 0.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
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
            utils.expectRevert(gatewayComposer.requestStake(
                0,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            ),
            'Should revert because stake amount is zero.',
            'Stake amount is zero.');
        });

        it('Fails when minted amount is not equal to converted staked amount.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const invalidMintAmount = 0;
            const gateway = accountProvider.get();
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            utils.expectRevert(gatewayComposer.requestStake(
                stakeAmount,
                invalidMintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            ),
            'Should revert because minted BT is not equal to converted staked VT.',
            'Minted BT should be equal to converted staked VT.');
        });

        it('Fails when gateway address is null.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            utils.expectRevert(gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                utils.NULL_ADDRESS,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            ),
            'Should revert because gateway address is null.',
            'Gateway address is null.');
        });

        it('Fails when beneficiary address is null.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
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
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            utils.expectRevert(gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway,
                utils.NULL_ADDRESS,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            ),
            'Should revert because beneficiary address is null.',
            'Beneficiary address is null.');
        });

        it('Fails when gateway composer is not approved for staked value tokens.', async () => {
            const {
                gatewayComposer,
                owner,
                brandedToken,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const stakeAmount = 1;
            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const gateway = accountProvider.get();
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            utils.expectRevert(gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            ),
            'Should revert because ValueToken transferFrom returned false.');
        });
    });

    describe('Positive Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Returns stake request hash.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);
            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(
                stakeAmount,
            );
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
            assert.strictEqual(stakeRequestHash, utils.NULL_BYTES32);
        });

        it('Validates storage of state variables.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
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

            const stakeRequest = await gatewayComposer.stakeRequests.call(stakeRequestHash);
            assert.strictEqual(
                (stakeRequest.stakeVT).cmp(new BN(stakeAmount)),
                0,
            );
            assert.strictEqual(
                stakeRequest.gateway,
                gateway,
            );
            assert.strictEqual(
                stakeRequest.beneficiary,
                beneficiary,
            );
            assert.strictEqual(
                (stakeRequest.gasPrice).cmp(new BN(gasPrice)),
                0,
            );
            assert.strictEqual(
                (stakeRequest.gasLimit).cmp(new BN(gasLimit)),
                0,
            );
            assert.strictEqual(
                (stakeRequest.nonce).cmp(new BN(new BN(nonce))),
                0,
            );
        });
    });
});
