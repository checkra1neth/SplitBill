// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BillMetadataRegistry
/// @notice Lightweight registry to store bill metadata snapshots onchain
contract BillMetadataRegistry {
    struct Entry {
        address owner;
        uint256 updatedAt;
        string metadata;
    }

    mapping(bytes32 => Entry) private entries;

    event BillPublished(bytes32 indexed billId, address indexed owner, uint256 updatedAt);

    /// @notice Publish or update bill metadata snapshot
    /// @dev First caller becomes the owner; subsequent updates require same owner
    /// @param billId Hashed bill identifier (bytes32)
    /// @param metadata Encoded metadata payload (e.g., compressed JSON)
    function publishBill(bytes32 billId, string calldata metadata) external {
        require(bytes(metadata).length > 0, "Metadata required");

        Entry storage entry = entries[billId];
        if (entry.owner == address(0)) {
            entry.owner = msg.sender;
        } else {
            require(entry.owner == msg.sender, "Not bill owner");
        }

        entry.metadata = metadata;
        entry.updatedAt = block.timestamp;

        emit BillPublished(billId, entry.owner, entry.updatedAt);
    }

    /// @notice Retrieve stored bill metadata
    /// @param billId Hashed bill identifier (bytes32)
    /// @return metadata Encoded metadata payload
    /// @return owner Address permitted to update metadata
    /// @return updatedAt Timestamp of last update
    function getBill(bytes32 billId)
        external
        view
        returns (string memory metadata, address owner, uint256 updatedAt)
    {
        Entry storage entry = entries[billId];
        return (entry.metadata, entry.owner, entry.updatedAt);
    }
}
