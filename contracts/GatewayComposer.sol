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

contract GatewayComposer {

    /* Events */

    event StakeRequested(bytes32 _valueTokens);

    /* Struct */

    struct StakeRequest {
        uint256 stakeVT;
        uint256 mintBT;
        address gateway;
        address beneficiary;
        uint256 gasPrice;
        uint256 gasLimit;
        uint256 nonce;
    }


    /* Storage */

    address public owner;

    address public token;

    address public baseToken;

    BrandedTokenInterface public brandedToken;

    /** Maps staker address to amount of value tokens to stake. */
    mapping(bytes32 => StakeRequest) public stakeRequests;


    /* Modifiers */

    /** @dev Checks if msg.sender is the owner of GatewayComposer. */
    modifier onlyOwner() {
        require(
            owner == msg.sender,
            "Only owner can call."
        );
        _;
    }


    /* Special Functions */

    constructor(
        address _owner,
        EIP20Interface _token,
        BrandedTokenInterface _brandedToken
    )
    public
    {
        owner = _owner;
        token = _token;
        brandedToken = _brandedToken;
    }

    /// amount in VT (Value Token, set to OST)
    /// expected amount in VBT
    /// gateway to transfer VBT into
    /// beneficiary address on the metablockchain
    /// gas price for facilitator fee in (U)BT
    /// gas limit for message passing
    /// messagebus nonce for staker
    /// note: don't attempt to compute the nonce in UXC
    function requestStake(
        uint256 _stakeVT,
        uint256 _mintBT,
        address _gateway,
        address _beneficiary,
        uint256 _gasPrice,
        uint256 _gasLimit,
        uint256 _nonce
    )
    onlyOwner
    returns (bytes32 requestStakeHash_)
    {
        require(_mintVBT == BrandedTokenInterface.convert(_stakeVT));

        require(token.transferFrom(msg.sender, this, _stakeVT));
        // Approve BT contract.
        token.approve(brandedToken, _stakeVT);

        require(BrandedTokenInterface(brandedToken).
            requestStake(_stakeVT, _mintBT));

        requestStakeHash_ = hashRequestStakeIntent(
            _stakeVT,
            _mintBT,
            _gateway,
            _beneficiary,
            _gasPrice,
            _gasLimit,
            _nonce
        );

        stakeRequests[requestStakeHash_] = StakeRequest({
            stakeVT: stakeVT,
            mintBT: _mintBT,
            gateway: _gateway,
            beneficiary: _beneficiary,
            gasPrice: _gasPrice,
            gasLimit: _gasLimit,
            nonce: _nonce
            });
    }

    /**
     * @dev Called by registered worker.
     */
    // TODO bounty logic
    function acceptStakeRequest(
        bytes32 _stakeRequestHash,
        uint8 _v,
        bytes32 _r,
        bytes32 _s,
        bytes32 _hashLock
    )
    returns (bytes32 messageHash_)
    {
        StakeRequest sr = StakeRequests[_stakeRequestHash];
        require(VBT.acceptStakeRequest(_stakeRequestHash, _ORG_SIGN1));
        VBT.approve(sr.gateway, sr.mintVBT);
        require(GatewayI(sr.gateway).stake(
                sr.mintVBT,
                sr.beneficiary,
                sr.gasPrice,
                sr.gasLimit,
                sr.nonce,
                _hashLock
            ));
    }

    function hashRequestStakeIntent(
        uint256 _stakeVT,
        uint256 _mintBT,
        address _gateway,
        uint256 _beneficiary,
        uint256 _gasPrice,
        uint256 _gasLimit,
        uint256 _nonce
    )
    private
    view
    returns(bytes32)
    {
        return keccak256(
            abi.encodePacked(
                _stakeVT,
                _mintBT,
                _gateway,
                _beneficiary,
                _gasPrice,
                _gasLimit,
                _nonce
            )
        );
    }

}