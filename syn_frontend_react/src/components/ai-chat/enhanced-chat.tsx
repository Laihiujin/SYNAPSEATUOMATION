"use client"

import * as React from "react"
import { Thread, ThreadSidebar } from "./thread-sidebar"
import { ChatList } from "./chat-list"
import { ChatInput } from "./chat-input"
import type { ToolCall } from "./tool-call-display"
import {
  AgentReasoning,
  AgentTaskQueue
} from "@/components/ai-elements"
import { useManusStream } from "@/hooks/useManusStream"
import { Link2, Sparkles, Settings, Bot, MessageSquare, Sidebar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { API_ENDPOINTS } from "@/lib/env"

interface Message {
  id: string
  role: "user" | "assistant" | "system" | "tool"
  content: string
  timestamp?: Date
  tool_calls?: ToolCall[]
  thinking?: string
  metadata?: Record<string, any>
}

interface ModelConfig {
  service_type: string
  provider: string
  model_name: string
  is_active: boolean
}

export function EnhancedAIChat() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = React.useState<"chat" | "agent" | "openmanus">("chat")

  // Thread管理
  const [threads, setThreads] = React.useState<Thread[]>([])
  const [currentThreadId, setCurrentThreadId] = React.useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  // 消息管理
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isConnected, setIsConnected] = React.useState(false)

  // AI Elements state
  const [agentThinking, setAgentThinking] = React.useState<string>("")
  const [isAgentThinking, setIsAgentThinking] = React.useState(false)
  const [agentTaskQueue, setAgentTaskQueue] = React.useState<Array<{
    id: string
    name: string
    status: "pending" | "in-progress" | "completed" | "failed"
    metadata?: Record<string, any>
  }>>([])
	  const [showAgentPanel, setShowAgentPanel] = React.useState(true)
	
	  // OpenManus 流式状态
	  const manusStream = useManusStream()
	  const resetManusStream = manusStream.resetState
	  const startManusStreaming = manusStream.startStreaming
	  const manusLogMessageIdRef = React.useRef<string | null>(null)
	  const manusLogThreadIdRef = React.useRef<string | null>(null)
	  const manusLogContentRef = React.useRef<string>("")
	  const manusLogSavedRef = React.useRef<boolean>(false)
	  const manusEventCursorRef = React.useRef<number>(0)

  // 模型配置
  const [chatModelConfig, setChatModelConfig] = React.useState<ModelConfig | null>(null)
  const [agentModelConfig, setAgentModelConfig] = React.useState<ModelConfig | null>(null)
  const [openmanusModelConfig, setOpenmanusModelConfig] = React.useState<ModelConfig | null>(null)

  // 加载线程列表（按模式过滤）
  const loadThreads = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/?limit=50&mode=${mode}`)
      const data = await response.json()
      if (data.status === "success") {
        setThreads(data.data.threads)
      }
    } catch (error) {
      console.error("Failed to load threads:", error)
    }
  }, [mode])

  // 加载模型配置
  const loadModelConfigs = React.useCallback(async () => {
    try {
      // 加载 Chat 模式的模型配置
      const chatResponse = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/model-configs/chat`)
      const chatData = await chatResponse.json()
      if (chatData.status === "success" && chatData.data) {
        setChatModelConfig(chatData.data)
      }

      // 加载 Agent 模式的模型配置（Function Calling）
      const agentResponse = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/model-configs/function_calling`)
      const agentData = await agentResponse.json()
      if (agentData.status === "success" && agentData.data) {
        setAgentModelConfig(agentData.data)
        // OpenManus 也使用 Function Calling 配置
        setOpenmanusModelConfig(agentData.data)
      }
    } catch (error) {
      console.error("Failed to load model configs:", error)
    }
  }, [])

  // 加载线程消息
  const loadMessages = React.useCallback(async (threadId: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/${threadId}/messages`
      )
      const data = await response.json()
      if (data.status === "success") {
        const loadedMessages: Message[] = data.data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          tool_calls: msg.tool_calls,
          metadata: msg.metadata
        }))
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast({
        title: "错误",
        description: "加载消息失败",
        variant: "destructive"
      })
    }
  }, [toast])

  // 创建新线程（带 mode 参数）
  const handleCreateThread = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `新对话 ${new Date().toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`,
          mode: mode  // 传递当前模式
        })
      })
      const data = await response.json()
      if (data.status === "success") {
	        const newThread: Thread = {
	          id: data.data.thread_id,
	          title: data.data.title,
	          created_at: data.data.created_at,
	          updated_at: data.data.updated_at,
	          message_count: 0
	        }
	        setThreads(prev => [newThread, ...prev])
	        setCurrentThreadId(newThread.id)
	        setMessages([])
	        resetManusStream()
	        manusLogMessageIdRef.current = null
	        manusLogThreadIdRef.current = null
	        manusLogContentRef.current = ""
	        manusLogSavedRef.current = false
	        manusEventCursorRef.current = 0
        setAgentTaskQueue([])
        setAgentThinking("")
        setIsAgentThinking(false)
        toast({
          title: "成功",
          description: "新对话已创建"
        })
      }
    } catch (error) {
      console.error("Failed to create thread:", error)
      toast({
        title: "错误",
        description: "创建对话失败",
        variant: "destructive"
	      })
	    }
	  }, [toast, mode, resetManusStream])

  // 删除线程
  const handleDeleteThread = React.useCallback(async (threadId: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/${threadId}`,
        { method: 'DELETE' }
      )
      if (response.ok) {
        setThreads(prev => prev.filter(t => t.id !== threadId))
        if (currentThreadId === threadId) {
          setCurrentThreadId(null)
          setMessages([])
        }
        toast({
          title: "成功",
          description: "对话已删除"
        })
      }
    } catch (error) {
      console.error("Failed to delete thread:", error)
      toast({
        title: "错误",
        description: "删除对话失败",
        variant: "destructive"
      })
    }
  }, [currentThreadId, toast])

  // 重命名线程
  const handleRenameThread = React.useCallback(async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/${threadId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle })
        }
      )
      if (response.ok) {
        setThreads(prev => prev.map(t =>
          t.id === threadId ? { ...t, title: newTitle } : t
        ))
        toast({
          title: "成功",
          description: "对话已重命名"
        })
      }
    } catch (error) {
      console.error("Failed to rename thread:", error)
      toast({
        title: "错误",
        description: "重命名失败",
        variant: "destructive"
      })
    }
  }, [toast])

  // 选择线程
	  const handleSelectThread = React.useCallback((threadId: string) => {
	    // 切换线程时，清理运行态，避免新旧对话互相串台（尤其是 OpenManus 流式事件）
	    resetManusStream()
	    manusLogMessageIdRef.current = null
	    manusLogThreadIdRef.current = null
	    manusLogContentRef.current = ""
	    manusLogSavedRef.current = false
	    manusEventCursorRef.current = 0

    // Agent 面板也清一下（避免上一轮残留）
    setAgentTaskQueue([])
    setAgentThinking("")
    setIsAgentThinking(false)
	
	    setCurrentThreadId(threadId)
	    loadMessages(threadId)
	  }, [loadMessages, resetManusStream])

  // 保存消息到线程
  const saveMessageToThread = React.useCallback(async (
    threadId: string,
    role: string,
    content: string,
    toolCalls?: ToolCall[]
  ) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/${threadId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role,
            content,
            tool_calls: toolCalls
          })
        }
      )
      const data = await response.json()
      if (data.status === "success") {
        // 更新线程列表中的消息计数
        setThreads(prev => prev.map(t =>
          t.id === threadId
            ? { ...t, message_count: t.message_count + 1, updated_at: data.data.created_at }
            : t
        ))
      }
    } catch (error) {
      console.error("Failed to save message:", error)
    }
  }, [])

  // 发送消息
  const handleSubmit = React.useCallback(async (value: string) => {
    if (!value.trim() || isLoading) return
    if (mode === "openmanus" && manusStream.isStreaming) {
      toast({
        title: "请稍等",
        description: "Manus 正在执行中，结束后再发送下一条消息",
      })
      return
    }

    // 如果没有当前线程，创建一个
    let threadId = currentThreadId
    if (!threadId) {
      try {
        const response = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/threads/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: value.substring(0, 30) + (value.length > 30 ? '...' : ''),
            mode: mode  // 传递当前模式
          })
        })
        const data = await response.json()
        if (data.status === "success" && data.data.thread_id) {
          threadId = data.data.thread_id
          const newThread: Thread = {
            id: threadId!,
            title: data.data.title,
            created_at: data.data.created_at,
            updated_at: data.data.updated_at,
            message_count: 0
          }
          setThreads(prev => [newThread, ...prev])
          setCurrentThreadId(threadId!)
        } else {
          throw new Error("Failed to create thread")
        }
      } catch (error) {
        toast({
          title: "错误",
          description: "创建对话失败",
          variant: "destructive"
        })
        return
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    // 保存用户消息
    if (threadId) {
      await saveMessageToThread(threadId, "user", value)
    }

    try {
      if (mode === "chat") {
        // Chat 模式：流式响应
        const apiMessages = [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.content
        }))

        const response = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages })
        })

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
        if (!response.body) throw new Error("No response body")

        const assistantMsgId = (Date.now() + 1).toString()
        const assistantMsg: Message = { id: assistantMsgId, role: "assistant", content: "", timestamp: new Date() }
        setMessages(prev => [...prev, assistantMsg])

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let fullContent = ""

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            fullContent += chunk
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: fullContent }
                : m
            ))
          }
        }

        // 保存助手消息
        if (threadId) {
          await saveMessageToThread(threadId, "assistant", fullContent)
        }
      } else if (mode === "agent") {
        // Agent 模式 - 使用 Function Calling（不插入占位气泡）
        setIsAgentThinking(true)
        setAgentThinking("正在分析任务需求...")

        const apiMessages = [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.content
        }))

        setAgentThinking("选择合适的工具...")

        const response = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/agent-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
        }

        const result = await response.json()

        if (result.status === "success" && result.data) {
          const data = result.data

          // 更新任务队列
          if (data.tool_calls && data.tool_calls.length > 0) {
            setAgentThinking("执行工具调用...")
            const tasks = data.tool_calls.map((call: any, idx: number) => ({
              id: `task-${idx}`,
              name: call.name,
              status: call.result ? "completed" : call.error ? "failed" : "in-progress",
              metadata: { args: call.arguments, result: call.result }
            }))
            setAgentTaskQueue(tasks)
          }

          // 构建结果文本
          let resultText = ""

          if (data.success) {
            resultText = `✅ **任务执行完成**\n\n${data.message}\n\n`

            // 工具调用信息（保留原有展示）
            if (data.tool_calls && data.tool_calls.length > 0) {
              resultText += `**执行了 ${data.tool_calls.length} 次工具调用**:\n`
              data.tool_calls.forEach((call: any, index: number) => {
                resultText += `\n${index + 1}. **${call.name}**\n`
                resultText += `   参数: \`${JSON.stringify(call.arguments)}\`\n`
                if (call.result) {
                  const resultStr = typeof call.result === 'string'
                    ? call.result
                    : JSON.stringify(call.result, null, 2)
                  resultText += `   结果: ${resultStr.substring(0, 200)}${resultStr.length > 200 ? '...' : ''}\n`
                }
              })
            }

            resultText += `\n**迭代次数**: ${data.iterations || 1}`
          } else {
            resultText = `❌ **任务执行失败**\n\n${data.message || '未知错误'}`
          }

          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: resultText,
            tool_calls: data.tool_calls,
            timestamp: new Date()
          }])

          setIsAgentThinking(false)
          setAgentThinking("")

          // 保存助手消息
          if (threadId) {
            await saveMessageToThread(threadId, "assistant", resultText, data.tool_calls)
          }
        } else {
          const errorMsg = result.detail || "未知错误"
          const errorContent = `❌ **任务执行失败**\n\n${errorMsg}`
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: errorContent,
            timestamp: new Date()
          }])
          setIsAgentThinking(false)
          setAgentThinking("")

          // 保存错误消息，避免“后台有记录 UI 无记录”
          if (threadId) {
            await saveMessageToThread(threadId, "assistant", errorContent)
          }
        }
      } else if (mode === "openmanus") {
        // OpenManus 模式 - 使用流式执行
        const logMessageId = `manus-log-${Date.now()}`
        const logHeader = "🟠 **Manus 开始执行...**\n"
        try {
          // 创建一个“运行日志”消息，plan/thinking/tool/结果都写到聊天区（避免都挤在右侧面板）
          manusLogMessageIdRef.current = logMessageId
          manusLogThreadIdRef.current = threadId || null
          manusLogContentRef.current = logHeader
          manusLogSavedRef.current = false
          manusEventCursorRef.current = 0
          setMessages(prev => [...prev, {
            id: logMessageId,
            role: "assistant",
            content: logHeader,
            timestamp: new Date()
          }])

	          // 启动流式执行
	          await startManusStreaming(
	            value,
	            undefined,
	            false,  // 暂不需要确认
	            threadId || undefined
	          )

        } catch (streamError) {
          console.error("OpenManus streaming error:", streamError)
          const errText = streamError instanceof Error ? streamError.message : String(streamError)
          const errorLine = `\n❌ **错误**：${errText}\n`
          manusLogContentRef.current = (manusLogContentRef.current || "") + errorLine
          setMessages(prev => prev.map(m => (
            m.id === logMessageId ? { ...m, content: (m.content || "") + errorLine } : m
          )))
        }
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorContent = `❌ 发送失败: ${errorMessage}`
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date()
      }])
      if (threadId) {
        await saveMessageToThread(threadId, "assistant", errorContent)
      }
	    } finally {
	      setIsLoading(false)
	    }
	  }, [currentThreadId, messages, isLoading, mode, toast, saveMessageToThread, manusStream.isStreaming, startManusStreaming])

  // OpenManus: 将流式事件写入聊天区（message 组件），而不是只显示在右侧任务面板
  React.useEffect(() => {
    if (mode !== "openmanus") return
    const logId = manusLogMessageIdRef.current
    if (!logId) return

    const events = manusStream.events
    const startIndex = manusEventCursorRef.current
    if (events.length <= startIndex) return

    const append = (text: string) => {
      manusLogContentRef.current = (manusLogContentRef.current || "") + text
      setMessages(prev => prev.map(m => (
        m.id === logId ? { ...m, content: (m.content || "") + text } : m
      )))
    }

    for (let i = startIndex; i < events.length; i++) {
      const ev: any = events[i]
      switch (ev.type) {
        case "init":
          append(`\n**初始化**：${ev.message || ev.status || "开始"}\n`)
          break
        case "plan": {
          const plan = ev.plan || {}
          append(`\n**计划**：${plan.goal || ""}\n`)
          if (plan.strategy) append(`- 策略：${plan.strategy}\n`)
          if (plan.estimated_steps) append(`- 预计步数：${plan.estimated_steps}\n`)
          if (Array.isArray(plan.available_tools) && plan.available_tools.length > 0) {
            append(`- 可用工具：${plan.available_tools.map((t: any) => t.name).join(", ")}\n`)
          }
          break
        }
        case "thinking": {
          const content = String(ev.content || "").trim()
          // 过滤心跳式短状态（例如“执行第 N 步...”），保留更像“思考说明”的内容
          if (content && content.length >= 20) {
            append(`\n**思考**：${content}\n`)
          }
          break
        }
        case "confirmation_required":
          append(`\n**需要确认**：\`${ev.tool_name || "unknown"}\`\n`)
          break
        case "confirmation_received":
          append(`\n**确认结果**：\`${ev.tool_name || "unknown"}\` = ${ev.approved ? "✅ 同意" : "❌ 拒绝"}\n`)
          break
        case "tool_call": {
          const name = ev.tool_name || "unknown"
          append(`\n**工具调用**：\`${name}\`\n`)
          if (ev.arguments !== undefined) {
            const argsStr = typeof ev.arguments === "string" ? ev.arguments : JSON.stringify(ev.arguments, null, 2)
            append("```json\n" + argsStr + "\n```\n")
          }
          break
        }
        case "step_complete": {
          const name = ev.tool_name ? `\`${ev.tool_name}\`` : "一步"
          append(`\n✅ **完成**：${name}\n`)
          if (ev.result) append("```text\n" + String(ev.result).slice(0, 2000) + "\n```\n")
          break
        }
        case "final_result": {
          const result = ev.result || {}
          const finalText = result.result || result.message || ""
          append(`\n🏁 **最终结果**：\n${finalText ? finalText + "\n" : ""}`)
          break
        }
        case "error":
          append(`\n❌ **错误**：${ev.error || ev.message || "Unknown error"}\n`)
          break
        default:
          break
      }
    }

    manusEventCursorRef.current = events.length
  }, [mode, manusStream.events])

  // OpenManus: 执行结束后将“运行日志”落盘到线程消息，确保刷新/切换线程后 UI 仍能看到记录
  React.useEffect(() => {
    if (mode !== "openmanus") return
    const threadId = manusLogThreadIdRef.current
    const logId = manusLogMessageIdRef.current
    if (!threadId || !logId) return
    if (manusStream.isStreaming) return
    if (manusLogSavedRef.current) return

    const content = (manusLogContentRef.current || "").trim()
    if (!content) return

    // 只要执行跑过（哪怕失败），也保存一次，避免“后台有记录 UI 无记录”
    void saveMessageToThread(threadId, "assistant", content)
    manusLogSavedRef.current = true
  }, [mode, manusStream.isStreaming, saveMessageToThread])

  // 移动端默认收起侧栏与任务面板，避免把聊天区挤成一条缝
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (isMobile) {
      setSidebarOpen(false)
      setShowAgentPanel(false)
    }
  }, [])

  // 初始化
  React.useEffect(() => {
    loadThreads()
    loadModelConfigs()

    // Check connection status
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.base || 'http://localhost:7000'}/api/v1/ai/status`)
        const data = await response.json()
        setIsConnected(data.connected || false)
      } catch (error) {
        console.error("Failed to check AI status:", error)
        setIsConnected(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [loadThreads, loadModelConfigs])

	  // 当 mode 切换时，重新加载线程并清空当前对话
	  React.useEffect(() => {
	    resetManusStream()
	    manusLogMessageIdRef.current = null
	    manusLogThreadIdRef.current = null
	    manusLogContentRef.current = ""
	    manusLogSavedRef.current = false
	    manusEventCursorRef.current = 0

    setAgentTaskQueue([])
    setAgentThinking("")
    setIsAgentThinking(false)
	
	    setCurrentThreadId(null)
	    setMessages([])
	    loadThreads()
	  }, [mode, loadThreads, resetManusStream])

  return (
    <div className="flex h-[85vh] w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
      {/* Thread Sidebar */}
      {sidebarOpen && (
        <ThreadSidebar
          threads={threads}
          currentThreadId={currentThreadId}
          onSelectThread={handleSelectThread}
          onCreateThread={handleCreateThread}
          onDeleteThread={handleDeleteThread}
          onRenameThread={handleRenameThread}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 bg-neutral-900/50 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Sidebar className="h-4 w-4" />
            </Button>

            <div>
              <h2 className="text-base font-bold text-white">SynapseAgent</h2>
              <div className="flex items-center gap-2">
                {/* <p className="text-xs font-medium text-white/50">AiAgent</p> */}
                {/* 显示当前模式使用的模型 */}
                {mode === "chat" && chatModelConfig && (
                  <span className="text-xs text-blue-400/70">
                    • Chat模型: {chatModelConfig.model_name}{/*  || chatModelConfig.provider */}
                  </span>
                )}
                {mode === "agent" && agentModelConfig && (
                  <span className="text-xs text-purple-400/70">
                    • Agent模型: {agentModelConfig.model_name }  {/* || agentModelConfig.provider */}
                  </span>
                )}
                {mode === "openmanus" && openmanusModelConfig && (
                  <span className="text-xs text-orange-400/70">
                    • Manus模型: {openmanusModelConfig.model_name}
                  </span>
                )}
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/ai-agent/settings")}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4 mr-1" />
              配置
            </Button>
            <Badge
              variant="outline"
              className={`gap-1 text-xs font-normal ${isConnected
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/5 text-white/40"
                }`}
            >
              <Sparkles className="h-3 w-3" />
              {isConnected ? "在线" : "离线"}
            </Badge>
          </div>
        </div>

        {/* 模式切换 & 任务面板按钮 */}
        <div className="border-b border-white/5 bg-neutral-900/40 px-6 py-3">
          <div className="relative flex items-center justify-center">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "chat" | "agent" | "openmanus")}>
              <TabsList className="grid w-[300px] grid-cols-3 bg-white/5">
                <TabsTrigger
                  value="chat"
                  className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  title={chatModelConfig ? `使用模型: ${chatModelConfig.model_name}` : "对话模式"}
                >
                  <MessageSquare className="mr-2 h-3 w-3" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="agent"
                  className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  title={agentModelConfig ? `使用模型: ${agentModelConfig.model_name}` : "Agent模式"}
                >
                  <Bot className="mr-2 h-3 w-3" />
                  Agent
                </TabsTrigger>
                <TabsTrigger
                  value="openmanus"
                  className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                  title={openmanusModelConfig ? `使用模型: ${openmanusModelConfig.model_name}` : "OpenManus模式"}
                >
                  <Sparkles className="mr-2 h-3 w-3" />
                  Manus
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {(mode === "agent" || mode === "openmanus") && (
              <div className="absolute right-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgentPanel(!showAgentPanel)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  任务面板
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-black to-neutral-950 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <div className="mx-auto max-w-3xl">
              <ChatList
                messages={messages.filter((m: any) => m.role !== 'tool') as any}
                isLoading={false}
                showTypingIndicator={false}
                showAvatars={false}
              />
            </div>
          </div>

          {/* Agent Side Panel */}
	          {(mode === "agent" || mode === "openmanus") && showAgentPanel && (
	            <div className="w-80 border-l border-white/10 bg-black/40 backdrop-blur-sm overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
	              <div className="p-4 space-y-4">
	                <div className="flex items-center justify-between">
	                  <h3 className="text-sm font-semibold text-white/90">{mode === "openmanus" ? "Manus 面板" : "Agent 面板"}</h3>
	                  <div className="flex items-center gap-2">
	                    {mode === "openmanus" && (
	                      <Button
	                        variant="ghost"
	                        size="sm"
	                        onClick={() => manusStream.resetState()}
	                        className="h-7 px-2 text-xs text-white/50 hover:text-white hover:bg-white/10"
	                      >
	                        清空
	                      </Button>
	                    )}
	                    {mode === "agent" && (
	                      <Button
	                        variant="ghost"
	                        size="sm"
	                        onClick={() => {
	                          setAgentTaskQueue([])
	                          setAgentThinking("")
	                          setIsAgentThinking(false)
	                        }}
	                        className="h-7 px-2 text-xs text-white/50 hover:text-white hover:bg-white/10"
	                      >
	                        清空
	                      </Button>
	                    )}
	                    <Button
	                      variant="ghost"
	                      size="icon"
	                      className="h-6 w-6 text-white/40 hover:text-white/60"
	                      onClick={() => setShowAgentPanel(false)}
	                    >
	                      ×
	                    </Button>
	                  </div>
	                </div>

	                {/* 任务面板：只放“状态 + 队列”，详细过程放到聊天区 */}
	                {mode === "openmanus" && (
	                  <>
	                    {/* 思考过程 */}
	                    {manusStream.currentThinking && (
	                      <AgentReasoning content={manusStream.currentThinking} isThinking={manusStream.isStreaming} />
	                    )}
	 
	                    {/* 任务队列 */}
	                    {manusStream.tasks.length > 0 && (
	                      <AgentTaskQueue
                        tasks={manusStream.tasks}
                        title="工具调用队列"
	                        collapsible={true}
	                      />
	                    )}
	                  </>
	                )}

                {/* Agent 模式的原有显示 */}
                {mode === "agent" && (
                  <>
                    {isAgentThinking && agentThinking && (
                      <AgentReasoning content={agentThinking} isThinking={isAgentThinking} />
                    )}

                    {agentTaskQueue.length > 0 && (
                      <AgentTaskQueue
                        tasks={agentTaskQueue}
                        title="工具调用队列"
                        collapsible={true}
                      />
                    )}
                  </>
                )}

                {/* 空状态 */}
                {mode === "openmanus" && !manusStream.isStreaming && manusStream.tasks.length === 0 && (
                  <div className="text-center text-xs text-white/40">暂无任务</div>
                )}
                {mode === "agent" && agentTaskQueue.length === 0 && !isAgentThinking && (
                  <div className="text-center text-xs text-white/40">暂无任务</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-black pb-4 pt-2">
	          <ChatInput
	            isLoading={isLoading || (mode === "openmanus" && manusStream.isStreaming) || (mode === "agent" && isAgentThinking)}
	            onSubmit={handleSubmit}
	            input={input}
	            setInput={setInput}
	            disabled={!isConnected}
	            placeholder={mode === "agent" ? "描述你的任务，例如：帮我分析最近的发布数据..." : "输入消息..."}
	          />
        </div>
      </div>
    </div>
  )
}
