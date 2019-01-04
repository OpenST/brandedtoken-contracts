pragma solidity ^0.5.0;

// Copyright 2019 OpenST Ltd.
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

import "./EIP20Token.sol";
import "./Organized.sol";

/**
 *  @title Branded Token.
 *
 * @notice Supports staking value tokens for minting branded tokens
 *         where the conversion rate from value token to branded token
 *         is not 1:1. This contract does not require a non-1:1 conversion rate,
 *         but it is expected that if the conversion rate is 1:1, value tokens
 *         will be staked directly through a Gateway.
 */
contract BrandedToken is Organized, EIP20Token {

    /* Storage */

    /** Address for value tokens staked to mint branded tokens. */
    EIP20TokenInterface public valueToken;

    /** Conversion rate from value tokens to branded tokens. */
    uint256 public conversionRate;

    /** Number of digits to the right of the decimal point in conversionRate. */
    uint8 public conversionRateDecimals;

    /* Constructor */

    /**
     * @dev Conversion parameters provide the conversion rate and its scale.
     *      For example, if 1 value token is equivalent to 3.5 branded
     *      tokens (1:3.5), _conversionRate == 35 and _conversionRateDecimals == 1.
     *
     *      Constructor requires:
     *          - valueToken address is not zero;
     *          - conversionRate is not zero;
     *
     * @param _valueToken The value to which valueToken is set.
	 * @param _symbol The value to which tokenSymbol, defined in EIP20Token, is set.
	 * @param _name The value to which tokenName, defined in EIP20Token, is set.
	 * @param _decimals The value to which tokenDecimals, defined in EIP20Token, is set.
     * @param _conversionRate The value to which conversionRate is set.
     * @param _conversionRateDecimals The value to which conversionRateDecimals
     *                                is set.
     * @param _organization The value to which organization, defined in Organized, is set.
     */
    constructor(
        EIP20TokenInterface _valueToken,
		string memory _symbol,
		string memory _name,
		uint8 _decimals,
		uint256 _conversionRate,
        uint8 _conversionRateDecimals,
        OrganizationInterface _organization
    )
        EIP20Token(_symbol, _name, _decimals)
        Organized(_organization)
        public
    {
        require(
            address(_valueToken) != address(0),
            "ValueToken is zero."
        );
        require(
            _conversionRate != 0,
            "ConversionRate is zero."
        );

        valueToken = _valueToken;
        conversionRate = _conversionRate;
        conversionRateDecimals = _conversionRateDecimals;
    }
}