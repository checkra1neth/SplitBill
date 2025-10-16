'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/utils/analytics';
import { formatEthAmount, formatGwei } from '@/lib/utils/formatNumber';

interface GasEstimateDisplayProps {
  gasCostEth: string | null;
  gasPriceGwei: number | null;
  isHighGasPrice: boolean;
  isLoading?: boolean;
}

/**
 * Component to display gas cost estimates and warnings
 */
export function GasEstimateDisplay({
  gasCostEth,
  gasPriceGwei,
  isHighGasPrice,
  isLoading,
}: GasEstimateDisplayProps) {
  const hasTrackedView = useRef(false);

  // Track gas estimate view (once per mount)
  useEffect(() => {
    if (!hasTrackedView.current && gasCostEth && gasPriceGwei) {
      trackEvent('gas_estimate_viewed', {
        gasCostEth,
        gasPriceGwei,
        isHighGasPrice,
      });
      hasTrackedView.current = true;
    }
  }, [gasCostEth, gasPriceGwei, isHighGasPrice]);

  if (isLoading) {
    return (
      <div style={{ background: '#ffffff', border: '1px solid #808080', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '12px', height: '12px', border: '2px solid #808080', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div>Estimating gas cost...</div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!gasCostEth || !gasPriceGwei) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Gas cost display */}
      <div style={{ background: '#ffffff', border: '1px solid #808080', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Estimated Gas Cost:</span>
          <strong>~{formatEthAmount(parseFloat(gasCostEth))} ETH</strong>
        </div>
        <div style={{ fontSize: '10px', color: '#666' }}>
          Current gas price: {formatGwei(gasPriceGwei)} gwei
        </div>
      </div>

      {/* High gas price warning */}
      {isHighGasPrice && (
        <div style={{ background: '#ffff00', border: '2px solid #ff8800', padding: '8px', fontSize: '11px', fontFamily: '"MS Sans Serif", sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                High Gas Prices Detected
              </div>
              <div style={{ fontSize: '10px' }}>
                Gas prices are currently elevated. Consider waiting for lower prices to save on transaction costs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
