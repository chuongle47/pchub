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
  const url = `${BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const payload = { ...data };
  const activeToken = token || getNksToken();

  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
    payload['access_token'] = activeToken;
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
   */
  async updateInfo(token: string | undefined, data: Record<string, any>) {
    const res = await postApi('nks/user/updateInfo', data, token);
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
   */
  async updatePass(token: string | undefined, data: {
    old_password?: string;
    password?: string;
    current_password?: string;
    new_password?: string;
    password_new?: string;
    confirm_password?: string;
    [key: string]: any;
  }) {
    const res = await postApi('nks/user/updatePass', data, token);
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
   * 3. nks/user/updateAvatar - Cập nhật Avatar
   */
  async updateAvatar(token: string | undefined, avatar: string) {
    const res = await postApi('nks/user/updateAvatar', { avatar, avatar_url: avatar }, token);
    if (res.success) {
      return {
        success: true as const,
        message: res.data?.message || 'Cập nhật ảnh đại diện thành công!',
        data: res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật ảnh đại diện thất bại.',
    };
  },

  /**
   * 4. nks/user/updateCccd - Cập nhật CCCD
   */
  async updateCccd(token: string | undefined, data: {
    cccd: string;
    issue_date?: string;
    issue_place?: string;
    front_image?: string;
    back_image?: string;
    [key: string]: any;
  }) {
    const res = await postApi('nks/user/updateCccd', data, token);
    if (res.success) {
      return {
        success: true as const,
        message: res.data?.message || 'Cập nhật CCCD thành công!',
        data: res.data,
      };
    }
    return {
      success: false as const,
      message: res.message || 'Cập nhật CCCD thất bại.',
    };
  },
};
