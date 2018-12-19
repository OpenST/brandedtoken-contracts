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

const web3 = require('../test_lib/web3.js');
const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('TestBrandedToken::requestStake', async () => {
    contract('Event', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Checks that StakeRequestAccepted & Transfer events are emitted successfully.', async () => {
            const {
                testBrandedToken,
            } = await brandedTokenUtils.setupTestBrandedToken(accountProvider);

            const stakeRequestHash = web3.utils.soliditySha3('test');
            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('r');
            const v = 0;
            const transactionResponse = await testBrandedToken.acceptStakeRequest(
                stakeRequestHash,
                r,
                s,
                v,
            );

            const events = Event.decodeTransactionResponse(transactionResponse);

            assert.strictEqual(events.length, 2);

            Event.assertEqual(events[0], {
                name: 'StakeRequestAccepted',
                args: {
                    _staker: utils.NULL_ADDRESS,
                    _stake: new BN(0),
                },
            });

            Event.assertEqual(events[1], {
                name: 'Transfer',
                args: {
                    _from: utils.NULL_ADDRESS,
                    _to: utils.NULL_ADDRESS,
                    _value: new BN(0),
                },
            });
        });
    });
});
