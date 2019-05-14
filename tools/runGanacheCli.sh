#!/bin/bash
node_modules/.bin/ganache-cli \
--accounts=100 \
--defaultBalanceEther=100 \
--gasLimit 0xfffffffffff
