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

contract('BrandedToken::acceptStakeRequest', async () => {
    // TODO: add negative tests

    contract('Event', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequestAccepted and Transfer events', async () => {
            const {
                brandedToken,
                staker,
                stake,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
            );

            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('r');
            const v = 0;
            const worker = accountProvider.get();

            const transactionResponse = await brandedToken.acceptStakeRequest(
                stakeRequestHash,
                r,
                s,
                v,
                { from: worker },
            );

            const mint = await brandedToken.convertToBrandedTokens(stake);

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                2,
            );

            Event.assertEqual(events[0], {
                name: 'StakeRequestAccepted',
                args: {
                    _staker: staker,
                    _stake: new BN(stake),
                },
            });

            Event.assertEqual(events[1], {
                name: 'Transfer',
                args: {
                    _from: utils.NULL_ADDRESS,
                    _to: staker,
                    _value: mint,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully mints branded tokens', async () => {
            const {
                brandedToken,
                staker,
                stake,
                stakeRequestHash,
            } = await brandedTokenUtils.setupBrandedTokenAndStakeRequest(
                accountProvider,
            );

            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('r');
            const v = 0;
            const worker = accountProvider.get();

            assert.isOk(
                await brandedToken.acceptStakeRequest.call(
                    stakeRequestHash,
                    r,
                    s,
                    v,
                    { from: worker },
                ),
            );

            brandedToken.acceptStakeRequest(
                stakeRequestHash,
                r,
                s,
                v,
                { from: worker },
            );

            const mint = await brandedToken.convertToBrandedTokens(stake);

            assert.strictEqual(
                mint.cmp(
                    await brandedToken.balanceOf(staker),
                ),
                0,
            );

            assert.strictEqual(
                mint.cmp(
                    await brandedToken.totalSupply(),
                ),
                0,
            );
        });
    });
});
