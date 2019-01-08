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
import "./test/branded_token/TestBrandedToken.sol";


/**
 * @title GatewayComposer contract.
 *
 * @notice GatewayComposer is a composition contract which can be used to
 *         optimise the UX flow of the user where the user intends to perform
 *         a single combined action.
 */
// TODO Rename TestBT to BT
contract GatewayComposer {

    /* Struct */

    struct StakeRequest {
        uint256 stakeVT;
        address gateway;
        address beneficiary;
        uint256 gasPrice;
        uint256 gasLimit;
        uint256 nonce;
    }


    /* Storage */

    address public owner;

    /** EIP20Token value token which is staked on the value chain. */
    EIP20Interface public valueToken;

    /**
     * A Branded Token allows a mainstream application to create a value-backed
     * token designed specifically for its application's context.
     */
    TestBrandedToken public brandedToken;

    mapping (bytes32 => StakeRequest) public stakeRequests;


    /* Modifiers */

    /** Checks that msg.sender is owner address. */
    modifier onlyOwner() {
        require(
            owner == msg.sender,
            "Only owner can call the function."
        );
        _;
    }


    /* Special Functions */

    /**
     * @notice Contract constructor.
     *
     * @dev Function requires:
     *          - Owner address should not be null
     *          - ValueToken address should not be null
     *          - BrandedToken address should not be null
     *
     * @param _owner Address of the staker on the value chain.
     * @param _valueToken EIP20Token which is staked.
     * @param _brandedToken It's a value backed minted EIP20Token.
     */
    constructor(
        address _owner,
        EIP20Interface _valueToken,
        TestBrandedToken _brandedToken
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
            address(_brandedToken) != address(0),
            "Branded token address is null."
        );

        owner = _owner;
        valueToken = _valueToken;
        brandedToken = _brandedToken;
    }


    /* External Functions */

    /**
     * @notice Contract constructor.
     *
     * @param _stakeVT ValueToken amount which is staked.
     * @param _mintBT Amount of BT amount which will be minted.
     * @param _gateway Gateway contract address.
     * @param _beneficiary The address in the auxiliary chain where the utility
     *                     tokens will be minted..
     * @param _gasPrice Gas price that staker is ready to pay to get the stake
     *                  and mint process done..
     * @param _gasLimit Gas limit that staker is ready to pay.
     * @param _nonce Nonce of the staker address.
     *
     * @dev Function requires:
     *          - mintBT amount and converted stakeVT amount should be equal
     *          - Gateway address can't be null
     *          - Beneficiary address can't be null
     *          - Successful execution of ValueToken transfer
     *
     * @return requestStakeHash_ Hash unique for each stake request.
     */
    // TODO add @dev with details. add about nonce verification
    // TODO nonce verification
    function requestStake(
        uint256 _stakeVT,
        uint256 _mintBT,
        address _gateway,
        address _beneficiary,
        uint256 _gasPrice,
        uint256 _gasLimit,
        uint256 _nonce
    )
        external
        onlyOwner
        returns (bytes32 requestStakeHash_)
    {
        require(
            _mintBT == brandedToken.convert(_stakeVT),
            "Minted BT should be equal to converted staked VT."
        );
        require(
            _gateway != address(0),
            "Gateway address is null."
        );
        require(
            _beneficiary != address(0),
            "Beneficiary address is null."
        );
//        require(
//            valueToken.transferFrom(msg.sender, address(this), _stakeVT),
//            "ValueToken transfer failed."
//        );
//
        valueToken.approve(brandedToken, _stakeVT);

        requestStakeHash_ = brandedToken.requestStake(_stakeVT, _mintBT);

        stakeRequests[requestStakeHash_] = StakeRequest({
            stakeVT: _stakeVT,
            mintBT: _mintBT,
            gateway: _gateway,
            beneficiary: _beneficiary,
            gasPrice: _gasPrice,
            gasLimit: _gasLimit,
            nonce: _nonce
        });

    }

}
