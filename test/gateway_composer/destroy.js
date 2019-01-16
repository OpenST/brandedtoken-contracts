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

const utils = require('../test_lib/utils');
const gatewayComposerUtils = require('./utils');

const AccountProvider = utils.AccountProvider;
const web3 = require('../test_lib/web3.js');

contract('GatewayComposer::destroy', async (accounts) => {
    describe('Negative Tests', async () => {
        const accountProvider = new AccountProvider(accounts);

        it('Fails when GatewayComposer ValueToken balance is not zero.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);
            await valueToken.setBalance(gatewayComposer.address, new BN(10));
            utils.expectRevert(
                gatewayComposer.destroy({ from: owner }),
                'It should revert as ValueToken balance is not 0.',
                'ValueToken balance should be 0.',
            );
        });

        it('Fails when owner is not msg.sender.', async () => {
            const {
                valueToken,
                gatewayComposer,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);
            await valueToken.setBalance(gatewayComposer.address, new BN(10));
            utils.expectRevert(
                gatewayComposer.destroy({ from: accountProvider.get() }),
                'It should revert as only owner can call the function.',
                'Only owner can call the function.',
            );
        });

        it('Fails when in progress stake requests are present.', async () => {
            const {
                valueToken,
                gatewayComposer,
                owner,
                brandedToken,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            const {
                stakeAmount,
            } = await gatewayComposerUtils.approveGatewayComposer(
                valueToken,
                gatewayComposer,
                owner,
            );

            const mintAmount = await brandedToken.convertToBrandedTokens(stakeAmount);
            const gateway = accountProvider.get();
            const beneficiary = accountProvider.get();
            const gasPrice = 1;
            const gasLimit = 1;
            const nonce = 1;
            await gatewayComposer.requestStake(
                stakeAmount,
                mintAmount,
                gateway,
                beneficiary,
                gasPrice,
                gasLimit,
                nonce,
                { from: owner },
            );
            utils.expectRevert(
                gatewayComposer.destroy({ from: owner }),
                'It should revert as there are ongoing stake requests.',
                'In progress stake requests are present.',
            );
        });
    });

    describe('Storage', async () => {
        let accountProvider;

        beforeEach(async () => {
            accountProvider = new AccountProvider(accounts);
        });

        it('Removes contract storage & code.', async () => {
            const {
                gatewayComposer,
                owner,
            } = await gatewayComposerUtils.setupGatewayComposer(accountProvider);

            await gatewayComposer.destroy({ from: owner });

            const code = await web3.eth.getCode(gatewayComposer.address);
            assert.equal(code, 0x0);
        });
    });
});
