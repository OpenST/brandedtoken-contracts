<h1 align="center">Branded Tokens - Tokenizing Mainstream Applications</h1>

[![Discourse: JOIN DISCUSSION](https://img.shields.io/discourse/https/discuss.openst.org/topics.svg?style=flat)](https://discuss.openst.org/) [![Travis CI: DEVELOP](https://img.shields.io/travis/OpenSTFoundation/brandedtoken-contracts/develop.svg?style=flat)](https://travis-ci.org/OpenSTFoundation/brandedtoken-contracts)

A Branded Token allows a mainstream application to create a value-backed token designed specifically for its application's context. A Branded Token implements the required and optional [EIP-20 Standard Token interface](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md).

Holders of branded tokens must be able to redeem the value that backs those branded tokens. Branded tokens are only usable within the application context. The application can maintain a policy on accepting new holders.

A Utility Branded Token, which also implements the EIP-20 Standard Token interface, is the utility token representation of the Branded Token on a sidechain. This representation is orchestrated via a gateway, comprising a Gateway contract on the same chain as the Branded Token, and a CoGateway contract on the sidechain with the Utility Branded Token.

A composer is a contract that can be used to optimize the transactions required to perform an action. A Gateway Composer, a type of composer, facilitate's staking value for branded tokens and minting a utility representation of those branded tokens with a Utility Branded Token through a gateway for use within the given application, thereby reducing both the number of transactions to execute and the number of contracts to call in order to stake and mint.

The complete Branded Token specification is in a draft proposal and subject to change. For more information on the specification, please consult [OIP-0001](https://github.com/OpenST/OIPs/blob/master/OIPS/oip-0001.md) in the OpenST Improvement Proposals repository.

## Related Projects

Significant related projects are:

- [brandedtoken.js](https://github.com/OpenSTFoundation/brandedtoken.js): a library for interacting with `BrandedToken` and `GatewayComposer` contracts.
- [mosaic-contracts](https://github.com/OpenSTFoundation/mosaic-contracts): a set of meta-blockchains on top of Ethereum to scale (D)Apps
- [mosaic.js](https://github.com/OpenSTFoundation/mosaic.js): a web3 interface to scale (D)Apps on Ethereum
- [openst-contracts](https://github.com/OpenSTFoundation/openst-contracts): a framework for building token economies
- [openst.js](https://github.com/OpenSTFoundation/openst.js): a library for deploying and interacting with a token economy

## Contributing

There are multiple ways to contribute to this project. However, before contributing, please first review the [Code of Conduct](CODE_OF_CONDUCT.md).

To participate in the discussion on technical matters, please join the project's [Discourse forum](https://discuss.openst.org/) channel or review the project's [issues](https://github.com/OpenSTFoundation/brandedtoken-contracts/issues).

To contribute code, please ensure that your submissions adhere to the [Style Guide](SOLIDITY_STYLE_GUIDE.md); please also be aware, this project is under active development and we have not yet established firm contribution guidelines or acceptance criteria.

## OpenST

OpenST blockchain infrastructure empowers new economies for mainstream businesses and emerging (D)Apps. The smart contracts in this repository are intended for use with the OpenST Protocol, a framework for tokenizing businesses.

For more information on the OpenST Protocol, please consult the [Whitepaper](https://drive.google.com/file/d/0Bwgf8QuAEOb7Z2xIeUlLd21DSjQ/view).

_While this software is available as-is for anyone to use, we caution that this is in early stage and under heavy ongoing development and improvement. Please report bugs and suggested improvements._