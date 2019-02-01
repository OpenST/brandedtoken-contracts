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

const Internal = artifacts.require('Internal');
const MockOrganization = artifacts.require('MockOrganization');

/**
 * Creates an instance of Internal contract and sets worker.
 */
module.exports.setupInternal = async (accountProvider) => {
  const worker = accountProvider.get();
  const organization = accountProvider.get();
  const admin = accountProvider.get();
  const mockOrganization = await MockOrganization.new(
    organization,
    admin,
    [worker],
  );
  const internal = await Internal.new(mockOrganization.address);

  const organizationAddress = mockOrganization.address;
  await mockOrganization.setWorker(worker);

  return { internal, worker, organizationAddress };
};
