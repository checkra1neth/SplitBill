// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SplitBillEscrow
 * @dev Escrow contract for SplitBill - holds funds until all participants pay
 * @notice Enhanced with refund, timeout, and partial settlement features
 */
contract SplitBillEscrow {
    struct Bill {
        address creator;
        address beneficiary; // Who receives the funds (can be different from creator)
        uint256 totalAmount;
        uint256 participantCount;
        uint256 paidCount;
        bool settled;
        bool cancelled;
        uint256 createdAt;
        uint256 deadline; // Timestamp for auto-refund
        mapping(address => uint256) shares;
        mapping(address => bool) hasPaid;
        mapping(address => uint256) paidAmounts; // Track actual paid amounts for refunds
    }

    mapping(bytes32 => Bill) public bills;
    
    // Default deadline: 7 days
    uint256 public constant DEFAULT_DEADLINE = 7 days;
    
    event BillCreated(bytes32 indexed billId, address indexed creator, address indexed beneficiary, uint256 totalAmount, uint256 deadline);
    event PaymentReceived(bytes32 indexed billId, address indexed participant, uint256 amount);
    event BillSettled(bytes32 indexed billId, uint256 totalAmount);
    event BillCancelled(bytes32 indexed billId);
    event RefundIssued(bytes32 indexed billId, address indexed participant, uint256 amount);
    event PartialSettlement(bytes32 indexed billId, uint256 settledAmount, uint256 participantsPaid);

    /**
     * @dev Create a new bill with participant shares
     * @param billId Unique identifier for the bill
     * @param beneficiary Address that will receive the funds (e.g., restaurant, or one of participants)
     * @param participants Array of participant addresses
     * @param shares Array of amounts each participant owes
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
     * @param billId Unique identifier for the bill
     * @param beneficiary Address that will receive the funds
     * @param participants Array of participant addresses
     * @param shares Array of amounts each participant owes
     * @param customDeadline Custom deadline timestamp
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
        
        // Create bill normally
        this.createBill(billId, beneficiary, participants, shares);
        
        // Override deadline
        bills[billId].deadline = customDeadline;
    }

    /**
     * @dev Pay your share of the bill
     * @param billId The bill to pay for
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

        // If everyone paid, settle the bill
        if (bill.paidCount == bill.participantCount) {
            _settleBill(billId);
        }
    }

    /**
     * @dev Internal function to settle bill and transfer to beneficiary
     * @param billId The bill to settle
     * @notice Beneficiary receives all collected funds, even if they are a participant
     */
    function _settleBill(bytes32 billId) internal {
        Bill storage bill = bills[billId];
        require(!bill.settled, "Already settled");
        require(!bill.cancelled, "Bill cancelled");

        bill.settled = true;

        // Beneficiary always receives the full amount collected
        uint256 amountToTransfer = bill.totalAmount;
        
        // Ensure we don't try to transfer more than available
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
     * @dev Cancel bill and refund all participants (creator only)
     * @param billId The bill to cancel
     */
    function cancelAndRefund(bytes32 billId) external {
        Bill storage bill = bills[billId];
        require(bill.creator != address(0), "Bill not found");
        require(msg.sender == bill.creator, "Only creator can cancel");
        require(!bill.settled, "Already settled");
        require(!bill.cancelled, "Already cancelled");
        
        bill.cancelled = true;
        
        emit BillCancelled(billId);
        
        // Refund all participants who paid
        _refundAll(billId);
    }
    
    /**
     * @dev Auto-refund if deadline passed and not all paid
     * @param billId The bill to check and refund
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
        
        // Refund all participants who paid
        _refundAll(billId);
    }
    
    /**
     * @dev Partial settlement - settle with only those who paid (creator only)
     * @param billId The bill to partially settle
     * @notice Beneficiary receives all collected funds, even if they paid
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
        
        // Beneficiary receives all collected funds
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to settle");
        
        if (balance > 0) {
            (bool success, ) = bill.beneficiary.call{value: balance}("");
            require(success, "Transfer failed");
        }
        
        emit PartialSettlement(billId, balance, bill.paidCount);
    }
    
    /**
     * @dev Internal function to refund all participants who paid
     * @param billId The bill to refund
     * @notice This is a placeholder - participants must claim refunds individually
     * using refundParticipant() to avoid gas limit issues with large participant lists
     */
    function _refundAll(bytes32 billId) internal pure {
        // Intentionally empty - participants claim refunds individually
        // This avoids potential gas limit issues and gives participants control
        // over when they receive their refunds
        
        // Emit event to notify that refunds are available
        // (Event already emitted in cancelAndRefund and autoRefundIfExpired)
        
        // Silence unused variable warning
        require(billId != bytes32(0), "Invalid bill ID");
    }
    
    /**
     * @dev Refund a specific participant (after cancellation)
     * @param billId The bill ID
     * @param participant The participant to refund
     */
    function refundParticipant(bytes32 billId, address participant) external {
        Bill storage bill = bills[billId];
        require(bill.cancelled, "Bill not cancelled");
        require(bill.hasPaid[participant], "Participant hasn't paid");
        
        uint256 refundAmount = bill.paidAmounts[participant];
        require(refundAmount > 0, "No amount to refund");
        
        // Mark as refunded by setting to 0
        bill.paidAmounts[participant] = 0;
        
        (bool success, ) = participant.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(billId, participant, refundAmount);
    }

    /**
     * @dev Get bill details
     * @param billId The bill to query
     */
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
    
    /**
     * @dev Check if bill is expired (past deadline and not fully paid)
     * @param billId The bill to check
     */
    function isExpired(bytes32 billId) external view returns (bool) {
        Bill storage bill = bills[billId];
        return block.timestamp >= bill.deadline && 
               bill.paidCount < bill.participantCount &&
               !bill.settled &&
               !bill.cancelled;
    }
    
    /**
     * @dev Get time remaining until deadline
     * @param billId The bill to check
     */
    function getTimeRemaining(bytes32 billId) external view returns (uint256) {
        Bill storage bill = bills[billId];
        if (block.timestamp >= bill.deadline) {
            return 0;
        }
        return bill.deadline - block.timestamp;
    }

    /**
     * @dev Check if participant has paid
     * @param billId The bill to check
     * @param participant The participant address
     */
    function hasPaid(bytes32 billId, address participant) external view returns (bool) {
        return bills[billId].hasPaid[participant];
    }

    /**
     * @dev Get participant's share amount
     * @param billId The bill to check
     * @param participant The participant address
     */
    function getShare(bytes32 billId, address participant) external view returns (uint256) {
        return bills[billId].shares[participant];
    }
    
    /**
     * @dev Get participant's paid amount (for refunds)
     * @param billId The bill to check
     * @param participant The participant address
     */
    function getPaidAmount(bytes32 billId, address participant) external view returns (uint256) {
        return bills[billId].paidAmounts[participant];
    }
    
    /**
     * @dev Check if participant can be refunded
     * @param billId The bill to check
     * @param participant The participant address
     */
    function canRefund(bytes32 billId, address participant) external view returns (bool) {
        Bill storage bill = bills[billId];
        return bill.cancelled && bill.paidAmounts[participant] > 0;
    }
    
    /**
     * @dev Get beneficiary address for a bill
     * @param billId The bill to check
     */
    function getBeneficiary(bytes32 billId) external view returns (address) {
        return bills[billId].beneficiary;
    }
}
