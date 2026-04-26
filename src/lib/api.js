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
  const filename = disposition.match(/filename="?([^"]+)"?/)?.[1] || 'bohack-certificate.txt';
  return {
    blob: await response.blob(),
    filename,
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
  registrationStatus(eventSlug) {
    return request('/registration/status', {
      auth: true,
      query: { eventSlug },
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
};

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
    case 40006:
    case 42212:
      return '验证码不正确或已过期。';
    case 42901:
      return '验证码发送太频繁，请稍后再试。';
    case 40310:
      return '当前活动暂未开放报名。';
    case 40402:
    case 40403:
      return '当前活动不存在，请联系主办方确认。';
    case 40910:
    case 40911:
      return '你已经提交过报名，请登录查看状态。';
    default:
      return error.message || '操作失败，请稍后重试。';
  }
}
