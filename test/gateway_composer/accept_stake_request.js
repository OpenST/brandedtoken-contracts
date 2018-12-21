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
const { AccountProvider } = require('../test_lib/utils.js');
const web3 = require('../test_lib/web3.js');

const gatewayComposerUtils = require('./utils');

contract('GatewayComposer::acceptStakeRequest', async () => {
    contract('Positive Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Should return message hash.', async () => {
            const {
                gatewayComposer,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const stakeRequestHash = web3.utils.soliditySha3('test');
            const r = web3.utils.soliditySha3('r');
            const s = web3.utils.soliditySha3('s');
            const v = 0;
            const hashLock = web3.utils.soliditySha3('hl');
            const messageHash = await gatewayComposer.acceptStakeRequest.call(
                stakeRequestHash,
                r,
                s,
                v,
                hashLock,
            );

            assert.strictEqual(messageHash, utils.NULL_BYTES32);
        });
    });
});
