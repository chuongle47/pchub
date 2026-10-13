'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { CONTACT_CONFIG, ContactButton } from '@/lib/contactConfig';

// Official Vector SVG Icon for Zalo (Sharp at any DPI, authentic brand geometry)
function ZaloIcon({ size = 26 }: { size?: number }) {
  const zaloPath =
    'M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9453 0 1.0746.8697 1.9453 1.945 1.9453z';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* Speech bubble in pure white */}
      <path
        d="M18 4C9.716 4 3 10.18 3 17.8c0 4.15 1.98 7.88 5.12 10.45l-1.32 3.86a.8.8 0 0 0 1.03.99l5.02-2.12c1.6.53 3.33.82 5.15.82 8.284 0 15-6.18 15-13.8S26.284 4 18 4z"
        fill="#ffffff"
      />
      {/* Official Zalo brand vector - centered with exact brand geometry */}
      <g transform="translate(6, 5.8)">
        <path d={zaloPath} fill="#0068ff" />
      </g>
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
