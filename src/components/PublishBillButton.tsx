'use client';

import { useState, useEffect } from 'react';
import { Bill } from '@/lib/types/bill';
import { usePublishBillMetadata } from '@/features/bill/hooks/useBillMetadata';
import { useToast } from '@/lib/providers/ToastProvider';

interface PublishBillButtonProps {
  bill: Bill;
  onPublished?: () => void;
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

export function PublishBillButton({ bill, onPublished }: PublishBillButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasHandledSuccess, setHasHandledSuccess] = useState(false);
  const { publish, isPending, isSuccess } = usePublishBillMetadata();
  const { showToast } = useToast();

  const handlePublish = async () => {
    try {
      setHasHandledSuccess(false); // Reset flag before publishing
      await publish(bill, {
        tags: selectedTags,
        isPrivate,
      });
      
      showToast({
        message: 'Publishing... confirm in your wallet',
        type: 'info',
      });
    } catch (error) {
      console.error('Failed to publish bill:', error);
      showToast({
        message: 'Failed to publish bill',
        type: 'error',
      });
    }
  };

  // Handle success
  useEffect(() => {
    console.log('PublishBillButton state:', { isSuccess, hasHandledSuccess, isPending });
    
    if (isSuccess && !hasHandledSuccess) {
      console.log('Publishing successful! Calling onPublished callback...');
      setHasHandledSuccess(true);
      
      showToast({
        message: 'Bill published on-chain successfully!',
        type: 'success',
      });
      
      setShowDialog(false);
      onPublished?.();
    }
  }, [isSuccess, hasHandledSuccess, isPending, showToast, onPublished]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags(prev => [...prev, customTag]);
      setCustomTag('');
    }
  };

  if (!showDialog) {
    return (
      <button
        onClick={() => setShowDialog(true)}
        className="retro-button"
        style={{ width: '100%' }}
      >
        📤 Publish On-Chain
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="retro-window"
        style={{ maxWidth: '500px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}
      >
        <div className="retro-title-bar">
          <div className="retro-title-text">Publish Bill On-Chain</div>
          <div className="retro-controls">
            <button className="retro-control-btn" onClick={() => setShowDialog(false)}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '16px' }}>
          {/* Tags */}
          <div style={{ marginBottom: '16px' }}>
            <label className="retro-label">Tags (select up to 5):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    background: selectedTags.includes(tag) ? '#000080' : '#c0c0c0',
                    color: selectedTags.includes(tag) ? '#ffffff' : '#000000',
                    border: '2px solid',
                    borderColor: selectedTags.includes(tag) ? '#000080' : '#808080',
                    cursor: 'pointer',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom tag */}
          <div style={{ marginBottom: '16px' }}>
            <label className="retro-label">Custom tag:</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                className="retro-input"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                placeholder="Enter custom tag"
                style={{ flex: 1 }}
                disabled={selectedTags.length >= 5}
              />
              <button
                onClick={addCustomTag}
                className="retro-button"
                disabled={!customTag || selectedTags.length >= 5}
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                Selected: {selectedTags.join(', ')}
              </div>
            </div>
          )}

          {/* Privacy */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="retro-checkbox"
                checked={isPrivate}
                onChange={e => setIsPrivate(e.target.checked)}
              />
              <span className="retro-label" style={{ margin: 0 }}>
                Make this bill private
              </span>
            </label>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', marginLeft: '24px' }}>
              {isPrivate
                ? 'Only you and people you grant access can view this bill'
                : 'Anyone can view this bill on-chain'}
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              background: '#ffffcc',
              border: '1px solid #808080',
              padding: '8px',
              fontSize: '10px',
              marginBottom: '16px',
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              💡 Publishing on-chain costs gas (~$0.02) but makes your bill permanent and verifiable.
            </div>
            <div style={{ color: '#0000ff' }}>
              🔗 Your share link will automatically shorten after publishing!
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePublish}
              disabled={isPending}
              className="retro-button"
              style={{ flex: 1 }}
            >
              {isPending ? 'Publishing...' : '📤 Publish'}
            </button>
            <button onClick={() => setShowDialog(false)} className="retro-button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
