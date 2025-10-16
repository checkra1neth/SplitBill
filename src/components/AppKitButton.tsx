'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useEffect } from 'react';

export function AppKitButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  // Debug logging
  useEffect(() => {
    console.log('AppKitButton status:', { address, isConnected });
  }, [address, isConnected]);

  if (isConnected && address) {
    return (
      <div className="retro-status-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
        <span style={{ color: 'green', fontSize: '10px' }}>
          ✓ {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          type="button"
          className="retro-button"
          style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px' }}
          onClick={() => open()}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="retro-status-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
      <span style={{ color: 'red', fontSize: '10px' }}>
        ✗ Not Connected
      </span>
      <button
        type="button"
        className="retro-button"
        style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px' }}
        onClick={() => open()}
      >
        Connect
      </button>
    </div>
  );
}
