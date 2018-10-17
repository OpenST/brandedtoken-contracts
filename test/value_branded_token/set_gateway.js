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

contract('ValueBrandedToken::setGateway', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if _gateway is null', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const gateway = utils.NULL_ADDRESS;

            await utils.expectRevert(
                valueBrandedToken.setGateway(
                    gateway,
                ),
                'Should revert as _gateway is null.',
                'Gateway is null.',
            );
        });

        it('Reverts if gateway is set', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const gateway = accountProvider.get();

            await valueBrandedToken.setGateway(
                gateway,
            );

            await utils.expectRevert(
                valueBrandedToken.setGateway(
                    gateway,
                ),
                'Should revert as gateway is set.',
                'Gateway is set.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits GatewaySet event', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const gateway = accountProvider.get();

            const transactionResponse = await valueBrandedToken.setGateway(
                gateway,
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
                'Only GatewaySet event should be emitted.',
            );

            Event.assertEqual(events[0], {
                name: 'GatewaySet',
                args: {
                    _gateway: gateway,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully sets gateway', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(accountProvider);

            const gateway = accountProvider.get();

            assert.strictEqual(
                (await valueBrandedToken.gateway.call()),
                utils.NULL_ADDRESS,
            );

            await valueBrandedToken.setGateway(
                gateway,
            );

            assert.strictEqual(
                (await valueBrandedToken.gateway.call()),
                gateway,
            );
        });
    });
});