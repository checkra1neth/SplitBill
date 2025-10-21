'use client';

import { useState, useEffect, useRef } from 'react';
import { CreateBillFormRetro } from '@/features/bill/components/CreateBillFormRetro';
import { useBill } from '@/features/bill/hooks/useBill';
import { useRouter } from 'next/navigation';
import { useEscrow } from '@/features/payment/hooks/useEscrow';
import { useToast } from '@/lib/providers/ToastProvider';
import { ClientTime } from '@/components/ClientTime';
import { useAccount } from 'wagmi';
import { UserStatsCard } from '@/components/UserStatsCard';
import { BillsByTagSearch } from '@/components/BillsByTagSearch';
import { UserBillsList } from '@/components/UserBillsList';
import { isMetadataRegistryConfigured } from '@/lib/config/metadata';
import { FaGithub, FaTelegram, FaMoneyBillWave, FaFileAlt, FaUsers, FaLink, FaDollarSign, FaLock } from 'react-icons/fa';
import { HiLink } from 'react-icons/hi';
import { FaXTwitter } from 'react-icons/fa6';
import { SiFarcaster, SiDevdotto } from 'react-icons/si';
import { RiNftFill } from 'react-icons/ri';
import { FaWindows } from 'react-icons/fa';
import { RetroStartMenu } from '@/components/RetroStartMenu';
import { RetroMenuBar } from '@/components/RetroMenuBar';
import { RetroConfirmDialog } from '@/components/RetroConfirmDialog';
import './retro.css';

export default function Home() {
  const { createBill, updateEscrowMetadata } = useBill();
  const { hash, isPending, isConfirming, isSuccess, error } = useEscrow();
  const { showToast } = useToast();
  const router = useRouter();
  const { address } = useAccount();
  const [creatingBill, setCreatingBill] = useState(false);
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);
  const [pendingEscrowBillId, setPendingEscrowBillId] = useState<string | null>(null);
  const hasShownSuccessToast = useRef(false);
  const metadataEnabled = isMetadataRegistryConfigured();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

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
    beneficiary?: string,
  ) => {
    try {
      setCreatingBill(true);
      hasShownSuccessToast.current = false;

      // Store beneficiary in localStorage if provided (will be used when activating escrow)
      if (beneficiary && escrowEnabled) {
        localStorage.setItem('pendingBeneficiary', beneficiary);
      }

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
        const beneficiaryMsg = beneficiary
          ? ` Funds will be sent to ${beneficiary.slice(0, 6)}...${beneficiary.slice(-4)}`
          : '';
        showToast({
          message: `Bill created! Add items and participants to activate escrow.${beneficiaryMsg}`,
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

  const handleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    
    // If minimizing and window is maximized, reset maximize state
    if (newMinimizedState && isMaximized) {
      setIsMaximized(false);
    }
    
    showToast({
      message: newMinimizedState ? 'Window minimized' : 'Window restored',
      type: 'info'
    });
  };

  const handleMaximize = () => {
    // If window is minimized, restore it first
    if (isMinimized) {
      setIsMinimized(false);
    }
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    setShowCloseDialog(true);
  };

  const handleConfirmClose = () => {
    showToast({ message: 'Goodbye! 👋', type: 'info' });
    setTimeout(() => {
      // Try to close the window/tab
      window.close();

      // If window.close() doesn't work (some browsers block it),
      // redirect to about:blank as fallback
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    }, 500);
  };

  return (
    <div className="retro-body" style={{ minHeight: '100vh', padding: '20px', paddingBottom: '60px' }}>
      {/* Main Window */}
      <div
        className="retro-window"
        style={{
          maxWidth: isMaximized ? '100%' : '640px',
          margin: isMaximized ? '0' : '0 auto',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Title Bar */}
        <div className="retro-title-bar">
          <div className="retro-title-text">
            <FaMoneyBillWave className="retro-title-icon" size={16} />
            <span>SplitBill.exe</span>
          </div>
          <div className="retro-controls">
            <button
              className="retro-control-btn"
              onClick={handleMinimize}
              title="Minimize"
            >
              _
            </button>
            <button
              className="retro-control-btn"
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? '❐' : '□'}
            </button>
            <button
              className="retro-control-btn"
              onClick={handleClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        {!isMinimized && (
          <RetroMenuBar onNewBill={() => {
            document.getElementById('create-bill-form')?.scrollIntoView({ behavior: 'smooth' });
          }} />
        )}

        {/* Content */}
        {!isMinimized && (
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
            <div className="retro-group" id="create-bill-form">
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

            {/* User Stats */}
            {metadataEnabled && address && (
              <div id="user-stats-section">
                <UserStatsCard address={address} />
              </div>
            )}

            {/* User Bills List */}
            {metadataEnabled && address && (
              <div id="user-bills-section">
                <UserBillsList address={address} />
              </div>
            )}

            {/* Search by Tags */}
            {metadataEnabled && (
              <div id="search-bills-section">
                <BillsByTagSearch />
              </div>
            )}

            {/* Features */}
            <div className="retro-group">
              <div className="retro-group-title">Features</div>
              <div className="retro-list" style={{ maxHeight: '120px', overflow: 'auto' }}>
                <div className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFileAlt size={12} /> Create bills with multiple items
                </div>
                <div className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUsers size={12} /> Add participants by wallet address
                </div>
                <div className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaLink size={12} /> Share via QR code or link
                </div>
                <div className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaDollarSign size={12} /> Pay instantly onchain
                </div>
                <div className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaLock size={12} /> Optional escrow protection
                </div>
                <div className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiLink size={12} /> Built on Base Sepolia
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        {!isMinimized && (
          <div className="retro-status-bar">
            <div className="retro-status-panel" style={{ flex: 2 }}>
              {isMaximized ? 'Maximized' : 'Ready'}
            </div>
            <div className="retro-status-panel" style={{ flex: 1 }}>
              Base Sepolia
            </div>
            <div className="retro-status-panel" style={{ flex: 0, minWidth: '60px' }}>
              <ClientTime format="full" />
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className="retro-taskbar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 4px',
        height: '28px',
        overflow: 'hidden'
      }}>
        <button
          ref={startButtonRef}
          className="retro-start-button"
          style={{
            height: '24px',
            border: isStartMenuOpen ? '2px inset #808080' : '2px outset #ffffff',
            boxShadow: isStartMenuOpen ? 'inset 1px 1px 0 #000000' : 'none',
          }}
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
        >
          <FaWindows size={12} />
          <span>Start</span>
        </button>

        {/* Start Menu */}
        <RetroStartMenu
          isOpen={isStartMenuOpen}
          onClose={() => setIsStartMenuOpen(false)}
          startButtonRef={startButtonRef}
        />

        {/* Social Links */}
        <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
          <a href="https://github.com/checkra1neth" target="_blank" rel="noopener noreferrer" title="GitHub" className="retro-taskbar-icon" style={{ width: '22px', height: '22px' }}>
            <FaGithub size={12} />
          </a>
          <a href="https://x.com/checkra1neth" target="_blank" rel="noopener noreferrer" title="X/Twitter" className="retro-taskbar-icon" style={{ width: '22px', height: '22px' }}>
            <FaXTwitter size={12} />
          </a>
          <a href="https://farcaster.xyz/checkra1n.eth" target="_blank" rel="noopener noreferrer" title="Farcaster" className="retro-taskbar-icon" style={{ width: '22px', height: '22px' }}>
            <SiFarcaster size={12} />
          </a>
          <a href="https://zora.co/@checkra1n" target="_blank" rel="noopener noreferrer" title="Zora" className="retro-taskbar-icon" style={{ width: '22px', height: '22px' }}>
            <RiNftFill size={12} />
          </a>
          <a href="https://t.me/suncrypt_org" target="_blank" rel="noopener noreferrer" title="Telegram" className="retro-taskbar-icon" style={{ width: '22px', height: '22px' }}>
            <FaTelegram size={12} />
          </a>
          <a href="https://devfolio.co/@checkra1n" target="_blank" rel="noopener noreferrer" title="Devfolio" className="retro-taskbar-icon" style={{ width: '22px', height: '22px' }}>
            <SiDevdotto size={12} />
          </a>
        </div>

        <div style={{ flex: 1 }} />

        {/* Built on Base */}
        <a
          href="https://base.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 6px',
            textDecoration: 'none',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: '#000000',
            background: '#c0c0c0',
            border: '1px inset #808080',
            boxShadow: 'inset 1px 1px 1px rgba(0,0,0,0.2)',
            letterSpacing: '0.3px',
            height: '20px',
          }}
        >
          <span style={{ fontSize: '8px', color: '#666', fontStyle: 'italic' }}>built on</span>
          <span style={{
            background: '#0052ff',
            color: '#ffffff',
            padding: '1px 4px',
            fontWeight: 'bold',
            fontSize: '9px',
          }}>
            BASE
          </span>
        </a>

        <div className="retro-status-panel" style={{ minWidth: '70px', textAlign: 'center', height: '20px', lineHeight: '20px', fontSize: '10px' }}>
          <ClientTime format="short" />
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      <RetroConfirmDialog
        isOpen={showCloseDialog}
        title="SplitBill"
        message={
          <>
            <div style={{ marginBottom: '12px' }}>
              Are you sure you want to close SplitBill?
            </div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              Any unsaved changes will be lost.
            </div>
          </>
        }
        confirmText="Yes"
        cancelText="No"
        onConfirm={handleConfirmClose}
        onCancel={() => setShowCloseDialog(false)}
      />
    </div>
  );
}
