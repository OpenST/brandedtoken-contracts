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
 * @title TestGatewayComposer.
 *
 * @notice Supports testing of GatewayComposer.
 */
contract TestGatewayComposer {

    /* Special Functions */

    /**
     * @notice Contract constructor.
     *
     * @dev It takes below parameters in order:
     *      - owner/staker address
     *      - EIP20 value token address
     *      - branded token address
     */
    constructor(
        address,
        address,
        address
    )
        public
    {}


    /* External Functions */

    /**
     * @notice Mocks GC requestStake method.
     *
     * @dev It takes below parameters in order:
     *      - stakeVT amount
     *      - mintBT amount
     *      - gateway address
     *      - beneficiary address
     *      - gasPrice
     *      - gasLimit
     *      - nonce
     *
     * @return Unique hash for each stake request.
     */
    function requestStake(
        uint256,
        uint256,
        address,
        address,
        uint256,
        uint256,
        uint256
    )
        external
        pure
        returns (bytes32)
    {
        return bytes32(0);
    }

    /**
     * @notice Mocks GC acceptStakeRequest method.
     *
     * @dev It takes below parameters in order:
     *      - stake request hash
     *      - r is the actual signature
     *      - s is the second point on the curve in order to ecrecover
     *      - v selects the final public key
     *      - facilitator hashlock
     *
     * @return Message hash returned by Gateway.stake.
     */
    function acceptStakeRequest(
        bytes32,
        bytes32,
        bytes32,
        uint8,
        bytes32
    )
        external
        pure
        returns (bytes32)
    {
        return bytes32(0);
    }

}
