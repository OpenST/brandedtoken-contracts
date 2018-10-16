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
const utils = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder');
const { AccountProvider } = require('../test_lib/utils.js');
const ValueBrandedTokenUtils = require('./utils.js');

contract('ValueBrandedToken::acceptStakeRequest', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if stake request is 0', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const nonStaker = accountProvider.get();
            const worker = accountProvider.get();

            await utils.expectRevert(
                valueBrandedToken.acceptStakeRequest(
                    nonStaker,
                    { from: worker },
                ),
                'Should revert as stake request is zero.',
                'Stake request is zero.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequestAccepted, Transfer, and Approval events', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const worker = accountProvider.get();

            const transactionResponse = await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const gateway = await valueBrandedToken.gateway.call();
            const valueBrandedTokens = await valueBrandedToken.convert.call(valueTokens);

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                3,
            );

            Event.assertEqual(events[0], {
                name: 'StakeRequestAccepted',
                args: {
                    _staker: staker,
                    _valueTokens: new BN(valueTokens),
                },
            });

            Event.assertEqual(events[1], {
                name: 'Transfer',
                args: {
                    _from: utils.NULL_ADDRESS,
                    _to: staker,
                    _value: valueBrandedTokens,
                },
            });

            Event.assertEqual(events[2], {
                name: 'Approval',
                args: {
                    _owner: staker,
                    _spender: gateway,
                    _value: valueBrandedTokens,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);
        const worker = accountProvider.get();

        it('Successfully deletes the stake request, mints value branded tokens, and sets allowance for gateway', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const gateway = await valueBrandedToken.gateway.call();
            const stakeRequestBefore = (await valueBrandedToken.stakeRequests(staker)).toNumber();
            const balanceBefore = (await valueBrandedToken.balanceOf(staker)).toNumber();
            const totalSupplyBefore = (await valueBrandedToken.totalSupply()).toNumber();
            const allowanceBefore = (await valueBrandedToken.allowance(staker, gateway)).toNumber();

            assert.isAbove(
                stakeRequestBefore,
                0,
            );

            assert.strictEqual(
                balanceBefore,
                0,
            );

            assert.strictEqual(
                totalSupplyBefore,
                0,
            );

            assert.strictEqual(
                allowanceBefore,
                0,
            );

            assert.isOk(
                await valueBrandedToken.acceptStakeRequest.call(
                    staker,
                    { from: worker },
                )
            );

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const valueBrandedTokens = (await valueBrandedToken.convert.call(valueTokens)).toNumber();
            const stakeRequestAfter = (await valueBrandedToken.stakeRequests(staker)).toNumber();
            const balanceAfter = (await valueBrandedToken.balanceOf(staker)).toNumber();
            const totalSupplyAfter = (await valueBrandedToken.totalSupply()).toNumber();
            const allowanceAfter = (await valueBrandedToken.allowance(staker, gateway)).toNumber();

            assert.strictEqual(
                stakeRequestAfter,
                0,
            );

            assert.strictEqual(
                balanceAfter,
                (balanceBefore + valueBrandedTokens),
            );

            assert.strictEqual(
                totalSupplyAfter,
                (totalSupplyBefore + valueBrandedTokens),
            );

            assert.strictEqual(
                allowanceAfter,
                (allowanceBefore + valueBrandedTokens),
            );
        });
    });
});