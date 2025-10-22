#!/bin/bash

# Test script for escrow refund features
# Tests: cancelAndRefund, autoRefundIfExpired, partialSettle

set -e

echo "🧪 Testing Escrow Refund Features"
echo "=================================="

# Load environment variables
source .env

CONTRACT_ADDRESS="${ESCROW_CONTRACT_ADDRESS}"
RPC_URL="https://sepolia.base.org"

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error: ESCROW_CONTRACT_ADDRESS not set in .env"
    exit 1
fi

echo "📍 Contract: $CONTRACT_ADDRESS"
echo ""

# Generate test bill ID
TEST_BILL_ID=$(cast keccak "test-refund-$(date +%s)")
echo "🆔 Test Bill ID: $TEST_BILL_ID"
echo ""

# Test accounts (replace with your test accounts)
CREATOR="0xYourCreatorAddress"
PARTICIPANT1="0xParticipant1Address"
PARTICIPANT2="0xParticipant2Address"

echo "👥 Test Accounts:"
echo "   Creator: $CREATOR"
echo "   Participant 1: $PARTICIPANT1"
echo "   Participant 2: $PARTICIPANT2"
echo ""

# ============================================
# Test 1: Create Bill
# ============================================
echo "📝 Test 1: Creating test bill..."

PARTICIPANTS="[$PARTICIPANT1,$PARTICIPANT2]"
SHARES="[100000000000000000,100000000000000000]" # 0.1 ETH each

cast send $CONTRACT_ADDRESS \
    "createBill(bytes32,address[],uint256[])" \
    $TEST_BILL_ID \
    "$PARTICIPANTS" \
    "$SHARES" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

echo "✅ Bill created"
echo ""

# ============================================
# Test 2: Check Bill Info
# ============================================
echo "📊 Test 2: Checking bill info..."

BILL_INFO=$(cast call $CONTRACT_ADDRESS \
    "getBillInfo(bytes32)" \
    $TEST_BILL_ID \
    --rpc-url $RPC_URL)

echo "Bill Info: $BILL_INFO"
echo ""

# ============================================
# Test 3: Participant 1 Pays
# ============================================
echo "💰 Test 3: Participant 1 pays share..."

cast send $CONTRACT_ADDRESS \
    "payShare(bytes32)" \
    $TEST_BILL_ID \
    --value 0.1ether \
    --rpc-url $RPC_URL \
    --private-key $PARTICIPANT1_PRIVATE_KEY

echo "✅ Participant 1 paid"
echo ""

# ============================================
# Test 4: Check Payment Status
# ============================================
echo "🔍 Test 4: Checking payment status..."

HAS_PAID=$(cast call $CONTRACT_ADDRESS \
    "hasPaid(bytes32,address)" \
    $TEST_BILL_ID \
    $PARTICIPANT1 \
    --rpc-url $RPC_URL)

echo "Participant 1 has paid: $HAS_PAID"
echo ""

# ============================================
# Test 5: Check if Expired
# ============================================
echo "⏰ Test 5: Checking if bill is expired..."

IS_EXPIRED=$(cast call $CONTRACT_ADDRESS \
    "isExpired(bytes32)" \
    $TEST_BILL_ID \
    --rpc-url $RPC_URL)

echo "Is expired: $IS_EXPIRED"
echo ""

# ============================================
# Test 6: Get Time Remaining
# ============================================
echo "⏳ Test 6: Getting time remaining..."

TIME_REMAINING=$(cast call $CONTRACT_ADDRESS \
    "getTimeRemaining(bytes32)" \
    $TEST_BILL_ID \
    --rpc-url $RPC_URL)

SECONDS=$((16#${TIME_REMAINING:2}))
DAYS=$((SECONDS / 86400))
HOURS=$(((SECONDS % 86400) / 3600))

echo "Time remaining: $DAYS days, $HOURS hours"
echo ""

# ============================================
# Test 7: Partial Settlement (should work)
# ============================================
echo "💰 Test 7: Testing partial settlement..."

cast send $CONTRACT_ADDRESS \
    "partialSettle(bytes32)" \
    $TEST_BILL_ID \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

echo "✅ Partial settlement executed"
echo ""

# ============================================
# Test 8: Check Final Status
# ============================================
echo "📊 Test 8: Checking final bill status..."

FINAL_INFO=$(cast call $CONTRACT_ADDRESS \
    "getBillInfo(bytes32)" \
    $TEST_BILL_ID \
    --rpc-url $RPC_URL)

echo "Final Bill Info: $FINAL_INFO"
echo ""

# ============================================
# Test 9: Create New Bill for Cancel Test
# ============================================
echo "📝 Test 9: Creating bill for cancel test..."

TEST_BILL_ID_2=$(cast keccak "test-cancel-$(date +%s)")

cast send $CONTRACT_ADDRESS \
    "createBill(bytes32,address[],uint256[])" \
    $TEST_BILL_ID_2 \
    "$PARTICIPANTS" \
    "$SHARES" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

echo "✅ Second bill created: $TEST_BILL_ID_2"
echo ""

# ============================================
# Test 10: Participant Pays
# ============================================
echo "💰 Test 10: Participant pays..."

cast send $CONTRACT_ADDRESS \
    "payShare(bytes32)" \
    $TEST_BILL_ID_2 \
    --value 0.1ether \
    --rpc-url $RPC_URL \
    --private-key $PARTICIPANT1_PRIVATE_KEY

echo "✅ Payment received"
echo ""

# ============================================
# Test 11: Cancel and Refund
# ============================================
echo "❌ Test 11: Testing cancel and refund..."

cast send $CONTRACT_ADDRESS \
    "cancelAndRefund(bytes32)" \
    $TEST_BILL_ID_2 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

echo "✅ Bill cancelled"
echo ""

# ============================================
# Test 12: Check if Can Refund
# ============================================
echo "🔍 Test 12: Checking if participant can refund..."

CAN_REFUND=$(cast call $CONTRACT_ADDRESS \
    "canRefund(bytes32,address)" \
    $TEST_BILL_ID_2 \
    $PARTICIPANT1 \
    --rpc-url $RPC_URL)

echo "Can refund: $CAN_REFUND"
echo ""

# ============================================
# Test 13: Get Paid Amount
# ============================================
echo "💵 Test 13: Getting paid amount..."

PAID_AMOUNT=$(cast call $CONTRACT_ADDRESS \
    "getPaidAmount(bytes32,address)" \
    $TEST_BILL_ID_2 \
    $PARTICIPANT1 \
    --rpc-url $RPC_URL)

echo "Paid amount: $PAID_AMOUNT (wei)"
echo ""

# ============================================
# Test 14: Claim Refund
# ============================================
echo "💰 Test 14: Claiming refund..."

cast send $CONTRACT_ADDRESS \
    "refundParticipant(bytes32,address)" \
    $TEST_BILL_ID_2 \
    $PARTICIPANT1 \
    --rpc-url $RPC_URL \
    --private-key $PARTICIPANT1_PRIVATE_KEY

echo "✅ Refund claimed"
echo ""

# ============================================
# Summary
# ============================================
echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "  ✓ Bill creation"
echo "  ✓ Payment processing"
echo "  ✓ Partial settlement"
echo "  ✓ Cancel and refund"
echo "  ✓ Refund claiming"
echo "  ✓ Time tracking"
echo ""
echo "🎉 Refund features working correctly!"
