# Qwen3:8B 快速启动指南

## 一、前置条件

### 1.1 本地Qwen3:8B部署

#### 使用以下任一方式部署Qwen3:8B模型：

### 选项1: 使用Ollama (推荐)

```bash
# 1. 安装Ollama
# Windows: 下载安装 https://ollama.ai/download
# macOS: brew install ollama

# 2. 拉取Qwen3:8B模型
ollama pull qwen:8b

# 3. 启动Ollama服务
ollama serve
```

### 选项2: 使用vLLM

```bash
# 1. 安装vLLM
pip install vllm

# 2. 启动vLLM服务
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-8B-Instruct \
  --port 8000
```

### 选项3: 使用LM Studio

1. 下载安装 LM Studio: https://lmstudio.ai
2. 在LM Studio中搜索并下载 Qwen3:8B 模型
3. 启动本地服务器

## 二、项目配置

### 2.1 环境变量配置

在项目根目录的 `.env.local` 文件中配置：

```env
# Qwen3:8B API 配置
# 根据您本地部署的Qwen3:8B API地址和模型名称进行配置
QWEN_API_URL=http://localhost:11434/api/chat
QWEN_MODEL=qwen3:8b
```

### 2.2 验证API连接

创建测试API连接是否正常：

```bash
# 测试Ollama API
curl http://localhost:11434/api/tags
```

## 三、启动项目

### 3.1 安装依赖

```bash
cd kejiguan-course
npm install
```

### 3.2 启动开发服务器

```bash
npm run dev
```

### 3.3 访问应用

打开浏览器访问：http://localhost:3000

## 四、功能说明

### 4.1 AI助手功能

- 课程设计辅助
- 教学方法建议
- 任务设计指导
- 评估标准制定
- 学习资源推荐

### 4.2 对话历史

系统自动保存最近的对话历史，提供上下文记忆功能。

### 4.3 降级策略

当Qwen API不可用时，系统会自动降级到模拟回复功能。

## 五、故障排除

### 5.1 常见问题

#### Q: API连接失败？
A: 检查Qwen服务是否正常运行，确认API地址和端口配置正确。

#### Q: 响应时间过长？
A: 检查GPU资源占用，考虑降低max_tokens参数。

#### Q: 如何优化性能？
A: 可以调整temperature和max_tokens参数。

### 5.2 日志查看

查看浏览器控制台和服务器日志了解详细错误信息。

## 六、高级配置

### 6.1 参数调优

在 `app/api/qwen/route.ts` 中调整：

```typescript
temperature: 0.7,  // 创造性程度 (0-1)
max_tokens: 2048, // 最大生成长度
```

### 6.2 系统提示词定制

修改 `app/api/qwen/route.ts` 中的 `systemPrompt` 变量。

## 七、安全建议

1. 确保本地API服务仅在本地网络访问
2. 生产环境部署时考虑添加认证
3. 定期备份对话历史数据
4. 监控资源使用情况，防止资源耗尽

祝您使用愉快！
