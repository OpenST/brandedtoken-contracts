# Branded Token Contracts Change Log

Below is a list of notable changes implemented in this repository.

## 0.10.0
<!-- [**0.10.0, (<release date: DD MM YYYY>)**](https://github.com/OpenSTFoundation/brandedtoken-contracts/releases/tag/0.10.0) -->

* Contracts: Remove reentrancy from BrandedToken::acceptStakeRequest() ([#150](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/150))
* Contracts: GatewayComposer: Reentrancy evaluation and prevention mechanisms ([#147](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/147))
* Contracts: update and test SafeMath ([#127](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/127))
* Tests: Fix negative tests with unresolved promises ([#118](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/118))
* Tests: Complete testing of various BrandedToken functions ([#114](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/114))
* Tests: Add negative test for BrandedToken's liftAllRestrictions ([#111](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/111))
* Tests: Add negative test for BrandedToken's redeem ([#108](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/108))
* Contracts: Limit BrandedToken conversionRateDecimals to 5 ([#107](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/107))
* Contracts: Calculate stakeRequestHash per EIP 712 ([#105](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/105))
* Contracts: Add destroy to GatewayComposer ([#103](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/103))
* Contracts: Add setName and setSymbol for BrandedToken ([#102](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/102))
* Contracts: Initially implement GatewayComposer ([#88](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/88))
* Contracts: Add initial implementation of BrandedToken ([#87](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/87))
* Contracts: Update contracts for Solidity 0.5.0 ([#76](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/76))
* Tests: Test Internal ([#51](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/51))
* Contracts: Implement UtilityBrandedToken ([#47](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/47))
* Contracts: Add Internal for use with UtilityBrandedToken ([#43](https://github.com/OpenSTFoundation/brandedtoken-contracts/pull/43))
