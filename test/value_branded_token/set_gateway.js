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


const utils = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder');
const { AccountProvider } = require('../test_lib/utils.js');
const ValueBrandedTokenUtils = require('./utils.js');

contract('ValueBrandedToken::setGateway', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Reverts if gateway is set', async () => {

            const {
                valueBrandedToken
            } = await ValueBrandedTokenUtils.createValueBrandedToken(
              accountProvider
            );

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

        it('Reverts if worker is not set', async () => {
            const {
                valueBrandedToken
            } = await ValueBrandedTokenUtils.createValueBrandedToken(
              accountProvider
            );

            const gateway = accountProvider.get();
            const nonWorker = accountProvider.get();

            await utils.expectRevert(
              valueBrandedToken.setGateway(
                gateway,
                { from: nonWorker }
              ),
              'Should revert if worker is not registered.',
              'Only whitelisted worker is allowed to call.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits GatewaySet and TransferorAdded events', async () => {
            const {
                valueBrandedToken,
                worker
            } = await ValueBrandedTokenUtils.createValueBrandedToken(
              accountProvider
            );

            const gateway = accountProvider.get();

            const transactionResponse = await valueBrandedToken.setGateway(
                gateway,
                { from: worker }
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                2,
            );

            Event.assertEqual(events[0], {
                name: 'GatewaySet',
                args: {
                    _gateway: gateway,
                },
            });

            Event.assertEqual(events[1], {
                name: 'TransferorAdded',
                args: {
                    _transferor: gateway,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Successfully sets gateway', async () => {
            const {
                valueBrandedToken,
                worker
            } = await ValueBrandedTokenUtils.createValueBrandedToken(
              accountProvider
            );

            const gateway = accountProvider.get();

            assert.strictEqual(
                (await valueBrandedToken.gateway()),
                utils.NULL_ADDRESS,
            );

            await valueBrandedToken.setGateway(
                gateway,
                { from: worker }
            );

            assert.strictEqual(
                (await valueBrandedToken.gateway()),
                gateway,
            );
        });
    });
});