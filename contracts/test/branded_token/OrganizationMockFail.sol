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


/**
 *  @title Mock Organization Fail.
 *
 *  @notice Mocks Organization functions as failing.
 */
contract OrganizationMockFail {

    /* External Functions */

    /**
     * @notice Mocks failing isOrganization.
     *
     * @return bool False.
     */
    function isOrganization(address)
        external
        pure
        returns (bool)
    {
        return false;
    }

    /**
     * @notice Mocks failing isWorker.
     *
     * @return bool False.
     */
    function isWorker(address)
        external
        pure
        returns (bool)
    {
        return false;
    }
}