'use client';

import { useAccount, useDisconnect } from 'wagmi';

declare global {
  interface Window {
    appkit?: {
      open: () => void;
    };
  }
}

export function AppKitButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    if (typeof window !== 'undefined' && window.appkit) {
      window.appkit.open();
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
          style={{ minWidth: 'auto', padding: '2px 8px', fontSize: '10px' }}
          onClick={() => disconnect()}
        >
          Disconnect
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
        onClick={handleConnect}
      >
        Connect
      </button>
    </div>
  );
}
