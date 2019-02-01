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

const { AccountProvider } = require('../test_lib/utils.js');
const { Event } = require('../test_lib/event_decoder.js');

const utils = require('../test_lib/utils');
const brandedTokenUtils = require('./utils');

contract('BrandedToken::setSymbol', async () => {
  const newSymbol = 'NBT';

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
        brandedToken.setSymbol(
          newSymbol,
          { from: nonWorker },
        ),
        'Should revert as msg.sender is not a worker.',
        'Only whitelisted workers are allowed to call this method.',
      );
    });
  });

  contract('Event', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Emits SymbolSet event', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const worker = accountProvider.get();

      const transactionResponse = await brandedToken.setSymbol(
        newSymbol,
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
        name: 'SymbolSet',
        args: {
          _symbol: newSymbol,
        },
      });
    });
  });

  contract('Storage', async (accounts) => {
    const accountProvider = new AccountProvider(accounts);

    it('Successfully sets symbol', async () => {
      const {
        brandedToken,
      } = await brandedTokenUtils.setupBrandedToken(
        accountProvider,
      );

      const worker = accountProvider.get();

      assert.isOk(
        await brandedToken.setSymbol.call(
          newSymbol,
          { from: worker },
        ),
      );

      await brandedToken.setSymbol(
        newSymbol,
        { from: worker },
      );

      assert.strictEqual(
        newSymbol,
        await brandedToken.symbol(),
      );
    });
  });
});
