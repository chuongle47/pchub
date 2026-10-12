import { NextResponse } from 'next/server';
import { CONTACT_CONFIG, ContactButton } from '@/lib/contactConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Global runtime state in memory so changes made via POST /api/contact-buttons take effect immediately
let runtimeButtons: ContactButton[] = [...CONTACT_CONFIG.buttons];
let runtimeHotline: string = CONTACT_CONFIG.hotline;
let runtimeZalo: string = CONTACT_CONFIG.zalo;
let runtimeAddress: string = CONTACT_CONFIG.address;

export async function GET() {
  try {
    // Only return buttons that have non-empty value and are enabled
    const activeButtons = runtimeButtons.filter(
      b => b.enabled && b.value && b.value.trim().length > 0
    );

    return NextResponse.json({
      success: true,
      enabled: CONTACT_CONFIG.enabled,
      position: CONTACT_CONFIG.position,
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

    if (body.hotline) runtimeHotline = body.hotline;
    if (body.zalo) runtimeZalo = body.zalo;
    if (body.address) runtimeAddress = body.address;

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình nút liên hệ thành công!',
      buttons: runtimeButtons.filter(b => b.enabled && b.value && b.value.trim().length > 0),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật cấu hình',
    }, { status: 400 });
  }
}
