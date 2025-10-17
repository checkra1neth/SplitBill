'use client';

import { useState } from 'react';
import { useBillsByTag } from '@/features/bill/hooks/useBillMetadata';
import Link from 'next/link';

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
  const { billIds, isLoading } = useBillsByTag(selectedTag);

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
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>
              Bills tagged with &quot;{selectedTag}&quot;:
            </div>

            {isLoading ? (
              <div style={{ fontSize: '11px', color: '#666' }}>Loading...</div>
            ) : billIds.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#666' }}>No bills found with this tag</div>
            ) : (
              <div className="retro-list" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {billIds.map(id => (
                  <div key={id} className="retro-list-item">
                    <Link
                      href={`/bill/${id}`}
                      style={{ color: '#0000ff', textDecoration: 'underline' }}
                    >
                      {id.slice(0, 10)}...{id.slice(-8)}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
