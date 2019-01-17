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

const BrandedToken = artifacts.require('BrandedToken');
const MockBrandedTokenFail = artifacts.require('MockBrandedTokenFail');
const GatewayComposer = artifacts.require('GatewayComposer');
const EIP20TokenMock = artifacts.require('EIP20TokenMock');
const MockGatewayPass = artifacts.require('MockGatewayPass');
const MockGatewayFail = artifacts.require('MockGatewayFail');
const MockOrganization = artifacts.require('OrganizationMockPass');

const symbol = 'Test';
const name = 'Test';
const decimals = 18;
const conversionRate = 1;
const conversionRateDecimals = 0;

module.exports.setupGatewayComposer = async (accountProvider, useBTPass = true) => {
    const organizationClass = await MockOrganization.new();
    const organization = organizationClass.address;
    const deployer = accountProvider.get();
    const owner = accountProvider.get();
    const ownerValueTokenBalance = new BN(1000);

    const valueToken = await EIP20TokenMock.new(
        symbol,
        name,
        decimals,
        { from: deployer },
    );

    await valueToken.setBalance(owner, ownerValueTokenBalance);

    assert.strictEqual(
        (await valueToken.balanceOf.call(owner)).cmp(ownerValueTokenBalance),
        0,
    );

    let brandedToken;
    if (useBTPass === true) {
        brandedToken = await this.setupBrandedTokenPass(valueToken, organization);
    } else {
        brandedToken = await this.setupBrandedTokenFail(valueToken, organization);
    }

    const gatewayComposer = await GatewayComposer.new(
        owner,
        valueToken.address,
        brandedToken.address,
    );

    return {
        valueToken,
        brandedToken,
        gatewayComposer,
        owner,
        organization,
        ownerValueTokenBalance,
    };
};

module.exports.setupBrandedTokenPass = async (valueToken, organization) => {
    const brandedToken = await BrandedToken.new(
        valueToken.address,
        symbol,
        name,
        decimals,
        conversionRate,
        conversionRateDecimals,
        organization,
    );

    return brandedToken;
};

module.exports.setupBrandedTokenFail = async (valueToken, organization) => {
    const brandedToken = await MockBrandedTokenFail.new(
        valueToken.address,
        symbol,
        name,
        decimals,
        conversionRate,
        conversionRateDecimals,
        organization,
    );

    return brandedToken;
};

module.exports.setupGatewayComposerRequestStake = async (valueToken, gatewayComposer, owner) => {
    const stakeAmount = 1;

    await valueToken.approve(
        gatewayComposer.address,
        stakeAmount,
        { from: owner },
    );

    return {
        stakeAmount,
    };
};

module.exports.setupGatewayPass = async (accountProvider) => {
    const mockGatewayPass = await MockGatewayPass.new();

    return {
        facilitator: accountProvider.get(),
        gateway: mockGatewayPass,
    };
};

module.exports.setupGatewayFail = async (accountProvider) => {
    const mockGatewayFail = await MockGatewayFail.new();

    return {
        facilitator: accountProvider.get(),
        gateway: mockGatewayFail,
    };
};
