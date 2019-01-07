pragma solidity ^0.4.24;

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

import "./EIP20Interface.sol";


/**
 * @title GatewayComposer contract.
 *
 * @notice GatewayComposer is a composition contract which can be used to
 *         optimise the UX flow of the user where the user intends to perform
 *         a single combined action.
 */
contract GatewayComposer {

    /* Storage */

    address public owner;

    /* EIP20Token value token which is staked on the value chain. */
    EIP20Interface public valueToken;

    /**
     * A Branded Token allows a mainstream application to create a value-backed
     * token designed specifically for its application's context.
     */
    address public brandedToken;


    /* Special Functions */

    /**
     * @notice Contract constructor.
     *
     * @param _owner Address of the staker on the value chain.
     * @param _valueToken EIP20Token which is staked.
     * @param _brandedToken It's a value backed minted EIP20Token.
     */
    constructor(
        address _owner,
        EIP20Interface _valueToken,
        address _brandedToken
    )
        public
    {
        require(
            _owner != address(0),
            "Owner address is null."
        );
        require(
            address(_valueToken) != address(0),
            "Value token address is null."
        );
        require(
            _brandedToken != address(0),
            "Branded token address is null."
        );

        owner = _owner;
        valueToken = _valueToken;
        brandedToken = _brandedToken;
    }

}
