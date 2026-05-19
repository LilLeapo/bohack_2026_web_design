import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMagnet } from '../hooks/useMagnet.js';
import {
  api,
  clearAuthSession,
  getAccessToken,
  userFacingError,
} from '../lib/api.js';

const SUPPORT_EMAIL = 'contact@bohack.top';
const ROADSHOW_REGISTRATION_TYPE = 'roadshow';

const FORM_TYPES = {
  hackathon: {
    id: 'hackathon',
    label: '42h 黑客松个人报名',
    short: '黑客松报名',
    blurb: '作为参赛黑客加入团队，完成 42 小时线下连续创作并进入后续赋能与展演。',
    points: ['面向个人参赛者', '现场组队 · 42h 连续创作', '入选可登智博会舞台'],
    glyph: '⟁',
    title: '2026世界智能产业博览会·智能创新黑客松报名问卷',
    intro: [
      '欢迎报名参加本次智能创新黑客松大赛。',
      '本问卷将用于参赛资格筛选，请认真填写。',
      '所有信息仅用于本次活动使用，我们将严格保密。',
    ],
  },
  roadshow: {
    id: 'roadshow',
    label: '路演项目招募',
    short: '路演项目招募',
    blurb: '已有项目或作品，希望进入智博会现场路演与展演通道，与产业资源对接。',
    points: ['面向已有项目团队', '智博会现场路演展示', '导师与产业资源对接'],
    glyph: '◇',
    title: '2026世界智能产业博览会·智能创新黑客松路演项目招募问卷',
    intro: [
      '欢迎报名参加本次智博会·智能创新黑客松路演项目招募。',
      '本问卷将用于路演项目筛选，请认真填写。',
      '所有信息仅用于本次活动使用，我们将严格保密。',
    ],
  },
};

const FORM_TYPE_LIST = [FORM_TYPES.hackathon, FORM_TYPES.roadshow];

const STATUS_LABELS = {
  draft: '草稿',
  submitted: '已提交',
  under_review: '审核中',
  approved: '已通过',
  rejected: '未通过',
  cancelled: '已取消',
};

function resolveFormType(value) {
  if (value && FORM_TYPES[value]) return value;
  return null;
}

const SKILL_OPTIONS = [
  { v: 'engineering', lbl: '工程', glyph: '{ }' },
  { v: 'design', lbl: '设计', glyph: 'A◆' },
  { v: 'hardware', lbl: '硬件', glyph: '⬢' },
  { v: 'product', lbl: '产品', glyph: '△' },
  { v: 'research', lbl: '研究', glyph: '∑' },
  { v: 'creative', lbl: '创作 / 影像', glyph: '✦' },
];

const HACKATHON_QUESTIONS = [
  {
    kind: 'input',
    section: '基础信息',
    key: 'nickname',
    q: '昵称',
    hint: '用于报名沟通、微信群备注和现场识别。',
    required: true,
    placeholder: '例如：小波',
    max: 40,
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'realName',
    q: '姓名',
    hint: '请填写真实姓名，用于参赛资格确认。',
    required: true,
    placeholder: '例如：李家豪',
    max: 40,
  },
  {
    kind: 'single',
    section: '基础信息',
    key: 'gender',
    q: '性别',
    hint: '仅用于活动统计和服务准备。',
    required: true,
    options: [
      { v: 'male', lbl: '男' },
      { v: 'female', lbl: '女' },
    ],
  },
  {
    kind: 'single',
    section: '基础信息',
    key: 'ageGroup',
    q: '年龄段',
    hint: '请选择与你当前情况最接近的一项。',
    required: true,
    options: [
      { v: 'under_18', lbl: '18 岁以下' },
      { v: '18_22', lbl: '18-22 岁' },
      { v: '23_26', lbl: '23-26 岁' },
      { v: '27_35', lbl: '27-35 岁' },
      { v: 'over_35', lbl: '36 岁及以上' },
    ],
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'organization',
    q: '学校/机构 + 专业',
    hint: '例如：天津大学 / 计算机科学与技术。',
    required: true,
    placeholder: '学校或机构 / 专业或方向',
    max: 100,
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'contact',
    q: '电话/微信',
    hint: '请填写至少一种可联系到你的方式。',
    required: true,
    placeholder: '手机号或微信号',
    max: 80,
  },
  {
    kind: 'input',
    section: '基础信息',
    key: 'email',
    q: '邮箱',
    hint: '请确保您的邮箱能收到消息，未来重要通知将通过邮箱和微信群发送。',
    required: true,
    type: 'email',
    placeholder: 'you@example.com',
    max: 100,
  },
  {
    kind: 'text',
    section: '基础信息',
    key: 'resume',
    q: '个人简历',
    hint: '可填写简历链接、作品集链接，或简单介绍你的经历。',
    required: true,
    placeholder: '简历链接、作品集、个人主页，或一段简短介绍。',
    max: 500,
  },
  {
    kind: 'file',
    section: '基础信息',
    key: 'resumeFile',
    q: '上传简历文件',
    hint: '请上传 PDF 或 Word 格式的简历，文件大小不超过 5MB。',
    required: true,
    accept: '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    maxSize: 5 * 1024 * 1024,
    allowedExt: ['pdf', 'doc', 'docx'],
  },
  {
    kind: 'skillCards',
    section: '技能信息',
    key: 'skills',
    extraKey: 'skillsOther',
    q: '你擅长的技术或产品技能',
    hint: '可多选。选出你能带进团队的主要能力，也可以补充具体技术栈。',
    required: true,
    options: SKILL_OPTIONS,
    placeholder: '补充具体技术栈，例如 React、LLM Agent、Arduino、路演等。',
    max: 240,
  },
  {
    kind: 'input',
    section: '技能信息',
    key: 'keywords',
    q: '用几个关键词形容自己',
    hint: '用逗号、空格或短句都可以。',
    required: true,
    placeholder: '例如：好奇、执行快、会讲故事',
    max: 120,
  },
  {
    kind: 'text',
    section: '技能信息',
    key: 'projects',
    q: '请列出你过去的活动/项目/奖项',
    hint: '不限类型。黑客松、课程项目、创业项目、论文、比赛、社团经历都可以。',
    required: true,
    placeholder: '项目名称 + 你的角色 + 结果，简单列出即可。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'why',
    q: '你为什么想要参加这次世界智能产业博览会·智能创新黑客松大赛？',
    hint: '请写出你的真实动机：你期待遇见什么、验证什么、创造什么。',
    required: true,
    placeholder: '告诉我们你想来的原因。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'nonstandard',
    q: '你觉得自己身上最“不像标准答案”的地方是什么？',
    hint: '我们想看到你的独特性，而不是模板答案。',
    required: true,
    placeholder: '一个特质、一段经历，或一个你长期在意的问题。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'answerOrQuestion',
    q: '你认为这个时代更缺“答案”，还是更缺“好问题”？为什么？',
    hint: '可选。没有标准立场，关键是你的思考路径。',
    required: false,
    placeholder: '写下你的判断和理由。',
    max: 800,
  },
  {
    kind: 'text',
    section: '思考问题',
    key: 'postScarcityWork',
    q: '在一个不再以“生存”为前提的社会中，人类仍然需要“做事”吗？如果需要，这些事的价值来自哪里？',
    hint: '可选。欢迎理性、诗性、技术性或非常个人的回答。',
    required: false,
    placeholder: '写下你的想法。',
    max: 1000,
  },
  {
    kind: 'single',
    section: '思考问题',
    key: 'availability',
    q: '你是否能完整参加黑客松主要赛程？',
    hint: '主要赛程为线下黑客松、项目辅导与智博会线下展演相关安排。',
    required: true,
    options: [
      { v: 'full', lbl: '可以完整参加' },
      { v: 'mostly', lbl: '大部分时间可以参加' },
      { v: 'partial', lbl: '只能参加部分环节' },
      { v: 'unknown', lbl: '暂不确定' },
    ],
  },
];

const HACKATHON_SECTIONS = ['基础信息', '技能信息', '思考问题'];

const HACKATHON_GROUPS = [
  {
    section: '基础信息',
    title: '先确认你的基础信息',
    subtitle: '这些信息用于参赛资格确认和现场沟通。',
    keys: ['nickname', 'realName', 'gender', 'ageGroup'],
  },
  {
    section: '基础信息',
    title: '联系方式与背景',
    subtitle: '后续重要通知将通过邮箱和微信群发送。',
    keys: ['organization', 'contact', 'email', 'resume', 'resumeFile'],
  },
  {
    section: '技能信息',
    title: '技能、关键词与过往经历',
    subtitle: '帮我们理解你能带给团队和赛场的能力。',
    keys: ['skills', 'keywords', 'projects'],
  },
  {
    section: '思考问题',
    title: '参赛动机与独特性',
    subtitle: '这部分会用于参赛资格筛选，请认真填写。',
    keys: ['why', 'nonstandard'],
  },
  {
    section: '思考问题',
    title: '更多思考与赛程确认',
    subtitle: '开放题可选，赛程参与情况必填。',
    keys: ['answerOrQuestion', 'postScarcityWork', 'availability'],
  },
].map((group) => ({
  ...group,
  questions: group.keys.map((key) => HACKATHON_QUESTIONS.find((q) => q.key === key)),
}));

const HACKATHON_BY_KEY = Object.fromEntries(
  HACKATHON_QUESTIONS.map((q) => [q.key, q]),
);

const HACKATHON_FILE_FIELDS = [{ key: 'resumeFile', kind: 'resume' }];

const PRODUCT_FORM_OPTIONS = [
  { v: 'software', lbl: '软件产品' },
  { v: 'hardware', lbl: '硬件产品' },
  { v: 'software_hardware', lbl: '软件 + 硬件结合' },
  { v: 'ai', lbl: 'AI / 大模型应用' },
  { v: 'tool_platform', lbl: '工具 / 平台类产品' },
  { v: 'content_interactive', lbl: '内容 / 交互体验类项目' },
  { v: 'other', lbl: '其他，请说明' },
];

const PROJECT_STAGE_OPTIONS = [
  { v: 'idea', lbl: '已有明确想法和方案' },
  { v: 'prototype', lbl: '已完成原型设计' },
  { v: 'demo', lbl: '已完成 Demo' },
  { v: 'product', lbl: '已完成可演示产品' },
  { v: 'user_test', lbl: '已有真实用户测试' },
  { v: 'launched', lbl: '已经上线 / 投入使用' },
  { v: 'commercial', lbl: '已获得合作或商业化进展' },
  { v: 'other', lbl: '其他，请说明' },
];

const SOFTWARE_FORM_VALUES = [
  'software',
  'software_hardware',
  'ai',
  'tool_platform',
  'content_interactive',
];
const HARDWARE_FORM_VALUES = ['hardware', 'software_hardware'];

function isSoftwareProject(answers) {
  const list = Array.isArray(answers?.productForm) ? answers.productForm : [];
  return list.some((v) => SOFTWARE_FORM_VALUES.includes(v));
}

function isHardwareProject(answers) {
  const list = Array.isArray(answers?.productForm) ? answers.productForm : [];
  return list.some((v) => HARDWARE_FORM_VALUES.includes(v));
}

const ROADSHOW_QUESTIONS = [
  // 一、项目简介
  {
    kind: 'input',
    section: '项目简介',
    key: 'projectName',
    q: '项目名称',
    hint: '请填写项目正式名称或当前暂定名称。',
    required: true,
    placeholder: '例如：BoHack 智能体平台',
    max: 60,
  },
  {
    kind: 'input',
    section: '项目简介',
    key: 'projectTagline',
    q: '项目一句话介绍',
    hint: '请用一句话说明你的项目是什么。',
    required: true,
    placeholder: '一句话讲清楚项目是什么。',
    max: 100,
  },
  {
    kind: 'text',
    section: '项目简介',
    key: 'projectIntro',
    q: '项目简介',
    hint: '建议 200 字以内，讲清楚项目在做什么、解决什么问题。可包括：项目背景 · 目标用户/场景 · 当前痛点 · 解决方案 · 核心亮点。',
    required: true,
    placeholder: '项目背景、用户场景、痛点、解决方案、核心亮点。',
    max: 600,
  },
  {
    kind: 'multi',
    section: '项目简介',
    key: 'productForm',
    extraKey: 'productFormOther',
    otherValue: 'other',
    q: '项目目前的产品形态',
    hint: '可多选。决定后续展示材料的范围（软件 / 硬件等）。',
    required: true,
    options: PRODUCT_FORM_OPTIONS,
    placeholder: '若选择"其他"，请补充说明。',
    max: 120,
  },

  // 二、团队信息
  {
    kind: 'input',
    section: '团队信息',
    key: 'roadshowTeamName',
    q: '团队名称',
    required: true,
    placeholder: '团队名称',
    max: 60,
  },
  {
    kind: 'input',
    section: '团队信息',
    key: 'leaderName',
    q: '团队负责人姓名',
    required: true,
    placeholder: '负责人姓名',
    max: 40,
  },
  {
    kind: 'input',
    section: '团队信息',
    key: 'leaderContact',
    q: '团队负责人联系方式',
    hint: '请填写手机号或微信号，便于后续联系。',
    required: true,
    placeholder: '手机号或微信号',
    max: 80,
  },
  {
    kind: 'text',
    section: '团队信息',
    key: 'teamMembers',
    q: '团队成员信息',
    hint: '建议字段：姓名 · 学校/单位 · 专业/岗位 · 项目角色 · 联系方式（可选）。',
    required: true,
    placeholder: '示例：\n张三 · 天津大学 · 计算机 · 全栈 · 138xxxx',
    max: 1500,
  },

  // 三、项目阶段说明
  {
    kind: 'multi',
    section: '项目阶段',
    key: 'projectStage',
    extraKey: 'projectStageOther',
    otherValue: 'other',
    q: '项目当前所处阶段',
    hint: '可多选。',
    required: true,
    options: PROJECT_STAGE_OPTIONS,
    placeholder: '若选择"其他"，请补充说明。',
    max: 120,
  },
  {
    kind: 'text',
    section: '项目阶段',
    key: 'achievements',
    q: '已有成果说明',
    hint: '请说明项目目前取得的成果，例如 Demo、原型、用户测试、技术验证、实际应用、合作进展等。',
    required: true,
    placeholder: '已经做出的产出或验证。',
    max: 1200,
  },
  {
    kind: 'text',
    section: '项目阶段',
    key: 'nextPlan',
    q: '下一步计划',
    hint: '请说明项目接下来计划完善的方向，例如功能迭代、产品优化、用户拓展、硬件改进、商业合作等。',
    required: true,
    placeholder: '后续计划。',
    max: 1200,
  },

  // 四、展示材料
  {
    kind: 'file',
    section: '展示材料',
    key: 'pitchDeck',
    q: '路演 PPT 上传',
    hint: '请上传项目路演 PPT，用于初筛及后续展示评审。支持 PDF / PPT / PPTX。',
    required: true,
    accept: '.pdf,.ppt,.pptx',
    maxSize: 50 * 1024 * 1024,
    allowedExt: ['pdf', 'ppt', 'pptx'],
  },
  {
    kind: 'input',
    section: '展示材料',
    key: 'codeRepo',
    q: '代码链接',
    hint: '软件项目必填；纯硬件项目可填"无"。可填 GitHub / Gitee / 其他可访问的代码仓库链接。',
    required: false,
    requiredIf: isSoftwareProject,
    placeholder: 'https://github.com/...',
    max: 300,
  },
  {
    kind: 'text',
    section: '展示材料',
    key: 'hardwareDesc',
    q: '硬件说明（文字）',
    hint: '硬件项目必填；纯软件项目可填"无"。请说明硬件结构、功能、使用方式与演示条件。',
    required: false,
    requiredIf: isHardwareProject,
    placeholder: '硬件结构、功能、使用方式、演示条件。',
    max: 1500,
  },
  {
    kind: 'file',
    section: '展示材料',
    key: 'hardwareSpecFile',
    q: '硬件说明材料（可选上传）',
    hint: '可选。补充硬件结构图、说明文档等，仅硬件项目需要。',
    required: false,
    accept: '.pdf,.doc,.docx,.zip,.png,.jpg,.jpeg',
    maxSize: 50 * 1024 * 1024,
    allowedExt: ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg'],
  },
  {
    kind: 'file',
    section: '展示材料',
    key: 'otherMaterials',
    q: '其他展示材料',
    hint: '可选。可补充上传产品介绍、设计图、测试视频、技术文档等。',
    required: false,
    accept: '.pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.mp4,.mov',
    maxSize: 100 * 1024 * 1024,
    allowedExt: ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg', 'jpeg', 'mp4', 'mov'],
  },

  // 五、视频材料
  {
    kind: 'file',
    section: '视频材料',
    key: 'demoVideo',
    q: '产品演示视频',
    hint: '请上传可以展示项目效果的演示视频。支持 mp4 / mov，建议不超过 200MB。',
    required: false,
    accept: 'video/*,.mp4,.mov,.m4v',
    maxSize: 200 * 1024 * 1024,
    allowedExt: ['mp4', 'mov', 'm4v'],
  },
  {
    kind: 'file',
    section: '视频材料',
    key: 'pitchVideo',
    q: '模拟路演视频上传',
    hint: '请提交一段模拟路演视频（限时 3 分钟），用于了解项目表达和展示效果。',
    required: false,
    accept: 'video/*,.mp4,.mov,.m4v',
    maxSize: 200 * 1024 * 1024,
    allowedExt: ['mp4', 'mov', 'm4v'],
  },

  // 六、补充材料
  {
    kind: 'text',
    section: '补充材料',
    key: 'awardsText',
    q: '获奖经历',
    hint: '选填。如项目或团队曾获得奖项，请填写奖项名称、时间、主办方。',
    required: false,
    placeholder: '奖项名称 + 时间 + 主办方。',
    max: 1000,
  },
  {
    kind: 'file',
    section: '补充材料',
    key: 'awardsFile',
    q: '获奖证明材料（可选）',
    hint: '选填。上传相关证明材料。',
    required: false,
    accept: '.pdf,.png,.jpg,.jpeg,.zip',
    maxSize: 30 * 1024 * 1024,
    allowedExt: ['pdf', 'png', 'jpg', 'jpeg', 'zip'],
  },
  {
    kind: 'text',
    section: '补充材料',
    key: 'pastCompetitions',
    q: '过往参赛记录',
    hint: '选填。如项目曾参加其他比赛、路演、营队或展示活动，请简要说明。',
    required: false,
    placeholder: '比赛 / 路演名称 + 时间 + 主办方 + 结果。',
    max: 1000,
  },
  {
    kind: 'text',
    section: '补充材料',
    key: 'mediaReportsText',
    q: '媒体报道（链接）',
    hint: '选填。如项目曾被媒体、公众号、视频平台等报道，请提交相关链接。',
    required: false,
    placeholder: '媒体名称 + 链接。',
    max: 600,
  },
  {
    kind: 'file',
    section: '补充材料',
    key: 'mediaReportsFile',
    q: '媒体报道截图（可选）',
    hint: '选填。补充上传媒体报道截图等。',
    required: false,
    accept: '.pdf,.png,.jpg,.jpeg,.zip',
    maxSize: 30 * 1024 * 1024,
    allowedExt: ['pdf', 'png', 'jpg', 'jpeg', 'zip'],
  },
  {
    kind: 'text',
    section: '补充材料',
    key: 'userFeedbackText',
    q: '用户反馈',
    hint: '选填。如项目已有用户使用、测试或反馈，请提交相关说明或数据。',
    required: false,
    placeholder: '用户反馈摘要、数据指标等。',
    max: 1000,
  },
  {
    kind: 'file',
    section: '补充材料',
    key: 'userFeedbackFile',
    q: '用户反馈材料（可选）',
    hint: '选填。上传截图、报告等。',
    required: false,
    accept: '.pdf,.png,.jpg,.jpeg,.zip',
    maxSize: 30 * 1024 * 1024,
    allowedExt: ['pdf', 'png', 'jpg', 'jpeg', 'zip'],
  },
  {
    kind: 'text',
    section: '补充材料',
    key: 'cooperation',
    q: '合作进展',
    hint: '选填。如项目已有企业、学校、机构、园区或其他合作方，请说明合作内容和当前进展。',
    required: false,
    placeholder: '合作方 + 合作内容 + 当前进展。',
    max: 1000,
  },
];

const ROADSHOW_GROUPS = [
  {
    section: '项目简介',
    title: '一、项目简介',
    subtitle: '简要介绍项目在做什么、解决什么问题。',
    keys: ['projectName', 'projectTagline', 'projectIntro', 'productForm'],
  },
  {
    section: '团队信息',
    title: '二、团队信息',
    subtitle: '请填写负责人和成员的关键信息，便于后续沟通。',
    keys: ['roadshowTeamName', 'leaderName', 'leaderContact', 'teamMembers'],
  },
  {
    section: '项目阶段',
    title: '三、项目阶段说明',
    subtitle: '说明当前进度、已有成果与下一步计划。',
    keys: ['projectStage', 'achievements', 'nextPlan'],
  },
  {
    section: '展示材料',
    title: '四、展示材料提交',
    subtitle: 'PPT 必传；软件项目请补代码链接，硬件项目请补硬件说明。',
    keys: [
      'pitchDeck',
      'codeRepo',
      'hardwareDesc',
      'hardwareSpecFile',
      'otherMaterials',
    ],
  },
  {
    section: '视频材料',
    title: '五、视频材料提交',
    subtitle: '产品演示视频 + 模拟路演视频，请尽量保证清晰可辨。',
    keys: ['demoVideo', 'pitchVideo'],
  },
  {
    section: '补充材料',
    title: '六、补充材料（选填）',
    subtitle: '获奖、参赛、媒体、用户反馈、合作进展可按需补充。',
    keys: [
      'awardsText',
      'awardsFile',
      'pastCompetitions',
      'mediaReportsText',
      'mediaReportsFile',
      'userFeedbackText',
      'userFeedbackFile',
      'cooperation',
    ],
  },
].map((group) => ({
  ...group,
  questions: group.keys.map((key) =>
    ROADSHOW_QUESTIONS.find((q) => q.key === key),
  ),
}));

const ROADSHOW_SECTIONS = [
  '项目简介',
  '团队信息',
  '项目阶段',
  '展示材料',
  '视频材料',
  '补充材料',
];

const ROADSHOW_BY_KEY = Object.fromEntries(
  ROADSHOW_QUESTIONS.map((q) => [q.key, q]),
);

const ROADSHOW_FILE_FIELDS = [
  { key: 'pitchDeck', kind: 'roadshow_pitch_deck' },
  { key: 'hardwareSpecFile', kind: 'roadshow_hardware_spec' },
  { key: 'otherMaterials', kind: 'roadshow_other_materials' },
  { key: 'demoVideo', kind: 'roadshow_demo_video' },
  { key: 'pitchVideo', kind: 'roadshow_pitch_video' },
  { key: 'awardsFile', kind: 'roadshow_awards' },
  { key: 'mediaReportsFile', kind: 'roadshow_media_reports' },
  { key: 'userFeedbackFile', kind: 'roadshow_user_feedback' },
];

function getFormConfig(formType) {
  if (formType === 'roadshow') {
    return {
      type: 'roadshow',
      questions: ROADSHOW_QUESTIONS,
      groups: ROADSHOW_GROUPS,
      sections: ROADSHOW_SECTIONS,
      byKey: ROADSHOW_BY_KEY,
      fileFields: ROADSHOW_FILE_FIELDS,
    };
  }
  return {
    type: 'hackathon',
    questions: HACKATHON_QUESTIONS,
    groups: HACKATHON_GROUPS,
    sections: HACKATHON_SECTIONS,
    byKey: HACKATHON_BY_KEY,
    fileFields: HACKATHON_FILE_FIELDS,
  };
}

function isEmail(value) {
  return /.+@.+\..+/.test(value);
}

function valueText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function compactErrorData(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  if (typeof data !== 'object') return String(data);

  const direct = data.message || data.detail || data.error || data.reason;
  if (typeof direct === 'string' && direct.trim()) return direct.trim();

  if (data.errors && typeof data.errors === 'object') {
    const lines = Object.entries(data.errors)
      .map(([key, value]) => {
        const text = Array.isArray(value) ? value.join('；') : String(value);
        return `${key}: ${text}`;
      })
      .filter(Boolean);
    if (lines.length) return lines.join('；');
  }

  try {
    return JSON.stringify(data);
  } catch {
    return '';
  }
}

function buildQuestionnaireError(error) {
  const friendly = userFacingError(error);
  const details = [];
  const backendMessage = valueText(error?.message);
  const backendData = compactErrorData(error?.data);

  if (backendMessage && backendMessage !== friendly) {
    details.push(`后端信息：${backendMessage}`);
  }
  if (error?.code !== undefined && error?.code !== null) {
    details.push(`错误码：${error.code}`);
  }
  if (backendData && backendData !== backendMessage) {
    details.push(`详细信息：${backendData}`);
  }

  return {
    friendly,
    details: details.map((line) =>
      line.length > 600 ? `${line.slice(0, 600)}...` : line,
    ),
  };
}

function questionnaireErrorText(error) {
  const { friendly, details } = buildQuestionnaireError(error);
  return [friendly, ...details].join('；');
}

function optionLabel(question, value) {
  return question.options.find((o) => o.v === value)?.lbl || '';
}

function optionValue(question, value) {
  if (!value) return undefined;
  return question.options.find((o) => o.v === value || o.lbl === value)?.v;
}

function isFileValue(value) {
  return typeof File !== 'undefined' && value instanceof File;
}

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

function questionnairesFromExtra(extra) {
  const questionnaires =
    extra?.questionnaires && typeof extra.questionnaires === 'object'
      ? { ...extra.questionnaires }
      : {};
  const legacyType = resolveFormType(extra?.formType || extra?.questionnaire?.formType);
  if (legacyType && extra?.questionnaire && !questionnaires[legacyType]) {
    questionnaires[legacyType] = extra.questionnaire;
  }
  return questionnaires;
}

function questionnaireForType(registration, formType) {
  if (!registration || !formType) return {};
  const extra = parseExtra(registration);
  return questionnairesFromExtra(extra)[formType] || {};
}

function hasQuestionnaire(registration, formType) {
  if (!registration || !formType) return false;

  const extra = parseExtra(registration);
  const questionnaire = questionnairesFromExtra(extra)[formType];
  if (
    questionnaire &&
    typeof questionnaire === 'object' &&
    Object.keys(questionnaire).length > 0
  ) {
    return true;
  }

  if (
    Array.isArray(extra.submittedQuestionnaires) &&
    extra.submittedQuestionnaires.includes(formType)
  ) {
    return true;
  }

  return (
    resolveFormType(extra.formType || extra.questionnaire?.formType) === formType ||
    registration.source === `bohack-questionnaire-${formType}` ||
    (formType === 'hackathon' && registration.source === 'bohack-questionnaire')
  );
}

function formStatusFor(registration, formType) {
  const submitted = hasQuestionnaire(registration, formType);
  return {
    submitted,
    status: submitted ? registration?.status || 'submitted' : null,
  };
}

function formStatusText(status) {
  if (!status?.submitted) return '开始填写';
  return `${STATUS_LABELS[status.status] || '已填写'} · 修改回答`;
}

function registrationForFormType(formType, registrations) {
  if (formType === 'roadshow') {
    if (registrations.roadshow) return registrations.roadshow;
    if (hasQuestionnaire(registrations.participant, 'roadshow')) {
      return registrations.participant;
    }
    return null;
  }
  return registrations.participant || null;
}

function logChooserStatuses(registration, statuses) {
  if (typeof console === 'undefined') return;

  console.info('[Questionnaire chooser] form status check', {
    registrationId: registration?.id || null,
    registrationStatus: registration?.status || null,
    registrationSource: registration?.source || null,
    statuses: Object.fromEntries(
      Object.entries(statuses).map(([type, status]) => [
        type,
        {
          ...status,
          buttonText: formStatusText(status),
        },
      ]),
    ),
  });
}

function effectiveRequired(question, answers) {
  if (typeof question.requiredIf === 'function') {
    return Boolean(question.requiredIf(answers || {}));
  }
  return Boolean(question.required);
}

function answersFromHackathon(registration) {
  if (!registration) return {};

  const extra = parseExtra(registration);
  const questionnaire = questionnaireForType(registration, 'hackathon');

  return {
    nickname: valueText(questionnaire.nickname || extra.nickname),
    realName: valueText(questionnaire.realName || registration.realName),
    gender: optionValue(HACKATHON_BY_KEY.gender, questionnaire.gender || extra.gender),
    ageGroup: optionValue(HACKATHON_BY_KEY.ageGroup, questionnaire.ageGroup || extra.ageGroup),
    organization: valueText(questionnaire.organization || registration.school),
    contact: valueText(questionnaire.contact || registration.phone),
    email: valueText(questionnaire.email || registration.emailSnapshot),
    resume: valueText(questionnaire.resume || extra.resume),
    skills: Array.isArray(questionnaire.skillTypes) ? questionnaire.skillTypes : [],
    skillsOther: valueText(questionnaire.skillsOther),
    keywords: valueText(questionnaire.keywords || extra.keywords),
    projects: valueText(questionnaire.projects || extra.projects),
    why: valueText(questionnaire.why || registration.bio),
    nonstandard: valueText(questionnaire.nonstandard || extra.nonstandard),
    answerOrQuestion: valueText(questionnaire.answerOrQuestion || extra.answerOrQuestion),
    postScarcityWork: valueText(questionnaire.postScarcityWork || extra.postScarcityWork),
    availability: optionValue(
      HACKATHON_BY_KEY.availability,
      questionnaire.availability || extra.availability || registration.teamName
    ),
  };
}

function answersFromRoadshow(registration) {
  if (!registration) return {};

  const q = questionnaireForType(registration, 'roadshow');
  const arr = (v) => (Array.isArray(v) ? v : []);

  return {
    projectName: valueText(q.projectName),
    projectTagline: valueText(q.projectTagline),
    projectIntro: valueText(q.projectIntro),
    productForm: arr(q.productForm),
    productFormOther: valueText(q.productFormOther),
    roadshowTeamName: valueText(q.roadshowTeamName || registration.teamName),
    leaderName: valueText(q.leaderName || registration.realName),
    leaderContact: valueText(q.leaderContact || registration.phone),
    teamMembers: valueText(q.teamMembers),
    projectStage: arr(q.projectStage),
    projectStageOther: valueText(q.projectStageOther),
    achievements: valueText(q.achievements),
    nextPlan: valueText(q.nextPlan),
    codeRepo: valueText(q.codeRepo),
    hardwareDesc: valueText(q.hardwareDesc),
    awardsText: valueText(q.awardsText),
    pastCompetitions: valueText(q.pastCompetitions),
    mediaReportsText: valueText(q.mediaReportsText),
    userFeedbackText: valueText(q.userFeedbackText),
    cooperation: valueText(q.cooperation),
  };
}

function answersFromRegistration(registration, formType) {
  if (formType === 'roadshow') return answersFromRoadshow(registration);
  return answersFromHackathon(registration);
}

function fieldMessage(question, value, answers = {}) {
  const required = effectiveRequired(question, answers);
  const text = valueText(value);
  if (question.kind === 'file') {
    if (!value) return required ? '必填' : '可选';
    if (isFileValue(value)) {
      if (question.maxSize && value.size > question.maxSize) {
        return `文件超出 ${Math.round(question.maxSize / 1024 / 1024)}MB 限制`;
      }
      const ext = (value.name.split('.').pop() || '').toLowerCase();
      if (question.allowedExt && !question.allowedExt.includes(ext)) {
        return `仅支持 ${question.allowedExt.join(' / ')} 格式`;
      }
      return `已选择：${value.name}`;
    }
    if (typeof value === 'object' && value.fileName) {
      return `已上传：${value.fileName}`;
    }
    return '看起来不错。';
  }
  if (question.kind === 'skillCards') {
    const hasSkill =
      (Array.isArray(value) && value.length > 0) ||
      valueText(answers[question.extraKey]).length > 0;
    if (!required && !hasSkill) return '可选';
    if (required && !hasSkill) return '必填';
    return '看起来不错。';
  }
  if (question.kind === 'multi') {
    const list = Array.isArray(value) ? value : [];
    const otherSelected = question.otherValue && list.includes(question.otherValue);
    const otherFilled = valueText(answers[question.extraKey]).length > 0;
    if (!required && list.length === 0) return '可选';
    if (required && list.length === 0) return '必填';
    if (otherSelected && !otherFilled) return '请补充"其他"说明';
    return '看起来不错。';
  }
  if (!required && !text) return '可选';
  if (question.type === 'email' && !isEmail(text)) return '请输入有效邮箱';
  if (required && text.length < (question.min || 1)) return '必填';
  return '看起来不错。';
}

function isQuestionValid(question, answers) {
  const value = answers[question.key];
  const required = effectiveRequired(question, answers);
  if (question.kind === 'file') {
    if (!required && !value) return true;
    if (!value) return false;
    if (isFileValue(value)) {
      if (question.maxSize && value.size > question.maxSize) return false;
      const ext = (value.name.split('.').pop() || '').toLowerCase();
      if (question.allowedExt && !question.allowedExt.includes(ext)) return false;
      return true;
    }
    return Boolean(value && (value.id || value.fileName));
  }
  if (question.kind === 'skillCards') {
    if (!required) return true;
    return (
      (Array.isArray(value) && value.length > 0) ||
      valueText(answers[question.extraKey]).length > 0
    );
  }
  if (question.kind === 'multi') {
    const list = Array.isArray(value) ? value : [];
    if (required && list.length === 0) return false;
    if (
      question.otherValue &&
      list.includes(question.otherValue) &&
      !valueText(answers[question.extraKey])
    ) {
      return false;
    }
    return true;
  }
  if (!required) {
    if (question.type === 'email' && valueText(value)) {
      return isEmail(valueText(value));
    }
    return true;
  }
  if (question.kind === 'single') return value !== undefined;
  if (question.type === 'email') return isEmail(valueText(value));
  return valueText(value).length >= (question.min || 1);
}

function formatSkillAnswer(answers) {
  const selected = (answers.skills || [])
    .map((value) => SKILL_OPTIONS.find((option) => option.v === value)?.lbl)
    .filter(Boolean);
  const extra = valueText(answers.skillsOther);
  return [...selected, extra].filter(Boolean).join(' · ');
}

function formatMultiAnswer(answers, key, options, otherValue, extraKey) {
  const list = Array.isArray(answers[key]) ? answers[key] : [];
  const labels = list
    .filter((v) => v !== otherValue)
    .map((v) => options.find((o) => o.v === v)?.lbl)
    .filter(Boolean);
  const otherText = list.includes(otherValue) ? valueText(answers[extraKey]) : '';
  return [...labels, otherText].filter(Boolean).join(' · ');
}

function Ring({ pct }) {
  const C = 2 * Math.PI * 28;
  return (
    <div className="ring">
      <svg viewBox="0 0 72 72">
        <circle
          className="track-c"
          cx="36"
          cy="36"
          r="28"
          strokeWidth="4"
          fill="none"
        />
        <circle
          className="fill"
          cx="36"
          cy="36"
          r="28"
          strokeWidth="4"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
        />
      </svg>
      <div className="label">{Math.round(pct * 100)}%</div>
    </div>
  );
}

function QuestionnaireError({ error }) {
  if (!error) return null;
  const detail = typeof error === 'string'
    ? { friendly: error, details: [] }
    : error;

  return (
    <div className="auth-err q-submit-err" role="alert">
      <div>提交失败：{detail.friendly}</div>
      {detail.details?.length > 0 && (
        <ul>
          {detail.details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <div className="q-submit-err-contact">
        如果多次提交失败，请联系组委会邮箱{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        ，并附上以上报错信息。
      </div>
    </div>
  );
}

function FileDropField({ question, value, onChange }) {
  const inputId = `q-file-${question.key}`;
  const fileName = isFileValue(value)
    ? value.name
    : value?.fileName || value?.name || '';

  return (
    <div className="q-text q-file">
      <label className="q-file-box" htmlFor={inputId}>
        <span className="q-file-k">{fileName ? '当前简历' : '选择文件'}</span>
        <span className="q-file-name">
          {fileName || '点击上传 PDF / DOC / DOCX 简历'}
        </span>
        <span className="q-file-action">浏览文件 ↗</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={question.accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      <div className="q-meta">
        <span>{fieldMessage(question, value)}</span>
        {question.maxSize && (
          <span>上限 {Math.round(question.maxSize / 1024 / 1024)}MB</span>
        )}
      </div>
    </div>
  );
}

export default function Questionnaire() {
  useMagnet();
  const navigate = useNavigate();
  const { formType: routeFormType } = useParams();
  const forcedFormType = resolveFormType(routeFormType);

  const [i, setI] = useState(0);
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [formType, setFormType] = useState(null);
  const [formStatuses, setFormStatuses] = useState({
    hackathon: { submitted: false, status: null },
    roadshow: { submitted: false, status: null },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [resumeUploadErr, setResumeUploadErr] = useState('');

  const formMeta = formType ? FORM_TYPES[formType] : null;

  useEffect(() => {
    document.body.classList.add('q-body');
    return () => document.body.classList.remove('q-body');
  }, []);

  useEffect(() => {
    let alive = true;

    if (!getAccessToken()) {
      navigate('/login', { replace: true });
      return () => {
        alive = false;
      };
    }

    async function loadRegistration() {
      setLoading(true);
      setErr('');
      try {
        const [participantRegistration, roadshowRegistration] = await Promise.all([
          api.registrationStatus().catch((error) => {
            if (error.status === 404) return null;
            throw error;
          }),
          api
            .registrationStatus({ registrationType: ROADSHOW_REGISTRATION_TYPE })
            .catch((error) => {
              if (error.status === 404) return null;
              throw error;
            }),
        ]);
        if (!alive) return;
        const registrations = {
          participant: participantRegistration,
          roadshow: roadshowRegistration,
        };
        const selectedType = forcedFormType || null;
        const current = selectedType
          ? registrationForFormType(selectedType, registrations)
          : participantRegistration;
        setRegistration(current);

        const nextFormStatuses = {
          hackathon: formStatusFor(participantRegistration, 'hackathon'),
          roadshow: formStatusFor(
            roadshowRegistration || participantRegistration,
            'roadshow',
          ),
        };
        setFormStatuses(nextFormStatuses);
        logChooserStatuses(
          participantRegistration || roadshowRegistration,
          nextFormStatuses,
        );

        const baseAnswers = selectedType
          ? answersFromRegistration(current, selectedType)
          : {};
        if (current && selectedType) {
          const cfgForLoad = getFormConfig(selectedType);
          try {
            const list = await api.listAttachments(
              selectedType === 'roadshow'
                ? { registrationType: ROADSHOW_REGISTRATION_TYPE }
                : undefined,
            );
            if (Array.isArray(list)) {
              for (const { key, kind } of cfgForLoad.fileFields) {
                const att = list.find((item) => item.kind === kind);
                if (att) baseAnswers[key] = att;
              }
              if (
                cfgForLoad.type === 'hackathon' &&
                !baseAnswers.resumeFile &&
                list.length > 0
              ) {
                baseAnswers.resumeFile = list[0];
              }
            }
          } catch {
            // non-fatal; user can re-upload
          }
        }
        if (!alive) return;
        setAns(baseAnswers);
        setDone(Boolean(selectedType && hasQuestionnaire(current, selectedType)));
        setFormType(selectedType);
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

    loadRegistration();

    return () => {
      alive = false;
    };
  }, [forcedFormType, navigate]);

  const cfg = useMemo(
    () => getFormConfig(formType || 'hackathon'),
    [formType],
  );

  const page = formType ? cfg.groups[i] : null;
  const total = cfg.groups.length;
  const pct = done ? 1 : formType ? i / total : 0;

  const canNext = useCallback(() => {
    if (!page) return true;
    return page.questions.every((question) => isQuestionValid(question, ans));
  }, [page, ans]);

  const buildHackathonPayload = useCallback(() => {
    const skillsText = formatSkillAnswer(ans);
    const availability = optionLabel(
      HACKATHON_BY_KEY.availability,
      ans.availability,
    );
    const questionnaire = {
      title: formMeta.title,
      formType: formMeta.id,
      formLabel: formMeta.label,
      nickname: valueText(ans.nickname),
      realName: valueText(ans.realName),
      gender: optionLabel(HACKATHON_BY_KEY.gender, ans.gender),
      ageGroup: optionLabel(HACKATHON_BY_KEY.ageGroup, ans.ageGroup),
      organization: valueText(ans.organization),
      contact: valueText(ans.contact),
      email: valueText(ans.email).toLowerCase(),
      resume: valueText(ans.resume),
      skills: skillsText,
      skillTypes: Array.isArray(ans.skills) ? ans.skills : [],
      skillsOther: valueText(ans.skillsOther),
      keywords: valueText(ans.keywords),
      projects: valueText(ans.projects),
      why: valueText(ans.why),
      nonstandard: valueText(ans.nonstandard),
      answerOrQuestion: valueText(ans.answerOrQuestion),
      postScarcityWork: valueText(ans.postScarcityWork),
      availability,
    };
    const baseExtra = parseExtra(registration);
    const questionnaires = {
      ...questionnairesFromExtra(baseExtra),
      [formMeta.id]: questionnaire,
    };
    const extra = {
      ...baseExtra,
      questionnaires,
      submittedQuestionnaires: Object.keys(questionnaires),
      questionnaire,
      formType: formMeta.id,
      formLabel: formMeta.label,
      nickname: questionnaire.nickname,
      gender: questionnaire.gender,
      ageGroup: questionnaire.ageGroup,
      resume: questionnaire.resume,
      skills: questionnaire.skills,
      keywords: questionnaire.keywords,
      projects: questionnaire.projects,
      nonstandard: questionnaire.nonstandard,
      answerOrQuestion: questionnaire.answerOrQuestion,
      postScarcityWork: questionnaire.postScarcityWork,
      availability: questionnaire.availability,
    };
    return {
      realName: questionnaire.realName,
      phone: questionnaire.contact,
      school: questionnaire.organization,
      bio: questionnaire.why,
      teamName: questionnaire.availability,
      rolePreference: skillsText.slice(0, 50),
      source: `bohack-questionnaire-${formMeta.id}`,
      note: questionnaire.why,
      extra,
    };
  }, [ans, formMeta, registration]);

  const buildRoadshowPayload = useCallback(() => {
    const productFormText = formatMultiAnswer(
      ans,
      'productForm',
      PRODUCT_FORM_OPTIONS,
      'other',
      'productFormOther',
    );
    const projectStageText = formatMultiAnswer(
      ans,
      'projectStage',
      PROJECT_STAGE_OPTIONS,
      'other',
      'projectStageOther',
    );
    const questionnaire = {
      title: formMeta.title,
      formType: formMeta.id,
      formLabel: formMeta.label,
      projectName: valueText(ans.projectName),
      projectTagline: valueText(ans.projectTagline),
      projectIntro: valueText(ans.projectIntro),
      productForm: Array.isArray(ans.productForm) ? ans.productForm : [],
      productFormOther: valueText(ans.productFormOther),
      productFormText,
      roadshowTeamName: valueText(ans.roadshowTeamName),
      leaderName: valueText(ans.leaderName),
      leaderContact: valueText(ans.leaderContact),
      teamMembers: valueText(ans.teamMembers),
      projectStage: Array.isArray(ans.projectStage) ? ans.projectStage : [],
      projectStageOther: valueText(ans.projectStageOther),
      projectStageText,
      achievements: valueText(ans.achievements),
      nextPlan: valueText(ans.nextPlan),
      codeRepo: valueText(ans.codeRepo),
      hardwareDesc: valueText(ans.hardwareDesc),
      awardsText: valueText(ans.awardsText),
      pastCompetitions: valueText(ans.pastCompetitions),
      mediaReportsText: valueText(ans.mediaReportsText),
      userFeedbackText: valueText(ans.userFeedbackText),
      cooperation: valueText(ans.cooperation),
      isSoftwareProject: isSoftwareProject(ans),
      isHardwareProject: isHardwareProject(ans),
    };
    const baseExtra = parseExtra(registration);
    const questionnaires = {
      ...questionnairesFromExtra(baseExtra),
      [formMeta.id]: questionnaire,
    };
    const extra = {
      ...baseExtra,
      questionnaires,
      submittedQuestionnaires: Object.keys(questionnaires),
      questionnaire,
      formType: formMeta.id,
      formLabel: formMeta.label,
      projectName: questionnaire.projectName,
      projectTagline: questionnaire.projectTagline,
      productForm: questionnaire.productFormText,
      projectStage: questionnaire.projectStageText,
      isSoftwareProject: questionnaire.isSoftwareProject,
      isHardwareProject: questionnaire.isHardwareProject,
    };
    const rolePreference = (questionnaire.productFormText || '路演项目').slice(
      0,
      50,
    );
    return {
      registrationType: ROADSHOW_REGISTRATION_TYPE,
      realName: questionnaire.leaderName || questionnaire.projectName,
      phone: questionnaire.leaderContact,
      school: questionnaire.roadshowTeamName,
      bio: questionnaire.projectIntro || questionnaire.projectTagline,
      teamName: questionnaire.roadshowTeamName,
      rolePreference,
      source: `bohack-questionnaire-${formMeta.id}`,
      note: questionnaire.projectTagline || questionnaire.projectIntro,
      extra,
    };
  }, [ans, formMeta, registration]);

  const saveQuestionnaire = useCallback(async () => {
    if (!canNext()) return;
    if (!formMeta) return;

    const payload =
      cfg.type === 'roadshow'
        ? buildRoadshowPayload()
        : buildHackathonPayload();

    setSubmitting(true);
    setErr('');
    setResumeUploadErr('');
    try {
      const saved = registration
        ? await api.updateRegistration(payload)
        : await api.createRegistration(payload);
      setRegistration(saved);
      setFormStatuses((current) => ({
        ...current,
        [formMeta.id]: {
          submitted: true,
          status: saved?.status || 'submitted',
        },
      }));

      const failedUploads = [];
      for (const { key, kind } of cfg.fileFields) {
        const file = ans[key];
        if (!isFileValue(file)) continue;
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('kind', kind);
          if (cfg.type === 'roadshow') {
            formData.append('registrationType', ROADSHOW_REGISTRATION_TYPE);
          }
          const created = await api.uploadAttachment(formData);
          setAns((a) => ({ ...a, [key]: created }));
        } catch (uploadError) {
          if (uploadError.status === 401) {
            clearAuthSession();
            navigate('/login', { replace: true });
            return;
          }
          failedUploads.push(
            `${key}: ${questionnaireErrorText(uploadError)}`,
          );
        }
      }
      if (failedUploads.length) {
        setResumeUploadErr(
          `报名信息已保存，但部分文件上传失败：${failedUploads.join('；')}。请在"修改回答"中重新上传。`,
        );
      }

      setDone(true);
    } catch (error) {
      if (error.status === 401) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }
      setErr(buildQuestionnaireError(error));
    } finally {
      setSubmitting(false);
    }
  }, [
    ans,
    buildHackathonPayload,
    buildRoadshowPayload,
    canNext,
    cfg,
    formMeta,
    navigate,
    registration,
  ]);

  const next = useCallback(() => {
    if (i >= total - 1) saveQuestionnaire();
    else setI(i + 1);
  }, [i, total, saveQuestionnaire]);

  const canReturnToChooser = !forcedFormType;

  const back = useCallback(() => {
    if (done) {
      setDone(false);
      setI(total - 1);
    } else if (i > 0) setI(i - 1);
    else if (canReturnToChooser) {
      setFormType(null);
      setI(0);
    }
  }, [canReturnToChooser, done, i, total]);

  const up = (k, v) => setAns((a) => ({ ...a, [k]: v }));
  const toggleSkill = (value) =>
    setAns((a) => {
      const current = Array.isArray(a.skills) ? a.skills : [];
      return {
        ...a,
        skills: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  const toggleListValue = (key, value) =>
    setAns((a) => {
      const current = Array.isArray(a[key]) ? a[key] : [];
      return {
        ...a,
        [key]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });

  useEffect(() => {
    const onKey = (e) => {
      if (done || submitting) return;
      if (!formType) return;
      const tag = e.target?.tagName;
      if (e.key === 'Enter' && tag !== 'TEXTAREA' && canNext()) next();
      if (e.key === 'Backspace' && e.metaKey) back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, submitting, formType, canNext, next, back]);

  const sectionStatus = (name) => {
    const firstIdx = cfg.groups.findIndex((x) => x.section === name);
    const lastIdx = cfg.groups.map((x) => x.section).lastIndexOf(name);
    if (done) return 'done';
    if (i > lastIdx) return 'done';
    if (i >= firstIdx && i <= lastIdx) return 'cur';
    return '';
  };

  const today = useMemo(() => new Date().toLocaleDateString('zh-CN'), []);

  const summaryItems =
    cfg.type === 'roadshow'
      ? [
          ['报名类型', formMeta?.label],
          ['项目名称', ans.projectName],
          ['一句话介绍', ans.projectTagline],
          ['团队名称', ans.roadshowTeamName],
          ['负责人', ans.leaderName],
          ['联系方式', ans.leaderContact],
          [
            '产品形态',
            formatMultiAnswer(
              ans,
              'productForm',
              PRODUCT_FORM_OPTIONS,
              'other',
              'productFormOther',
            ),
          ],
          [
            '项目阶段',
            formatMultiAnswer(
              ans,
              'projectStage',
              PROJECT_STAGE_OPTIONS,
              'other',
              'projectStageOther',
            ),
          ],
        ]
      : [
          ['报名类型', formMeta?.label],
          ['昵称', ans.nickname],
          ['姓名', ans.realName],
          ['学校/机构', ans.organization],
          ['联系', ans.contact],
          ['技能', formatSkillAnswer(ans)],
          [
            '赛程',
            optionLabel(HACKATHON_BY_KEY.availability, ans.availability),
          ],
        ];

  if (loading) {
    return (
      <div className="q-shell">
        <main className="q-main">
          <div className="q-card">
            <div className="q-step-label">Registration Questionnaire</div>
            <h1 className="q-question">正在读取报名信息。</h1>
            <p className="q-hint">请稍候。</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="q-shell">
      <aside className="q-side">
        <div>
          <div className="q-brand">
            <img
              src="/BoHack-LOGO-%E5%8F%8D%E7%99%BD.svg"
              alt="BoHack"
              className="q-brand-logo"
            />
            <span>Bohack · 2026</span>
          </div>
          <div style={{ marginTop: 36 }}>
            <div className="q-step-label" style={{ opacity: 0.6 }}>
              Registration Questionnaire
            </div>
            <div className="q-title" style={{ marginTop: 10 }}>
              报名
              <br />
              <em>问卷。</em>
            </div>
            <p className="q-sub">
              {formMeta ? (
                <>
                  {formMeta.title}
                  <br />
                  {formMeta.intro.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </>
              ) : (
                <>
                  请先选择本次报名的类型。
                  <br />
                  42h 黑客松个人报名 与 路演项目招募 各自独立填写。
                </>
              )}
            </p>
          </div>
          {formType && (
            <div className="progress-ring">
              <Ring pct={pct} />
              <div className="progress-text">
                <div className="k">Progress</div>
                <div className="v">
                  {done ? '已完成' : `${i + 1} / ${total}`}
                </div>
              </div>
            </div>
          )}
          <div className="q-sections">
            {(formType ? cfg.sections : []).map((s, idx) => {
              const st = sectionStatus(s);
              return (
                <div
                  key={s}
                  className={'q-sec' + (st ? ' ' + st : '')}
                >
                  <span className="n">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{s}</span>
                  <span className="mk" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="q-side-foot">
          <div>Local draft · {today}</div>
          <div style={{ marginTop: 6 }}>
            ← 返回
            <Link
              to="/user"
              style={{
                borderBottom: '1px dashed currentColor',
                color: 'var(--lime)',
                marginLeft: 6,
              }}
            >
              控制台
            </Link>
          </div>
        </div>
      </aside>

      <main className="q-main">
        <div className="q-top">
          <Link to="/user">← 控制台</Link>
          <span>
            Questionnaire ·{' '}
            {!formType
              ? '选择报名类型'
              : done
                ? '已完成'
                : `Page ${i + 1} / ${total}`}
          </span>
        </div>

        {!formType && !done && (
          <div className="q-card q-chooser">
            <div className="q-step-label">Step 00 · 选择类型</div>
            <h1 className="q-question">
              你来报名的<br />
              <em>是哪一类？</em>
            </h1>
            <p className="q-hint">
              请选择本次填写的报名类型。两类问卷会分别记录与审核，提交后仍可在控制台修改。
            </p>

            <div className="q-choose-grid">
              {FORM_TYPE_LIST.map((opt, idx) => (
                <button
                  type="button"
                  key={opt.id}
                  className="q-choose-card magnet"
                  onClick={() => {
                    navigate(`/questionnaire/${opt.id}`);
                  }}
                >
                  <div className="q-choose-head">
                    <span className="q-choose-glyph">{opt.glyph}</span>
                    <span className="q-choose-n">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="q-choose-body">
                    <h2>{opt.label}</h2>
                    <p>{opt.blurb}</p>
                  </div>
                  <ul className="q-choose-points">
                    {opt.points.map((p) => (
                      <li key={p}>
                        <span className="dot" /> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="q-choose-foot">
                    {formStatusText(formStatuses[opt.id])}{' '}
                    <span className="arrow">↗</span>
                  </div>
                </button>
              ))}
            </div>

            <p className="q-choose-note">
              两类问卷会分别记录。你可以只填写其中一个，也可以按需要分别提交两份。
            </p>
          </div>
        )}

        {formType && !done && page && (
          <div className="q-card">
            <div className="q-step-label">
              {formMeta?.short} · {page.section} · 第 {i + 1} 页 ·{' '}
              {page.questions.filter((question) => question.required).length} 项必填
            </div>
            <h1 className="q-question">{page.title}</h1>
            <p className="q-hint">{page.subtitle}</p>

            <div className="q-field-stack">
              {page.questions.map((question) => (
                <section className="q-field-block" key={question.key}>
                  <div className="q-field-head">
                    <h2>
                      {question.q}
                      <span>
                        {effectiveRequired(question, ans) ? '必填' : '可选'}
                      </span>
                    </h2>
                    {question.hint && <p>{question.hint}</p>}
                  </div>

                  {question.kind === 'single' && (
                    <div className="q-options">
                      {question.options.map((o, n) => (
                        <label
                          key={o.v}
                          className={
                            'q-opt' +
                            (ans[question.key] === o.v ? ' on' : '')
                          }
                        >
                          <span className="key">{n + 1}</span>
                          <span>
                            <span className="lbl" style={{ display: 'block' }}>
                              {o.lbl}
                            </span>
                            {o.sub && <span className="sub">{o.sub}</span>}
                          </span>
                          <span className="mk" />
                          <input
                            type="radio"
                            checked={ans[question.key] === o.v}
                            onChange={() => up(question.key, o.v)}
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {question.kind === 'input' && (
                    <div className="q-text q-input">
                      <input
                        type={question.type || 'text'}
                        value={ans[question.key] || ''}
                        onChange={(e) => up(question.key, e.target.value)}
                        placeholder={question.placeholder}
                        maxLength={question.max}
                      />
                      <div className="q-meta">
                        <span>
                          {fieldMessage(question, ans[question.key], ans)}
                        </span>
                        {question.max && (
                          <span>
                            {(ans[question.key] || '').length} / {question.max}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {question.kind === 'multi' && (
                    <>
                      <div className="q-multi">
                        {question.options.map((option, n) => {
                          const selected = (ans[question.key] || []).includes(
                            option.v,
                          );
                          return (
                            <label
                              key={option.v}
                              className={'q-multi-opt' + (selected ? ' on' : '')}
                            >
                              <span className="key">{n + 1}</span>
                              <span className="lbl">{option.lbl}</span>
                              <span className="mk" />
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  toggleListValue(question.key, option.v)
                                }
                              />
                            </label>
                          );
                        })}
                      </div>
                      {question.extraKey && (
                        <div className="q-text q-input q-multi-extra">
                          <input
                            value={ans[question.extraKey] || ''}
                            onChange={(e) =>
                              up(question.extraKey, e.target.value)
                            }
                            placeholder={question.placeholder}
                            maxLength={question.max}
                            disabled={
                              question.otherValue &&
                              !(ans[question.key] || []).includes(
                                question.otherValue,
                              )
                            }
                          />
                          <div className="q-meta">
                            <span>
                              {fieldMessage(question, ans[question.key], ans)}
                            </span>
                            <span>
                              {(ans[question.extraKey] || '').length} /{' '}
                              {question.max}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {question.kind === 'skillCards' && (
                    <>
                      <div className="q-svg-grid q-skill-grid">
                        {question.options.map((option, n) => {
                          const selected = (ans[question.key] || []).includes(
                            option.v
                          );
                          return (
                            <button
                              type="button"
                              key={option.v}
                              className={'q-svg' + (selected ? ' on' : '')}
                              onClick={() => toggleSkill(option.v)}
                            >
                              <div className="glyph">{option.glyph}</div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span className="n">{option.lbl}</span>
                                <span className="n" style={{ opacity: 0.5 }}>
                                  {n + 1}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="q-text q-input q-skill-extra">
                        <input
                          value={ans[question.extraKey] || ''}
                          onChange={(e) => up(question.extraKey, e.target.value)}
                          placeholder={question.placeholder}
                          maxLength={question.max}
                        />
                        <div className="q-meta">
                          <span>
                            {fieldMessage(question, ans[question.key], ans)}
                          </span>
                          <span>
                            {(ans[question.extraKey] || '').length} / {question.max}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {question.kind === 'file' && (
                    <FileDropField
                      question={question}
                      value={ans[question.key]}
                      onChange={(file) => up(question.key, file)}
                    />
                  )}

                  {question.kind === 'text' && (
                    <div className="q-text">
                      <textarea
                        rows={6}
                        value={ans[question.key] || ''}
                        onChange={(e) => up(question.key, e.target.value)}
                        placeholder={question.placeholder}
                        maxLength={question.max}
                      />
                      <div className="q-meta">
                        <span>
                          {fieldMessage(question, ans[question.key], ans)}
                        </span>
                        {question.max && (
                          <span>
                            {(ans[question.key] || '').length} / {question.max}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>

            <QuestionnaireError error={err} />

            <div className="q-actions">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  className="auth-ghost magnet"
                  onClick={back}
                  disabled={(i === 0 && !canReturnToChooser) || submitting}
                  style={{
                    opacity:
                      (i === 0 && !canReturnToChooser) || submitting ? 0.4 : 1,
                  }}
                >
                  {i === 0 && canReturnToChooser ? '← 选择类型' : '← 返回'}
                </button>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 20 }}
              >
                <span className="kb">
                  <kbd>Enter</kbd> 继续
                </span>
                <button
                  type="button"
                  className="auth-submit magnet"
                  onClick={next}
                  disabled={!canNext() || submitting}
                  style={{ opacity: canNext() && !submitting ? 1 : 0.5 }}
                >
                  {submitting ? '提交中' : i === total - 1 ? '提交' : '下一页'}{' '}
                  <span className="arrow">↗</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {done && (
          <div className="q-complete">
            <div className="q-step-label" style={{ opacity: 0.7 }}>
              问卷已收到
            </div>
            <h1 style={{ marginTop: 14 }}>
              谢谢。
              <br />
              <em>我们会认真阅读。</em>
            </h1>
            <p>
              后续重要通知将通过邮箱和微信群发送。请保持联系方式可用，并留意活动审核与赛程安排。
            </p>
            {resumeUploadErr && (
              <div className="auth-err" style={{ marginTop: 12 }}>
                {resumeUploadErr}
              </div>
            )}
            <div className="q-summary">
              {summaryItems.map(([label, value]) => (
                <div className="s" key={label}>
                  <div className="k">{label}</div>
                  <div className="v">{valueText(value) || '—'}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 12,
                position: 'relative',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/user"
                className="auth-submit magnet"
                style={{
                  background: 'var(--lime)',
                  color: 'var(--ink)',
                  borderColor: 'var(--lime)',
                }}
              >
                前往控制台 <span className="arrow">↗</span>
              </Link>
              <button
                type="button"
                className="auth-ghost magnet"
                onClick={() => {
                  setDone(false);
                  setI(0);
                }}
                style={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'var(--bone)',
                }}
              >
                修改回答
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
