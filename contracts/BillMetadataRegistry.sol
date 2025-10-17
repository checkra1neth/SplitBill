// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BillMetadataRegistryV2
 * @dev Enhanced registry for bill metadata with IPFS, search, tags, privacy, and analytics
 * @notice Optimized for gas efficiency using IPFS for large data storage
 */
contract BillMetadataRegistryV2 {
    struct BillMetadata {
        string ipfsHash;        // IPFS hash for full metadata (gas efficient)
        address owner;          // Bill creator
        uint256 createdAt;      // Creation timestamp
        uint256 updatedAt;      // Last update timestamp
        bool isPrivate;         // Privacy flag
        uint8 rating;           // Average rating (0-50, divide by 10 for 0-5 stars)
        uint16 ratingCount;     // Number of ratings
    }

    struct UserStats {
        uint256 totalBills;
        uint256 totalAmount;    // In wei
        uint256 lastActivity;
    }

    // Storage
    mapping(bytes32 => BillMetadata) public bills;
    mapping(bytes32 => string[]) public billTags;  // Separate mapping for tags
    mapping(address => bytes32[]) public userBills;
    mapping(bytes32 => mapping(address => bool)) public canAccess;
    mapping(bytes32 => mapping(address => uint8)) public userRatings;
    mapping(string => bytes32[]) public billsByTag;
    mapping(address => UserStats) public userStats;
    
    // Global stats
    uint256 public totalBills;
    uint256 public totalVolume;
    
    // Events
    event BillPublished(
        bytes32 indexed billId,
        address indexed owner,
        string ipfsHash,
        bool isPrivate,
        uint256 timestamp
    );
    
    event BillUpdated(
        bytes32 indexed billId,
        string newIpfsHash,
        uint256 timestamp
    );
    
    event AccessGranted(
        bytes32 indexed billId,
        address indexed user,
        address indexed grantedBy
    );
    
    event AccessRevoked(
        bytes32 indexed billId,
        address indexed user,
        address indexed revokedBy
    );
    
    event BillRated(
        bytes32 indexed billId,
        address indexed rater,
        uint8 rating
    );
    
    event TagAdded(
        bytes32 indexed billId,
        string tag
    );

    /**
     * @dev Publish a new bill with IPFS hash
     * @param billId Unique identifier for the bill
     * @param ipfsHash IPFS hash containing full bill metadata
     * @param tags Array of tags for categorization
     * @param isPrivate Whether the bill is private (requires access grant)
     * @param amount Total bill amount in wei (for statistics)
     */
    function publishBill(
        bytes32 billId,
        string calldata ipfsHash,
        string[] calldata tags,
        bool isPrivate,
        uint256 amount
    ) external {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bills[billId].owner == address(0), "Bill already exists");
        require(tags.length <= 10, "Too many tags");

        BillMetadata storage bill = bills[billId];
        bill.ipfsHash = ipfsHash;
        bill.owner = msg.sender;
        bill.createdAt = block.timestamp;
        bill.updatedAt = block.timestamp;
        bill.isPrivate = isPrivate;
        
        // Store tags separately
        billTags[billId] = tags;

        // Update user bills
        userBills[msg.sender].push(billId);
        
        // Grant access to owner
        canAccess[billId][msg.sender] = true;
        
        // Add to tag indices
        for (uint256 i = 0; i < tags.length; i++) {
            billsByTag[tags[i]].push(billId);
            emit TagAdded(billId, tags[i]);
        }
        
        // Update statistics
        userStats[msg.sender].totalBills++;
        userStats[msg.sender].totalAmount += amount;
        userStats[msg.sender].lastActivity = block.timestamp;
        totalBills++;
        totalVolume += amount;

        emit BillPublished(billId, msg.sender, ipfsHash, isPrivate, block.timestamp);
    }

    /**
     * @dev Update bill metadata
     * @param billId Bill to update
     * @param newIpfsHash New IPFS hash
     */
    function updateBill(
        bytes32 billId,
        string calldata newIpfsHash
    ) external {
        require(bills[billId].owner == msg.sender, "Not bill owner");
        require(bytes(newIpfsHash).length > 0, "IPFS hash required");

        bills[billId].ipfsHash = newIpfsHash;
        bills[billId].updatedAt = block.timestamp;
        
        userStats[msg.sender].lastActivity = block.timestamp;

        emit BillUpdated(billId, newIpfsHash, block.timestamp);
    }

    /**
     * @dev Grant access to a private bill
     * @param billId Bill to grant access to
     * @param user User to grant access
     */
    function grantAccess(bytes32 billId, address user) external {
        require(bills[billId].owner == msg.sender, "Not bill owner");
        require(bills[billId].isPrivate, "Bill is not private");
        require(user != address(0), "Invalid user address");

        canAccess[billId][user] = true;

        emit AccessGranted(billId, user, msg.sender);
    }

    /**
     * @dev Revoke access to a private bill
     * @param billId Bill to revoke access from
     * @param user User to revoke access
     */
    function revokeAccess(bytes32 billId, address user) external {
        require(bills[billId].owner == msg.sender, "Not bill owner");
        require(user != msg.sender, "Cannot revoke own access");

        canAccess[billId][user] = false;

        emit AccessRevoked(billId, user, msg.sender);
    }

    /**
     * @dev Rate a bill (1-5 stars)
     * @param billId Bill to rate
     * @param rating Rating from 1 to 5
     */
    function rateBill(bytes32 billId, uint8 rating) external {
        require(bills[billId].owner != address(0), "Bill not found");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(hasAccess(billId, msg.sender), "No access to bill");
        
        BillMetadata storage bill = bills[billId];
        uint8 oldRating = userRatings[billId][msg.sender];
        
        if (oldRating == 0) {
            // New rating
            bill.ratingCount++;
            bill.rating = uint8(
                (uint256(bill.rating) * (bill.ratingCount - 1) + rating * 10) / bill.ratingCount
            );
        } else {
            // Update existing rating
            bill.rating = uint8(
                (uint256(bill.rating) * bill.ratingCount - oldRating * 10 + rating * 10) / bill.ratingCount
            );
        }
        
        userRatings[billId][msg.sender] = rating;

        emit BillRated(billId, msg.sender, rating);
    }

    /**
     * @dev Check if user has access to a bill
     * @param billId Bill to check
     * @param user User to check
     */
    function hasAccess(bytes32 billId, address user) public view returns (bool) {
        BillMetadata storage bill = bills[billId];
        if (bill.owner == address(0)) return false;
        if (!bill.isPrivate) return true;
        return canAccess[billId][user];
    }

    /**
     * @dev Get bill metadata (only if user has access)
     * @param billId Bill to query
     */
    function getBill(bytes32 billId) external view returns (
        string memory ipfsHash,
        address owner,
        uint256 createdAt,
        uint256 updatedAt,
        string[] memory tags,
        bool isPrivate,
        uint8 rating,
        uint16 ratingCount
    ) {
        require(hasAccess(billId, msg.sender), "No access to bill");
        
        BillMetadata storage bill = bills[billId];
        return (
            bill.ipfsHash,
            bill.owner,
            bill.createdAt,
            bill.updatedAt,
            billTags[billId],
            bill.isPrivate,
            bill.rating,
            bill.ratingCount
        );
    }

    /**
     * @dev Get all bills for a user
     * @param user User address
     */
    function getUserBills(address user) external view returns (bytes32[] memory) {
        return userBills[user];
    }

    /**
     * @dev Get bills by tag
     * @param tag Tag to search
     */
    function getBillsByTag(string calldata tag) external view returns (bytes32[] memory) {
        return billsByTag[tag];
    }

    /**
     * @dev Get user statistics
     * @param user User address
     */
    function getUserStats(address user) external view returns (
        uint256 billsCount,
        uint256 amountTotal,
        uint256 lastActivityTime
    ) {
        UserStats storage stats = userStats[user];
        return (stats.totalBills, stats.totalAmount, stats.lastActivity);
    }

    /**
     * @dev Get global statistics
     */
    function getGlobalStats() external view returns (
        uint256 billsCount,
        uint256 volumeTotal
    ) {
        return (totalBills, totalVolume);
    }

    /**
     * @dev Get bill rating
     * @param billId Bill to query
     */
    function getBillRating(bytes32 billId) external view returns (
        uint8 averageRating,
        uint16 ratingCount
    ) {
        BillMetadata storage bill = bills[billId];
        return (bill.rating, bill.ratingCount);
    }

    /**
     * @dev Get user's rating for a bill
     * @param billId Bill to query
     * @param user User address
     */
    function getUserRating(bytes32 billId, address user) external view returns (uint8) {
        return userRatings[billId][user];
    }

    /**
     * @dev Check if bill exists
     * @param billId Bill to check
     */
    function billExists(bytes32 billId) external view returns (bool) {
        return bills[billId].owner != address(0);
    }

    /**
     * @dev Get bill owner
     * @param billId Bill to query
     */
    function getBillOwner(bytes32 billId) external view returns (address) {
        return bills[billId].owner;
    }
}
