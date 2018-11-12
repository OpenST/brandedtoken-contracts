pragma solidity ^0.4.23;
import "./CoGatewayUtilityTokenInterface.sol";
import "./UtilityTokenInterface.sol";

/**
 *  @title CoGatewayMock contract.
 *
 *  @notice It contains utility token address.
 */
contract CoGatewayMock is CoGatewayUtilityTokenInterface{


    /* Storage */

    /** Address of utilityToken */
    address public utilityToken;


    /* Special functions */

    constructor(address _utilityToken) public{

        utilityToken = _utilityToken;

    }


    /* External methods */

    /**
     * @notice Get the utility token address.
     *
     * @return address of utility token.
     */
    function utilityToken() external view returns (address)
    {
        return utilityToken;
    }

}
