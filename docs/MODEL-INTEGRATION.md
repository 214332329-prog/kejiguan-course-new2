# 本地小模型集成完整方案

## 一、系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端界面                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ AI助手组件   │  │ 状态监控     │  │ 测试面板     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ /api/model   │  │ /api/model   │  │ /api/model   │       │
│  │ /chat        │  │ /status      │  │ /test        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Model Manager (模型管理器)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 状态监控     │  │ 重试机制     │  │ 并发控制     │       │
│  │ 健康检查     │  │ 错误处理     │  │ 速率限制     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   本地小模型服务                             │
│              (Ollama / vLLM / LM Studio)                    │
└─────────────────────────────────────────────────────────────┘
```

## 二、核心功能模块

### 2.1 模型管理器 (Model Manager)

**文件**: `lib/model-manager.ts`

**功能**:
- ✅ 统一的模型调用接口
- ✅ 实时状态监控
- ✅ 自动健康检查
- ✅ 并发请求控制
- ✅ 速率限制
- ✅ 指数退避重试机制
- ✅ 超时处理
- ✅ 资源使用监控

**配置参数**:
```typescript
interface ModelConfig {
  apiUrl: string          // 模型API地址
  modelName: string       // 模型名称
  timeout: number         // 请求超时时间 (ms)
  maxRetries: number      // 最大重试次数
  retryDelay: number      // 重试延迟 (ms)
  maxConcurrent: number   // 最大并发数
  rateLimitPerMinute: number // 每分钟最大请求数
}
```

### 2.2 API 路由

#### 2.2.1 模型对话 API
**端点**: `POST /api/model/chat`

**请求体**:
```json
{
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "content": "你好！很高兴为你服务。",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 20,
      "total_tokens": 30
    }
  },
  "responseTime": 1250,
  "timestamp": 1775010801000
}
```

#### 2.2.2 状态监控 API
**端点**: `GET /api/model/status`

**响应**:
```json
{
  "success": true,
  "data": {
    "status": {
      "isOnline": true,
      "lastCheckTime": 1775010801000,
      "responseTime": 150,
      "errorCount": 0,
      "successCount": 100,
      "totalRequests": 100,
      "averageResponseTime": 1200
    },
    "metrics": {
      "successRate": "100.00%",
      "averageResponseTime": "1200.00ms",
      "totalRequests": 100,
      "errorCount": 0,
      "successCount": 100
    }
  }
}
```

#### 2.2.3 测试 API
**端点**: `POST /api/model/test`

运行完整的测试套件，包括功能测试、性能测试和可靠性测试。

### 2.3 前端组件

#### 2.3.1 模型状态监控组件
**文件**: `components/ModelStatusMonitor.tsx`

**功能**:
- 实时显示模型在线状态
- 显示成功率、平均响应时间等关键指标
- 资源使用情况可视化（CPU、内存、GPU）
- 自动刷新（每10秒）

#### 2.3.2 AI助手组件
**文件**: `components/TeacherAIAssistant.tsx`

**功能**:
- 集成模型对话功能
- 支持上下文记忆
- 降级策略（模型不可用时显示友好提示）

## 三、环境变量配置

### 3.1 必需配置

```env
# 模型API配置
MODEL_API_URL=http://localhost:11434/api/chat
MODEL_NAME=qwen3:8b
MODEL_API_KEY=your_api_key_here

# 性能配置
MODEL_TIMEOUT=30000
MODEL_MAX_RETRIES=3
MODEL_RETRY_DELAY=1000
MODEL_MAX_CONCURRENT=5
MODEL_RATE_LIMIT=60

# 测试标准
RESPONSE_TIME_THRESHOLD=5000
ACCURACY_STANDARD=0.85
```

### 3.2 配置说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| MODEL_API_URL | http://localhost:11434/api/chat | 本地模型API地址 |
| MODEL_NAME | qwen3:8b | 模型名称 |
| MODEL_API_KEY | - | API密钥（可选） |
| MODEL_TIMEOUT | 30000 | 请求超时时间（毫秒） |
| MODEL_MAX_RETRIES | 3 | 最大重试次数 |
| MODEL_RETRY_DELAY | 1000 | 重试延迟（毫秒） |
| MODEL_MAX_CONCURRENT | 5 | 最大并发请求数 |
| MODEL_RATE_LIMIT | 60 | 每分钟最大请求数 |
| RESPONSE_TIME_THRESHOLD | 5000 | 响应时间阈值（毫秒） |
| ACCURACY_STANDARD | 0.85 | 准确率标准（0-1） |

## 四、部署步骤

### 4.1 部署本地模型

#### 选项1: Ollama (推荐)
```bash
# 安装Ollama
# Windows: https://ollama.ai/download
# macOS: brew install ollama

# 拉取模型
ollama pull qwen3:8b

# 启动服务
ollama serve
```

#### 选项2: vLLM
```bash
# 安装vLLM
pip install vllm

# 启动服务
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-8B-Instruct \
  --port 8000
```

#### 选项3: LM Studio
1. 下载安装 LM Studio: https://lmstudio.ai
2. 搜索并下载 Qwen3:8B 模型
3. 启动本地服务器

### 4.2 配置环境变量

1. 复制 `.env.local.example` 到 `.env.local`
2. 根据您的模型部署方式修改配置
3. 确保 `MODEL_API_URL` 指向正确的地址

### 4.3 启动网站

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 五、测试验证

### 5.1 运行测试套件

```bash
# 通过API运行测试
curl -X POST http://localhost:3000/api/model/test
```

### 5.2 测试项目

1. **连接测试** - 验证模型服务是否在线
2. **基本聊天功能** - 测试基本对话能力
3. **上下文记忆功能** - 测试多轮对话上下文
4. **错误处理功能** - 测试异常情况处理
5. **响应时间测试** - 验证响应时间是否符合要求
6. **并发请求测试** - 测试并发处理能力
7. **速率限制测试** - 验证速率限制功能
8. **重试机制测试** - 测试自动重试功能
9. **超时处理测试** - 测试超时处理机制

### 5.3 性能要求

- ✅ 响应时间 ≤ 5000ms
- ✅ 准确率 ≥ 85%
- ✅ 支持并发请求处理
- ✅ 具备完善的错误处理机制

## 六、安全机制

### 6.1 API密钥验证
- 支持 Bearer Token 认证
- 可在环境变量中配置 `MODEL_API_KEY`

### 6.2 速率限制
- 每分钟最大请求数限制
- 防止资源耗尽和滥用

### 6.3 并发控制
- 最大并发请求数限制
- 防止系统过载

### 6.4 错误处理
- 完善的错误捕获和处理
- 不暴露敏感信息
- 友好的错误提示

## 七、监控和日志

### 7.1 实时监控
- 模型在线状态
- 响应时间统计
- 成功率统计
- 资源使用情况

### 7.2 日志记录
- 所有请求和响应记录
- 错误日志
- 性能指标

## 八、故障排除

### 8.1 常见问题

#### Q: 模型连接失败？
A: 
1. 检查模型服务是否已启动
2. 确认 `MODEL_API_URL` 配置正确
3. 检查网络连接

#### Q: 响应时间过长？
A:
1. 检查GPU资源占用
2. 调整 `MODEL_TIMEOUT` 配置
3. 优化模型参数

#### Q: 测试失败？
A:
1. 检查模型是否正常运行
2. 查看详细错误信息
3. 调整测试标准（如有必要）

### 8.2 调试方法

1. 查看浏览器控制台日志
2. 查看服务器日志
3. 使用测试API获取详细信息
4. 检查模型管理器状态

## 九、最佳实践

1. **定期健康检查** - 系统自动每30秒检查一次
2. **监控资源使用** - 关注CPU、内存、GPU使用情况
3. **合理设置超时** - 根据模型性能调整超时时间
4. **配置重试机制** - 提高系统可靠性
5. **记录关键指标** - 便于性能优化和问题排查

## 十、更新和维护

### 10.1 更新模型
1. 停止当前模型服务
2. 拉取或下载新模型
3. 更新 `MODEL_NAME` 配置
4. 重启服务

### 10.2 更新配置
1. 修改 `.env.local` 文件
2. 重启Next.js服务
3. 验证配置生效

---

**文档版本**: 1.0
**最后更新**: 2026-04-01
