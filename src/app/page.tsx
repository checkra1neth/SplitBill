'use client';

import { useState, useEffect, useRef } from 'react';
import { CreateBillFormRetro } from '@/features/bill/components/CreateBillFormRetro';
import { useBill } from '@/features/bill/hooks/useBill';
import { useRouter } from 'next/navigation';
import { useEscrow } from '@/features/payment/hooks/useEscrow';
import { useToast } from '@/lib/providers/ToastProvider';
import { ClientTime } from '@/components/ClientTime';
import './retro.css';

export default function Home() {
  const { createBill, updateEscrowMetadata } = useBill();
  const { hash, isPending, isConfirming, isSuccess, error } = useEscrow();
  const { showToast } = useToast();
  const router = useRouter();
  const [creatingBill, setCreatingBill] = useState(false);
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);
  const [pendingEscrowBillId, setPendingEscrowBillId] = useState<string | null>(null);
  const hasShownSuccessToast = useRef(false);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash && pendingBillId && pendingEscrowBillId && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      
      // Update bill with escrow metadata
      updateEscrowMetadata(pendingEscrowBillId, hash);

      showToast({
        message: 'Escrow bill created successfully!',
        type: 'success',
      });

      // Navigate to bill page
      router.push(`/bill/${pendingBillId}`);
      
      // Reset state
      setPendingBillId(null);
      setPendingEscrowBillId(null);
      setCreatingBill(false);
    }
  }, [isSuccess, hash, pendingBillId, pendingEscrowBillId, updateEscrowMetadata, showToast, router]);

  // Handle transaction error
  useEffect(() => {
    if (error && pendingBillId) {
      // Use structured error message
      const errorTitle = error.title || 'Escrow Creation Failed';
      const errorMessage = error.message || 'Failed to create escrow bill';
      const errorAction = error.action || 'Bill saved as direct payment.';

      showToast({
        message: `${errorTitle}: ${errorMessage} ${errorAction}`,
        type: 'error',
      });

      // Navigate to bill page anyway (bill exists locally)
      router.push(`/bill/${pendingBillId}`);
      
      // Reset state
      setPendingBillId(null);
      setPendingEscrowBillId(null);
      setCreatingBill(false);
    }
  }, [error, pendingBillId, showToast, router]);

  const handleCreateBill = async (
    title: string,
    creatorAddress: string,
    escrowEnabled: boolean,
  ) => {
    try {
      setCreatingBill(true);
      hasShownSuccessToast.current = false;

      // Create bill locally first
      const bill = createBill(title, creatorAddress, escrowEnabled);
      if (!bill) {
        showToast({ message: 'Failed to create bill', type: 'error' });
        setCreatingBill(false);
        return;
      }

      // If escrow is enabled, show info message
      // Escrow contract will be created after adding items and participants
      if (escrowEnabled) {
        showToast({
          message: 'Bill created! Add items and participants to activate escrow',
          type: 'success',
        });
      } else {
        showToast({
          message: 'Bill created successfully!',
          type: 'success',
        });
      }

      // Navigate to bill page
      router.push(`/bill/${bill.id}`);
      setCreatingBill(false);
    } catch (error) {
      showToast({
        message: 'Failed to create bill',
        type: 'error',
      });
      console.error('Bill creation error:', error);
      setCreatingBill(false);
    }
  };

  return (
    <div className="retro-body" style={{ minHeight: '100vh', padding: '20px', paddingBottom: '60px' }}>
      {/* Main Window */}
      <div className="retro-window" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {/* Title Bar */}
        <div className="retro-title-bar">
          <div className="retro-title-text">
            <span className="retro-title-icon">💸</span>
            <span>SplitBill.exe</span>
          </div>
          <div className="retro-controls">
            <button className="retro-control-btn">_</button>
            <button className="retro-control-btn">□</button>
            <button className="retro-control-btn">✕</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="retro-menu-bar">
          <div className="retro-menu-item">File</div>
          <div className="retro-menu-item">Edit</div>
          <div className="retro-menu-item">View</div>
          <div className="retro-menu-item">Help</div>
        </div>

        {/* Content */}
        <div className="retro-content" style={{ minHeight: '400px' }}>
          {/* Welcome Section */}
          <div className="retro-group">
            <div className="retro-group-title">Welcome</div>
            <div style={{ padding: '8px' }}>
              <p style={{ marginBottom: '8px', fontSize: '11px' }}>
                <strong>SplitBill v1.0</strong> - Split bills instantly on Base
              </p>
              <p style={{ fontSize: '11px', color: '#666' }}>
                Create a bill, add items, invite friends, and pay onchain
              </p>
            </div>
          </div>

          {/* Create Bill Form */}
          <div className="retro-group">
            <div className="retro-group-title">Create New Bill</div>
            <div style={{ padding: '8px' }}>
          {/* Loading states */}
          {creatingBill && !isPending && !isConfirming && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Creating bill...
              </p>
            </div>
          )}

          {isPending && !hash && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Confirm transaction in your wallet
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Please approve the escrow bill creation
                </p>
              </div>
            </div>
          )}

          {isConfirming && hash && (
            <div className="mb-4 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Creating escrow bill...
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Waiting for blockchain confirmation
              </p>
            </div>
          )}

              <CreateBillFormRetro onCreateBill={handleCreateBill} />
            </div>
          </div>

          {/* Features */}
          <div className="retro-group">
            <div className="retro-group-title">Features</div>
            <div className="retro-list" style={{ maxHeight: '120px', overflow: 'auto' }}>
              <div className="retro-list-item">📝 Create bills with multiple items</div>
              <div className="retro-list-item">👥 Add participants by wallet address</div>
              <div className="retro-list-item">🔗 Share via QR code or link</div>
              <div className="retro-list-item">💸 Pay instantly onchain</div>
              <div className="retro-list-item">🔐 Optional escrow protection</div>
              <div className="retro-list-item">⛓️ Built on Base Sepolia</div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="retro-status-bar">
          <div className="retro-status-panel" style={{ flex: 2 }}>
            Ready
          </div>
          <div className="retro-status-panel" style={{ flex: 1 }}>
            Base Sepolia
          </div>
          <div className="retro-status-panel" style={{ flex: 0, minWidth: '60px' }}>
            <ClientTime format="full" />
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="retro-taskbar" style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0 
      }}>
        <button className="retro-start-button">
          <span style={{ fontSize: '14px' }}>🪟</span>
          <span>Start</span>
        </button>
        <div style={{ flex: 1 }} />
        <div className="retro-status-panel" style={{ minWidth: '80px', textAlign: 'center' }}>
          <ClientTime format="short" />
        </div>
      </div>
    </div>
  );
}
