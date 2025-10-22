// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title SplitBillEscrowUpgradeable
 * @dev Upgradeable escrow contract using UUPS pattern
 * @notice This contract can be upgraded while preserving all bill data
 */
contract SplitBillEscrowUpgradeable is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    struct Bill {
        address creator;
        address beneficiary;
        uint256 totalAmount;
        uint256 participantCount;
        uint256 paidCount;
        bool settled;
        bool cancelled;
        uint256 createdAt;
        uint256 deadline;
        mapping(address => uint256) shares;
        mapping(address => bool) hasPaid;
        mapping(address => uint256) paidAmounts;
    }

    mapping(bytes32 => Bill) public bills;
    
    uint256 public constant DEFAULT_DEADLINE = 7 days;
    
    // Version tracking
    uint256 public version;
    
    event BillCreated(bytes32 indexed billId, address indexed creator, address indexed beneficiary, uint256 totalAmount, uint256 deadline);
    event PaymentReceived(bytes32 indexed billId, address indexed participant, uint256 amount);
    event BillSettled(bytes32 indexed billId, uint256 totalAmount);
    event BillCancelled(bytes32 indexed billId);
    event RefundIssued(bytes32 indexed billId, address indexed participant, uint256 amount);
    event PartialSettlement(bytes32 indexed billId, uint256 settledAmount, uint256 participantsPaid);
    event ContractUpgraded(uint256 indexed newVersion);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract (replaces constructor)
     */
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        version = 1;
    }

    /**
     * @dev Required by UUPS - only owner can upgrade
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        version++;
        emit ContractUpgraded(version);
    }

    /**
     * @dev Create a new bill with participant shares
     */
    function createBill(
        bytes32 billId,
        address beneficiary,
        address[] calldata participants,
        uint256[] calldata shares
    ) external {
        require(participants.length == shares.length, "Length mismatch");
        require(participants.length > 0, "No participants");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(bills[billId].creator == address(0), "Bill exists");

        Bill storage bill = bills[billId];
        bill.creator = msg.sender;
        bill.beneficiary = beneficiary;
        bill.participantCount = participants.length;
        bill.createdAt = block.timestamp;
        bill.deadline = block.timestamp + DEFAULT_DEADLINE;

        uint256 total = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            require(participants[i] != address(0), "Invalid address");
            require(shares[i] > 0, "Invalid share");
            
            bill.shares[participants[i]] = shares[i];
            total += shares[i];
        }

        bill.totalAmount = total;

        emit BillCreated(billId, msg.sender, beneficiary, total, bill.deadline);
    }
    
    /**
     * @dev Create a bill with custom deadline
     */
    function createBillWithDeadline(
        bytes32 billId,
        address beneficiary,
        address[] calldata participants,
        uint256[] calldata shares,
        uint256 customDeadline
    ) external {
        require(customDeadline > block.timestamp, "Deadline must be in future");
        require(customDeadline <= block.timestamp + 30 days, "Deadline too far");
        
        this.createBill(billId, beneficiary, participants, shares);
        bills[billId].deadline = customDeadline;
    }

    /**
     * @dev Pay your share of the bill
     */
    function payShare(bytes32 billId) external payable {
        Bill storage bill = bills[billId];
        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Bill already settled");
        require(!bill.cancelled, "Bill cancelled");
        require(!bill.hasPaid[msg.sender], "Already paid");
        require(bill.shares[msg.sender] > 0, "Not a participant");
        require(msg.value == bill.shares[msg.sender], "Incorrect amount");

        bill.hasPaid[msg.sender] = true;
        bill.paidAmounts[msg.sender] = msg.value;
        bill.paidCount++;

        emit PaymentReceived(billId, msg.sender, msg.value);

        if (bill.paidCount == bill.participantCount) {
            _settleBill(billId);
        }
    }

    /**
     * @dev Internal function to settle bill
     */
    function _settleBill(bytes32 billId) internal {
        Bill storage bill = bills[billId];
        require(!bill.settled, "Already settled");
        require(!bill.cancelled, "Bill cancelled");

        bill.settled = true;

        uint256 amountToTransfer = bill.totalAmount;
        if (amountToTransfer > address(this).balance) {
            amountToTransfer = address(this).balance;
        }
        
        if (amountToTransfer > 0) {
            (bool success, ) = bill.beneficiary.call{value: amountToTransfer}("");
            require(success, "Transfer failed");
        }

        emit BillSettled(billId, amountToTransfer);
    }
    
    /**
     * @dev Cancel bill and refund all participants
     */
    function cancelAndRefund(bytes32 billId) external {
        Bill storage bill = bills[billId];
        require(bill.creator != address(0), "Bill not found");
        require(msg.sender == bill.creator, "Only creator can cancel");
        require(!bill.settled, "Already settled");
        require(!bill.cancelled, "Already cancelled");
        
        bill.cancelled = true;
        emit BillCancelled(billId);
        _refundAll(billId);
    }
    
    /**
     * @dev Auto-refund if deadline passed
     */
    function autoRefundIfExpired(bytes32 billId) external {
        Bill storage bill = bills[billId];
        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Already settled");
        require(!bill.cancelled, "Already cancelled");
        require(block.timestamp >= bill.deadline, "Deadline not reached");
        require(bill.paidCount < bill.participantCount, "All paid, use settle");
        
        bill.cancelled = true;
        emit BillCancelled(billId);
        _refundAll(billId);
    }
    
    /**
     * @dev Partial settlement
     */
    function partialSettle(bytes32 billId) external {
        Bill storage bill = bills[billId];
        require(bill.creator != address(0), "Bill not found");
        require(msg.sender == bill.creator, "Only creator can partial settle");
        require(!bill.settled, "Already settled");
        require(!bill.cancelled, "Bill cancelled");
        require(bill.paidCount > 0, "No payments received");
        require(bill.paidCount < bill.participantCount, "All paid, use full settle");
        
        bill.settled = true;
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to settle");
        
        if (balance > 0) {
            (bool success, ) = bill.beneficiary.call{value: balance}("");
            require(success, "Transfer failed");
        }
        
        emit PartialSettlement(billId, balance, bill.paidCount);
    }
    
    /**
     * @dev Internal refund placeholder
     */
    function _refundAll(bytes32 billId) internal pure {
        require(billId != bytes32(0), "Invalid bill ID");
    }
    
    /**
     * @dev Refund a specific participant
     */
    function refundParticipant(bytes32 billId, address participant) external {
        Bill storage bill = bills[billId];
        require(bill.cancelled, "Bill not cancelled");
        require(bill.hasPaid[participant], "Participant hasn't paid");
        
        uint256 refundAmount = bill.paidAmounts[participant];
        require(refundAmount > 0, "No amount to refund");
        
        bill.paidAmounts[participant] = 0;
        
        (bool success, ) = participant.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(billId, participant, refundAmount);
    }

    // View functions
    function getBillInfo(bytes32 billId) external view returns (
        address creator,
        address beneficiary,
        uint256 totalAmount,
        uint256 participantCount,
        uint256 paidCount,
        bool settled,
        bool cancelled,
        uint256 deadline
    ) {
        Bill storage bill = bills[billId];
        return (
            bill.creator,
            bill.beneficiary,
            bill.totalAmount,
            bill.participantCount,
            bill.paidCount,
            bill.settled,
            bill.cancelled,
            bill.deadline
        );
    }
    
    function isExpired(bytes32 billId) external view returns (bool) {
        Bill storage bill = bills[billId];
        return block.timestamp >= bill.deadline && 
               bill.paidCount < bill.participantCount &&
               !bill.settled &&
               !bill.cancelled;
    }
    
    function getTimeRemaining(bytes32 billId) external view returns (uint256) {
        Bill storage bill = bills[billId];
        if (block.timestamp >= bill.deadline) {
            return 0;
        }
        return bill.deadline - block.timestamp;
    }

    function hasPaid(bytes32 billId, address participant) external view returns (bool) {
        return bills[billId].hasPaid[participant];
    }

    function getShare(bytes32 billId, address participant) external view returns (uint256) {
        return bills[billId].shares[participant];
    }
    
    function getPaidAmount(bytes32 billId, address participant) external view returns (uint256) {
        return bills[billId].paidAmounts[participant];
    }
    
    function canRefund(bytes32 billId, address participant) external view returns (bool) {
        Bill storage bill = bills[billId];
        return bill.cancelled && bill.paidAmounts[participant] > 0;
    }
    
    function getBeneficiary(bytes32 billId) external view returns (address) {
        return bills[billId].beneficiary;
    }
}
