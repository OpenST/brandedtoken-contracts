pragma solidity ^0.4.0;
import "./CoGatewayUtilityTokenInterface.sol";
import "./UtilityTokenInterface.sol";

contract CoGatewayMock is CoGatewayUtilityTokenInterface{

    /** Address of utilityToken */
    address public utilityToken;

    constructor(address _utilityToken) public{

        utilityToken = _utilityToken;

    }

    /**
     * @notice Get the utility token address.
     *
     * @return address of utility token.
     */
    function utilityToken() external returns (address)
    {
        return utilityToken;
    }

}
