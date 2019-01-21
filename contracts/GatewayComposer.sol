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
     *          - owner address should not be zero
     *          - ValueToken address should not be zero
     *          - BrandedToken address should not be zero
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
            "Owner address is zero."
        );
        require(
            address(_valueToken) != address(0),
            "ValueToken address is zero."
        );
        require(
            address(_brandedToken) != address(0),
            "BrandedToken address is zero."
        );
        require(
            address(_valueToken) == address(_brandedToken.valueToken()),
            "ValueToken should match BrandedToken.valueToken."
        );

        owner = _owner;
        valueToken = _valueToken;
        brandedToken = _brandedToken;
    }


    /* External Functions */

    /**
     * @notice Transfers value tokens from msg.sender to itself after staker
     *         approves GatewayComposer, approves BrandedToken for value tokens
     *         and calls BrandedToken.requestStake function.
     *
     * @dev Function requires:
     *          - stakeVT can't be 0
     *          - mintBT amount and converted stakeVT amount should be equal
     *          - gateway address can't be zero
     *          - beneficiary address can't be zero
     *          - successful execution of ValueToken transfer
     *
     *      stakeVT can't be 0 because gateway.stake also doesn't allow 0 stake
     *      amount. This condition also helps in validation of in progress
     *      stake requests. See acceptStakeRequest for details.
     *
     *      mintBT is not stored in StakeRequest struct as there was
     *      significant gas cost difference between storage vs dynamic
     *      evaluation from BrandedToken convert function.
     *
     * @param _stakeVT ValueToken amount which is staked.
     * @param _mintBT Amount of BrandedToken amount which will be minted.
     * @param _gateway Gateway contract address.
     * @param _beneficiary The address in the auxiliary chain where the utility
     *                     tokens will be minted.
     * @param _gasPrice Gas price that staker is ready to pay to get the stake
     *                  and mint process done.
     * @param _gasLimit Gas limit that staker is ready to pay.
     * @param _nonce Nonce of the staker address. It can be obtained from
     *               Gateway.getNonce() method.
     *
     * @return stakeRequestHash_ Hash unique for each stake request.
     */
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
        returns (bytes32 stakeRequestHash_)
    {
        require(
            _stakeVT > uint256(0),
            "Stake amount is zero."
        );
        require(
            _mintBT == brandedToken.convertToBrandedTokens(_stakeVT),
            "_mintBT should match converted _stakeVT."
        );
        require(
            _gateway != address(0),
            "Gateway address is zero."
        );
        require(
            _beneficiary != address(0),
            "Beneficiary address is zero."
        );
        require(
            valueToken.transferFrom(msg.sender, address(this), _stakeVT),
            "ValueToken transferFrom returned false."
        );

        valueToken.approve(address(brandedToken), _stakeVT);

        stakeRequestHash_ = brandedToken.requestStake(_stakeVT, _mintBT);

        stakeRequests[stakeRequestHash_] = StakeRequest({
            stakeVT: _stakeVT,
            gateway: _gateway,
            beneficiary: _beneficiary,
            gasPrice: _gasPrice,
            gasLimit: _gasLimit,
            nonce: _nonce
        });
    }

    /**
     * @notice Approves Gateway for the minted BTs, calls Gateway.stake after
     *         BrandedToken.acceptStakeRequest execution is successful.
     *
     * @dev Function requires:
     *          - stake request hash is valid
     *          - BrandedToken.acceptStakeRequest execution is successful
     *
     *      As per requirement bounty token currency is same as valueToken.
     *      Bounty flow:
     *          - facilitator approves GatewayComposer for base tokens as bounty
     *          - GatewayComposer approves Gateway for the bounty
     *
     * @param _stakeRequestHash Unique hash for each stake request.
     * @param _r R of the signature.
     * @param _s S of the signature.
     * @param _v V of the signature.
     * @param _hashLock Hash lock provided by the facilitator.
     *
     * @return messageHash_ Message hash unique for each stake request.
     */
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
            stakeRequest.stakeVT > uint256(0),
            "Stake request not found."
        );

        uint256 bounty = GatewayInterface(stakeRequest.gateway).bounty();
        valueToken.transferFrom(msg.sender, address(this), bounty);
        valueToken.approve(stakeRequest.gateway, bounty);

        require(
            brandedToken.acceptStakeRequest(
                _stakeRequestHash,
                _r,
                _s,
                _v
            ),
            "BrandedToken acceptStakeRequest returned false."
        );

        uint256 mintBT = brandedToken.convertToBrandedTokens(
            stakeRequest.stakeVT
        );

        brandedToken.approve(stakeRequest.gateway, mintBT);

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

    /**
     * @notice Revokes stake request by calling BrandedToken.revokeStakeRequest() and
     *         deleting information.
     *
     * @dev Function requires:
     *          - stake request hash is valid
     *          - BrandedToken.revokeStakeRequest() should return true
     *          - ValueToken.transfer() should return true
     *
     *      The method is called after calling requestStake. In this flow
     *      locked ValueToken is transferred to owner. Transfer is done for
     *      convenience. This way extra step of calling transferToken is
     *      avoided.
     *
     * @param _stakeRequestHash Stake request hash.
     *
     * @return success_ True on successful execution.
     */
    function revokeStakeRequest(
        bytes32 _stakeRequestHash
    )
        external
        onlyOwner
        returns (bool success_)
    {
        StakeRequest storage stakeRequest = stakeRequests[_stakeRequestHash];
        require(
            stakeRequest.stakeVT > uint256(0),
            "Stake request not found."
        );
        require(
            brandedToken.revokeStakeRequest(_stakeRequestHash),
            "BrandedToken revokeStakeRequest returned false."
        );
        require(
            valueToken.transfer(owner, stakeRequest.stakeVT),
            "ValueToken transfer returned false."
        );

        delete stakeRequests[_stakeRequestHash];

        success_ = true;
    }

    /**
     * @notice Transfers EIP20 token to destination address.
     *
     * @dev Function requires:
     *          - msg.sender should be owner
     *          - EIP20 token address should not be zero
     *          - token.transfer() execution should be successful
     *
     * @param _token EIP20 token address.
     * @param _to Address to which tokens are transferred.
     * @param _value Amount of tokens to be transferred.
     *
     * @return success_ True on successful execution.
     */
    function transferToken(
        EIP20Interface _token,
        address _to,
        uint256 _value
    )
        external
        onlyOwner
        returns (bool success_)
    {
        require(
            address(_token) != address(0),
            "EIP20 token address is zero."
        );
        require(
            _token.transfer(_to, _value),
            "EIP20Token transfer returned false."
        );

        success_ = true;
    }

    /**
     * @notice Approves EIP20 token to spender address.
     *
     * @dev Function requires:
     *          - msg.sender should be owner
     *          - EIP20 token address should not be zero
     *          - token.approve() execution should be successful
     *
     * @param _token EIP20 token address.
     * @param _spender Address authorized to spend from the function caller's
     *                 address.
     * @param _value Amount up to which spender is authorized to spend.
     *
     * @return success_ True on successful execution.
     */
    function approveToken(
        EIP20Interface _token,
        address _spender,
        uint256 _value
    )
        external
        onlyOwner
        returns (bool success_)
    {
        require(
            address(_token) != address(0),
            "EIP20 token address is zero."
        );
        require(
            _token.approve(_spender, _value),
            "EIP20token approve returned false."
        );

        success_ = true;
    }

    /**
     * @notice Remove storage & code from blockchain.
     *
     * @dev Function requires:
     *          - ValueToken balance should be 0
     *          - BrandedToken balance should be 0
     *          - There should not be any in progress stake requests
     *
     *      BrandedToken contract has mapping stakeRequestHashes which stores
     *      staker vs stakeRequestHash data. In progress stake requests are
     *      validated by doing lookup into the stakeRequestHashes mapping.
     */
    function destroy()
        external
        onlyOwner
    {
        require(
            valueToken.balanceOf(address(this)) == 0,
            "ValueToken balance should be 0."
        );
        require(
            brandedToken.balanceOf(address(this)) == 0,
            "BrandedToken balance should be 0."
        );
        require(
            brandedToken.stakeRequestHashes(address(this)) == bytes32(0),
            "In progress stake requests are present."
        );

        selfdestruct(msg.sender);
    }

}
