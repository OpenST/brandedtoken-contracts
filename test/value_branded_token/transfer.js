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

contract('ValueBrandedToken::transfer', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if msg.sender is not a transferor', async () => {
            const worker = accountProvider.get();
            // More code than necessary to test functionality, but
            // shows that staker cannot transfer tokens it holds
            // unless specified as a transferor
            const {
                valueBrandedToken,
                valueTokens,
                staker,
                gateway,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider, worker);

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const amount = await valueBrandedToken.convert(valueTokens);

            await utils.expectRevert(
                valueBrandedToken.transfer(
                    gateway,
                    amount,
                    { from: staker },
                ),
                'Should revert as msg.sender is not a transferor.',
                'Msg.sender is not a transferor.',
            );
        });

        it('Reverts if balance is less than transfer amount', async () => {
            const worker = accountProvider.get();
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(worker);

            const to = accountProvider.get();
            const amount = 1;
            const transferor = accountProvider.get();

            await utils.expectRevert(
                valueBrandedToken.transfer(
                    to,
                    amount,
                    { from: transferor },
                ),
                'Should revert as balance is less than transfer amount.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits Transfer event', async () => {
            const worker = accountProvider.get();
            const {
                valueBrandedToken,
                valueTokens,
                staker,
                gateway,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider, worker);

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const amount = await valueBrandedToken.convert(valueTokens);

            // E.g., Gateway.stake
            await valueBrandedToken.transferFrom(
                staker,
                gateway,
                amount,
                { from: gateway },
            );

            // E.g., Gateway.revert
            const transactionResponse = await valueBrandedToken.transfer(
                staker,
                amount,
                { from: gateway },
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
                'Only Transfer event should be emitted.',
            );

            Event.assertEqual(events[0], {
                name: 'Transfer',
                args: {
                    _from: gateway,
                    _to: staker,
                    _value: amount,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully transfers', async () => {
            const worker = accountProvider.get();
            const {
                valueBrandedToken,
                valueTokens,
                staker,
                gateway,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider, worker);

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const amount = await valueBrandedToken.convert(valueTokens);

            // E.g., Gateway.stake
            await valueBrandedToken.transferFrom(
                staker,
                gateway,
                amount,
                { from: gateway },
            );

            const fromBalanceBefore = await valueBrandedToken.balanceOf(gateway);
            const toBalanceBefore = await valueBrandedToken.balanceOf(staker);

            assert.strictEqual(
                fromBalanceBefore.cmp(
                    amount,
                ),
                0,
            );

            assert.strictEqual(
                toBalanceBefore.cmp(
                    new BN(0),
                ),
                0,
            );

            // E.g., Gateway.revert
            await valueBrandedToken.transfer(
                staker,
                amount,
                { from: gateway },
            );

            const fromBalanceAfter = await valueBrandedToken.balanceOf(gateway);
            const toBalanceAfter = await valueBrandedToken.balanceOf(staker);

            assert.strictEqual(
                fromBalanceAfter.cmp(
                    (fromBalanceBefore.sub(amount)),
                ),
                0,
            );

            assert.strictEqual(
                toBalanceAfter.cmp(
                    (toBalanceBefore.add(amount)),
                ),
                0,
            );
        });
    });
});