/* solhint-disable-next-line compiler-fixed */
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

/**
 *  @title UtilityTokenInterface contract.
 *
 *  @notice Provides the interface to utility token contract.
 */
interface UtilityTokenInterface {

    /* Events */

    /** Minted raised when new utility tokens are minted for a beneficiary. */
    event Minted(
        address indexed _beneficiary,
        uint256 _amount,
        uint256 _totalSupply,
        address _utilityToken
    );

    /** Burnt raised when new utility tokens are burnt for an address. */
    event Burnt(
        address indexed _beneficiary,
        uint256 _amount,
        uint256 _totalSupply,
        address _utilityToken
    );

    /** Emitted whenever a CoGateway address is set. */
    event CoGatewaySet(
        address _utilityToken,
        address _coGateway
    );


    /* Public Functions */

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
        external
        returns (bool success_);

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
    function burn(
        uint256 _amount
    )
        payable
        external
        returns (bool success_);

    /**
     * @notice Sets the CoGateway contract address.
     *
     * @dev Function requires:
     *          - It is called by whitelisted workers.
     *          - coGateway address is set only once.
     *          - coGateway.utilityToken must match this contract.
     *
     * @param _coGateway CoGateway contract address.
     *
     */
    function setCoGateway(address _coGateway)
        external
        returns (bool);
}