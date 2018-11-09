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

contract('ValueBrandedToken::addTransferor', async () => {
    contract('Negative Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);
        const worker = accountProvider.get();
        it('Reverts if _transferor is null', async () => {

            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(worker);

            const transferor = utils.NULL_ADDRESS;

            await utils.expectRevert(
                valueBrandedToken.addTransferor(
                    transferor,
                ),
                'Should revert as _transferor is null.',
                'Transferor is null.',
            );
        });

        it('Reverts if _transferor can transfer', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(worker);

            const transferor = accountProvider.get();

            await valueBrandedToken.addTransferor(
                transferor,
            );

            await utils.expectRevert(
                valueBrandedToken.addTransferor(
                    transferor,
                ),
                'Should revert as can transfer.',
                'Transferor can transfer.',
            );
        });
    });

    contract('Events', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);
        const worker = accountProvider.get();

        it('Emits TransferorAdded event', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(worker);

            const transferor = accountProvider.get();

            const transactionResponse = await valueBrandedToken.addTransferor(
                transferor,
            );

            const events = Event.decodeTransactionResponse(
                transactionResponse,
            );

            assert.strictEqual(
                events.length,
                1,
                'Only TransferorAdded event should be emitted.',
            );

            Event.assertEqual(events[0], {
                name: 'TransferorAdded',
                args: {
                    _transferor: transferor,
                },
            });
        });
    });

    contract('Storage', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);
        const worker = accountProvider.get();

        it('Successfully adds transferor', async () => {
            const valueBrandedToken = await ValueBrandedTokenUtils.createValueBrandedToken(worker);

            const transferor = accountProvider.get();

            assert.isNotOk(
                await valueBrandedToken.canTransfer(transferor),
            );

            await valueBrandedToken.addTransferor(
                transferor,
            );

            assert.isOk(
                await valueBrandedToken.canTransfer(transferor),
            );
        });
    });
});