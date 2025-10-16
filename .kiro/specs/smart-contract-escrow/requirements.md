# Requirements Document - Smart Contract Escrow Integration

## Introduction

This feature adds smart contract-based escrow functionality to SplitBill, enabling trustless bill settlement on Base blockchain. Currently, the application uses direct wallet-to-wallet transfers where participants manually pay the bill creator. With escrow integration, funds are locked in a smart contract until all participants pay, then automatically distributed to the bill creator. This eliminates trust issues, ensures fair settlement, and provides on-chain proof of payment.

The escrow contract (`SplitBillEscrow.sol`) is already drafted but not integrated into the frontend. This feature will bridge the gap between the existing direct payment system and the smart contract, providing users with an option to use escrow for added security.

## Requirements

### Requirement 1: Smart Contract Deployment and Configuration

**User Story:** As a developer, I want to deploy the escrow contract to Base Sepolia testnet and configure the frontend to interact with it, so that users can leverage trustless escrow functionality.

#### Acceptance Criteria

1. WHEN the escrow contract is deployed to Base Sepolia THEN the contract address SHALL be stored in the application configuration
2. WHEN the application initializes THEN it SHALL load the contract ABI and address from configuration
3. IF the contract address is not configured THEN the application SHALL fall back to direct payment mode
4. WHEN viewing contract configuration THEN developers SHALL see clear documentation on deployment process
5. WHEN the contract is deployed THEN the deployment transaction hash SHALL be recorded for verification

### Requirement 2: Escrow Bill Creation

**User Story:** As a bill creator, I want to create a bill with escrow protection, so that I can ensure all participants pay before funds are released.

#### Acceptance Criteria

1. WHEN creating a new bill THEN the user SHALL see an option to enable escrow protection
2. IF escrow is enabled THEN the bill creation SHALL call the smart contract's `createBill` function
3. WHEN calling `createBill` THEN the system SHALL pass the bill ID, participant addresses, and calculated shares
4. IF the transaction succeeds THEN the bill SHALL be marked as "escrow-enabled" in local storage
5. WHEN the escrow bill is created THEN the system SHALL display a success toast with the transaction hash
6. IF the transaction fails THEN the system SHALL show an error message and allow retry
7. WHEN creating an escrow bill THEN the user SHALL pay gas fees for the contract interaction
8. IF the user cancels the transaction THEN the bill SHALL remain in draft mode without escrow

### Requirement 3: Escrow Payment Processing

**User Story:** As a participant, I want to pay my share through the escrow contract, so that my payment is held securely until everyone pays.

#### Acceptance Criteria

1. WHEN viewing an escrow-enabled bill THEN participants SHALL see "Pay via Escrow" instead of direct payment
2. WHEN clicking "Pay via Escrow" THEN the system SHALL call the contract's `payShare` function with the exact share amount
3. IF the payment amount doesn't match the participant's share THEN the contract SHALL reject the transaction
4. WHEN the payment succeeds THEN the participant's status SHALL update to "paid" in the UI
5. IF the participant already paid THEN the contract SHALL reject duplicate payments
6. WHEN a payment is made THEN the system SHALL display a toast notification with transaction details
7. IF the transaction fails THEN the system SHALL show a clear error message explaining why
8. WHEN all participants pay THEN the contract SHALL automatically settle and transfer funds to the creator

### Requirement 4: Escrow Status Monitoring

**User Story:** As a bill creator or participant, I want to see real-time escrow status, so that I know who has paid and when settlement will occur.

#### Acceptance Criteria

1. WHEN viewing an escrow bill THEN the UI SHALL display the number of participants who have paid
2. WHEN a participant pays THEN the escrow status SHALL update automatically without page refresh
3. IF the bill is settled THEN the UI SHALL show "Settled" status with settlement transaction hash
4. WHEN checking escrow status THEN the system SHALL query the contract for current state
5. IF the contract query fails THEN the system SHALL show cached status with a warning
6. WHEN viewing participant list THEN each participant SHALL show their payment status from the contract
7. IF all participants paid THEN the UI SHALL display "Awaiting Settlement" until the settlement transaction confirms

### Requirement 5: Escrow vs Direct Payment Mode Selection

**User Story:** As a bill creator, I want to choose between escrow and direct payment modes, so that I can use the appropriate method for my situation.

#### Acceptance Criteria

1. WHEN creating a bill THEN the user SHALL see a toggle for "Use Escrow Protection"
2. IF escrow is disabled THEN the system SHALL use the existing direct payment flow
3. WHEN toggling escrow mode THEN the UI SHALL explain the benefits and gas cost implications
4. IF the wallet is not connected THEN the escrow option SHALL be disabled with explanation
5. WHEN viewing a bill THEN the payment method (escrow/direct) SHALL be clearly indicated
6. IF a bill uses direct payment THEN escrow features SHALL not be shown
7. WHEN switching between modes THEN the system SHALL preserve all bill data (items, participants, amounts)

### Requirement 6: Transaction History and Verification

**User Story:** As a user, I want to view transaction history for escrow bills, so that I can verify payments on-chain.

#### Acceptance Criteria

1. WHEN viewing an escrow bill THEN the UI SHALL display links to view transactions on Base Sepolia explorer
2. IF a participant paid THEN their payment transaction hash SHALL be visible and clickable
3. WHEN the bill is settled THEN the settlement transaction hash SHALL be displayed
4. IF viewing transaction history THEN each transaction SHALL show timestamp, amount, and status
5. WHEN clicking a transaction hash THEN it SHALL open the Base Sepolia block explorer in a new tab
6. IF transaction data is unavailable THEN the UI SHALL show "Loading..." or cached data

### Requirement 7: Error Handling and Edge Cases

**User Story:** As a user, I want clear error messages when escrow operations fail, so that I can understand and resolve issues.

#### Acceptance Criteria

1. IF the wallet has insufficient funds for gas THEN the system SHALL show "Insufficient funds for gas fees"
2. WHEN a transaction is rejected THEN the system SHALL display the rejection reason from the contract
3. IF the network is congested THEN the system SHALL show estimated wait time
4. WHEN a transaction is pending THEN the UI SHALL show a loading state with transaction hash
5. IF the user is on the wrong network THEN the system SHALL prompt to switch to Base Sepolia
6. WHEN the contract call fails THEN the system SHALL log the error and show user-friendly message
7. IF the bill ID doesn't exist in the contract THEN the system SHALL show "Bill not found in escrow"
8. WHEN the contract is not deployed THEN the system SHALL disable escrow features gracefully

### Requirement 8: Gas Optimization and Cost Transparency

**User Story:** As a user, I want to understand gas costs for escrow operations, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN enabling escrow THEN the UI SHALL display estimated gas costs for bill creation
2. IF paying via escrow THEN the system SHALL show estimated gas cost before transaction
3. WHEN viewing escrow benefits THEN the UI SHALL explain that gas costs are offset by security benefits
4. IF gas prices are high THEN the system SHALL warn users and suggest waiting
5. WHEN a transaction is submitted THEN the system SHALL use reasonable gas limits to avoid failures
6. IF the transaction runs out of gas THEN the system SHALL suggest increasing gas limit

### Requirement 9: Backward Compatibility

**User Story:** As an existing user, I want my old bills to continue working, so that I don't lose access to previous transactions.

#### Acceptance Criteria

1. WHEN viewing old bills created before escrow THEN they SHALL display as direct payment bills
2. IF a bill doesn't have escrow metadata THEN the system SHALL treat it as direct payment
3. WHEN migrating to escrow version THEN existing bills SHALL remain accessible
4. IF the escrow contract is not available THEN all bills SHALL fall back to direct payment mode
5. WHEN viewing bill history THEN both escrow and direct payment bills SHALL be clearly distinguished

### Requirement 10: Smart Contract Events and Notifications

**User Story:** As a bill creator, I want to receive notifications when participants pay via escrow, so that I can track bill progress.

#### Acceptance Criteria

1. WHEN a participant pays via escrow THEN the system SHALL listen for `PaymentReceived` events
2. IF a `PaymentReceived` event is detected THEN the UI SHALL update the participant's status
3. WHEN the bill is settled THEN the system SHALL listen for `BillSettled` event
4. IF a `BillSettled` event is detected THEN the UI SHALL show settlement confirmation
5. WHEN viewing an active escrow bill THEN the system SHALL poll for events every 10 seconds
6. IF the user leaves the page THEN event listening SHALL stop to conserve resources
7. WHEN returning to an escrow bill THEN the system SHALL fetch latest state from the contract
