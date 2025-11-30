import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,         // 允许直接使用 HTML 标签
  breaks: true,       // 将 \n 转换为 <br>
  linkify: true,      // 自动将文本中的URL转换为链接
  typographer: true,  // 启用一些排版优化，比如将直引号转换为弯引号等
  // 代码高亮函数
  highlight: function (str: string, lang: string) {
    // 是否指定了语言（lang）并且该语言被highlight.js支持
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 尝试使用highlight.js进行高亮，并返回高亮后的HTML字符串
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch (__) {}   // 忽略错误
    }

    // 如果高亮失败，返回空字符串，让 markdown-it 使用默认处理
    return '' // 使用外部默认转义
  }
})

// 默认渲染规则
const defaultRender = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
// 重写代码块渲染以添加复制按钮
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  // 从tokens数组中获取当前索引idx对应的token。token代表一个代码块。
  const token = tokens[idx]
  // 添加空值检查
  if (!token) {
    return '' // 或者返回默认渲染
  }
  // 获取代码块的语言信息，如在 ```javascript 中的"javascript"
  const lang = token.info.trim()
  // 获取代码块的内容（即代码字符串）
  const code = token.content
  
  // 判断获取的语言是否被highlight.js支持，支持则使用该语言，否则使用'plaintext'
  const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  // 使用highlight.js对代码进行高亮处理，得到高亮后的HTML字符串
  const highlighted = hljs.highlight(code, { language: validLang }).value
  
  // 生成唯一ID用于复制功能
  const copyId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // 返回的HTML字符串
  // data-copy-id 为自定义属性，用于关联按钮和代码元素
  return `
    <div class="code-block-wrapper">
      <div class="code-header">
        <span class="language-tag">${validLang}</span>
        <button class="copy-button" data-copy-id="${copyId}" onclick="copyCode('${copyId}')">
          复制
        </button>
      </div>
      <pre class="hljs language-${validLang}"><code id="${copyId}">${highlighted}</code></pre>
    </div>
  `
}

// 添加复制函数到全局
declare global {
  interface Window {
    copyCode: (id: string) => void
  }
}

if (typeof window !== 'undefined') {
  window.copyCode = async (id: string) => {
    const codeElement = document.getElementById(id)
    if (!codeElement) return
    
    const code = codeElement.textContent || ''
    
    try {
      // 使用navigator.clipboardAPI将代码文本复制到剪贴板
      await navigator.clipboard.writeText(code)
      
      // 更新按钮文本显示复制成功
      const button = document.querySelector(`[data-copy-id="${id}"]`) as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = '已复制!'
        button.style.background = '#52c41a'
        
        setTimeout(() => {
          button.textContent = originalText
          button.style.background = ''
        }, 2000)
      }
    } catch (err) {
      console.error('复制失败:', err)
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }
}

// 导出渲染函数
export const renderMarkdown = (content: string): string => {
  return md.render(content)   // 返回渲染后的 HTML 字符串
}