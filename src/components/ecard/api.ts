/**
 * Route all NKS API calls through the local Next.js proxy (/api/nks/...)
 * to avoid browser CORS restrictions when calling https://account.nks.vn directly.
 *
 * Proxy route: src/app/api/nks/[...path]/route.ts
 */
const BASE_URL = '/api/nks';


/**
 * Helper to make POST requests to the NKS API (JSON format).
 */
async function postApi(endpoint: string, data: Record<string, any> = {}, token?: string) {
  const url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const payload = { ...data };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    payload['access_token'] = token;
  }

  try {
    console.log(`NKS API Request: POST ${url}`, {
      ...payload,
      password: payload.password ? '***' : undefined,
      old_password: payload.old_password ? '***' : undefined,
      new_password: payload.new_password ? '***' : undefined,
      password_confirmation: payload.password_confirmation ? '***' : undefined,
      avatar: payload.avatar ? `[base64 len:${payload.avatar.length}]` : undefined,
      banner: payload.banner ? `[base64 len:${payload.banner.length}]` : undefined,
      front: payload.front ? `[base64 len:${payload.front.length}]` : undefined,
      back: payload.back ? `[base64 len:${payload.back.length}]` : undefined,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');
    let result: any = {};
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { message: text };
    }
    
    console.log(`NKS API Response: ${response.status}`, result);

    if (!response.ok) {
      return {
        success: false,
        message: result.error || result.message || `API Error (HTTP ${response.status})`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error(`NKS API Exception: ${error.message}`);
    return {
      success: false,
      message: error.message || 'Lỗi kết nối máy chủ API.',
    };
  }
}

/**
 * Helper to make POST requests using FormData (multipart/form-data).
 * Used for image upload endpoints (avatar, banner) that expect Form fields, not JSON.
 */
async function postApiForm(endpoint: string, data: Record<string, string>, token?: string) {
  const url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;

  const formData = new FormData();
  if (token) {
    formData.append('access_token', token);
  }
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }

  try {
    console.log(`NKS API Form Request: POST ${url}`, Object.keys(data));

    // Do NOT set Content-Type header — browser sets it automatically with the correct boundary
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    let result: any = {};
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { message: text };
    }

    console.log(`NKS API Form Response: ${response.status}`, result);

    if (!response.ok) {
      return {
        success: false,
        message: result.error || result.message || `API Error (HTTP ${response.status})`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error(`NKS API Form Exception: ${error.message}`);
    return {
      success: false,
      message: error.message || 'Lỗi kết nối máy chủ API.',
    };
  }
}

export const CompanyApiService = {
  /**
   * User Login
   */
  async login(email: string, password: string) {
    const res = await postApi('nks/user/login', {
      email,
      username: email, // compat fallback
      password,
    });

    if (res.success && res.data) {
      const data = res.data;
      const token = data.data?.access_token ?? data.token ?? data.access_token ?? data.data?.token ?? null;
      const user = data.data?.user ?? data.user ?? data.data ?? null;

      if (token) {
        return {
          success: true as const,
          token,
          user,
        };
      }
    }

    return {
      success: false as const,
      message: res.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản.',
    };
  },

  /**
   * Fetch User Profile
   */
  async getProfile(token: string) {
    const res = await postApi('nks/user', {}, token);
    if (res.success && res.data) {
      const user = res.data.data?.user ?? res.data.user ?? res.data.data ?? res.data;
      return {
        success: true as const,
        user,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Không thể lấy thông tin thành viên từ API.',
    };
  },

  /**
   * Update Profile Info
   */
  async updateProfile(token: string, data: { name: string; phone?: string; zalo?: string }) {
    const res = await postApi('nks/user/updateInfo', data, token);
    if (res.success) {
      return {
        success: true as const,
        message: 'Cập nhật thông tin thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật thông tin thất bại.',
    };
  },

  /**
   * Update Password
   */
  async updatePassword(token: string, oldPassword: string, newPassword: string) {
    const res = await postApi('nks/user/updatePass', {
      old_password: oldPassword,
      password: newPassword,
      password_confirmation: newPassword,
      new_password: newPassword,
    }, token);

    if (res.success) {
      return {
        success: true as const,
        message: 'Đổi mật khẩu thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.',
    };
  },

  /**
   * Update Profile Avatar
   */
  async updateAvatar(token: string, base64Image: string) {
    const res = await postApi('nks/user/updateAvatar', {
      avatar: base64Image,
    }, token);

    if (res.success && res.data) {
      const avatarUrl = res.data.avatar ?? res.data.avatar_url ?? res.data.data?.avatar_url ?? null;
      return {
        success: true as const,
        avatarUrl,
        message: 'Cập nhật ảnh đại diện thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật ảnh đại diện thất bại.',
    };
  },

  /**
   * Update Profile CCCD info
   */
  async updateCccd(token: string, data: {
    cccd: string;
    issue_date: string;
    address: string;
    front_base64?: string | null;
    back_base64?: string | null;
  }) {
    // Parse issue_date from DD/MM/YYYY to YYYY-MM-DD for the API
    let parsedDate = data.issue_date;
    if (data.issue_date) {
      const dmyMatch = data.issue_date.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
      if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        parsedDate = `${year}-${month}-${day}`;
      }
    }

    const payload: Record<string, any> = {
      number: data.cccd,
      date: parsedDate,
      place: data.address,
      cccd: data.cccd,
      cccd_number: data.cccd,
    };

    if (data.front_base64) {
      payload['front'] = data.front_base64;
    }
    if (data.back_base64) {
      payload['back'] = data.back_base64;
    }

    const res = await postApi('nks/user/updateCccd', payload, token);
    if (res.success) {
      return {
        success: true as const,
        message: 'Cập nhật Căn cước công dân thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật CCCD thất bại.',
    };
  },

  /**
   * Fetch user's Ecards
   */
  async getEcards(token: string) {
    const res = await postApi('nks/user/ecards', {}, token);
    if (res.success && res.data) {
      return {
        success: true as const,
        ecards: res.data.data ?? res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Không thể tải danh sách Ecard.',
    };
  },

  /**
   * Fetch single Ecard details
   */
  async getEcardDetails(token: string, code: string) {
    const res = await postApi('nks/user/ecard/show', { code }, token);
    if (res.success && res.data) {
      return {
        success: true as const,
        ecard: res.data.data ?? res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Không thể lấy chi tiết Ecard.',
    };
  },

  /**
   * Update Ecard details
   */
  async updateEcard(token: string, code: string, fields: Record<string, any>) {
    const res = await postApi('nks/user/ecard/update', {
      code,
      ...fields,
    }, token);

    if (res.success) {
      return {
        success: true as const,
        message: 'Cập nhật thông tin Ecard thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật Ecard thất bại.',
    };
  },

  /**
   * Update Ecard Avatar (routes through Next.js proxy to avoid CORS)
   */
  async updateEcardAvatar(token: string, code: string, base64Image: string) {
    const res = await postApi('nks/user/ecard/updateAvatar', {
      code,
      avatar: base64Image,
    }, token);

    if (res.success) {
      return {
        success: true as const,
        data: res.data,
        message: res.data?.message || 'Cập nhật ảnh đại diện Ecard thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật ảnh đại diện Ecard thất bại.',
    };
  },

  /**
   * Update Ecard Banner (routes through Next.js proxy to avoid CORS)
   */
  async updateEcardBanner(token: string, code: string, base64Image: string) {
    const res = await postApi('nks/user/ecard/updateBanner', {
      code,
      banner: base64Image,
    }, token);

    if (res.success) {
      return {
        success: true as const,
        data: res.data,
        message: res.data?.message || 'Cập nhật ảnh bìa Ecard thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật ảnh bìa Ecard thất bại.',
    };
  },

  /**
   * Fetch all Ecard Leads / Feedbacks for current account (via proxy or direct)
   */
  async getEcardLeads(token: string) {
    try {
      // First try Next.js server proxy
      const proxyRes = await fetch('/api/feedback/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token }),
      });
      if (proxyRes.ok) {
        const result = await proxyRes.json();
        if (result.success && Array.isArray(result.data)) {
          return {
            success: true as const,
            leads: result.data,
          };
        }
      }
    } catch (e) {
      console.warn('Proxy ecardleads failed, falling back to direct:', e);
    }

    // Direct fallback
    const res = await postApiForm('nks/user/ecardleads', {}, token);
    if (res.success && res.data) {
      const leads = res.data.data ?? res.data;
      return {
        success: true as const,
        leads: Array.isArray(leads) ? leads : [],
      };
    }
    return {
      success: false as const,
      message: res.message || 'Không thể lấy danh sách phản hồi.',
      leads: [],
    };
  },

  /**
   * Submit an Ecard Lead / Feedback (via proxy or direct)
   */
  async addEcardLead(data: {
    code: string;
    fullname: string;
    email: string;
    phone: string;
    demand: string;
  }, token?: string) {
    try {
      // First try Next.js server proxy
      const proxyRes = await fetch('/api/feedback/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          access_token: token || '',
        }),
      });
      if (proxyRes.ok) {
        const result = await proxyRes.json();
        if (result.success) {
          return {
            success: true as const,
            data: result.data,
            message: 'Gửi phản hồi thành công!',
          };
        }
      }
    } catch (e) {
      console.warn('Proxy ecardlead failed, falling back to direct:', e);
    }

    // Direct fallback
    const payload: Record<string, string> = {
      code: data.code,
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      demand: data.demand,
    };
    const res = await postApiForm('nks/user/ecardlead/store', payload, token);
    if (res.success) {
      return {
        success: true as const,
        data: res.data,
        message: 'Gửi phản hồi thành công!',
      };
    }
    return {
      success: false as const,
      message: res.message || 'Gửi phản hồi thất bại.',
    };
  },
};

