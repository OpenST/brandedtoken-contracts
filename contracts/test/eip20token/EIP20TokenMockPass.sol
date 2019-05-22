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


import "../../EIP20TokenMock.sol";


/**
 *  @title Mock EIP20 Token Pass.
 *
 *  @notice Mocks EIP20 token functions as passing.
 */
contract EIP20TokenMockPass is EIP20TokenMock {

    /* Constructor */

    /**
     * @param _symbol The value to which tokenSymbol, defined in EIP20Token,
     *                is set.
     * @param _name The value to which tokenName, defined in EIP20Token,
     *              is set.
     * @param _decimals The value to which tokenDecimals, defined in EIP20Token,
     *                  is set.
     */
    constructor(
        string memory _symbol,
        string memory _name,
        uint8 _decimals
    )
        EIP20TokenMock(_symbol, _name, _decimals)
        public
    { }


    /* External Functions */

    /**
     * @notice Mocks passing transferFrom.
     *
     * @return bool True.
     */
    function transferFrom(
        address,
        address,
        uint256
    )
        public
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Mocks passing transfer.
     *
     * @return bool True.
     */
    function transfer(
        address,
        uint256
    )
        public
        returns (bool)
    {
        return true;
    }
}