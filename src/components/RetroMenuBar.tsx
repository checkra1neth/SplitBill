'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useToast } from '@/lib/providers/ToastProvider';

interface MenuItem {
  label: string;
  onClick?: () => void;
  separator?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

interface MenuBarProps {
  onNewBill?: () => void;
}

export function RetroMenuBar({ onNewBill }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { showToast } = useToast();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  const handleMenuClick = (menuName: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom });
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    setActiveMenu(null);
  };

  const menus: Record<string, MenuItem[]> = {
    File: [
      {
        label: 'New Bill',
        onClick: () => {
          if (onNewBill) {
            onNewBill();
          } else {
            router.push('/');
            setTimeout(() => {
              document.getElementById('create-bill-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        },
        shortcut: 'Ctrl+N',
      },
      {
        label: 'Open Bill',
        onClick: () => {
          const billId = prompt('Enter Bill ID:');
          if (billId) {
            router.push(`/bill/${billId}`);
          }
        },
        shortcut: 'Ctrl+O',
      },
      { separator: true, label: '' },
      {
        label: 'My Bills',
        onClick: () => {
          router.push('/');
          setTimeout(() => {
            document.getElementById('user-bills-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
        disabled: !isConnected,
      },
      { separator: true, label: '' },
      {
        label: 'Exit',
        onClick: () => {
          if (confirm('Close SplitBill?')) {
            window.close();
          }
        },
        shortcut: 'Alt+F4',
      },
    ],
    Edit: [
      {
        label: 'Copy Bill Link',
        onClick: () => {
          navigator.clipboard.writeText(window.location.href);
          showToast({ message: 'Link copied to clipboard!', type: 'success' });
        },
        shortcut: 'Ctrl+C',
      },
      { separator: true, label: '' },
      {
        label: 'Preferences',
        onClick: () => {
          open({ view: 'Account' });
        },
        disabled: !isConnected,
      },
    ],
    View: [
      {
        label: 'Refresh',
        onClick: () => {
          window.location.reload();
        },
        shortcut: 'F5',
      },
      { separator: true, label: '' },
      {
        label: 'My Stats',
        onClick: () => {
          router.push('/');
          setTimeout(() => {
            document.getElementById('user-stats-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
        disabled: !isConnected,
      },
      {
        label: 'Search Bills',
        onClick: () => {
          router.push('/');
          setTimeout(() => {
            document.getElementById('search-bills-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
      },
    ],
    Help: [
      {
        label: 'Documentation',
        onClick: () => {
          window.open('https://github.com/checkra1neth/SplitBill#readme', '_blank');
        },
        shortcut: 'F1',
      },
      {
        label: 'GitHub Repository',
        onClick: () => {
          window.open('https://github.com/checkra1neth/SplitBill', '_blank');
        },
      },
      { separator: true, label: '' },
      {
        label: 'About Base',
        onClick: () => {
          window.open('https://base.org', '_blank');
        },
      },
      {
        label: 'About SplitBill',
        onClick: () => {
          showToast({
            message: 'SplitBill v1.0 - Built on Base Sepolia',
            type: 'info',
          });
        },
      },
    ],
  };

  return (
    <div ref={menuRef}>
      {/* Menu Bar */}
      <div className="retro-menu-bar">
        {Object.keys(menus).map((menuName) => (
          <div
            key={menuName}
            className="retro-menu-item"
            onClick={(e) => handleMenuClick(menuName, e)}
            style={{
              background: activeMenu === menuName ? '#000080' : 'transparent',
              color: activeMenu === menuName ? '#ffffff' : '#000000',
            }}
          >
            {menuName}
          </div>
        ))}
      </div>

      {/* Dropdown Menu */}
      {activeMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            minWidth: '200px',
            background: '#c0c0c0',
            border: '2px outset #ffffff',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            zIndex: 1000,
            padding: '2px',
          }}
        >
          {menus[activeMenu].map((item, index) => {
            if (item.separator) {
              return (
                <div
                  key={index}
                  style={{
                    height: '1px',
                    background: '#808080',
                    margin: '2px 4px',
                    borderTop: '1px solid #ffffff',
                  }}
                />
              );
            }

            return (
              <div
                key={index}
                onClick={() => !item.disabled && handleMenuItemClick(item.onClick)}
                style={{
                  padding: '4px 8px',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: item.disabled ? '#808080' : '#000000',
                  opacity: item.disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.background = '#000080';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = item.disabled ? '#808080' : '#000000';
                }}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span style={{ fontSize: '9px', marginLeft: '16px', opacity: 0.7 }}>
                    {item.shortcut}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
