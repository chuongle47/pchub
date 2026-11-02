import { NextResponse } from 'next/server';
import { CONTACT_CONFIG, ContactButton, DEFAULT_CONTACT_SETTINGS, ContactSettings } from '@/lib/contactConfig';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let runtimeButtons: ContactButton[] = [...CONTACT_CONFIG.buttons];
let runtimeHotline: string = CONTACT_CONFIG.hotline;
let runtimeZalo: string = CONTACT_CONFIG.zalo;
let runtimeAddress: string = CONTACT_CONFIG.address;
let runtimeSettings: ContactSettings = { ...DEFAULT_CONTACT_SETTINGS };

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: dbSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'contact_buttons')
      .maybeSingle();

    if (dbSetting?.value) {
      const val = typeof dbSetting.value === 'string' ? JSON.parse(dbSetting.value) : dbSetting.value;
      if (val.buttons) runtimeButtons = val.buttons;
      if (val.settings) runtimeSettings = { ...runtimeSettings, ...val.settings };
    }

    return NextResponse.json({
      success: true,
      buttons: runtimeButtons,
      hotline: runtimeHotline,
      zalo: runtimeZalo,
      address: runtimeAddress,
      settings: runtimeSettings,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      buttons: runtimeButtons,
      hotline: runtimeHotline,
      zalo: runtimeZalo,
      address: runtimeAddress,
      settings: runtimeSettings,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buttons, hotline, zalo, address, settings } = body;

    if (Array.isArray(buttons)) {
      runtimeButtons = buttons;
    }
    if (hotline) runtimeHotline = hotline;
    if (zalo) runtimeZalo = zalo;
    if (address) runtimeAddress = address;
    if (settings && typeof settings === 'object') {
      runtimeSettings = { ...runtimeSettings, ...settings };
    }

    // Lưu vào Supabase settings
    try {
      const supabase = await createClient();
      await supabase.from('settings').upsert({
        key: 'contact_buttons',
        value: {
          buttons: runtimeButtons,
          hotline: runtimeHotline,
          zalo: runtimeZalo,
          address: runtimeAddress,
          settings: runtimeSettings,
        },
        description: 'Cấu hình các nút liên hệ nổi',
      });
    } catch (dbErr) {
      console.warn('Lưu settings Supabase warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình nút liên hệ thành công!',
      buttons: runtimeButtons,
      settings: runtimeSettings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
