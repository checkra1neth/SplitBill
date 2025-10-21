'use client';

import { FaGithub, FaTelegram, FaGlobe } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiFarcaster, SiDevdotto } from 'react-icons/si';
import { RiNftFill } from 'react-icons/ri';
import type { IconType } from 'react-icons';

interface RetroFooterProps {
    className?: string;
    style?: React.CSSProperties;
}

export function RetroFooter({ className, style }: RetroFooterProps) {
    const socialLinks: Array<{ icon: IconType; label: string; url: string }> = [
        { icon: FaGithub, label: 'GitHub', url: 'https://github.com/checkra1neth' },
        { icon: FaXTwitter, label: 'X/Twitter', url: 'https://x.com/checkra1neth' },
        { icon: SiFarcaster, label: 'Farcaster', url: 'https://farcaster.xyz/checkra1n.eth' },
        { icon: RiNftFill, label: 'Zora', url: 'https://zora.co/@checkra1n' },
        { icon: FaTelegram, label: 'Telegram', url: 'https://t.me/suncrypt_org' },
        { icon: SiDevdotto, label: 'Devfolio', url: 'https://devfolio.co/@checkra1n' },
    ];

    return (
        <div
            className={className}
            style={{
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #ffffff',
                ...style,
            }}
        >
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {socialLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                        <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.label}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                background: '#c0c0c0',
                                border: '2px outset #ffffff',
                                borderRadius: '0',
                                color: '#000080',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                boxShadow: '1px 1px 0 #000000',
                            }}
                            onMouseDown={(e) => {
                                e.currentTarget.style.border = '2px inset #808080';
                                e.currentTarget.style.boxShadow = 'inset 1px 1px 0 #000000';
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.border = '2px outset #ffffff';
                                e.currentTarget.style.boxShadow = '1px 1px 0 #000000';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.border = '2px outset #ffffff';
                                e.currentTarget.style.boxShadow = '1px 1px 0 #000000';
                            }}
                        >
                            <IconComponent size={16} />
                        </a>
                    );
                })}
            </div>

            {/* Built on Base */}
            <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    border: '2px inset #808080',
                    padding: '6px 12px',
                    textDecoration: 'none',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#000000',
                    fontWeight: 'bold',
                    boxShadow: 'inset 1px 1px 0 #000000',
                    transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e0e0e0';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                }}
            >
                <span style={{ fontSize: '10px', color: '#666' }}>built on</span>
                <span
                    style={{
                        background: '#0052ff',
                        color: '#ffffff',
                        padding: '2px 8px',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                    }}
                >
                    BASE
                </span>
            </a>
        </div>
    );
}
