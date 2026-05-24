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
  createTeam(payload) {
    return request('/teams', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },
  getMyTeam(eventSlug) {
    return request('/teams/me', {
      auth: true,
      query: eventSlug ? { event_slug: eventSlug } : undefined,
    });
  },
  getTeam(teamId) {
    return request(`/teams/${teamId}`, { auth: true });
  },
  updateTeam(teamId, payload) {
    return request(`/teams/${teamId}`, {
      method: 'PATCH',
      body: payload,
      auth: true,
    });
  },
  disbandTeam(teamId) {
    return request(`/teams/${teamId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
  joinTeam(payload) {
    return request('/teams/join', {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },
  leaveTeam(teamId) {
    return request(`/teams/${teamId}/leave`, {
      method: 'POST',
      auth: true,
    });
  },
  transferTeam(teamId, payload) {
    return request(`/teams/${teamId}/transfer`, {
      method: 'POST',
      body: payload,
      auth: true,
    });
  },
  getTeamProject(teamId) {
    return request(`/teams/${teamId}/project`, { auth: true });
  },
  submitTeamProject(teamId, formData) {
    return request(`/teams/${teamId}/project`, {
      method: 'POST',
      body: formData,
      auth: true,
    });
  },
  updateTeamProject(teamId, formData) {
    return request(`/teams/${teamId}/project`, {
      method: 'PATCH',
      body: formData,
      auth: true,
    });
  },
  pickProjectSlot(teamId, slot) {
    return request(`/teams/${teamId}/project/pick`, {
      method: 'POST',
      body: { slot },
      auth: true,
    });
  },
  getProjectPptSignedUrl(teamId) {
    return request(`/teams/${teamId}/project/ppt/signed-url`, { auth: true });
  },
  getRoadshowSlots(eventSlug) {
    const slug = eventSlug || 'default';
    return request(`/events/${slug}/roadshow/slots`, { auth: true });
  },
  getRoadshowQueue(eventSlug) {
    const slug = eventSlug || 'default';
    return request(`/events/${slug}/roadshow/queue`, { auth: true });
  },
  getVotingStatus(eventSlug) {
    const slug = eventSlug || 'default';
    return request(`/events/${slug}/voting/status`, { auth: true });
  },
  getMyVotes(eventSlug) {
    const slug = eventSlug || 'default';
    return request(`/events/${slug}/votes/me`, { auth: true });
  },
  castVote(eventSlug, teamProjectId) {
    const slug = eventSlug || 'default';
    return request(`/events/${slug}/votes`, {
      method: 'POST',
      body: { team_project_id: teamProjectId },
      auth: true,
    });
  },
  revokeVote(eventSlug, teamProjectId) {
    const slug = eventSlug || 'default';
    return request(`/events/${slug}/votes/${teamProjectId}`, {
      method: 'DELETE',
      auth: true,
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
      return payload;
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
    case 40140:
      return '登录已过期，请重新登录。';
    case 40340:
      return '只有队长可以执行该操作。';
    case 40430:
      return '队伍不存在或你尚未加入。';
    case 40431:
      return '邀请码无效，请检查后重试。';
    case 40432:
      return '该用户不是队伍成员。';
    case 40930:
      return '你已经在该活动加入了其他队伍。';
    case 40931:
      return '队伍人数已满（上限 4 人）。';
    case 40932:
      return '队名已被占用，换一个试试。';
    case 40933:
      return '队长不能直接离队，请先转让或解散队伍。';
    case 42230:
      return '队名长度需要 1–100 字符。';
    case 42231:
      return '邀请码格式不正确。';
    case 42232:
      return '队伍 ID 不合法。';
    case 40437:
      return '还没有提交项目。';
    case 40940:
      return '项目已经提交过，请改为更新。';
    case 40941:
      return '项目已锁定，无法再修改。';
    case 40942:
      return '还没轮到你们队选号，请稍候。';
    case 40943:
      return '该序号已被其他队伍选走，请挑一个还未占用的。';
    case 42250:
      return '项目名称不能为空。';
    case 42251:
      return '项目名称太长（最多 100 字符）。';
    case 42252:
      return '项目介绍长度需要在 1–5000 字符。';
    case 42253:
      return '请填写有效的项目仓库链接（http/https 开头）。';
    case 42254:
      return '备份链接格式不正确。';
    case 42255:
      return 'PPT 文件不符合要求（仅支持 ppt/pptx/pdf/key 且大小受限）。';
    case 42256:
      return '路演序号必须在 1–40 之间。';
    case 42257:
      return '所选特别单元包含未支持的值，请重新选择。';
    case 40360:
      return '需要加入队伍后才能投票。';
    case 40361:
      return '不能给自己队伍的项目投票。';
    case 40435:
      return '活动不存在，请刷新页面。';
    case 40439:
      return '该项目还没投过，无法撤回。';
    case 40960:
      return '投票暂未开放或已结束。';
    case 40961:
      return '已经给该项目投过票了。';
    case 40962:
      return '你的 3 票已经投完。';
    case 40963:
      return '该项目当前不参与投票。';
    case 42270:
      return '请选择要投票的项目。';
    case 42271:
      return '项目 ID 不合法。';
    case 42272:
      return '项目与活动不匹配，请刷新页面。';
    default:
      return error.message || '操作失败，请稍后重试。';
  }
}
