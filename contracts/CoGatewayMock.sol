pragma solidity ^0.4.0;
import "./CoGatewayUtilityTokenInterface.sol";
import "./UtilityTokenInterface.sol";

contract CoGatewayMock is CoGatewayUtilityTokenInterface{

    /** Added of the coGateway*/
    address public coGateway;

    constructor(address _coGateway){

        coGateway = _coGateway;

    }

    /**
     * @notice Get the utility token address.
     *
     * @return address of utility token.
     */
    function utilityToken() external returns (address)
    {
        return coGateway;
    }

}
