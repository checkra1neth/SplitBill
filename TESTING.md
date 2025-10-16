# Testing Guide

## Manual Testing Checklist

### 1. Wallet Connection
- [ ] Click "Connect Wallet" button
- [ ] Coinbase Wallet modal appears
- [ ] Can create new wallet or connect existing
- [ ] Wallet address displays correctly
- [ ] Can disconnect wallet
- [ ] Reconnect works after page refresh

### 2. Bill Creation
- [ ] Enter bill title
- [ ] Click "Create Bill"
- [ ] Redirects to bill page
- [ ] Bill ID in URL is valid
- [ ] Bill title displays correctly
- [ ] Creator address is correct

### 3. Add Items
- [ ] Enter item description
- [ ] Enter item amount
- [ ] Click "Add Item"
- [ ] Item appears in summary
- [ ] Amount displays correctly
- [ ] Can add multiple items
- [ ] Total updates correctly

### 4. Add Participants
- [ ] Enter valid Ethereum address
- [ ] Click "Add Participant"
- [ ] Participant appears in list
- [ ] Can add multiple participants
- [ ] Share calculation updates
- [ ] Invalid address shows error

### 5. Tip & Tax
- [ ] Enter tip amount
- [ ] Enter tax amount
- [ ] Click "Update"
- [ ] Total updates correctly
- [ ] Shares recalculate proportionally
- [ ] Can update multiple times

### 6. Share Bill
- [ ] Copy link button works
- [ ] Link is correct format
- [ ] Can open link in new tab
- [ ] QR code generates
- [ ] QR code is scannable
- [ ] QR code leads to correct URL

### 7. Payment Flow
- [ ] "Pay My Share" button enabled when wallet connected
- [ ] Click "Pay My Share"
- [ ] Wallet confirmation modal appears
- [ ] Transaction details are correct
- [ ] Can confirm transaction
- [ ] Transaction processes
- [ ] Success state shows
- [ ] Transaction hash is valid

### 8. Calculations
- [ ] Equal split works correctly
- [ ] Tip is distributed proportionally
- [ ] Tax is distributed proportionally
- [ ] Totals match expected amounts
- [ ] No rounding errors
- [ ] Currency formatting is correct

### 9. Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] All buttons are clickable
- [ ] Text is readable
- [ ] No horizontal scroll

### 10. Edge Cases
- [ ] Empty bill title shows error
- [ ] Zero amount items rejected
- [ ] Negative amounts rejected
- [ ] Very large amounts work
- [ ] Special characters in description
- [ ] Long bill titles
- [ ] Many items (20+)
- [ ] Many participants (10+)

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Network Testing

### Base Sepolia Testnet
- [ ] Switch to Base Sepolia in wallet
- [ ] Get testnet ETH from faucet
- [ ] Create test transaction
- [ ] Transaction appears on explorer
- [ ] Transaction confirms
- [ ] Balance updates correctly

### Faucet Links
- Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Alternative: https://sepolia.basescan.org/faucet

## Performance Testing

- [ ] Page loads in < 3 seconds
- [ ] Wallet connection is instant
- [ ] Bill creation is instant
- [ ] No lag when adding items
- [ ] Smooth animations
- [ ] No console errors
- [ ] No console warnings

## Security Testing

- [ ] Cannot access other users' bills (if implemented)
- [ ] XSS protection (try `<script>alert('xss')</script>` in inputs)
- [ ] SQL injection protection (not applicable for localStorage)
- [ ] CSRF protection (not applicable for client-only)
- [ ] Wallet signature required for payments
- [ ] Cannot send to invalid addresses

## Accessibility Testing

- [ ] Can navigate with keyboard only
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Alt text for images
- [ ] ARIA labels where needed

## Test Scenarios

### Scenario 1: Simple Dinner Split
1. Create bill "Dinner at Pizza Place"
2. Add item "Large Pizza - $24"
3. Add item "Drinks - $8"
4. Add 3 participants (including yourself)
5. Set tip $5, tax $3
6. Verify each person owes $13.33
7. Pay your share
8. Verify transaction on explorer

### Scenario 2: Complex Bill
1. Create bill "Weekend Trip"
2. Add 5 different items
3. Add 4 participants
4. Set tip and tax
5. Share via QR code
6. Have friend scan and join
7. Both pay shares
8. Verify both transactions

### Scenario 3: Edge Case
1. Create bill with very long title (100+ chars)
2. Add item with $0.01
3. Add item with $999.99
4. Add 10 participants
5. Set tip $0.01, tax $0.01
6. Verify calculations are correct
7. Test payment flow

## Automated Testing (Future)

### Unit Tests
```bash
npm test
```

Test files to create:
- `lib/utils/calculations.test.ts`
- `features/bill/hooks/useBill.test.ts`
- `features/payment/hooks/usePayment.test.ts`

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Bug Reporting

If you find bugs, report with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Screenshots/video
6. Console errors
7. Network tab (if relevant)

## Test Data

### Valid Ethereum Addresses
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed
0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359
```

### Test Amounts
```
Small: $0.01, $1.00, $5.50
Medium: $25.00, $50.00, $100.00
Large: $500.00, $1000.00, $9999.99
```

### Test Descriptions
```
Short: "Pizza"
Medium: "Large Pepperoni Pizza with Extra Cheese"
Long: "Super delicious amazing incredible fantastic wonderful..."
Special: "Pizza & Drinks (50% off) - $19.99"
```

## Performance Benchmarks

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

## Pre-Deployment Checklist

- [ ] All manual tests pass
- [ ] Tested on 3+ browsers
- [ ] Tested on mobile
- [ ] No console errors
- [ ] Performance is good
- [ ] Accessibility is good
- [ ] At least 1 successful testnet transaction
- [ ] Transaction verified on Base Sepolia explorer

## Post-Deployment Testing

After deploying to Vercel:
- [ ] Production URL loads
- [ ] Wallet connection works
- [ ] Can create bills
- [ ] Can make payments
- [ ] All features work same as local
- [ ] No CORS errors
- [ ] API key is working
- [ ] Analytics tracking (if added)

---

Happy testing! 🧪
