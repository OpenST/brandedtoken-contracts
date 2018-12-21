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
const { AccountProvider } = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder.js');

const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::requestStake', async () => {
    contract('Event', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Emits StakeRequested event.', async () => {
            const {
                brandedToken,
            } = await brandedTokenUtils.setupBrandedToken(accountProvider);

            const stakeAmount = 1;
            const mintAmount = 1;
            const transactionResponse = await brandedToken.requestStake(
                stakeAmount,
                mintAmount,
            );

            const events = Event.decodeTransactionResponse(transactionResponse);

            assert.strictEqual(events.length, 1);

            Event.assertEqual(events[0], {
                name: 'StakeRequested',
                args: {
                    _stakeRequestHash: utils.NULL_BYTES32,
                    _staker: utils.NULL_ADDRESS,
                    _stake: new BN(0),
                    _nonce: new BN(0),
                },
            });
        });
    });
});
