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

const EIP20TokenMockPassFail = artifacts.require('EIP20TokenMockPassFail');
const ValueBrandedToken = artifacts.require('ValueBrandedToken');

contract('ValueBrandedToken::rejectStakeRequest', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if stake request is 0', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const nonStaker = accountProvider.get();
            const worker = accountProvider.get();

            await utils.expectRevert(
                valueBrandedToken.rejectStakeRequest(
                    nonStaker,
                    { from: worker },
                ),
                'Should revert as stake request is zero.',
                'Stake request is zero.',
            );
        });

        it('Reverts if valueToken.transfer returns false', async () => {
            const valueToken = await EIP20TokenMockPassFail.new();
            const conversionRate = 35;
            const conversionRateDecimals = 1;

            const valueBrandedToken = await ValueBrandedToken.new(
                valueToken.address,
                conversionRate,
                conversionRateDecimals,
            );

            const valueTokens = 1;
            const valueBrandedTokens = await valueBrandedToken.convert.call(valueTokens);
            const beneficiary = accountProvider.get();
            const gasPrice = 0;
            const gasLimit = 0;
            const nonce = 0;
            const signature = '0x00';

            const staker = accountProvider.get();
            const worker = accountProvider.get();

            await valueBrandedToken.requestStake(
                valueTokens,
                valueBrandedTokens,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                signature,
                { from: staker },
            );

            await utils.expectRevert(
                valueBrandedToken.rejectStakeRequest(
                    staker,
                    { from: worker },
                ),
                'Should revert as valueToken.transfer returned false.',
                'ValueToken.transfer returned false.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequestRejected event', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const worker = accountProvider.get();

            const transactionResponse = await valueBrandedToken.rejectStakeRequest(
                staker,
                { from: worker },
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
                'Only StakeRequestRejected event should be emitted.',
            );

            Event.assertEqual(events[0], {
                name: 'StakeRequestRejected',
                args: {
                    _staker: staker,
                    _valueTokens: new BN(valueTokens),
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);
        const worker = accountProvider.get();

        it('Successfully deletes the stake request and calls valueToken.transfer', async () => {
            const {
                valueBrandedToken,
                valueTokens,
                staker,
            } = await ValueBrandedTokenUtils.createValueBrandedTokenAndStakeRequest(accountProvider);

            const amountBeforeReject = await valueBrandedToken.stakeRequests.call(staker);

            assert.strictEqual(
                amountBeforeReject.cmp(
                    utils.zeroBN,
                ),
                1,
            );

            assert.isOk(
                await valueBrandedToken.rejectStakeRequest.call(
                    staker,
                    { from: worker },
                )
            );

            await valueBrandedToken.rejectStakeRequest(
                staker,
                { from: worker },
            );

            const amountAfterReject = await valueBrandedToken.stakeRequests.call(staker);

            assert.strictEqual(
                amountAfterReject.cmp(
                    utils.zeroBN,
                ),
                0,
            );
        });
    });
});