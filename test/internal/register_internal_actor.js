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

const utils = require('../test_lib/utils');
const { Event } = require('../test_lib/event_decoder');
const Internal = artifacts.require('Internal');

contract('Internal::registerinternalactor', async (accounts) => {

  let internal,
      organization = accounts[0];

  beforeEach(async function() {

    internal = await Internal.new(organization,{from: organization});

  });

  describe('Negative Tests', async () => {

    it('Reverts if non-organization address is adding internal actor.', async () => {

      let internalActors = [],
          nonOrganization = accounts[2];
      internalActors.push(accounts[1]);

      await utils.expectRevert(internal.registerInternalActor(
        internalActors,
        {from: nonOrganization}));

    });
    
    it('Reverts if no address is specified to add.', async () => {

      await utils.expectRevert(
          internal.registerInternalActor(
            [] ,
            {from: organization}
          ),
          'Address to be added cannot be empty',
          'Internal actor to be added cannot be empty'

       );
    });
  });
  
  contract('Events', async (accounts) => {
    
    it('Emits InternalActorRegistered on registering internal actor.', async () => {

      let internalActors = [];
      internalActors.push(accounts[4]);
      internalActors.push(accounts[5]);
      internalActors.push(accounts[6]);

      let transactionResponse = await internal.registerInternalActor(
        internalActors,
        {from: organization});


      const events = Event.decodeTransactionResponse(
        transactionResponse
      );

      Event.assertEqualMulti(events,[ { name: 'InternalActorRegistered',
        args:
          { _organization: organization,
            _actor: internalActors[0] } },
        { name: 'InternalActorRegistered',
          args:
            { _organization: organization,
              _actor: internalActors[1] } },
        { name: 'InternalActorRegistered',
          args:
            { _organization: organization,
              _actor: internalActors[2]} }
        ]
      );

    });

    it('Do not register already registered actor.', async () => {

      let internalActors = [];
      internalActors.push(accounts[4]);

      await internal.registerInternalActor(internalActors, {from: organization});

      internalActors.push(accounts[6]);
      let transactionResponse = await internal.registerInternalActor(
        internalActors,
        {from: organization}
      );

      const events = Event.decodeTransactionResponse(
        transactionResponse
      );

      Event.assertEqualMulti(events,[ { name: 'InternalActorRegistered',
        args:
          { _organization: organization,
            _actor: internalActors[1]
          }
        }]
      );

    });

  });
  
  contract('Storage', async (accounts) => {
    
    it('Checks the added internal actor.', async () => {

      let internalActors = [];
      internalActors.push(accounts[4]);
      internalActors.push(accounts[5]);

      await internal.registerInternalActor(internalActors,{from: organization});

      assert.equal(await internal.isInternalActor.call(internalActors[0]), true);
      assert.equal(await internal.isInternalActor.call(internalActors[1]), true);

    });
  });
});
