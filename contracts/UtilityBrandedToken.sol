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
//
// ----------------------------------------------------------------------------
// Utility chain: UtilityBrandedToken
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

import "./UtilityTokenInterface.sol";
import "./Internal.sol";
import "./EIP20Token.sol";
import "./CoGatewayUtilityTokenInterface.sol";


/**
 * @title UtilityBrandedToken contract which implements UtilityToken, Internal.
 *
 * @notice UtilityBrandedToken is an EIP20 token.
 *
 * @dev UtilityBrandedToken are designed to be used within a decentralised
 *      application and support:
 *      - minting and burning of tokens.
 */
contract UtilityBrandedToken is EIP20Token, Internal, UtilityTokenInterface {

    /* Storage */

    /** Address of the EIP20 token(VBT) in origin chain. */
    EIP20Interface public valueToken;

    /** Address of CoGateway contract. */
    address public coGateway;


    /* Modifiers */

    /** checks that msg.sender is cogateway address. */
    modifier onlyCoGateway() {
        require(
            msg.sender == coGateway,
            "Only CoGateway can call the function."
        );
        _;
    }


    /** Special Functions */

    /**
     * @notice Contract constructor.
     *
     * @dev Creates an EIP20Token contract with arguments passed in the
     *      contract constructor.
     *
     * @param _token Value chain EIP20 contract address. It acts as identifier.
     * @param _symbol Symbol of the token.
     * @param _name Name of the token.
     * @param _decimals Decimal places of the token.
     * @param _organization Address of the organization.
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
     * @notice public function transfer.
     *
     * @dev It only allows transfer to internal actors.
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
        returns (bool /* success */)
    {
        require(
            isInternalActor[_to],
            "To address is not an internal actor."
        );

        return super.transfer(_to, _value);
    }

    /**
     * @notice public function transferFrom.
     *
     * @dev It only allows transfer to internal actors.
     *
     * @param _from Address from which BT needs to transfer.
     * @param _to Address to which BT needs to transfer.
     * @param _value Number of BTs that needs to transfer.
     *
     * @return success/failure status of transferFrom.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        returns (bool /* success */)
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
        returns (bool /* success */)
    {
        require(
            isInternalActor[_spender],
            "spender is not an internal actor."
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
     * @return true if mint is successful, false otherwise.
     */
    function mint(
        address _beneficiary,
        uint256 _amount
    )
        public
        onlyCoGateway
        returns (bool /* success */)
    {
        require(
            (isInternalActor[_beneficiary]),
            "Beneficiary is not an economy actor."
        );

        // mint EIP20 tokens in contract address for them to be claimed
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
     * @return true if burn is successful, false otherwise.
     */
    function burn(uint256 _amount)
        public
        onlyCoGateway
        payable
        returns (bool /* success */)
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
     *          - It checks the whether Cogateway is linked with other utility
     *            tokens.
     *
     * @param _coGatewayAddress CoGateway contract address.
     *
     * @return `true` If CoGateway address was set.
     */
    function setCoGateway(address _coGatewayAddress)
        public
        onlyWorker
        returns (bool)
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
