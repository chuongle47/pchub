'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { CONTACT_CONFIG, ContactButton } from '@/lib/contactConfig';

// Custom SVG Icon for Zalo
function ZaloIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path
        d="M24 4C12.954 4 4 12.06 4 22c0 5.46 2.76 10.36 7.24 13.72L9.5 43.5l8.52-4.48C20.24 39.68 22.08 40 24 40c11.046 4 20-4.06 20-14s-8.954-18-20-18z"
        fill="white"
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="15"
        fill="#0068ff"
      >
        Zalo
      </text>
    </svg>
  );
}

function MessengerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.734 7.202V22l3.414-1.874c.91.252 1.872.388 2.852.388 5.523 0 10-4.145 10-9.256C22 6.145 17.523 2 12 2zm1.066 12.518l-2.73-2.912-5.328 2.912 5.86-6.223 2.798 2.912 5.26-2.912-5.86 6.223z" />
    </svg>
  );
}

export default function FloatingContactButtons() {
  const [buttons, setButtons] = useState<ContactButton[]>(
    CONTACT_CONFIG.buttons.filter(b => b.enabled && b.value && b.value.trim().length > 0)
  );

  const fetchLatest = () => {
    fetch('/api/contact-buttons?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.buttons)) {
          setButtons(data.buttons);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLatest();
    // Auto sync poll every 10 seconds to reflect immediate admin changes without full page reload
    const interval = setInterval(fetchLatest, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!CONTACT_CONFIG.enabled || buttons.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes pulseGlowCustom {
          0% {
            box-shadow: 0 0 0 0 rgba(112, 10, 41, 0.7);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(112, 10, 41, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(112, 10, 41, 0);
          }
        }

        @keyframes phoneRingShake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-14deg); }
          20%, 40% { transform: rotate(14deg); }
          50% { transform: rotate(0deg); }
        }

        .pchub-floating-contact-stack {
          position: fixed;
          right: 22px;
          bottom: 86px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .pchub-floating-contact-stack {
            right: 14px !important;
            bottom: calc(180px + env(safe-area-inset-bottom, 0px)) !important;
            gap: 10px !important;
          }
        }

        .pchub-contact-btn {
          position: relative;
          display: flex;
          align-items: center;
          text-decoration: none;
          outline: none;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .pchub-contact-btn:hover {
          transform: scale(1.08);
        }

        .pchub-contact-btn-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          border: 2.5px solid #ffffff;
          position: relative;
          flex-shrink: 0;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        @media (max-width: 768px) {
          .pchub-contact-btn-circle {
            width: 46px !important;
            height: 46px !important;
          }
        }

        .pchub-contact-btn-phone:hover .pchub-phone-icon {
          animation: phoneRingShake 0.8s ease-in-out infinite;
        }

        .pchub-contact-tooltip {
          position: absolute;
          right: 60px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 12.5px;
          font-weight: 700;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pchub-contact-btn:hover .pchub-contact-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 768px) {
          .pchub-contact-tooltip {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="pchub-floating-contact-stack"
        role="complementary"
        aria-label="Kênh liên hệ nhanh"
      >
        {buttons.map(btn => {
          const isPhone = btn.type === 'phone';
          const isZalo = btn.type === 'zalo';
          const isMessenger = btn.type === 'messenger';

          return (
            <a
              key={btn.id}
              href={btn.href}
              target={btn.openNewTab ? '_blank' : '_self'}
              rel={btn.openNewTab ? 'noopener noreferrer' : undefined}
              className={`pchub-contact-btn pchub-contact-btn-${btn.type}`}
              aria-label={`${btn.label}: ${btn.value}`}
              title={`${btn.label}: ${btn.value}`}
            >
              <div className="pchub-contact-tooltip">
                <span>
                  {isPhone && '📞 '}
                  {isZalo && '💬 '}
                  {isMessenger && '⚡ '}
                  {btn.label}: <strong>{btn.value}</strong>
                </span>
              </div>
              <div
                className="pchub-contact-btn-circle"
                style={{
                  background: btn.color || '#2563eb',
                  boxShadow: `0 4px 16px ${btn.color ? btn.color + '66' : 'rgba(0,0,0,0.25)'}`,
                }}
              >
                {isPhone && (
                  <span className="pchub-phone-icon">
                    <Phone size={22} strokeWidth={2.4} />
                  </span>
                )}
                {isZalo && <ZaloIcon size={24} />}
                {isMessenger && <MessengerIcon size={22} />}
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
