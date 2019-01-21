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

const web3 = require('../test_lib/web3.js');

const BrandedToken = artifacts.require('BrandedToken');
const EIP20TokenMockPass = artifacts.require('EIP20TokenMockPass');
const EIP20TokenMockPassFail = artifacts.require('EIP20TokenMockPassFail');
const OrganizationMockPass = artifacts.require('OrganizationMockPass');
const OrganizationMockFail = artifacts.require('OrganizationMockFail');

/**
 * Sets up a BrandedToken.
 */
module.exports.setupBrandedToken = async (
    accountProvider,
    useOrganizationMockPass = true,
    useEIP20TokenMockPass = true,
) => {
    const valueToken = await (
        useEIP20TokenMockPass ? EIP20TokenMockPass.new() : EIP20TokenMockPassFail.new()
    );
    const symbol = 'BT';
    const name = 'BrandedToken';
    const decimals = 18;
    const conversionRate = 35;
    const conversionRateDecimals = 1;
    const organization = await (
        useOrganizationMockPass ? OrganizationMockPass.new() : OrganizationMockFail.new()
    );

    const brandedToken = await BrandedToken.new(
        valueToken.address,
        symbol,
        name,
        decimals,
        conversionRate,
        conversionRateDecimals,
        organization.address,
    );

    return {
        brandedToken,
    };
};

/**
 * Sets up a BrandedToken and a stake request.
 */
module.exports.setupBrandedTokenAndStakeRequest = async (accountProvider) => {
    const {
        brandedToken,
    } = await this.setupBrandedToken();

    const staker = accountProvider.get();
    const stake = 2;
    const mint = await brandedToken.convertToBrandedTokens(stake);

    const stakeRequestHash = await brandedToken.requestStake.call(
        stake,
        mint,
        { from: staker },
    );

    await brandedToken.requestStake(
        stake,
        mint,
        { from: staker },
    );

    return {
        brandedToken,
        staker,
        stake,
        stakeRequestHash,
    };
};

/**
 * Sets up a BrandedToken and an accepted stake request.
 */
module.exports.setupBrandedTokenAndAcceptedStakeRequest = async (accountProvider) => {
    const {
        brandedToken,
        staker,
        stake,
        stakeRequestHash,
    } = await this.setupBrandedTokenAndStakeRequest(
        accountProvider,
    );

    const r = web3.utils.soliditySha3('r');
    const s = web3.utils.soliditySha3('s');
    const v = 0;
    const worker = accountProvider.get();

    await brandedToken.acceptStakeRequest(
        stakeRequestHash,
        r,
        s,
        v,
        { from: worker },
    );

    return {
        brandedToken,
        staker,
        stake,
        stakeRequestHash,
        worker,
    };
};
