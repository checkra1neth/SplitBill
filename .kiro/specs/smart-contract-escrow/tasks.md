# Implementation Plan - Smart Contract Escrow Integration

- [x] 1. Set up smart contract deployment infrastructure
  - Create deployment script for SplitBillEscrow contract to Base Sepolia
  - Add contract address and deployment transaction to environment configuration
  - Document deployment process in contracts/README.md
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 2. Implement core escrow configuration and utilities
  - [x] 2.1 Create escrow configuration file with contract ABI and address
    - Write `src/lib/config/escrow.ts` with ESCROW_ABI constant
    - Add ESCROW_CONTRACT_ADDRESS from environment variable
    - Implement `isEscrowAvailable()` helper function
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Implement escrow utility functions
    - Write `src/lib/utils/escrow.ts` with helper functions
    - Implement `generateEscrowBillId()` for bytes32 conversion
    - Implement `prepareEscrowData()` for contract data formatting
    - Add `formatEscrowStatus()` and `isEscrowComplete()` helpers
    - Implement `getExplorerUrl()` for transaction links
    - _Requirements: 2.2, 2.3, 6.2, 6.5_

  - [x] 2.3 Extend Bill type definitions
    - Update `src/lib/types/bill.ts` with escrow fields
    - Add `escrowEnabled`, `escrowBillId`, `escrowTxHash` to Bill interface
    - Add `escrowPaid` and `escrowTxHash` to ParticipantShare interface
    - Create new `EscrowStatus` interface
    - _Requirements: 2.4, 3.4, 6.4_

- [x] 3. Create escrow contract interaction hooks
  - [x] 3.1 Implement useEscrow hook for write operations
    - Write `src/features/payment/hooks/useEscrow.ts`
    - Implement `createEscrowBill()` function using useWriteContract
    - Implement `payEscrowShare()` function with value parameter
    - Add network validation and error handling
    - Return transaction states (isPending, isConfirming, isSuccess, hash)
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 3.1, 3.2, 3.3, 3.6, 3.7_

  - [x] 3.2 Implement useEscrowStatus hook for read operations
    - Write `src/features/payment/hooks/useEscrowStatus.ts`
    - Use useReadContract to fetch bill info from contract
    - Implement useWatchContractEvent for PaymentReceived events
    - Implement useWatchContractEvent for BillSettled events
    - Add automatic refetch on events with 10-second polling
    - Return formatted EscrowStatus object
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.7_

  - [x] 3.3 Implement useParticipantPaymentStatus hook
    - Write `src/features/payment/hooks/useParticipantPaymentStatus.ts`
    - Use useReadContract to check hasPaid status for specific participant
    - Add 10-second polling for status updates
    - Return hasPaid boolean and loading state
    - _Requirements: 3.4, 3.5, 4.6_

- [x] 4. Build escrow UI components
  - [x] 4.1 Create EscrowToggle component
    - Write `src/features/bill/components/EscrowToggle.tsx`
    - Add checkbox for enabling/disabling escrow
    - Implement "What's this?" info panel with benefits explanation
    - Disable toggle when wallet not connected
    - Hide component when escrow not available
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3_

  - [x] 4.2 Create EscrowPaymentButton component
    - Write `src/features/payment/components/EscrowPaymentButton.tsx`
    - Implement payment button using useEscrow hook
    - Add USD to ETH conversion (demo rate: 1 USD = 0.001 ETH)
    - Show loading states during transaction
    - Display success state with explorer link
    - Integrate with ToastProvider for notifications
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 6.1, 6.2, 6.5_

  - [x] 4.3 Create EscrowStatusDisplay component
    - Write `src/features/bill/components/EscrowStatusDisplay.tsx`
    - Use useEscrowStatus hook to fetch and display status
    - Show payment progress (X/Y paid)
    - Display status badges (In Progress, Awaiting Settlement, Settled)
    - Add loading skeleton for status fetch
    - Show warning when status unavailable
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 5. Integrate escrow into bill creation flow
  - [x] 5.1 Update CreateBillForm component
    - Add EscrowToggle component to bill creation form
    - Store escrowEnabled flag in bill state
    - Pass escrow preference to bill creation handler
    - _Requirements: 2.1, 5.1, 5.7_

  - [x] 5.2 Extend useBill hook with escrow support
    - Update `src/features/bill/hooks/useBill.ts`
    - Modify createBill to accept escrowEnabled parameter
    - Store escrow metadata in bill object
    - Save escrowBillId and escrowTxHash after contract creation
    - _Requirements: 2.4, 2.5, 9.1, 9.2, 9.3_

  - [x] 5.3 Implement escrow bill creation logic
    - In bill creation flow, check if escrow is enabled
    - If enabled, call useEscrow.createEscrowBill after local bill creation
    - Calculate participant shares using existing calculations.ts
    - Wait for transaction confirmation and store hash
    - Show toast notifications for creation progress
    - Handle errors and allow fallback to direct payment
    - _Requirements: 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 7.6_

- [x] 6. Integrate escrow into bill detail and payment flow
  - [x] 6.1 Update BillSummary component
    - Add conditional rendering for escrow vs direct payment
    - Show EscrowStatusDisplay when bill has escrow enabled
    - Display escrow badge/indicator in bill header
    - Add link to view creation transaction on explorer
    - _Requirements: 5.5, 6.1, 6.3_

  - [x] 6.2 Update bill detail page payment section
    - Modify `src/app/bill/[id]/page.tsx` payment logic
    - Check if bill has escrowEnabled flag
    - Render EscrowPaymentButton for escrow bills
    - Render existing payment button for direct bills
    - Show appropriate payment instructions based on mode
    - _Requirements: 3.1, 5.5, 5.6_

  - [x] 6.3 Implement participant payment status display
    - In participant list, use useParticipantPaymentStatus hook
    - Show checkmark or "Paid" badge for participants who paid via escrow
    - Display payment transaction hash with explorer link
    - Update status in real-time using contract events
    - _Requirements: 3.4, 4.6, 6.2, 6.4_

- [x] 7. Add comprehensive error handling
  - [x] 7.1 Implement wallet and network error handling
    - Add checks for wallet connection before escrow operations
    - Implement network switching prompt for wrong network
    - Show clear error messages for insufficient gas
    - Handle transaction rejection gracefully
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [x] 7.2 Implement contract error handling
    - Parse contract revert reasons and show user-friendly messages
    - Handle "Bill exists" error when creating duplicate bills
    - Handle "Already paid" error for duplicate payments
    - Handle "Not a participant" error for unauthorized payments
    - Handle "Incorrect amount" error with expected vs actual
    - _Requirements: 2.6, 3.3, 3.5, 3.7, 7.2, 7.6, 7.7_

  - [x] 7.3 Add loading and pending states
    - Show loading skeletons while fetching contract data
    - Display pending transaction states with transaction hash
    - Add timeout handling for slow transactions
    - Show network congestion warnings when applicable
    - _Requirements: 7.3, 7.4_

- [x] 8. Implement gas cost transparency
  - Add gas estimation display before escrow bill creation
  - Show estimated gas cost before payment transactions
  - Display gas cost explanation in escrow info panel
  - Add warning for high gas prices with suggestion to wait
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Ensure backward compatibility
  - [x] Test that bills without escrowEnabled field work as direct payment
  - [x] Verify old bills display correctly without escrow UI
  - [x] Ensure bill history shows both escrow and direct bills
  - [x] Add migration notes to documentation
  - [x] Create BACKWARD_COMPATIBILITY.md with detailed guide
  - [x] Create test-backward-compatibility.js test suite
  - [x] Update README.md with backward compatibility section
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Add environment configuration and documentation
  - [x] 10.1 Update environment configuration
    - Add NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS to .env.local.example
    - Document environment variable in README.md
    - Add fallback behavior when contract address not set
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 10.2 Update project documentation
    - Add escrow feature section to README.md
    - Document deployment process in contracts/README.md
    - Add escrow usage guide to QUICKSTART.md
    - Update ARCHITECTURE.md with escrow integration details
    - _Requirements: 1.4_

  - [x] 10.3 Create deployment guide
    - Write step-by-step contract deployment instructions
    - Document how to verify contract on BaseScan
    - Add troubleshooting section for common deployment issues
    - Include example deployment commands and scripts
    - _Requirements: 1.4, 1.5_

- [ ] 11. Integration testing and validation
  - [x] 11.1 Test escrow bill creation flow
    - Create test bill with escrow enabled
    - Verify contract transaction succeeds
    - Check that escrowBillId and escrowTxHash are stored
    - Validate bill appears correctly in UI
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 11.2 Test escrow payment flow
    - Add multiple test participants to escrow bill
    - Have each participant pay their share
    - Verify payment status updates in real-time
    - Check that settlement occurs after all payments
    - Validate transaction hashes are recorded
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.8, 4.1, 4.2_

  - [x] 11.3 Test error scenarios
    - Test payment with wrong amount
    - Test duplicate payment attempt
    - Test payment from non-participant
    - Test with insufficient gas
    - Test with wrong network
    - Verify all error messages display correctly
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_

  - [x] 11.4 Test backward compatibility
    - Create new direct payment bill (escrow disabled)
    - Load old bill created before escrow feature
    - Verify both types work correctly
    - Check that escrow UI doesn't appear for direct bills
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12. Polish and optimization
  - Add loading skeletons for all async operations
  - Optimize contract read polling intervals
  - Implement proper cleanup for event listeners
  - Add analytics tracking for escrow usage
  - Optimize bundle size by lazy loading escrow components
  - _Requirements: 4.5, 10.5, 10.6_
