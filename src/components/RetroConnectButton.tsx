'use client';

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export function RetroConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const handleClick = () => {
    open();
  };

  return (
    <button
      onClick={handleClick}
      className="retro-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        minWidth: '120px',
        justifyContent: 'center',
      }}
    >
      {isConnected ? (
        <>
          <span>💼</span>
          <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </>
      ) : (
        <>
          <span>🔌</span>
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
}
