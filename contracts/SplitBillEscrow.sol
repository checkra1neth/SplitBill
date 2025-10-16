// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SplitBillEscrow
 * @dev Escrow contract for SplitBill - holds funds until all participants pay
 * @notice This is a future enhancement - not used in MVP
 */
contract SplitBillEscrow {
    struct Bill {
        address creator;
        uint256 totalAmount;
        uint256 participantCount;
        uint256 paidCount;
        bool settled;
        mapping(address => uint256) shares;
        mapping(address => bool) hasPaid;
    }

    mapping(bytes32 => Bill) public bills;
    
    event BillCreated(bytes32 indexed billId, address indexed creator, uint256 totalAmount);
    event PaymentReceived(bytes32 indexed billId, address indexed participant, uint256 amount);
    event BillSettled(bytes32 indexed billId);
    event RefundIssued(bytes32 indexed billId, address indexed participant, uint256 amount);

    /**
     * @dev Create a new bill with participant shares
     * @param billId Unique identifier for the bill
     * @param participants Array of participant addresses
     * @param shares Array of amounts each participant owes
     */
    function createBill(
        bytes32 billId,
        address[] calldata participants,
        uint256[] calldata shares
    ) external {
        require(participants.length == shares.length, "Length mismatch");
        require(participants.length > 0, "No participants");
        require(bills[billId].creator == address(0), "Bill exists");

        Bill storage bill = bills[billId];
        bill.creator = msg.sender;
        bill.participantCount = participants.length;

        uint256 total = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            require(participants[i] != address(0), "Invalid address");
            require(shares[i] > 0, "Invalid share");
            
            bill.shares[participants[i]] = shares[i];
            total += shares[i];
        }

        bill.totalAmount = total;

        emit BillCreated(billId, msg.sender, total);
    }

    /**
     * @dev Pay your share of the bill
     * @param billId The bill to pay for
     */
    function payShare(bytes32 billId) external payable {
        Bill storage bill = bills[billId];
        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Bill already settled");
        require(!bill.hasPaid[msg.sender], "Already paid");
        require(bill.shares[msg.sender] > 0, "Not a participant");
        require(msg.value == bill.shares[msg.sender], "Incorrect amount");

        bill.hasPaid[msg.sender] = true;
        bill.paidCount++;

        emit PaymentReceived(billId, msg.sender, msg.value);

        // If everyone paid, settle the bill
        if (bill.paidCount == bill.participantCount) {
            _settleBill(billId);
        }
    }

    /**
     * @dev Internal function to settle bill and transfer to creator
     * @param billId The bill to settle
     */
    function _settleBill(bytes32 billId) internal {
        Bill storage bill = bills[billId];
        require(!bill.settled, "Already settled");

        bill.settled = true;

        // Transfer total amount to bill creator
        (bool success, ) = bill.creator.call{value: bill.totalAmount}("");
        require(success, "Transfer failed");

        emit BillSettled(billId);
    }

    /**
     * @dev Get bill details
     * @param billId The bill to query
     */
    function getBillInfo(bytes32 billId) external view returns (
        address creator,
        uint256 totalAmount,
        uint256 participantCount,
        uint256 paidCount,
        bool settled
    ) {
        Bill storage bill = bills[billId];
        return (
            bill.creator,
            bill.totalAmount,
            bill.participantCount,
            bill.paidCount,
            bill.settled
        );
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
}
