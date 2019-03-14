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

import "./UtilityToken.sol";
import "./CoGatewayUtilityTokenInterface.sol";


/**
 * @title UtilityBrandedToken contract.
 *
 * @notice UtilityBrandedToken is an EIP20 token which implements
 *         UtilityTokenInterface.
 *
 * @dev UtilityBrandedToken are designed to be used within a decentralised
 *      application and support increaseSupply and decreaseSupply of tokens.
 */
contract UtilityBrandedToken is UtilityToken {

    /* Events */

    event InternalActorRegistered(
        address _actor
    );


    /* Storage */

    /** Mapping stores addresses which are registered as internal actor. */
    mapping (address /* internal actor */ => bool) public isInternalActor;


    /* Special Functions */

    /**
     * @notice Contract constructor.
     *
     * @dev Creates an utility branded token contract with arguments passed
     *      in the contract constructor.
     *
     * @param _token Address of branded token on origin chain.
     *               It acts as an identifier.
     * @param _symbol Symbol of the token.
     * @param _name Name of the token.
     * @param _decimals Decimal places of the token.
     * @param _organization Address of the Organization contract.
     */
    constructor(
        EIP20Interface _token,
        string memory _symbol,
        string memory _name,
        uint8 _decimals,
        OrganizationInterface _organization
    )
        public
        UtilityToken(_token, _symbol, _name, _decimals, _organization)
    {
    }


    /* External functions */

    /**
     * @notice Registers internal actors.
     *
     * @param _internalActors Array of addresses of the internal actors
     *        to register.
     */
    function registerInternalActors(address[] calldata _internalActors)
        external
        onlyWorker
    {
        for (uint256 i = 0; i < _internalActors.length; i++) {
            if (!isInternalActor[_internalActors[i]]) {
                isInternalActor[_internalActors[i]] = true;
                emit InternalActorRegistered(_internalActors[i]);
            }
        }
    }

    /**
     * @notice Sets the CoGateway contract address.
     *
     * @dev Function requires:
     *          - Caller is organization.
     *          - coGateway address is not set.
     *          - coGateway.utilityToken is equal to this contract address.
     *
     * @param _coGateway CoGateway contract address.
     */
    function setCoGateway(address _coGateway)
        external
        onlyOrganization
        returns (bool success_)
    {
        success_ = super.setCoGatewayInternal(_coGateway);

        // Registers co-gateway as an internal actor.
        isInternalActor[coGateway] = true;
    }

    /**
     * @notice Increases the total token supply. Also, adds the number of
     *         tokens to the beneficiary balance.
     *
     * @param _beneficiary Account address for which the balance will be
     *                     increased. This is payable so that it provides
     *                     flexibility of transferring base token to account
     *                     on increase supply.
     * @param _amount Amount of tokens.
     *
     * @return success_ `true` if increase supply is successful, false otherwise.
     */
    function increaseSupply(
        address payable _beneficiary,
        uint256 _amount
    )
        external
        onlyCoGateway
        returns (bool success_)
    {
        require(
            isInternalActor[_beneficiary],
            "Beneficiary is not an internal actor."
        );

        success_ = super.increaseSupplyInternal(_beneficiary, _amount);
    }

    /**
     * @notice Checks if an address is an internal actor.
     *
     * @return exists_ `true` if the specified account is an internal actor,
     *                 otherwise `false`.
     */
    function exists(address account) external returns (bool exists_) {
        exists_ = isInternalActor[account];
    }


    /* Public functions */

    /**
     * @notice Public function transfer.
     *
     * @dev Function requires:
     *         - _to address is an internal actor
     *
     * @param _to Address to which BT needs to transfer.
     * @param _value Number of BTs that needs to transfer.
     *
     * @return Success/failure status of transfer.
     */
    function transfer(
        address _to,
        uint256 _value
    )
        public
        returns (bool)
    {
        require(
            isInternalActor[_to],
            "To address is not an internal actor."
        );

        return super.transfer(_to, _value);
    }

    /**
     * @notice Public function transferFrom.
     *
     * @dev Function requires:
     *         - _to address is an internal actor
     *
     * @param _from Address from which BT needs to transfer.
     * @param _to Address to which BT needs to transfer.
     * @param _value Number of BTs that needs to transfer.
     *
     * @return Success/failure status of transferFrom.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        returns (bool)
    {
        require(
            isInternalActor[_to],
            "To address is not an internal actor."
        );

        return super.transferFrom(_from, _to, _value);
    }
}
