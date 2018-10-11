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
//
// Based on the 'final' EIP20 token standard as specified at:
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md


/**
 *  @title Mock EIP20 Token Pass.
 *
 *  @notice Mocks EIP20 token functions as passing.
 */
contract EIP20TokenMockPass {

    /* External Functions */

    /**
     * @notice Mocks passing transfer from.
     *
     * @return bool True.
     */
    function transferFrom(
        address,
        address,
        uint256
    )
        external
        pure
        returns (bool)
    {
        return true;
    }
}