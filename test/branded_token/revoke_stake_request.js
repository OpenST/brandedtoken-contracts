// Copyright 2019 OpenST Ltd.
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

const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::revokeStakeRequest', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if msg.sender is not staker', async () => {
            const {
                brandedToken,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
            );

            const nonStaker = accountProvider.get();

            await utils.expectRevert(
                brandedToken.revokeStakeRequest(
                    stakeRequestHash,
                    { from: nonStaker },
                ),
                'Should revert as msg.sender is not staker.',
                'Msg.sender is not staker.',
            );
        });

        it('Reverts if valueToken.transfer returns false', async () => {
            const {
                brandedToken,
                staker,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
                true,
                false,
            );

            await utils.expectRevert(
                brandedToken.revokeStakeRequest(
                    stakeRequestHash,
                    { from: staker },
                ),
                'Should revert as valueToken.transfer returned false.',
                'ValueToken.transfer returned false.',
            );
        });
    });

    contract('Event', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequestRevoked event', async () => {
            const {
                brandedToken,
                staker,
                stake,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
            );

            const transactionResponse = await brandedToken.revokeStakeRequest(
                stakeRequestHash,
                { from: staker },
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
            );

            Event.assertEqual(events[0], {
                name: 'StakeRequestRevoked',
                args: {
                    _stakeRequestHash: stakeRequestHash,
                    _staker: staker,
                    _stake: new BN(stake),
                },
            });
        });
    });

    // TODO: add storage tests
});
