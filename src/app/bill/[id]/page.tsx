'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useBill } from '@/features/bill/hooks/useBill';
import { usePayment } from '@/features/payment/hooks/usePayment';
import { calculateParticipantShares, formatCurrency } from '@/lib/utils/calculations';
import { useAccount } from 'wagmi';
import { resolveParticipantIdentity } from '@/features/bill/utils/resolveParticipantIdentity';
import { DEFAULT_CHAIN } from '@/lib/config/chains';
import { useToast } from '@/lib/providers/ToastProvider';

import { EscrowPaymentButton } from '@/features/payment/components/LazyEscrowPaymentButton';
import { useEthPrice } from '@/lib/hooks/useEthPrice';
import { SHARE_QUERY_PARAM, buildShareableBillUrl, decodeBillFromShare } from '@/lib/utils/share';
import { saveBill, getBillById } from '@/lib/utils/storage';
import '../../retro.css';
import { usePublishBillMetadata } from '@/features/bill/hooks/useBillMetadata';
import { useBillMetadata } from '@/features/bill/hooks/useBillMetadata';
import { isMetadataRegistryConfigured } from '@/lib/config/metadata';
import { PublishBillButton } from '@/components/PublishBillButton';
import { BillRating } from '@/components/BillRating';
import { AccessControlPanel } from '@/components/AccessControlPanel';
import { ActivateEscrowButton } from '@/components/ActivateEscrowButton';
import { ParticipantPaymentStatus } from '@/features/bill/components/ParticipantPaymentStatus';
import { EscrowPaymentProgress } from '@/features/bill/components/EscrowPaymentProgress';
import { EscrowManagementPanel } from '@/features/bill/components/EscrowManagementPanel';
import { EscrowDeadlineDisplay } from '@/features/bill/components/EscrowDeadlineDisplay';
import { RefundClaimButton } from '@/features/payment/components/RefundClaimButton';
import { useEscrowBillInfo } from '@/features/payment/hooks/useEscrowBillData';
import QRCode from 'react-qr-code';
import { RetroConfirmDialog } from '@/components/RetroConfirmDialog';
import { AppKitButton } from '@/components/AppKitButton';

export default function BillPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const billId = params.id as string;
  const { bill, addParticipant, removeParticipant, addItem, updateTipAndTax, refreshBill, updateEscrowMetadata } = useBill(billId);
  const { address } = useAccount();
  const { sendPayment, isPending, isSuccess, isWrongNetwork, currentChain, hash } = usePayment();
  const { showToast } = useToast();
  const { price: ethPrice, isLoading: isPriceLoading, error: priceError } = useEthPrice();

  const [itemDesc, setItemDesc] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [participantAddress, setParticipantAddress] = useState('');
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [isResolvingParticipant, setIsResolvingParticipant] = useState(false);
  const [tip, setTip] = useState('0');
  const [tax, setTax] = useState('0');
  const [tipMode, setTipMode] = useState<'amount' | 'percent'>('percent');
  const [taxMode, setTaxMode] = useState<'amount' | 'percent'>('percent');
  const [tipPercent, setTipPercent] = useState('15');
  const [taxPercent, setTaxPercent] = useState('10');
  const [hasProcessedShareLink, setHasProcessedShareLink] = useState(false);
  const metadataRegistryEnabled = isMetadataRegistryConfigured();
  const { metadata: chainBillSnapshot, owner: metadataOwner, refetch: refetchMetadata } = useBillMetadata(billId);
  const { isPending: isPublishingMetadata, isConfirming: isConfirmingMetadata, isSuccess: isMetadataPublishedTx, error: publishMetadataError } = usePublishBillMetadata();
  
  // Handler for when bill is published - refresh both bill and metadata
  const handleBillPublished = () => {
    console.log('Bill published! Refreshing metadata...');
    refreshBill();
    refetchMetadata();
  };
  const [hasNotifiedPublishSuccess, setHasNotifiedPublishSuccess] = useState(false);
  const [hasNotifiedPublishError, setHasNotifiedPublishError] = useState(false);
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    participantId: string;
    participantName: string;
  }>({ isOpen: false, participantId: '', participantName: '' });
  const [isBillComplete, setIsBillComplete] = useState(false);
  
  // Get bill status from contract
  const { cancelled, settled } = useEscrowBillInfo(bill?.escrowBillId || '');

  useEffect(() => {
    if (hasProcessedShareLink) return;
    const encoded = searchParams?.get(SHARE_QUERY_PARAM);
    if (!encoded) {
      setHasProcessedShareLink(true);
      return;
    }
    if (typeof window === 'undefined') return;
    setHasProcessedShareLink(true);

    const removeShareParam = () => {
      try {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
      } catch (error) {
        console.error('Failed to cleanup share query param:', error);
      }
    };

    try {
      const decodedBill = decodeBillFromShare(encoded);
      if (!decodedBill) {
        showToast({ message: 'Unable to open shared bill. The link may be corrupted.', type: 'error' });
        removeShareParam();
        return;
      }
      const existingBill = getBillById(decodedBill.id);
      if (!existingBill) {
        saveBill(decodedBill);
        refreshBill();
      }
      removeShareParam();
      if (decodedBill.id !== billId) {
        router.replace(`/bill/${decodedBill.id}`);
      }
    } catch (error) {
      console.error('Failed to process shared bill link:', error);
      showToast({ message: 'Unable to open shared bill. Please request a new link.', type: 'error' });
      removeShareParam();
    }
  }, [searchParams, hasProcessedShareLink, showToast, router, billId, refreshBill]);

  // Load bill from blockchain if not in localStorage
  useEffect(() => {
    if (!bill && chainBillSnapshot) {
      console.log('Loading bill from blockchain metadata:', chainBillSnapshot);
      saveBill(chainBillSnapshot);
      refreshBill();
    }
  }, [bill, chainBillSnapshot, refreshBill]);

  useEffect(() => {
    if (!publishMetadataError || hasNotifiedPublishError) return;
    setHasNotifiedPublishError(true);
    showToast({
      message: publishMetadataError instanceof Error ? publishMetadataError.message : 'Failed to publish share link metadata.',
      type: 'error',
    });
  }, [publishMetadataError, hasNotifiedPublishError, showToast]);

  useEffect(() => {
    if (!isMetadataPublishedTx || hasNotifiedPublishSuccess) return;
    setHasNotifiedPublishSuccess(true);
    showToast({ message: 'Share data published onchain. Link is ready!', type: 'success' });
    
    // Refetch immediately and multiple times to ensure blockchain state is updated
    console.log('Transaction confirmed! Starting metadata refresh cycle...');
    refetchMetadata();
    
    const timers = [
      setTimeout(() => {
        console.log('Refetching metadata (attempt 1)...');
        refetchMetadata();
      }, 1000),
      setTimeout(() => {
        console.log('Refetching metadata (attempt 2)...');
        refetchMetadata();
      }, 2000),
      setTimeout(() => {
        console.log('Refetching metadata (attempt 3)...');
        refetchMetadata();
      }, 3000),
      setTimeout(() => {
        console.log('Refetching metadata (attempt 4)...');
        refetchMetadata();
      }, 5000),
    ];
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [isMetadataPublishedTx, hasNotifiedPublishSuccess, showToast, refetchMetadata]);

  useEffect(() => {
    if (isSuccess && hash) {
      showToast({ message: 'Payment confirmed onchain', type: 'success' });
    }
  }, [isSuccess, hash, showToast]);



  const isMetadataPublished = Boolean(metadataOwner && metadataOwner !== '0x0000000000000000000000000000000000000000');
  const isPublishingInFlight = isPublishingMetadata || isConfirmingMetadata;

  // Debug logging
  useEffect(() => {
    console.log('Metadata state:', {
      metadataOwner,
      isMetadataPublished,
      chainBillSnapshot: !!chainBillSnapshot,
    });
  }, [metadataOwner, isMetadataPublished, chainBillSnapshot]);

  // Build share URL - short if published on-chain, long otherwise
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !bill) return '';
    const url = buildShareableBillUrl(bill, window.location.origin, isMetadataPublished);
    console.log('Share URL updated:', { 
      isMetadataPublished, 
      metadataOwner, 
      url,
      isShortUrl: !url.includes('?share=')
    });
    return url;
  }, [bill, isMetadataPublished, metadataOwner]);

  // Show loading state while checking blockchain
  if (!bill) {
    return <BillPageSkeleton isLoading={!chainBillSnapshot} hasMetadata={isMetadataPublished} />;
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const description = itemDesc.trim();
    const amountValue = parseFloat(itemAmount);
    if (!description || Number.isNaN(amountValue)) {
      showToast({ message: 'Please provide a valid description and amount', type: 'error' });
      return;
    }
    addItem(description, amountValue, bill.participants.map((p) => p.id));
    setItemDesc('');
    setItemAmount('');
    showToast({ message: `Added "${description}" for ${formatCurrency(amountValue)}`, type: 'success' });
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantAddress.trim()) return;
    setParticipantError(null);
    setIsResolvingParticipant(true);
    try {
      const resolvedIdentity = await resolveParticipantIdentity(participantAddress, { chain: DEFAULT_CHAIN });
      const result = addParticipant(resolvedIdentity);
      if (!result) {
        setParticipantError('Participant already added to this bill');
        showToast({ message: 'This participant is already part of the bill', type: 'info' });
      } else {
        setParticipantAddress('');
        setParticipantError(null);
        const label = resolvedIdentity.basename || resolvedIdentity.name || `${resolvedIdentity.address.slice(0, 6)}...${resolvedIdentity.address.slice(-4)}`;
        showToast({ message: `Added participant ${label}`, type: 'success' });
      }
    } catch (error) {
      setParticipantError(error instanceof Error ? error.message : 'Unable to add participant');
      showToast({ message: error instanceof Error ? error.message : 'Unable to add participant', type: 'error' });
    } finally {
      setIsResolvingParticipant(false);
    }
  };

  const handleUpdateTipTax = () => {
    const subtotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
    
    let tipValue = 0;
    let taxValue = 0;
    
    if (tipMode === 'percent') {
      const percent = Number.parseFloat(tipPercent) || 0;
      tipValue = (subtotal * percent) / 100;
      setTip(tipValue.toFixed(2));
    } else {
      tipValue = Number.parseFloat(tip) || 0;
    }
    
    if (taxMode === 'percent') {
      const percent = Number.parseFloat(taxPercent) || 0;
      taxValue = (subtotal * percent) / 100;
      setTax(taxValue.toFixed(2));
    } else {
      taxValue = Number.parseFloat(tax) || 0;
    }
    
    updateTipAndTax(tipValue, taxValue);
    showToast({ message: 'Tip and tax updated', type: 'success' });
  };

  const handlePayment = async () => {
    if (!address) {
      showToast({ message: 'Connect your wallet to pay your share', type: 'error' });
      return;
    }
    if (isWrongNetwork) {
      showToast({ message: 'Please switch to Base Sepolia to complete the payment', type: 'error' });
      return;
    }
    const shares = calculateParticipantShares(bill);
    const myShare = shares.find(s => {
      const participant = bill.participants.find(p => p.id === s.participantId);
      return participant?.address === address;
    });
    if (myShare && myShare.amount > 0) {
      if (isPriceLoading) {
        showToast({ message: 'Fetching live ETH price. Please try again in a moment.', type: 'info' });
        return;
      }
      if (!ethPrice) {
        showToast({ message: priceError?.message ?? 'Unable to fetch live ETH price. Check your connection and try again.', type: 'error' });
        return;
      }
      const ethAmount = myShare.amount / ethPrice;
      try {
        await sendPayment(bill.createdBy, ethAmount);
        showToast({ message: `Payment submitted: ${ethAmount.toFixed(6)} ETH`, type: 'success' });
      } catch (error) {
        showToast({ message: error instanceof Error ? error.message : 'Payment failed. Please try again.', type: 'error' });
      }
    } else {
      showToast({ message: 'You have no outstanding balance on this bill', type: 'info' });
    }
  };

  const shares = calculateParticipantShares(bill);
  const myShare = address ? shares.find(s => {
    const participant = bill.participants.find(p => p.id === s.participantId);
    return participant?.address === address;
  }) : null;
  const subtotal = bill.items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal + bill.tip + bill.tax;

  return (
    <div className="retro-body" style={{ minHeight: '100vh', padding: '20px', paddingBottom: '60px' }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
        gap: '16px' 
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Add Item */}
          <div className="retro-window">
            <div className="retro-title-bar">
              <div className="retro-title-text">
                <span>➕ Add Item</span>
              </div>
            </div>
            <div className="retro-content">
              <form onSubmit={handleAddItem}>
                <div style={{ marginBottom: '8px' }}>
                  <label className="retro-label">Description:</label>
                  <input type="text" className="retro-input" style={{ width: '100%' }} value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Item description" required />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label className="retro-label">Amount ($):</label>
                  <input type="number" inputMode="decimal" step="0.01" className="retro-input" style={{ width: '100%' }} value={itemAmount} onChange={(e) => setItemAmount(e.target.value)} placeholder="0.00" required />
                </div>
                <button type="submit" className="retro-button" style={{ width: '100%' }}>Add Item</button>
              </form>
            </div>
          </div>

          {/* Add Participant */}
          <div className="retro-window">
            <div className="retro-title-bar">
              <div className="retro-title-text">
                <span>👥 Add Participant</span>
              </div>
            </div>
            <div className="retro-content">
              <form onSubmit={handleAddParticipant}>
                <div style={{ marginBottom: '8px' }}>
                  <label className="retro-label">Wallet Address:</label>
                  <input type="text" className="retro-input" style={{ width: '100%' }} value={participantAddress} onChange={(e) => setParticipantAddress(e.target.value)} placeholder="0x... or basename" required />
                </div>
                {participantError && (
                  <div style={{ marginBottom: '8px', fontSize: '10px', color: '#ff0000' }}>{participantError}</div>
                )}
                <button type="submit" disabled={isResolvingParticipant || !!bill.escrowBillId} className="retro-button" style={{ width: '100%' }}>
                  {isResolvingParticipant ? 'Resolving...' : 'Add Participant'}
                </button>
                {bill.escrowBillId && (
                  <div style={{ marginTop: '8px', fontSize: '10px', color: '#666', textAlign: 'center' }}>
                    ⚠️ Cannot add/remove participants after escrow activation
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Tip & Tax */}
          <div className="retro-window">
            <div className="retro-title-bar">
              <div className="retro-title-text">
                <span>💰 Tip & Tax</span>
              </div>
            </div>
            <div className="retro-content">
              {/* Tip Section */}
              <div className="retro-group" style={{ marginBottom: '12px' }}>
                <div className="retro-group-title">Tip</div>
                
                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    <input
                      type="radio"
                      name="tipMode"
                      checked={tipMode === 'percent'}
                      onChange={() => setTipMode('percent')}
                      style={{ cursor: 'pointer' }}
                    />
                    Percent (%)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    <input
                      type="radio"
                      name="tipMode"
                      checked={tipMode === 'amount'}
                      onChange={() => setTipMode('amount')}
                      style={{ cursor: 'pointer' }}
                    />
                    Amount ($)
                  </label>
                </div>

                {tipMode === 'percent' ? (
                  <>
                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>Tip:</span>
                      <strong>{tipPercent}%</strong>
                    </div>
                    <input
                      type="range"
                      className="retro-slider"
                      min="0"
                      max="30"
                      step="1"
                      value={tipPercent}
                      onChange={(e) => setTipPercent(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666', marginTop: '2px' }}>
                      <span>0%</span>
                      <span>15%</span>
                      <span>30%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="retro-label">Amount ($):</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      className="retro-input"
                      style={{ width: '100%' }}
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      placeholder="0.00"
                    />
                  </>
                )}
              </div>

              {/* Tax Section */}
              <div className="retro-group" style={{ marginBottom: '12px' }}>
                <div className="retro-group-title">Tax</div>
                
                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    <input
                      type="radio"
                      name="taxMode"
                      checked={taxMode === 'percent'}
                      onChange={() => setTaxMode('percent')}
                      style={{ cursor: 'pointer' }}
                    />
                    Percent (%)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
                    <input
                      type="radio"
                      name="taxMode"
                      checked={taxMode === 'amount'}
                      onChange={() => setTaxMode('amount')}
                      style={{ cursor: 'pointer' }}
                    />
                    Amount ($)
                  </label>
                </div>

                {taxMode === 'percent' ? (
                  <>
                    <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span>Tax:</span>
                      <strong>{taxPercent}%</strong>
                    </div>
                    <input
                      type="range"
                      className="retro-slider"
                      min="0"
                      max="25"
                      step="0.5"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666', marginTop: '2px' }}>
                      <span>0%</span>
                      <span>12.5%</span>
                      <span>25%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <label className="retro-label">Amount ($):</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      className="retro-input"
                      style={{ width: '100%' }}
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="0.00"
                    />
                  </>
                )}
              </div>

              <button onClick={handleUpdateTipTax} className="retro-button" style={{ width: '100%' }}>
                Apply Tip & Tax
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Bill Summary */}
          <div className="retro-window">
            <div className="retro-title-bar">
              <div className="retro-title-text">
                <span>
                  {cancelled ? '❌' : isBillComplete || settled ? '✅' : '📋'} {bill.title}
                </span>
              </div>
              <div className="retro-controls">
                <button className="retro-control-btn" onClick={() => router.push('/')}>✕</button>
              </div>
            </div>
            <div className="retro-content">
              {/* Escrow Status */}
              {bill.escrowEnabled && (
                <div style={{ marginBottom: '12px' }}>
                  {bill.escrowBillId ? (
                    <>
                      <div style={{ 
                        background: cancelled ? '#ffe0e0' : (isBillComplete || settled) ? '#e0ffe0' : '#ffffff',
                        border: cancelled ? '2px solid #ff0000' : (isBillComplete || settled) ? '2px solid #00ff00' : '1px solid #808080',
                        padding: '8px',
                        fontSize: '11px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px' }}>
                            {cancelled ? '❌' : (isBillComplete || settled) ? '🎉' : '🔒'}
                          </span>
                          <strong>
                            {cancelled 
                              ? 'Bill Cancelled - Refunds Available' 
                              : (isBillComplete || settled) 
                                ? 'Bill Complete!' 
                                : 'Escrow Protection Active'
                            }
                          </strong>
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                          {cancelled
                            ? 'Bill has been cancelled. Participants who paid can claim refunds below.'
                            : (isBillComplete || settled)
                              ? 'All funds collected and transferred to bill creator.'
                              : 'Funds secured in smart contract until all participants pay.'
                          }
                        </div>
                        <div style={{ fontSize: '10px', color: '#0000ff', marginBottom: '6px' }}>
                          Bill ID: {bill.escrowBillId.slice(0, 10)}...{bill.escrowBillId.slice(-8)}
                        </div>
                        <EscrowPaymentProgress
                          escrowBillId={bill.escrowBillId}
                          participants={bill.participants}
                          onAllPaid={() => setIsBillComplete(true)}
                        />
                      </div>
                      
                      {/* Deadline Display */}
                      <div style={{ marginBottom: '12px' }}>
                        <EscrowDeadlineDisplay escrowBillId={bill.escrowBillId} />
                      </div>
                      
                      {/* Refund Claim Button (for participants) */}
                      {address && (
                        <div style={{ marginBottom: '12px' }}>
                          <RefundClaimButton escrowBillId={bill.escrowBillId} />
                        </div>
                      )}
                      
                      {/* Management Panel (for creator) */}
                      <div style={{ marginBottom: '12px' }}>
                        <EscrowManagementPanel
                          escrowBillId={bill.escrowBillId}
                          creatorAddress={bill.createdBy}
                        />
                      </div>
                    </>
                  ) : (
                    <div style={{ 
                      background: '#ffff00',
                      border: '2px solid #ff8800',
                      padding: '8px',
                      fontSize: '11px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px' }}>⚠️</span>
                        <strong>Escrow Not Activated</strong>
                      </div>
                      <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                        Add all items and participants, then activate escrow to secure payments onchain.
                      </div>
                      <ActivateEscrowButton 
                        bill={bill} 
                        onActivated={refreshBill}
                        updateEscrowMetadata={updateEscrowMetadata}
                        ethPrice={ethPrice}
                        isPriceLoading={isPriceLoading}
                        priceError={priceError}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="retro-group" style={{ marginBottom: '12px' }}>
                <div className="retro-group-title">Items</div>
                {bill.items.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', padding: '8px' }}>No items yet</div>
                ) : (
                  <table className="retro-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td style={{ textAlign: 'right' }}>${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Totals */}
              <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tip:</span>
                  <span>${bill.tip.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Tax:</span>
                  <span>${bill.tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #808080', paddingTop: '4px', marginTop: '4px' }}>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Participants */}
              <div className="retro-group" style={{ marginBottom: '12px' }}>
                <div className="retro-group-title">Participants ({bill.participants.length})</div>
                {bill.participants.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', padding: '8px' }}>No participants yet</div>
                ) : (
                  <div className="retro-list">
                    {bill.participants.map((participant) => {
                      const share = shares.find(s => s.participantId === participant.id);
                      const participantName = participant.basename || participant.name || `${participant.address.slice(0, 6)}...${participant.address.slice(-4)}`;
                      const isCreator = participant.address.toLowerCase() === bill.createdBy.toLowerCase();
                      const canRemove = !isCreator && !bill.escrowBillId;
                      
                      // Show payment status for escrow bills
                      if (bill.escrowEnabled && bill.escrowBillId) {
                        return (
                          <ParticipantPaymentStatus
                            key={participant.id}
                            escrowBillId={bill.escrowBillId}
                            participantAddress={participant.address}
                            participantName={participantName}
                            amount={share?.amount || 0}
                          />
                        );
                      }
                      
                      // Regular display for non-escrow bills
                      return (
                        <div key={participant.id} className="retro-list-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {participantName}
                            {isCreator && <span style={{ fontSize: '10px', color: '#666', marginLeft: '4px' }}>(creator)</span>}
                          </span>
                          <span style={{ fontWeight: 'bold', minWidth: '60px', textAlign: 'right' }}>${share?.amount.toFixed(2) || '0.00'}</span>
                          <span style={{ width: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {canRemove && (
                              <button
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    participantId: participant.id,
                                    participantName,
                                  });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '0',
                                  fontSize: '14px',
                                  color: '#ff0000',
                                  cursor: 'pointer',
                                  lineHeight: '1',
                                  width: '16px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title="Remove participant"
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Section */}
              {isWrongNetwork && address && !cancelled && (
                <div style={{ background: '#ffff00', border: '2px solid #ff0000', padding: '8px', marginBottom: '12px', fontSize: '11px', textAlign: 'center' }}>
                  ⚠️ Wrong Network: {currentChain?.name || 'Unknown'}
                  <br />
                  Please switch to Base Sepolia testnet
                </div>
              )}

              {/* Show payment button only if bill is not cancelled and not complete */}
              {address && !isWrongNetwork && !cancelled && !isBillComplete && !settled && myShare && myShare.amount > 0 && (
                <>
                  {bill.escrowEnabled && bill.escrowBillId ? (
                    <div>
                      <div style={{ background: '#ffffff', border: '1px solid #808080', padding: '8px', marginBottom: '8px', fontSize: '11px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔒 Escrow Payment</div>
                        <div>You will pay: <strong>${myShare.amount.toFixed(2)} USD</strong></div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Exact ETH amount from contract</div>
                      </div>
                      <EscrowPaymentButton escrowBillId={bill.escrowBillId} amount={myShare.amount} disabled={!address || isWrongNetwork} />
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: '#ffffff', border: '1px solid #808080', padding: '8px', marginBottom: '8px', fontSize: '11px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>💸 Direct Payment</div>
                        <div>
                          You will pay: <strong>{ethPrice && !isPriceLoading ? `${(myShare.amount / ethPrice).toFixed(6)} ETH` : isPriceLoading ? 'Fetching price...' : 'Price unavailable'}</strong>
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                          {ethPrice && !isPriceLoading ? `≈ $${myShare.amount.toFixed(2)} @ $${ethPrice.toFixed(2)}/ETH` : isPriceLoading ? 'Syncing live ETH price...' : priceError?.message || 'Unable to load live ETH price.'}
                        </div>
                      </div>
                      <button onClick={handlePayment} disabled={!address || isPending || isPriceLoading || !ethPrice} className="retro-button" style={{ width: '100%' }}>
                        {isPending ? 'Processing...' : isSuccess ? 'Paid ✓' : !ethPrice ? 'Price Unavailable' : 'Pay My Share'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {address && !isWrongNetwork && !cancelled && (!myShare || myShare.amount <= 0) && !isBillComplete && !settled && (
                <div style={{ background: '#ffffff', border: '1px solid #808080', padding: '8px', fontSize: '11px', textAlign: 'center', color: '#666' }}>
                  ℹ️ You have no outstanding balance
                </div>
              )}

              {/* Bill Complete or Cancelled Actions */}
              {(isBillComplete || settled || cancelled) && (
                <button 
                  onClick={() => router.push('/')}
                  className="retro-button" 
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  ← Back to Home
                </button>
              )}

              {!address && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ 
                    background: '#ffff00', 
                    border: '2px solid #ff8800', 
                    padding: '8px', 
                    marginBottom: '8px', 
                    fontSize: '11px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>⚠️ Wallet Not Connected</div>
                    <div style={{ fontSize: '10px' }}>Connect your wallet to pay your share</div>
                  </div>
                  <AppKitButton />
                </div>
              )}
            </div>
          </div>

          {/* Share Link */}
          {shareUrl && (
            <div className="retro-window">
              <div className="retro-title-bar">
                <div className="retro-title-text">
                  <span>🔗 Share Bill</span>
                </div>
              </div>
              <div className="retro-content">
                {/* QR Code Toggle Button */}
                <button 
                  onClick={() => setIsQrExpanded(!isQrExpanded)}
                  className="retro-button" 
                  style={{ width: '100%', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <span>{isQrExpanded ? '▼' : '▶'}</span>
                  <span>{isQrExpanded ? 'Hide QR Code' : 'Show QR Code'}</span>
                </button>

                {/* QR Code - Collapsible */}
                {isQrExpanded && (
                  <>
                    <div style={{ 
                      background: '#ffffff', 
                      border: '2px inset #808080',
                      padding: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        background: '#ffffff',
                        padding: '8px',
                        border: '1px solid #000000'
                      }}>
                        <QRCode
                          value={shareUrl}
                          size={160}
                          level="M"
                          style={{ display: 'block' }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginBottom: '12px' }}>
                      Scan QR code to open bill
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '8px' }}>
                  <label className="retro-label">Share URL:</label>
                  <input
                    type="text"
                    className="retro-input"
                    style={{ width: '100%' }}
                    value={shareUrl}
                    readOnly
                    onClick={(e) => {
                      e.currentTarget.select();
                      navigator.clipboard.writeText(shareUrl);
                      showToast({ message: 'Link copied!', type: 'success' });
                    }}
                  />
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
                  Click to copy. Share this link with participants.
                  {shareUrl.includes('?share=') && (
                    <div style={{ color: '#ff8800', marginTop: '4px' }}>
                      ⚠️ Long URL - publish on-chain to shorten
                    </div>
                  )}
                  {!shareUrl.includes('?share=') && isMetadataPublished && (
                    <div style={{ color: '#008000', marginTop: '4px' }}>
                      ✓ Short URL - published on-chain
                    </div>
                  )}
                </div>
                {metadataRegistryEnabled && !isMetadataPublished && !isPublishingInFlight && (
                  <PublishBillButton bill={bill} onPublished={handleBillPublished} />
                )}
                
                {metadataRegistryEnabled && isPublishingInFlight && (
                  <div style={{ background: '#ffffcc', border: '1px solid #ff8800', padding: '8px', fontSize: '11px', marginBottom: '12px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '4px' }}>⏳ Publishing...</div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      Link will shorten automatically after confirmation
                    </div>
                  </div>
                )}
                
                {metadataRegistryEnabled && isMetadataPublished && (
                  <>
                    <div style={{ background: '#e0ffe0', border: '1px solid #008000', padding: '8px', fontSize: '11px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                        <strong>Published Onchain</strong>
                      </div>
                      <div style={{ fontSize: '10px', color: '#666' }}>
                        Bill data is permanently stored in blockchain. Link is shortened.
                      </div>
                    </div>
                    
                    <AccessControlPanel billId={billId} />
                    
                    <BillRating billId={billId} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <RetroConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Confirm Removal"
        message={
          <>
            Remove <strong>{confirmDialog.participantName}</strong> from this bill?
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
              This action cannot be undone.
            </div>
          </>
        }
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={() => {
          const success = removeParticipant(confirmDialog.participantId);
          if (success) {
            showToast({ message: `Removed ${confirmDialog.participantName}`, type: 'success' });
          } else {
            showToast({ message: 'Cannot remove participant', type: 'error' });
          }
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, participantId: '', participantName: '' })}
      />
    </div>
  );
}


function BillPageSkeleton({ isLoading, hasMetadata }: { isLoading: boolean; hasMetadata: boolean }) {
  const router = useRouter();
  
  return (
    <div className="retro-body" style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
        <div className="retro-window" style={{ display: 'inline-block', minWidth: '300px' }}>
          <div className="retro-title-bar">
            <div className="retro-title-text">
              <span>{isLoading ? '⏳ Loading...' : '❌ Not Found'}</span>
            </div>
          </div>
          <div className="retro-content" style={{ padding: '40px', fontSize: '11px' }}>
            {isLoading ? (
              <>
                <div style={{ marginBottom: '12px' }}>Loading bill data...</div>
                {hasMetadata && (
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    Found on-chain metadata, loading...
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ marginBottom: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  Bill not found
                </div>
                <div style={{ marginBottom: '16px', color: '#666' }}>
                  This bill doesn&apos;t exist or hasn&apos;t been shared with you.
                </div>
                <button 
                  onClick={() => router.push('/')}
                  className="retro-button"
                  style={{ width: '100%' }}
                >
                  ← Back to Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
