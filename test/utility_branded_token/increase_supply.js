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

const utils = require('../test_lib/utils');
const UtilityBrandedTokenUtils = require('./utils');
const { Event } = require('../test_lib/event_decoder.js');
const web3 = require('../test_lib/web3');

contract('UtilityBrandedToken::increaseSupply', async (accounts) => {
    let testUtilityBrandedToken;
    let internalActors;
    let tokenHolder1;
    let tokenHolder2;
    let tokenHolder3;
    let accountProvider;
    let coGateway;

    const amount = 10;
    const tokenHolder1Balance = 100;

    beforeEach(async () => {
        accountProvider = new utils.AccountProvider(accounts);
        tokenHolder1 = accountProvider.get();
        tokenHolder2 = accountProvider.get();
        tokenHolder3 = accountProvider.get();
        coGateway = accountProvider.get();

        internalActors = [];
        internalActors.push(tokenHolder1);
        internalActors.push(tokenHolder3);

        ({
            testUtilityBrandedToken,
        } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
            accountProvider, internalActors,
        ));

        await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
        await testUtilityBrandedToken.mockSetCoGateway(coGateway);
    });

    describe('Negative Tests', async () => {
        it('Reverts if beneficiary address is not registered internal actor', async () => {
            await utils.expectRevert(
                testUtilityBrandedToken.increaseSupply(
                    tokenHolder2,
                    amount,
                    { from: coGateway },
                ),
                'Beneficiary should be registered internal actor',
                'Beneficiary is not an internal actor.',
            );
        });

        it('Reverts if beneficiary address is empty', async () => {
            await utils.expectRevert(
                testUtilityBrandedToken.increaseSupply(
                    '',
                    amount,
                    { from: coGateway },
                ),
                'Beneficiary address cannot be empty',
                'Beneficiary is not an internal actor.',
            );
        });
    });

    describe('Storage', async () => {
        it('Validate the increase in supply of tokens', async () => {
            // Before increase in supply
            assert.strictEqual(
                (await testUtilityBrandedToken.balanceOf(tokenHolder3)).cmp(
                    web3.utils.toBN(0),
                ),
                0,
                'Balance of tokeholder3 should be zero',
            );
            assert.strictEqual(
                (await testUtilityBrandedToken.totalSupply()).cmp(
                    web3.utils.toBN(0),
                ),
                0,
                'Total supply should be zero',
            );

            await testUtilityBrandedToken.increaseSupply(
                tokenHolder3,
                amount,
                { from: coGateway },
            );

            // After increase supply.
            assert.strictEqual(
                (await testUtilityBrandedToken.totalSupply()).cmp(
                    web3.utils.toBN(amount),
                ),
                0,
                `Total supply should be ${amount}`,
            );
            assert.strictEqual(
                (await testUtilityBrandedToken.balanceOf(tokenHolder3)).cmp(
                    web3.utils.toBN(amount),
                ),
                0,
                `Total supply should be ${amount}`,
            );
        });
    });

    describe('Events', async () => {
        it('Verify Transfer event', async () => {
            const transactionResponse = await testUtilityBrandedToken.increaseSupply(
                tokenHolder3,
                amount,
                { from: coGateway },
            );

            const events = Event.decodeTransactionResponse(transactionResponse);

            assert.strictEqual(
                events.length,
                1,
            );

            Event.assertEqual(events[0], {
                name: 'Transfer',
                args: {
                    _from: utils.NULL_ADDRESS,
                    _to: tokenHolder3,
                    _value: new web3.utils.BN(amount),
                },
            });
        });
    });
});
