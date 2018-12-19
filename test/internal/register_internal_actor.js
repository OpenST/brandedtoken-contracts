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

const utils = require('../test_lib/utils'),
  {Event} = require('../test_lib/event_decoder'),
  Internal = artifacts.require('Internal'),
  InternalUtils = require('./utils'),
  AccountProvider = utils.AccountProvider;

contract('Internal::registerinternalactor', async (accounts) => {
  
  let internal,
    organization,
    accountProvider,
    worker;
  
  beforeEach(async function () {
    
    accountProvider = new AccountProvider(accounts);
    ({
      internal,
      worker,
      organization
    } = await InternalUtils.setupInternal(accountProvider));
    
  });
  
  describe('Negative Tests', async () => {
    
    it('Reverts if non-worker address is adding internal actor', async () => {
      
      let internalActors = [];
      internalActors.push(accountProvider.get());
      let nonWorker = accountProvider.get();
      
      await utils.expectRevert(internal.registerInternalActor(
        internalActors,
        { from: nonWorker },
        ),
        'Worker should be registered.',
        'Only whitelisted workers are allowed to call this method.'
      );
      
    });
    
  });
  
  describe('Events', async (accounts) => {
    
    it('Verify InternalActorRegistered event', async () => {
      
      let internalActors = [];
      internalActors.push(accountProvider.get());
      internalActors.push(accountProvider.get());
      internalActors.push(accountProvider.get());
      
      let transactionResponse = await internal.registerInternalActor(
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
              _actor: internalActors[0]
            }
          },
          {
            name: 'InternalActorRegistered',
            args:
              {
                _organization: organization,
                _actor: internalActors[1]
              }
          },
          {
            name: 'InternalActorRegistered',
            args:
              {
                _organization: organization,
                _actor: internalActors[2]
              }
          }
        ],
      );
      
    });
    
    it('Do not register already registered internal actor', async () => {
      
      let internalActors = [];
      internalActors.push(accountProvider.get());
      
      await internal.registerInternalActor(
        internalActors,
        { from: worker },
      );
      
      let transactionResponse = await internal.registerInternalActor(
        internalActors,
        { from: worker },
      );
      
      const events = Event.decodeTransactionResponse(
        transactionResponse,
      );
      
      assert.strictEqual(
        events.length,
        0,
        "Should not emit InternalActorRegistered",
      );
      
    });
    
  });
  
  describe('Storage', async (accounts) => {
    
    it('Verifies added internal actor', async () => {
      
      let internalActors = [];
      internalActors.push(accountProvider.get());
      internalActors.push(accountProvider.get());
      
      await internal.registerInternalActor(
        internalActors,
        { from: worker },
      );
      
      assert.equal(await internal.isInternalActor.call(internalActors[0]), true);
      assert.equal(await internal.isInternalActor.call(internalActors[1]), true);
      
    });
  });
});