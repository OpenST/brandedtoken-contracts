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
const { Event } = require('../test_lib/event_decoder.js');

const web3 = require('../test_lib/web3.js');
const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::rejectStakeRequest', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if msg.sender is not a worker', async () => {
            const {
                brandedToken,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
                false, // Use OrganizationMockFail
            );

            const nonWorker = accountProvider.get();

            await utils.expectRevert(
                brandedToken.rejectStakeRequest(
                    stakeRequestHash,
                    { from: nonWorker },
                ),
                'Should revert as msg.sender is not a worker.',
                'Only whitelisted workers are allowed to call this method.',
            );
        });

        it('Reverts if stake request not found', async () => {
            const {
                brandedToken,
            } = await brandedTokenUtils.setupBrandedToken(
                accountProvider,
            );

            const worker = accountProvider.get();
            const stakeRequestHash = web3.utils.utf8ToHex('stakeRequestHash');

            await utils.expectRevert(
                brandedToken.rejectStakeRequest(
                    stakeRequestHash,
                    { from: worker },
                ),
                'Should revert as stake request not found.',
                'Stake request not found.',
            );
        });

        it('Reverts if valueToken.transfer returns false', async () => {
            const {
                brandedToken,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
                true,
                false, // Use EIP20TokenMockPassFail
            );

            const worker = accountProvider.get();

            await utils.expectRevert(
                brandedToken.rejectStakeRequest(
                    stakeRequestHash,
                    { from: worker },
                ),
                'Should revert as valueToken.transfer returned false.',
                'ValueToken.transfer returned false.',
            );
        });
    });

    contract('Event', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequestRejected', async () => {
            const {
                brandedToken,
                staker,
                stake,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
            );

            const worker = accountProvider.get();

            const transactionResponse = await brandedToken.rejectStakeRequest(
                stakeRequestHash,
                { from: worker },
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
            );

            Event.assertEqual(events[0], {
                name: 'StakeRequestRejected',
                args: {
                    _stakeRequestHash: stakeRequestHash,
                    _staker: staker,
                    _stake: new BN(stake),
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully revokes stake request', async () => {
            const {
                brandedToken,
                staker,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
            );

            const worker = accountProvider.get();

            assert.isOk(
                await brandedToken.rejectStakeRequest.call(
                    stakeRequestHash,
                    { from: worker },
                ),
            );

            await brandedToken.rejectStakeRequest(
                stakeRequestHash,
                { from: worker },
            );

            assert.strictEqual(
                await brandedToken.stakeRequestHashes(staker),
                utils.NULL_BYTES32,
            );

            const stakeRequest = await brandedToken.stakeRequests(stakeRequestHash);

            assert.strictEqual(
                stakeRequest.staker,
                utils.NULL_ADDRESS,
            );

            assert.strictEqual(
                stakeRequest.stake.cmp(
                    new BN(0),
                ),
                0,
            );

            assert.strictEqual(
                stakeRequest.nonce.cmp(
                    new BN(0),
                ),
                0,
            );
        });
    });
});
