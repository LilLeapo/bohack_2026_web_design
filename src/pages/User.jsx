import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMagnet } from '../hooks/useMagnet.js';
import {
  api,
  clearAuthSession,
  getAccessToken,
  resolveAttachmentUrl,
  userFacingError,
} from '../lib/api.js';

const SIGNED_URL_REFRESH_BUFFER_MS = 5 * 60 * 1000;

function attachmentExpiresAt(item) {
  if (!item?.downloadUrl) return 0;
  const expiresIn = Number(item.downloadExpiresIn);
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) return 0;
  const created = item.__signedAt || Date.parse(item.createdAt) || 0;
  return created + expiresIn * 1000;
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!target) {
    return { d: 0, h: 0, m: 0, s: 0, ready: false };
  }
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    ready: true,
  };
}

function formatBytes(size) {
  if (!size && size !== 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

const TABS = [
  { id: 'overview', label: '总览' },
  { id: 'team', label: '我的队' },
  { id: 'schedule', label: '日程' },
  { id: 'project', label: '项目' },
  { id: 'voting', label: '互投' },
  { id: 'support', label: '支持' },
];

const TIMELINE = [
  { t: '05/18 12:00', l: '报名截止', s: 'now' },
  { t: '05/22 16:00—05/24 16:00', l: '线下 42h 黑客松', s: 'todo' },
  { t: '05/25—05/27', l: '线上项目打磨与赋能', s: 'todo' },
  { t: '05/28—05/31', l: '线下项目路演与颁奖', s: 'todo' },
];

const PREP_ITEMS = [
  { id: '01', title: '完成报名问卷', meta: '用于赛道与导师匹配', status: '必做' },
  { id: '02', title: '确认联系方式', meta: '邮箱、学校、手机号保持最新', status: '待确认' },
  { id: '03', title: '关注赛前通知', meta: '5 月 22 日前会同步签到和分组安排', status: '即将发布' },
];

const STATUS_LABELS = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '审核中',
  approved: '已通过',
  rejected: '未通过',
  cancelled: '已取消',
};

function parseExtra(registration) {
  if (!registration?.extra) return {};
  if (typeof registration.extra === 'string') {
    try {
      return JSON.parse(registration.extra);
    } catch {
      return {};
    }
  }
  return registration.extra;
}

function initialsFrom(value) {
  const text = (value || '黑客').trim();
  const chars = Array.from(text.replace(/\s+/g, ''));
  return chars.slice(0, 2).join('').toUpperCase();
}

export default function User() {
  useMagnet();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [me, setMe] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsErr, setAttachmentsErr] = useState('');
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [err, setErr] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelErr, setCancelErr] = useState('');
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwErr, setPwErr] = useState('');
  const [pwInfo, setPwInfo] = useState('');
  const [team, setTeam] = useState(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamErr, setTeamErr] = useState('');
  const [teamInfo, setTeamInfo] = useState('');
  const [teamBusy, setTeamBusy] = useState(false);
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [renameEditing, setRenameEditing] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectErr, setProjectErr] = useState('');
  const [projectInfo, setProjectInfo] = useState('');
  const [projectBusy, setProjectBusy] = useState(false);
  const [projectEditing, setProjectEditing] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    introduction: '',
    repoUrl: '',
    backupUrl: '',
    specialUnits: [],
  });
  const [pptFile, setPptFile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [votingStatus, setVotingStatus] = useState(null);
  const [myVotes, setMyVotes] = useState([]);
  const [votingProjects, setVotingProjects] = useState([]);
  const [votingLoading, setVotingLoading] = useState(false);
  const [votingErr, setVotingErr] = useState('');
  const [votingInfo, setVotingInfo] = useState('');
  const [votingBusyId, setVotingBusyId] = useState(null);
  const fileInputRef = useRef(null);
  const pptInputRef = useRef(null);
  const target = useMemo(() => {
    const fromEvent = event?.registrationCloseAt
      ? new Date(event.registrationCloseAt).getTime()
      : null;
    if (fromEvent && !Number.isNaN(fromEvent)) return fromEvent;
    return new Date(2026, 4, 22, 16, 0, 0).getTime();
  }, [event]);
  const cd = useCountdown(target);

  useEffect(() => {
    document.body.classList.add('dash-body');
    return () => document.body.classList.remove('dash-body');
  }, []);

  useEffect(() => {
    let alive = true;

    if (!getAccessToken()) {
      navigate('/login', { replace: true });
      return () => {
        alive = false;
      };
    }

    async function loadUser() {
      setLoading(true);
      setErr('');

      try {
        const [user, registrationStatus, currentEvent] = await Promise.all([
          api.me(),
          api.registrationStatus().catch((error) => {
            if (error.status === 404) return null;
            throw error;
          }),
          api.currentEvent().catch(() => null),
        ]);

        if (!alive) return;
        setMe(user);
        setRegistration(registrationStatus);
        setEvent(currentEvent);

        const teamEventSlug =
          currentEvent?.slug || registrationStatus?.eventSlug;
        setTeamLoading(true);
        api
          .getMyTeam(teamEventSlug)
          .then((data) => {
            if (!alive) return;
            setTeam(data || null);
          })
          .catch((error) => {
            if (!alive) return;
            if (error.status === 404) {
              setTeam(null);
              return;
            }
            setTeamErr(userFacingError(error));
          })
          .finally(() => {
            if (alive) setTeamLoading(false);
          });

        if (registrationStatus) {
          api
            .listAttachments()
            .then((items) => {
              if (!alive) return;
              const now = Date.now();
              setAttachments(
                Array.isArray(items)
                  ? items.map((item) => ({ ...item, __signedAt: now }))
                  : [],
              );
            })
            .catch((error) => {
              if (!alive) return;
              if (error.status === 404) return;
              setAttachmentsErr(userFacingError(error));
            });
        }
      } catch (error) {
        if (!alive) return;
        if (error.status === 401) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }
        setErr(userFacingError(error));
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadUser();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const pad = (n) => String(n).padStart(2, '0');
  const extra = parseExtra(registration);
  const name = registration?.realName || me?.username || '黑客';
  const initials = initialsFrom(name);
  const appId = registration?.id
    ? `BH26-${String(registration.id).padStart(4, '0')}`
    : '未提交';
  const statusLabel = registration
    ? STATUS_LABELS[registration.status] || registration.status
    : '未提交';
  const questionnaire = extra.questionnaire || {};
  const tracks = Array.isArray(extra.tracks) && extra.tracks.length
    ? extra.tracks.join(' / ')
    : '待确认';
  const teamDisplayName =
    team?.name || registration?.teamName || extra.teamStatus || '待组队';
  const role = registration?.rolePreference || extra.experienceLevel || '待确认';
  const tshirt = extra.tshirt || '待确认';
  const availabilityLabel = questionnaire.availability || extra.availability || '待确认';

  const currentTab = TABS.find((x) => x.id === tab);
  const signOut = (ev) => {
    ev.preventDefault();
    clearAuthSession();
    navigate('/login');
  };
  const downloadCertificate = async () => {
    if (!registration) {
      setErr('请先完成报名后再下载证件。');
      return;
    }

    setCertificateLoading(true);
    try {
      const { blob, filename } = await api.downloadRegistrationCertificate(registration.eventSlug);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErr(userFacingError(error));
    } finally {
      setCertificateLoading(false);
    }
  };

  const cancellableStatuses = ['draft', 'submitted', 'under_review', 'rejected'];
  const canCancel = registration && cancellableStatuses.includes(registration.status);
  const attachmentsEditable =
    registration && cancellableStatuses.includes(registration.status);

  const handleUploadFile = useCallback(
    async (file) => {
      if (!file) return;
      setAttachmentsErr('');
      setAttachmentBusy(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', 'attachment');
        const created = await api.uploadAttachment(formData);
        setAttachments((items) => [
          ...items,
          { ...created, __signedAt: Date.now() },
        ]);
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }
        setAttachmentsErr(userFacingError(error));
      } finally {
        setAttachmentBusy(false);
      }
    },
    [navigate],
  );

  const handleDeleteAttachment = useCallback(
    async (attachmentID) => {
      if (typeof window !== 'undefined' && !window.confirm('确认删除该附件？')) {
        return;
      }
      setAttachmentsErr('');
      setAttachmentBusy(true);
      try {
        await api.deleteAttachment(attachmentID);
        setAttachments((items) => items.filter((item) => item.id !== attachmentID));
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }
        setAttachmentsErr(userFacingError(error));
      } finally {
        setAttachmentBusy(false);
      }
    },
    [navigate],
  );

  const handleDownloadAttachment = useCallback(
    async (item) => {
      setAttachmentsErr('');
      try {
        let downloadUrl = item.downloadUrl;
        const expiresAt = attachmentExpiresAt(item);
        const needsRefresh =
          !downloadUrl ||
          (expiresAt && expiresAt - Date.now() < SIGNED_URL_REFRESH_BUFFER_MS);
        if (needsRefresh) {
          const fresh = await api.getAttachmentSignedUrl(item.id);
          downloadUrl = fresh?.downloadUrl || downloadUrl;
          if (fresh?.downloadUrl) {
            setAttachments((items) =>
              items.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      downloadUrl: fresh.downloadUrl,
                      downloadExpiresIn: fresh.expiresIn,
                      __signedAt: Date.now(),
                    }
                  : it,
              ),
            );
          }
        }
        if (!downloadUrl) {
          setAttachmentsErr('暂时无法获取下载链接，请稍后重试。');
          return;
        }
        const a = document.createElement('a');
        a.href = resolveAttachmentUrl(downloadUrl);
        a.download = item.fileName || 'attachment';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }
        setAttachmentsErr(userFacingError(error));
      }
    },
    [navigate],
  );

  const handleCancelRegistration = useCallback(async () => {
    if (typeof window !== 'undefined' && !window.confirm('确认取消报名？取消后可以重新提交。')) {
      return;
    }
    setCancelErr('');
    setCancelBusy(true);
    try {
      const updated = await api.cancelRegistration();
      setRegistration(updated);
    } catch (error) {
      if (error.status === 401) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }
      setCancelErr(userFacingError(error));
    } finally {
      setCancelBusy(false);
    }
  }, [navigate]);

  const handleChangePassword = useCallback(
    async (ev) => {
      ev?.preventDefault();
      setPwErr('');
      setPwInfo('');
      if (pwForm.current.length < 6) {
        setPwErr('当前密码至少 6 位。');
        return;
      }
      if (pwForm.next.length < 8) {
        setPwErr('新密码至少 8 位。');
        return;
      }
      if (pwForm.next === pwForm.current) {
        setPwErr('新密码需要与当前密码不同。');
        return;
      }
      if (pwForm.next !== pwForm.confirm) {
        setPwErr('两次新密码不一致。');
        return;
      }
      setPwBusy(true);
      try {
        await api.changePassword({
          currentPassword: pwForm.current,
          newPassword: pwForm.next,
        });
        setPwInfo('密码已更新。');
        setPwForm({ current: '', next: '', confirm: '' });
      } catch (error) {
        if (error.status === 401) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }
        setPwErr(userFacingError(error));
      } finally {
        setPwBusy(false);
      }
    },
    [pwForm, navigate],
  );

  const myUserId = me?.id ?? me?.userId ?? me?.user_id ?? null;
  const myUsername = me?.username ?? null;
  const isMyMember = (m) =>
    (myUserId != null && m.userId === myUserId) ||
    (!!myUsername && m.username === myUsername);
  const myMember = team?.members?.find(isMyMember) || null;
  const isLeader =
    !!myMember?.isLeader ||
    (myUserId != null &&
      !!team &&
      (team.leaderId ?? team.leader_id) === myUserId);
  const teamEventSlug =
    team?.eventSlug || event?.slug || registration?.eventSlug || null;

  const handleAuthError = useCallback(
    (error) => {
      if (error?.status === 401) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  const handleCreateTeam = useCallback(
    async (ev) => {
      ev?.preventDefault();
      setTeamErr('');
      setTeamInfo('');
      const name = createName.trim();
      if (!name) {
        setTeamErr('请填写队伍名称。');
        return;
      }
      setTeamBusy(true);
      try {
        const created = await api.createTeam({
          name,
          event_slug: teamEventSlug || undefined,
        });
        setTeam(created || null);
        setCreateName('');
        setTeamInfo('队伍创建成功，邀请队友加入吧。');
      } catch (error) {
        if (handleAuthError(error)) return;
        setTeamErr(userFacingError(error));
      } finally {
        setTeamBusy(false);
      }
    },
    [createName, teamEventSlug, handleAuthError],
  );

  const handleJoinTeam = useCallback(
    async (ev) => {
      ev?.preventDefault();
      setTeamErr('');
      setTeamInfo('');
      const code = joinCode.trim();
      if (!code) {
        setTeamErr('请填写邀请码。');
        return;
      }
      setTeamBusy(true);
      try {
        const joined = await api.joinTeam({ invite_code: code });
        setTeam(joined || null);
        setJoinCode('');
        setTeamInfo('加入成功。');
      } catch (error) {
        if (handleAuthError(error)) return;
        setTeamErr(userFacingError(error));
      } finally {
        setTeamBusy(false);
      }
    },
    [joinCode, handleAuthError],
  );

  const handleRenameTeam = useCallback(
    async (ev) => {
      ev?.preventDefault();
      if (!team?.id) return;
      setTeamErr('');
      setTeamInfo('');
      const name = renameValue.trim();
      if (!name) {
        setTeamErr('请填写新的队伍名称。');
        return;
      }
      if (name === team.name) {
        setRenameEditing(false);
        return;
      }
      setTeamBusy(true);
      try {
        const updated = await api.updateTeam(team.id, { name });
        setTeam(updated || null);
        setRenameEditing(false);
        setTeamInfo('队名已更新。');
      } catch (error) {
        if (handleAuthError(error)) return;
        setTeamErr(userFacingError(error));
      } finally {
        setTeamBusy(false);
      }
    },
    [team, renameValue, handleAuthError],
  );

  const handleLeaveTeam = useCallback(async () => {
    if (!team?.id) return;
    if (typeof window !== 'undefined' && !window.confirm('确认离开该队伍？')) {
      return;
    }
    setTeamErr('');
    setTeamInfo('');
    setTeamBusy(true);
    try {
      await api.leaveTeam(team.id);
      setTeam(null);
      setTeamInfo('你已离开队伍。');
    } catch (error) {
      if (handleAuthError(error)) return;
      setTeamErr(userFacingError(error));
    } finally {
      setTeamBusy(false);
    }
  }, [team, handleAuthError]);

  const handleDisbandTeam = useCallback(async () => {
    if (!team?.id) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm('确认解散队伍？所有成员都会被移出，此操作不可恢复。')
    ) {
      return;
    }
    setTeamErr('');
    setTeamInfo('');
    setTeamBusy(true);
    try {
      await api.disbandTeam(team.id);
      setTeam(null);
      setTeamInfo('队伍已解散。');
    } catch (error) {
      if (handleAuthError(error)) return;
      setTeamErr(userFacingError(error));
    } finally {
      setTeamBusy(false);
    }
  }, [team, handleAuthError]);

  const handleTransferLeader = useCallback(async () => {
    if (!team?.id || !transferTargetId) return;
    setTeamErr('');
    setTeamInfo('');
    setTeamBusy(true);
    try {
      const updated = await api.transferTeam(team.id, {
        user_id: Number(transferTargetId),
      });
      setTeam(updated || null);
      setTransferTargetId('');
      setTeamInfo('队长已转让。');
    } catch (error) {
      if (handleAuthError(error)) return;
      setTeamErr(userFacingError(error));
    } finally {
      setTeamBusy(false);
    }
  }, [team, transferTargetId, handleAuthError]);

  const copyInviteCode = useCallback(async () => {
    if (!team?.inviteCode) return;
    setTeamErr('');
    setTeamInfo('');
    try {
      await navigator.clipboard.writeText(team.inviteCode);
      setTeamInfo('邀请码已复制到剪贴板。');
    } catch {
      setTeamErr('复制失败，请手动选中后复制。');
    }
  }, [team]);

  useEffect(() => {
    if (!team?.id) {
      setProject(null);
      setProjectErr('');
      setProjectEditing(false);
      return undefined;
    }
    let alive = true;
    setProjectLoading(true);
    setProjectErr('');
    api
      .getTeamProject(team.id)
      .then((data) => {
        if (!alive) return;
        setProject(data || null);
      })
      .catch((error) => {
        if (!alive) return;
        if (error.status === 404) {
          setProject(null);
          return;
        }
        if (handleAuthError(error)) return;
        setProjectErr(userFacingError(error));
      })
      .finally(() => {
        if (alive) setProjectLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [team?.id, handleAuthError]);

  useEffect(() => {
    if (tab !== 'project') return undefined;
    if (!team?.id) return undefined;
    const state = project?.state;
    if (state !== 'pending' && state !== 'picking') return undefined;
    const timerId = window.setInterval(() => {
      api
        .getTeamProject(team.id)
        .then((data) => setProject(data || null))
        .catch((error) => {
          if (error.status === 404) {
            setProject(null);
          }
        });
    }, 5000);
    return () => window.clearInterval(timerId);
  }, [tab, team?.id, project?.state]);

  const startProjectEdit = useCallback(() => {
    if (!project) return;
    setProjectForm({
      name: project.name || '',
      introduction: project.introduction || '',
      repoUrl: project.repoUrl || '',
      backupUrl: project.backupUrl || '',
      specialUnits: Array.isArray(project.specialUnits)
        ? [...project.specialUnits]
        : [],
    });
    setPptFile(null);
    setProjectErr('');
    setProjectInfo('');
    setProjectEditing(true);
  }, [project]);

  const cancelProjectEdit = useCallback(() => {
    setProjectEditing(false);
    setPptFile(null);
    setProjectErr('');
  }, []);

  const handleSubmitProject = useCallback(
    async (ev) => {
      ev?.preventDefault();
      if (!team?.id) return;
      const isUpdate = !!project;
      setProjectErr('');
      setProjectInfo('');

      const name = projectForm.name.trim();
      const introduction = projectForm.introduction.trim();
      const repoUrl = projectForm.repoUrl.trim();
      const backupUrl = projectForm.backupUrl.trim();

      if (!isUpdate) {
        if (!name) {
          setProjectErr('请填写项目名称。');
          return;
        }
        if (!introduction) {
          setProjectErr('请填写项目介绍。');
          return;
        }
        if (!/^https?:\/\//i.test(repoUrl)) {
          setProjectErr('请填写有效的仓库链接（http/https 开头）。');
          return;
        }
        if (!pptFile) {
          setProjectErr('请选择 PPT 文件。');
          return;
        }
      }

      const formData = new FormData();
      if (!isUpdate || name !== (project?.name || '')) {
        formData.append('name', name);
      }
      if (!isUpdate || introduction !== (project?.introduction || '')) {
        formData.append('introduction', introduction);
      }
      if (!isUpdate || repoUrl !== (project?.repoUrl || '')) {
        formData.append('repo_url', repoUrl);
      }
      if (backupUrl !== (project?.backupUrl || '')) {
        formData.append('backup_url', backupUrl);
      }
      if (pptFile) {
        formData.append('ppt', pptFile);
      }

      const selectedUnits = Array.isArray(projectForm.specialUnits)
        ? projectForm.specialUnits
        : [];
      const currentUnits = Array.isArray(project?.specialUnits)
        ? project.specialUnits
        : [];
      const unitsChanged =
        selectedUnits.length !== currentUnits.length ||
        selectedUnits.some((u) => !currentUnits.includes(u));
      if (!isUpdate ? selectedUnits.length > 0 : unitsChanged) {
        if (selectedUnits.length === 0) {
          formData.append('special_units', '[]');
        } else {
          selectedUnits.forEach((u) => formData.append('special_units', u));
        }
      }

      setProjectBusy(true);
      try {
        const result = isUpdate
          ? await api.updateTeamProject(team.id, formData)
          : await api.submitTeamProject(team.id, formData);
        setProject(result || null);
        setProjectEditing(false);
        setPptFile(null);
        setProjectInfo(
          isUpdate ? '项目已更新。' : '项目已提交，等待选号轮次。',
        );
      } catch (error) {
        if (handleAuthError(error)) return;
        setProjectErr(userFacingError(error));
      } finally {
        setProjectBusy(false);
      }
    },
    [team, project, projectForm, pptFile, handleAuthError],
  );

  const handlePickSlot = useCallback(async () => {
    if (!team?.id || !selectedSlot) return;
    setProjectErr('');
    setProjectInfo('');
    setProjectBusy(true);
    try {
      const result = await api.pickProjectSlot(team.id, Number(selectedSlot));
      setProject(result || null);
      setSelectedSlot(null);
      setProjectInfo(`已选定路演序号 ${result?.slotNumber ?? selectedSlot}。`);
    } catch (error) {
      if (handleAuthError(error)) return;
      setProjectErr(userFacingError(error));
    } finally {
      setProjectBusy(false);
    }
  }, [team, selectedSlot, handleAuthError]);

  const handleDownloadPpt = useCallback(async () => {
    if (!team?.id) return;
    setProjectErr('');
    try {
      const data = await api.getProjectPptSignedUrl(team.id);
      const url =
        data?.downloadUrl ||
        data?.signedUrl ||
        data?.pptSignedUrl ||
        data?.url;
      if (!url) {
        setProjectErr('暂时无法获取下载链接，请稍后重试。');
        return;
      }
      window.open(resolveAttachmentUrl(url), '_blank', 'noopener');
    } catch (error) {
      if (handleAuthError(error)) return;
      setProjectErr(userFacingError(error));
    }
  }, [team, handleAuthError]);

  const votingEventSlug = event?.slug || registration?.eventSlug || null;

  useEffect(() => {
    if (tab !== 'voting') return undefined;
    let alive = true;
    setVotingLoading(true);
    setVotingErr('');
    Promise.all([
      api.getMyVotes(votingEventSlug).catch((error) => {
        if (error.status === 404) return null;
        throw error;
      }),
      api.getRoadshowQueue(votingEventSlug).catch((error) => {
        if (error.status === 404) return null;
        throw error;
      }),
    ])
      .then(([votesData, queueData]) => {
        if (!alive) return;
        if (votesData) {
          setVotingStatus({
            eventSlug: votesData.eventSlug,
            votingOpen: !!votesData.votingOpen,
            votesPerUser: votesData.votesPerUser ?? 3,
            votesUsed: votesData.votesUsed ?? 0,
            votesLeft:
              votesData.votesLeft ??
              (votesData.votesPerUser ?? 3) - (votesData.votesUsed ?? 0),
          });
          setMyVotes(Array.isArray(votesData.votes) ? votesData.votes : []);
        } else {
          setVotingStatus(null);
          setMyVotes([]);
        }
        setVotingProjects(
          Array.isArray(queueData?.queue) ? queueData.queue : [],
        );
      })
      .catch((error) => {
        if (!alive) return;
        if (handleAuthError(error)) return;
        setVotingErr(userFacingError(error));
      })
      .finally(() => {
        if (alive) setVotingLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [tab, votingEventSlug, handleAuthError]);

  const applyVoteCount = useCallback((next) => {
    if (!next) return;
    setVotingStatus((prev) => ({
      ...(prev || {}),
      votesPerUser: next.votesPerUser ?? prev?.votesPerUser ?? 3,
      votesUsed: next.votesUsed ?? prev?.votesUsed ?? 0,
      votesLeft:
        next.votesLeft ??
        (next.votesPerUser ?? prev?.votesPerUser ?? 3) -
          (next.votesUsed ?? prev?.votesUsed ?? 0),
    }));
  }, []);

  const handleCastVote = useCallback(
    async (teamProjectId) => {
      if (!teamProjectId) return;
      setVotingErr('');
      setVotingInfo('');
      setVotingBusyId(teamProjectId);
      try {
        const result = await api.castVote(votingEventSlug, teamProjectId);
        applyVoteCount(result);
        if (result?.vote) {
          setMyVotes((prev) => {
            if (prev.some((v) => v.teamProjectId === teamProjectId)) return prev;
            return [...prev, result.vote];
          });
        } else {
          setMyVotes((prev) =>
            prev.some((v) => v.teamProjectId === teamProjectId)
              ? prev
              : [...prev, { teamProjectId }],
          );
        }
        setVotingInfo('已投出一票。');
      } catch (error) {
        if (handleAuthError(error)) return;
        setVotingErr(userFacingError(error));
      } finally {
        setVotingBusyId(null);
      }
    },
    [votingEventSlug, applyVoteCount, handleAuthError],
  );

  const handleRevokeVote = useCallback(
    async (teamProjectId) => {
      if (!teamProjectId) return;
      if (
        typeof window !== 'undefined' &&
        !window.confirm('确认撤回这一票？')
      ) {
        return;
      }
      setVotingErr('');
      setVotingInfo('');
      setVotingBusyId(teamProjectId);
      try {
        const result = await api.revokeVote(votingEventSlug, teamProjectId);
        applyVoteCount(result);
        setMyVotes((prev) =>
          prev.filter((v) => v.teamProjectId !== teamProjectId),
        );
        setVotingInfo('已撤回该投票。');
      } catch (error) {
        if (handleAuthError(error)) return;
        setVotingErr(userFacingError(error));
      } finally {
        setVotingBusyId(null);
      }
    },
    [votingEventSlug, applyVoteCount, handleAuthError],
  );

  if (loading) {
    return (
      <div className="dash">
        <main className="dash-main">
          <div className="dash-card dash-empty">
            <div className="c-label">/ LOADING</div>
            <h1 className="dash-empty-title">
              正在读取
              <br />
              <em>报名状态。</em>
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (err) {
    return (
      <div className="dash">
        <main className="dash-main">
          <div className="dash-card dash-empty">
            <div className="c-label">/ ERROR</div>
            <h1 className="dash-empty-title">
              无法读取
              <br />
              <em>用户信息。</em>
            </h1>
            <p className="dash-empty-sub">{err}</p>
            <button
              type="button"
              className="auth-submit magnet dash-empty-back"
              onClick={() => window.location.reload()}
            >
              重试 <span className="arrow">↗</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dash">
      <header className="dash-nav">
        <Link to="/" className="dash-brand">
          <img
            src="/BoHack-LOGO.svg"
            alt="BoHack"
            className="dash-brand-logo"
          />
          <span>Bohack · 黑客中心</span>
        </Link>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={'tab magnet' + (tab === t.id ? ' on' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="me">
          <span className="me-name">
            {name} · <span className="me-id">{appId}</span>
          </span>
          <div className="avatar">{initials}</div>
          <a href="/login" className="me-signout" onClick={signOut}>退出</a>
        </div>
      </header>

      <main className="dash-main">
        {tab === 'overview' && (
          <>
            <section className="dash-hero">
              <div className="dash-card dash-welcome-card">
                <div className="dash-welcome">
                  <div>
                    <div className="c-label">你好,黑客</div>
                    <h1 className="dash-welcome-title">
                      欢迎回来,<br />
                      <em>{name}。</em>
                    </h1>
                    <p className="sub">
                      {registration
                        ? '你的 BOHACK 2026 报名信息已同步。请留好时间、带上电脑与充电器。距离线下黑客松启动还有:'
                        : '你还没有提交 BOHACK 2026 报名。完成报名后,这里会显示审核进度。距离线下黑客松启动还有:'}
                    </p>
                  </div>
                  <span className={registration?.status === 'approved' ? 'badge-ok' : 'badge-wait'}>
                    ◆ {statusLabel}
                  </span>
                </div>

                <div className="big-countdown">
                  <div className="bc">
                    <div className="bcn">{pad(cd.d)}</div>
                    <div className="bcl">天</div>
                  </div>
                  <div className="bc">
                    <div className="bcn">{pad(cd.h)}</div>
                    <div className="bcl">小时</div>
                  </div>
                  <div className="bc">
                    <div className="bcn">{pad(cd.m)}</div>
                    <div className="bcl">分钟</div>
                  </div>
                  <div className="bc">
                    <div className="bcn">{pad(cd.s)}</div>
                    <div className="bcl">秒</div>
                  </div>
                </div>
              </div>

              <div className="dash-card status-card">
                <div className="c-label">当前状态</div>
                <div className="status-row">
                  <span className="status-k">报名审核</span>
                  <span className={registration?.status === 'approved' ? 'badge-ok' : 'badge-wait'}>
                    {statusLabel}
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-k">联系邮箱</span>
                  <span className="status-v">{me?.email || '-'}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">学校</span>
                  <span className="status-v">{registration?.school || '待填写'}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">队伍</span>
                  <span className="status-v">{teamDisplayName}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">赛道</span>
                  <span className="status-v">{tracks}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">赛程参与</span>
                  <span className="status-v">{availabilityLabel}</span>
                </div>
                <div className="status-row">
                  <span className="status-k">周边尺码</span>
                  <span className="status-v">{tshirt}</span>
                </div>
                <div className="quick-actions">
                  <Link to="/questionnaire" className="qa magnet">
                    <span className="qk">✎</span>
                    <span className="ql">报名问卷</span>
                  </Link>
                  <Link to="/api-keys" className="qa magnet">
                    <span className="qk">API</span>
                    <span className="ql">API Key</span>
                  </Link>
                  <button
                    type="button"
                    className="qa magnet"
                    onClick={downloadCertificate}
                    disabled={certificateLoading || !registration}
                  >
                    <span className="qk">↓</span>
                    <span className="ql">
                      {certificateLoading ? '生成中' : '下载证件'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="qa magnet"
                    onClick={() => setTab('support')}
                  >
                    <span className="qk">⚙</span>
                    <span className="ql">账号设置</span>
                  </button>
                  {canCancel && (
                    <button
                      type="button"
                      className="qa magnet"
                      onClick={handleCancelRegistration}
                      disabled={cancelBusy}
                    >
                      <span className="qk">✕</span>
                      <span className="ql">{cancelBusy ? '取消中…' : '取消报名'}</span>
                    </button>
                  )}
                </div>
                {cancelErr && <div className="auth-err">{cancelErr}</div>}
              </div>
            </section>

            <section className="dash-grid">
              <div className="dash-card">
                <div className="section-h">
                  <h2>我的队伍 · {teamDisplayName}</h2>
                  <button type="button" onClick={() => setTab('team')}>
                    管理队伍 →
                  </button>
                </div>
                <div className="team-roster">
                  {team?.members?.length
                    ? team.members.map((m) => {
                        const memberName = m.username || '队员';
                        const memberRole = m.isLeader ? '队长' : '队员';
                        const isMe = isMyMember(m);
                        return (
                          <div className="member" key={m.userId}>
                            <div className="av">{initialsFrom(memberName)}</div>
                            <div className="member-meta">
                              <div className="name">{memberName}</div>
                              <div className="role">{memberRole}</div>
                            </div>
                            <span className="tag">
                              {isMe ? '我' : memberRole}
                            </span>
                          </div>
                        );
                      })
                    : (
                      <div className="member">
                        <div className="av">{initials}</div>
                        <div className="member-meta">
                          <div className="name">{name}</div>
                          <div className="role">{role}</div>
                        </div>
                        <span className="tag">我</span>
                      </div>
                    )}
                </div>

                <div className="section-h section-h-sp">
                  <h2>重要节点</h2>
                  <button type="button" onClick={() => setTab('schedule')}>
                    完整日程 →
                  </button>
                </div>
                <div className="timeline-list">
                  {TIMELINE.map((r, i) => (
                    <div
                      className={
                        'item ' +
                        (r.s === 'done' ? 'done' : r.s === 'now' ? 'now' : '')
                      }
                      key={`${r.t}-${i}`}
                    >
                      <div className="t">{r.t}</div>
                      <div className="d" />
                      <div className="l">{r.l}</div>
                      <div className="timeline-badge">
                        {r.s === 'now' && (
                          <span className="ticket-status open">进行中</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dash-side">
                {/* Temporarily hidden.
                <div className="project-panel">
                  <div className="c-label c-label-contrast">项目 pitch · 草稿</div>
                  <div className="pt">
                    “一台<br />会读空气的<br />环境智能体。”
                  </div>
                  <span className="track-chip">◢ 环境智能</span>
                  <textarea
                    defaultValue={registration?.note || '这里会同步你的报名 pitch,也可以先写下项目草稿。'}
                  />
                  <div className="project-footer">
                    <span className="save-hint">已自动保存</span>
                    <button type="button" className="auth-submit magnet save-btn">
                      保存草稿 <span className="arrow">↗</span>
                    </button>
                  </div>
                </div>

                <div className="dash-card accent">
                  <div className="c-label">奖金提醒</div>
                  <div className="c-title">
                    ¥25,000
                    <br />
                    总冠军奖金。
                  </div>
                  <p className="accent-body">
                    另加 Boreal Labs 孵化器面谈机会和一尊巨大奖杯。冠军只有一支,也许就是你们。
                  </p>
                </div>
                */}

                <div className="dash-card">
                  <div className="section-h">
                    <h2 className="section-h-sm">赛前清单</h2>
                    <Link to="/questionnaire">完善问卷 →</Link>
                  </div>
                  <div className="tickets">
                    {PREP_ITEMS.map((item, idx) => (
                      <div className="ticket" key={item.id}>
                        <span className="id">{item.id}</span>
                        <div>
                          <div className="tt">{item.title}</div>
                          <div className="th">{item.meta}</div>
                        </div>
                        <span
                          className={'ticket-status' + (idx === 0 ? ' open' : '')}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {registration && (
                  <div className="dash-card">
                    <div className="section-h">
                      <h2 className="section-h-sm">报名附件</h2>
                      {attachmentsEditable && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={attachmentBusy}
                        >
                          {attachmentBusy ? '上传中…' : '上传文件 →'}
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file);
                        e.target.value = '';
                      }}
                    />
                    <div className="tickets">
                      {attachments.length === 0 && (
                        <div className="ticket">
                          <span className="id">—</span>
                          <div>
                            <div className="tt">还没有上传文件</div>
                            <div className="th">支持简历、作品集、PDF / 图片 / 压缩包</div>
                          </div>
                        </div>
                      )}
                      {attachments.map((item, idx) => (
                        <div className="ticket" key={item.id}>
                          <span className="id">{String(idx + 1).padStart(2, '0')}</span>
                          <div>
                            <div className="tt">{item.fileName}</div>
                            <div className="th">
                              {item.kind} · {formatBytes(item.fileSize)}
                            </div>
                          </div>
                          <span className="ticket-status open">
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(item)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                color: 'inherit',
                                cursor: 'pointer',
                                font: 'inherit',
                              }}
                            >
                              下载
                            </button>
                            {attachmentsEditable && (
                              <>
                                {' · '}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttachment(item.id)}
                                  disabled={attachmentBusy}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    font: 'inherit',
                                  }}
                                >
                                  删除
                                </button>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    {attachmentsErr && (
                      <div className="auth-err">{attachmentsErr}</div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {tab === 'support' && (
          <div className="dash-card dash-empty">
            <div className="c-label">/ {currentTab?.label}</div>
            <h1 className="dash-empty-title">
              <em>账号</em>
              <br />
              修改密码。
            </h1>
            <p className="dash-empty-sub">
              使用当前密码验证后，设置新的登录密码。
            </p>

            <form
              className="auth-form"
              onSubmit={handleChangePassword}
              noValidate
              style={{ maxWidth: 480 }}
            >
              <div className="auth-field">
                <label>
                  当前密码
                  <span className="hint">必填</span>
                </label>
                <input
                  type="password"
                  value={pwForm.current}
                  onChange={(e) =>
                    setPwForm((s) => ({ ...s, current: e.target.value }))
                  }
                  autoComplete="current-password"
                />
              </div>
              <div className="auth-field">
                <label>
                  新密码
                  <span className="hint">至少 8 位</span>
                </label>
                <input
                  type="password"
                  value={pwForm.next}
                  onChange={(e) =>
                    setPwForm((s) => ({ ...s, next: e.target.value }))
                  }
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-field">
                <label>
                  确认新密码
                  <span className="hint">再来一次</span>
                </label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) =>
                    setPwForm((s) => ({ ...s, confirm: e.target.value }))
                  }
                  autoComplete="new-password"
                />
                {pwErr && <div className="auth-err">{pwErr}</div>}
                {pwInfo && !pwErr && <div className="auth-foot">{pwInfo}</div>}
              </div>
              <div className="auth-btn-row">
                <button
                  type="submit"
                  className="auth-submit magnet"
                  disabled={pwBusy}
                >
                  <span>{pwBusy ? '提交中…' : '更新密码'}</span>
                  <span className="arrow">↗</span>
                </button>
                <button
                  type="button"
                  className="auth-ghost magnet"
                  onClick={() => setTab('overview')}
                >
                  返回总览
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === 'team' && (
          <div className="dash-card">
            <div className="c-label">/ 我的队</div>
            {teamLoading && !team && (
              <p className="dash-empty-sub">正在读取队伍信息…</p>
            )}

            {!teamLoading && !team && (
              <>
                <h1 className="dash-empty-title">
                  还没<br />
                  <em>组队。</em>
                </h1>
                <p className="dash-empty-sub">
                  创建一支新队伍，或用邀请码加入现有队伍。每队最多 4 人。
                </p>

                <form
                  className="auth-form"
                  onSubmit={handleCreateTeam}
                  noValidate
                  style={{ maxWidth: 520, marginTop: 24 }}
                >
                  <div className="auth-field">
                    <label>
                      创建队伍
                      <span className="hint">1–100 字符</span>
                    </label>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="给队伍起个名字"
                      maxLength={100}
                    />
                  </div>
                  <div className="auth-btn-row">
                    <button
                      type="submit"
                      className="auth-submit magnet"
                      disabled={teamBusy}
                    >
                      <span>{teamBusy ? '处理中…' : '创建队伍'}</span>
                      <span className="arrow">↗</span>
                    </button>
                  </div>
                </form>

                <form
                  className="auth-form"
                  onSubmit={handleJoinTeam}
                  noValidate
                  style={{ maxWidth: 520, marginTop: 32 }}
                >
                  <div className="auth-field">
                    <label>
                      通过邀请码加入
                      <span className="hint">大小写不敏感</span>
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="A1B2C3D4"
                      autoCapitalize="characters"
                    />
                  </div>
                  <div className="auth-btn-row">
                    <button
                      type="submit"
                      className="auth-submit magnet"
                      disabled={teamBusy}
                    >
                      <span>{teamBusy ? '处理中…' : '加入队伍'}</span>
                      <span className="arrow">↗</span>
                    </button>
                  </div>
                </form>

                {teamErr && (
                  <div className="auth-err" style={{ marginTop: 16 }}>
                    {teamErr}
                  </div>
                )}
                {teamInfo && !teamErr && (
                  <div className="auth-foot" style={{ marginTop: 16 }}>
                    {teamInfo}
                  </div>
                )}
              </>
            )}

            {team && (
              <>
                <div className="section-h">
                  {renameEditing ? (
                    <form
                      onSubmit={handleRenameTeam}
                      style={{
                        display: 'flex',
                        gap: 8,
                        flex: 1,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        maxLength={100}
                        autoFocus
                        style={{ flex: 1 }}
                      />
                      <button type="submit" disabled={teamBusy}>
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRenameEditing(false);
                          setRenameValue(team.name || '');
                        }}
                      >
                        取消
                      </button>
                    </form>
                  ) : (
                    <>
                      <h2>我的队伍 · {team.name}</h2>
                      {isLeader && (
                        <button
                          type="button"
                          onClick={() => {
                            setRenameValue(team.name || '');
                            setRenameEditing(true);
                          }}
                        >
                          重命名 →
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div
                  className="status-row"
                  style={{ marginTop: 8 }}
                >
                  <span className="status-k">邀请码</span>
                  <span className="status-v">
                    <code
                      style={{
                        fontFamily: 'var(--f-mono)',
                        letterSpacing: '0.18em',
                        marginRight: 12,
                      }}
                    >
                      {team.inviteCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyInviteCode}
                      style={{
                        background: 'none',
                        border: '1px solid var(--rule)',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontFamily: 'var(--f-mono)',
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      复制
                    </button>
                  </span>
                </div>
                <div className="status-row">
                  <span className="status-k">成员</span>
                  <span className="status-v">
                    {team.memberCount ?? team.members?.length ?? 0} /{' '}
                    {team.maxMembers ?? 4}
                  </span>
                </div>
                {team.eventSlug && (
                  <div className="status-row">
                    <span className="status-k">赛事</span>
                    <span className="status-v">{team.eventSlug}</span>
                  </div>
                )}

                <div className="team-roster">
                  {(team.members || []).map((m) => {
                    const memberName = m.username || '队员';
                    const memberRole = m.isLeader ? '队长' : '队员';
                    const isMe = myUserId != null && m.userId === myUserId;
                    return (
                      <div className="member" key={m.userId}>
                        <div className="av">{initialsFrom(memberName)}</div>
                        <div className="member-meta">
                          <div className="name">{memberName}</div>
                          <div className="role">{memberRole}</div>
                        </div>
                        <span className="tag">
                          {isMe ? '我' : memberRole}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isLeader && team.members?.length > 1 && (
                  <div
                    className="auth-field"
                    style={{ marginTop: 24 }}
                  >
                    <label>
                      转让队长
                      <span className="hint">选择一名队员</span>
                    </label>
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                    >
                      <option value="">选择队员…</option>
                      {team.members
                        .filter((m) => !isMyMember(m))
                        .map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.username}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {teamErr && (
                  <div className="auth-err" style={{ marginTop: 16 }}>
                    {teamErr}
                  </div>
                )}
                {teamInfo && !teamErr && (
                  <div className="auth-foot" style={{ marginTop: 16 }}>
                    {teamInfo}
                  </div>
                )}

                <div className="auth-btn-row" style={{ marginTop: 24 }}>
                  {isLeader ? (
                    <>
                      {team.members?.length > 1 && (
                        <button
                          type="button"
                          className="auth-submit magnet"
                          onClick={handleTransferLeader}
                          disabled={teamBusy || !transferTargetId}
                        >
                          <span>{teamBusy ? '处理中…' : '转让队长'}</span>
                          <span className="arrow">↗</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="auth-ghost magnet"
                        onClick={handleDisbandTeam}
                        disabled={teamBusy}
                      >
                        解散队伍
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="auth-ghost magnet"
                      onClick={handleLeaveTeam}
                      disabled={teamBusy}
                    >
                      离开队伍
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'project' && (
          <ProjectTab
            team={team}
            project={project}
            projectLoading={projectLoading}
            projectErr={projectErr}
            projectInfo={projectInfo}
            projectBusy={projectBusy}
            projectEditing={projectEditing}
            projectForm={projectForm}
            setProjectForm={setProjectForm}
            pptFile={pptFile}
            setPptFile={setPptFile}
            pptInputRef={pptInputRef}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            isLeader={isLeader}
            onStartEdit={startProjectEdit}
            onCancelEdit={cancelProjectEdit}
            onSubmit={handleSubmitProject}
            onPickSlot={handlePickSlot}
            onDownloadPpt={handleDownloadPpt}
            onGoToTeam={() => setTab('team')}
          />
        )}

        {tab === 'voting' && (
          <VotingTab
            team={team}
            votingStatus={votingStatus}
            myVotes={myVotes}
            votingProjects={votingProjects}
            votingLoading={votingLoading}
            votingErr={votingErr}
            votingInfo={votingInfo}
            votingBusyId={votingBusyId}
            onCastVote={handleCastVote}
            onRevokeVote={handleRevokeVote}
          />
        )}

        {tab !== 'overview' && tab !== 'support' && tab !== 'team' && tab !== 'project' && tab !== 'voting' && (
          <div className="dash-card dash-empty">
            <div className="c-label">/ {currentTab?.label}</div>
            <h1 className="dash-empty-title">
              <em>{currentTab?.label}</em>
              <br />
              功能即将上线。
            </h1>
            <p className="dash-empty-sub">5 月 22 日前开放</p>
            <button
              type="button"
              className="auth-submit magnet dash-empty-back"
              onClick={() => setTab('overview')}
            >
              回到总览 <span className="arrow">↗</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const PROJECT_STATE_LABELS = {
  pending: '排队中',
  picking: '轮到你们了',
  picked: '已选号',
  skipped: '已跳过',
};

const SPECIAL_UNITS = ['AI+空间硬件', 'AI+文旅', 'AI+康养'];

function ProjectTab({
  team,
  project,
  projectLoading,
  projectErr,
  projectInfo,
  projectBusy,
  projectEditing,
  projectForm,
  setProjectForm,
  pptFile,
  setPptFile,
  pptInputRef,
  selectedSlot,
  setSelectedSlot,
  isLeader,
  onStartEdit,
  onCancelEdit,
  onSubmit,
  onPickSlot,
  onDownloadPpt,
  onGoToTeam,
}) {
  if (!team) {
    return (
      <div className="dash-card dash-empty">
        <div className="c-label">/ 项目</div>
        <h1 className="dash-empty-title">
          先去<em>组队</em>。
        </h1>
        <p className="dash-empty-sub">
          项目提交以队伍为单位。请先加入或创建一支队伍。
        </p>
        <button
          type="button"
          className="auth-submit magnet dash-empty-back"
          onClick={onGoToTeam}
        >
          去组队 <span className="arrow">↗</span>
        </button>
      </div>
    );
  }

  if (projectLoading && !project) {
    return (
      <div className="dash-card dash-empty">
        <div className="c-label">/ 项目</div>
        <h1 className="dash-empty-title">
          正在读取
          <br />
          <em>项目信息。</em>
        </h1>
      </div>
    );
  }

  const showForm = !project || projectEditing;
  const isUpdate = !!project;
  const isPicked = project?.state === 'picked';
  const isPicking = project?.state === 'picking';
  const isMyTurn = !!project?.isMyTurn;
  const canEdit = isLeader && project && !isPicked && project.state !== 'skipped';
  const stateLabel = project
    ? PROJECT_STATE_LABELS[project.state] || project.state
    : '';

  return (
    <div className="dash-card">
      <div className="c-label">/ 项目</div>

      {!project && !isLeader && (
        <>
          <h1 className="dash-empty-title">
            还没<br />
            <em>提交项目。</em>
          </h1>
          <p className="dash-empty-sub">
            项目由队长统一提交，请联系队长完善项目信息。
          </p>
        </>
      )}

      {showForm && isLeader && (
        <form
          className="auth-form"
          onSubmit={onSubmit}
          noValidate
          style={{ maxWidth: 720, marginTop: 8 }}
        >
          <h2 style={{ marginTop: 0 }}>
            {isUpdate ? '更新项目' : '提交你们的项目'}
          </h2>
          <p className="dash-empty-sub" style={{ marginTop: 0 }}>
            {isUpdate
              ? '只会更新填写的字段；不上传新 PPT 则保留原文件。'
              : '首次提交后即按提交时间排队选号，PPT 必填。'}
          </p>

          <div className="auth-field">
            <label>
              项目名称
              <span className="hint">最多 100 字符</span>
            </label>
            <input
              type="text"
              value={projectForm.name}
              maxLength={100}
              onChange={(e) =>
                setProjectForm((s) => ({ ...s, name: e.target.value }))
              }
              placeholder="给项目起个名字"
            />
          </div>

          <div className="auth-field">
            <label>
              项目介绍
              <span className="hint">最多 5000 字符</span>
            </label>
            <textarea
              rows={6}
              maxLength={5000}
              value={projectForm.introduction}
              onChange={(e) =>
                setProjectForm((s) => ({ ...s, introduction: e.target.value }))
              }
              placeholder="一句话说清楚你们做了什么、用了什么、解决了谁的问题。"
            />
          </div>

          <div className="auth-field">
            <label>
              仓库链接
              <span className="hint">http(s) 开头</span>
            </label>
            <input
              type="url"
              value={projectForm.repoUrl}
              maxLength={500}
              onChange={(e) =>
                setProjectForm((s) => ({ ...s, repoUrl: e.target.value }))
              }
              placeholder="https://github.com/your-team/your-project"
            />
          </div>

          <div className="auth-field">
            <label>
              备份链接
              <span className="hint">可选，PPT 的备份地址</span>
            </label>
            <input
              type="url"
              value={projectForm.backupUrl}
              maxLength={500}
              onChange={(e) =>
                setProjectForm((s) => ({ ...s, backupUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="auth-field">
            <label>
              特别单元
              <span className="hint">可选 · 可多选</span>
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 4,
              }}
            >
              {SPECIAL_UNITS.map((unit) => {
                const checked = projectForm.specialUnits.includes(unit);
                return (
                  <label
                    key={unit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid var(--rule)',
                      background: checked ? 'var(--ink)' : 'var(--paper)',
                      color: checked ? 'var(--lime)' : 'var(--ink)',
                      fontFamily: 'var(--f-cn)',
                      fontSize: 13,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      style={{ display: 'none' }}
                      onChange={() =>
                        setProjectForm((s) => {
                          const set = new Set(s.specialUnits);
                          if (set.has(unit)) set.delete(unit);
                          else set.add(unit);
                          return { ...s, specialUnits: Array.from(set) };
                        })
                      }
                    />
                    {checked ? '◆' : '◇'} {unit}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="auth-field">
            <label>
              PPT 文件
              <span className="hint">
                {isUpdate ? '不选则保留原文件' : '必填 · ppt / pptx / pdf / key'}
              </span>
            </label>
            <input
              ref={pptInputRef}
              type="file"
              accept=".ppt,.pptx,.pdf,.key"
              onChange={(e) => setPptFile(e.target.files?.[0] || null)}
            />
            {pptFile && (
              <div className="auth-foot" style={{ marginTop: 6 }}>
                已选择：{pptFile.name}
              </div>
            )}
            {isUpdate && !pptFile && project?.pptFilename && (
              <div className="auth-foot" style={{ marginTop: 6 }}>
                当前文件：{project.pptFilename}
              </div>
            )}
          </div>

          {projectErr && (
            <div className="auth-err" style={{ marginTop: 16 }}>
              {projectErr}
            </div>
          )}
          {projectInfo && !projectErr && (
            <div className="auth-foot" style={{ marginTop: 16 }}>
              {projectInfo}
            </div>
          )}

          <div className="auth-btn-row" style={{ marginTop: 16 }}>
            <button
              type="submit"
              className="auth-submit magnet"
              disabled={projectBusy}
            >
              <span>
                {projectBusy
                  ? '提交中…'
                  : isUpdate
                    ? '保存修改'
                    : '提交项目'}
              </span>
              <span className="arrow">↗</span>
            </button>
            {isUpdate && (
              <button
                type="button"
                className="auth-ghost magnet"
                onClick={onCancelEdit}
                disabled={projectBusy}
              >
                取消
              </button>
            )}
          </div>
        </form>
      )}

      {project && !projectEditing && (
        <>
          <div className="section-h">
            <h2>{project.name}</h2>
            {canEdit && (
              <button type="button" onClick={onStartEdit}>
                编辑项目 →
              </button>
            )}
          </div>

          <div className="status-row" style={{ marginTop: 8 }}>
            <span className="status-k">状态</span>
            <span
              className={
                isPicked || isMyTurn ? 'badge-ok' : 'badge-wait'
              }
            >
              ◆ {stateLabel}
            </span>
          </div>

          {isPicked && project.slotNumber != null && (
            <div
              style={{
                margin: '16px 0 24px',
                padding: '24px 28px',
                border: '1px solid var(--rule)',
                borderRadius: 18,
                background: 'var(--lime)',
              }}
            >
              <div className="c-label" style={{ marginBottom: 8 }}>
                / 路演序号
              </div>
              <div
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 64,
                  lineHeight: 1,
                  fontWeight: 600,
                }}
              >
                {String(project.slotNumber).padStart(2, '0')}
              </div>
            </div>
          )}

          {!isPicked && project.state !== 'skipped' && (
            <>
              <div className="status-row">
                <span className="status-k">排队位置</span>
                <span className="status-v">
                  {project.queuePosition != null
                    ? `第 ${project.queuePosition + 1} 位 / 共 ${
                        project.totalQueued ?? '?'
                      } 队`
                    : '—'}
                </span>
              </div>
              {!isMyTurn && (
                <p
                  className="dash-empty-sub"
                  style={{ marginTop: 12, marginBottom: 12 }}
                >
                  前面还有
                  {' '}
                  <strong>{project.queuePosition ?? 0}</strong>
                  {' '}
                  支队伍在选号，页面每 5 秒自动刷新，轮到你们时会自动展示选号面板。
                </p>
              )}
            </>
          )}

          {isMyTurn && isLeader && !isPicked && (
            <SlotPicker
              availableSlots={project.availableSlots || []}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              onConfirm={onPickSlot}
              busy={projectBusy}
            />
          )}

          {isMyTurn && !isLeader && !isPicked && (
            <div className="auth-foot" style={{ marginTop: 12 }}>
              已经轮到你们队，请提醒队长在此页面选号。
            </div>
          )}

          <div className="section-h section-h-sp">
            <h2 className="section-h-sm">项目信息</h2>
          </div>
          <div className="status-row">
            <span className="status-k">仓库</span>
            <span className="status-v">
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.repoUrl}
                </a>
              ) : (
                '—'
              )}
            </span>
          </div>
          {project.backupUrl && (
            <div className="status-row">
              <span className="status-k">备份</span>
              <span className="status-v">
                <a
                  href={project.backupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.backupUrl}
                </a>
              </span>
            </div>
          )}
          {Array.isArray(project.specialUnits) && project.specialUnits.length > 0 && (
            <div className="status-row">
              <span className="status-k">特别单元</span>
              <span className="status-v">
                {project.specialUnits.map((u) => (
                  <span
                    key={u}
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      marginRight: 6,
                      borderRadius: 999,
                      border: '1px solid var(--rule)',
                      fontFamily: 'var(--f-cn)',
                      fontSize: 12,
                    }}
                  >
                    ◆ {u}
                  </span>
                ))}
              </span>
            </div>
          )}
          <div className="status-row">
            <span className="status-k">PPT</span>
            <span className="status-v">
              {project.pptFilename || '—'}
              {project.pptFilename && (
                <>
                  {'  '}
                  <button
                    type="button"
                    onClick={onDownloadPpt}
                    style={{
                      background: 'none',
                      border: '1px solid var(--rule)',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontFamily: 'var(--f-mono)',
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      marginLeft: 12,
                    }}
                  >
                    下载
                  </button>
                </>
              )}
            </span>
          </div>
          {project.introduction && (
            <div style={{ marginTop: 18 }}>
              <div className="c-label" style={{ marginBottom: 8 }}>
                / 介绍
              </div>
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--f-cn)',
                  lineHeight: 1.6,
                }}
              >
                {project.introduction}
              </p>
            </div>
          )}

          {projectErr && (
            <div className="auth-err" style={{ marginTop: 16 }}>
              {projectErr}
            </div>
          )}
          {projectInfo && !projectErr && (
            <div className="auth-foot" style={{ marginTop: 16 }}>
              {projectInfo}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SlotPicker({ availableSlots, selectedSlot, onSelect, onConfirm, busy }) {
  const slots = Array.from({ length: 30 }, (_, i) => i + 1);
  const availableSet = new Set(availableSlots);
  return (
    <div style={{ marginTop: 20 }}>
      <div className="c-label" style={{ marginBottom: 12 }}>
        / 挑一个路演序号
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        {slots.map((slot) => {
          const isAvail = availableSet.has(slot);
          const isSelected = selectedSlot === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => isAvail && onSelect(slot)}
              disabled={!isAvail || busy}
              style={{
                fontFamily: 'var(--f-mono)',
                fontSize: 18,
                fontWeight: 600,
                padding: '14px 0',
                borderRadius: 12,
                border: '1px solid var(--rule)',
                background: isSelected
                  ? 'var(--ink)'
                  : isAvail
                    ? 'var(--paper)'
                    : 'rgba(0,0,0,0.04)',
                color: isSelected
                  ? 'var(--lime)'
                  : isAvail
                    ? 'var(--ink)'
                    : 'rgba(0,0,0,0.32)',
                cursor: isAvail && !busy ? 'pointer' : 'not-allowed',
                textDecoration: !isAvail ? 'line-through' : 'none',
              }}
            >
              {String(slot).padStart(2, '0')}
            </button>
          );
        })}
      </div>
      <div className="auth-btn-row" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="auth-submit magnet"
          onClick={onConfirm}
          disabled={busy || !selectedSlot}
        >
          <span>
            {busy
              ? '提交中…'
              : selectedSlot
                ? `确认选 ${String(selectedSlot).padStart(2, '0')} 号`
                : '请选择一个序号'}
          </span>
          <span className="arrow">↗</span>
        </button>
      </div>
      <p className="auth-foot" style={{ marginTop: 12 }}>
        选号一旦提交即锁定，无法在用户端修改；如需调整请联系现场工作人员。
      </p>
    </div>
  );
}

function VotingTab({
  team,
  votingStatus,
  myVotes,
  votingProjects,
  votingLoading,
  votingErr,
  votingInfo,
  votingBusyId,
  onCastVote,
  onRevokeVote,
}) {
  if (votingLoading && !votingStatus && votingProjects.length === 0) {
    return (
      <div className="dash-card dash-empty">
        <div className="c-label">/ 互投</div>
        <h1 className="dash-empty-title">
          正在读取
          <br />
          <em>投票状态。</em>
        </h1>
      </div>
    );
  }

  const votingOpen = !!votingStatus?.votingOpen;
  const votesPerUser = votingStatus?.votesPerUser ?? 3;
  const votesUsed = votingStatus?.votesUsed ?? 0;
  const votesLeft = votingStatus?.votesLeft ?? Math.max(0, votesPerUser - votesUsed);
  const myTeamId = team?.id ?? null;
  const votedByProjectId = new Map(
    (myVotes || []).map((v) => [v.teamProjectId, v]),
  );

  return (
    <div className="dash-card">
      <div className="c-label">/ 互投</div>
      <h1 className="dash-empty-title" style={{ marginBottom: 8 }}>
        为最棒的
        <br />
        <em>项目投票。</em>
      </h1>
      <p className="dash-empty-sub" style={{ marginTop: 0 }}>
        每人 {votesPerUser} 票，不能投自己队，同一项目最多投 1 票。
      </p>

      <div className="status-row" style={{ marginTop: 16 }}>
        <span className="status-k">状态</span>
        <span className={votingOpen ? 'badge-ok' : 'badge-wait'}>
          ◆ {votingOpen ? '投票进行中' : '投票暂未开放'}
        </span>
      </div>
      <div className="status-row">
        <span className="status-k">剩余票数</span>
        <span className="status-v">
          <strong>{votesLeft}</strong> / {votesPerUser}（已投 {votesUsed}）
        </span>
      </div>

      {!team && votingOpen && (
        <div className="auth-foot" style={{ marginTop: 12 }}>
          你还没加入任何队伍，需要先组队才能投票。
        </div>
      )}

      {votingErr && (
        <div className="auth-err" style={{ marginTop: 16 }}>
          {votingErr}
        </div>
      )}
      {votingInfo && !votingErr && (
        <div className="auth-foot" style={{ marginTop: 16 }}>
          {votingInfo}
        </div>
      )}

      <div className="section-h section-h-sp">
        <h2 className="section-h-sm">参赛项目</h2>
      </div>

      {votingProjects.length === 0 ? (
        <p className="dash-empty-sub" style={{ marginTop: 12 }}>
          暂时没有可投票的项目。
        </p>
      ) : (
        <div className="tickets">
          {votingProjects.map((item, idx) => {
            const projectId = item.teamProjectId;
            const projectName =
              item.projectName || item.teamName || '未命名项目';
            const teamName = item.teamName || '—';
            const slot = item.slotNumber;
            const state = item.state;
            const isMyTeam = myTeamId != null && item.teamId === myTeamId;
            const isSkipped = state === 'skipped';
            const myVote = votedByProjectId.get(projectId);
            const hasVoted = !!myVote;
            const quotaFull = votesLeft <= 0;
            const busy = votingBusyId === projectId;

            let label;
            let onClick;
            let disabled;
            if (isMyTeam) {
              label = '自己队';
              disabled = true;
            } else if (isSkipped) {
              label = '不参与';
              disabled = true;
            } else if (hasVoted) {
              label = busy ? '撤回中…' : '撤回';
              onClick = () => onRevokeVote(projectId);
              disabled = !votingOpen || busy;
            } else if (!votingOpen) {
              label = '未开放';
              disabled = true;
            } else if (quotaFull) {
              label = '票已用完';
              disabled = true;
            } else {
              label = busy ? '投票中…' : '投一票';
              onClick = () => onCastVote(projectId);
              disabled = busy;
            }

            return (
              <div className="ticket" key={projectId}>
                <span className="id">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <div className="tt">{projectName}</div>
                  <div className="th">
                    {teamName}
                    {slot != null ? ` · 序号 ${slot}` : ' · 尚未选号'}
                    {state && state !== 'picked' && state !== 'pending'
                      ? ` · ${state}`
                      : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  style={{
                    background: hasVoted ? 'var(--ink)' : 'var(--paper)',
                    color: hasVoted ? 'var(--lime)' : 'var(--ink)',
                    border: '1px solid var(--rule)',
                    borderRadius: 999,
                    padding: '6px 14px',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled && !hasVoted ? 0.55 : 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
