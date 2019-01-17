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
 * @title MockGatewayFail contract.
 *
 * @notice Mocks gateway contract for negative test cases.
 */
contract MockGatewayFail {


    /* Special Functions */

    constructor()
        public
    {}


    /* External Functions */

    /**
     * @notice Returns bounty amount.
     *
     * @return Amount of ERC20 which needs to be staked by facilitator.
     */
    function bounty()
        external
        pure
        returns (uint256)
    {
        return 0;
    }

    /**
     * @notice Mocks gateway.stake. It fails the execution.
     *
     * @dev parameters are in below order:
     *      _amount
     *      _beneficiary
     *      _gasPrice
     *      _gasLimit
     *      _nonce
     *      _hashLock
     *
     */
    function stake(
        uint256,
        address,
        uint256,
        uint256,
        uint256,
        bytes32
    )
        pure
        external
        returns (bytes32)
    {
        require(false, "Gateway.stake() execution failed.");
    }

}
