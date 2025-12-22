"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChatList } from "./chat-list"
import { ChatInput } from "./chat-input"
import { ModelSettingsDialog } from "./model-settings-dialog"
import { Link2, Sparkles, Settings, Bot, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Chat() {
    const router = useRouter()
    const [mode, setMode] = React.useState<"chat" | "agent">("chat")
    const [messages, setMessages] = React.useState<any[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "你好！"
        }
    ])
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [settingsOpen, setSettingsOpen] = React.useState(false)
    const [isConnected, setIsConnected] = React.useState(false)

    // Check connection status
    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch("/api/v1/ai/status")
                const data = await response.json()
                setIsConnected(data.connected || false)
            } catch (error) {
                console.error("Failed to check AI status:", error)
                setIsConnected(false)
            }
        }

        checkStatus()
        // Check every 30s
        const interval = setInterval(checkStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    // 切换模式时清空消息（可选，或者保留历史）
    const handleModeChange = (newMode: string) => {
        setMode(newMode as "chat" | "agent")
        if (newMode === "agent") {
            setMessages([
                {
                    id: "agent-welcome",
                    role: "assistant",
                    content: "🤖 已切换到 Agent 模式。\n\n我可以帮你执行复杂的自动化任务！"
                }
            ])
        } else {
            setMessages([
                {
                    id: "chat-welcome",
                    role: "assistant",
                    content: "💬 已切换回对话模式。有什么可以帮你的吗？"
                }
            ])
        }
    }

    const handleSubmit = async (value: string) => {
        if (!value.trim() || isLoading) return

        const userMsg = { id: Date.now().toString(), role: "user", content: value }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            if (mode === "chat") {
                // Chat 模式：流式响应
                const apiMessages = [...messages, userMsg].map(m => ({
                    role: m.role,
                    content: m.content
                }))

                const response = await fetch("/api/v1/ai/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: apiMessages })
                })

                if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
                if (!response.body) throw new Error("No response body")

                const assistantMsgId = (Date.now() + 1).toString()
                const assistantMsg = { id: assistantMsgId, role: "assistant", content: "" }
                setMessages(prev => [...prev, assistantMsg])

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let done = false

                while (!done) {
                    const { value, done: doneReading } = await reader.read()
                    done = doneReading
                    if (value) {
                        const chunk = decoder.decode(value, { stream: true })
                        setMessages(prev => prev.map(m =>
                            m.id === assistantMsgId
                                ? { ...m, content: m.content + chunk }
                                : m
                        ))
                    }
                }
            } else {
                // Agent 模式：OpenManus (非流式，无占位气泡)
                const response = await fetch("/api/v1/agent/manus-run", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        goal: value,
                        context: {}
                    })
                })

                // 检查 HTTP 状态
                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
                }

                // 尝试解析 JSON
                let result
                try {
                    result = await response.json()
                } catch (jsonError) {
                    const text = await response.text()
                    throw new Error(`服务器返回了非 JSON 响应: ${text.substring(0, 200)}`)
                }

                if (result.success && result.data) {
                    const data = result.data
                    let resultText = `✅ **任务执行完成**\n\n**结果**: ${data.result}\n\n**执行步骤**:\n`

                    if (data.steps && Array.isArray(data.steps)) {
                        data.steps.forEach((step: any, index: number) => {
                            resultText += `${index + 1}. ${step.tool || 'Action'}: ${step.thought || ''}\n`
                        })
                    }

                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: resultText
                    }])
                } else {
                    const errorMsg = result.data?.error || result.error || "未知错误"
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `❌ **任务执行失败**\n\n${errorMsg}`
                    }])
                }
            }
        } catch (error) {
            console.error("❌ Failed to send message:", error)
            const errorMessage = error instanceof Error ? error.message : String(error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: `❌ 发送失败: ${errorMessage}`
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-[85vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-neutral-900/50 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-base font-bold text-white">Synapse AiAgent</h2>
                        <p className="text-xs font-medium text-white/50">智能项目管理助手</p>
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

            {/* Mode Switch */}
            <div className="border-b border-white/5 bg-neutral-900/40 px-6 py-3 flex justify-center">
                <Tabs value={mode} onValueChange={handleModeChange}>
                    <TabsList className="grid w-[200px] grid-cols-2 bg-white/5">
                        <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <MessageSquare className="mr-2 h-3 w-3" />
                            对话
                        </TabsTrigger>
                        <TabsTrigger value="agent" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                            <Bot className="mr-2 h-3 w-3" />
                            Agent
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-black to-neutral-950 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                <div className="mx-auto max-w-3xl">
                    <ChatList
                        messages={messages}
                        isLoading={false}
                        showTypingIndicator={false}
                        showAvatars={false}
                    />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-black pb-4 pt-2">
                <ChatInput
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    input={input}
                    setInput={setInput}
                    disabled={!isConnected}
                    placeholder={mode === "agent" ? "描述你的任务，例如：帮我分析最近的发布数据..." : "输入消息..."}
                />
            </div>

            <ModelSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
    )
}
