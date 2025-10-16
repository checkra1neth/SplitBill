'use client';

import { useState, useCallback, ReactNode } from 'react';
import { RetroConfirmDialog } from '@/components/RetroConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export function useRetroConfirm() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string | ReactNode;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: 'Confirm',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title || 'Confirm',
        message: options.message,
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          resolve(true);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmDialog = useCallback(
    () => (
      <RetroConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={handleCancel}
      />
    ),
    [dialogState, handleCancel]
  );

  return { confirm, ConfirmDialog };
}
