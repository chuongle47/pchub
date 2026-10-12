import { NextResponse } from 'next/server';
import { CONTACT_CONFIG } from '@/lib/contactConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Only return buttons that have non-empty value and are enabled
    const activeButtons = CONTACT_CONFIG.buttons.filter(
      b => b.enabled && b.value && b.value.trim().length > 0
    );

    return NextResponse.json({
      success: true,
      enabled: CONTACT_CONFIG.enabled,
      position: CONTACT_CONFIG.position,
      hotline: CONTACT_CONFIG.hotline,
      hotlineDisplay: CONTACT_CONFIG.hotlineDisplay,
      zalo: CONTACT_CONFIG.zalo,
      address: CONTACT_CONFIG.address,
      workingHours: CONTACT_CONFIG.workingHours,
      buttons: activeButtons,
      showrooms: CONTACT_CONFIG.showrooms,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Cannot load contact configuration',
    }, { status: 500 });
  }
}
