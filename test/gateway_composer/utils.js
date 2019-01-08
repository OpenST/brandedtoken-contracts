// Copyright 2018 OST.com Ltd.
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

const BrandedToken = artifacts.require('TestBrandedToken');
const GatewayComposer = artifacts.require('GatewayComposer');
const EIP20TokenMock = artifacts.require('EIP20TokenMock');

/**
 * Setup GatewayComposer.
 */
module.exports.setupGatewayComposer = async (accountProvider) => {
    const symbol = 'Test';
    const name = 'Test';
    const decimals = 18;
    const conversionRate = 1;
    const conversionRateDecimals = 1;
    const organization = accountProvider.get();
    const owner = accountProvider.get();
    const ownerBalance = new BN(1000);
    const valueToken = await EIP20TokenMock.new(
        symbol,
        name,
        decimals,
        { from: organization },
    );

    await valueToken.setBalance(owner, ownerBalance);
    assert.strictEqual(
        (await valueToken.balanceOf.call(owner)).cmp(ownerBalance),
        0,
    );

    const brandedToken = await BrandedToken.new(
        valueToken.address,
        symbol,
        name,
        decimals,
        conversionRate,
        conversionRateDecimals,
        organization,
    );

    const gatewayComposer = await GatewayComposer.new(
        owner,
        valueToken.address,
        brandedToken.address,
    );

    return {
        gatewayComposer,
        brandedToken,
        owner,
    };
};
