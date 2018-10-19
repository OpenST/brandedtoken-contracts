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
 *         is not 1:1. This contract does not require a non-1:1 conversion rate,
 *         but it is expected that if the conversion rate is 1:1, value tokens
 *         will be staked directly through a Gateway.
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

    event StakeRequestAccepted(
        address _staker,
        uint256 _valueTokens
    );

    event StakeRequestRejected(/*...*/);


    /* Storage */

    EIP20TokenRequiredInterface public valueToken;
    address public gateway;
    uint256 private supply;
    uint256 public conversionRate;
    uint8 public conversionRateDecimals;

    mapping(address /* staker */ => uint256 /* value tokens */) public stakeRequests;
    mapping(address => uint256 /* value branded tokens */) private balances;
    mapping(address => mapping (address => uint256 /* value branded tokens */)) private allowed;

    /* Constructor */

    /**
     * @dev Conversion parameters provide the conversion rate and its scale.
     *      For example, if 1 value token is equivalent to 3.5 utility/value branded
     *      tokens (1:3.5), _conversionRate == 35 and _conversionRateDecimals == 1.
     *
     *      Constructor requires:
     *          - valueToken address is not null;
     *          - conversionRate is not zero.
     *
     * @param _valueToken Address for tokens staked to mint utility branded tokens.
     * @param _conversionRate Conversion rate from value tokens to utility/value
     *        branded tokens.
     * @param _conversionRateDecimals Number of digits to the right of the
     *        decimal point in _conversionRate.
     */
    constructor(
        EIP20TokenRequiredInterface _valueToken,
        uint256 _conversionRate,
        uint8 _conversionRateDecimals
    )
        public
    {
        require(
            _valueToken != address(0),
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
     *         stores the amount of value branded tokens to mint if request is accepted,
     *         and emits information required to stake value branded tokens
     *         to mint utility branded tokens.
     *
     * @dev It is expected that this contract will have a sufficient allowance to
     *      transfer value tokens from the staker at the time this function is executed.
     *      this function is executed.
     *
     *      Function requires:
     *          - _valueTokens is not zero;
     *          - _beneficiary is not null;
     *          - _signature is not empty;
     *          - _valueBrandedTokens is equivalent to _valueTokens;
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
            _valueBrandedTokens == convert(_valueTokens),
            "ValueBrandedTokens is not equivalent to valueTokens."
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
     * @notice Mints value branded tokens for _staker, increases the supply,
     *         sets allowance for gateway to transfer the amount of minted
     *         value branded tokens from _staker, and deletes stake request.
     *
     * @dev Function requires:
     *          - stake request is not 0.
     *
     * @param _staker Staker address.
     */
    function acceptStakeRequest(
        address _staker
    )
        external
    {
        require(
            stakeRequests[_staker] != 0,
            "Stake request is zero."
        );

        uint256 valueTokens = stakeRequests[_staker];
        delete stakeRequests[_staker];

        emit StakeRequestAccepted(_staker, valueTokens);

        uint256 valueBrandedTokens = convert(valueTokens);
        balances[_staker] = balances[_staker].add(valueBrandedTokens);
        supply = supply.add(valueBrandedTokens);

        emit Transfer(address(0), _staker, valueBrandedTokens);

        allowed[_staker][gateway] = valueBrandedTokens;

        emit Approval(_staker, gateway, valueBrandedTokens);
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
     * @notice Reduces msg.sender's balance and the supply by _valueBrandedTokens
     *         and transfers an equivalent amount of value tokens to msg.sender.
     *
     * @dev Redemption presents a risk of loss up to 1 indivisible unit of valueToken. It is possible
     *      to redeem value branded tokens for 0 value tokens--proceed with caution.
     *
     *      Function requires:
     *          - msg.sender has a balance at least equal to _valueBrandedTokens;
     *          - valueToken.transfer returns true.
     *
     * @param _valueBrandedTokens Amount of value branded tokens to redeem.
     *
     * @return valueTokens_ Amount of value tokens transferred to redeemer.
     */
    function redeem(
        uint256 _valueBrandedTokens
    )
        external
        returns (uint256 valueTokens_)
    {
        balances[msg.sender] = balances[msg.sender].sub(_valueBrandedTokens);

        assert(supply >= _valueBrandedTokens);

        supply = supply.sub(_valueBrandedTokens);

        emit Transfer(msg.sender, address(0), _valueBrandedTokens);

        valueTokens_ = (_valueBrandedTokens.mul(10 ** uint256(conversionRateDecimals))).div(conversionRate);

        require(
            valueToken.transfer(msg.sender, valueTokens_),
            "ValueToken.transfer returned false."
        );
    }

    /**
     * @notice Returns the supply.
     *
     * @return uint256 Supply.
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
        public
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
        public
        view
        returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    /**
     * @notice Transfers _amount to _to.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function transfer(address, uint256) public returns (bool) {
        // TODO
    }

    /**
     * @notice Transfers _amount from _from to _to.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function transferFrom(address, address, uint256) public returns (bool) {
        // TODO
    }

    /**
     * @notice Sets an _amount _spender is approved
     *         to transfer.
     *
     * @dev Function requires:
     *          - TBD.
     */
    function approve(address, uint256) public returns (bool) {
        // TODO
    }


    /* Public Functions */

    /**
     * @notice Returns the amount of value branded tokens equivalent to a
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
