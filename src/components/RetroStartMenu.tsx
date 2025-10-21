'use client';

import { useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { FaWallet, FaPlus, FaList, FaInfoCircle, FaCog, FaPowerOff, FaMoneyBillWave } from 'react-icons/fa';
import { useAppKit } from '@reown/appkit/react';
import { useToast } from '@/lib/providers/ToastProvider';

interface RetroStartMenuProps {
    isOpen: boolean;
    onClose: () => void;
    startButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function RetroStartMenu({ isOpen, onClose, startButtonRef }: RetroStartMenuProps) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);
    const { open } = useAppKit();
    const { showToast } = useToast();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Don't close if clicking on the Start button or inside the menu
            if (
                menuRef.current && 
                !menuRef.current.contains(target) &&
                startButtonRef?.current &&
                !startButtonRef.current.contains(target)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, startButtonRef]);

    if (!isOpen) return null;

    const handleConnectWallet = () => {
        open();
        onClose();
    };

    const handleCreateBill = () => {
        router.push('/');
        onClose();
    };

    const handleMyBills = () => {
        router.push('/');
        setTimeout(() => {
            document.getElementById('user-bills-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        onClose();
    };

    const menuItems = [
        {
            icon: FaWallet,
            label: isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet',
            onClick: handleConnectWallet,
            separator: true,
        },
        {
            icon: FaPlus,
            label: 'Create New Bill',
            onClick: handleCreateBill,
        },
        {
            icon: FaList,
            label: 'My Bills',
            onClick: handleMyBills,
            disabled: !isConnected,
        },
        {
            icon: FaInfoCircle,
            label: 'About',
            onClick: () => {
                window.open('https://github.com/checkra1neth/SplitBill', '_blank');
                onClose();
            },
        },
        {
            icon: FaCog,
            label: 'Settings',
            onClick: () => {
                open({ view: 'Account' });
                onClose();
            },
            disabled: !isConnected,
            separator: true,
        },
        {
            icon: FaPowerOff,
            label: 'Disconnect',
            onClick: () => {
                disconnect();
                showToast({ message: 'Wallet disconnected', type: 'info' });
                onClose();
            },
            disabled: !isConnected,
        },
    ];

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                bottom: '30px',
                left: '4px',
                width: '200px',
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                zIndex: 1000,
            }}
        >
            {/* Start Menu Header */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #000080, #1084d0)',
                    color: '#ffffff',
                    padding: '8px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                <FaMoneyBillWave size={16} />
                <span>SplitBill</span>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '2px' }}>
                {menuItems.map((item, index) => (
                    <div key={index}>
                        <button
                            onClick={item.onClick}
                            disabled={item.disabled}
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: item.disabled ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
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
                            <item.icon size={14} />
                            <span>{item.label}</span>
                        </button>
                        {item.separator && (
                            <div
                                style={{
                                    height: '1px',
                                    background: '#808080',
                                    margin: '2px 4px',
                                    borderTop: '1px solid #ffffff',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
