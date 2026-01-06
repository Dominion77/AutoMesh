pragma solidity ^0.8.20;

error MachineAlreadyRegistered();
error MachineNotRegistered();
error NotMachineOwner();
error InvalidDID();

contract MachineRegistry {
    struct Machine {
        string did;
        address owner;
        string metadataHash;
        bool active;
        uint256 createdAt;
    }

    mapping(bytes32 => Machine) private machines;
    mapping(address => bytes32[]) private ownerMachines;

    event MachineRegistered(
        string did,
        address indexed owner,
        string metadataHash
    );

    event MachineStatusUpdated(
        string did,
        bool active
    );

    event MachineMetadataUpdated(
        string did,
        string metadataHash
    );


    function _didHash(string memory did) internal pure returns (bytes32) {
        if (bytes(did).length == 0) revert InvalidDID();
        return keccak256(abi.encodePacked(did));
    }


    /**
     * @notice Register a new machine
     * @param did peaq DID of the machine
     * @param metadataHash IPFS hash of machine metadata
     */
    function registerMachine(
        string calldata did,
        string calldata metadataHash
    ) external {
        bytes32 didKey = _didHash(did);

        if (machines[didKey].owner != address(0)) {
            revert MachineAlreadyRegistered();
        }

        machines[didKey] = Machine({
            did: did,
            owner: msg.sender,
            metadataHash: metadataHash,
            active: true,
            createdAt: block.timestamp
        });

        ownerMachines[msg.sender].push(didKey);

        emit MachineRegistered(did, msg.sender, metadataHash);
    }

    /**
     * @notice Enable or disable a machine
     */
    function setMachineStatus(
        string calldata did,
        bool active
    ) external {
        bytes32 didKey = _didHash(did);
        Machine storage machine = machines[didKey];

        if (machine.owner == address(0)) revert MachineNotRegistered();
        if (machine.owner != msg.sender) revert NotMachineOwner();

        machine.active = active;

        emit MachineStatusUpdated(did, active);
    }

    /**
     * @notice Update machine metadata
     */
    function updateMachineMetadata(
        string calldata did,
        string calldata newMetadataHash
    ) external {
        bytes32 didKey = _didHash(did);
        Machine storage machine = machines[didKey];

        if (machine.owner == address(0)) revert MachineNotRegistered();
        if (machine.owner != msg.sender) revert NotMachineOwner();

        machine.metadataHash = newMetadataHash;

        emit MachineMetadataUpdated(did, newMetadataHash);
    }

    function getMachine(
        string calldata did
    ) external view returns (Machine memory) {
        bytes32 didKey = _didHash(did);
        Machine memory machine = machines[didKey];

        if (machine.owner == address(0)) revert MachineNotRegistered();
        return machine;
    }

    function isMachineActive(
        string calldata did
    ) external view returns (bool) {
        bytes32 didKey = _didHash(did);
        return machines[didKey].active;
    }

    function getMachinesByOwner(
        address owner
    ) external view returns (bytes32[] memory) {
        return ownerMachines[owner];
    }
}
