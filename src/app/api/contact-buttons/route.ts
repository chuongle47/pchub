import { NextResponse } from 'next/server';
import { CONTACT_CONFIG, ContactButton, DEFAULT_CONTACT_SETTINGS, ContactSettings } from '@/lib/contactConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Global runtime state in memory so changes made via POST /api/contact-buttons take effect immediately
let runtimeButtons: ContactButton[] = [...CONTACT_CONFIG.buttons];
let runtimeHotline: string = CONTACT_CONFIG.hotline;
let runtimeZalo: string = CONTACT_CONFIG.zalo;
let runtimeAddress: string = CONTACT_CONFIG.address;
let runtimeSettings: ContactSettings = { ...DEFAULT_CONTACT_SETTINGS };
let lastWpFetch = 0;

export async function GET() {
  try {
    // Attempt live fetch from WordPress REST API (nks-contact-buttons plugin)
    const wpBase = process.env.SBUY_BASE_URL || 'https://sbuy.io.vn';
    const now = Date.now();
    // Cache for 3 seconds to avoid duplicate fetches during parallel client calls
    if (now - lastWpFetch > 3000) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const wpRes = await fetch(`${wpBase}/wp-json/ncb/v1/buttons`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
          next: { revalidate: 0 },
        });
        clearTimeout(timeoutId);

        if (wpRes.ok) {
          const wpData = await wpRes.json();
          lastWpFetch = now;
          if (wpData && wpData.success) {
            if (Array.isArray(wpData.buttons) && wpData.buttons.length > 0) {
              runtimeButtons = wpData.buttons;
            }
            if (wpData.settings && typeof wpData.settings === 'object') {
              const s = wpData.settings;
              runtimeSettings = {
                enabled: typeof s.enabled !== 'undefined' ? Boolean(Number(s.enabled)) : true,
                position: s.position === 'left' ? 'left' : 'right',
                bottom: typeof s.bottom !== 'undefined' ? Number(s.bottom) : 20,
                side: typeof s.side !== 'undefined' ? Number(s.side) : 16,
                size: typeof s.size !== 'undefined' ? Number(s.size) : 52,
                shape: s.shape === 'square' ? 'square' : 'round',
                layout: s.layout === 'expand' ? 'expand' : 'list',
                main_color: s.main_color || '#e11d48',
                pulse: typeof s.pulse !== 'undefined' ? Boolean(Number(s.pulse)) : true,
                tooltip: typeof s.tooltip !== 'undefined' ? Boolean(Number(s.tooltip)) : true,
                devices: ['all', 'desktop', 'mobile'].includes(s.devices) ? s.devices : 'all',
                delay: typeof s.delay !== 'undefined' ? Number(s.delay) : 0,
                scroll_top: typeof s.scroll_top !== 'undefined' ? Boolean(Number(s.scroll_top)) : true,
                mobile_bar: typeof s.mobile_bar !== 'undefined' ? Boolean(Number(s.mobile_bar)) : false,
                z_index: typeof s.z_index !== 'undefined' ? Number(s.z_index) : 9999,
                exclude: s.exclude || '',
              };
            } else if (wpData.position || typeof wpData.enabled !== 'undefined') {
              runtimeSettings.position = wpData.position === 'left' ? 'left' : 'right';
              if (typeof wpData.enabled !== 'undefined') {
                runtimeSettings.enabled = Boolean(wpData.enabled);
              }
            }
          }
        }
      } catch {
        // WordPress API not ready or timeout, use memory / config fallback
      }
    }

    // Only return buttons that have non-empty value and are enabled
    const activeButtons = runtimeButtons.filter(
      b => b.enabled && b.value && b.value.trim().length > 0
    );

    return NextResponse.json({
      success: true,
      enabled: runtimeSettings.enabled,
      position: runtimeSettings.position,
      settings: runtimeSettings,
      hotline: runtimeHotline,
      hotlineDisplay: runtimeHotline.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'),
      zalo: runtimeZalo,
      address: runtimeAddress,
      workingHours: CONTACT_CONFIG.workingHours,
      buttons: activeButtons,
      showrooms: CONTACT_CONFIG.showrooms,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Cannot load contact configuration',
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (Array.isArray(body.buttons)) {
      runtimeButtons = body.buttons.map((b: any, index: number) => ({
        id: b.id || `btn-${index}`,
        type: b.type || 'phone',
        label: b.label || 'Liên hệ',
        sublabel: b.sublabel || b.value || '',
        value: b.value || '',
        href: b.href || (b.type === 'phone' ? `tel:${b.value}` : b.type === 'zalo' ? `https://zalo.me/${b.value}` : `https://m.me/${b.value}`),
        color: b.color || '#2563eb',
        openNewTab: b.openNewTab !== false,
        enabled: b.enabled !== false,
      }));
    }

    if (body.settings && typeof body.settings === 'object') {
      const s = body.settings;
      runtimeSettings = {
        enabled: typeof s.enabled !== 'undefined' ? Boolean(Number(s.enabled)) : runtimeSettings.enabled,
        position: s.position === 'left' ? 'left' : (s.position === 'right' ? 'right' : runtimeSettings.position),
        bottom: typeof s.bottom !== 'undefined' ? Number(s.bottom) : runtimeSettings.bottom,
        side: typeof s.side !== 'undefined' ? Number(s.side) : runtimeSettings.side,
        size: typeof s.size !== 'undefined' ? Number(s.size) : runtimeSettings.size,
        shape: s.shape === 'square' ? 'square' : 'round',
        layout: s.layout === 'expand' ? 'expand' : 'list',
        main_color: s.main_color || runtimeSettings.main_color,
        pulse: typeof s.pulse !== 'undefined' ? Boolean(Number(s.pulse)) : runtimeSettings.pulse,
        tooltip: typeof s.tooltip !== 'undefined' ? Boolean(Number(s.tooltip)) : runtimeSettings.tooltip,
        devices: ['all', 'desktop', 'mobile'].includes(s.devices) ? s.devices : runtimeSettings.devices,
        delay: typeof s.delay !== 'undefined' ? Number(s.delay) : runtimeSettings.delay,
        scroll_top: typeof s.scroll_top !== 'undefined' ? Boolean(Number(s.scroll_top)) : runtimeSettings.scroll_top,
        mobile_bar: typeof s.mobile_bar !== 'undefined' ? Boolean(Number(s.mobile_bar)) : runtimeSettings.mobile_bar,
        z_index: typeof s.z_index !== 'undefined' ? Number(s.z_index) : runtimeSettings.z_index,
        exclude: s.exclude || '',
      };
    } else {
      if (typeof body.enabled !== 'undefined') runtimeSettings.enabled = Boolean(body.enabled);
      if (body.position) runtimeSettings.position = body.position === 'left' ? 'left' : 'right';
    }

    if (body.hotline) runtimeHotline = body.hotline;
    if (body.zalo) runtimeZalo = body.zalo;
    if (body.address) runtimeAddress = body.address;

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình nút liên hệ thành công!',
      enabled: runtimeSettings.enabled,
      position: runtimeSettings.position,
      settings: runtimeSettings,
      buttons: runtimeButtons.filter(b => b.enabled && b.value && b.value.trim().length > 0),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật cấu hình',
    }, { status: 400 });
  }
}

