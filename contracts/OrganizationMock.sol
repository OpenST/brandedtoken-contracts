pragma solidity ^0.4.23;

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


import "./OrganizationIsWorkerInterface.sol";

/**
 *  @title OrganizationMock.
 *
 *  @notice Provides mocking for Organization contract to set worker
 *          and verify worker.
 */
contract OrganizationMock is OrganizationIsWorkerInterface{

    address worker;

    function setWorker(address _worker) public{
        worker = _worker;
    }

    function isWorker(address _worker) public returns(bool){
        return(worker == _worker);
    }

}
