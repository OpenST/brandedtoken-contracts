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

contract('ValueBrandedToken::transferFrom', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if msg.sender is not a transferor', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const from = accountProvider.get();
            const to = accountProvider.get();
            const amount = 0;
            const spender = accountProvider.get();

            await utils.expectRevert(
                valueBrandedToken.transferFrom(
                    from,
                    to,
                    amount,
                    { from: spender },
                ),
                'Should revert as msg.sender is not a transferor.',
                'Msg.sender is not a transferor.',
            );
        });

        it('Reverts if balance is less than transfer amount', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const from = accountProvider.get();
            const to = accountProvider.get();
            const amount = 1;
            const spender = accountProvider.get();

            await utils.expectRevert(
                valueBrandedToken.transferFrom(
                    from,
                    to,
                    amount,
                    { from: spender },
                ),
                'Should revert as balance is less than transfer amount.',
            );
        });

        it('Reverts if allowance is less than transfer amount', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const worker = accountProvider.get();
            const to = accountProvider.get();
            const amount = await valueBrandedToken.convert(valueTokens);
            const spender = accountProvider.get();

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            await utils.expectRevert(
                valueBrandedToken.transferFrom(
                    staker,
                    to,
                    amount,
                    { from: spender },
                ),
                'Should revert as allolwance is less than transfer amount.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits Transfer event', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
                gateway,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const worker = accountProvider.get();

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const amount = await valueBrandedToken.convert(valueTokens);

            // E.g., Gateway.stake
            const transactionResponse = await valueBrandedToken.transferFrom(
                staker,
                gateway,
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
                    _from: staker,
                    _to: gateway,
                    _value: amount,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully transfers', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
                gateway,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const worker = accountProvider.get();

            await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const amount = await valueBrandedToken.convert(valueTokens);
            const fromBalanceBefore = await valueBrandedToken.balanceOf(staker);
            const toBalanceBefore = await valueBrandedToken.balanceOf(gateway);
            const allowanceBefore = await valueBrandedToken.allowance(staker, gateway);

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

            assert.strictEqual(
                allowanceBefore.cmp(
                    amount,
                ),
                0,
            );

            // E.g., Gateway.stake
            await valueBrandedToken.transferFrom(
                staker,
                gateway,
                amount,
                { from: gateway },
            );

            const fromBalanceAfter = await valueBrandedToken.balanceOf(staker);
            const toBalanceAfter = await valueBrandedToken.balanceOf(gateway);
            const allowanceAfter = await valueBrandedToken.allowance(staker, gateway);

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

            assert.strictEqual(
                allowanceAfter.cmp(
                    (allowanceBefore.sub(amount)),
                ),
                0,
            );
        });
    });
});