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

contract('GatewayComposer::acceptStakeRequest', async (accounts) => {
    describe('Negative Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Fails when requestHash is invalid.', async () => {
            const {
                gatewayComposer,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                facilitator,
            } = await gatewayComposerUtils.setupGatewayPass(
                accountProvider,
            );

            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('s');
            const v = 0;
            const hashLock = web3.utils.soliditySha3('hl');

            const invalidStakeRequestHash = web3.utils.soliditySha3('invalid');
            utils.expectRevert(gatewayComposer.acceptStakeRequest(
                invalidStakeRequestHash,
                r,
                s,
                v,
                hashLock,
                { from: facilitator },
            ),
            'Should revert as stake request not found.',
            'Stake request not found.');
        });

        it('Fails when BT.acceptStakeRequest() require fails.', async () => {
            const {
                gatewayComposer,
                valueToken,
                brandedToken,
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

            const {
                gateway,
                facilitator,
            } = await gatewayComposerUtils.setupGatewayPass(
                accountProvider,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            const stakeRequestHash = await gatewayComposer.requestStake.call(
                stakeAmount,
                mintAmount,
                gateway.address,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );

            const transactionResponse = await gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway.address,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );

            assert.strictEqual(transactionResponse.receipt.status, true);

            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('s');
            const v = 0;
            const hashLock = web3.utils.soliditySha3('hl');

            utils.expectRevert(gatewayComposer.acceptStakeRequest(
                stakeRequestHash,
                r,
                s,
                v,
                hashLock,
                { from: facilitator },
            ),
            'Should revert as BrandedToken acceptStakeRequest returned false.',
            'BrandedToken acceptStakeRequest returned false.');
        });

        it('Fails when Gateway.stake() require fails.', async () => {
            const {
                gatewayComposer,
                valueToken,
                brandedToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const {
                gateway,
                facilitator,
            } = await gatewayComposerUtils.setupGatewayFail(
                accountProvider,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            const stakeRequestHash = await gatewayComposer.requestStake.call(
                stakeAmount,
                mintAmount,
                gateway.address,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );

            const transactionResponse = await gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway.address,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );

            assert.strictEqual(transactionResponse.receipt.status, true);

            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('s');
            const v = 0;
            const hashLock = web3.utils.soliditySha3('hl');

            utils.expectRevert(gatewayComposer.acceptStakeRequest(
                stakeRequestHash,
                r,
                s,
                v,
                hashLock,
                { from: facilitator },
            ),
            'Should revert as Gateway.stake() execution failed.',
            'Gateway.stake() execution failed.');
        });
    });

    describe('Positive Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Returns message hash.', async () => {
            const {
                valueToken,
                gatewayComposer,
                brandedToken,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                stakeAmount,
            } = await gatewayComposerUtils.setupGatewayComposerRequestStake(
                valueToken,
                gatewayComposer,
                owner,
            );

            const {
                gateway,
                facilitator,
            } = await gatewayComposerUtils.setupGatewayPass(
                accountProvider,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            const stakeRequestHash = await gatewayComposer.requestStake.call(
                stakeAmount,
                mintAmount,
                gateway.address,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );

            let transactionResponse = await gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway.address,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );

            assert.strictEqual(transactionResponse.receipt.status, true);

            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('s');
            const v = 0;
            const hashLock = web3.utils.soliditySha3('hl');
            const messageHash = await gatewayComposer.acceptStakeRequest.call(
                stakeRequestHash,
                r,
                s,
                v,
                hashLock,
                { from: facilitator },
            );
            assert.strictEqual(messageHash, utils.NULL_BYTES32);

            transactionResponse = await gatewayComposer.acceptStakeRequest(
                stakeRequestHash,
                r,
                s,
                v,
                hashLock,
                { from: facilitator },
            );
            assert.strictEqual(transactionResponse.receipt.status, true);

            // Asserts stakeRequestHash hash been deleted.
            const stakeRequest = await gatewayComposer.stakeRequests.call(
                stakeRequestHash,
            );
            assert.strictEqual(stakeRequest.stakeVT.cmp(new BN(0)), 0);

            // Validated that stakeRequestHash is present in BT.stakeRequestHashes
            const btStakeRequest = await brandedToken.stakeRequests.call(
                stakeRequestHash,
            );
            assert.strictEqual(
                btStakeRequest.staker,
                utils.NULL_ADDRESS,
            );
        });
    });
});
