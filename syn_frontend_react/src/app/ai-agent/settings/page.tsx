"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Loader2, Key, Sparkles, Wand2, Code, CheckCircle2, Mic, Video, TestTube } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { API_ENDPOINTS } from "@/lib/env"
import { FunctionCallingTester } from "@/components/function-calling-tester"

interface AIModelConfig {
    id?: number
    service_type: string
    provider: string
    api_key: string
    base_url?: string
    model_name?: string
    extra_config?: Record<string, any>
    is_active: boolean
}

const SERVICE_TYPES = [
    {
        key: "chat",
        name: "AI 聊天",
        description: "用于AI对话、内容生成等功能",
        icon: Sparkles,
        defaultBaseUrl: "https://api.siliconflow.cn/v1",
        defaultModel: "Qwen/Qwen2.5-7B-Instruct",
        placeholder: {
            baseUrl: "https://api.siliconflow.cn/v1",
            model: "Qwen/Qwen2.5-7B-Instruct"
        }
    },
    {
        key: "cover_generation",
        name: "图片生成",
        description: "用于视频封面图片生成",
        icon: Wand2,
        defaultBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
        defaultModel: "doubao-seedream-4-0-250828",
        placeholder: {
            baseUrl: "https://ark.cn-beijing.volces.com/api/v3 或 https://api.siliconflow.cn/v1",
            model: "doubao-seedream-4-0-250828 / Qwen/Qwen-Image-Edit-2509"
        }
    },
    {
        key: "speech_recognition",
        name: "语音识别",
        description: "用于音频转文字",
        icon: Mic,
        defaultBaseUrl: "https://api.openai.com/v1",
        defaultModel: "whisper-1",
        placeholder: {
            baseUrl: "https://api.openai.com/v1 或 https://api.siliconflow.cn/v1",
            model: "whisper-1"
        }
    },
    {
        key: "video_generation",
        name: "视频生成",
        description: "用于 AI 生成视频",
        icon: Video,
        defaultBaseUrl: "https://api.runwayml.com/v1",
        defaultModel: "gen3",
        placeholder: {
            baseUrl: "https://api.runwayml.com/v1",
            model: "gen3 / runway-gen2"
        }
    },
    {
        key: "function_calling",
        name: "Function Call",
        description: "用于AI函数调用和工具使用（替代OpenManus）",
        icon: Code,
        defaultBaseUrl: "https://api.siliconflow.cn/v1",
        defaultModel: "Qwen/Qwen2.5-72B-Instruct",
        placeholder: {
            baseUrl: "https://api.siliconflow.cn/v1 或 https://api.deepseek.com/v1",
            model: "Qwen/Qwen2.5-72B-Instruct / deepseek-chat"
        }
    }
]

export default function AISettingsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState<string | null>(null) // 记录正在测试的 service_type
    const [configs, setConfigs] = useState<Record<string, AIModelConfig>>({})

    // 加载配置
    useEffect(() => {
        loadConfigs()
    }, [])

    const loadConfigs = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/v1/ai/model-configs")
            const data = await response.json()

            if (data.status === "success") {
                const configMap: Record<string, AIModelConfig> = {}
                data.data.forEach((config: AIModelConfig) => {
                    configMap[config.service_type] = config
                })
                setConfigs(configMap)
            }
        } catch (error) {
            console.error("加载配置失败:", error)
            toast({
                title: "加载失败",
                description: "无法加载AI模型配置",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const saveConfig = async (serviceType: string) => {
        setSaving(true)
        try {
            const config = configs[serviceType]
            if (!config) {
                toast({
                    title: "配置为空",
                    description: "请先填写配置信息",
                    variant: "destructive"
                })
                return
            }

            const response = await fetch(`${API_ENDPOINTS.base}/api/v1/ai/model-configs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            })

            const data = await response.json()

            if (data.status === "success") {
                toast({
                    title: "保存成功",
                    description: data.message
                })
                await loadConfigs()
            } else {
                throw new Error(data.detail || "保存失败")
            }
        } catch (error: any) {
            toast({
                title: "保存失败",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const testConnection = async (serviceType: string) => {
        const config = configs[serviceType]
        if (!config || !config.api_key) {
            toast({
                title: "配置不完整",
                description: "请先填写 API Key",
                variant: "destructive"
            })
            return
        }

        setTesting(serviceType)
        try {
            const response = await fetch(`${API_ENDPOINTS.aiTestConnection}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_type: serviceType,
                    provider: config.provider,
                    api_key: config.api_key,
                    base_url: config.base_url,
                    model_name: config.model_name
                })
            })

            const data = await response.json()

            if (data.status === "success" && data.connected) {
                toast({
                    title: "✅ 连接成功",
                    description: data.message || "模型配置有效，连接正常"
                })
            } else {
                throw new Error(data.detail || data.message || "连接失败")
            }
        } catch (error: any) {
            toast({
                title: "❌ 连接失败",
                description: error.message || "无法连接到 API 端点",
                variant: "destructive"
            })
        } finally {
            setTesting(null)
        }
    }

    const updateConfig = (serviceType: string, field: keyof AIModelConfig, value: any) => {
        setConfigs(prev => {
            const existingConfig = prev[serviceType]

            if (existingConfig) {
                return {
                    ...prev,
                    [serviceType]: {
                        ...existingConfig,
                        [field]: value
                    }
                }
            }

            // 如果不存在，需要初始化完整对象
            const serviceDef = SERVICE_TYPES.find(s => s.key === serviceType)

            return {
                ...prev,
                [serviceType]: {
                    service_type: serviceType,
                    provider: "custom", // 统一使用 custom
                    api_key: "",
                    base_url: serviceDef?.defaultBaseUrl || "",
                    model_name: serviceDef?.defaultModel || "",
                    is_active: true,
                    [field]: value
                } as AIModelConfig
            }
        })
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center ">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen  text-white p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/ai-agent")}
                        className="text-white/70 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">AI 模型配置</h1>
                        <p className="text-white/60 mt-1">统一管理所有 AI 服务的 API 密钥和配置</p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="chat" className="w-full">
                    <TabsList className="grid w-full grid-cols-6 bg-white/5 h-auto py-2">
                        {SERVICE_TYPES.map(service => {
                            const Icon = service.icon
                            return (
                                <TabsTrigger
                                    key={service.key}
                                    value={service.key}
                                    className="text-white/60 data-[state=active]:bg-black data-[state=active]:text-white hover:text-white hover:bg-white/10 flex-col h-auto py-2 gap-1"
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-xs">{service.name}</span>
                                </TabsTrigger>
                            )
                        })}
                        <TabsTrigger
                            value="test"
                            className="text-white/60 data-[state=active]:bg-black data-[state=active]:text-white hover:text-white hover:bg-white/10 flex-col h-auto py-2 gap-1"
                        >
                            <TestTube className="w-4 h-4" />
                            <span className="text-xs">测试</span>
                        </TabsTrigger>
                    </TabsList>

                    {SERVICE_TYPES.map(service => {
                        const config = configs[service.key] || {
                            service_type: service.key,
                            provider: "custom",
                            api_key: "",
                            base_url: service.defaultBaseUrl,
                            model_name: service.defaultModel,
                            is_active: true
                        }

                        return (
                            <TabsContent key={service.key} value={service.key} className="space-y-4 mt-6">
                                <Card className="bg-white/5 border-white/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <service.icon className="w-5 h-5 text-primary" />
                                            {service.name}
                                        </CardTitle>
                                        <CardDescription className="text-white/60">
                                            {service.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* API Key */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Key className="w-4 h-4" />
                                                API Key *
                                            </Label>
                                            <Input
                                                type="password"
                                                value={config.api_key}
                                                onChange={(e) => updateConfig(service.key, "api_key", e.target.value)}
                                                placeholder="请输入 API Key"
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                            />
                                        </div>

                                        {/* Base URL (必填) */}
                                        <div className="space-y-2">
                                            <Label>API 基础 URL *</Label>
                                            <Input
                                                value={config.base_url || ""}
                                                onChange={(e) => updateConfig(service.key, "base_url", e.target.value)}
                                                placeholder={service.placeholder.baseUrl}
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                            />
                                            <p className="text-xs text-white/50">
                                                例如：{service.placeholder.baseUrl}
                                            </p>
                                        </div>

                                        {/* Model Name (必填) */}
                                        <div className="space-y-2">
                                            <Label>模型名称 *</Label>
                                            <Input
                                                value={config.model_name || ""}
                                                onChange={(e) => updateConfig(service.key, "model_name", e.target.value)}
                                                placeholder={service.placeholder.model}
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                                            />
                                            <p className="text-xs text-white/50">
                                                例如：{service.placeholder.model}
                                            </p>
                                        </div>

                                        {/* Extra Config (JSON) */}
                                        <div className="space-y-2">
                                            <Label>额外配置（JSON 格式，可选）</Label>
                                            <Textarea
                                                value={config.extra_config ? JSON.stringify(config.extra_config, null, 2) : ""}
                                                onChange={(e) => {
                                                    try {
                                                        const parsed = e.target.value ? JSON.parse(e.target.value) : {}
                                                        updateConfig(service.key, "extra_config", parsed)
                                                    } catch {
                                                        // Invalid JSON, ignore
                                                    }
                                                }}
                                                placeholder='{\n  "temperature": 0.7,\n  "max_tokens": 2000\n}'
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 font-mono text-sm min-h-[100px]"
                                            />
                                        </div>

                                        {/* Active Switch */}
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                                            <div>
                                                <Label className="text-base">启用此配置</Label>
                                                <p className="text-sm text-white/60 mt-1">关闭后将不使用此服务</p>
                                            </div>
                                            <Switch
                                                checked={config.is_active}
                                                onCheckedChange={(checked) => updateConfig(service.key, "is_active", checked)}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button
                                                onClick={() => testConnection(service.key)}
                                                disabled={testing === service.key || !config.api_key || !config.base_url || !config.model_name}
                                                variant="outline"
                                                className="bg-white/5 border-white/10 min-w-[120px]"
                                            >
                                                {testing === service.key ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        测试中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                        测试连接
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => saveConfig(service.key)}
                                                disabled={saving || !config.api_key || !config.base_url || !config.model_name}
                                                className="min-w-[120px]"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        保存中...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4 mr-2" />
                                                        保存配置
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Provider-specific Help */}
                                <Card className="bg-blue-500/10 border-blue-500/20">
                                    <CardHeader>
                                        <CardTitle className="text-sm text-blue-400">💡 配置提示</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-white/70 space-y-2">
                                        {service.key === "chat" && (
                                            <>
                                                <p className="font-medium text-white">常用 API 地址：</p>
                                                <p>• 硅基流动：<code className="text-blue-400">https://api.siliconflow.cn/v1</code></p>
                                                <p>• 通义千问：<code className="text-blue-400">https://dashscope.aliyuncs.com/compatible-mode/v1</code></p>
                                                <p>• OpenAI：<code className="text-blue-400">https://api.openai.com/v1</code></p>
                                            </>
                                        )}
                                        {service.key === "cover_generation" && (
                                            <>
                                                <p className="font-medium text-white">常用 API 地址：</p>
                                                <p>• 火山引擎：<code className="text-blue-400">https://ark.cn-beijing.volces.com/api/v3</code></p>
                                                <p>• 硅基流动：<code className="text-blue-400">https://api.siliconflow.cn/v1</code></p>
                                                <p>• 通义千问：<code className="text-blue-400">https://dashscope.aliyuncs.com/api/v1</code></p>
                                            </>
                                        )}
                                        {service.key === "speech_recognition" && (
                                            <>
                                                <p className="font-medium text-white">常用 API 地址：</p>
                                                <p>• OpenAI Whisper：<code className="text-blue-400">https://api.openai.com/v1</code></p>
                                                <p>• 硅基流动：<code className="text-blue-400">https://api.siliconflow.cn/v1</code></p>
                                                <p className="mt-2">模型名称：<code className="text-blue-400">whisper-1</code></p>
                                            </>
                                        )}
                                        {service.key === "video_generation" && (
                                            <>
                                                <p className="font-medium text-white">常用 API 地址：</p>
                                                <p>• Runway：<code className="text-blue-400">https://api.runwayml.com/v1</code></p>
                                                <p>• Pika Labs：<code className="text-blue-400">https://api.pika.art/v1</code></p>
                                                <p className="mt-2">⚠️ 视频生成可能需要较长时间（1-5分钟）</p>
                                            </>
                                        )}
                                        {service.key === "function_calling" && (
                                            <>
                                                <p className="font-medium text-white">推荐配置：</p>
                                                <p>• 硅基流动：<code className="text-blue-400">https://api.siliconflow.cn/v1</code></p>
                                                <p>  模型：<code className="text-blue-400">Qwen/Qwen2.5-72B-Instruct</code></p>
                                                <p>• Deepseek：<code className="text-blue-400">https://api.deepseek.com/v1</code></p>
                                                <p>  模型：<code className="text-blue-400">deepseek-chat</code></p>
                                                <p className="mt-2">💡 确保模型支持 Function Calling 功能</p>
                                            </>
                                        )}
                                        <p className="mt-3 pt-3 border-t border-white/10">
                                            <strong>测试连接</strong> - 点击测试按钮验证当前配置是否可用
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )
                    })}

                    {/* Function Calling 测试标签页 */}
                    <TabsContent value="test" className="space-y-4 mt-6">
                        <FunctionCallingTester />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
