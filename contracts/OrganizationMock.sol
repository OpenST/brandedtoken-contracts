pragma solidity ^0.4.23;

import "./OrganizationIsWorkerInterface.sol";
import "./OrganizationInterface.sol";
import "./SafeMath.sol";

contract OrganizationMock is OrganizationInterface, OrganizationIsWorkerInterface {

    /* Usings */

    using SafeMath for uint256;


    /* Storage */

    /** Address for which private key will be owned by organization. */
    address public owner;

    /** Proposed Owner is address proposed by owner for ownership transfer. */
    address public proposedOwner;

    /** Admin address set by owner to facilitate operations of an economy. */
    address public admin;

    /**
     *  List of whitelisted workers active upto the expiration height.
     */
    mapping(address => uint256 /* expiration height */) public workers;


    /* Modifiers */

    modifier onlyOwner()
    {
        require(
            msg.sender == owner,
            "Only owner is allowed to call."
        );
        _;
    }

    modifier onlyOwnerOrAdmin()
    {
        require(
            (msg.sender == owner) || (msg.sender == admin),
            "Only owner/admin is allowed to call."
        );
        _;
    }


    /* Special Functions */

    constructor() public
    {
        owner = msg.sender;
    }


    /* External Functions */

    /**
     * @notice Initiates ownership transfer to proposed owner.
     *
     * @dev Requires:
     *          - msg.sender should be owner.
     *      Allows resetting of owner to 0x address.
     *
     * @param _proposedOwner Proposed owner address.
     *
     * @return True on successful execution.
     */
    function initiateOwnershipTransfer(address _proposedOwner)
        external
        onlyOwner
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Complete ownership transfer to proposed owner.
     *
     * @dev Requires:
     *          - msg.sender should be proposed owner.
     *
     * @return True on successful execution.
     */
    function completeOwnershipTransfer() external returns (bool)
    {
        return true;
    }

    /**
     * @notice Sets admin address.
     *
     * @dev Requires:
     *          - msg.sender should be owner or admin.
     *          - admin should not be same as owner.
     *      Allows resetting of admin address to 0x.
     *
     * @param _admin Admin address to be added.
     *
     * @return True on successful execution.
     */
    function setAdmin(address _admin) external onlyOwnerOrAdmin returns (bool)
    {
        return true;
    }

    /**
     * @notice Sets worker and its expiration height.
     *
     * @dev Requires:
     *          - Caller should be owner or admin.
     *          - worker address can't be null.
     *          - expiration height should be greater or equal to current
     *            block number.
     *      Admin/Owner has the flexibility to extend/reduce worker expiration
     *      height. This way a worker activation/deactivation can be
     *      controlled without adding/removing new worker keys.
     *
     * @param _worker Worker address to be added.
     * @param _expirationHeight Expiration height of worker.
     *
     * @return Remaining height for which worker is active.
     */
    function setWorker(
        address _worker,
        uint256 _expirationHeight
    )
        external
        onlyOwnerOrAdmin
        returns (uint256 remainingHeight_)
    {
        require(
            _worker != address(0),
            "Worker address is null."
        );

        require(
            _expirationHeight >= block.number,
            "Expiration height is less than current block number."
        );

        workers[_worker] = _expirationHeight;
        remainingHeight_ = _expirationHeight.sub(block.number);

        emit WorkerSet(_worker, _expirationHeight, remainingHeight_);

        return remainingHeight_;
    }

    /**
     * @notice Unsets/deactivates a worker.
     *
     * @dev Requires:
     *          - Caller should be owner or admin.
     *
     * @param _worker Worker address to unset/deactivate.
     *
     * @return True if the worker was set/existed else returns false.
     */
    function unsetWorker(address _worker)
        external
        onlyOwnerOrAdmin
        returns (bool wasSet_)
    {
        return true;
    }


    /* Public Functions */

    /**
     * @notice Returns whether the worker is expired.
     *
     * @param _worker Worker address to check.
     *
     * @return True if worker expiration height is more than or equal to
     *         current block number else returns false.
     */
    function isWorker(address _worker) public view returns (bool)
    {
        return (workers[_worker] >= block.number);
    }
}

