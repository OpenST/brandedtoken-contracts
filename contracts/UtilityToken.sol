pragma solidity ^0.5.0;

// Copyright 2019 OpenST Ltd.
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
import "./EIP20Token.sol";
import "./CoGatewayUtilityTokenInterface.sol";
import "./organization/contracts/OrganizationInterface.sol";
import "./organization/contracts/Organized.sol";

/**
 *  @title UtilityToken is an EIP20Token and implements UtilityTokenInterface.
 *
 *  @notice This contract has increaseSupply and decreaseSupply functions that
 *          can be called only by CoGateway.
 */
contract UtilityToken is Organized, EIP20Token, UtilityTokenInterface {

    /* Events */

    /** Emitted whenever a CoGateway address is set. */
    event CoGatewaySet(address _coGateway);


    /* Storage */

    /** Address of branded token in the origin chain. */
    EIP20Interface public token;

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
     * @param _token Address of eip20 token on origin chain.
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
        EIP20Token(_symbol, _name, _decimals)
        Organized(_organization)
    {
        require(
            address(_token) != address(0),
            "Token address is null."
        );

        token = _token;
    }


    /* External functions */

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
        success_ = setCoGatewayInternal(_coGateway);
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
        success_ = increaseSupplyInternal(_beneficiary, _amount);
    }

    /**
     * @notice Decreases the token supply.
     *
     * @param _amount Amount of tokens.
     *
     * @return success_ `true` if decrease supply is successful, false otherwise.
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
     * @notice Checks if an address exists.
     *
     * @dev For standard ethereum all account addresses exist by default,
     *      so it returns true for all addresses.
     *
     * @return exists_ `true` for all given address
     */
    function exists(address) external returns (bool exists_) {
        exists_ = true;
    }


    /* Internal functions. */

    function setCoGatewayInternal(address _coGateway)
        internal
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
            CoGatewayUtilityTokenInterface(_coGateway).utilityToken()
                == address(this),
            "CoGateway should be linked with this utility token."
        );

        emit CoGatewaySet(coGateway);

        success_ = true;
    }

    /**
     * @notice Internal function to increases the total token supply.
     *
     * @dev Adds number of tokens to beneficiary balance and increases the
     *      total token supply.
     *
     * @param _account Account address for which the balance will be increased.
     * @param _amount Amount of tokens.
     *
     * @return success_ `true` if increase supply is successful, false otherwise.
     */
    function increaseSupplyInternal(
        address payable _account,
        uint256 _amount
    )
        internal
        returns (bool success_)
    {
        // Increase the balance of the _account
        balances[_account] = balances[_account].add(_amount);
        totalTokenSupply = totalTokenSupply.add(_amount);

        /*
         * Creation of the new tokens should trigger a Transfer event with
         * _from as 0x0.
         */
        emit Transfer(address(0), _account, _amount);

        success_ = true;
    }

    /**
     * @notice Internal function to decreases the token supply.
     *
     * @dev Decreases the token balance from the msg.sender address and
     *      decreases the total token supply count.
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
            balances[msg.sender] >= _amount,
            "Insufficient balance."
        );

        // Decrease the balance of the msg.sender account.
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        totalTokenSupply = totalTokenSupply.sub(_amount);

        /*
         * Burning of the tokens should trigger a Transfer event with _to
         * as 0x0.
         */
        emit Transfer(msg.sender, address(0), _amount);

        success_ = true;
    }
}
