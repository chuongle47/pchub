const BASE_URL = '/api/nks';

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
};
