# Integration Tests for Escrow Feature

This directory contains comprehensive integration tests for the smart contract escrow functionality in SplitBill.

## Test Structure

The tests are organized into four main test suites:

### 1. Escrow Bill Creation Flow (`escrow-bill-creation.test.ts`)

Tests the complete flow of creating a bill with escrow enabled.

**Coverage:**
- Bill creation with `escrowEnabled` flag
- Generation of `escrowBillId` (bytes32 hash)
- Storage of escrow metadata (`escrowBillId`, `escrowTxHash`)
- Validation of bill data structure
- Multiple bill management

**Requirements Tested:** 2.1, 2.2, 2.3, 2.4, 2.5

**Key Test Cases:**
- ✓ Create bill with escrowEnabled flag set to true
- ✓ Generate valid escrowBillId (bytes32 hash)
- ✓ Generate consistent escrowBillId for same bill ID
- ✓ Prepare escrow data with correct participant addresses and amounts
- ✓ Store escrowBillId after contract creation
- ✓ Store escrowTxHash after contract transaction
- ✓ Store both escrowBillId and escrowTxHash together
- ✓ Validate that escrow bill has all required fields
- ✓ Handle bill without escrow metadata gracefully
- ✓ Handle multiple escrow bills independently

### 2. Escrow Payment Flow (`escrow-payment-flow.test.ts`)

Tests the complete payment flow for escrow bills.

**Coverage:**
- Participant share calculations
- Payment status tracking
- Real-time status updates
- Settlement detection
- Transaction hash validation

**Requirements Tested:** 3.1, 3.2, 3.3, 3.4, 3.8, 4.1, 4.2

**Key Test Cases:**
- ✓ Calculate correct shares for multiple participants
- ✓ Convert USD amounts to wei correctly
- ✓ Track payment status for each participant
- ✓ Record transaction hash for each payment
- ✓ Update payment count as participants pay
- ✓ Detect when all participants have paid
- ✓ Calculate payment progress percentage
- ✓ Detect when bill is ready for settlement
- ✓ Detect when bill is already settled
- ✓ Validate transaction hash format
- ✓ Store unique transaction hashes for each payment
- ✓ Validate payment amount matches participant share
- ✓ Format payment status display correctly
- ✓ Determine correct status badge
- ✓ Handle complex bill with multiple items and participants

### 3. Escrow Error Scenarios (`escrow-error-scenarios.test.ts`)

Tests error handling for various failure cases.

**Coverage:**
- Wallet connection errors
- Network validation errors
- Contract error parsing
- Payment amount errors
- Duplicate payment detection
- Non-participant payment errors
- Gas estimation errors
- Transaction timeout handling
- Error recovery

**Requirements Tested:** 7.1, 7.2, 7.5, 7.6, 7.7

**Key Test Cases:**
- ✓ Throw error when wallet is not connected
- ✓ Throw error when on wrong network
- ✓ Handle undefined chain ID
- ✓ Parse generic contract errors
- ✓ Handle error messages with specific keywords
- ✓ Detect when payment amount is too low/high
- ✓ Accept exact payment amount
- ✓ Detect duplicate payment attempt
- ✓ Detect when payer is not in participant list
- ✓ Handle case-insensitive address comparison
- ✓ Detect insufficient balance for gas
- ✓ Provide user-friendly error messages
- ✓ Include actionable suggestions in error messages
- ✓ Detect slow transactions
- ✓ Warn about high gas prices
- ✓ Allow retry after failed transaction
- ✓ Handle zero amount payment attempt
- ✓ Handle invalid address formats

### 4. Backward Compatibility (`escrow-backward-compatibility.test.ts`)

Tests that the escrow feature maintains backward compatibility with existing bills.

**Coverage:**
- Old bills (pre-escrow)
- New bills with escrow disabled
- New bills with escrow enabled
- Mixed bill types
- Type guard functions
- Graceful degradation
- Safe property access

**Requirements Tested:** 9.1, 9.2, 9.3, 9.4

**Key Test Cases:**
- ✓ Load old bill without escrow fields
- ✓ Treat old bills as direct payment bills
- ✓ Handle old ParticipantShare without escrow fields
- ✓ Create new bill with escrowEnabled: false
- ✓ Not show escrow UI for direct payment bills
- ✓ Create new bill with escrow metadata
- ✓ Show escrow UI for escrow-enabled bills
- ✓ Handle storage with mixed bill types
- ✓ Filter bills by payment type
- ✓ Correctly identify escrow bills
- ✓ Get payment type for any bill
- ✓ Handle missing escrow contract gracefully
- ✓ Fall back to direct payment when escrow unavailable
- ✓ Safely access optional escrow properties
- ✓ Safely access optional ParticipantShare properties

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test escrow-bill-creation
```

## Test Configuration

Tests are configured using Vitest with the following setup:

- **Environment:** jsdom (for DOM testing)
- **Globals:** Enabled (for describe, it, expect)
- **Setup File:** `tests/setup.ts`
- **Path Aliases:** `@` → `./src`

## Test Setup

The `tests/setup.ts` file provides:

- Automatic cleanup after each test
- localStorage mock
- crypto.randomUUID polyfill
- Testing library integration

## Test Coverage

Current test coverage:

- **Total Tests:** 71
- **Passing:** 71 (100%)
- **Test Files:** 4
- **Test Suites:** 15

### Coverage by Feature:

| Feature | Tests | Status |
|---------|-------|--------|
| Bill Creation | 10 | ✓ All passing |
| Payment Flow | 17 | ✓ All passing |
| Error Handling | 29 | ✓ All passing |
| Backward Compatibility | 15 | ✓ All passing |

## Writing New Tests

When adding new tests, follow these guidelines:

1. **Organize by feature:** Group related tests in describe blocks
2. **Use clear test names:** Test names should describe what is being tested
3. **Follow AAA pattern:** Arrange, Act, Assert
4. **Clean up:** Use beforeEach/afterEach for setup and cleanup
5. **Mock external dependencies:** Don't make real blockchain calls in unit tests
6. **Test edge cases:** Include tests for error conditions and edge cases

### Example Test Structure:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
    localStorage.clear();
  });

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = createTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. They:

- Run quickly (< 2 seconds total)
- Don't require external services
- Use mocked blockchain interactions
- Have deterministic results

## Troubleshooting

### Tests failing locally

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear test cache:
   ```bash
   npm test -- --clearCache
   ```

### Mock issues

If mocks aren't working:
- Check that setup.ts is being loaded
- Verify mock implementations match actual interfaces
- Ensure mocks are reset between tests

### Type errors

If TypeScript errors appear:
- Run `npm run build` to check for type issues
- Verify all imports are correct
- Check that test files have proper type annotations

## Future Enhancements

Potential additions to the test suite:

1. **E2E Tests:** Add end-to-end tests with real blockchain interactions (testnet)
2. **Performance Tests:** Add tests to measure gas costs and transaction times
3. **Load Tests:** Test behavior with many participants/bills
4. **Visual Regression Tests:** Add screenshot tests for UI components
5. **Accessibility Tests:** Add a11y tests for escrow UI components

## Related Documentation

- [Requirements Document](../.kiro/specs/smart-contract-escrow/requirements.md)
- [Design Document](../.kiro/specs/smart-contract-escrow/design.md)
- [Task List](../.kiro/specs/smart-contract-escrow/tasks.md)
- [Backward Compatibility Guide](../BACKWARD_COMPATIBILITY.md)
- [Testing Guide](../TESTING.md)
