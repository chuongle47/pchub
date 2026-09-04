const BASE_URL = '/api/nks';

export function getNksToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )nks_token=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);

  try {
    const authStorage = localStorage.getItem('pchub-auth');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed.state?.user?.token) return parsed.state.user.token;
      if (parsed.state?.user?.access_token) return parsed.state.user.access_token;
    }
  } catch (e) {}

  return '';
}

async function postApi(endpoint: string, data: Record<string, any> = {}, token?: string) {
  const activeToken = token || getNksToken();
  let url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  if (activeToken) {
    url += (url.includes('?') ? '&' : '?') + `access_token=${encodeURIComponent(activeToken)}`;
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const payload = { ...data };

  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
    payload['access_token'] = activeToken;
    payload['token'] = activeToken;
  }

  try {
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

    const isSuccess = 
      response.ok && 
      result.status !== 0 && 
      result.status !== false && 
      result.error !== true && 
      result.error !== 1 && 
      result.code !== 400 && 
      result.code !== 401 && 
      result.code !== 500 &&
      result.success !== false;

    if (!isSuccess) {
      return {
        success: false,
        message: result.message || result.error || result.msg || result.data?.message || `Lỗi từ máy chủ NKS (Mã HTTP: ${response.status})`,
        data: result,
        status: response.status,
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Lỗi kết nối máy chủ API.',
    };
  }
}

export const CompanyApiService = {
  async login(email: string, password: string) {
    const res = await postApi('nks/user/login', {
      email,
      username: email,
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
   * 1. nks/user/updateInfo - Cập nhật thông tin tài khoản
   * Body Params: firstname, lastname, intro, phone, gender (0|1), website, dob (yyyy-mm-dd), pob, id_number, id_date, id_place, province
   */
  async updateInfo(token: string | undefined, data: {
    firstname?: string;
    lastname?: string;
    intro?: string;
    phone?: string;
    gender?: number | string;
    website?: string;
    dob?: string;
    pob?: string;
    id_number?: string;
    id_date?: string;
    id_place?: string;
    province?: string;
    [key: string]: any;
  }) {
    const genderValue = data.gender === 'Nữ' || data.gender === 1 ? 1 : 0;
    const payload = {
      firstname: data.firstname ?? '',
      lastname: data.lastname ?? '',
      intro: data.intro ?? '',
      phone: data.phone ?? '',
      gender: genderValue,
      website: data.website ?? '',
      dob: data.dob ?? '',
      pob: data.pob ?? '',
      id_number: data.id_number ?? '',
      id_date: data.id_date ?? '',
      id_place: data.id_place ?? '',
      province: data.province ?? '',
    };
    const res = await postApi('nks/user/updateInfo', payload, token);
    if (res.success) {
      return {
        success: true as const,
        message: res.data?.message || 'Cập nhật thông tin tài khoản thành công!',
        data: res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật thông tin thất bại.',
    };
  },

  async updateProfile(token: string | undefined, data: any) {
    return this.updateInfo(token, data);
  },

  /**
   * 2. nks/user/updatePass - Cập nhật mật khẩu
   * Body Params: old_password, password (mật khẩu mới)
   */
  async updatePass(token: string | undefined, data: {
    old_password: string;
    password: string;
  }) {
    const payload = {
      old_password: data.old_password,
      password: data.password,
    };
    const res = await postApi('nks/user/updatePass', payload, token);
    if (res.success) {
      return {
        success: true as const,
        message: res.data?.message || 'Cập nhật mật khẩu thành công!',
        data: res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật mật khẩu thất bại.',
    };
  },

  /**
   * Helper to clean base64 data URL prefix (e.g. data:image/jpeg;base64,) for PHP backend base64_decode
   */
  cleanBase64(str?: string): string {
    if (!str) return '';
    if (str.includes('base64,')) {
      return str.split('base64,')[1];
    }
    return str;
  },

  /**
   * 3. nks/user/updateAvatar - Cập nhật Avatar
   * Body Params: avatar (Base64), access_token
   */
  async updateAvatar(token: string | undefined, avatarInput: string) {
    const rawBase64 = this.cleanBase64(avatarInput);
    
    // Send raw Base64 (without data:image/...;base64, prefix) as required by PHP base64_decode
    const payload = {
      avatar: rawBase64,
      avatar_url: avatarInput,
      avatar_base64: rawBase64,
    };

    const res = await postApi('nks/user/updateAvatar', payload, token);
    console.log('[NKS updateAvatar response]:', res);

    if (res.success) {
      return {
        success: true as const,
        message: res.data?.message || res.data?.msg || 'Cập nhật ảnh đại diện thành công!',
        data: res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || res.data?.message || res.data?.error || 'Cập nhật ảnh đại diện thất bại.',
      data: res.data,
    };
  },

  /**
   * 4. nks/user/updateCccd - Cập nhật CCCD
   * Body Params: front (Base64), back (Base64), number, date, place, access_token
   */
  async updateCccd(token: string | undefined, data: {
    front?: string;
    back?: string;
    number: string;
    date?: string;
    place?: string;
    [key: string]: any;
  }) {
    const rawFront = this.cleanBase64(data.front);
    const rawBack = this.cleanBase64(data.back);

    const payload = {
      front: rawFront,
      back: rawBack,
      number: data.number ?? '',
      date: data.date ?? '',
      place: data.place ?? '',
      // Field aliases for compatibility
      cccd: data.number ?? '',
      issue_date: data.date ?? '',
      issue_place: data.place ?? '',
      front_image: rawFront,
      back_image: rawBack,
    };

    const res = await postApi('nks/user/updateCccd', payload, token);
    console.log('[NKS updateCccd response]:', res);

    if (res.success) {
      return {
        success: true as const,
        message: res.data?.message || res.data?.msg || 'Cập nhật CCCD thành công!',
        data: res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || res.data?.message || res.data?.error || 'Cập nhật CCCD thất bại.',
      data: res.data,
    };
  },
};
