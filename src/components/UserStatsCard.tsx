'use client';

import { useUserStats } from '@/features/bill/hooks/useBillMetadata';
import { formatEther } from 'viem';

interface UserStatsCardProps {
  address: string;
}

export function UserStatsCard({ address }: UserStatsCardProps) {
  const { stats, isLoading } = useUserStats(address);

  if (isLoading) {
    return (
      <div className="retro-group">
        <div className="retro-group-title">User Statistics</div>
        <div style={{ padding: '8px', fontSize: '11px' }}>Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="retro-group">
      <div className="retro-group-title">📊 User Statistics</div>
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Total Bills */}
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
              Total Bills
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.totalBills}</div>
          </div>

          {/* Total Amount */}
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
              Total Volume
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ${parseFloat(formatEther(stats.totalAmount)).toFixed(2)}
            </div>
          </div>

          {/* Last Activity */}
          <div>
            <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
              Last Activity
            </div>
            <div style={{ fontSize: '11px' }}>
              {stats.lastActivity > 0
                ? new Date(stats.lastActivity * 1000).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
