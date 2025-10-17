'use client';

import { useState, useMemo } from 'react';
import { useUserBills, useBillMetadata } from '@/features/bill/hooks/useBillMetadata';
import Link from 'next/link';

interface UserBillsListProps {
  address: string;
}

function BillCard({ billId }: { billId: string }) {
  const { metadata, tags, isPrivate, rating } = useBillMetadata(billId);

  // Don't show loading state for individual cards - just skip if not loaded yet
  if (!metadata) {
    return null;
  }

  // Convert billId (bytes32) to original UUID
  // For now, just show the hash
  const displayId = billId.slice(0, 10) + '...' + billId.slice(-8);

  return (
    <div
      className="retro-list-item"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
      }}
    >
      {/* Title and link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <Link
            href={`/bill/${billId}`}
            style={{
              color: '#0000ff',
              textDecoration: 'underline',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {metadata.title || 'Untitled Bill'}
          </Link>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px', fontFamily: 'monospace' }}>
            {displayId}
          </div>
        </div>

        {/* Privacy badge */}
        {isPrivate && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              background: '#ffcccc',
              border: '1px solid #ff0000',
            }}
          >
            🔒 Private
          </span>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                background: '#e0e0e0',
                border: '1px solid #808080',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Rating */}
      {rating && rating.count > 0 && (
        <div style={{ fontSize: '10px', color: '#666' }}>
          ⭐ {rating.average.toFixed(1)} ({rating.count} rating{rating.count !== 1 ? 's' : ''})
        </div>
      )}

      {/* Total */}
      {metadata.items && metadata.items.length > 0 && (
        <div style={{ fontSize: '10px', color: '#666' }}>
          Total: $
          {(
            metadata.items.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0) +
            (metadata.tip || 0) +
            (metadata.tax || 0)
          ).toFixed(2)}
        </div>
      )}
    </div>
  );
}

export function UserBillsList({ address }: UserBillsListProps) {
  const { billIds, isLoading } = useUserBills(address);
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');

  // Get unique tags from all bills (would need to fetch metadata for each)
  const availableTags = useMemo(() => {
    // This is a simplified version - in production, you'd fetch all bills' tags
    return ['restaurant', 'cafe', 'groceries', 'shopping', 'travel'];
  }, []);

  const filteredBillIds = useMemo(() => {
    if (!filterTag) return billIds;
    // In production, filter by actually checking bill tags
    return billIds;
  }, [billIds, filterTag]);

  if (isLoading) {
    return (
      <div className="retro-group">
        <div className="retro-group-title">📋 My Bills</div>
        <div style={{ padding: '12px', fontSize: '11px' }}>Loading your bills...</div>
      </div>
    );
  }

  return (
    <div className="retro-group">
      <div className="retro-group-title">📋 My Bills ({billIds.length})</div>
      <div style={{ padding: '12px' }}>
        {/* Filters */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Tag filter */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="retro-label" style={{ fontSize: '10px' }}>
              Filter by tag:
            </label>
            <select
              className="retro-input"
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="">All tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="retro-label" style={{ fontSize: '10px' }}>
              Sort by:
            </label>
            <select
              className="retro-input"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'rating')}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="date">Date (newest first)</option>
              <option value="rating">Rating (highest first)</option>
            </select>
          </div>
        </div>

        {/* Bills list */}
        {filteredBillIds.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#666',
              background: '#f0f0f0',
              border: '1px solid #808080',
            }}
          >
            <div style={{ marginBottom: '8px' }}>📭</div>
            <div>No bills published yet</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              Create a bill and publish it on-chain to see it here
            </div>
          </div>
        ) : (
          <div className="retro-list" style={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredBillIds.map(billId => (
              <BillCard key={billId} billId={billId} />
            ))}
          </div>
        )}

        {/* Info */}
        <div
          style={{
            marginTop: '12px',
            fontSize: '10px',
            color: '#666',
            borderTop: '1px solid #808080',
            paddingTop: '8px',
          }}
        >
          💡 Only bills published on-chain are shown here
        </div>
      </div>
    </div>
  );
}
