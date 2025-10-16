'use client';

import { ReactNode } from 'react';

interface RetroConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function RetroConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: RetroConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}
        onClick={onCancel}
      />

      {/* Dialog Window */}
      <div
        className="retro-window"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          maxWidth: '90vw',
          zIndex: 10000,
        }}
      >
        <div className="retro-title-bar">
          <div className="retro-title-text">
            <span>⚠️ {title}</span>
          </div>
          <div className="retro-controls">
            <button className="retro-control-btn" onClick={onCancel}>
              ✕
            </button>
          </div>
        </div>

        <div className="retro-content">
          <div style={{ marginBottom: '16px', fontSize: '11px' }}>
            {message}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              className="retro-button"
              onClick={onCancel}
              style={{ minWidth: '80px' }}
            >
              {cancelText}
            </button>
            <button
              className="retro-button"
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              style={{ 
                minWidth: '80px', 
                background: '#c00000',
                color: '#ffffff',
                fontWeight: 'bold',
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
