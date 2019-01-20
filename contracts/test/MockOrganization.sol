pragma solidity ^0.5.0;

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


/**
 *  @title MockOrganization contract.
 *
 *  @notice Provides mocking for Organization contract to set
 *          and verify worker.
 */
contract MockOrganization {

    /* Storage */

    /**
     *  Map of whitelisted worker addresses.
     */
    mapping(address => bool) public workers;

    /** Organization address */
    address public organization;

    /** Admin address */
    address public admin;

    /* Special functions */

    constructor(
        address _organization,
        address _admin,
        address[] memory _workers
    )
        public
    {
        organization = _organization;
        admin = _admin;
        for(uint256 i = 0; i < _workers.length; i++) {
            workers[_workers[i]] = true;
        }

    }


    /* Public functions */

    /**
     * @notice Sets worker.
     *
     * @param _worker Worker address to be added.
     */
    function setWorker(address _worker) public {
        workers[_worker] = true;
    }

    /**
     * @notice Sets worker.
     *
     * @param _organization Worker address to be added.
     */
    function setOrganization(address _organization) public {
        organization = _organization;
    }


    /* External functions */

    /**
     * @notice Checks if the worker is valid or invalid.
     *
     * @param _worker Worker address to check if whitelisted.
     *
     * @return True if the worker is already added.
     */
    function isWorker(address _worker) external view returns (bool) {
        return workers[_worker];
    }

    /**
     * @notice Checks if the organization is valid or invalid.
     *
     * @param _organization Organization address.
     *
     * @return True if the worker is already added.
     */
    function isOrganization(
        address _organization
    )
        external
        view
        returns (bool isOrganization_)
    {
        isOrganization_ = _organization == organization || _organization == admin;
    }

}
