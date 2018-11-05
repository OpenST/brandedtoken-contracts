pragma solidity ^0.4.23;

import "./UtilityBrandedToken.sol";
import "./EIP20Interface.sol";
import "./OrganizationIsWorkerInterface.sol";

contract UtilityBrandedTokenMock is UtilityBrandedToken{

    constructor(
        EIP20Interface _token,
        string _symbol,
        string _name,
        uint8 _decimals,
        OrganizationIsWorkerInterface _organization
    )
        public
        UtilityBrandedToken(_token,_symbol, _name, _decimals,_organization)
    {}

    /** @dev Takes _owner, _value; sets balance of _owner to _value.
     *
     *  @notice It sets the balance for an address.
     *
     *  @param _owner owner
     *  @param _value value
     *
     *  @return bool success
     */
    function setBalance(
        address _owner,
        uint256 _value)
        public
        returns (bool /* success */)
    {
        balances[_owner] = _value;
        return true;
    }

    /**
     * @dev It is used in testing mint and burn methods.
     *
     * @notice It sets the coGateway address.
     *
     * @param _coGatewayAddress CoGateway contract address
     */
    function settingCoGateway(address _coGatewayAddress) public{
        coGateway = _coGatewayAddress;
    }
}
