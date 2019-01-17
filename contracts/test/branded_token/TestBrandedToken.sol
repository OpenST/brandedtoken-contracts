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

/**
 * @title TestBrandedToken.
 *
 * @notice Supports testing of BrandedToken (BT).
 */
contract TestBrandedToken {

    /* Events */

    event StakeRequested(
        bytes32 indexed _stakeRequestHash,
        address _staker,
        uint256 _stake,
        uint256 _nonce
    );

    event StakeRequestAccepted(address _staker, uint256 _stake);

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );


    /* Special Functions */

    /**
     * @notice Contract constructor.
     *
     * @dev It takes below parameters in order:
     *      - valueToken
     *      - symbol
     *      - name
     *      - decimals
     *      - conversionRate
     *      - conversionRateDecimals
     *      - organization contract address
     */
    constructor(
        address,
        string memory,
        string memory,
        uint8,
        uint256,
        uint8,
        address
    )
        public
    {}


    /* External Functions */

    /**
     * @notice Mocks BT requestStake method.
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
        emit StakeRequested(bytes32(0), address(0), uint256(0), uint256(0));

        return bytes32(0);
    }

    /**
     * @notice Mocks BT acceptStakeRequest method.
     *
     * @dev It takes below parameters in order:
     *      - stake request hash
     *      - r is the actual signature
     *      - s is the second point on the curve in order to ecrecover
     *      - v selects the final public key
     *
     * @return True if execution is successful.
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
        emit StakeRequestAccepted(address(0), uint256(0));

        emit Transfer(address(0), address(0), uint256(0));

        return true;
    }

    /**
     * @notice Mocks BT liftRestriction method.
     *
     * @dev It takes an array of addresses.
     *
     * @return True if execution is successful.
     */
    function liftRestriction(address[] calldata)
        external
        pure
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Mocks BT isUnrestricted method.
     *
     * @dev It takes an address.
     *
     * @return True if address is unrestricted.
     */
    function isUnrestricted(address)
        external
        pure
        returns (bool)
    {
        return true;
    }

}
