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
 *      application and support minting and burning of tokens.
 */
contract UtilityBrandedToken is EIP20Token, UtilityTokenInterface, Internal {

    /* Storage */

    /** Address of the EIP20 token(VBT) in origin chain. */
    EIP20Interface public valueToken;

    /**
     *  Address of CoGateway contract. It ensures that minting and burning is
     *  done from coGateway.
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
     * @param _token Value chain EIP20 contract address. It acts as an identifier.
     * @param _symbol Symbol of the token.
     * @param _name Name of the token.
     * @param _decimals Decimal places of the token.
     * @param _organization Address of the Organization contract.
     */
    constructor(
        EIP20Interface _token,
        string _symbol,
        string _name,
        uint8 _decimals,
        OrganizationIsWorkerInterface _organization
    )
        public
        Internal(_organization)
        EIP20Token(_symbol, _name, _decimals)
    {
        require(
            address(_token) != address(0),
            "Token address is null."
        );
        valueToken = _token;
    }


    /* Public functions */

    /**
     * @notice Public function transfer.
     *
     * @dev Function requires that _to address is an internal actor.
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
     * @dev Function requires that _to address is an internal actor.
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

    /**
     * @notice Public function approve.
     *
     * @dev It only allows approval to internal actors.
     *
     * @param _spender Address to which msg.sender is approving.
     * @param _value Number of BTs to be approved.
     *
     * @return Success/failure status of approve.
     */
    function approve(
        address _spender,
        uint256 _value
    )
        public
        returns (bool)
    {
        require(
            isInternalActor[_spender],
            "Spender is not an internal actor."
        );

        return super.approve(_spender, _value);
    }

    /**
     * @notice Public function mint.
     *
     * @dev Function requires:
     *          - It is called by only CoGateway contract.
     *          - It only mints to internal actors.
     *
     * @param _beneficiary Address of beneficiary.
     * @param _amount Amount of utility tokens to mint.
     *
     * @return True if mint is successful, false otherwise.
     */
    function mint(
        address _beneficiary,
        uint256 _amount
    )
        public
        onlyCoGateway
        returns (bool)
    {
        require(
            (isInternalActor[_beneficiary]),
            "Beneficiary is not an economy actor."
        );

        balances[_beneficiary] = balances[_beneficiary].add(_amount);
        totalTokenSupply = totalTokenSupply.add(_amount);

        emit Minted(_beneficiary, _amount, totalTokenSupply, address(this));

        return true;
    }

    /**
     * @notice Public function burn.
     *
     * @dev Function requires:
     *          - It is called by only CoGateway contract.
     *          - It only allows to burn BTs.
     *
     * @param _amount Amount of tokens to burn.
     *
     * @return True if burn is successful, false otherwise.
     */
    function burn(uint256 _amount)
        public
        onlyCoGateway
        payable
        returns (bool)
    {
        // force non-payable, as only ST" handles in base tokens.
        // ST" burn is not allowed from this function. Only BT Burn can be done
        // from here.
        require(msg.value == 0, "msg.value is not 0");

        balances[msg.sender] = balances[msg.sender].sub(_amount);
        totalTokenSupply = totalTokenSupply.sub(_amount);

        emit Burnt(msg.sender, _amount, totalTokenSupply, address(this));

        return true;
    }


    /**
     * @notice Sets the CoGateway contract address.
     *
     * @dev Function requires:
     *          - It is called by whitelisted workers.
     *          - coGateway address is set only once.
     *          - It checks whether Cogateway is linked with any other utility
     *            tokens.
     *
     * @param _coGatewayAddress CoGateway contract address.
     *
     */
    function setCoGateway(address _coGatewayAddress)
        public
        onlyWorker
    {
        require(
            coGateway == address(0),
            "CoGateway address already set."
        );

        require(
            CoGatewayUtilityTokenInterface(_coGatewayAddress).utilityToken() ==
            address(this),
            "CoGateway is linked with some other utility token."
        );

        coGateway = _coGatewayAddress;

        emit CoGatewaySet(address(this), coGateway);
    }
}
