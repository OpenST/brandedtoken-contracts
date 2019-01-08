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

const BrandedToken = artifacts.require('BrandedToken');
const EIP20TokenMockPass = artifacts.require('EIP20TokenMockPass');

/**
 * Setup BrandedToken.
 */
module.exports.setupBrandedToken = async (accountProvider) => {
    const valueToken = await EIP20TokenMockPass.new();
    const symbol = 'BrandedToken';
    const name = 'BT';
    const decimals = 18;
    const conversionRate = 35;
    const conversionRateDecimals = 1;
    const organization = accountProvider.get();

    const brandedToken = await BrandedToken.new(
        valueToken.address,
        symbol,
        name,
        decimals,
        conversionRate,
        conversionRateDecimals,
        organization,
    );

    return {
        brandedToken,
    };
};
