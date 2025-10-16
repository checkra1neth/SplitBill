# SplitBill Roadmap

## Phase 1: MVP (Current) ✅
- [x] Basic bill creation
- [x] Item management
- [x] Participant management
- [x] Automatic calculations
- [x] Wallet integration (OnchainKit)
- [x] Direct payments
- [x] Share via link
- [x] QR code generation
- [x] Responsive design

## Phase 2: Enhanced UX (Week 2-3) ✅
- [x] Basenames integration
  - [x] Show basenames instead of addresses
  - [x] Search participants by basename
  - [x] ENS resolution support
  - [x] Duplicate participant detection
- [x] Base Account integration
- [x] Toast notifications for actions
- [x] Loading skeletons
- [x] Error boundaries (AppErrorBoundary)
- [ ] Optimistic UI updates
- [x] Dark mode with persistence
- [x] Multiple currency display (USD, EUR, GBP)
- [x] Theme toggle component

## Phase 3: Smart Contracts (Week 4-6) 🚧 95%
- [x] Escrow smart contract (SplitBillEscrow.sol)
  - [x] Lock funds until all participants pay
  - [x] Automatic distribution
  - [x] Refund mechanism
  - [x] Payment tracking
  - [x] Event emission
  - [x] Security features
- [x] Escrow Integration
  - [x] useEscrow hook (write operations)
  - [x] useEscrowStatus hook (read operations)
  - [x] useParticipantPaymentStatus hook
  - [x] EscrowToggle component
  - [x] EscrowPaymentButton component
  - [x] LazyEscrowStatusDisplay component
  - [x] GasEstimateDisplay component
  - [x] TransactionPending component
  - [x] Error handling (escrowErrors.ts)
  - [x] Gas transparency
  - [x] Backward compatibility
  - [x] Deployment scripts
  - [x] Comprehensive documentation
  - [ ] Contract deployed to Base Sepolia (ready to deploy)
- [ ] Bill NFT
  - Mint NFT as receipt
  - Proof of participation
- [ ] Reputation system
  - Track payment history
  - Reliable payer badges

## Phase 4: Advanced Features (Month 2)
- [ ] USDC/Stablecoin support
- [ ] Multi-token payments
- [ ] Receipt upload
- [ ] OCR for automatic item parsing
- [ ] Split methods
  - Equal split
  - By percentage
  - Custom amounts
  - By item selection
- [ ] Recurring bills
- [ ] Bill templates

## Phase 5: Social & Analytics (Month 3)
- [ ] Group management
  - Create permanent groups
  - Group history
  - Group analytics
- [ ] Activity feed
- [ ] Payment reminders
- [ ] Statistics dashboard
  - Total spent
  - Most frequent participants
  - Category breakdown
- [ ] Export to CSV

## Phase 6: Mobile & Integration (Month 4)
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Camera for QR scanning
- [ ] Location-based bill creation
- [ ] Restaurant integrations
- [ ] POS system integration

## Phase 7: Multi-chain (Month 5-6)
- [ ] Ethereum mainnet
- [ ] Optimism
- [ ] Arbitrum
- [ ] Polygon
- [ ] Cross-chain payments

## Phase 8: Enterprise (Month 6+)
- [ ] Business accounts
- [ ] Team expense management
- [ ] Accounting integrations
- [ ] Tax reporting
- [ ] API for third-party apps
- [ ] White-label solution

## Technical Debt & Improvements

### Performance
- [ ] Implement React.memo for expensive components
- [ ] Add virtual scrolling for long lists
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

### Testing
- [x] Unit tests for utilities (analytics.test.ts)
- [x] Integration tests for escrow
  - [x] Bill creation tests
  - [x] Payment flow tests
  - [x] Error scenario tests
  - [x] Backward compatibility tests
- [ ] E2E tests with Playwright
- [ ] Visual regression tests

### Security
- [ ] Smart contract audit
- [ ] Penetration testing
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CSRF protection

### DevOps
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Staging environment
- [ ] Monitoring & alerts
- [ ] Error tracking (Sentry)
- [ ] Analytics (Mixpanel/Amplitude)

## Community Features
- [ ] Public bill gallery
- [ ] Bill templates marketplace
- [ ] Community voting on features
- [ ] Referral program
- [ ] Ambassador program

## Monetization (Future)
- [ ] Premium features
  - Advanced analytics
  - Unlimited bills
  - Priority support
- [ ] Transaction fees (0.5%)
- [ ] Enterprise plans
- [ ] API access tiers

## Success Metrics

### Phase 1 (MVP)
- 100 bills created
- 50 successful transactions
- 10 daily active users

### Phase 2-3
- 1,000 bills created
- 500 successful transactions
- 100 daily active users
- Smart contract deployed

### Phase 4-6
- 10,000 bills created
- 5,000 successful transactions
- 1,000 daily active users
- Mobile app launched

### Long-term
- 100,000+ bills created
- 50,000+ successful transactions
- 10,000+ daily active users
- Multi-chain support
- Enterprise customers

---

This roadmap is flexible and will evolve based on user feedback and market needs.
