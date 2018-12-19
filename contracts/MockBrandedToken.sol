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
import "./Organized.sol";


/**
 * @title Branded Token.
 *
 * @notice Supports staking value tokens for minting utility branded tokens
 *         where the conversion rate from value token to utility branded token
 *         is not 1:1. This contract does not require a non-1:1 conversion rate,
 *         but it is expected that if the conversion rate is 1:1, value tokens
 *         will be staked directly through a Gateway.
 */
// TODO DOMAIN_SEPARATOR TYPEHASH+BT_STAKE_REQUEST_TYPEHASH EIP712 handling
// TODO Restriction logic
// TODO revokeStakeRequest, redeem
contract MockBrandedToken is EIP20TokenRequiredInterface, Organized {

    /* Usings */

    using SafeMath for uint256;


    /* Events */

    event StakeRequested(
        address _staker,
        uint256 _stake,
        uint256 _nonce,
        bytes32 _stakeRequestHash
    );

    event StakeRequestAccepted(address _staker, uint256 _stake);

    bytes32 public constant DOMAIN_SEPARATOR_TYPEHASH = keccak256(
        abi.encode(
            "EIP712Domain(address brandedTokenContract)"
        )
    );

    bytes32 public constant BT_STAKE_REQUEST_TYPEHASH = keccak256(
        abi.encode(
            "StakeRequest(address staker,uint256 stake,uint256 nonce)"
        )
    );


    /* Struct */

    struct StakeRequest {
        address staker;
        uint256 stake; // value backed in OST
        uint256 nonce;
    }


    /* Storage */

    /** Total token supply. */
    uint256 private supply;

    EIP20TokenRequiredInterface public valueToken;

    /**
     * The nonce is to ensure that the stakeRequestHash is always unique.
     * It would include the address of the BrandedToken in the domainseparator
     * already to differentiate on similar requests for different BT's.
     * Without a nonce, the same staker for the same stake amount, in
     * the same BT would have the same stakeRequestHash;
     */
    uint256 public nonce;

    /** Conversion rate from value tokens to utility/value branded tokens. */
    uint256 public conversionRate;

    /** Number of digits to the right of the decimal point in conversionRate. */
    uint8 public conversionRateDecimals;

    /** Maps stakeRequestHash to StakeRequest struct. */
    mapping(bytes32 => StakeRequest) public stakeRequests;

    /** Maps owner address to amount of value branded tokens held. */
    mapping(address => uint256) private balances;

    /**
     * Maps owner address to spender address to amount of spendable
     * value branded tokens.
     */
    mapping(address => mapping (address => uint256)) private allowed;


    /* Special Functions */

    /**
     * @dev Conversion parameters provide the conversion rate and its scale.
     *      For example, if 1 value valueToken is equivalent to 3.5 utility/value branded
     *      tokens (1:3.5), _conversionRate == 35 and _conversionRateDecimals == 1.
     *
     *      Constructor requires:
     *          - valueToken address is not null;
     *          - conversionRate is not zero.
     *
     * @param _valueToken Amount of value tokens to stake.
     * @param _conversionRate The value to which conversionRate is set.
     * @param _conversionRateDecimals The value to which conversionRateDecimals
     *                                is set.
     * @param _organization Organization contract address.
     */
    constructor(
        EIP20TokenRequiredInterface _valueToken,
        uint256 _conversionRate,
        uint8 _conversionRateDecimals,
        OrganizationInterface _organization
    )
        Organized(_organization)
        public
    {
        require(
            address(_valueToken) != address(0),
            "ValueToken is null."
        );

        require(
            _conversionRate != 0,
            "ConversionRate is zero."
        );

        valueToken = _valueToken;
        conversionRate = _conversionRate;
        conversionRateDecimals = _conversionRateDecimals;
    }


    /* External Functions */

    /**
     * @notice Transfers value tokens from msg.sender to itself,
     *         stores the amount of value branded tokens to mint if request
     *         is accepted, and emits information required to
     *         stake value branded tokens to mint utility branded tokens.
     *
     * @dev see above for nonce documentation.
     *
     *      Function requires:
     *          - _valueTokens is not zero;
     *          - Minted tokens equals staked amount after conversion.
     *
     * @param _stake Amount of value tokens to stake.
     * @param _mint Amount of value branded tokens to mint.
     *
     * @return stakeRequestHash_ unique hash for each stake request.
     */
    function requestStake(
        uint256 _stake,
        uint256 _mint
    )
        external
        returns (bytes32 stakeRequestHash_)
    {
        require(_stake != 0, "Staked tokens is zero.");

        require(
            _mint == convert(_stake),
            "Minted BTs is not equivalent to stakeTokens."
        );

        valueToken.transferFrom(msg.sender, address(this), _stake);

        address staker = msg.sender;
        nonce = nonce.add(1);
        stakeRequestHash_ = keccak256(
            abi.encodePacked(
                BT_STAKE_REQUEST_TYPEHASH,
                staker,
                _stake,
                nonce
            )
        );

        stakeRequests[stakeRequestHash_] = StakeRequest({
            staker: staker,
            stake: _stake,
            nonce: nonce
        });

        emit StakeRequested(msg.sender, _stake, nonce, stakeRequestHash_);
    }

    /**
     * @notice Mints value branded tokens for _staker, increases the supply,
     *         sets allowance for gateway to transfer the amount of minted
     *         value branded tokens from _staker, and deletes stake request.
     *
     * @dev Function requires:
     *          - _stakeRequestHash is valid.
     *          - worker is whitelisted organization worker.
     *
     * @param _stakeRequestHash Unique stake request hash.
     * @param _v V of the signature.
     * @param _r R of the signature.
     * @param _s S of the signature.
     *
     * @return success_ Returns true if execution is successful.
     */
    function acceptStakeRequest(
        bytes32 _stakeRequestHash,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        external
        returns (bool success_)
    {
        StakeRequest storage stakeRequest =  stakeRequests[_stakeRequestHash];
        require(
            stakeRequest.staker != address(0),
            "Invalid stake request hash."
        );

        address worker = ecrecover(_stakeRequestHash, _v, _r, _s);
        require(
            organization.isWorker(worker),
            "Worker is not whitelisted."
        );

        delete stakeRequests[_stakeRequestHash];

        emit StakeRequestAccepted(stakeRequest.staker, stakeRequest.stake);

        uint256 brandedTokens = convert(stakeRequest.stake);
        balances[stakeRequest.staker] = balances[stakeRequest.staker].
            add(brandedTokens);
        supply = supply.add(brandedTokens);

        emit Transfer(address(0), stakeRequest.staker, stakeRequest.stake);

        success_ = true;
    }

    /**
     * @notice Returns the supply.
     *
     * @return uint256 Total token supply.
     */
    function totalSupply()
        external
        view
        returns (uint256)
    {
        return supply;
    }

    /**
     * @notice Returns the balance of _owner.
     *
     * @param _owner Owner of tokens.
     *
     * @return uint256 Balance of _owner.
     */
    function balanceOf(
        address _owner
    )
        external
        view
        returns (uint256)
    {
        return balances[_owner];
    }

    /**
     * @notice Returns the amount _spender is allowed to transfer from _owner.
     *
     * @param _owner Owner of tokens.
     * @param _spender Spender with allowance.
     *
     * @return uint256 Allowance of _spender.
     */
    function allowance(
        address _owner,
        address _spender
    )
        external
        view
        returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    /**
     * @notice Transfers _amount to _to.
     *
     * @dev Function requires:
     *          - msg.sender has a balance at least equal to _amount.
     *
     * @param _to To address.
     * @param _amount Amount to transfer.
     *
     * @return bool Success.
     */
    function transfer(
        address _to,
        uint256 _amount
    )
        external
        returns (bool success)
    {
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        balances[_to] = balances[_to].add(_amount);

        emit Transfer(msg.sender, _to, _amount);

        return true;
    }

    /**
     * @notice Transfers _amount from _from to _to.
     *
     * @dev The intention is to limit tradeability whilst enabling transfers
     *      that support the token economy. Thus, the account executing the transfer
     *      is restricted and not the account from which tokens are transferred.
     *
     *      Function requires:
     *          - _from has a balance at least equal to _amount;
     *          - msg.sender has an allowance at least equal to _amount.
     *
     * @param _from From address.
     * @param _to To address.
     * @param _amount Amount to transfer.
     *
     * @return bool Success.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        external
        returns (bool success)
    {
        balances[_from] = balances[_from].sub(_amount);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);
        balances[_to] = balances[_to].add(_amount);

        emit Transfer(_from, _to, _amount);

        return true;
    }

    /**
     * @notice Sets an _amount _spender is approved
     *         to transfer.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function approve(address, uint256) external returns (bool) {
        // TODO
    }


    /* Public Functions */

    /**
     * @notice Returns the amount of branded tokens equivalent to a
     *         given amount of value tokens.
     *
     * @dev Please note there may be a loss of up to 1 indivisible unit of
     *      this token (i.e., assuming 1 value token is equivalent
     *      to 5.99 value branded tokens, convert(1) --> 5, not 5.99).
     *
     * @param _valueTokens Amount to convert.
     *
     * @return uint256 Converted amount.
     */
    function convert(
        uint256 _valueTokens
    )
        public
        view
        returns (uint256)
    {
        return (_valueTokens.mul(conversionRate)).div(10 ** uint256(conversionRateDecimals));
    }

}