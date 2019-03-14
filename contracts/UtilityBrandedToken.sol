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

import "./UtilityTokenInterface.sol";
import "./Internal.sol";
import "./EIP20Token.sol";
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
contract UtilityBrandedToken is EIP20Token, UtilityTokenInterface, Internal {

    /* Events */

    /** Emitted whenever a CoGateway address is set. */
    event CoGatewaySet(address _coGateway);


    /* Storage */

    /** Address of BrandedToken in origin chain. */
    EIP20Interface public brandedToken;

    /**
     *  Address of CoGateway contract. It ensures that increaseSupply and
     *  decreaseSupply is done from coGateway.
     */
    address public coGateway;


    /* Modifiers */

    /** Checks that msg.sender is coGateway address. */
    modifier onlyCoGateway() {
        require(
            msg.sender == coGateway,
            "Only CoGateway can call the function."
        );
        _;
    }


    /* Special Functions */

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
        EIP20Interface _token,
        string memory _symbol,
        string memory _name,
        uint8 _decimals,
        OrganizationInterface _organization
    )
        public
        Internal(_organization)
        EIP20Token(_symbol, _name, _decimals)
    {
        require(
            address(_token) != address(0),
            "Token address is null."
        );
        brandedToken = _token;
    }


    /* External functions */

    /**
     * @notice Increases the total token supply. Also, adds the number of
     *         tokens to the beneficiary balance.The parameters _account
     *         and _amount should not be zero. This check is added in function
     *         increaseSupplyInternal.
     *
     * @dev Function requires:
     *          - it should only be called by coGateway address
     *
     * @param _beneficiary Account address for which the balance will be increased.
     * @param _amount Amount of tokens.
     *
     * @return True if increase supply is successful, false otherwise.
     */
    function increaseSupply(
        address _beneficiary,
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
        success_ = increaseSupplyInternal(_beneficiary, _amount);
    }

    /**
     * @notice Sets the CoGateway contract address.
     *
     * @dev Function requires:
     *          - Caller must be a whitelisted worker
     *          - coGateway is required to be address(0)
     *          - coGateway.utilityToken must be equal to this contract address
     *
     * @param _coGateway CoGateway contract address.
     */
    function setCoGateway(address _coGateway)
        external
        onlyOrganization
        returns (bool success_)
    {
        require(
            coGateway == address(0),
            "CoGateway address already set."
        );

        require(
            _coGateway != address(0),
            "CoGateway address should not be zero."
        );

        coGateway = _coGateway;

        require(
            CoGatewayUtilityTokenInterface(_coGateway).utilityToken() ==
            address(this),
            "CoGateway.utilityToken is required to be UBT address."
        );

        // Registers co-gateway as an internal actor.
        isInternalActor[coGateway] = true;

        emit CoGatewaySet(coGateway);

        success_ = true;
    }

    /**
     * @notice Decreases the token supply.The parameters _amount should not be
     *         zero. This check is added in function decreaseSupplyInternal.
     *
     * @dev Function requires:
     *         - it should only be called by coGateway address
     *
     * @param _amount Amount of tokens.
     *
     * @return True if decrease supply is successful, false otherwise.
     */
    function decreaseSupply(
        uint256 _amount
    )
        external
        onlyCoGateway
        returns (bool success_)
    {
        success_ = decreaseSupplyInternal(_amount);
    }

    /**
     * @notice Checks if input address is an internal actor or not.
     *
     * @param _actor Actor address.
     *
     * @return True if actor is an internal actor, false otherwise.
     */
    function exists(address _actor) external view returns (bool) {
        return isInternalActor[_actor];
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


    /* Internal functions. */

    /**
     * @notice Internal function to increases the total token supply. Adds
     *          number of tokens to beneficiary balance and increases the total
     *          token supply.
     *
     * @dev Function requires:
     *          - _beneficiary address should not be zero
     *          - _amount should be greater than zero
     *
     * @param _beneficiary Account address for which the balance will be increased.
     * @param _amount Amount of tokens.
     *
     * @return success_ `true` if increase supply is successful, false otherwise.
     */
    function increaseSupplyInternal(
        address _beneficiary,
        uint256 _amount
    )
        internal
        returns (bool success_)
    {
        require(
            _beneficiary != address(0),
            "Beneficiary address should not be zero."
        );

        require(
            _amount > 0,
            "Amount should be greater than zero."
        );

        // Increase the balance of the _account
        balances[_beneficiary] = balances[_beneficiary].add(_amount);
        totalTokenSupply = totalTokenSupply.add(_amount);

        /*
         * Creation of the new tokens should trigger a Transfer event with
         * _from as 0x0.
         */
        emit Transfer(address(0), _beneficiary, _amount);

        success_ = true;
    }

    /**
     * @notice Internal function to decreases the token supply. Decreases the
     *         token balance from the msg.sender address and decreases the
     *         total token supply count.
     *
     * @dev Function requires:
     *          - _amount should be greater than zero
     *
     * @param _amount Amount of tokens.
     *
     * @return success_ `true` if decrease supply is successful, false otherwise.
     */
    function decreaseSupplyInternal(
        uint256 _amount
    )
        internal
        returns (bool success_)
    {
        require(
            _amount > 0,
            "Amount should be greater than zero."
        );

        address sender = msg.sender;

        require(
            balances[sender] >= _amount,
            "Insufficient balance."
        );

        // Decrease the balance of the msg.sender account.
        balances[sender] = balances[sender].sub(_amount);
        totalTokenSupply = totalTokenSupply.sub(_amount);

        /*
         * Burning of the tokens should trigger a Transfer event with _to
         * as 0x0.
         */
        emit Transfer(sender, address(0), _amount);

        success_ = true;
    }

}
