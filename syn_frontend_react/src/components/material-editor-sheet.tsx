
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Sparkles, Wand2, ImageIcon } from "lucide-react"
import { backendBaseUrl } from "@/lib/env"
import { cn } from "@/lib/utils"

interface Material {
    id: string
    filename: string
    title?: string
    description?: string
    tags?: string
    note?: string
    group?: string
    cover_image?: string
    fileUrl?: string
    video_width?: number
    video_height?: number
    aspect_ratio?: string
    orientation?: "portrait" | "landscape" | "square" | string
}

export interface MaterialEditorSaveData extends Partial<Material> {
    scheduleTime?: Date
}

interface MaterialEditorSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    material: Material | null
    groupOptions: string[]
    onSave: (data: MaterialEditorSaveData) => Promise<void>
    mode?: "edit" | "create" | "batch"
    showGroupSelector?: boolean
}

export function MaterialEditorContent({
    material,
    groupOptions,
    onSave,
    mode = "edit",
    initialData,
    isSaving: externalIsSaving,
    onChange,
    hideFooter = false,
    showGroupSelector = true,
    className
}: {
    material: Material | null
    groupOptions: string[]
    onSave: (data: any) => Promise<void>
    mode?: "edit" | "create" | "batch"
    initialData?: any
    isSaving?: boolean
    onChange?: (data: MaterialEditorSaveData) => void
    hideFooter?: boolean
    showGroupSelector?: boolean
    className?: string
}) {
    const { toast } = useToast()
    const [localIsSaving, setLocalIsSaving] = useState(false)
    const isSaving = externalIsSaving || localIsSaving
    const [aiGenerating, setAiGenerating] = useState<string | null>(null)
    const [coverPrompt, setCoverPrompt] = useState("")
    const [coverJobId, setCoverJobId] = useState<string | null>(null)
    const [coverJobStatus, setCoverJobStatus] = useState<"idle" | "pending" | "running" | "succeeded" | "failed">("idle")
    const [coverJobError, setCoverJobError] = useState("")
    const coverPollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [referenceImage, setReferenceImage] = useState<File | null>(null)

    const inferredCoverAspect = useMemo<"3:4" | "4:3">(() => {
        const o = material?.orientation
        if (o === "landscape") return "4:3"
        if (o === "portrait") return "3:4"
        const w = Number(material?.video_width || 0)
        const h = Number(material?.video_height || 0)
        if (w > 0 && h > 0) return w >= h ? "4:3" : "3:4"
        return "3:4"
    }, [material?.id, material?.orientation, material?.video_width, material?.video_height])

    const [editForm, setEditForm] = useState({
        filename: "",
        title: "",
        description: "",
        tags: "",
        note: "",
        group: "",
        cover_image: "",
        scheduleTime: undefined as Date | undefined
    })

    useEffect(() => {
        if (initialData) {
            setEditForm(prev => ({ ...prev, ...initialData }))
        } else if (material) {
            setEditForm({
                filename: material.filename || "",
                title: material.title || material.filename.split('.').slice(0, -1).join('.') || "",
                description: material.description || "",
                tags: material.tags || "",
                note: material.note || "",
                group: material.group || "none",
                cover_image: material.cover_image || "",
                scheduleTime: undefined
            })
            setCoverPrompt("生成一张吸引人的封面，风格现代，高清晰度")
        } else if (mode === 'batch') {
            setEditForm(prev => ({ ...prev, group: "none" }))
        }
    }, [material?.id, mode, initialData])

    const coverSrc = useMemo(() => {
        const raw = (editForm.cover_image || "").trim()
        if (!raw) return ""
        if (raw.startsWith("http")) return raw
        return `${backendBaseUrl}/getFile?filename=${encodeURIComponent(raw)}`
    }, [editForm.cover_image])

    const coverAspectStyle = useMemo(() => {
        return { aspectRatio: inferredCoverAspect === "4:3" ? "4 / 3" : "3 / 4" }
    }, [inferredCoverAspect])

    const coverJobStorageKey = useMemo(() => {
        return material?.id ? `aiCoverJob:${material.id}` : ""
    }, [material?.id])

    const stopCoverPolling = useCallback(() => {
        if (coverPollTimerRef.current) {
            clearTimeout(coverPollTimerRef.current)
            coverPollTimerRef.current = null
        }
    }, [])

    const pollCoverJob = useCallback(async (jobId: string) => {
        if (!jobId) return
        stopCoverPolling()

        const tick = async () => {
            try {
                const response = await fetch(`/api/v1/files/ai-cover-jobs/${encodeURIComponent(jobId)}`)
                const payload = await response.json().catch(() => ({}))
                const status = payload?.data?.status as typeof coverJobStatus | undefined
                const coverPath = payload?.data?.cover_path as string | undefined
                const error = payload?.data?.error as string | undefined

                if (status) setCoverJobStatus(status)

                if (status === "succeeded" && coverPath) {
                    setEditForm(prev => ({ ...prev, cover_image: coverPath }))
                    setCoverPrompt("")
                    setCoverJobError("")
                    stopCoverPolling()
                    setCoverJobId(null)
                    if (coverJobStorageKey) localStorage.removeItem(coverJobStorageKey)
                    toast({ title: "封面已生成", description: "AI 封面生成成功，保存后生效" })
                    return
                }

                if (status === "failed") {
                    setCoverJobError(error || "封面生成失败")
                    stopCoverPolling()
                    setCoverJobId(null)
                    if (coverJobStorageKey) localStorage.removeItem(coverJobStorageKey)
                    toast({ variant: "destructive", title: "封面生成失败", description: error || "请稍后重试" })
                    return
                }
            } catch (e) {
                setCoverJobError(e instanceof Error ? e.message : "封面生成失败")
            }

            coverPollTimerRef.current = setTimeout(tick, 1200)
        }

        tick()
    }, [coverJobStorageKey, stopCoverPolling, toast])

    useEffect(() => {
        if (!coverJobStorageKey) return
        const stored = localStorage.getItem(coverJobStorageKey)
        if (stored) {
            setCoverJobId(stored)
            setCoverJobStatus("pending")
            pollCoverJob(stored)
        } else {
            setCoverJobId(null)
            setCoverJobStatus("idle")
            setCoverJobError("")
        }

        return () => {
            stopCoverPolling()
        }
    }, [coverJobStorageKey, pollCoverJob, stopCoverPolling])

    useEffect(() => {
        if (onChange) {
            const timer = setTimeout(() => {
                onChange({
                    ...editForm,
                    group: editForm.group === 'none' ? '' : editForm.group
                })
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [editForm, onChange])

	    const handleAIGenerate = async (field: 'title' | 'desc' | 'tags') => {
        setAiGenerating(field)

        try {
	            let prompt = ''
	            const filename = material?.filename || "视频素材"
                const baseName = filename.replace(/\.[^.]+$/, "")

            // 优先使用用户输入的内容作为提示词
	            if (field === 'title') {
	                const userInput = editForm.title?.trim()
	                if (userInput) {
	                    // 用户已填写内容，使用其作为基础进行润色
	                    prompt = `请基于「文件名」与「原标题」优化视频标题，使其更吸引人、更符合短视频平台特点。\n\n要求：\n- 只输出标题本身，不要解释\n- 标题不超过 30 字\n- 如原标题/文件名包含英文词，请翻译为中文（专有名词可保留原文并加中文释义）\n- 保留原标题核心含义，不要完全重写\n\n文件名：${filename}\n原标题：${userInput}`
	                } else {
	                    // 用户未填写，根据文件名生成
	                    prompt = `请根据文件名生成一个短视频标题。\n\n要求：\n- 只输出标题本身，不要解释\n- 标题不超过 30 字\n- 如果包含英文词，请翻译为中文（专有名词可保留原文并加中文释义）\n\n文件名：${filename}\n文件名(去扩展)：${baseName}`
	                }
	            } else if (field === 'desc') {
                const userInput = editForm.description?.trim()
                if (userInput) {
                    // 用户已填写内容，使用其作为基础进行润色
                    prompt = `请根据以下用户提供的要求或草稿，生成一段专业、吸引人的短视频描述文案。要求：\n1. 严格遵循用户的要求和意图\n2. 适合抖音等短视频平台\n3. 不要添加表情符号\n4. 只返回文案内容，不要其他说明\n\n用户要求/草稿：\n${userInput}`
                } else {
                    // 用户未填写，根据文件名生成
                    prompt = `为视频"${filename}"生成一段吸引人的描述文案，包含2-3个相关话题标签，适合抖音等短视频平台。只返回文案内容。`
                }
	            } else if (field === 'tags') {
	                const userInput = editForm.tags?.trim()
	                if (userInput) {
	                    // 用户已填写内容，使用其作为基础进行优化
	                    prompt = `请基于「文件名」与「现有标签/关键词」生成更规范的短视频标签。\n\n要求：\n- 输出 1-4 个标签\n- 标签之间用空格分隔\n- 标签不要带 #（系统会自动加 #）\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n- 保留原有标签核心意图，不要偏题\n\n文件名：${filename}\n现有标签/关键词：${userInput}`
	                } else {
	                    // 用户未填写，根据文件名生成
	                    prompt = `请根据文件名生成短视频标签。\n\n要求：\n- 输出 1-4 个标签\n- 标签之间用空格分隔\n- 标签不要带 #（系统会自动加 #）\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n\n文件名：${filename}\n文件名(去扩展)：${baseName}`
	                }
	            }

            const response = await fetch(`${backendBaseUrl}/api/v1/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                    stream: false
                })
            })

            if (!response.ok) throw new Error('AI generation failed')
            const data = await response.json()
            const content = data.content || data.message || ''

            const normalizeTags = (value: string) => {
                const items = value
                    .split(/[\s,，]+/)
                    .map(tag => tag.trim().replace(/^#/, ""))
                    .filter(Boolean)
                const unique: string[] = []
                for (const item of items) {
                    if (!unique.includes(item)) unique.push(item)
                }
                return unique.slice(0, 4)
            }

            if (field === 'title') {
                setEditForm(prev => ({ ...prev, title: content.trim() }))
            } else if (field === 'desc') {
                setEditForm(prev => ({ ...prev, description: content.trim() }))
            } else if (field === 'tags') {
                const tags = normalizeTags(content.trim())
                setEditForm(prev => ({ ...prev, tags: tags.join(" ") }))
            }

            toast({ title: "AI 生成完成", description: "内容已自动填充" })
        } catch (error) {
            console.error('AI generation error:', error)
            toast({ variant: "destructive", title: "AI 生成失败", description: "请稍后重试" })
        } finally {
            setAiGenerating(null)
        }
    }

    const handleGenerateCover = async () => {
        if (!coverPrompt.trim()) {
            toast({ variant: "destructive", title: "请输入提示词", description: "封面生成需要描述提示词" })
            return
        }
        if (!material?.id) {
            toast({ variant: "destructive", title: "无法生成封面", description: "请先保存素材后再生成封面" })
            return
        }

        setCoverJobError("")
        setCoverJobStatus("pending")

        try {
            const formData = new FormData()
            formData.append("platform_name", "全平台")
            formData.append("aspect_ratio", inferredCoverAspect)
            formData.append("prompt", coverPrompt.trim())
            if (referenceImage) {
                formData.append("ref_image", referenceImage)
            }

            const response = await fetch(`/api/v1/files/${encodeURIComponent(material.id)}/ai-cover-job`, {
                method: "POST",
                body: formData
            })
            const data = await response.json().catch(() => ({}))
            const jobId = data?.data?.job_id as string | undefined

            if (!response.ok || !jobId) {
                throw new Error(data?.detail || data?.message || "封面生成失败")
            }

            setCoverJobId(jobId)
            if (coverJobStorageKey) localStorage.setItem(coverJobStorageKey, jobId)
            pollCoverJob(jobId)
            toast({ title: "已开始生成封面", description: "生成中可关闭侧边栏，完成后会自动回填" })
        } catch (error) {
            console.error('Cover generation error:', error)
            setCoverJobStatus("failed")
            setCoverJobError(error instanceof Error ? error.message : "封面生成失败")
            toast({ variant: "destructive", title: "封面生成失败", description: "请稍后重试" })
        }
    }

    const handleSave = async () => {
        setLocalIsSaving(true)
        try {
            await onSave({
                ...editForm,
                group: editForm.group === 'none' ? '' : editForm.group
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLocalIsSaving(false)
        }
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <ScrollArea className="flex-1 px-6 py-6">
                <div className="space-y-8 pb-10">

                    {/* Content Info - 内容设置 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">内容设置</h3>
                            <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                <Sparkles className="w-3 h-3 mr-1" /> AI Ready
                            </Badge>
                        </div>

	                        <div className="grid gap-5">
	                            <div className="grid gap-2">
	                                <div className="flex justify-between items-center">
	                                    <Label>文件名（仅修改显示，不改磁盘文件）</Label>
	                                </div>
	                                <Input
	                                    value={editForm.filename}
	                                    onChange={e => setEditForm(prev => ({ ...prev, filename: e.target.value }))}
	                                    className="bg-white/5 border-white/10"
	                                    placeholder="例如：我的素材.mp4"
	                                />
	                            </div>

	                            <div className="grid gap-2">
	                                <div className="flex justify-between items-center">
	                                    <Label>视频标题</Label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                        onClick={() => handleAIGenerate('title')}
                                        disabled={!!aiGenerating}
                                    >
                                        {aiGenerating === 'title' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                        AI 生成
                                    </Button>
                                </div>
                                <Input
                                    value={editForm.title}
                                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="bg-white/5 border-white/10 font-medium"
                                    placeholder="输入吸引人的标题..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>描述 / 脚本</Label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                        onClick={() => handleAIGenerate('desc')}
                                        disabled={!!aiGenerating}
                                    >
                                        {aiGenerating === 'desc' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                        AI 润色
                                    </Button>
                                </div>
                                <Textarea
                                    value={editForm.description}
                                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-white/5 border-white/10 min-h-[100px]"
                                    placeholder="输入视频描述或脚本..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>标签 (Tags)</Label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                        onClick={() => handleAIGenerate('tags')}
                                        disabled={!!aiGenerating}
                                    >
                                        {aiGenerating === 'tags' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
                                        AI 推荐
                                    </Button>
                                </div>
                                <Input
                                    value={editForm.tags}
                                    onChange={e => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                    className="bg-white/5 border-white/10"
                                    placeholder="vlog, 生活, 分享 (用逗号分隔)"
                                />
                            </div>

                            {/* 分组选择器 - 仅在素材管理页面显示 */}
                            {showGroupSelector && (
                                <div className="grid gap-2">
                                    <Label>分组</Label>
                                    <Select
                                        value={editForm.group}
                                        onValueChange={value => setEditForm(prev => ({ ...prev, group: value }))}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="选择分组" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                            <SelectItem value="none">无分组</SelectItem>
                                            {groupOptions.map(group => (
                                                <SelectItem key={group} value={group}>{group}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cover Generator - AI 封面工坊 */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">封面工坊</h3>
                            {(coverJobStatus === "pending" || coverJobStatus === "running") && (
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 生成中
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Left: AI cover preview */}
                            <div className="space-y-2">
                                <div
                                    className="w-full rounded-lg border border-white/10 bg-black overflow-hidden relative group"
                                    style={coverAspectStyle}
                                >
                                    {coverSrc ? (
                                        <Image src={coverSrc} alt="Cover" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                    {!!coverSrc && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-white hover:text-white"
                                                onClick={() => setEditForm(prev => ({ ...prev, cover_image: "" }))}
                                            >
                                                清除
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center text-xs text-white/40">{inferredCoverAspect} 预览</div>
                            </div>

                            {/* Right: prompt box (same height as preview) */}
                            <div className="space-y-2">
                                <div
                                    className="flex flex-col rounded-lg border border-white/10 bg-white/5 p-3"
                                    style={coverAspectStyle}
                                >
                                    <Label className="text-xs text-white/60">AI 封面 Prompt</Label>
                                    <Textarea
                                        value={coverPrompt}
                                        onChange={e => setCoverPrompt(e.target.value)}
                                        className="mt-2 flex-1 bg-transparent border-white/10 text-sm resize-none"
                                        placeholder="描述想要的封面画面..."
                                    />
                                    <div className="mt-3 flex items-center justify-between gap-2">
                                        <div className="text-xs text-white/40 truncate">
                                            {referenceImage ? `参考图：${referenceImage.name}` : "参考图：未选择（可选）"}
                                        </div>
                                        <Button
                                            className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                                            onClick={handleGenerateCover}
                                            disabled={!!aiGenerating || coverJobStatus === "pending" || coverJobStatus === "running"}
                                        >
                                            {(coverJobStatus === "pending" || coverJobStatus === "running") ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Wand2 className="w-4 h-4" />
                                            )}
                                            <span className="ml-2 text-sm">生成</span>
                                        </Button>
                                    </div>
                                </div>
                                {coverJobError && (
                                    <p className="text-xs text-red-400">{coverJobError}</p>
                                )}
                            </div>
                        </div>

                        {/* Reference image uploader */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-white/60">上传/拖拽参考图（可选）</Label>
                                {referenceImage && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs text-white/60 hover:text-white hover:bg-white/10"
                                        onClick={() => setReferenceImage(null)}
                                    >
                                        移除
                                    </Button>
                                )}
                            </div>
                            <div
                                className="relative w-full mt-2 max-w-xl mx-auto"
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    const file = e.dataTransfer.files?.[0]
                                    if (!file) return
                                    if (!file.type.startsWith("image/")) {
                                        toast({ variant: "destructive", title: "文件类型不支持", description: "请上传图片（jpg/png/webp）" })
                                        return
                                    }
                                    setReferenceImage(file)
                                }}
                                onClick={() => {
                                    const input = document.getElementById(`ai-cover-ref-upload-${material?.id ?? "temp"}`) as HTMLInputElement | null
                                    input?.click()
                                }}
                            >
                                <div className="relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-upload h-4 w-4 text-neutral-600 dark:text-neutral-300">
                                        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                                        <path d="M7 9l5 -5l5 5"></path>
                                        <path d="M12 4l0 12"></path>
                                    </svg>
                                </div>
                                <div className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md" />
                                <input
                                    id={`ai-cover-ref-upload-${material?.id ?? "temp"}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        setReferenceImage(file)
                                    }}
                                />
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed">
                                * 封面将作为独立图片文件保存，并在发布时作为 `thumbnail_path` 上传（不覆盖视频预览/不改原视频）。
                            </p>
                        </div>
                    </div>

                </div>
            </ScrollArea>

            {!hideFooter && (
                <div className="px-6 py-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="min-w-[100px]">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'create' ? "确认发布" : "保存更改")}
                    </Button>
                </div>
            )}
        </div>
    )
}

export function MaterialEditorSheet({
    open,
    onOpenChange,
    material,
    groupOptions,
    onSave,
    mode = "edit",
    showGroupSelector = true
}: MaterialEditorSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-[770px] border-l border-white/10 bg-[#0A0A0A] p-0 flex flex-col shadow-2xl">
                <SheetHeader className="px-6 py-4 border-b border-white/10">
                    <SheetTitle>{mode === 'batch' ? '批量编辑素材' : '编辑素材详情'}</SheetTitle>
                    <SheetDescription>配置标题、描述与封面，支持 AI 一键生成。</SheetDescription>
                </SheetHeader>
                <MaterialEditorContent
                    material={material}
                    groupOptions={groupOptions}
                    onSave={async (data) => {
                        await onSave(data)
                        onOpenChange(false)
                    }}
                    mode={mode}
                    showGroupSelector={showGroupSelector}
                />
            </SheetContent>
        </Sheet>
    )
}
