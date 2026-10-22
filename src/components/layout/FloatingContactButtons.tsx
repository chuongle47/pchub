'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  ExternalLink,
  Globe,
  ChevronUp,
  X,
  Headphones,
} from 'lucide-react';
import {
  CONTACT_CONFIG,
  ContactButton,
  DEFAULT_CONTACT_SETTINGS,
  ContactSettings,
} from '@/lib/contactConfig';

// Official Vector SVG Icon for Zalo (Sharp at any DPI, authentic brand geometry)
function ZaloIcon({ size = 24 }: { size?: number }) {
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
      <path
        d="M18 4C9.716 4 3 10.18 3 17.8c0 4.15 1.98 7.88 5.12 10.45l-1.32 3.86a.8.8 0 0 0 1.03.99l5.02-2.12c1.6.53 3.33.82 5.15.82 8.284 0 15-6.18 15-13.8S26.284 4 18 4z"
        fill="#ffffff"
      />
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

function TelegramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" style={{ display: 'block' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" style={{ display: 'block' }}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.97.58 3.84 1.68 5.43L2 22l4.82-1.74c1.53.96 3.31 1.48 5.22 1.48 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.67 0-3.23-.48-4.57-1.31l-.33-.2-3.34 1.2.9-3.25-.22-.35a8.16 8.16 0 01-1.28-4.33c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.19-8.2 8.19z" />
      <path d="M16.8 14.18c-.26-.13-1.53-.76-1.77-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.08-.4-2.07-1.28-.76-.68-1.28-1.52-1.43-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.33-.02-.46-.06-.13-.59-1.42-.8-1.95-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.46.06-.7.33-.24.26-.92.9-.92 2.2 0 1.29.94 2.54 1.07 2.71.13.17 1.86 2.84 4.5 3.98.63.27 1.12.44 1.5.56.63.2 1.2.17 1.65.1.5-.07 1.53-.62 1.74-1.23.21-.6.21-1.12.15-1.23-.06-.11-.2-.18-.46-.31z" />
    </svg>
  );
}

function RenderButtonIcon({ type, size }: { type: string; size: number }) {
  switch (type) {
    case 'phone':
      return <Phone size={size} strokeWidth={2.4} className="pchub-phone-icon" />;
    case 'zalo':
      return <ZaloIcon size={size + 2} />;
    case 'messenger':
      return <MessengerIcon size={size} />;
    case 'telegram':
      return <TelegramIcon size={size} />;
    case 'whatsapp':
      return <WhatsAppIcon size={size} />;
    case 'email':
      return <Mail size={size} strokeWidth={2.2} />;
    case 'sms':
      return <MessageSquare size={size} strokeWidth={2.2} />;
    case 'map':
      return <MapPin size={size} strokeWidth={2.2} />;
    case 'link':
    default:
      return <Globe size={size} strokeWidth={2.2} />;
  }
}

export default function FloatingContactButtons() {
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const [buttons, setButtons] = useState<ContactButton[]>(
    CONTACT_CONFIG.buttons.filter(b => b.enabled && b.value && b.value.trim().length > 0)
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDelayedReady, setIsDelayedReady] = useState(true);

  const fetchLatest = () => {
    fetch('/api/contact-buttons?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (data && data.success) {
          if (Array.isArray(data.buttons)) {
            setButtons(data.buttons);
          }
          if (data.settings && typeof data.settings === 'object') {
            setSettings(prev => ({
              ...prev,
              ...data.settings,
              enabled: typeof data.settings.enabled !== 'undefined' ? Boolean(data.settings.enabled) : prev.enabled,
              position: data.settings.position === 'left' ? 'left' : 'right',
            }));
          } else if (data.position || typeof data.enabled !== 'undefined') {
            setSettings(prev => ({
              ...prev,
              position: data.position === 'left' ? 'left' : (data.position === 'right' ? 'right' : prev.position),
              enabled: typeof data.enabled !== 'undefined' ? Boolean(data.enabled) : prev.enabled,
            }));
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLatest();
    // Auto sync poll every 8 seconds to reflect immediate admin changes without full page reload
    const interval = setInterval(fetchLatest, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll listener for Scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 220);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle display delay
  useEffect(() => {
    if (settings.delay > 0) {
      setIsDelayedReady(false);
      const timer = setTimeout(() => setIsDelayedReady(true), settings.delay * 1000);
      return () => clearTimeout(timer);
    } else {
      setIsDelayedReady(true);
    }
  }, [settings.delay]);

  if (!settings.enabled || !isDelayedReady || buttons.length === 0) {
    return null;
  }

  const isLeft = settings.position === 'left';
  const isSquare = settings.shape === 'square';
  const isExpandLayout = settings.layout === 'expand';
  const btnSize = Math.max(36, Math.min(90, settings.size || 52));
  const iconSize = Math.max(16, Math.round(btnSize * 0.44));
  const borderRadius = isSquare ? `${Math.max(8, Math.round(btnSize * 0.22))}px` : '50%';
  const mainColor = settings.main_color || '#e11d48';

  // Khi ở bên phải, tự động nâng container lên trên nút Chat AI (nút Chat AI ở bottom: 22px, cao 54px -> đỉnh ở 76px)
  // để các nút liên hệ và nút Chat AI xếp dọc hoàn hảo, không bao giờ che khuất nhau!
  const desktopBottom = isLeft
    ? `${settings.bottom}px`
    : `calc(${settings.bottom}px + 68px)`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style jsx global>{`
        @keyframes phoneRingShake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-14deg); }
          20%, 40% { transform: rotate(14deg); }
          50% { transform: rotate(0deg); }
        }

        @keyframes launcherPulseRing {
          0% { box-shadow: 0 0 0 0 ${mainColor}99; }
          70% { box-shadow: 0 0 0 14px ${mainColor}00; }
          100% { box-shadow: 0 0 0 0 ${mainColor}00; }
        }

        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pchub-floating-contact-container {
          position: fixed;
          ${isLeft ? `left: ${settings.side}px; right: auto;` : `right: ${settings.side}px; left: auto;`}
          bottom: ${desktopBottom};
          z-index: ${settings.z_index || 999};
          display: flex;
          flex-direction: column;
          align-items: ${isLeft ? 'flex-start' : 'flex-end'};
          pointer-events: auto;
          transition: left 0.3s ease, right 0.3s ease, bottom 0.3s ease;
        }

        /* Device visibility filters */
        ${settings.devices === 'desktop' ? `
          @media (max-width: 768px) {
            .pchub-floating-contact-container, .pchub-mobile-bar-container {
              display: none !important;
            }
          }
        ` : ''}

        ${settings.devices === 'mobile' ? `
          @media (min-width: 769px) {
            .pchub-floating-contact-container, .pchub-mobile-bar-container {
              display: none !important;
            }
          }
        ` : ''}

        .pchub-floating-contact-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: ${isLeft ? 'flex-start' : 'flex-end'};
          transition: all 0.25s ease;
        }

        /* Main launcher toggle button */
        .pchub-contact-launcher-btn {
          width: ${btnSize}px;
          height: ${btnSize}px;
          border-radius: ${borderRadius};
          background: ${mainColor};
          color: #ffffff;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 16px ${mainColor}66;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
          ${settings.pulse ? 'animation: launcherPulseRing 2s infinite;' : ''}
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .pchub-contact-launcher-btn:hover {
          transform: scale(1.08);
        }

        /* Scroll-to-top button */
        .pchub-scroll-top-btn {
          width: ${Math.max(38, Math.round(btnSize * 0.85))}px;
          height: ${Math.max(38, Math.round(btnSize * 0.85))}px;
          border-radius: ${borderRadius};
          background: ${mainColor};
          color: #ffffff;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.92;
        }

        .pchub-scroll-top-btn:hover {
          opacity: 1;
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
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
          width: ${btnSize}px;
          height: ${btnSize}px;
          border-radius: ${borderRadius};
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

        .pchub-contact-btn-phone:hover .pchub-phone-icon {
          animation: phoneRingShake 0.8s ease-in-out infinite;
        }

        /* Hover Tooltip */
        .pchub-contact-tooltip {
          position: absolute;
          ${isLeft ? `left: calc(100% + 12px); right: auto;` : `right: calc(100% + 12px); left: auto;`}
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
          transform: ${isLeft ? 'translateX(-8px)' : 'translateX(8px)'};
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pchub-contact-btn:hover .pchub-contact-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* Mobile specific styles */
        @media (max-width: 768px) {
          ${settings.mobile_bar ? `
            .pchub-floating-contact-container {
              display: none !important;
            }

            .pchub-mobile-bar-container {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              z-index: ${settings.z_index || 9999};
              display: flex;
              align-items: center;
              justify-content: space-around;
              background: rgba(15, 23, 42, 0.95);
              backdrop-filter: blur(12px);
              border-top: 1px solid rgba(255, 255, 255, 0.12);
              padding: 8px 6px calc(8px + env(safe-area-inset-bottom, 0px));
              box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.35);
            }

            .pchub-mobile-bar-item {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 4px;
              color: #ffffff;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
              padding: 4px 2px;
              text-align: center;
              min-width: 0;
            }

            .pchub-mobile-bar-icon-wrap {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
            }
          ` : `
            .pchub-floating-contact-container {
              ${isLeft ? 'left: 14px !important;' : 'right: 14px !important;'}
              bottom: calc(${Math.max(76, settings.bottom + 58)}px + env(safe-area-inset-bottom, 0px)) !important;
            }

            .pchub-floating-contact-stack {
              display: ${isExpandLayout ? (isExpanded ? 'flex' : 'none') : 'flex'} !important;
              gap: 10px !important;
              margin-bottom: 8px;
              animation: fadeInSlideUp 0.2s ease-out forwards;
            }

            .pchub-contact-tooltip {
              display: none !important;
            }
          `}
        }
      `}</style>

      {/* Floating Buttons Widget */}
      <div
        className={`pchub-floating-contact-container ${isLeft ? 'pchub-position-left' : 'pchub-position-right'}`}
        style={{
          position: 'fixed',
          left: isLeft ? `${settings.side}px` : 'auto',
          right: isLeft ? 'auto' : `${settings.side}px`,
          bottom: desktopBottom,
          zIndex: settings.z_index || 999,
          alignItems: isLeft ? 'flex-start' : 'flex-end',
        }}
        role="complementary"
        aria-label="Kênh liên hệ nhanh"
      >
        {/* Buttons List / Stack */}
        {(!isExpandLayout || isExpanded) && (
          <div
            className="pchub-floating-contact-stack"
            style={{
              alignItems: isLeft ? 'flex-start' : 'flex-end',
            }}
          >
            {buttons.map(btn => (
              <a
                key={btn.id}
                href={btn.href}
                target={btn.openNewTab ? '_blank' : '_self'}
                rel={btn.openNewTab ? 'noopener noreferrer' : undefined}
                className={`pchub-contact-btn pchub-contact-btn-${btn.type}`}
                aria-label={`${btn.label}: ${btn.value}`}
                title={`${btn.label}: ${btn.value}`}
              >
                {settings.tooltip && (
                  <div
                    className="pchub-contact-tooltip"
                    style={{
                      left: isLeft ? 'calc(100% + 12px)' : 'auto',
                      right: isLeft ? 'auto' : 'calc(100% + 12px)',
                    }}
                  >
                    <span>
                      {btn.label}: <strong>{btn.value}</strong>
                    </span>
                  </div>
                )}
                <div
                  className="pchub-contact-btn-circle"
                  style={{
                    background: btn.color || '#2563eb',
                    boxShadow: `0 4px 16px ${btn.color ? btn.color + '66' : 'rgba(0,0,0,0.25)'}`,
                  }}
                >
                  <RenderButtonIcon type={btn.type} size={iconSize} />
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Collapsible Launcher Toggle Button (shown when layout === 'expand') */}
        {isExpandLayout && (
          <button
            type="button"
            className="pchub-contact-launcher-btn"
            onClick={() => setIsExpanded(v => !v)}
            aria-label={isExpanded ? 'Đóng liên hệ nhanh' : 'Mở kênh tư vấn'}
            title={isExpanded ? 'Đóng' : 'Liên hệ tư vấn'}
          >
            {isExpanded ? (
              <X size={iconSize} strokeWidth={2.5} />
            ) : (
              <Headphones size={iconSize} strokeWidth={2.4} />
            )}
          </button>
        )}

        {/* Scroll-to-top Button (if enabled in settings and page scrolled down) */}
        {settings.scroll_top && showScrollTop && (
          <button
            type="button"
            className="pchub-scroll-top-btn"
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            title="Cuộn lên đầu trang"
          >
            <ChevronUp size={Math.max(18, Math.round(iconSize * 1.1))} strokeWidth={2.6} />
          </button>
        )}
      </div>

      {/* Mobile Bottom Fixed Bar (rendered if mobile_bar is turned ON in settings) */}
      {settings.mobile_bar && (
        <div className="pchub-mobile-bar-container" role="navigation" aria-label="Thanh liên hệ di động">
          {buttons.map(btn => (
            <a
              key={'m-bar-' + btn.id}
              href={btn.href}
              target={btn.openNewTab ? '_blank' : '_self'}
              rel={btn.openNewTab ? 'noopener noreferrer' : undefined}
              className="pchub-mobile-bar-item"
              title={`${btn.label}: ${btn.value}`}
            >
              <div
                className="pchub-mobile-bar-icon-wrap"
                style={{
                  background: btn.color || mainColor,
                }}
              >
                <RenderButtonIcon type={btn.type} size={18} />
              </div>
              <span className="truncate max-w-[70px]">{btn.label}</span>
            </a>
          ))}
          {settings.scroll_top && showScrollTop && (
            <button
              type="button"
              className="pchub-mobile-bar-item cursor-pointer border-none bg-transparent"
              onClick={scrollToTop}
              title="Lên đầu trang"
            >
              <div
                className="pchub-mobile-bar-icon-wrap"
                style={{
                  background: mainColor,
                }}
              >
                <ChevronUp size={18} strokeWidth={2.5} />
              </div>
              <span>Lên đầu</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

