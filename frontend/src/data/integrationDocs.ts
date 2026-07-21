export interface DocCommand {
  label: string
  code: string
}

export interface DocSection {
  title: string
  body: string
  commands?: DocCommand[]
}

export interface IntegrationDoc {
  slug: string
  title: string
  vendor: string
  mark: string
  markClass: string
  description: string
  summary: string
  endpointLabel: string
  endpoint: string
  model: string
  tags: string[]
  sections: DocSection[]
}

export interface DocEndpoints {
  claude: string
  openai: string
  gemini: string
}

export const commonFlow = [
  {
    title: '注册或登录账号',
    body: '打开本站，点击右上角注册或登录。新客户建议先完成邮箱验证，避免后续创建 Key 时收不到通知。',
    link: '/register',
    linkText: '去注册'
  },
  {
    title: '进入控制台',
    body: '登录后进入控制台，先确认账户余额、可用分组和模型权限。余额不足时先在充值页面补充额度。',
    link: '/dashboard',
    linkText: '进入控制台'
  },
  {
    title: '生成 API Key',
    body: '进入 API Key 管理，新建 Key，填写名称，按需要设置额度、模型范围和过期时间。提交后立即复制并妥善保管。',
    link: '/keys',
    linkText: 'API Key 管理'
  },
  {
    title: '填入客户端并验证',
    body: '把 Key 和对应 Base URL 填进 Codex、Claude Code、Gemini CLI 或其他工具，先拉取模型列表，再发起一次简单对话测试。'
  }
]

export function createIntegrationDocs(endpoints: DocEndpoints): IntegrationDoc[] {
  return [
    {
      slug: 'claude-code', title: 'Claude Code', vendor: 'Anthropic', mark: 'A',
      markClass: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300',
      description: 'Anthropic 官方 AI 编程助手，支持终端交互、代码分析、Git 工作流、项目级修改和多轮开发任务。',
      summary: '适合已经习惯 Claude 工作流的客户。本站兼容 Anthropic Messages 接口，Claude Code 请求会落到 /v1/messages。',
      endpointLabel: 'Claude 兼容地址', endpoint: endpoints.claude,
      model: 'claude-3-7-sonnet / claude-3-5-sonnet', tags: ['终端', '代码分析', 'Git 工作流'],
      sections: [
        { title: '安装 Claude Code', body: '先确认本机已安装 Node.js 18 或更高版本，然后安装 Claude Code。安装完成后运行 claude --version 确认命令可用。', commands: [{ label: 'macOS / Linux / Windows', code: 'npm install -g @anthropic-ai/claude-code\nclaude --version' }] },
        { title: '配置本站 Key', body: 'Claude 类客户端通常把 Base URL 填为站点根地址，客户端会自动请求 /v1/messages。如果某个版本要求 API 前缀，则改填 /v1。', commands: [
          { label: 'macOS / Linux', code: `export ANTHROPIC_API_KEY="sk-你的本站Key"\nexport ANTHROPIC_BASE_URL="${endpoints.claude}"\nclaude` },
          { label: 'Windows PowerShell', code: `$env:ANTHROPIC_API_KEY="sk-你的本站Key"\n$env:ANTHROPIC_BASE_URL="${endpoints.claude}"\nclaude` }
        ] },
        { title: '开始使用', body: '进入项目目录后启动 claude，让它先读取项目结构，再提出明确任务。首次测试建议问“读取当前项目并总结目录结构”。', commands: [{ label: '项目内启动', code: 'cd your-project\nclaude' }] },
        { title: '排错要点', body: '401 通常是 Key 没复制完整或已被禁用；404 多半是 Base URL 多写或少写了 /v1；模型不可用时到控制台确认 Key 允许的模型分组。' }
      ]
    },
    {
      slug: 'codex', title: 'Codex CLI & App', vendor: 'OpenAI', mark: 'O',
      markClass: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white',
      description: 'OpenAI 推出的编程智能体工具，可读取、修改和运行代码，支持多模型选择和本地开发协作。',
      summary: 'Codex 走 OpenAI 兼容接口，Base URL 使用 /v1，Key 使用你在本站 API Key 管理里创建的密钥。',
      endpointLabel: 'OpenAI 兼容地址', endpoint: endpoints.openai,
      model: 'gpt-4.1 / gpt-4o / deepseek-v4-flash', tags: ['CLI', '桌面应用', 'OpenAI 兼容'],
      sections: [
        { title: '生成本站 API Key', body: '登录本站后进入控制台，打开 API Key 管理，点击新建。建议名称写 Codex，额度按需设置，创建后立即复制 Key。' },
        { title: '配置 Codex CLI', body: '在终端设置 OpenAI 兼容环境变量，然后启动 Codex。OPENAI_BASE_URL 必须带 /v1。', commands: [
          { label: 'macOS / Linux', code: `export OPENAI_API_KEY="sk-你的本站Key"\nexport OPENAI_BASE_URL="${endpoints.openai}"\ncodex` },
          { label: 'Windows PowerShell', code: `$env:OPENAI_API_KEY="sk-你的本站Key"\n$env:OPENAI_BASE_URL="${endpoints.openai}"\ncodex` }
        ] },
        { title: '配置 Codex App', body: '打开 Codex App 设置，选择 OpenAI Compatible 或自定义 Provider。API Key 填本站密钥，Base URL 填 /v1，模型填控制台可用模型名。' },
        { title: '验证连接', body: '让 Codex 执行一个只读任务，例如“列出当前目录并解释项目结构”。如果模型列表为空，先检查 Key 分组和余额。' }
      ]
    },
    {
      slug: 'gemini', title: 'Gemini CLI', vendor: 'Google', mark: 'G',
      markClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
      description: 'Google 官方 Gemini 命令行工具，支持代码辅助、文件操作、上下文问答和多种安装方式。',
      summary: 'Gemini 原生请求使用 /v1beta/models 路径。支持自定义 Gemini Endpoint 的客户端填本站 /v1beta 地址。',
      endpointLabel: 'Gemini 兼容地址', endpoint: endpoints.gemini,
      model: 'gemini-2.5-pro / gemini-2.5-flash', tags: ['Gemini', '命令行', '多模态'],
      sections: [
        { title: '安装 Gemini CLI', body: '先安装 Node.js 18+，再安装 Gemini CLI。不同版本命令可能略有差异，安装后先运行 gemini --version。', commands: [{ label: 'macOS / Linux / Windows', code: 'npm install -g @google/gemini-cli\ngemini --version' }] },
        { title: '配置本站 Key', body: 'Gemini 原生接口通常使用 GEMINI_API_KEY。若你的 Gemini CLI 版本支持自定义 API 地址，把 Base URL 填为本站 Gemini 兼容地址。', commands: [
          { label: 'macOS / Linux', code: `export GEMINI_API_KEY="sk-你的本站Key"\nexport GEMINI_BASE_URL="${endpoints.gemini}"\ngemini` },
          { label: 'Windows PowerShell', code: `$env:GEMINI_API_KEY="sk-你的本站Key"\n$env:GEMINI_BASE_URL="${endpoints.gemini}"\ngemini` }
        ] },
        { title: '无法设置 Base URL 时', body: '如果当前版本 Gemini CLI 不支持自定义 Endpoint，请改用支持 OpenAI Compatible Provider 的客户端，Base URL 填 /v1，模型名填 gemini 系列模型。' },
        { title: '验证连接', body: '先执行一个短问题，例如“用一句话说明你是谁”。如果返回认证失败，检查 Key 是否复制完整并且没有过期。' }
      ]
    },
    {
      slug: 'opencode', title: 'Opencode', vendor: 'Open Source Community', mark: '</>',
      markClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
      description: '开源 AI 编程智能体，支持终端界面、桌面应用和 IDE 扩展等使用模式。',
      summary: 'Opencode 推荐使用 OpenAI 兼容 Provider。把本站 /v1 作为 Base URL，再填入 Key 和模型名即可。',
      endpointLabel: 'OpenAI 兼容地址', endpoint: endpoints.openai,
      model: 'gpt-4.1 / claude-3-7-sonnet / deepseek-v4-flash', tags: ['开源', '终端', 'IDE'],
      sections: [
        { title: '安装 Opencode', body: '根据你的安装方式选择 npm、bun 或桌面版。安装后先确认 opencode 命令存在。', commands: [{ label: 'npm', code: 'npm install -g opencode-ai\nopencode --version' }, { label: 'bun', code: 'bun install -g opencode-ai\nopencode --version' }] },
        { title: '添加自定义 Provider', body: '在 Opencode 的 Provider 设置里选择 OpenAI Compatible。名称可写 ACAIM，Base URL 填 /v1，API Key 填本站密钥。', commands: [{ label: '配置示例', code: `{\n  "provider": "openai-compatible",\n  "name": "ACAIM",\n  "baseURL": "${endpoints.openai}",\n  "apiKey": "sk-你的本站Key",\n  "model": "gpt-4.1"\n}` }] },
        { title: '项目内使用', body: '进入项目目录后启动 Opencode，先让它读取 README 和 package 文件，再要求它修改代码。大任务建议分步骤提交。' },
        { title: '排错要点', body: '如果提示 unsupported provider，改选 OpenAI Compatible；如果提示 model not found，到控制台查看 Key 允许的模型列表。' }
      ]
    },
    {
      slug: 'openclaw', title: 'OpenClaw', vendor: 'Open Source Community', mark: 'OC',
      markClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
      description: '强大的 AI 自动化智能体平台，支持多渠道消息集成、网页任务、工具扩展和工作流编排。',
      summary: 'OpenClaw 按自定义 OpenAI 兼容模型接入，适合自动化任务和多工具调用场景。',
      endpointLabel: 'OpenAI 兼容地址', endpoint: endpoints.openai,
      model: 'gpt-4.1 / deepseek-v4-flash', tags: ['自动化', '工具调用', '工作流'],
      sections: [
        { title: '准备 Key', body: '建议单独创建一个名为 OpenClaw 的 Key，并限制额度。自动化任务可能连续调用模型，额度限制能避免误用。' },
        { title: '配置模型供应商', body: '进入 OpenClaw 设置页，新增 Provider，类型选择 OpenAI Compatible。Base URL 填本站 /v1，API Key 填密钥，默认模型填可用模型名。', commands: [{ label: 'Provider 示例', code: `Provider: OpenAI Compatible\nName: ACAIM\nBase URL: ${endpoints.openai}\nAPI Key: sk-你的本站Key\nDefault Model: gpt-4.1` }] },
        { title: '绑定到 Agent', body: '在 Agent 配置中选择刚创建的 ACAIM Provider，开启需要的工具权限。首次运行建议只打开文件读取和网页搜索等低风险工具。' },
        { title: '验证工作流', body: '创建一个简单任务，例如“读取网页标题并总结”。确认调用日志、模型输出和扣费记录都正常后再接生产任务。' }
      ]
    },
    {
      slug: 'hermes', title: 'Hermes Agent', vendor: 'Nous Research', mark: 'H',
      markClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
      description: '具有学习能力的 AI 智能体，能从执行经验中积累技能并自主优化能力。',
      summary: 'Hermes Agent 可按 OpenAI 兼容模型接入。建议为长期运行 Agent 单独创建低额度 Key。',
      endpointLabel: 'OpenAI 兼容地址', endpoint: endpoints.openai,
      model: 'gpt-4.1 / hermes / deepseek-v4-flash', tags: ['Agent', '长期任务', '技能记忆'],
      sections: [
        { title: '创建专用 Key', body: '长期 Agent 会持续发起请求，建议单独创建 Hermes Agent 专用 Key，并设置每日或总额度上限。' },
        { title: '填写连接信息', body: '在 Hermes Agent 的模型设置中选择 Custom OpenAI 或 OpenAI Compatible。Base URL 填 /v1，API Key 填本站 Key。', commands: [{ label: '环境变量示例', code: `OPENAI_API_KEY=sk-你的本站Key\nOPENAI_BASE_URL=${endpoints.openai}\nHERMES_MODEL=gpt-4.1` }] },
        { title: '设置安全边界', body: '首次运行关闭危险工具，只保留读取、搜索和计划类能力。确认 Agent 行为稳定后，再逐步开放写文件、执行命令等权限。' },
        { title: '观察调用记录', body: '运行后进入控制台日志页查看请求、模型、消耗和错误信息。若频率过高，可给 Key 增加额度限制或降低 Agent 并发。' }
      ]
    },
    {
      slug: 'seedance', title: 'Seedance', vendor: 'ByteDance', mark: 'S',
      markClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
      description: '视频生成模型接入教程，适合把文生视频、图生视频等能力接到支持 OpenAI 视频接口的客户端。',
      summary: '视频接口走 OpenAI 兼容视频路径。客户端支持自定义 OpenAI 视频接口时，Base URL 仍填本站 /v1。',
      endpointLabel: 'OpenAI 视频兼容地址', endpoint: endpoints.openai,
      model: 'seedance / sora-video / veo', tags: ['视频生成', '多模态', 'OpenAI 兼容'],
      sections: [
        { title: '确认账号权限', body: '视频模型消耗通常更高。创建 Key 前先确认账户余额、模型权限和分组可用，必要时单独给视频任务创建 Key。' },
        { title: '配置视频客户端', body: '在支持 OpenAI 视频接口的客户端里填入本站 /v1 和 API Key，模型名使用控制台可见的视频模型名。', commands: [{ label: '请求示例', code: `curl "${endpoints.openai}/videos" \\\n  -H "Authorization: Bearer sk-你的本站Key" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "seedance",\n    "prompt": "A clean product demo video, smooth camera movement"\n  }'` }] },
        { title: '查看任务结果', body: '视频任务可能是异步返回。提交后保存 task id，在客户端或控制台查看任务状态，完成后再下载结果。' },
        { title: '成本建议', body: '视频生成建议设置较低额度并先小批量测试。确认分辨率、时长和提示词稳定后再扩大调用。' }
      ]
    }
  ]
}
