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

import "../UtilityBrandedToken.sol";
import "../utilitytoken/contracts/organization/contracts/OrganizationInterface.sol";


/**
 * @title TestUtilityBrandedToken contract.
 *
 * @notice UtilityBrandedToken is inheriting UtilityBrandedToken contract.
 *
 * @dev TestUtilityBrandedToken facilitates testing of UtilityBrandedToken.
 *
 */
contract TestUtilityBrandedToken is UtilityBrandedToken {

    /* Special Function */

    /**
     * @notice Contract constructor.
     *
     * @dev Creates an EIP20Token contract with arguments passed in the
     *      contract constructor.
     *
     * @param _token Address of branded token on origin chain.
     *        It acts as an identifier.
     * @param _symbol Symbol of the token.
     * @param _name Name of the token.
     * @param _decimals Decimal places of the token.
     * @param _organization Address of the Organization contract.
     */
    constructor(
        address _token,
        string memory _symbol,
        string memory _name,
        uint8 _decimals,
        OrganizationInterface _organization
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
        uint256 _value
    )
        public
        returns (bool)
    {
        balances[_owner] = _value;
        return true;
    }

    /**
     * @dev It is used in testing increaseSupply and decreaseSupply methods.
     *
     * @notice It sets the coGateway address.
     *
     * @param _coGatewayAddress CoGateway contract address.
     */
    function mockSetCoGateway(address _coGatewayAddress) public {
        coGateway = _coGatewayAddress;
    }
}
