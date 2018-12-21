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

const { AccountProvider } = require('../test_lib/utils.js');

const utils = require('../test_lib/utils');
const gatewayComposerUtils = require('./utils');

contract('GatewayComposer::requestStake', async () => {
    contract('Positive Tests', async (accounts) => {
        const accountProvider = new AccountProvider(accounts);

        it('Returns stake request hash.', async () => {
            const {
                gatewayComposer,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const stakeAmount = 1;
            const mintAmount = 1;
            const gateway = accountProvider.get();
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            const requestHash = await gatewayComposer.requestStake.call(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
            );

            assert.strictEqual(requestHash, utils.NULL_BYTES32);
        });
    });
});
