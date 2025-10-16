'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastOptions = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastRecord = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
};

const DEFAULT_DURATION = 4000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timeoutId = timersRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ message, type = 'info', duration = DEFAULT_DURATION }: ToastOptions) => {
      if (!message) {
        return '';
      }

      const id = crypto.randomUUID();
      const toast: ToastRecord = {
        id,
        message,
        type,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => dismissToast(id), duration);
        timersRef.current.set(id, timeoutId);
      }

      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      timers.clear();
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      right: '16px', 
      top: '16px', 
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const typeConfig: Record<ToastType, { icon: string; title: string; color: string }> = {
    success: { icon: '✓', title: 'Success', color: '#00ff00' },
    error: { icon: '✕', title: 'Error', color: '#ff0000' },
    info: { icon: 'ℹ', title: 'Information', color: '#0000ff' },
  };

  const config = typeConfig[toast.type];

  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        background: '#c0c0c0',
        borderTop: '2px solid #ffffff',
        borderLeft: '2px solid #ffffff',
        borderRight: '2px solid #000000',
        borderBottom: '2px solid #000000',
        boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.3)',
        fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", sans-serif',
        fontSize: '11px',
        minWidth: '280px',
        animation: 'slideIn 0.2s ease-out'
      }}
    >
      {/* Title Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #000080, #1084d0)',
        color: '#ffffff',
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '20px',
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px' }}>{config.icon}</span>
          <span>{config.title}</span>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          style={{
            width: '16px',
            height: '14px',
            background: '#c0c0c0',
            borderTop: '1px solid #ffffff',
            borderLeft: '1px solid #ffffff',
            borderRight: '1px solid #000000',
            borderBottom: '1px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: 0,
            color: '#000000'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.borderTop = '1px solid #000000';
            e.currentTarget.style.borderLeft = '1px solid #000000';
            e.currentTarget.style.borderRight = '1px solid #ffffff';
            e.currentTarget.style.borderBottom = '1px solid #ffffff';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.borderTop = '1px solid #ffffff';
            e.currentTarget.style.borderLeft = '1px solid #ffffff';
            e.currentTarget.style.borderRight = '1px solid #000000';
            e.currentTarget.style.borderBottom = '1px solid #000000';
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '12px 8px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '24px',
          lineHeight: '1',
          color: config.color,
          fontWeight: 'bold',
          minWidth: '24px',
          textAlign: 'center'
        }}>
          {config.icon}
        </div>
        <p style={{
          margin: 0,
          lineHeight: '1.4',
          color: '#000000',
          flex: 1,
          wordBreak: 'break-word'
        }}>
          {toast.message}
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
