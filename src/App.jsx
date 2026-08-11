import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Palette,
  Plus,
  RotateCcw,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const STORAGE_KEY = 'react-resume-builder-data-v4'
const LIBRARY_STORAGE_KEY = 'react-resume-builder-library-v1'
const LEGACY_STORAGE_KEYS = [
  'react-resume-builder-data-v3',
  'react-resume-builder-data-v2',
  'react-resume-builder-data-v1',
]
const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const MAX_IMPORT_PDF_SIZE = 12 * 1024 * 1024

const accentOptions = [
  { name: '湖绿', value: '#0f766e' },
  { name: '砖红', value: '#d9503f' },
  { name: '靛蓝', value: '#3155a4' },
  { name: '金棕', value: '#b7791f' },
  { name: '松绿', value: '#2f855a' },
  { name: '炭黑', value: '#334155' },
  { name: '校园蓝', value: '#6f7fc8' },
  { name: '海青', value: '#68aeca' },
]

const templateCategories = [
  { id: 'all', label: '全部' },
  { id: 'developer', label: '程序员' },
  { id: 'teacher', label: '老师' },
  { id: 'intern', label: '实习求职' },
  { id: 'business', label: '通用商务' },
  { id: 'creative', label: '创意设计' },
]

const templates = [
  { id: 'clean', label: '技术清爽', category: 'developer', note: '技能优先' },
  {
    id: 'clean-flow',
    label: '技术清爽单栏',
    category: 'developer',
    note: '单栏阅读',
  },
  {
    id: 'tech-grid',
    label: '项目导向',
    category: 'developer',
    note: '项目突出',
  },
  {
    id: 'code-rail',
    label: '代码侧栏',
    category: 'developer',
    note: '深色技术感',
  },
  {
    id: 'teacher-board',
    label: '教师档案',
    category: 'teacher',
    note: '稳重清晰',
  },
  { id: 'academic', label: '学术经典', category: 'teacher', note: '履历严谨' },
  { id: 'lecture', label: '授课简历', category: 'teacher', note: '经历展开' },
  { id: 'pill-card', label: '圆角清新', category: 'intern', note: '参考图一' },
  { id: 'campus-blue', label: '校园蓝', category: 'intern', note: '参考图二' },
  {
    id: 'intern-focus',
    label: '实习投递',
    category: 'intern',
    note: '教育靠前',
  },
  {
    id: 'executive',
    label: '商务横幅',
    category: 'business',
    note: '沉稳正式',
  },
  { id: 'sidebar', label: '商务侧栏', category: 'business', note: '信息集中' },
  { id: 'compact', label: '紧凑一页', category: 'business', note: '内容密集' },
  { id: 'creative', label: '色块创意', category: 'creative', note: '视觉醒目' },
  { id: 'portfolio', label: '作品集', category: 'creative', note: '项目优先' },
  {
    id: 'editorial',
    label: '杂志排版',
    category: 'creative',
    note: '留白高级',
  },
]

const sectionLabelsByCategory = {
  developer: {
    summary: '个人优势',
    skills: '技术栈',
    experiences: '工作经历',
    projects: '项目经验',
    education: '教育背景',
  },
  teacher: {
    summary: '个人陈述',
    skills: '教学技能',
    experiences: '教学经历',
    projects: '教研成果',
    education: '教育背景',
  },
  intern: {
    summary: '自我评价',
    skills: '专业技能',
    experiences: '实践经历',
    projects: '校园项目',
    education: '教育经历',
  },
  business: {
    summary: '职业概述',
    skills: '核心能力',
    experiences: '工作经历',
    projects: '代表项目',
    education: '教育背景',
  },
  creative: {
    summary: '个人简介',
    skills: '能力标签',
    experiences: '工作经历',
    projects: '作品项目',
    education: '教育背景',
  },
}

const sectionOrdersByCategory = {
  developer: ['summary', 'skills', 'experiences', 'projects', 'education'],
  teacher: ['summary', 'education', 'experiences', 'projects', 'skills'],
  intern: ['education', 'experiences', 'projects', 'skills', 'summary'],
  business: ['summary', 'experiences', 'projects', 'skills', 'education'],
  creative: ['summary', 'projects', 'skills', 'experiences', 'education'],
}

const builtInSectionIds = [
  'summary',
  'skills',
  'experiences',
  'projects',
  'education',
]

const editorSectionLabels = {
  summary: '个人优势',
  skills: '技能栈',
  experiences: '工作经历',
  projects: '项目经历',
  education: '教育背景',
}

const defaultResume = {
  profile: {
    name: '张小可',
    title: '求职意向：项目经理 / 产品负责人',
    avatar: '',
    contacts: [
      { id: 'contact-1', label: '年龄', value: '27 岁' },
      { id: 'contact-2', label: '学历', value: '硕士研究生' },
      { id: 'contact-3', label: '电话', value: '13066668888' },
      { id: 'contact-4', label: '邮箱', value: 'cnsupport@canva.com' },
    ],
  },
  theme: {
    template: 'clean',
    accent: '#0f766e',
  },
  summary:
    '本人性格开朗，沟通能力强，有明确的职业规划。通过校园活动及社会工作的经历，具备较强的心理素质，有较为敏感的市场洞察力及用户分析能力。',
  skills:
    'React, TypeScript, 用户调研, 数据分析, 原型设计, 课程设计, 沟通表达, 项目管理, Photoshop, Illustrator',
  experiences: [
    {
      id: 'exp-1',
      company: '北京可互公司',
      role: '产品经理',
      start: '2021',
      end: '2022',
      location: '北京',
      description:
        '负责产品用户体验、用户需求分析、产品设计质量和文档审核等。\n参与产品用户端系统设计，协助工程师完成软件项目的程序开发工作。',
    },
    {
      id: 'exp-2',
      company: '北京可互公司',
      role: '产品经理助理',
      start: '2018',
      end: '2021',
      location: '北京',
      description:
        '参与项目系统设计及优化。\n协助工程师完成软件项目的程序开发工作。',
    },
  ],
  projects: [
    {
      id: 'project-1',
      name: '校园 APP 用户界面 UI 设计',
      role: '负责人',
      start: '2020.06',
      end: '2021.12',
      description:
        '主导用户界面 UI 视觉设计。\n强化 APP 视觉形象，符合大学生审美。\n负责视觉迭代及优化。',
    },
    {
      id: 'project-2',
      name: '智能简历生成器',
      role: '核心成员',
      start: '2024.05',
      end: '2024.09',
      description:
        '设计结构化简历数据模型，支持多模板预览、字段实时编辑和 PDF 导出。\n使用 React 状态分层和本地缓存机制，保证复杂表单编辑时的响应速度。',
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: '北京可互大学',
      degree: '项目管理专业 硕士',
      start: '2018',
      end: '2020',
      details: 'GPA 3.6，专业前 10%',
    },
    {
      id: 'edu-2',
      school: '北京可互大学',
      degree: '项目管理专业 本科',
      start: '2014',
      end: '2018',
      details: '主修管理学、统计基础、平面设计与构成、包装构成与设计',
    },
  ],
  layout: {
    order: [],
    hidden: {},
    customSections: [],
  },
}

function cloneResume(resume) {
  return JSON.parse(JSON.stringify(resume))
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getTemplate(templateId) {
  return (
    templates.find((template) => template.id === templateId) || templates[0]
  )
}

function createEmptyEntry(section) {
  if (section === 'experiences') {
    return {
      id: createId('exp'),
      company: '',
      role: '',
      start: '',
      end: '',
      location: '',
      description: '',
    }
  }

  if (section === 'projects') {
    return {
      id: createId('project'),
      name: '',
      role: '',
      start: '',
      end: '',
      description: '',
    }
  }

  return {
    id: createId('edu'),
    school: '',
    degree: '',
    start: '',
    end: '',
    details: '',
  }
}

function createEmptyContact() {
  return {
    id: createId('contact'),
    label: '',
    value: '',
  }
}

function createEmptyCustomSection() {
  return {
    id: createId('custom'),
    title: '自定义模块',
    content: '',
  }
}

function getCustomSectionKey(section) {
  return `custom:${section.id}`
}

function getCustomSectionId(sectionKey) {
  return sectionKey.replace('custom:', '')
}

function isCustomSectionKey(sectionKey) {
  return sectionKey.startsWith('custom:')
}

function normalizeLayout(layout = {}) {
  const customSections = Array.isArray(layout.customSections)
    ? layout.customSections.map((section, index) => ({
        id: section.id || createId(`custom-${index}`),
        title: section.title || '自定义模块',
        content: section.content || '',
      }))
    : []

  return {
    order: Array.isArray(layout.order)
      ? layout.order.filter((sectionKey) => typeof sectionKey === 'string')
      : [],
    hidden:
      layout.hidden && typeof layout.hidden === 'object' ? layout.hidden : {},
    customSections,
  }
}

function getSectionLabels(template) {
  return (
    sectionLabelsByCategory[template.category] ||
    sectionLabelsByCategory.business
  )
}

function getRecommendedSectionOrder(template) {
  return sectionOrdersByCategory[template.category] || builtInSectionIds
}

function getEffectiveSectionOrder(resume, template) {
  const layout = normalizeLayout(resume.layout)
  const customKeys = layout.customSections.map(getCustomSectionKey)
  const knownKeys = new Set([...builtInSectionIds, ...customKeys])
  const storedOrder = layout.order.filter((sectionKey) =>
    knownKeys.has(sectionKey),
  )
  const seedOrder = storedOrder.length
    ? storedOrder
    : getRecommendedSectionOrder(template)
  const order = []
  const pushKnownKey = (sectionKey) => {
    if (knownKeys.has(sectionKey) && !order.includes(sectionKey)) {
      order.push(sectionKey)
    }
  }

  seedOrder.forEach(pushKnownKey)
  getRecommendedSectionOrder(template).forEach(pushKnownKey)
  customKeys.forEach(pushKnownKey)

  return order
}

function getSectionLabel(sectionKey, template, customSections = []) {
  if (isCustomSectionKey(sectionKey)) {
    const customSection = customSections.find(
      (section) => section.id === getCustomSectionId(sectionKey),
    )
    return customSection?.title || '自定义模块'
  }

  const labels = getSectionLabels(template)
  return labels[sectionKey] || editorSectionLabels[sectionKey] || sectionKey
}

function getHiddenSectionSet(resume, extraHiddenSections = []) {
  const hidden = resume.layout?.hidden || {}
  const hiddenKeys = Object.keys(hidden).filter(
    (sectionKey) => hidden[sectionKey],
  )
  return new Set([...hiddenKeys, ...extraHiddenSections])
}

function normalizeContacts(profile = {}) {
  if (Array.isArray(profile.contacts)) {
    return profile.contacts.map((contact, index) => ({
      id: contact.id || createId(`contact-${index}`),
      label: contact.label || '',
      value: contact.value || '',
    }))
  }

  return [
    { id: 'legacy-phone', label: '电话', value: profile.phone || '' },
    { id: 'legacy-email', label: '邮箱', value: profile.email || '' },
    { id: 'legacy-city', label: '城市', value: profile.city || '' },
    { id: 'legacy-website', label: '作品', value: profile.website || '' },
  ].filter((contact) => contact.value)
}

function normalizeEntries(entries, fallback) {
  return Array.isArray(entries) ? entries : fallback
}

function normalizeResume(source) {
  if (!source || typeof source !== 'object') {
    return cloneResume(defaultResume)
  }

  const next = {
    ...cloneResume(defaultResume),
    ...source,
    profile: {
      ...defaultResume.profile,
      ...(source.profile || {}),
      contacts: normalizeContacts(source.profile || {}),
    },
    theme: {
      ...defaultResume.theme,
      ...(source.theme || {}),
    },
    experiences: normalizeEntries(
      source.experiences,
      defaultResume.experiences,
    ),
    projects: normalizeEntries(source.projects, defaultResume.projects),
    education: normalizeEntries(source.education, defaultResume.education),
    layout: normalizeLayout(source.layout || defaultResume.layout),
  }

  if (!templates.some((template) => template.id === next.theme.template)) {
    next.theme.template = defaultResume.theme.template
  }

  return next
}

function loadResume() {
  try {
    const legacyValue = LEGACY_STORAGE_KEYS.map((key) =>
      window.localStorage.getItem(key),
    ).find(Boolean)
    const stored = window.localStorage.getItem(STORAGE_KEY) || legacyValue
    return stored
      ? normalizeResume(JSON.parse(stored))
      : cloneResume(defaultResume)
  } catch {
    return cloneResume(defaultResume)
  }
}

function createBlankResume() {
  const resume = cloneResume(defaultResume)

  return {
    ...resume,
    profile: {
      name: '',
      title: '',
      avatar: '',
      contacts: [
        { id: createId('contact'), label: '电话', value: '' },
        { id: createId('contact'), label: '邮箱', value: '' },
      ],
    },
    summary: '',
    skills: '',
    experiences: [],
    projects: [],
    education: [],
    layout: cloneResume(defaultResume.layout),
  }
}

function getResumeRecordName(resume, fallback = '未命名简历') {
  const profile = resume?.profile || {}
  const name = typeof profile.name === 'string' ? profile.name.trim() : ''
  const title = typeof profile.title === 'string' ? profile.title.trim() : ''
  return name || title || fallback
}

function createResumeRecord(resume, name) {
  const normalizedResume = normalizeResume(cloneResume(resume || defaultResume))
  const recordName =
    typeof name === 'string' && name.trim()
      ? name.trim()
      : getResumeRecordName(normalizedResume)

  return {
    id: createId('resume'),
    name: recordName,
    updatedAt: new Date().toISOString(),
    resume: normalizedResume,
  }
}

function normalizeResumeLibrary(source, fallbackResume = defaultResume) {
  if (
    !source ||
    typeof source !== 'object' ||
    !Array.isArray(source.items) ||
    !source.items.length
  ) {
    const record = createResumeRecord(fallbackResume, '我的简历')
    return {
      activeId: record.id,
      items: [record],
    }
  }

  const items = source.items.map((item, index) => {
    const resume = normalizeResume(item?.resume || defaultResume)
    const fallbackName = getResumeRecordName(resume, `简历 ${index + 1}`)

    return {
      id: item?.id || createId(`resume-${index}`),
      name:
        typeof item?.name === 'string' && item.name.trim()
          ? item.name.trim()
          : fallbackName,
      updatedAt: item?.updatedAt || new Date().toISOString(),
      resume,
    }
  })

  const activeId = items.some((item) => item.id === source.activeId)
    ? source.activeId
    : items[0].id

  return {
    activeId,
    items,
  }
}

function loadResumeLibrary() {
  const fallbackResume = loadResume()

  try {
    const stored = window.localStorage.getItem(LIBRARY_STORAGE_KEY)
    return stored
      ? normalizeResumeLibrary(JSON.parse(stored), fallbackResume)
      : normalizeResumeLibrary(null, fallbackResume)
  } catch {
    return normalizeResumeLibrary(null, fallbackResume)
  }
}

function cleanImportedLine(line = '') {
  return line
    .replace(/[｜|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanBulletLine(line = '') {
  return cleanImportedLine(line).replace(/^[•·●○◆◇▪▫*+\-\u2022\s]+/, '')
}

function uniqueByValue(items) {
  const seen = new Set()

  return items.filter((item) => {
    const key =
      typeof item === 'string'
        ? item.trim()
        : `${item.label || ''}:${item.value || ''}`.trim()

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function getLabelValue(lines, labels) {
  for (const line of lines) {
    for (const label of labels) {
      const index = line.toLowerCase().indexOf(label.toLowerCase())

      if (index >= 0) {
        const value = cleanImportedLine(line.slice(index + label.length))
          .replace(/^[：:\-\s]+/, '')
          .split(/\s{2,}|[,，;；]/)[0]
          .trim()

        if (value) {
          return value
        }
      }
    }
  }

  return ''
}

function getImportedSectionKey(line) {
  const header = cleanImportedLine(line)
    .replace(/[：:]/g, '')
    .replace(/^[#\-\s]+/, '')
    .trim()

  if (!header || header.length > 36) {
    return ''
  }

  const rules = [
    {
      key: 'summary',
      pattern:
        /^(个人优势|个人简介|个人陈述|自我评价|职业概述|求职目标|summary|profile|objective)$/i,
    },
    {
      key: 'skills',
      pattern:
        /^(专业技能|技能栈|技术栈|技能证书|能力标签|核心能力|技能|skills)$/i,
    },
    {
      key: 'experiences',
      pattern:
        /^(工作经历|工作经验|实习经历|实践经历|教学经历|任职经历|experience|work experience)$/i,
    },
    {
      key: 'projects',
      pattern:
        /^(项目经历|项目经验|项目实践|代表项目|校园项目|作品项目|教研成果|projects|project experience)$/i,
    },
    {
      key: 'education',
      pattern:
        /^(教育背景|教育经历|学历背景|教育经验|教育|education)$/i,
    },
  ]

  const matchedRule = rules.find((rule) => rule.pattern.test(header))
  return matchedRule?.key || ''
}

function groupLinesBySection(lines) {
  const buckets = {
    top: [],
    summary: [],
    skills: [],
    experiences: [],
    projects: [],
    education: [],
  }
  let currentKey = 'top'

  lines.forEach((line) => {
    const sectionKey = getImportedSectionKey(line)

    if (sectionKey) {
      currentKey = sectionKey
      return
    }

    buckets[currentKey].push(line)
  })

  return buckets
}

function extractDateRange(text = '') {
  const match = text.match(
    /((?:19|20)\d{2}(?:[./-]\d{1,2}|年\d{1,2}月?)?)\s*(?:-|—|–|~|至|到)\s*((?:19|20)\d{2}(?:[./-]\d{1,2}|年\d{1,2}月?)?|至今|现在|目前|Present)/i,
  )

  if (!match) {
    return { start: '', end: '' }
  }

  return {
    start: normalizeImportedDate(match[1]),
    end: normalizeImportedDate(match[2]),
  }
}

function normalizeImportedDate(value = '') {
  return cleanImportedLine(value)
    .replace(/年/g, '.')
    .replace(/月/g, '')
    .replace(/至今|现在|目前/gi, '至今')
}

function removeDateRange(text = '') {
  return cleanImportedLine(text).replace(
    /((?:19|20)\d{2}(?:[./-]\d{1,2}|年\d{1,2}月?)?)\s*(?:-|—|–|~|至|到)\s*((?:19|20)\d{2}(?:[./-]\d{1,2}|年\d{1,2}月?)?|至今|现在|目前|Present)/gi,
    '',
  )
}

function hasDateRange(text = '') {
  return Boolean(extractDateRange(text).start)
}

function getLocationFromText(text = '') {
  const match = text.match(
    /(北京|上海|广州|深圳|杭州|成都|南京|武汉|西安|苏州|重庆|天津|厦门|长沙|郑州|青岛|远程|Remote)/i,
  )
  return match?.[0] || ''
}

function getDescriptionLines(lines, skippedLines = []) {
  const skippedSet = new Set(skippedLines.filter(Boolean))

  return lines
    .filter((line) => !skippedSet.has(line))
    .map((line) => cleanBulletLine(removeDateRange(line)))
    .filter((line) => line && line.length > 1)
}

function splitEntryChunks(lines) {
  const chunks = []
  let currentChunk = []
  const usefulLines = lines.map(cleanBulletLine).filter(Boolean)

  usefulLines.forEach((line, index) => {
    const isNewEntry =
      index > 0 &&
      !/^[•·●○◆◇▪▫*+\-]/.test(line) &&
      (hasDateRange(line) ||
        /(公司|科技|集团|大学|学院|学校|中学|教育|中心|工作室|实验室|有限公司|University|College|School)/i.test(
          line,
        ))

    if (isNewEntry && currentChunk.length) {
      chunks.push(currentChunk)
      currentChunk = [line]
      return
    }

    currentChunk.push(line)
  })

  if (currentChunk.length) {
    chunks.push(currentChunk)
  }

  return chunks.slice(0, 10)
}

function parseExperienceChunk(lines) {
  const text = lines.join(' ')
  const dates = extractDateRange(text)
  const firstLine = removeDateRange(lines[0] || '')
  const companyMatch = text.match(
    /([\u4e00-\u9fa5A-Za-z0-9（）()&·.\-\s]{2,34}(?:有限公司|公司|科技|集团|教育|中心|工作室|实验室|University|College|School))/i,
  )
  const company = cleanImportedLine(companyMatch?.[1] || firstLine)
  const roleLine =
    lines.find((line) =>
      /(前端|后端|全栈|开发|算法|测试|运维|数据|产品|项目|运营|设计|教师|老师|讲师|实习|工程师|经理|负责人|主管|专员|助理|顾问|架构师)/i.test(
        line,
      ),
    ) || ''
  const role = cleanImportedLine(
    removeDateRange(roleLine).replace(company, '').replace(/[，,;；]/g, ' '),
  )
  const skipped = [lines[0], roleLine]
  const descriptionLines = getDescriptionLines(lines, skipped)

  return {
    id: createId('exp'),
    company: company || '工作经历',
    role: role || '',
    start: dates.start,
    end: dates.end,
    location: getLocationFromText(text),
    description: descriptionLines.join('\n'),
  }
}

function parseProjectChunk(lines) {
  const text = lines.join(' ')
  const dates = extractDateRange(text)
  const firstLine = removeDateRange(lines[0] || '')
  const roleLine =
    lines.find((line) => /(角色|负责|负责人|核心成员|主导|参与)/.test(line)) || ''
  const name = cleanImportedLine(
    firstLine
      .replace(/^(项目名称|项目|作品)[:：\s]*/, '')
      .replace(/[，,;；].*$/, ''),
  )
  const role = cleanImportedLine(
    roleLine
      .replace(/^(角色|职责|担任|负责)[:：\s]*/, '')
      .replace(name, ''),
  )
  const descriptionLines = getDescriptionLines(lines, [lines[0], roleLine])

  return {
    id: createId('project'),
    name: name || '项目经历',
    role,
    start: dates.start,
    end: dates.end,
    description: descriptionLines.join('\n'),
  }
}

function parseEducationChunk(lines) {
  const text = lines.join(' ')
  const dates = extractDateRange(text)
  const schoolMatch = text.match(
    /([\u4e00-\u9fa5A-Za-z0-9（）()&·.\-\s]{2,34}(?:大学|学院|学校|中学|院校|University|College|School))/i,
  )
  const degreeMatch = text.match(
    /(博士|硕士研究生|硕士|研究生|本科|学士|大专|专科|高中|MBA|Ph\.?D|Master|Bachelor)[^，,;；\n]*/i,
  )
  const school = cleanImportedLine(schoolMatch?.[1] || removeDateRange(lines[0]))
  const degree = cleanImportedLine(degreeMatch?.[0] || '')
  const details = getDescriptionLines(lines, [lines[0]]).join('\n')

  return {
    id: createId('edu'),
    school: school || '教育经历',
    degree,
    start: dates.start,
    end: dates.end,
    details,
  }
}

function parseEntrySection(lines, parser) {
  return splitEntryChunks(lines)
    .map(parser)
    .filter((entry) => Object.values(entry).some((value) => value))
}

function getImportedContacts(text, lines) {
  const contacts = []
  const phone = text.match(/(?:\+?86[-\s]?)?1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}/)
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  const website = text.match(
    /(https?:\/\/[^\s]+|(?:github|gitee|linkedin)\.com\/[^\s]+|[A-Za-z0-9._%+-]+\.github\.io[^\s]*)/i,
  )
  const city = getLabelValue(lines, ['现居', '所在地', '城市', '地点'])
  const degree = text.match(/博士|硕士研究生|硕士|研究生|本科|学士|大专|专科/)
  const birthday =
    getLabelValue(lines, ['出生年月', '生日', '出生']) ||
    text.match(/\d{4}年\d{1,2}月\d{0,2}日?/)?.[0]

  if (phone) {
    contacts.push({ label: '电话', value: phone[0].replace(/\s+/g, '') })
  }

  if (email) {
    contacts.push({ label: '邮箱', value: email[0] })
  }

  if (city) {
    contacts.push({ label: '城市', value: city })
  }

  if (website) {
    contacts.push({ label: '作品', value: website[0] })
  }

  if (degree) {
    contacts.push({ label: '学历', value: degree[0] })
  }

  if (birthday) {
    contacts.push({ label: '出生年月', value: birthday })
  }

  return uniqueByValue(contacts).map((contact) => ({
    id: createId('contact'),
    ...contact,
  }))
}

function getImportedName(lines) {
  const explicitName = getLabelValue(lines.slice(0, 12), ['姓名', 'Name'])

  if (explicitName && explicitName.length <= 12) {
    return explicitName
  }

  const candidate = lines
    .slice(0, 10)
    .map((line) => line.replace(/[：:]/g, '').trim())
    .find((line) => {
      if (/电话|邮箱|求职|应聘|岗位|简历|resume/i.test(line)) {
        return false
      }

      return /^[\u4e00-\u9fa5]{2,5}$/.test(line) || /^[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}$/.test(line)
    })

  return candidate || ''
}

function getImportedTitle(lines, name) {
  const titleFromLabel = getLabelValue(lines.slice(0, 18), [
    '求职意向',
    '应聘岗位',
    '目标岗位',
    '求职岗位',
    '职位',
    '岗位',
  ])

  if (titleFromLabel) {
    return titleFromLabel
  }

  return (
    lines
      .slice(0, 14)
      .map((line) => cleanImportedLine(line).replace(name, '').trim())
      .find((line) => {
        return (
          line.length <= 36 &&
          /(前端|后端|全栈|Java|Python|算法|测试|运维|数据|产品|项目|运营|设计|教师|老师|讲师|实习|工程师|经理|负责人|开发|UI|UX)/i.test(
            line,
          )
        )
      }) || ''
  )
}

function getImportedSummary(buckets, lines, name, title) {
  const summaryLines = buckets.summary.length
    ? buckets.summary
    : lines
        .slice(0, 16)
        .filter((line) => line !== name && line !== title)
        .filter((line) => !/电话|邮箱|出生|现居|所在地|求职|应聘|岗位/i.test(line))
        .filter((line) => line.length >= 12)

  return summaryLines.map(cleanBulletLine).filter(Boolean).slice(0, 5).join('\n')
}

function getImportedSkills(buckets, lines) {
  const skillLines = buckets.skills.length
    ? buckets.skills
    : lines.filter((line) =>
        /(React|Vue|JavaScript|TypeScript|Java|Python|Node|SQL|Excel|Photoshop|Illustrator|沟通|管理|教学|课程|设计|数据|用户|调研|技能)/i.test(
          line,
        ),
      )
  const skills = uniqueByValue(
    skillLines
      .flatMap((line) => line.split(/[、,，;；/]/))
      .map(cleanBulletLine)
      .map((skill) => skill.replace(/^(技能|技术栈|专业技能)[:：\s]*/, ''))
      .filter((skill) => skill && skill.length <= 30 && !hasDateRange(skill)),
  )

  return skills.length ? skills.join(', ') : skillLines.map(cleanBulletLine).join(', ')
}

function parseImportedResumeText(text) {
  const lines = splitLines(text).map(cleanImportedLine).filter(Boolean)
  const joinedText = lines.join(' ')
  const buckets = groupLinesBySection(lines)
  const name = getImportedName(lines)
  const title = getImportedTitle(lines, name)

  return {
    profile: {
      name,
      title,
      contacts: getImportedContacts(joinedText, lines),
    },
    summary: getImportedSummary(buckets, lines, name, title),
    skills: getImportedSkills(buckets, lines),
    experiences: parseEntrySection(buckets.experiences, parseExperienceChunk),
    projects: parseEntrySection(buckets.projects, parseProjectChunk),
    education: parseEntrySection(buckets.education, parseEducationChunk),
  }
}

function mergeImportedResume(currentResume, importedResume) {
  const current = normalizeResume(currentResume)

  return normalizeResume({
    ...current,
    profile: {
      ...current.profile,
      name: importedResume.profile.name || current.profile.name,
      title: importedResume.profile.title || current.profile.title,
      contacts: importedResume.profile.contacts.length
        ? importedResume.profile.contacts
        : current.profile.contacts,
    },
    summary: importedResume.summary || current.summary,
    skills: importedResume.skills || current.skills,
    experiences: importedResume.experiences.length
      ? importedResume.experiences
      : current.experiences,
    projects: importedResume.projects.length
      ? importedResume.projects
      : current.projects,
    education: importedResume.education.length
      ? importedResume.education
      : current.education,
    theme: current.theme,
    layout: current.layout,
  })
}

function getImportedResumeStats(importedResume) {
  return [
    importedResume.profile.name ? '姓名' : '',
    importedResume.profile.contacts.length ? '联系方式' : '',
    importedResume.summary ? '简介' : '',
    importedResume.skills ? '技能' : '',
    importedResume.experiences.length ? `${importedResume.experiences.length} 段经历` : '',
    importedResume.projects.length ? `${importedResume.projects.length} 个项目` : '',
    importedResume.education.length ? `${importedResume.education.length} 段教育` : '',
  ].filter(Boolean)
}

async function extractTextFromPdf(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf')
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    disableWorker: true,
  })
  const pdf = await loadingTask.promise
  const pages = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const lines = groupPdfTextItems(content.items)

    if (lines.length) {
      pages.push(lines.join('\n'))
    }
  }

  await pdf.destroy()

  return {
    pageCount: pdf.numPages,
    text: pages.join('\n\n'),
  }
}

function groupPdfTextItems(items) {
  const lines = []

  items.forEach((item) => {
    const text = cleanImportedLine(item.str || '')

    if (!text) {
      return
    }

    const transform = item.transform || []
    const x = transform[4] || 0
    const y = transform[5] || 0
    let line = lines.find((candidate) => Math.abs(candidate.y - y) < 3)

    if (!line) {
      line = { y, items: [] }
      lines.push(line)
    }

    line.items.push({ x, text })
  })

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) =>
      line.items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}

function splitLines(value = '') {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function splitSkills(value = '') {
  return value
    .split(/[,，\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
}

function getSkillLevel(index) {
  const levels = [94, 88, 82, 76, 90, 72, 84, 68, 78, 86]
  return `${levels[index % levels.length]}%`
}

function getOuterHeight(element) {
  if (!element) {
    return 0
  }

  const styles = window.getComputedStyle(element)
  const marginTop = Number.parseFloat(styles.marginTop) || 0
  const marginBottom = Number.parseFloat(styles.marginBottom) || 0

  return element.getBoundingClientRect().height + marginTop + marginBottom
}

function getVerticalSpacing(styles) {
  return (
    (Number.parseFloat(styles.paddingTop) || 0) +
    (Number.parseFloat(styles.paddingBottom) || 0) +
    (Number.parseFloat(styles.borderTopWidth) || 0) +
    (Number.parseFloat(styles.borderBottomWidth) || 0)
  )
}

function cloneSectionDescriptor(section) {
  if (section.kind === 'timeline') {
    return {
      ...section,
      items: [...section.items],
    }
  }

  return section
}

function pushSectionToPages(pages, section) {
  const page = pages[pages.length - 1]
  page.sections.push(cloneSectionDescriptor(section))
}

function createPage(remainingHeight) {
  return {
    sections: [],
    remainingHeight,
  }
}

function paginateSections(sectionDescriptors, measurements) {
  if (!measurements) {
    return [sectionDescriptors]
  }

  const pages = [createPage(measurements.firstPageContentHeight)]

  const startNewPage = () => {
    pages.push(createPage(measurements.nextPageContentHeight))
  }

  sectionDescriptors.forEach((section) => {
    const sectionHeight = measurements.sections[section.key] || 0
    let currentPage = pages[pages.length - 1]

    if (
      section.kind !== 'timeline' ||
      !section.items.length ||
      sectionHeight <= currentPage.remainingHeight
    ) {
      if (
        sectionHeight > currentPage.remainingHeight &&
        currentPage.sections.length > 0
      ) {
        startNewPage()
        currentPage = pages[pages.length - 1]
      }

      pushSectionToPages(pages, section)
      currentPage.remainingHeight -= sectionHeight
      return
    }

    const itemHeights = section.items.map(
      (item) => measurements.items[item.key] || 0,
    )
    const sectionOverhead = Math.max(
      32,
      sectionHeight - itemHeights.reduce((sum, height) => sum + height, 0),
    )
    let chunk = {
      ...section,
      items: [],
    }
    let chunkHeight = sectionOverhead

    section.items.forEach((item, index) => {
      const itemHeight = itemHeights[index] || sectionHeight
      currentPage = pages[pages.length - 1]

      if (
        chunk.items.length > 0 &&
        chunkHeight + itemHeight > currentPage.remainingHeight
      ) {
        pushSectionToPages(pages, chunk)
        currentPage.remainingHeight -= chunkHeight
        startNewPage()
        chunk = {
          ...section,
          items: [],
        }
        chunkHeight = sectionOverhead
        currentPage = pages[pages.length - 1]
      }

      if (
        chunk.items.length === 0 &&
        chunkHeight + itemHeight > currentPage.remainingHeight &&
        currentPage.sections.length > 0
      ) {
        startNewPage()
        currentPage = pages[pages.length - 1]
      }

      chunk.items.push(item)
      chunkHeight += itemHeight
    })

    if (chunk.items.length) {
      currentPage = pages[pages.length - 1]

      if (
        chunkHeight > currentPage.remainingHeight &&
        currentPage.sections.length > 0
      ) {
        startNewPage()
        currentPage = pages[pages.length - 1]
      }

      pushSectionToPages(pages, chunk)
      currentPage.remainingHeight -= chunkHeight
    }
  })

  return pages
    .map((page) => page.sections)
    .filter((sections) => sections.length)
}

function App() {
  const [resumeLibrary, setResumeLibrary] = useState(loadResumeLibrary)
  const activeResumeItem = useMemo(() => {
    return (
      resumeLibrary.items.find((item) => item.id === resumeLibrary.activeId) ||
      resumeLibrary.items[0]
    )
  }, [resumeLibrary])
  const resume = activeResumeItem?.resume || cloneResume(defaultResume)

  const setResume = (updater) => {
    setResumeLibrary((current) => {
      const library = normalizeResumeLibrary(current)
      const activeId = library.items.some(
        (item) => item.id === library.activeId,
      )
        ? library.activeId
        : library.items[0].id
      const items = library.items.map((item) => {
        if (item.id !== activeId) {
          return item
        }

        const currentResume = normalizeResume(item.resume)
        const nextResume = normalizeResume(
          typeof updater === 'function' ? updater(currentResume) : updater,
        )

        return {
          ...item,
          updatedAt: new Date().toISOString(),
          resume: nextResume,
        }
      })

      return {
        activeId,
        items,
      }
    })
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LIBRARY_STORAGE_KEY,
        JSON.stringify(resumeLibrary),
      )
    } catch (error) {
      console.warn('Failed to save resume library', error)
    }
  }, [resumeLibrary])

  const skillList = useMemo(() => splitSkills(resume.skills), [resume.skills])
  const activeTemplate = useMemo(
    () => getTemplate(resume.theme.template),
    [resume.theme.template],
  )
  const sectionOrder = useMemo(
    () => getEffectiveSectionOrder(resume, activeTemplate),
    [resume, activeTemplate],
  )

  const selectResume = (id) => {
    setResumeLibrary((current) => {
      if (!current.items.some((item) => item.id === id)) {
        return current
      }

      return {
        ...current,
        activeId: id,
      }
    })
  }

  const renameResume = (name) => {
    setResumeLibrary((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === current.activeId
          ? {
              ...item,
              name,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    }))
  }

  const createResume = () => {
    setResumeLibrary((current) => {
      const library = normalizeResumeLibrary(current)
      const record = createResumeRecord(
        createBlankResume(),
        `简历 ${library.items.length + 1}`,
      )

      return {
        activeId: record.id,
        items: [...library.items, record],
      }
    })
  }

  const duplicateResume = () => {
    setResumeLibrary((current) => {
      const library = normalizeResumeLibrary(current)
      const source =
        library.items.find((item) => item.id === library.activeId) ||
        library.items[0]
      const record = createResumeRecord(
        source.resume,
        `${source.name || getResumeRecordName(source.resume)} 副本`,
      )

      return {
        activeId: record.id,
        items: [...library.items, record],
      }
    })
  }

  const deleteResume = () => {
    if (resumeLibrary.items.length <= 1) {
      window.alert('至少保留一份简历。')
      return
    }

    const currentName =
      activeResumeItem?.name || getResumeRecordName(activeResumeItem?.resume)

    if (!window.confirm(`确定删除「${currentName}」吗？`)) {
      return
    }

    setResumeLibrary((current) => {
      const activeIndex = current.items.findIndex(
        (item) => item.id === current.activeId,
      )
      const nextItems = current.items.filter(
        (item) => item.id !== current.activeId,
      )
      const nextActiveItem =
        nextItems[Math.max(0, activeIndex - 1)] || nextItems[0]

      return {
        activeId: nextActiveItem.id,
        items: nextItems,
      }
    })
  }

  const updateProfile = (field, value) => {
    setResume((current) => ({
      ...current,
      profile: { ...current.profile, [field]: value },
    }))
  }

  const updateTheme = (field, value) => {
    setResume((current) => ({
      ...current,
      theme: { ...current.theme, [field]: value },
    }))
  }

  const updateField = (field, value) => {
    setResume((current) => ({ ...current, [field]: value }))
  }

  const updateContact = (id, field, value) => {
    setResume((current) => ({
      ...current,
      profile: {
        ...current.profile,
        contacts: current.profile.contacts.map((contact) =>
          contact.id === id ? { ...contact, [field]: value } : contact,
        ),
      },
    }))
  }

  const addContact = () => {
    setResume((current) => ({
      ...current,
      profile: {
        ...current.profile,
        contacts: [...current.profile.contacts, createEmptyContact()],
      },
    }))
  }

  const removeContact = (id) => {
    setResume((current) => ({
      ...current,
      profile: {
        ...current.profile,
        contacts: current.profile.contacts.filter(
          (contact) => contact.id !== id,
        ),
      },
    }))
  }

  const updateEntry = (section, id, field, value) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }))
  }

  const addEntry = (section) => {
    setResume((current) => ({
      ...current,
      [section]: [...current[section], createEmptyEntry(section)],
    }))
  }

  const removeEntry = (section, id) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].filter((entry) => entry.id !== id),
    }))
  }

  const moveSection = (sectionKey, direction) => {
    setResume((current) => {
      const template = getTemplate(current.theme.template)
      const currentOrder = getEffectiveSectionOrder(current, template)
      const index = currentOrder.indexOf(sectionKey)
      const nextIndex = index + direction

      if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) {
        return current
      }

      const nextOrder = [...currentOrder]
      const [movedSection] = nextOrder.splice(index, 1)
      nextOrder.splice(nextIndex, 0, movedSection)

      return {
        ...current,
        layout: {
          ...normalizeLayout(current.layout),
          order: nextOrder,
        },
      }
    })
  }

  const toggleSection = (sectionKey) => {
    setResume((current) => {
      const layout = normalizeLayout(current.layout)
      const nextHidden = {
        ...layout.hidden,
        [sectionKey]: !layout.hidden[sectionKey],
      }

      if (!nextHidden[sectionKey]) {
        delete nextHidden[sectionKey]
      }

      return {
        ...current,
        layout: {
          ...layout,
          hidden: nextHidden,
        },
      }
    })
  }

  const resetSectionOrder = () => {
    setResume((current) => ({
      ...current,
      layout: {
        ...normalizeLayout(current.layout),
        order: [],
      },
    }))
  }

  const addCustomSection = () => {
    setResume((current) => {
      const layout = normalizeLayout(current.layout)
      const customSection = createEmptyCustomSection()
      const template = getTemplate(current.theme.template)
      const currentOrder = getEffectiveSectionOrder(current, template)
      const customKey = getCustomSectionKey(customSection)

      return {
        ...current,
        layout: {
          ...layout,
          customSections: [...layout.customSections, customSection],
          order: [...currentOrder, customKey],
        },
      }
    })
  }

  const updateCustomSection = (id, field, value) => {
    setResume((current) => {
      const layout = normalizeLayout(current.layout)

      return {
        ...current,
        layout: {
          ...layout,
          customSections: layout.customSections.map((section) =>
            section.id === id ? { ...section, [field]: value } : section,
          ),
        },
      }
    })
  }

  const removeCustomSection = (id) => {
    setResume((current) => {
      const layout = normalizeLayout(current.layout)
      const customKey = `custom:${id}`
      const nextHidden = { ...layout.hidden }
      delete nextHidden[customKey]

      return {
        ...current,
        layout: {
          ...layout,
          customSections: layout.customSections.filter(
            (section) => section.id !== id,
          ),
          order: layout.order.filter((sectionKey) => sectionKey !== customKey),
          hidden: nextHidden,
        },
      }
    })
  }

  const uploadAvatar = (file) => {
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      window.alert('请上传图片格式的头像。')
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      window.alert('头像图片请控制在 2MB 以内，避免 PDF 过大。')
      return
    }

    const reader = new FileReader()
    reader.onload = () => updateProfile('avatar', reader.result)
    reader.readAsDataURL(file)
  }

  const importResumeText = (text) => {
    const importedResume = parseImportedResumeText(text)
    const importedStats = getImportedResumeStats(importedResume)

    if (!importedStats.length) {
      return {
        ok: false,
        message: '没有识别到可导入的简历内容。',
      }
    }

    setResumeLibrary((current) => {
      const library = normalizeResumeLibrary(current)
      const activeId = library.items.some(
        (item) => item.id === library.activeId,
      )
        ? library.activeId
        : library.items[0].id
      const items = library.items.map((item) => {
        if (item.id !== activeId) {
          return item
        }

        const nextResume = mergeImportedResume(item.resume, importedResume)
        const nextName = getResumeRecordName(nextResume, item.name)

        return {
          ...item,
          name: nextName,
          updatedAt: new Date().toISOString(),
          resume: nextResume,
        }
      })

      return {
        activeId,
        items,
      }
    })

    return {
      ok: true,
      message: `已套用：${importedStats.join('、')}`,
    }
  }

  const resetSample = () => {
    setResume(cloneResume(defaultResume))
  }

  const printPdf = () => {
    const originalTitle = document.title
    const fileName = resume.profile.name
      ? `${resume.profile.name}-简历`
      : '个人简历'
    document.title = fileName
    window.setTimeout(() => {
      window.print()
      window.setTimeout(() => {
        document.title = originalTitle
      }, 500)
    }, 50)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <FileText size={22} aria-hidden="true" />
          <div>
            <h1>简历生成器</h1>
            <span>分类模板、头像、PDF 一站式生成</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={resetSample}>
            <RotateCcw size={16} aria-hidden="true" />
            重置样例
          </button>
          <button className="primary-button" type="button" onClick={printPdf}>
            <Download size={16} aria-hidden="true" />
            导出 PDF
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="editor-pane" aria-label="简历编辑区">
          <Editor
            resumeLibrary={resumeLibrary}
            activeResumeItem={activeResumeItem}
            resume={resume}
            activeTemplate={activeTemplate}
            sectionOrder={sectionOrder}
            selectResume={selectResume}
            renameResume={renameResume}
            createResume={createResume}
            duplicateResume={duplicateResume}
            deleteResume={deleteResume}
            updateProfile={updateProfile}
            updateTheme={updateTheme}
            updateField={updateField}
            updateContact={updateContact}
            addContact={addContact}
            removeContact={removeContact}
            uploadAvatar={uploadAvatar}
            importResumeText={importResumeText}
            updateEntry={updateEntry}
            addEntry={addEntry}
            removeEntry={removeEntry}
            moveSection={moveSection}
            toggleSection={toggleSection}
            resetSectionOrder={resetSectionOrder}
            addCustomSection={addCustomSection}
            updateCustomSection={updateCustomSection}
            removeCustomSection={removeCustomSection}
          />
        </aside>

        <main className="preview-pane" aria-label="简历预览区">
          <div className="preview-toolbar">
            <div>
              <span>PDF 预览</span>
              <strong>A4</strong>
            </div>
            <button
              className="primary-button compact"
              type="button"
              onClick={printPdf}
            >
              <Download size={16} aria-hidden="true" />
              导出 PDF
            </button>
          </div>
          <ResumePreview resume={resume} skills={skillList} />
        </main>
      </div>
    </div>
  )
}

function Editor({
  resumeLibrary,
  activeResumeItem,
  resume,
  activeTemplate,
  sectionOrder,
  selectResume,
  renameResume,
  createResume,
  duplicateResume,
  deleteResume,
  updateProfile,
  updateTheme,
  updateField,
  updateContact,
  addContact,
  removeContact,
  uploadAvatar,
  importResumeText,
  updateEntry,
  addEntry,
  removeEntry,
  moveSection,
  toggleSection,
  resetSectionOrder,
  addCustomSection,
  updateCustomSection,
  removeCustomSection,
}) {
  const [activeCategory, setActiveCategory] = useState(
    activeTemplate.category || 'developer',
  )

  useEffect(() => {
    setActiveCategory(activeTemplate.category || 'developer')
  }, [activeTemplate.id, activeTemplate.category])

  const visibleTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return templates
    }
    return templates.filter((template) => template.category === activeCategory)
  }, [activeCategory])

  return (
    <div className="editor-content">
      <ResumeLibraryManager
        resumeLibrary={resumeLibrary}
        activeResumeItem={activeResumeItem}
        onSelect={selectResume}
        onRename={renameResume}
        onCreate={createResume}
        onDuplicate={duplicateResume}
        onDelete={deleteResume}
      />

      <ImportResumePanel onImportText={importResumeText} />

      <section className="editor-section">
        <SectionTitle icon={Palette} title="模板" />
        <div className="template-tabs" role="tablist" aria-label="模板分类">
          {templateCategories.map((category) => (
            <button
              key={category.id}
              className={activeCategory === category.id ? 'active' : ''}
              type="button"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="template-picker" role="tablist" aria-label="模板选择">
          {visibleTemplates.map((template) => (
            <button
              key={template.id}
              className={resume.theme.template === template.id ? 'active' : ''}
              type="button"
              onClick={() => updateTheme('template', template.id)}
            >
              <span>{template.label}</span>
              <small>{template.note}</small>
            </button>
          ))}
        </div>
        <div className="swatch-row" aria-label="强调色选择">
          {accentOptions.map((accent) => (
            <button
              key={accent.value}
              className={
                resume.theme.accent === accent.value
                  ? 'swatch active'
                  : 'swatch'
              }
              style={{ '--swatch': accent.value }}
              type="button"
              title={accent.name}
              aria-label={accent.name}
              onClick={() => updateTheme('accent', accent.value)}
            />
          ))}
        </div>
      </section>

      <section className="editor-section">
        <SectionTitle icon={ImageIcon} title="头像" />
        <AvatarUploader
          avatar={resume.profile.avatar}
          onUpload={uploadAvatar}
          onRemove={() => updateProfile('avatar', '')}
        />
      </section>

      <ModuleManager
        resume={resume}
        activeTemplate={activeTemplate}
        sectionOrder={sectionOrder}
        onMove={moveSection}
        onToggle={toggleSection}
        onReset={resetSectionOrder}
        onAddCustom={addCustomSection}
        onRemoveCustom={removeCustomSection}
      />

      <CustomSectionsEditor
        customSections={normalizeLayout(resume.layout).customSections}
        updateCustomSection={updateCustomSection}
        removeCustomSection={removeCustomSection}
      />

      <section className="editor-section">
        <SectionTitle title="基本信息" />
        <div className="field-grid two-columns">
          <TextField
            label="姓名"
            value={resume.profile.name}
            onChange={(value) => updateProfile('name', value)}
          />
          <TextField
            label="目标岗位"
            value={resume.profile.title}
            onChange={(value) => updateProfile('title', value)}
          />
        </div>

        <div className="section-heading-row contact-heading">
          <span>自定义信息</span>
          <button
            className="icon-button"
            type="button"
            title="新增信息"
            aria-label="新增信息"
            onClick={addContact}
          >
            <Plus size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="contact-editor-list">
          {resume.profile.contacts.map((contact) => (
            <div className="contact-editor-row" key={contact.id}>
              <TextField
                label="名称"
                value={contact.label}
                onChange={(value) => updateContact(contact.id, 'label', value)}
              />
              <TextField
                label="内容"
                value={contact.value}
                onChange={(value) => updateContact(contact.id, 'value', value)}
              />
              <button
                className="remove-button inline"
                type="button"
                title="删除信息"
                aria-label="删除信息"
                onClick={() => removeContact(contact.id)}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="editor-section">
        <SectionTitle title="个人优势" />
        <TextArea
          label="简介"
          value={resume.summary}
          rows={5}
          onChange={(value) => updateField('summary', value)}
        />
      </section>

      <section className="editor-section">
        <SectionTitle title="技能栈" />
        <TextArea
          label="技能"
          value={resume.skills}
          rows={4}
          onChange={(value) => updateField('skills', value)}
        />
      </section>

      <Repeater
        title="工作经历"
        section="experiences"
        entries={resume.experiences}
        addLabel="新增经历"
        onAdd={addEntry}
        onRemove={removeEntry}
      >
        {(entry) => (
          <>
            <div className="field-grid two-columns">
              <TextField
                label="公司"
                value={entry.company}
                onChange={(value) =>
                  updateEntry('experiences', entry.id, 'company', value)
                }
              />
              <TextField
                label="岗位"
                value={entry.role}
                onChange={(value) =>
                  updateEntry('experiences', entry.id, 'role', value)
                }
              />
              <TextField
                label="开始"
                value={entry.start}
                onChange={(value) =>
                  updateEntry('experiences', entry.id, 'start', value)
                }
              />
              <TextField
                label="结束"
                value={entry.end}
                onChange={(value) =>
                  updateEntry('experiences', entry.id, 'end', value)
                }
              />
            </div>
            <TextField
              label="地点"
              value={entry.location}
              onChange={(value) =>
                updateEntry('experiences', entry.id, 'location', value)
              }
            />
            <TextArea
              label="亮点"
              value={entry.description}
              rows={5}
              onChange={(value) =>
                updateEntry('experiences', entry.id, 'description', value)
              }
            />
          </>
        )}
      </Repeater>

      <Repeater
        title="项目经历"
        section="projects"
        entries={resume.projects}
        addLabel="新增项目"
        onAdd={addEntry}
        onRemove={removeEntry}
      >
        {(entry) => (
          <>
            <div className="field-grid two-columns">
              <TextField
                label="项目"
                value={entry.name}
                onChange={(value) =>
                  updateEntry('projects', entry.id, 'name', value)
                }
              />
              <TextField
                label="角色"
                value={entry.role}
                onChange={(value) =>
                  updateEntry('projects', entry.id, 'role', value)
                }
              />
              <TextField
                label="开始"
                value={entry.start}
                onChange={(value) =>
                  updateEntry('projects', entry.id, 'start', value)
                }
              />
              <TextField
                label="结束"
                value={entry.end}
                onChange={(value) =>
                  updateEntry('projects', entry.id, 'end', value)
                }
              />
            </div>
            <TextArea
              label="成果"
              value={entry.description}
              rows={5}
              onChange={(value) =>
                updateEntry('projects', entry.id, 'description', value)
              }
            />
          </>
        )}
      </Repeater>

      <Repeater
        title="教育背景"
        section="education"
        entries={resume.education}
        addLabel="新增教育"
        onAdd={addEntry}
        onRemove={removeEntry}
      >
        {(entry) => (
          <>
            <div className="field-grid two-columns">
              <TextField
                label="学校"
                value={entry.school}
                onChange={(value) =>
                  updateEntry('education', entry.id, 'school', value)
                }
              />
              <TextField
                label="学历专业"
                value={entry.degree}
                onChange={(value) =>
                  updateEntry('education', entry.id, 'degree', value)
                }
              />
              <TextField
                label="开始"
                value={entry.start}
                onChange={(value) =>
                  updateEntry('education', entry.id, 'start', value)
                }
              />
              <TextField
                label="结束"
                value={entry.end}
                onChange={(value) =>
                  updateEntry('education', entry.id, 'end', value)
                }
              />
            </div>
            <TextArea
              label="补充"
              value={entry.details}
              rows={3}
              onChange={(value) =>
                updateEntry('education', entry.id, 'details', value)
              }
            />
          </>
        )}
      </Repeater>
    </div>
  )
}

function ResumeLibraryManager({
  resumeLibrary,
  activeResumeItem,
  onSelect,
  onRename,
  onCreate,
  onDuplicate,
  onDelete,
}) {
  const items = resumeLibrary.items

  return (
    <section className="editor-section resume-library">
      <div className="section-heading-row">
        <SectionTitle icon={FileText} title="简历库" />
        <span className="library-count">{items.length} 份</span>
      </div>

      <label className="field">
        <span>当前简历</span>
        <select
          value={resumeLibrary.activeId}
          onChange={(event) => onSelect(event.target.value)}
        >
          {items.map((item, index) => (
            <option key={item.id} value={item.id}>
              {item.name ||
                getResumeRecordName(item.resume, `简历 ${index + 1}`)}
            </option>
          ))}
        </select>
      </label>

      <TextField
        label="简历名称"
        value={activeResumeItem?.name || ''}
        onChange={onRename}
      />

      <div className="resume-library-actions">
        <button
          className="ghost-button compact"
          type="button"
          onClick={onCreate}
        >
          <Plus size={15} aria-hidden="true" />
          新建
        </button>
        <button
          className="ghost-button compact"
          type="button"
          onClick={onDuplicate}
        >
          <Copy size={15} aria-hidden="true" />
          复制
        </button>
        <button
          className="ghost-button compact danger-text"
          type="button"
          disabled={items.length <= 1}
          onClick={onDelete}
        >
          <Trash2 size={15} aria-hidden="true" />
          删除
        </button>
      </div>
    </section>
  )
}

function ModuleManager({
  resume,
  activeTemplate,
  sectionOrder,
  onMove,
  onToggle,
  onReset,
  onAddCustom,
  onRemoveCustom,
}) {
  const hidden = getHiddenSectionSet(resume)
  const customSections = normalizeLayout(resume.layout).customSections

  return (
    <section className="editor-section">
      <div className="section-heading-row">
        <SectionTitle title="模块管理" />
        <button
          className="ghost-button compact"
          type="button"
          onClick={onReset}
        >
          <RotateCcw size={15} aria-hidden="true" />
          推荐顺序
        </button>
      </div>

      <div className="module-list">
        {sectionOrder.map((sectionKey, index) => {
          const isHidden = hidden.has(sectionKey)
          const customId = isCustomSectionKey(sectionKey)
            ? getCustomSectionId(sectionKey)
            : ''

          return (
            <div
              className={isHidden ? 'module-row muted' : 'module-row'}
              key={sectionKey}
            >
              <div className="module-name">
                <strong>
                  {getSectionLabel(sectionKey, activeTemplate, customSections)}
                </strong>
                <span>{customId ? '自定义' : '内置'}</span>
              </div>
              <div className="module-actions">
                <button
                  className="icon-button"
                  type="button"
                  title="上移"
                  aria-label="上移"
                  disabled={index === 0}
                  onClick={() => onMove(sectionKey, -1)}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  title="下移"
                  aria-label="下移"
                  disabled={index === sectionOrder.length - 1}
                  onClick={() => onMove(sectionKey, 1)}
                >
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  title={isHidden ? '显示' : '隐藏'}
                  aria-label={isHidden ? '显示' : '隐藏'}
                  onClick={() => onToggle(sectionKey)}
                >
                  {isHidden ? (
                    <EyeOff size={15} aria-hidden="true" />
                  ) : (
                    <Eye size={15} aria-hidden="true" />
                  )}
                </button>
                {customId ? (
                  <button
                    className="icon-button danger"
                    type="button"
                    title="删除自定义模块"
                    aria-label="删除自定义模块"
                    onClick={() => onRemoveCustom(customId)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <button
        className="ghost-button wide-button"
        type="button"
        onClick={onAddCustom}
      >
        <Plus size={16} aria-hidden="true" />
        新增自定义模块
      </button>
    </section>
  )
}

function CustomSectionsEditor({
  customSections,
  updateCustomSection,
  removeCustomSection,
}) {
  if (!customSections.length) {
    return null
  }

  return (
    <section className="editor-section">
      <SectionTitle title="自定义模块" />
      <div className="entry-list">
        {customSections.map((section) => (
          <div className="entry-card" key={section.id}>
            <button
              className="remove-button"
              type="button"
              title="删除"
              aria-label="删除"
              onClick={() => removeCustomSection(section.id)}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
            <TextField
              label="模块标题"
              value={section.title}
              onChange={(value) =>
                updateCustomSection(section.id, 'title', value)
              }
            />
            <TextArea
              label="模块内容"
              value={section.content}
              rows={5}
              onChange={(value) =>
                updateCustomSection(section.id, 'content', value)
              }
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function AvatarUploader({ avatar, onUpload, onRemove }) {
  return (
    <div className="avatar-uploader">
      <div className="avatar-preview">
        {avatar ? (
          <img src={avatar} alt="头像预览" />
        ) : (
          <UserRound size={34} aria-hidden="true" />
        )}
      </div>
      <div className="avatar-actions">
        <label className="ghost-button upload-button">
          <UploadCloud size={16} aria-hidden="true" />
          上传头像
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              onUpload(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
        {avatar ? (
          <button className="ghost-button" type="button" onClick={onRemove}>
            <X size={16} aria-hidden="true" />
            移除
          </button>
        ) : null}
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="section-title">
      {Icon ? <Icon size={16} aria-hidden="true" /> : null}
      <h2>{title}</h2>
    </div>
  )
}

function TextField({ label, value, onChange, type = 'text' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({ label, value, onChange, rows }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Repeater({
  title,
  section,
  entries,
  addLabel,
  onAdd,
  onRemove,
  children,
}) {
  return (
    <section className="editor-section">
      <div className="section-heading-row">
        <SectionTitle title={title} />
        <button
          className="icon-button"
          type="button"
          title={addLabel}
          aria-label={addLabel}
          onClick={() => onAdd(section)}
        >
          <Plus size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="entry-list">
        {entries.map((entry) => (
          <div className="entry-card" key={entry.id}>
            <button
              className="remove-button"
              type="button"
              title="删除"
              aria-label="删除"
              onClick={() => onRemove(section, entry.id)}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
            {children(entry)}
          </div>
        ))}
      </div>
    </section>
  )
}

function buildSectionDescriptors(
  resume,
  skills,
  template,
  hiddenSections = [],
) {
  const labels = getSectionLabels(template)
  const order = getEffectiveSectionOrder(resume, template)
  const hidden = getHiddenSectionSet(resume, hiddenSections)
  const customSections = normalizeLayout(resume.layout).customSections
  const sections = {
    summary: {
      key: 'summary',
      kind: 'summary',
      title: labels.summary,
      content: resume.summary,
    },
    skills: {
      key: 'skills',
      kind: 'skills',
      title: labels.skills,
      skills,
    },
    experiences: {
      key: 'experiences',
      kind: 'timeline',
      title: labels.experiences,
      items: resume.experiences.map((entry) => ({
        key: `experience:${entry.id}`,
        title: entry.company,
        subtitle: entry.role,
        meta: [entry.start, entry.end].filter(Boolean).join(' - '),
        extra: entry.location,
        details: splitLines(entry.description),
      })),
    },
    projects: {
      key: 'projects',
      kind: 'timeline',
      title: labels.projects,
      items: resume.projects.map((entry) => ({
        key: `project:${entry.id}`,
        title: entry.name,
        subtitle: entry.role,
        meta: [entry.start, entry.end].filter(Boolean).join(' - '),
        details: splitLines(entry.description),
      })),
    },
    education: {
      key: 'education',
      kind: 'timeline',
      title: labels.education,
      items: resume.education.map((entry) => ({
        key: `education:${entry.id}`,
        title: entry.school,
        subtitle: entry.degree,
        meta: [entry.start, entry.end].filter(Boolean).join(' - '),
        details: splitLines(entry.details),
      })),
    },
  }

  customSections.forEach((section) => {
    const sectionKey = getCustomSectionKey(section)
    sections[sectionKey] = {
      key: sectionKey,
      kind: 'custom',
      title: section.title || '自定义模块',
      content: section.content,
    }
  })

  return order
    .filter((sectionKey) => !hidden.has(sectionKey))
    .map((sectionKey) => sections[sectionKey])
    .filter(Boolean)
}

function ResumePreview({ resume, skills }) {
  const template = getTemplate(resume.theme.template)
  const contactItems = (resume.profile.contacts || []).filter(
    (contact) => contact.label || contact.value,
  )
  const measurementRef = useRef(null)
  const isSidebarTemplate =
    template.id === 'sidebar' || template.id === 'code-rail'
  const sectionDescriptors = useMemo(
    () =>
      buildSectionDescriptors(
        resume,
        skills,
        template,
        isSidebarTemplate ? ['skills'] : [],
      ),
    [resume, skills, template, isSidebarTemplate],
  )
  const [pages, setPages] = useState([sectionDescriptors])
  const contactSignature = contactItems
    .map((contact) => `${contact.label}:${contact.value}`)
    .join('|')

  useLayoutEffect(() => {
    const measureRoot = measurementRef.current
    const article = measureRoot?.querySelector('.resume-sheet')
    const contentArea = measureRoot?.querySelector('.resume-content-area')
    const pageProbe = measureRoot?.querySelector('.page-size-probe')

    if (!article || !contentArea || !pageProbe) {
      setPages([sectionDescriptors])
      return
    }

    const pageHeight = pageProbe.getBoundingClientRect().height
    const articleStyles = window.getComputedStyle(article)
    const contentStyles = window.getComputedStyle(contentArea)
    const articleVerticalSpacing = getVerticalSpacing(articleStyles)
    const contentVerticalSpacing = getVerticalSpacing(contentStyles)
    const headerHeight = isSidebarTemplate
      ? 0
      : getOuterHeight(article.querySelector('.resume-header'))
    const availableHeight = Math.max(
      180,
      pageHeight - articleVerticalSpacing - contentVerticalSpacing,
    )
    const firstPageContentHeight = Math.max(120, availableHeight - headerHeight)
    const measurements = {
      firstPageContentHeight,
      nextPageContentHeight: availableHeight,
      sections: {},
      items: {},
    }

    contentArea.querySelectorAll('[data-section-key]').forEach((section) => {
      measurements.sections[section.dataset.sectionKey] =
        getOuterHeight(section)
    })
    contentArea.querySelectorAll('[data-item-key]').forEach((item) => {
      measurements.items[item.dataset.itemKey] = getOuterHeight(item)
    })

    setPages(paginateSections(sectionDescriptors, measurements))
  }, [
    contactSignature,
    isSidebarTemplate,
    resume.profile.avatar,
    resume.theme.accent,
    sectionDescriptors,
    template.id,
  ])

  return (
    <>
      <div className="resume-pages">
        {pages.map((pageSections, index) => (
          <div className="resume-page-shell" key={`page-${index}`}>
            {isSidebarTemplate ? (
              <SidebarResume
                resume={resume}
                skills={skills}
                contactItems={contactItems}
                template={template}
                sections={pageSections}
              />
            ) : (
              <StandardResume
                resume={resume}
                contactItems={contactItems}
                template={template}
                sections={pageSections}
                showHeader={index === 0}
              />
            )}
            <span className="page-label">
              {index + 1} / {pages.length}
            </span>
          </div>
        ))}
      </div>

      <div
        className="pagination-measure"
        ref={measurementRef}
        aria-hidden="true"
      >
        <div className="page-size-probe" />
        {isSidebarTemplate ? (
          <SidebarResume
            resume={resume}
            skills={skills}
            contactItems={contactItems}
            template={template}
            sections={sectionDescriptors}
          />
        ) : (
          <StandardResume
            resume={resume}
            contactItems={contactItems}
            template={template}
            sections={sectionDescriptors}
            showHeader
          />
        )}
      </div>
    </>
  )
}

function StandardResume({
  resume,
  contactItems,
  template,
  sections,
  showHeader = true,
}) {
  const { profile, theme } = resume

  return (
    <article
      className={`resume-sheet resume-page template-${template.id} category-${template.category}`}
      style={{ '--accent': theme.accent }}
    >
      {showHeader ? (
        <header
          className={`resume-header ${profile.avatar ? 'with-avatar' : 'no-avatar'}`}
        >
          {profile.avatar ? <ResumeAvatar avatar={profile.avatar} /> : null}
          <div className="resume-title">
            <h2>{profile.name || '你的姓名'}</h2>
            <p>{profile.title || '目标岗位'}</p>
          </div>
          <ContactList contacts={contactItems} />
        </header>
      ) : null}

      <div className="resume-body resume-content-area">
        <SectionStack sections={sections} />
      </div>
    </article>
  )
}

function SidebarResume({ resume, skills, contactItems, template, sections }) {
  const { profile, theme } = resume
  const labels = getSectionLabels(template)
  const hidden = getHiddenSectionSet(resume)

  return (
    <article
      className={`resume-sheet resume-page template-${template.id} category-${template.category}`}
      style={{ '--accent': theme.accent }}
    >
      <aside className="sidebar-rail">
        {profile.avatar ? <ResumeAvatar avatar={profile.avatar} /> : null}
        <div className="sidebar-name">
          <h2>{profile.name || '你的姓名'}</h2>
          <p>{profile.title || '目标岗位'}</p>
        </div>
        <SidebarBlock title="基本信息">
          <ContactList contacts={contactItems} />
        </SidebarBlock>
        {!hidden.has('skills') ? (
          <SidebarBlock title={labels.skills}>
            <SkillList skills={skills} className="sidebar-skills" />
          </SidebarBlock>
        ) : null}
      </aside>
      <div className="sidebar-main resume-content-area">
        <SectionStack sections={sections} />
      </div>
    </article>
  )
}

function SectionStack({ sections }) {
  return sections.map((section) => (
    <PreviewSection
      key={section.key}
      title={section.title}
      sectionKey={section.key}
    >
      <SectionContent section={section} />
    </PreviewSection>
  ))
}

function SectionContent({ section }) {
  if (section.kind === 'summary') {
    return <p className="summary-text">{section.content}</p>
  }

  if (section.kind === 'skills') {
    return <SkillList skills={section.skills} />
  }

  if (section.kind === 'custom') {
    return <CustomSectionContent content={section.content} />
  }

  return section.items.map((item) => (
    <TimelineItem
      key={item.key}
      itemKey={item.key}
      title={item.title}
      subtitle={item.subtitle}
      meta={item.meta}
      extra={item.extra}
      details={item.details}
    />
  ))
}

function CustomSectionContent({ content }) {
  const lines = splitLines(content)

  if (!lines.length) {
    return <p className="custom-section-text">未填写</p>
  }

  return (
    <div className="custom-section-text">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  )
}

function SkillList({ skills, className = '' }) {
  return (
    <div className={`skill-list ${className}`}>
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          style={{ '--level': getSkillLevel(index) }}
        >
          {skill}
        </span>
      ))}
    </div>
  )
}

function ResumeAvatar({ avatar }) {
  return <img className="resume-avatar" src={avatar} alt="头像" />
}

function ContactList({ contacts }) {
  return (
    <ul className="contact-list">
      {contacts.map((contact) => (
        <li key={contact.id}>
          {contact.label ? <span>{contact.label}</span> : null}
          {contact.value ? <strong>{contact.value}</strong> : null}
        </li>
      ))}
    </ul>
  )
}

function SidebarBlock({ title, children }) {
  return (
    <section className="sidebar-block">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function PreviewSection({ title, children, sectionKey }) {
  return (
    <section className="resume-section" data-section-key={sectionKey}>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

function TimelineItem({ itemKey, title, subtitle, meta, extra, details }) {
  const heading = title || subtitle || '未填写'

  return (
    <div className="timeline-item" data-item-key={itemKey}>
      <div className="timeline-head">
        <div>
          <h4>{heading}</h4>
          {subtitle && title ? <p>{subtitle}</p> : null}
        </div>
        <div className="timeline-meta">
          {meta ? <span>{meta}</span> : null}
          {extra ? <span>{extra}</span> : null}
        </div>
      </div>
      {details.length > 0 ? (
        <ul>
          {details.map((detail, index) => (
            <li key={`${detail}-${index}`}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default App
