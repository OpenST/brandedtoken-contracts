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
 * @title Branded Token.
 *
 * @notice Branded tokens are minted by staking specified value tokens.
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
        bytes32 indexed _stakeRequestHash,
        address _staker,
        uint256 _stake
    );

    event StakeRequestRevoked(
        bytes32 indexed _stakeRequestHash,
        address _staker,
        uint256 _stake
    );

    event Redeemed(
        address _redeemer,
        uint256 _valueTokens
    );

    event StakeRequestRejected(
        bytes32 indexed _stakeRequestHash,
        address _staker,
        uint256 _stake
    );

    event SymbolSet(string _symbol);

    event NameSet(string _name);


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

    /** Global nonce for stake requests. */
    uint256 public nonce;

    /** Flag indicating whether restrictions have been lifted for all actors. */
    bool public allRestrictionsLifted;

    /** Domain separator encoding per EIP 712. */
    bytes32 private constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(address verifyingContract)"
    );

    /** StakeRequest struct type encoding per EIP 712. */
    bytes32 private constant BT_STAKE_REQUEST_TYPEHASH = keccak256(
        "StakeRequest(address staker,uint256 stake,uint256 nonce)"
    );

    /** Domain separator per EIP 712. */
    bytes32 private DOMAIN_SEPARATOR = keccak256(
        abi.encode(
            EIP712_DOMAIN_TYPEHASH,
            address(this)
        )
    );

    /** Maps staker to stakeRequestHashes. */
    mapping(address => bytes32) public stakeRequestHashes;

    /** Maps stakeRequestHash to StakeRequests. */
    mapping(bytes32 => StakeRequest) public stakeRequests;

    /** Maps actor to restriction status. */
    mapping(address => bool) private unrestricted;


    /* Modifiers */

    modifier onlyUnrestricted {
        require(
            allRestrictionsLifted || unrestricted[msg.sender],
            "Msg.sender is restricted."
        );
        _;
    }


    /* Constructor */

    /**
     * @dev Conversion parameters provide the conversion rate and its scale.
     *      For example, if 1 value token is equivalent to 3.5 branded
     *      tokens (1:3.5), _conversionRate == 35 and
     *      _conversionRateDecimals == 1.
     *
     *      Constructor requires:
     *          - valueToken address is not zero
     *          - conversionRate is not zero
     *          - conversionRateDecimals is not greater than 5
     *
     * @param _valueToken The value to which valueToken is set.
     * @param _symbol The value to which tokenSymbol, defined in EIP20Token,
     *                is set.
     * @param _name The value to which tokenName, defined in EIP20Token,
     *              is set.
     * @param _decimals The value to which tokenDecimals, defined in EIP20Token,
     *                  is set.
     * @param _conversionRate The value to which conversionRate is set.
     * @param _conversionRateDecimals The value to which
     *                                conversionRateDecimals is set.
     * @param _organization The value to which organization, defined in Organized,
     *                      is set.
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
        require(
            _conversionRateDecimals <= 5,
            "ConversionRateDecimals is greater than 5."
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
     * @dev It is expected that this contract will have a sufficientallowance
     *      to transfer value tokens from the staker at the time this function
     *      is executed.
     *
     *      Function requires:
     *          - _mint is equivalent to _stake
     *          - msg.sender does not have a stake request hash
     *          - valueToken.transferFrom returns true
     *
     * @param _stake Amount of value tokens to stake.
     * @param _mint Amount of branded tokens to mint.
     *
     * @return stakeRequestHash_ Hash of stake request information calculated per
     *                           EIP 712.
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

        StakeRequest memory stakeRequest = StakeRequest({
            staker: msg.sender,
            stake: _stake,
            nonce: nonce
        });
        // Calculates hash per EIP 712
        stakeRequestHash_ = hash(stakeRequest);
        stakeRequestHashes[msg.sender] = stakeRequestHash_;
        stakeRequests[stakeRequestHash_] = stakeRequest;

        nonce += 1;

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
     *          - stake request exists
     *          - signature is from a worker
     *
     * @param _stakeRequestHash Stake request hash.
     * @param _r R of the signature.
     * @param _s S of the signature.
     * @param _v V of the signature.
     *
     * @return success_ True.
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

        StakeRequest storage stakeRequest = stakeRequests[_stakeRequestHash];

        require(
            verifySigner(stakeRequest, _r, _s, _v),
            "Signer is not a worker."
        );

        emit StakeRequestAccepted(
            _stakeRequestHash,
            stakeRequest.staker,
            stakeRequest.stake
        );

        uint256 mint = convertToBrandedTokens(stakeRequest.stake);
        balances[stakeRequest.staker] = balances[stakeRequest.staker]
            .add(mint);
        totalTokenSupply = totalTokenSupply.add(mint);

        // Mint branded tokens
        emit Transfer(address(0), stakeRequest.staker, mint);

        delete stakeRequestHashes[stakeRequest.staker];
        delete stakeRequests[_stakeRequestHash];

        return true;
    }

    /**
     * @notice Maps addresses in _restrictionLifted to true in unrestricted.
     *
     * @dev Function requires:
     *          - msg.sender is a worker
     *
     * @param _restrictionLifted Addresses for which to lift restrictions.
     *
     * @return success_ True.
     */
    function liftRestriction(
        address[] calldata _restrictionLifted
    )
        external
        onlyWorker
        returns (bool success_)
    {
        for (uint256 i = 0; i < _restrictionLifted.length; i++) {
            unrestricted[_restrictionLifted[i]] = true;
        }

        return true;
    }

    /**
     * @notice Indicates whether an actor is unrestricted.
     *
     * @param _actor Actor.
     *
     * @return isUnrestricted_ Whether unrestricted.
     */
    function isUnrestricted(address _actor)
        external
        view
        returns (bool isUnrestricted_)
    {
        return unrestricted[_actor];
    }

    /**
     * @notice Lifts restrictions from all actors.
     *
     * @dev Function requires:
     *          - msg.sender is organization
     *
     * @return success_ True.
     */
    function liftAllRestrictions()
        external
        onlyOrganization
        returns (bool success_)
    {
        allRestrictionsLifted = true;

        return true;
    }

    /**
     * @notice Revokes stake request by deleting its information and
     *         transferring staked value tokens back to staker.
     *
     * @dev Function requires:
     *          - msg.sender is staker
     *          - valueToken.transfer returns true
     *
     * @param _stakeRequestHash Stake request hash.
     *
     * @return success_ True.
     */
    function revokeStakeRequest(
        bytes32 _stakeRequestHash
    )
        external
        returns (bool success_)
    {
        require(
            stakeRequests[_stakeRequestHash].staker == msg.sender,
            "Msg.sender is not staker."
        );

        uint256 stake = stakeRequests[_stakeRequestHash].stake;

        delete stakeRequestHashes[msg.sender];
        delete stakeRequests[_stakeRequestHash];

        emit StakeRequestRevoked(
            _stakeRequestHash,
            msg.sender,
            stake
        );

        require(
            valueToken.transfer(msg.sender, stake),
            "ValueToken.transfer returned false."
        );

        return true;
    }

    /**
     * @notice Reduces msg.sender's balance and the total supply by
     *         _brandedTokens and transfers an equivalent amount of
     *         value tokens to msg.sender.
     *
     * @dev Redemption may risk loss of branded tokens.
     *      It is possible to redeem branded tokens for 0 value tokens.
     *
     *      Function requires:
     *          - valueToken.transfer returns true
     *
     * @param _brandedTokens Amount of branded tokens to redeem.
     *
     * @return success_ True.
     */
    function redeem(
        uint256 _brandedTokens
    )
        external
        returns (bool success_)
    {
        balances[msg.sender] = balances[msg.sender].sub(_brandedTokens);
        totalTokenSupply = totalTokenSupply.sub(_brandedTokens);
        uint256 valueTokens = convertToValueTokens(_brandedTokens);

        emit Redeemed(msg.sender, valueTokens);

        // Burn redeemed branded tokens
        emit Transfer(msg.sender, address(0), _brandedTokens);

        require(
            valueToken.transfer(msg.sender, valueTokens),
            "ValueToken.transfer returned false."
        );

        return true;
    }

    /**
     * @notice Rejects stake request by deleting its information and
     *         transferring staked value tokens back to staker.
     *
     * @dev Function requires:
     *          - msg.sender is a worker
     *          - stake request exists
     *          - valueToken.transfer returns true
     *
     * @param _stakeRequestHash Stake request hash.
     *
     * @return success_ True.
     */
    function rejectStakeRequest(
        bytes32 _stakeRequestHash
    )
        external
        onlyWorker
        returns (bool success_)
    {
        require(
            stakeRequests[_stakeRequestHash].staker != address(0),
            "Stake request not found."
        );

        StakeRequest memory stakeRequest = stakeRequests[_stakeRequestHash];

        delete stakeRequestHashes[stakeRequest.staker];
        delete stakeRequests[_stakeRequestHash];

        emit StakeRequestRejected(
            _stakeRequestHash,
            stakeRequest.staker,
            stakeRequest.stake
        );

        require(
            valueToken.transfer(stakeRequest.staker, stakeRequest.stake),
            "ValueToken.transfer returned false."
        );

        return true;
    }

    /**
     * @notice Sets symbol.
     *
     * @dev Function requires:
     *          - msg.sender is a worker
     *
     * @param _symbol The value to which symbol is set.
     *
     * @return success_ True.
     */
    function setSymbol(
        string calldata _symbol
    )
        external
        onlyWorker
        returns (bool success_)
    {
        tokenSymbol = _symbol;

        emit SymbolSet(tokenSymbol);

        return true;
    }

    /**
     * @notice Sets name.
     *
     * @dev Function requires:
     *          - msg.sender is a worker
     *
     * @param _name The value to which name is set.
     *
     * @return success_ True.
     */
    function setName(
        string calldata _name
    )
        external
        onlyWorker
        returns (bool success_)
    {
        tokenName = _name;

        emit NameSet(tokenName);

        return true;
    }


    /* Public Functions */

    /**
     * @notice Overrides EIP20Token.transfer by additionally
     *         requiring msg.sender to be unrestricted.
     *
     * @param _to Address to which tokens are transferred.
     * @param _value Amount of tokens to be transferred.
     *
     * @return success_ Result from EIP20Token transfer.
     */
    function transfer(
        address _to,
        uint256 _value
    )
        public
        onlyUnrestricted
        returns (bool success_)
    {
        return super.transfer(_to, _value);
    }

    /**
     * @notice Overrides EIP20Token.transferFrom by additionally
     *         requiring msg.sender to be unrestricted.
     *
     * @param _from Address from which tokens are transferred.
     * @param _to Address to which tokens are transferred.
     * @param _value Amount of tokens transferred.
     *
     * @return success_ Result from EIP20Token transferFrom.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        onlyUnrestricted
        returns (bool success_)
    {
        return super.transferFrom(_from, _to, _value);
    }

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
            _valueTokens
            .mul(conversionRate)
            .div(10 ** uint256(conversionRateDecimals))
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
            _brandedTokens
            .mul(10 ** uint256(conversionRateDecimals))
            .div(conversionRate)
        );
    }


    /* Private Functions */

    /**
     * @notice Calculates stakeRequestHash according to EIP 712.
     *
     * @param _stakeRequest StakeRequest instance to hash.
     *
     * @return bytes32 EIP 712 hash of _stakeRequest.
     */
    function hash(
        StakeRequest memory _stakeRequest
    )
        private
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                BT_STAKE_REQUEST_TYPEHASH,
                _stakeRequest.staker,
                _stakeRequest.stake,
                _stakeRequest.nonce
            )
        );
    }

    /**
     * @notice Verifies whether signer of stakeRequestHash is a worker.
     *
     * @dev Signing the stakeRequestHash consistent with eth_signTypedData,
     *      as specified by EIP 712, requires signing a hash of encoded data
     *      comprising:
     *          - an initial byte
     *          - the version byte for structured data
     *          - the domain separator
     *          - the stakeRequestHash
     *
     *      See: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
     *
     * @param _stakeRequest Stake request.
     * @param _r R of the signature.
     * @param _s S of the signature.
     * @param _v V of the signature.
     *
     * @return bool True if signer is a worker, false if not.
     */
    function verifySigner(
        StakeRequest storage _stakeRequest,
        bytes32 _r,
        bytes32 _s,
        uint8 _v
    )
        private
        view
        returns (bool)
    {
        // See: https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.sol
        bytes32 typedData = keccak256(
            abi.encodePacked(
                byte(0x19), // the initial 0x19 byte
                byte(0x01), // the version byte for structured data
                DOMAIN_SEPARATOR,
                hash(_stakeRequest)
            )
        );

        return organization.isWorker(ecrecover(typedData, _v, _r, _s));
    }
}