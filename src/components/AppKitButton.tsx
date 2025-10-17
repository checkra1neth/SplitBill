'use client';

import { useAppKitAccount } from '@reown/appkit/react';
import { useEffect } from 'react';
import { modal } from '@/lib/config/appkit';

export function AppKitButton() {
  const { address, isConnected } = useAppKitAccount();

  // Debug logging
  useEffect(() => {
    console.log('AppKitButton status:', { address, isConnected });
    console.log('Modal instance:', modal);
  }, [address, isConnected]);

  const handleOpen = async () => {
    console.log('Opening AppKit modal...');
    try {
      await modal.open();
      console.log('Modal opened successfully');
    } catch (error) {
      console.error('Failed to open AppKit modal:', error);
    }
  };

  if (isConnected && address) {
    return (
      <div className="retro-status-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
        <span style={{ color: 'green', fontSize: '10px' }}>
          ✓ {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          type="button"
          className="retro-button"
          style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px', cursor: 'pointer', position: 'relative', zIndex: 1 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Change button clicked');
            handleOpen();
          }}
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
        style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px', cursor: 'pointer', position: 'relative', zIndex: 1 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Connect button clicked');
          handleOpen();
        }}
      >
        Connect
      </button>
    </div>
  );
}
