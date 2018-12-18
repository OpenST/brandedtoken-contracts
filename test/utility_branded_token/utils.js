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

const TestUtilityBrandedToken = artifacts.require('TestUtilityBrandedToken'),
  EIP20TokenMock = artifacts.require('EIP20TokenMock'),
  OrganizationMock = artifacts.require('OrganizationMock');

/**
 * Setup UtilityBrandedToken.
 */
module.exports.setupUtilityBrandedToken = async (accountProvider, internalActor) => {
  const SYMBOL = "MOCK",
    NAME = "Mock Token",
    DECIMALS = "5",
    organization = accountProvider.get();

  const {
    organizationMock,
    worker,
  } = await this.setupOrganization(accountProvider);

  const valueToken = await EIP20TokenMock.new(
    SYMBOL,
    NAME,
    DECIMALS,
    { from: organization },
  );

  const testUtilityBrandedToken = await TestUtilityBrandedToken.new(
    valueToken.address,
    SYMBOL,
    NAME,
    DECIMALS,
    organizationMock.address,
    { from: organization },
  );

  await testUtilityBrandedToken.registerInternalActor(
    internalActor,
    { from: worker },
  );

  return { testUtilityBrandedToken, worker };
};

/**
 * Creates an instance of OrganizationMock contract and sets worker.
 */
module.exports.setupOrganization = async(accountProvider) => {

  const worker = accountProvider.get();
  const organizationMock = await OrganizationMock.new();

  organizationMock.setWorker(worker);

  return { organizationMock, worker };

};
