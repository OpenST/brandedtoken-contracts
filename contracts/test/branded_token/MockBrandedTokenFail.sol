pragma solidity ^0.5.0;

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

import "./../../BrandedToken.sol";


/**
 * @title MockBrandedTokenFail.
 *
 * @notice Supports testing of BrandedToken(BT) failure cases.
 */
contract MockBrandedTokenFail is BrandedToken {

    /* Special Functions */

    /**
     * @dev Conversion parameters provide the conversion rate and its scale.
     *      For example, if 1 value token is equivalent to 3.5 branded
     *      tokens (1:3.5), _conversionRate == 35 and _conversionRateDecimals == 1.
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
        EIP20Interface _valueToken,
        string memory _symbol,
        string memory _name,
        uint8 _decimals,
        uint256 _conversionRate,
        uint8 _conversionRateDecimals,
        OrganizationInterface _organization
    )
        BrandedToken(
            _valueToken,
            _symbol,
            _name,
            _decimals,
            _conversionRate,
            _conversionRateDecimals,
            _organization
        )
        public
    {}


    /* External Functions */

    /**
     * @notice Mocks BT requestStake function.
     *
     * @dev It takes below parameters in order:
     *      - amount to stake
     *      - amount to mint
     *
     * @return Unique hash for each stake request.
     */
    function requestStake(
        uint256,
        uint256
    )
        external
        returns (bytes32)
    {

        return bytes32(0);
    }

    /**
     * @notice Mocks BT acceptStakeRequest function. It fails the execution.
     *
     * @dev It takes below parameters in order:
     *      - stake request hash
     *      - r is the actual signature
     *      - s is the second point on the curve in order to ecrecover
     *      - v selects the final public key
     */
    function acceptStakeRequest(
        bytes32,
        bytes32,
        bytes32,
        uint8
    )
        external
        returns (bool)
    {
        require(false, "BT.acceptStakeRequest() returned false.");
    }

    /**
     * @notice Mocks BT.revokeStakeRequest() function.
     *
     * @dev It takes below parameters in order:
     *      - stake request hash
     *
     * @return False to replicate failure cases.
     */
    function revokeStakeRequest(
        bytes32
    )
        external
        returns (bool)
    {
        return false;
    }

}
