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
 *  @title Organization Mock Worker.
 *
 *  @notice Mocks Organization setWorker and isWorker functions.
 */
contract OrganizationMockWorker {

    address public worker;

    /* External Functions */

    /**
     * @notice Mocks setWorker.
     *
     * @param _worker The value to which worker is set.
     */
    function setWorker(
        address _worker,
        uint256
    )
        external
    {
        worker = _worker;
    }

    /**
     * @notice Mocks isWorker.
     *
     * @return bool True if worker == _worker, false if not.
     */
    function isWorker(
        address _worker
    )
        external
        view
        returns (bool)
    {
        return worker == _worker;
    }
}