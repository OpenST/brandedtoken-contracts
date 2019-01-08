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


import "./EIP20Token.sol";
import "./Organized.sol";
import "./SafeMath.sol";


/**
 *  @title Branded Token.
 *
 * @notice Supports staking value tokens for minting branded tokens
 *         where the conversion rate from value token to branded token
 *         is not 1:1. This contract does not require a non-1:1 conversion rate,
 *         but it is expected that if the conversion rate is 1:1, value tokens
 *         will be staked directly through a Gateway.
 */
contract BrandedToken is Organized, EIP20Token {

    /* Usings */

    using SafeMath for uint256;


    /* Events */

    event StakeRequested(
        bytes32 indexed _stakeRequestHash,
        address _staker,
        uint256 _stake,
        uint256 _nonce
    );

    event StakeRequestAccepted(
        address _staker,
        uint256 _stake
    );


    /* Structs */

    struct StakeRequest {
        address staker;
        uint256 stake;
        uint256 nonce;
    }


    /* Storage */

    /** Address for value tokens staked to mint branded tokens. */
    EIP20Interface public valueToken;

    /** Conversion rate from value tokens to branded tokens. */
    uint256 public conversionRate;

    /** Number of digits to the right of the decimal point in conversionRate. */
    uint8 public conversionRateDecimals;

    /** Global count of stake requests. */
    uint256 public nonce;

    /** Maps staker to stakeRequestHashes. */
    mapping(address => bytes32) public stakeRequestHashes;

    /** Maps stakeRequestHash to StakeRequests. */
    mapping(bytes32 => StakeRequest) public stakeRequests;


    /* Constructor */

    /**
     * @dev Conversion parameters provide the conversion rate and its scale.
     *      For example, if 1 value token is equivalent to 3.5 branded
     *      tokens (1:3.5), _conversionRate == 35 and _conversionRateDecimals == 1.
     *
     *      Constructor requires:
     *          - valueToken address is not zero;
     *          - conversionRate is not zero;
     *
     * @param _valueToken The value to which valueToken is set.
     * @param _symbol The value to which tokenSymbol, defined in EIP20Token, is set.
     * @param _name The value to which tokenName, defined in EIP20Token, is set.
     * @param _decimals The value to which tokenDecimals, defined in EIP20Token, is set.
     * @param _conversionRate The value to which conversionRate is set.
     * @param _conversionRateDecimals The value to which conversionRateDecimals
     *                                is set.
     * @param _organization The value to which organization, defined in Organized, is set.
     */
    constructor(
        EIP20Interface _valueToken,
        string memory _symbol,
        string memory _name,
        uint8 _decimals,
        uint256 _conversionRate,
        uint8 _conversionRateDecimals,
        OrganizationInterface _organization
    )
        EIP20Token(_symbol, _name, _decimals)
        Organized(_organization)
        public
    {
        require(
            address(_valueToken) != address(0),
            "ValueToken is zero."
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
     *         stores the amount of branded tokens to mint if request
     *         is accepted, and emits stake request information.
     *
     * @dev It is expected that this contract will have a sufficient allowance to
     *      transfer value tokens from the staker at the time this function
     *      is executed.
     *
     *      Function requires:
     *          - _mint is equivalent to _stake;
     *          - msg.sender does not have a stake request hash;
     *          - valueToken.transferFrom returns true.
     *
     * @param _stake Amount of value tokens to stake.
     * @param _mint Amount of branded tokens to mint.
     *
     * @return stakeRequestHash_ Hash of stake request information calculated per EIP 712.
     */
    function requestStake(
        uint256 _stake,
        uint256 _mint
    )
        external
        returns (bytes32 stakeRequestHash_)
    {
        require(
            _mint == convertToBrandedTokens(_stake),
            "Mint is not equivalent to stake."
        );
        require(
            stakeRequestHashes[msg.sender] == "",
            "Staker has a stake request hash."
        );

        // TODO: confirm alignment with nonce updating in Gateway
        nonce += 1;

        // TODO: update to calculate stakeRequestHash_ per EIP 712
        stakeRequestHash_ = keccak256(
            abi.encodePacked(
                "stakeRequestHash_",
                nonce
            )
        );
        stakeRequestHashes[msg.sender] = stakeRequestHash_;

        stakeRequests[stakeRequestHash_] = StakeRequest({
            staker: msg.sender,
            stake: _stake,
            nonce: nonce
        });

        StakeRequest memory stakeRequest = stakeRequests[stakeRequestHash_];

        emit StakeRequested(
            stakeRequestHash_,
            stakeRequest.staker,
            stakeRequest.stake,
            stakeRequest.nonce
        );

        require(
            valueToken.transferFrom(msg.sender, address(this), _stake),
            "ValueToken.transferFrom returned false."
        );
    }

    /**
     * @notice Mints and transfers branded tokens to a staker,
     *         increases the total token supply, and
     *         emits stake request acceptance and transfer information.
     *
     * @dev The function has no access controls, but will only accept
     *      the signature of a worker, as defined in Organization.
     *
     *      Function requires:
     *          - stake request exists;
     *          - signature is from a worker.
     *
     * @param _stakeRequestHash Stake request hash.
     * @param _r R of the signature.
     * @param _s S of the signature.
     * @param _v V of the signature.
     *
     * @return success_ Success.
     */
    function acceptStakeRequest(
        bytes32 _stakeRequestHash,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    )
        external
        returns (bool success_)
    {
        require(
            stakeRequests[_stakeRequestHash].staker != address(0),
            "Stake request not found."
        );
        require(
            organization.isWorker(ecrecover(_stakeRequestHash, _v, _r, _s)),
            "Signer is not a worker."
        );

        StakeRequest memory stakeRequest = stakeRequests[_stakeRequestHash];

        delete stakeRequestHashes[stakeRequest.staker];
        delete stakeRequests[_stakeRequestHash];

        emit StakeRequestAccepted(
            stakeRequest.staker,
            stakeRequest.stake
        );

        uint256 mint = convertToBrandedTokens(stakeRequest.stake);
        balances[stakeRequest.staker] = balances[stakeRequest.staker]
            .add(mint);
        totalTokenSupply = totalTokenSupply.add(mint);

        emit Transfer(address(0), stakeRequest.staker, mint);

        return true;
    }


    /* Public Functions */

    /**
     * @notice Returns the amount of branded tokens equivalent to a
     *         given amount of value tokens.
     *
     * @dev Please note there may be a loss of up to 1 indivisible unit of
     *      this token (i.e., assuming 1 value token is equivalent
     *      to 3.5 branded tokens, convert(1) --> 3, not 3.5).
     *
     * @param _valueTokens Amount to convert.
     *
     * @return uint256 Converted amount.
     */
    function convertToBrandedTokens(
        uint256 _valueTokens
    )
        public
        view
        returns (uint256)
    {
        return (
            _valueTokens.mul(conversionRate)).div(10 ** uint256(conversionRateDecimals)
        );
    }

    /**
     * @notice Returns the amount of value tokens equivalent to a
     *         given amount of branded tokens.
     *
     * @dev Please note there may be a loss of up to 1 indivisible unit of
     *      this token.
     *
     * @param _brandedTokens Amount to convert.
     *
     * @return uint256 Converted amount.
     */
    function convertToValueTokens(
        uint256 _brandedTokens
    )
        public
        view
        returns (uint256)
    {
        return (
            _brandedTokens.mul(10 ** uint256(conversionRateDecimals))
        ).div(conversionRate);
    }
}