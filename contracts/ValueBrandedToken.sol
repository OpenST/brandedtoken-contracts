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


import "./SafeMath.sol";
import "./EIP20TokenRequiredInterface.sol";


/**
 * @title Value Branded Token.
 *
 * @notice Supports staking value tokens for minting utility branded tokens
 *         where the conversion rate from value token to utility branded token
 *         is not 1:1.
 */
contract ValueBrandedToken is EIP20TokenRequiredInterface {

    /* Usings */

    using SafeMath for uint256;


    /* Events */

    event StakeRequested(
        uint256 _valueTokens,
        uint256 _valueBrandedTokens,
        address _beneficiary,
        address _staker,
        uint256 _gasPrice,
        uint256 _gasLimit,
        uint256 _nonce,
        bytes _signature
    );

    event StakeRequestAccepted(/*...*/);

    event StakeRequestRejected(/*...*/);


    /* Storage */

    EIP20TokenRequiredInterface public valueToken;

    mapping(address /* staker */ => uint256 /* value tokens */) public stakeRequests;

    /* Constructor */

    /**
     * @dev Constructor requires:
     *          - valueToken address is not null.
     *
     * @param _valueToken Address for tokens staked to mint utility branded tokens.
     */
    constructor(
        EIP20TokenRequiredInterface _valueToken
        // TODO: conversion-rate-related parameters
    )
        public
    {
        require(
            _valueToken != address(0),
            "ValueToken is null."
        );

        valueToken = _valueToken;
    }


    /* External Functions */

    /**
     * @notice Transfers value tokens from msg.sender to itself,
     *         stores the amount of value branded tokens to mint if request is accepted,
     *         and emits information required to stake value branded tokens
     *         to mint utility branded tokens.
     *
     * @dev Function requires:
     *          - _valueTokens is not zero;
     *          - _beneficiary is not null;
     *          - _signature is not empty;
     *          - msg.sender does not have a stake request;
     *          - valueToken.transferFrom returns true.
     *
     * @param _valueTokens Amount of value tokens to stake.
     * @param _valueBrandedTokens Amount of value branded tokens to mint.
     * @param _beneficiary Beneficiary for minted utility branded tokens.
     * @param _gasPrice Gas price that msg.sender (staker) is ready to pay to complete
     *                  the stake and mint process.
     * @param _gasLimit Gas limit that staker is ready to pay to complete
     *                  the stake and mint process.
     * @param _nonce Nonce of staker address.
     * @param _signature Signature signed by staker.
     */
    function requestStake(
        uint256 _valueTokens,
        uint256 _valueBrandedTokens,
        address _beneficiary,
        uint256 _gasPrice,
        uint256 _gasLimit,
        uint256 _nonce,
        bytes _signature
    )
        external
    {
        require(
            _valueTokens != 0,
            "ValueTokens is zero."
        );
        require(
            _beneficiary != address(0),
            "Beneficiary is null."
        );
        require(
            _signature.length != 0,
            "Signature is empty."
        );
        require(
            stakeRequests[msg.sender] == 0,
            "Staker has a stake request."
        );

        stakeRequests[msg.sender] = _valueTokens;

        emit StakeRequested(
            _valueTokens,
            _valueBrandedTokens,
            _beneficiary,
            msg.sender,
            _gasPrice,
            _gasLimit,
            _nonce,
            _signature
        );

        require(
            valueToken.transferFrom(msg.sender, address(this), _valueTokens),
            "ValueToken.transferFrom returned false."
        );
    }

    /**
     * @notice Mints value branded tokens, approves gateway to transfer
     *         the amount of minted value branded tokens from the staker, and
     *         deletes stake request.
     *
     * @dev It is expected that this contract will have a sufficient allowance to
     *      transfer value tokens from the staker at the time this function is executed.
     *
     *      Function requires:
     *          - TBD.
     */
    function acceptStakeRequest(
    )
        external
        // TODO: returns
    {
        /*...*/
    }

    /**
     * @notice Transfers value tokens to staker and deletes stake request.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function rejectStakeRequest(
    )
        external
        // TODO: returns
    {
        /*...*/
    }

    /**
     * @notice Transfers an amount of value tokens corresponding to the amount of redeemed value branded tokens to msg.sender.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function redeem(
    )
        external
        // TODO: returns
    {
        /*...*/
    }

    /**
     * @notice Returns the total supply of value branded tokens.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function totalSupply() external view returns (uint256) {
        // TODO
    }

    /**
     * @notice Returns the value branded tokens balance of _owner.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function balanceOf(address) external view returns (uint256) {
        // TODO
    }

    /**
     * @notice Returns the amount of value branded tokens _spender is approved
     *         to transfer from _owner.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function allowance(address, address) external view returns (uint256) {
        // TODO
    }

    /**
     * @notice Transfers _amount of value branded tokens to _to.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function transfer(address, uint256) public returns (bool) {
        // TODO
    }

    /**
     * @notice Transfers _amount of value branded tokens from _from to _to.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function transferFrom(address, address, uint256) public returns (bool) {
        // TODO
    }

    /**
     * @notice Sets an _amount of value branded tokens _spender is approved
     *         to _transfer.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function approve(address, uint256) public returns (bool) {
        // TODO
    }
}
