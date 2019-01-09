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

import "./EIP20Interface.sol";
import "./GatewayInterface.sol";
import "./BrandedToken.sol";


/**
 * @title GatewayComposer contract.
 *
 * @notice GatewayComposer is a composition contract which can be used to
 *         optimise the UX flow of the user where the user intends to perform
 *         a single combined action.
 */
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
    * A BrandedToken is an EIP20Token which allows a mainstream application
    * to create a value-backed token designed specifically for its
    * application's context.
    */
    BrandedToken public brandedToken;

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
        BrandedToken _brandedToken
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
     * @dev Staker approves GC for stakeVT amount. Staker then calls
     *      GC.requestStake. In GC.requestStake, stakeVT amount is approved
     *      to BT contract. BT.requestStake function is called and after
     *      successful execution, data is stored in stakeRequests mapping.
     *
     *      stakeVT can't be 0 because gateway.stake also doesn't allow 0 stake
     *      amount. This condition also helps in validation of in progress
     *      stake requests. See acceptStakeRequest for details.
     *
     *      Function requires:
     *          - stakeVT can't be 0
     *          - mintBT amount and converted stakeVT amount should be equal
     *          - Gateway address can't be null
     *          - Beneficiary address can't be null
     *          - Successful execution of ValueToken transfer
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
     * @return requestStakeHash_ Hash unique for each stake request.
     */
    // TODO add about nonce verification
    // TODO nonce verification
    // TODO -ve test cases
    // TODO assert for transferfrom balance
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
            _stakeVT > uint256(0),
            "Stake amount is zero."
        );
        require(
            _mintBT == brandedToken.convertToBrandedTokens(_stakeVT),
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
        require(
            valueToken.transferFrom(msg.sender, address(this), _stakeVT),
            "ValueToken.transferFrom returned false."
        );

        valueToken.approve(address(brandedToken), _stakeVT);

        requestStakeHash_ = brandedToken.requestStake(_stakeVT, _mintBT);

        stakeRequests[requestStakeHash_] = StakeRequest({
            stakeVT: _stakeVT,
            gateway: _gateway,
            beneficiary: _beneficiary,
            gasPrice: _gasPrice,
            gasLimit: _gasLimit,
            nonce: _nonce
        });
    }

    // TODO Documentation
    // TODO GatewayInterface
    // TODO How to require Gateway.stake
    // TODO -ve test cases
    // Positive test case for bounty
    function acceptStakeRequest(
        bytes32 _stakeRequestHash,
        bytes32 _r,
        bytes32 _s,
        uint8 _v,
        bytes32 _hashLock
    )
        external
        returns (bytes32 messageHash_)
    {
        StakeRequest storage stakeRequest = stakeRequests[_stakeRequestHash];
        require(
            stakeRequests[_stakeRequestHash].stakeVT > uint256(0),
            "Stake request not found."
        );

        uint256 bounty = GatewayInterface(stakeRequest.gateway).bounty();
        if (bounty > 0) {
            valueToken.transferFrom(msg.sender, address(this), bounty);
            valueToken.approve(stakeRequest.gateway, bounty);
        }

        require(
            brandedToken.acceptStakeRequest(_stakeRequestHash, _r, _s, _v),
            "BT.acceptStakeRequest returned false."
        );

        uint256 mintBT = brandedToken.convertToBrandedTokens(
            stakeRequest.stakeVT
        );

        valueToken.approve(stakeRequest.gateway, mintBT);

        messageHash_ = GatewayInterface(stakeRequest.gateway).stake(
            mintBT,
            stakeRequest.beneficiary,
            stakeRequest.gasPrice,
            stakeRequest.gasLimit,
            stakeRequest.nonce,
            _hashLock
        );

        delete stakeRequests[_stakeRequestHash];
    }

}
