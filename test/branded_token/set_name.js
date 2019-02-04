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

const { AccountProvider } = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder.js');

const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::setName', async () => {
  const newName = 'New BrandedToken';

  contract('Negative Tests', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Reverts if msg.sender is not a worker', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
        false,
      );

      const nonWorker = accountProvider.get();

      await utils.expectRevert(
        brandedToken.setName(
          newName,
          { from: nonWorker },
        ),
        'Should revert as msg.sender is not a worker.',
        'Only whitelisted workers are allowed to call this method.',
      );
    });
  });

  contract('Event', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Emits NameSet event', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const worker = accountProvider.get();

      const transactionResponse = await brandedToken.setName(
        newName,
        { from: worker },
      );

      const events = Event.decodeTransactionResponse(
        transactionResponse,
      );

      assert.strictEqual(
        events.length,
        1,
      );

      Event.assertEqual(events[0], {
        name: 'NameSet',
        args: {
          _name: newName,
        },
      });
    });
  });

  contract('Storage', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Successfully sets name', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const worker = accountProvider.get();

      assert.isOk(
        await brandedToken.setName.call(
          newName,
          { from: worker },
        ),
      );

      await brandedToken.setName(
        newName,
        { from: worker },
      );

      assert.strictEqual(
        newName,
        await brandedToken.name(),
      );
    });
  });
});
