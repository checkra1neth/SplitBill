// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title BillMetadataRegistryUpgradeable
 * @dev Upgradeable metadata registry using UUPS pattern
 */
contract BillMetadataRegistryUpgradeable is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    struct BillMetadata {
        string ipfsHash;
        address owner;
        uint256 createdAt;
        uint256 updatedAt;
        bool isPrivate;
        uint8 rating;
        uint16 ratingCount;
    }

    struct UserStats {
        uint256 totalBills;
        uint256 totalAmount;
        uint256 lastActivity;
    }

    mapping(bytes32 => BillMetadata) public bills;
    mapping(bytes32 => string[]) public billTags;
    mapping(address => bytes32[]) public userBills;
    mapping(bytes32 => mapping(address => bool)) public canAccess;
    mapping(bytes32 => mapping(address => uint8)) public userRatings;
    mapping(string => bytes32[]) public billsByTag;
    mapping(address => UserStats) public userStats;
    
    uint256 public totalBills;
    uint256 public totalVolume;
    
    // Version tracking
    uint256 public version;
    
    event BillPublished(bytes32 indexed billId, address indexed owner, string ipfsHash, bool isPrivate, uint256 timestamp);
    event BillUpdated(bytes32 indexed billId, string newIpfsHash, uint256 timestamp);
    event AccessGranted(bytes32 indexed billId, address indexed user, address indexed grantedBy);
    event AccessRevoked(bytes32 indexed billId, address indexed user, address indexed revokedBy);
    event BillRated(bytes32 indexed billId, address indexed rater, uint8 rating);
    event TagAdded(bytes32 indexed billId, string tag);
    event ContractUpgraded(uint256 indexed newVersion);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        version = 1;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        version++;
        emit ContractUpgraded(version);
    }

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
        
        billTags[billId] = tags;
        userBills[msg.sender].push(billId);
        canAccess[billId][msg.sender] = true;
        
        for (uint256 i = 0; i < tags.length; i++) {
            billsByTag[tags[i]].push(billId);
            emit TagAdded(billId, tags[i]);
        }
        
        userStats[msg.sender].totalBills++;
        userStats[msg.sender].totalAmount += amount;
        userStats[msg.sender].lastActivity = block.timestamp;
        totalBills++;
        totalVolume += amount;

        emit BillPublished(billId, msg.sender, ipfsHash, isPrivate, block.timestamp);
    }

    function updateBill(bytes32 billId, string calldata newIpfsHash) external {
        require(bills[billId].owner == msg.sender, "Not bill owner");
        require(bytes(newIpfsHash).length > 0, "IPFS hash required");

        bills[billId].ipfsHash = newIpfsHash;
        bills[billId].updatedAt = block.timestamp;
        userStats[msg.sender].lastActivity = block.timestamp;

        emit BillUpdated(billId, newIpfsHash, block.timestamp);
    }

    function grantAccess(bytes32 billId, address user) external {
        require(bills[billId].owner == msg.sender, "Not bill owner");
        require(bills[billId].isPrivate, "Bill is not private");
        require(user != address(0), "Invalid user address");

        canAccess[billId][user] = true;
        emit AccessGranted(billId, user, msg.sender);
    }

    function revokeAccess(bytes32 billId, address user) external {
        require(bills[billId].owner == msg.sender, "Not bill owner");
        require(user != msg.sender, "Cannot revoke own access");

        canAccess[billId][user] = false;
        emit AccessRevoked(billId, user, msg.sender);
    }

    function rateBill(bytes32 billId, uint8 rating) external {
        require(bills[billId].owner != address(0), "Bill not found");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        require(hasAccess(billId, msg.sender), "No access to bill");
        
        BillMetadata storage bill = bills[billId];
        uint8 oldRating = userRatings[billId][msg.sender];
        
        if (oldRating == 0) {
            bill.ratingCount++;
            bill.rating = uint8(
                (uint256(bill.rating) * (bill.ratingCount - 1) + rating * 10) / bill.ratingCount
            );
        } else {
            bill.rating = uint8(
                (uint256(bill.rating) * bill.ratingCount - oldRating * 10 + rating * 10) / bill.ratingCount
            );
        }
        
        userRatings[billId][msg.sender] = rating;
        emit BillRated(billId, msg.sender, rating);
    }

    function hasAccess(bytes32 billId, address user) public view returns (bool) {
        BillMetadata storage bill = bills[billId];
        if (bill.owner == address(0)) return false;
        if (!bill.isPrivate) return true;
        return canAccess[billId][user];
    }

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

    function getUserBills(address user) external view returns (bytes32[] memory) {
        return userBills[user];
    }

    function getBillsByTag(string calldata tag) external view returns (bytes32[] memory) {
        return billsByTag[tag];
    }

    function getUserStats(address user) external view returns (
        uint256 billsCount,
        uint256 amountTotal,
        uint256 lastActivityTime
    ) {
        UserStats storage stats = userStats[user];
        return (stats.totalBills, stats.totalAmount, stats.lastActivity);
    }

    function getGlobalStats() external view returns (uint256 billsCount, uint256 volumeTotal) {
        return (totalBills, totalVolume);
    }

    function getBillRating(bytes32 billId) external view returns (uint8 averageRating, uint16 ratingCount) {
        BillMetadata storage bill = bills[billId];
        return (bill.rating, bill.ratingCount);
    }

    function getUserRating(bytes32 billId, address user) external view returns (uint8) {
        return userRatings[billId][user];
    }

    function billExists(bytes32 billId) external view returns (bool) {
        return bills[billId].owner != address(0);
    }

    function getBillOwner(bytes32 billId) external view returns (address) {
        return bills[billId].owner;
    }
}
