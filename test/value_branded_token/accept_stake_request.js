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

        it('Reverts if gateway is not set', async () => {
           const { valueBrandedToken, worker } = await
             ValueBrandedTokenUtils.createValueBrandedToken(
               accountProvider
             );

           const nonStaker = accountProvider.get();

           await utils.expectRevert(
               valueBrandedToken.acceptStakeRequest(
                   nonStaker,
                   { from: worker },
               ),
               'Should revert as gateway is not set.',
               'Gateway is not set.',
           );
        });

        it('Reverts if stake request is 0', async () => {
          const { valueBrandedToken, worker } = await
            ValueBrandedTokenUtils.createValueBrandedToken(
              accountProvider
            );

            const gateway = accountProvider.get();
            const nonStaker = accountProvider.get();

            await valueBrandedToken.setGateway(
                gateway,
              { from: worker }
            );

            await utils.expectRevert(
                valueBrandedToken.acceptStakeRequest(
                    nonStaker,
                    { from: worker },
                ),
                'Should revert as stake request is zero.',
                'Stake request is zero.',
            );
        });

        it('Reverts if worker is not set', async () => {

          const { valueBrandedToken } = await
            ValueBrandedTokenUtils.createValueBrandedToken(
              accountProvider
            );

          const staker = accountProvider.get();
          const nonWorker = accountProvider.get();

          await utils.expectRevert(
            valueBrandedToken.acceptStakeRequest(
              staker,
              { from: nonWorker },
            ),
            'Should revert as worker is not registered.',
            'Only whitelisted worker is allowed to call.',
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
                gateway,
                worker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(
              accountProvider
            );

            const transactionResponse = await valueBrandedToken.acceptStakeRequest(
                staker,
                { from: worker },
            );

            const valueBrandedTokens = await valueBrandedToken.convert(valueTokens);

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

        it('Successfully deletes the stake request, mints value branded tokens, and sets allowance for gateway', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
                gateway,
                worker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(
              accountProvider
            );

            const stakeRequestBefore = await valueBrandedToken.stakeRequests(staker);
            const balanceBefore = await valueBrandedToken.balanceOf(staker);
            const totalSupplyBefore = await valueBrandedToken.totalSupply();
            const allowanceBefore = await valueBrandedToken.allowance(staker, gateway);

            assert.strictEqual(
                stakeRequestBefore.cmp(
                    new BN(0),
                ),
                1,
            );

            assert.strictEqual(
                balanceBefore.cmp(
                    new BN(0),
                ),
                0,
            );

            assert.strictEqual(
                totalSupplyBefore.cmp(
                    new BN(0),
                ),
                0,
            );

            assert.strictEqual(
                allowanceBefore.cmp(
                    new BN(0),
                ),
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

            const valueBrandedTokens = await valueBrandedToken.convert(valueTokens);
            const stakeRequestAfter = await valueBrandedToken.stakeRequests(staker);
            const balanceAfter = await valueBrandedToken.balanceOf(staker);
            const totalSupplyAfter = await valueBrandedToken.totalSupply();
            const allowanceAfter = await valueBrandedToken.allowance(staker, gateway);

            assert.strictEqual(
                stakeRequestAfter.cmp(
                    new BN(0),
                ),
                0,
            );

            assert.strictEqual(
                balanceAfter.cmp(
                    (balanceBefore.add(valueBrandedTokens)),
                ),
                0,
            );

            assert.strictEqual(
                totalSupplyAfter.cmp(
                    (totalSupplyBefore.add(valueBrandedTokens)),
                ),
                0,
            );

            assert.strictEqual(
                allowanceAfter.cmp(
                    (allowanceBefore.add(valueBrandedTokens)),
                ),
                0,
            );
        });
    });
});