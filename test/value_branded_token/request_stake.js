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

const EIP20TokenMockFail = artifacts.require('EIP20TokenMockFail');
const ValueBrandedToken = artifacts.require('ValueBrandedToken');

contract('ValueBrandedToken::requestStake', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        const gasPrice = 0;
        const gasLimit = 0;
        const nonce = 0;

        const staker = accountProvider.get();

        it('Reverts if valueTokens is zero', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const valueTokens = 0;
            const valueBrandedTokens = 0;
            const signature = '0x00';

            await utils.expectRevert(
                valueBrandedToken.requestStake(
                    valueTokens,
                    valueBrandedTokens,
                    valueTokens,
                    gasPrice,
                    gasLimit,
                    nonce,
                    signature,
                    { from: staker },
                ),
                'Should revert as valueTokens is zero.',
                'ValueTokens is zero.',
            );
        });

        it('Reverts if beneficiary is null', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const valueTokens = 1;
            const valueBrandedTokens = 0;
            const beneficiary = utils.NULL_ADDRESS;
            const signature = '0x00';

            await utils.expectRevert(
                valueBrandedToken.requestStake(
                    valueTokens,
                    valueBrandedTokens,
                    beneficiary,
                    gasPrice,
                    gasLimit,
                    nonce,
                    signature,
                    { from: staker },
                ),
                'Should revert as beneficiary is null.',
                'Beneficiary is null.',
            );
        });

        it('Reverts if signature is empty', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const valueTokens = 1;
            const valueBrandedTokens = 0;
            const beneficiary = accountProvider.get();
            const signature = '0x';

            await utils.expectRevert(
                valueBrandedToken.requestStake(
                    valueTokens,
                    valueBrandedTokens,
                    beneficiary,
                    gasPrice,
                    gasLimit,
                    nonce,
                    signature,
                    { from: staker },
                ),
                'Should revert as signature is empty.',
                'Signature is empty.',
            );
        });

        it('Reverts if staker has a stake request', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const valueTokens = 1;
            const valueBrandedTokens = 0;
            const beneficiary = accountProvider.get();
            const signature = '0x00';

            const staker = accountProvider.get();

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
                valueBrandedToken.requestStake(
                    valueTokens,
                    valueBrandedTokens,
                    beneficiary,
                    gasPrice,
                    gasLimit,
                    nonce,
                    signature,
                    { from: staker },
                ),
                'Should revert as staker has a stake request.',
                'Staker has a stake request.',
            );
        });

        it('Reverts if valueToken.transferFrom returns false', async () => {
            const valueToken = await EIP20TokenMockFail.new();
            const valueBrandedToken = await ValueBrandedToken.new(
                valueToken.address,
            );

            const valueTokens = 1;
            const valueBrandedTokens = 0;
            const beneficiary = accountProvider.get();
            const signature = '0x00';

            const staker = accountProvider.get();

            await utils.expectRevert(
                valueBrandedToken.requestStake(
                    valueTokens,
                    valueBrandedTokens,
                    beneficiary,
                    gasPrice,
                    gasLimit,
                    nonce,
                    signature,
                    { from: staker },
                ),
                'Should revert as valueToken.transferFrom returned false.',
                'ValueToken.transferFrom returned false.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequested event', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const valueTokens = 1;
            const valueBrandedTokens = 0;
            const beneficiary = accountProvider.get();
            const gasPrice = 0;
            const gasLimit = 0;
            const nonce = 0;
            const signature = '0x00';

            const staker = accountProvider.get();

            const transactionResponse = await valueBrandedToken.requestStake(
                valueTokens,
                valueBrandedTokens,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                signature,
                { from: staker },
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
                'Only StakeRequested event should be emitted.',
            );

            Event.assertEqual(events[0], {
                name: 'StakeRequested',
                args: {
                    _valueTokens: new BN(valueTokens),
                    _valueBrandedTokens: new BN(valueBrandedTokens),
                    _beneficiary: beneficiary,
                    _staker: staker,
                    _gasPrice: new BN(gasPrice),
                    _gasLimit: new BN(gasLimit),
                    _nonce: new BN(nonce),
                    _signature: signature,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully stores stake request', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const valueTokens = 1;
            const valueBrandedTokens = 0;
            const beneficiary = accountProvider.get();
            const gasPrice = 0;
            const gasLimit = 0;
            const nonce = 0;
            const signature = '0x00';

            const staker = accountProvider.get();

            const amountBeforeRequest = (await valueBrandedToken.stakeRequests(staker)).toNumber();

            assert.strictEqual(
                amountBeforeRequest,
                0,
            );

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

            const amountAfterRequest = (await valueBrandedToken.stakeRequests(staker)).toNumber();

            assert.notStrictEqual(
                amountBeforeRequest,
                amountAfterRequest,
            );

            assert.strictEqual(
                amountAfterRequest,
                valueTokens,
            );
        });
    });
});