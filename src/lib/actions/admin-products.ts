'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug không được để trống'),
  sku: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Tồn kho không được âm'),
  warranty_months: z.coerce.number().int().min(0).default(36),
  images: z.array(z.string()).default([]),
  description: z.string().optional().nullable(),
  specs: z.record(z.string(), z.any()).default({}),
  is_hot: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const CategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug không được để trống'),
  icon: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const BrandSchema = z.object({
  name: z.string().min(2, 'Tên hãng phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug không được để trống'),
  logo_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

// Helper for cleaning UUID fields
function cleanUuid(id?: string | null): string | null {
  if (!id || typeof id !== 'string') return null;
  const trimmed = id.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed) ? trimmed : null;
}

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

export async function createProductAction(data: z.infer<typeof ProductSchema>) {
  try {
    const parsed = ProductSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(', ') };
    }
    const validated = parsed.data;
    const supabase = await createClient();

    const { data: created, error } = await supabase
      .from('products')
      .insert({
        ...validated,
        sale_price: validated.sale_price && validated.sale_price > 0 ? validated.sale_price : null,
        sku: validated.sku?.trim() || null,
        brand_id: cleanUuid(validated.brand_id),
        category_id: cleanUuid(validated.category_id),
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/san-pham');
    return { success: true, id: created?.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống khi tạo sản phẩm' };
  }
}

export async function updateProductAction(id: string, data: z.infer<typeof ProductSchema>) {
  try {
    const parsed = ProductSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(', ') };
    }
    const validated = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from('products')
      .update({
        ...validated,
        sale_price: validated.sale_price && validated.sale_price > 0 ? validated.sale_price : null,
        sku: validated.sku?.trim() || null,
        brand_id: cleanUuid(validated.brand_id),
        category_id: cleanUuid(validated.category_id),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    revalidatePath('/');
    revalidatePath('/san-pham');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống khi cập nhật sản phẩm' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi xóa sản phẩm' };
  }
}

export async function duplicateProductAction(id: string) {
  try {
    const supabase = await createClient();
    const { data: original, error: fetchErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !original) {
      return { success: false, error: 'Không tìm thấy sản phẩm gốc để nhân bản' };
    }

    const newSlug = `${original.slug}-copy-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSku = original.sku ? `${original.sku}-COPY` : null;

    const { data: duplicated, error: insertErr } = await supabase
      .from('products')
      .insert({
        name: `${original.name} (Bản sao)`,
        slug: newSlug,
        sku: newSku,
        brand_id: original.brand_id,
        category_id: original.category_id,
        price: original.price,
        sale_price: original.sale_price,
        stock: original.stock,
        warranty_months: original.warranty_months,
        images: original.images || [],
        description: original.description,
        specs: original.specs || {},
        is_hot: false,
        is_active: false,
      })
      .select('id')
      .single();

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath('/admin/products');
    return { success: true, id: duplicated?.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi nhân bản sản phẩm' };
  }
}

export async function bulkUpdateProductsAction(
  ids: string[],
  action: 'activate' | 'deactivate' | 'delete' | 'change_category',
  payload?: any
) {
  try {
    const supabase = await createClient();

    if (action === 'delete') {
      const { error } = await supabase.from('products').delete().in('id', ids);
      if (error) return { success: false, error: error.message };
    } else if (action === 'activate') {
      const { error } = await supabase.from('products').update({ is_active: true }).in('id', ids);
      if (error) return { success: false, error: error.message };
    } else if (action === 'deactivate') {
      const { error } = await supabase.from('products').update({ is_active: false }).in('id', ids);
      if (error) return { success: false, error: error.message };
    } else if (action === 'change_category' && payload?.category_id) {
      const { error } = await supabase
        .from('products')
        .update({ category_id: cleanUuid(payload.category_id) })
        .in('id', ids);
      if (error) return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi cập nhật danh sách sản phẩm' };
  }
}

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

export async function createCategoryAction(data: z.infer<typeof CategorySchema>) {
  try {
    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(', ') };
    const supabase = await createClient();

    const { error } = await supabase.from('categories').insert(parsed.data);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categories');
    revalidatePath('/danh-muc');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi tạo danh mục' };
  }
}

export async function updateCategoryAction(id: string, data: z.infer<typeof CategorySchema>) {
  try {
    const parsed = CategorySchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(', ') };
    const supabase = await createClient();

    const { error } = await supabase.from('categories').update(parsed.data).eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categories');
    revalidatePath('/danh-muc');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi cập nhật danh mục' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi xóa danh mục' };
  }
}

// ============================================================================
// BRAND ACTIONS
// ============================================================================

export async function createBrandAction(data: z.infer<typeof BrandSchema>) {
  try {
    const parsed = BrandSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(', ') };
    const supabase = await createClient();

    const { error } = await supabase.from('brands').insert(parsed.data);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/brands');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi tạo thương hiệu' };
  }
}

export async function updateBrandAction(id: string, data: z.infer<typeof BrandSchema>) {
  try {
    const parsed = BrandSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues.map((e: any) => e.message).join(', ') };
    const supabase = await createClient();

    const { error } = await supabase.from('brands').update(parsed.data).eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/brands');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi cập nhật thương hiệu' };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/brands');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi khi xóa thương hiệu' };
  }
}
