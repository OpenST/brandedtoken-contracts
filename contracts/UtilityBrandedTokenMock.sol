pragma solidity ^0.4.23;

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

import "./UtilityBrandedToken.sol";
import "./EIP20Interface.sol";
import "./OrganizationIsWorkerInterface.sol";


/**
 * @title UtilityBrandedTokenMock contract.
 *
 * @notice UtilityBrandedToken is inheriting UtilityBrandedToken contract.
 *
 * @dev UtilityBrandedTokenMock facilitates testing of UtilityBrandedToken.
 *
 */
contract UtilityBrandedTokenMock is UtilityBrandedToken {

    /* Special Function */

    constructor(
        EIP20Interface _token,
        string _symbol,
        string _name,
        uint8 _decimals,
        OrganizationIsWorkerInterface _organization
    )
        public
        UtilityBrandedToken(_token, _symbol, _name, _decimals, _organization)
    {}


    /* Public functions */

    /**
     *  @dev Takes _owner, _value; sets balance of _owner to _value.
     *
     *  @notice It sets the balance for an address.
     *
     *  @param _owner Owner address.
     *  @param _value Amount of BT's to be set.
     *
     *  @return True if success.
     */
    function setBalance(
        address _owner,
        uint256 _value)
        public
        returns (bool)
    {
        balances[_owner] = _value;
        return true;
    }

    /**
     * @dev It is used in testing mint and burn methods.
     *
     * @notice It sets the coGateway address.
     *
     * @param _coGatewayAddress CoGateway contract address.
     */
    function mockSetCoGateway(address _coGatewayAddress) public {
        coGateway = _coGatewayAddress;
    }
}
