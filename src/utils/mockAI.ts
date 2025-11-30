import { useChatStore } from "@/stores/chat"
import { useStreamResponse } from "@/composables/useStreamResponse"
import { getRelevantArticle, getRandomArticle } from "./mockCards"

// 包含丰富 Markdown 格式的模拟回复
const mockResponses = [
  "你好！我是一个AI助手，很高兴为你服务。",
  
  `我理解你的问题，让我来帮你解答。

首先，我们需要分析问题的核心：

## 问题分析

1. **根本原因**: 理解需求不清晰
2. **影响因素**: 技术选型、团队协作
3. **解决方案**: 分阶段实施

### 技术实现

\`\`\`javascript
// 示例代码
function analyzeProblem(requirements) {
  const analysis = {
    rootCause: identifyRootCause(requirements),
    factors: identifyFactors(),
    solution: proposeSolution()
  };
  return analysis;
}
\`\`\`

希望这个分析对你有帮助！`,

  `这是一个很好的问题！根据我的知识，可以从以下几个角度考虑：

**核心要点**：
- ✅ **性能优化**: 减少不必要的重渲染
- ✅ **代码可读性**: 使用有意义的变量名
- ✅ **可维护性**: 模块化设计

**推荐资源**：
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

\`\`\`typescript
interface ComponentProps {
  title: string;
  data: any[];
  onUpdate: (data: any) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  data, 
  onUpdate 
}) => {
  return (
    <div>
      <h1>{title}</h1>
      {/* 组件内容 */}
    </div>
  );
};
\`\`\``,

  `让我详细解释一下这个前端概念：

## 现代前端开发模式

### 1. 组件化开发
将UI拆分为可复用的组件

### 2. 状态管理
使用 Pinia/Vuex 管理应用状态

### 3. 构建工具
Vite/Webpack 用于项目构建

\`\`\`css
/* 现代CSS布局 */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
}
\`\`\`

这种模式大大提升了开发效率。`,

  `基于你提供的信息，我的建议是：

**实施步骤**：
1. **需求确认** - 明确业务目标
2. **技术选型** - 选择合适的框架和工具
3. **架构设计** - 设计可扩展的架构
4. **开发实施** - 按模块逐步开发
5. **测试部署** - 确保质量并上线

\`\`\`bash
# 项目初始化命令
npm create vue@latest my-project
cd my-project
npm install
npm run dev
\`\`\``,

  `这个问题很有趣！让我想想如何最好地回答...

## 关键考虑因素

### 技术层面
- **框架选择**: Vue 3 vs React
- **状态管理**: Pinia vs Redux
- **构建工具**: Vite vs Webpack

### 业务层面
- **项目规模**: 小型/中型/大型
- **团队经验**: 技术栈熟悉度
- **时间要求**: 开发周期

\`\`\`python
# 简单的决策算法
def choose_tech_stack(project_size, team_experience, timeline):
    if project_size == 'small' and timeline == 'short':
        return 'Vue 3 + Vite'
    elif team_experience == 'react':
        return 'React + Vite'
    else:
        return 'Vue 3 + Webpack'
\`\`\``
]

// 模拟错误类型
const mockErrors = [
  {
    message: "网络连接超时，请检查网络后重试",
    code: "NETWORK_TIMEOUT",
    retryable: true
  },
  {
    message: "服务器内部错误，请稍后重试",
    code: "SERVER_ERROR",
    retryable: true
  },
  {
    message: "请求频率过高，请稍后再试",
    code: "RATE_LIMIT",
    retryable: true
  },
  {
    message: "服务暂时不可用，请稍后重试",
    code: "SERVICE_UNAVAILABLE",
    retryable: true
  }
]


export const simulateAIResponse = async (messageId: string, userMessage: string): Promise<void> => {
  const chatStore = useChatStore()
  const { simulateStreaming } = useStreamResponse()

  // 20% 的概率模拟错误
  const shouldFail = Math.random() < 0.8
  
  if (shouldFail) {
    // 模拟网络延迟后失败
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    // 随机选择一个错误
    const randomError = mockErrors[Math.floor(Math.random() * mockErrors.length)]
    
    // 更新消息状态为错误
    chatStore.updateMessage(messageId, {
      status: 'error',
      errorInfo: randomError
    })
    
    return
  }

  // 20% 的概率返回文章卡片
  const shouldShowCard = Math.random() < 0.2

  if (shouldShowCard) {
    // 第一步：先设置消息类型为卡片，显示加载状态
    chatStore.updateMessage(messageId, {
      type: 'card',
      // status: 'loading'
    })

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800))

    // 尝试获取相关文章，如果没有则随机获取
    const article = getRelevantArticle(userMessage) || getRandomArticle()
    
    // 生成引导文本
    const guideText = `我为你找到了一篇相关文章：${article.title}`
    
    // 第二步：使用流式响应显示引导文本
    await simulateStreaming(messageId, guideText)

    // 流式响应完成后，等待一小段时间再设置卡片数据
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 第三步：流式响应完成后，设置卡片数据    
    chatStore.updateMessage(messageId, {
      // content: `我为你找到了一篇相关文章：${article.title}`,
      // type: 'card',
      cardData: article,
      // status: 'sent'
    })
  } else {
    // 返回普通文本消息（带流式效果）
    // 随机选择一个回复
    const randomIndex = Math.floor(Math.random() * mockResponses.length)
    const response = `这是对你消息"${userMessage}"的回复：${mockResponses[randomIndex]}`

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    // 使用流式响应效果(打字机，更新消息内容)
    await simulateStreaming(messageId, response)

    // 更新消息状态
    chatStore.updateMessage(messageId, {status: 'sent'})
  }
}

  