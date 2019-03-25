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
const { Event } = require('../test_lib/event_decoder');
const UtilityBrandedTokenUtils = require('./utils');

contract('Internal::registerInternalActors', async (accounts) => {
  let organization;
  let accountProvider;
  let worker;
  let testUtilityBrandedToken;

  beforeEach(async () => {
    accountProvider = new utils.AccountProvider(accounts);

    ({
      testUtilityBrandedToken,
      organization,
      worker,
    } = await UtilityBrandedTokenUtils.setupUtilityBrandedToken(
      accountProvider, [],
    ));
  });

  describe('Negative Tests', async () => {
    it('Reverts if non-worker address is adding internal actor', async () => {
      const internalActors = [];
      internalActors.push(accountProvider.get());
      const nonWorker = accountProvider.get();

      await utils.expectRevert(testUtilityBrandedToken.registerInternalActors(
        internalActors,
        { from: nonWorker },
      ),
      'Worker should be registered.',
      'Only whitelisted workers are allowed to call this method.');
    });
  });

  describe('Events', async () => {
    it('Emits InternalActorRegistered events for multiple internal actors registration', async () => {
      const internalActors = [];
      internalActors.push(accountProvider.get());
      internalActors.push(accountProvider.get());
      internalActors.push(accountProvider.get());

      const transactionResponse = await testUtilityBrandedToken.registerInternalActors(
        internalActors,
        { from: worker },
      );

      const events = Event.decodeTransactionResponse(
        transactionResponse,
      );

      Event.assertEqualMulti(events, [{
        name: 'InternalActorRegistered',
        args:
            {
              _organization: organization,
              _actor: internalActors[0],
            },
      },
      {
        name: 'InternalActorRegistered',
        args:
              {
                _organization: organization,
                _actor: internalActors[1],
              },
      },
      {
        name: 'InternalActorRegistered',
        args:
              {
                _organization: organization,
                _actor: internalActors[2],
              },
      },
      ]);
    });

    it('Doesn\'t register already registered internal actor', async () => {
      const internalActors = [];
      internalActors.push(accountProvider.get());

      await testUtilityBrandedToken.registerInternalActors(
        internalActors,
        { from: worker },
      );

      const transactionResponse = await testUtilityBrandedToken.registerInternalActors(
        internalActors,
        { from: worker },
      );

      const events = Event.decodeTransactionResponse(
        transactionResponse,
      );

      assert.strictEqual(
        events.length,
        0,
        'Should not emit InternalActorRegistered event',
      );
    });
  });

  describe('Storage', async () => {
    it('Successfully registers internal actors', async () => {
      const internalActors = [];
      internalActors.push(accountProvider.get());
      internalActors.push(accountProvider.get());

      await testUtilityBrandedToken.registerInternalActors(
        internalActors,
        { from: worker },
      );

      assert.strictEqual(
        await testUtilityBrandedToken.isInternalActor.call(internalActors[0]),
        true,
      );
      assert.strictEqual(
        await testUtilityBrandedToken.isInternalActor.call(internalActors[1]),
        true,
      );
    });
  });
});
