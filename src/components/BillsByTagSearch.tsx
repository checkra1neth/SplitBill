'use client';

import { useState } from 'react';
import { useBillsByTag, useBillMetadata } from '@/features/bill/hooks/useBillMetadata';
import Link from 'next/link';

function SearchResultItem({ billId }: { billId: string }) {
  const { metadata, isLoading } = useBillMetadata(billId, true);

  // Don't show anything while loading - just skip
  if (isLoading || !metadata) {
    return null;
  }

  const billLink = metadata.id || billId;
  const displayId = billId.slice(0, 10) + '...' + billId.slice(-8);

  return (
    <div className="retro-list-item">
      <Link
        href={`/bill/${billLink}`}
        style={{ color: '#0000ff', textDecoration: 'underline', fontSize: '11px' }}
      >
        {metadata.title || 'Untitled Bill'} ({displayId})
      </Link>
    </div>
  );
}

const POPULAR_TAGS = [
  'restaurant',
  'cafe',
  'groceries',
  'shopping',
  'travel',
  'entertainment',
  'utilities',
  'friends',
  'business',
];

export function BillsByTagSearch() {
  const [selectedTag, setSelectedTag] = useState('');
  const { billIds } = useBillsByTag(selectedTag);

  return (
    <div className="retro-group">
      <div className="retro-group-title">🔍 Search Bills by Tag</div>
      <div style={{ padding: '12px' }}>
        {/* Tag selection */}
        <div style={{ marginBottom: '12px' }}>
          <label className="retro-label">Select a tag:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {POPULAR_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '4px 12px',
                  fontSize: '11px',
                  background: selectedTag === tag ? '#000080' : '#c0c0c0',
                  color: selectedTag === tag ? '#ffffff' : '#000000',
                  border: '2px solid',
                  borderColor: selectedTag === tag ? '#000080' : '#808080',
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Custom tag input */}
        <div style={{ marginBottom: '12px' }}>
          <label className="retro-label">Or enter custom tag:</label>
          <input
            type="text"
            className="retro-input"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            placeholder="Enter tag name"
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>

        {/* Results */}
        {selectedTag && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#000080' }}>
              Bills tagged with &quot;{selectedTag}&quot;:
            </div>

            {billIds.length === 0 ? (
              <div 
                style={{ 
                  fontSize: '11px', 
                  color: '#666',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#ffffff',
                  border: '2px inset #808080',
                  minHeight: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '24px' }}>🔍</div>
                <div style={{ fontWeight: 'bold' }}>No bills found with this tag</div>
                <div style={{ fontSize: '10px' }}>Try a different tag or create a bill with this tag</div>
              </div>
            ) : (
              <div className="retro-list" style={{ maxHeight: '200px', minHeight: '100px', overflow: 'auto' }}>
                {billIds.map(id => (
                  <SearchResultItem key={id} billId={id} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
