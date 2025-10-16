# SplitBill Architecture

## Design Principles

1. **Modularity** - Features are isolated in separate modules
2. **Scalability** - Easy to add new features without refactoring
3. **Type Safety** - Full TypeScript coverage
4. **Separation of Concerns** - Business logic separated from UI

## Architecture Layers

### 1. Presentation Layer (`components/`, `app/`)
- React components
- UI logic only
- No business logic

### 2. Feature Layer (`features/`)
Each feature is self-contained:
- `components/` - Feature-specific UI
- `hooks/` - Feature logic and state
- `types/` - Feature-specific types (if needed)

Current features:
- **bill** - Bill creation and management
- **payment** - Payment processing

### 3. Core Layer (`lib/`)
- `types/` - Shared TypeScript interfaces
- `utils/` - Pure utility functions
- `config/` - Configuration (chains, wagmi)
- `providers/` - React context providers (OnchainKit, Theme, Toast)

## Data Flow

```
User Action → Component → Hook → Utility → Storage/Blockchain
                ↓
            State Update
                ↓
            Re-render
```

## State Management

- **Local State**: React useState for UI state
- **Persistent State**: localStorage for bills
- **Blockchain State**: Wagmi hooks for wallet/transactions
- **Async Queries**: TanStack Query inside `OnchainProviders` for OnchainKit identity lookups

## Identity & UX Infrastructure (Phase 2)

- **Participant resolution** lives in `features/bill/utils/resolveParticipantIdentity.ts`, combining viem validation with OnchainKit `getName/getAddress` so Basename/ENS entries resolve to canonical addresses before storage.
- **Base Account connector** is added alongside Coinbase Smart Wallet in `lib/config/wagmi.ts`, giving users a seedless smart wallet option out of the box.
- **ToastProvider** and **ThemeProvider** wrap the app (see `lib/providers`) to deliver global notifications, persistent dark mode, and shared context for UI feedback.
- **AppErrorBoundary** in `components/` ensures unexpected runtime errors are captured with a friendly fallback.
- **Currency utilities** (`lib/utils/currency.ts`) power the multi-currency selector in `BillSummary`, translating USD amounts into EUR/GBP demo values while retaining the source total.

## Adding New Features

### Example: Adding "Split by Percentage"

1. **Add types** (`lib/types/bill.ts`):
```typescript
export type SplitMethod = 'equal' | 'percentage' | 'custom';
```

2. **Add utility** (`lib/utils/calculations.ts`):
```typescript
export function calculateByPercentage(bill: Bill): ParticipantShare[] {
  // Implementation
}
```

3. **Create feature hook** (`features/bill/hooks/useSplitMethod.ts`):
```typescript
export function useSplitMethod() {
  // Hook logic
}
```

4. **Create UI component** (`features/bill/components/SplitMethodSelector.tsx`):
```typescript
export function SplitMethodSelector() {
  // Component
}
```

5. **Integrate** in page

## Blockchain Integration

### Payment Modes

The application supports two payment modes:

#### 1. Direct Payment (Default)
- Wallet-to-wallet transfers using Wagmi's `useSendTransaction`
- No smart contract required
- Lower gas costs
- Immediate settlement
- Best for trusted groups

#### 2. Escrow Protection (Optional)
- Smart contract-based trustless settlement
- Funds locked until all participants pay
- Automatic settlement when complete
- On-chain payment verification
- Best for larger groups or unfamiliar participants

### Escrow Architecture

```
features/
└── payment/
    ├── components/
    │   └── EscrowPaymentButton.tsx    # Pay via escrow UI
    └── hooks/
        ├── useEscrow.ts               # Write operations (create, pay)
        ├── useEscrowStatus.ts         # Read operations (status, events)
        └── useParticipantPaymentStatus.ts  # Individual payment checks

features/
└── bill/
    └── components/
        ├── EscrowToggle.tsx           # Enable/disable escrow
        └── EscrowStatusDisplay.tsx    # Show bill status

lib/
├── config/
│   └── escrow.ts                      # Contract ABI & address
└── utils/
    ├── escrow.ts                      # Helper functions
    └── escrowErrors.ts                # Error handling

contracts/
├── SplitBillEscrow.sol                # Smart contract
├── deploy.sh                          # Deployment script
└── README.md                          # Contract documentation
```

### Escrow Data Flow

```
User Creates Bill → EscrowToggle → useBill hook
                                        ↓
                            (if escrow enabled)
                                        ↓
                    useEscrow.createEscrowBill()
                                        ↓
                            Smart Contract (Base)
                                        ↓
                        Store escrowBillId & txHash
                                        ↓
                            Bill Detail Page
                                        ↓
            EscrowStatusDisplay (monitors contract)
                                        ↓
        Participant → EscrowPaymentButton → useEscrow.payEscrowShare()
                                        ↓
                            Smart Contract
                                        ↓
                    Event: PaymentReceived
                                        ↓
            useEscrowStatus (auto-updates UI)
                                        ↓
        (All paid) → Auto-settlement → Event: BillSettled
```

### Contract Integration

**Configuration** (`lib/config/escrow.ts`):
- Contract ABI (typed with TypeScript)
- Contract address from environment variable
- `isEscrowAvailable()` - checks if contract is deployed
- Graceful fallback to direct payment if not configured

**Utilities** (`lib/utils/escrow.ts`):
- `generateEscrowBillId()` - converts UUID to bytes32
- `prepareEscrowData()` - formats participant data for contract
- `formatEscrowStatus()` - formats status for display
- `getExplorerUrl()` - generates BaseScan links

**Hooks**:
- `useEscrow` - Write operations using `useWriteContract`
- `useEscrowStatus` - Read operations using `useReadContract`
- `useWatchContractEvent` - Real-time event monitoring
- Automatic polling every 10 seconds for status updates

**Error Handling** (`lib/utils/escrowErrors.ts`):
- Parses contract revert reasons
- User-friendly error messages
- Network validation
- Gas estimation and warnings

## Testing Strategy

- **Unit Tests**: Utility functions (`calculations.ts`)
- **Integration Tests**: Hooks with mock providers
- **E2E Tests**: Full user flows with Playwright

## Performance Considerations

- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Memoization**: React.memo for expensive renders
- **Optimistic Updates**: Update UI before blockchain confirmation
- **Perceived Performance**: Skeleton loaders and toast notifications keep users informed during async actions

## Backward Compatibility

The escrow feature is designed to be fully backward compatible:

### Data Model Extensions
- Bill interface extended with optional fields: `escrowEnabled?`, `escrowBillId?`, `escrowTxHash?`
- ParticipantShare extended with: `escrowPaid?`, `escrowTxHash?`
- Old bills without these fields work as direct payment bills
- No data migration required

### Feature Detection
- `isEscrowAvailable()` checks if contract is deployed
- UI components conditionally render based on availability
- Graceful degradation when contract not configured
- EscrowToggle hidden when escrow unavailable

### Bill Type Handling
- Bills without `escrowEnabled` field → treated as direct payment
- Bills with `escrowEnabled: false` → direct payment
- Bills with `escrowEnabled: true` → escrow mode
- Mixed bill history displays correctly

### Testing
- Comprehensive backward compatibility test suite in `test-backward-compatibility.js`
- Type safety validation with TypeScript
- Documentation in `BACKWARD_COMPATIBILITY.md`

## Security

- **Input Validation**: All user inputs validated
- **Address Verification**: Check valid Ethereum addresses
- **Identity Validation**: Basename/ENS entries are forward-resolved and deduplicated before persistence
- **Transaction Confirmation**: Wait for blockchain confirmation
- **No Private Keys**: Only wallet connections, no key storage
- **Contract Security**: Reentrancy protection, access control, amount validation
- **Error Handling**: Comprehensive error parsing and user-friendly messages

## Scalability Path

1. **Phase 1**: Client-side, localStorage, direct payments ✅
2. **Phase 2**: Identity resolution, UX improvements ✅
3. **Phase 3**: Smart contract escrow integration ✅
4. **Phase 4**: Backend API for bill sharing (future)
5. **Phase 5**: Multi-chain support (future)
6. **Phase 6**: Mobile apps (future)

## File Naming Conventions

- Components: PascalCase (`BillSummary.tsx`)
- Hooks: camelCase with 'use' prefix (`useBill.ts`)
- Utils: camelCase (`calculations.ts`)
- Types: camelCase (`bill.ts`)
- Constants: UPPER_SNAKE_CASE in files

## Import Order

1. External libraries (react, next, etc.)
2. Internal absolute imports (@/lib, @/components)
3. Relative imports (./components)
4. Types
5. Styles
