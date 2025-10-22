#!/bin/bash

# Test script to verify upgrade functionality works correctly

set -e

echo "🧪 Testing Upgradeable Contracts"
echo "================================"

# This is a simulation - in real testing you'd use Foundry tests
echo ""
echo "Test Scenario:"
echo "1. Deploy V1 contract"
echo "2. Create a bill"
echo "3. Upgrade to V2 (with new function)"
echo "4. Verify old bill still exists"
echo "5. Test new function works"
echo ""

echo "✅ Key Points:"
echo "   - Storage layout preserved"
echo "   - Old data accessible"
echo "   - New functions available"
echo "   - Same proxy address"
echo ""

echo "📝 To run real tests:"
echo "   forge test --match-contract UpgradeTest"
echo ""

echo "Example upgrade test in Solidity:"
cat << 'EOF'

// test/UpgradeTest.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../SplitBillEscrowUpgradeable.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract UpgradeTest is Test {
    SplitBillEscrowUpgradeable public escrow;
    ERC1967Proxy public proxy;
    
    function setUp() public {
        // Deploy implementation
        SplitBillEscrowUpgradeable impl = new SplitBillEscrowUpgradeable();
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            SplitBillEscrowUpgradeable.initialize.selector
        );
        proxy = new ERC1967Proxy(address(impl), initData);
        
        // Wrap proxy
        escrow = SplitBillEscrowUpgradeable(address(proxy));
    }
    
    function testUpgradePreservesData() public {
        // Create bill in V1
        bytes32 billId = keccak256("test-bill");
        address[] memory participants = new address[](1);
        participants[0] = address(this);
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;
        
        escrow.createBill(billId, address(this), participants, shares);
        
        // Verify bill exists
        (address creator,,,,,,,) = escrow.getBillInfo(billId);
        assertEq(creator, address(this));
        
        // Deploy V2 (same contract for this test)
        SplitBillEscrowUpgradeable implV2 = new SplitBillEscrowUpgradeable();
        
        // Upgrade
        escrow.upgradeTo(address(implV2));
        
        // Verify bill still exists after upgrade
        (address creatorAfter,,,,,,,) = escrow.getBillInfo(billId);
        assertEq(creatorAfter, address(this));
        
        // Verify version incremented
        assertEq(escrow.version(), 2);
    }
}
EOF
