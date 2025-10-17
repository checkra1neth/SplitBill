'use client';

import { useState } from 'react';
import { useBillMetadata, useBillAccess } from '@/features/bill/hooks/useBillMetadata';
import { useToast } from '@/lib/providers/ToastProvider';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';

interface AccessControlPanelProps {
  billId: string;
}

export function AccessControlPanel({ billId }: AccessControlPanelProps) {
  const { isPrivate, owner, isLoading } = useBillMetadata(billId);
  const { grantAccess, revokeAccess, isPending } = useBillAccess();
  const { showToast } = useToast();
  const { address } = useAccount();
  
  const [newUserAddress, setNewUserAddress] = useState('');
  const [grantedUsers, setGrantedUsers] = useState<string[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  const handleGrantAccess = async () => {
    if (!isAddress(newUserAddress)) {
      showToast({
        message: 'Invalid Ethereum address',
        type: 'error',
      });
      return;
    }

    try {
      await grantAccess(billId, newUserAddress);
      setGrantedUsers(prev => [...prev, newUserAddress]);
      setNewUserAddress('');
      showToast({
        message: 'Access granted successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to grant access:', error);
      showToast({
        message: 'Failed to grant access',
        type: 'error',
      });
    }
  };

  const handleRevokeAccess = async (userAddress: string) => {
    try {
      await revokeAccess(billId, userAddress);
      setGrantedUsers(prev => prev.filter(addr => addr !== userAddress));
      showToast({
        message: 'Access revoked successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to revoke access:', error);
      showToast({
        message: 'Failed to revoke access',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <div style={{ fontSize: '11px' }}>Loading...</div>;
  }

  if (!isPrivate) {
    return null; // Only show for private bills
  }

  if (!isOwner) {
    return (
      <div
        style={{
          background: '#ffffcc',
          border: '1px solid #808080',
          padding: '8px',
          fontSize: '11px',
        }}
      >
        🔒 This is a private bill. Only authorized users can view it.
      </div>
    );
  }

  return (
    <div className="retro-group">
      <div className="retro-group-title">
        🔒 Access Control
        <button
          onClick={() => setShowPanel(!showPanel)}
          style={{
            marginLeft: '8px',
            fontSize: '10px',
            padding: '2px 8px',
            background: '#c0c0c0',
            border: '1px solid #808080',
            cursor: 'pointer',
          }}
        >
          {showPanel ? '▼' : '▶'}
        </button>
      </div>

      {showPanel && (
        <div style={{ padding: '12px' }}>
          {/* Info */}
          <div
            style={{
              background: '#e0e0ff',
              border: '1px solid #808080',
              padding: '8px',
              fontSize: '10px',
              marginBottom: '12px',
            }}
          >
            💡 This bill is private. Only users you grant access can view it.
          </div>

          {/* Grant Access */}
          <div style={{ marginBottom: '16px' }}>
            <label className="retro-label">Grant access to user:</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                className="retro-input"
                value={newUserAddress}
                onChange={e => setNewUserAddress(e.target.value)}
                placeholder="0x... or basename.eth"
                style={{ flex: 1 }}
                disabled={isPending}
              />
              <button
                onClick={handleGrantAccess}
                disabled={!newUserAddress || isPending}
                className="retro-button"
              >
                {isPending ? '...' : 'Grant'}
              </button>
            </div>
            {newUserAddress && !isAddress(newUserAddress) && (
              <div style={{ fontSize: '10px', color: '#ff0000', marginTop: '4px' }}>
                ⚠️ Invalid address format
              </div>
            )}
          </div>

          {/* Users with access */}
          <div>
            <label className="retro-label">Users with access:</label>
            {grantedUsers.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                No users granted access yet
              </div>
            ) : (
              <div className="retro-list" style={{ maxHeight: '150px', overflow: 'auto', marginTop: '8px' }}>
                {grantedUsers.map(userAddr => (
                  <div
                    key={userAddr}
                    className="retro-list-item"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>
                      {userAddr.slice(0, 6)}...{userAddr.slice(-4)}
                    </span>
                    <button
                      onClick={() => handleRevokeAccess(userAddr)}
                      disabled={isPending}
                      style={{
                        padding: '2px 8px',
                        fontSize: '10px',
                        background: '#ff6b6b',
                        color: '#ffffff',
                        border: '1px solid #ff0000',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gas info */}
          <div
            style={{
              marginTop: '12px',
              fontSize: '10px',
              color: '#666',
              borderTop: '1px solid #808080',
              paddingTop: '8px',
            }}
          >
            💰 Gas cost: ~$0.005 per grant/revoke
          </div>
        </div>
      )}
    </div>
  );
}
