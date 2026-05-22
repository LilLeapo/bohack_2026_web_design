const DEFAULT_API_BASE_URL = 'https://api.bohack.top';
const TOKEN_STORAGE_KEY = 'bohack.accessToken';
export const AUTH_CHANGED_EVENT = 'bohack:auth-changed';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = -1, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

function readStorage(storage) {
  try {
    return storage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(storage, value) {
  try {
    if (value) storage.setItem(TOKEN_STORAGE_KEY, value);
    else storage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private browsing; API calls still work in memoryless mode.
  }
}

function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getAccessToken() {
  return readStorage(window.localStorage) || readStorage(window.sessionStorage);
}

export function clearAuthSession({ notify = true } = {}) {
  writeStorage(window.localStorage, null);
  writeStorage(window.sessionStorage, null);
  if (notify) notifyAuthChanged();
}

export function setAuthSession(auth, { persist = true } = {}) {
  const token = auth?.access_token || auth?.accessToken;
  clearAuthSession({ notify: false });
  if (!token) {
    notifyAuthChanged();
    return;
  }
  writeStorage(persist ? window.localStorage : window.sessionStorage, token);
  notifyAuthChanged();
}

function buildUrl(path, query) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }
  return url;
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    query,
    auth = false,
    raw = false,
  } = options;

  const token = getAccessToken();
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  let requestBody = body;
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }
  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (error) {
    throw new ApiError('无法连接后端服务，请稍后重试。', {
      status: 0,
      code: -1,
      data: error,
    });
  }

  if (raw) {
    if (!response.ok) {
      let message = response.statusText || '请求失败';
      try {
        const text = await response.text();
        if (text) {
          const payload = JSON.parse(text);
          throw new ApiError(payload.message || message, {
            status: response.status,
            code: payload.code,
            data: payload.data,
          });
        }
      } catch (error) {
        if (error instanceof ApiError) throw error;
      }
      throw new ApiError(message, { status: response.status, code: -2 });
    }
    return response;
  }

  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError('后端返回了无法解析的响应。', {
      status: response.status,
      code: -2,
      data: text,
    });
  }
  const message = payload.message || response.statusText || '请求失败';

  if (!response.ok || payload.code !== 0) {
    throw new ApiError(message, {
      status: response.status,
      code: payload.code,
      data: payload.data,
    });
  }

  return payload.data;
}

function inferFilenameFromDisposition(disposition, fallback) {
  if (!disposition) return fallback;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      // Fall back to the ASCII filename branch below.
    }
  }
  const ascii = /filename="?([^";]+)"?/i.exec(disposition);
  if (ascii) return ascii[1].trim();
  return fallback;
}

async function requestBlob(path, options = {}) {
  const { query, auth = false } = options;
  const token = getAccessToken();
  const headers = { Accept: '*/*' };
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), { headers });
  } catch (error) {
    throw new ApiError('无法连接后端服务，请稍后重试。', {
      status: 0,
      code: -1,
      data: error,
    });
  }

  if (!response.ok) {
    const text = await response.text();
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { message: response.statusText };
    }
    throw new ApiError(payload.message || response.statusText || '请求失败', {
      status: response.status,
      code: payload.code,
      data: payload.data || text,
    });
  }

  const disposition = response.headers.get('Content-Disposition') || '';
  const filename = inferFilenameFromDisposition(
    disposition,
    'bohack-certificate.txt',
  );
  return {
    blob: await response.blob(),
    filename,
  };
}

function registrationQuery(options) {
  if (!options) return {};
  if (typeof options === 'string') return { eventSlug: options };
  return {
    eventSlug: options.eventSlug,
    registrationType: options.registrationType,
  };
}

export const api = {
  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },
  register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },
  sendVerificationCode(payload) {
    return request('/auth/send-verification-code', {
      method: 'POST',
      body: payload,
    });
  },
  forgotPasswordSendCode(payload) {
    return request('/auth/forgot-password/send-code', {
      method: 'POST',
      body: payload,
    });
  },
  forgotPasswordReset(payload) {
    return request('/auth/forgot-password/reset', {
      method: 'POST',
      body: payload,
    });
  },
  changePassword(payload) {
    return request('/auth/change-password', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },
  me() {
    return request('/auth/me', { auth: true });
  },
  updateProfile(payload) {
    return request('/user/profile', {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
  },
  currentEvent() {
    return request('/events/current');
  },
  registrationStatus(options) {
    return request('/registration/status', {
      auth: true,
      query: registrationQuery(options),
    });
  },
  createRegistration(payload) {
    return request('/registration', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },
  updateRegistration(payload) {
    return request('/registration', {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
  },
  cancelRegistration(options) {
    return request('/registration', {
      method: 'DELETE',
      auth: true,
      query: registrationQuery(options),
    });
  },
  listAttachments(options) {
    return request('/registration/attachments', {
      auth: true,
      query: registrationQuery(options),
    });
  },
  uploadAttachment(formData) {
    return request('/registration/attachments', {
      method: 'POST',
      body: formData,
      auth: true,
    });
  },
  deleteAttachment(attachmentID) {
    return request(`/registration/attachments/${attachmentID}`, {
      method: 'DELETE',
      auth: true,
    });
  },
  getAttachmentSignedUrl(attachmentID) {
    return request(`/registration/attachments/${attachmentID}/signed-url`, {
      auth: true,
    });
  },
  downloadRegistrationCertificate(eventSlug) {
    return requestBlob('/registration/certificate', {
      auth: true,
      query: { eventSlug },
    });
  },
  confirmAttendance(payload) {
    return request('/attendance/confirm', {
      method: 'POST',
      body: payload,
    });
  },
  uploadAttendanceConfirmation(formData) {
    return request('/attendance/confirm/upload', {
      method: 'POST',
      body: formData,
    });
  },
  async claimApiKey() {
    const response = await request('/api/api-keys/claim', {
      method: 'POST',
      auth: true,
      raw: true,
    });
    const text = await response.text();
    if (!text) return {};
    try {
      const payload = JSON.parse(text);
      return payload.data ?? payload;
    } catch {
      return text;
    }
  },
};

export function resolveAttachmentUrl(downloadUrl) {
  if (!downloadUrl) return '';
  if (/^https?:\/\//i.test(downloadUrl)) return downloadUrl;
  const path = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
  return `${API_BASE_URL}${path}`;
}

export function triggerBlobDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60 * 1000);
}

export function userFacingError(error) {
  if (!(error instanceof ApiError)) return '操作失败，请稍后重试。';

  switch (error.code) {
    case 40100:
    case 40101:
    case 40102:
    case 40103:
    case 40104:
      return '邮箱或密码不正确。';
    case 40901:
      return '用户名已被占用，请换一个邮箱或稍后重试。';
    case 40902:
    case 40903:
      return '这个邮箱已经注册过，请直接登录。';
    case 40310:
      return '当前活动暂未开放报名。';
    case 40402:
    case 40403:
      return '当前活动不存在，请联系主办方确认。';
    case 40404:
      return '尚未找到你的报名记录。';
    case 40910:
    case 40911:
      return '你已经提交过报名，请登录查看状态。';
    case 40912:
      return '当前状态下报名已不可修改。';
    case 40913:
      return '当前状态下报名无法取消。';
    case 40006:
    case 40007:
      return '验证码无效或已过期，请重新获取。';
    case 42901:
      return '请稍后再请求验证码。';
    case 42212:
      return '请输入 6 位验证码。';
    case 40114:
      return '当前密码不正确。';
    case 42203:
    case 42208:
      return '密码需要 6-128 位。';
    case 42209:
      return '新密码需要与当前密码不同。';
    case 42219:
      return '角色偏好太长（最多 50 字符）。';
    default:
      return error.message || '操作失败，请稍后重试。';
  }
}
