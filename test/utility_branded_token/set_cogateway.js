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


'use strict';

const utils = require('../test_lib/utils');
const UtilityBrandedTokenUtils = require('./utils');
const { Event } = require('../test_lib/event_decoder.js');

const MockCoGateway = artifacts.require('MockCoGateway');

contract('UtilityBrandedToken::setCoGateway', async (accounts) => {
  let internalActor;
  let tokenHolder1;
  let tokenHolder3;
  let accountProvider;
  let mockCoGateway;
  let testUtilityBrandedToken;
  let testUtilityBrandedToken2;
  let organization;

  const tokenHolder1Balance = 100;

  beforeEach(async () => {
    accountProvider = new utils.AccountProvider(accounts);
    tokenHolder1 = accountProvider.get();
    tokenHolder3 = accountProvider.get();

    internalActor = [];
    internalActor.push(tokenHolder1);
    internalActor.push(tokenHolder3);

    ({
      testUtilityBrandedToken,
      organization,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, internalActor,
    ));

    mockCoGateway = await MockCoGateway.new(
      testUtilityBrandedToken.address,
    );

    await testUtilityBrandedToken.setBalance(tokenHolder1, tokenHolder1Balance);
  });

  describe('Negative Tests', async () => {
    it('Reverts if non-owner address sets the coGateway', async () => {
      const nonOrganization = accountProvider.get();
      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: nonOrganization },
      ),
      'Only organization or admin can call',
      'Only the organization is allowed to call this method.');
    });

    it('Reverts if coGateway address is zero', async () => {
      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        utils.NULL_ADDRESS,
        { from: organization },
      ),
      'Only organization or admin can call',
      'CoGateway address should not be zero.');
    });

    it('Reverts if coGateway address is already set', async () => {
      await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: organization },
      );

      const mockCoGateway2 = await MockCoGateway.new(
        testUtilityBrandedToken.address,
      );

      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        mockCoGateway2.address,
        { from: organization },
      ),
      'CoGateway address cannot be set again.',
      'CoGateway address is already set.');
    });

    it('Reverts if CoGateway is linked to other utility token', async () => {
      const utilityMock = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
        accountProvider, internalActor,
      );

      testUtilityBrandedToken2 = utilityMock.testUtilityBrandedToken;

      const mockCoGateway2 = await MockCoGateway.new(
        testUtilityBrandedToken2.address,
      );

      await utils.expectRevert(testUtilityBrandedToken.setCoGateway(
        mockCoGateway2.address,
        { from: organization },
      ),
      'CoGateway is linked to other utility token',
      'CoGateway should be linked with this utility token.');
    });
  });

  describe('Storage', async () => {
    it('Successfully sets the coGateway address', async () => {
      await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: organization },
      );

      assert.strictEqual(
        await testUtilityBrandedToken.coGateway.call(),
        mockCoGateway.address,
        'CoGateway address is incorrect',
      );
    });

    it('Checks that coGateway is set as an internal actor.', async () => {
      await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: organization },
      );

      assert.isOk(
        await testUtilityBrandedToken.isInternalActor.call(mockCoGateway.address),
      );
    });
  });

  describe('Events', async () => {
    it('Emits a CoGatewaySet event', async () => {
      const transactionResponse = await testUtilityBrandedToken.setCoGateway(
        mockCoGateway.address,
        { from: organization },
      );

      const events = Event.decodeTransactionResponse(transactionResponse);

      assert.strictEqual(
        events.length,
        1,
        'Only one event should be raised',
      );

      Event.assertEqual(events[0], {
        name: 'CoGatewaySet',
        args: {
          _coGateway: mockCoGateway.address,
        },
      });
    });
  });
});
