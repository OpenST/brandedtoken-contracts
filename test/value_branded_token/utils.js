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

const EIP20TokenMockPass = artifacts.require('EIP20TokenMockPass');
const ValueBrandedToken = artifacts.require('ValueBrandedToken');

/**
 * Creates a value branded token.
 */
module.exports.createValueBrandedToken = async () => {
    const valueToken = await EIP20TokenMockPass.new();
    const valueBrandedToken = await ValueBrandedToken.new(
        valueToken.address,
    );

    return valueBrandedToken;
};