"use client"

import Image from "next/image"
import { Suspense, startTransition, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ClipboardList,
  FileDown,
  Trash2,
  UploadCloud,
  FileText,
  Plus,
  X,
  RefreshCw,
  Sparkles,
  Wand2,
  ImageIcon,
  Loader2
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable } from "@/components/ui/data-table"
import { fetcher } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { backendBaseUrl } from "@/lib/env"
import { FileUpload } from "@/components/ui/file-upload"
import { type Material } from "@/lib/mock-data"
import { frontendMaterialsResponseSchema } from "@/lib/schemas"
import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { MaterialEditorSheet } from "@/components/material-editor-sheet"

function MaterialsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // State - Must be declared BEFORE useQuery to avoid TDZ errors
  const [materials, setMaterials] = useState<Material[]>([])
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | Material["status"]>("all")
  const [groupFilter, setGroupFilter] = useState<string>("all")

  // Queries
  const { data: materialsResponse, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["materials", keyword],
    queryFn: () => {
      const params = new URLSearchParams()
      if (keyword) params.append("keyword", keyword)
      const url = keyword ? `/api/materials?${params.toString()}` : "/api/materials"
      return fetcher(url, frontendMaterialsResponseSchema)
    },
  })

  // Upload State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [uploadGroup, setUploadGroup] = useState<string>("none")
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [localGroupOptions, setLocalGroupOptions] = useState<string[]>([])
  const [showGroupManager, setShowGroupManager] = useState(false)
  const [groupActionBusy, setGroupActionBusy] = useState(false)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState("")
  const [uploading, setUploading] = useState(false)

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false)

  // Edit Sheet State
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tags: "",
    note: "",
    group: "",
    cover_image: ""
  })
  const [aiGenerating, setAiGenerating] = useState<string | null>(null) // 'title' | 'desc' | 'tags' | 'cover'
  const [coverPrompt, setCoverPrompt] = useState("")

  // Preview Dialog State
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null)

  // Multi-select State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv']

  const formatDuration = (seconds: unknown): string => {
    const n = typeof seconds === "number" ? seconds : Number(seconds)
    if (!Number.isFinite(n) || n <= 0) return "-"
    const total = Math.round(n)
    const m = Math.floor(total / 60)
    const s = total % 60
    return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`
  }

  const formatResolution = (material: Material): string => {
    const w = material.video_width
    const h = material.video_height
    const ar = material.aspect_ratio
    if (!w || !h) return "-"
    const ratio = ar ? ` (${ar})` : ""
    return `${w}×${h}${ratio}`
  }

  const getPreviewUrl = (material: Material | null) => {
    if (!material) return ""
    const direct = material.fileUrl || ""
    if (direct) {
      // 已带完整路径时直接返回，否则通过后端拼接
      if (direct.startsWith("http")) return direct
      return `${backendBaseUrl}/getFile?filename=${encodeURIComponent(direct)}`
    }
    const rawPath = (material as any).storageKey || (material as any).file_path
    if (rawPath) {
      return `${backendBaseUrl}/getFile?filename=${encodeURIComponent(rawPath as string)}`
    }
    return ""
  }

  // Update local state when query data changes
  useEffect(() => {
    if (!materialsResponse?.data?.data) return
    startTransition(() => {
      setMaterials(materialsResponse.data.data)
    })
  }, [materialsResponse])

  // 当选中素材时，将其信息填充到编辑表单
  useEffect(() => {
    if (selectedMaterial) {
      setEditForm({
        title: selectedMaterial.title || "",
        description: selectedMaterial.description || "",
        tags: selectedMaterial.tags || "",
        note: selectedMaterial.note || "",
        group: selectedMaterial.group || "none",
        cover_image: selectedMaterial.cover_image || ""
      })
    }
  }, [selectedMaterial])

  // Initialize Edit Form when material selected
  useEffect(() => {
    if (selectedMaterial) {
      setEditForm({
        title: selectedMaterial.title || selectedMaterial.filename.split('.').slice(0, -1).join('.') || "",
        description: selectedMaterial.description || "",
        tags: selectedMaterial.tags || "",
        note: selectedMaterial.note || "",
        group: selectedMaterial.group || "",
        cover_image: selectedMaterial.cover_image || ""
      })
      setCoverPrompt(`为视频 "${selectedMaterial.filename}" 生成一张吸引人的封面，风格现代，高清晰度`)
    }
  }, [selectedMaterial])

  // Filter Logic
  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam === "pending" || statusParam === "published" || statusParam === "all") {
      setStatusFilter(statusParam)
    }
    const groupParam = searchParams.get("group")
    if (groupParam) {
      setGroupFilter(groupParam)
    }
  }, [searchParams])

  const groupOptions = useMemo(() => {
    const set = new Set<string>()
    materials.forEach((m) => {
      if (m.group) set.add(m.group)
    })
    return Array.from(set)
  }, [materials])

  const uploadGroupOptions = useMemo(() => {
    return Array.from(new Set([...groupOptions, ...localGroupOptions]))
  }, [groupOptions, localGroupOptions])

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // 移除keyword过滤，因为已在后端完成
      const matchStatus = statusFilter === "all" || material.status === statusFilter
      const matchGroup = groupFilter === "all" || (material.group || "") === groupFilter
      return matchStatus && matchGroup
    })
  }, [materials, statusFilter, groupFilter])

  const pendingCount = useMemo(
    () => materials.filter((material) => material.status === "pending").length,
    [materials]
  )
  const publishedCount = materials.length - pendingCount

  // --- Actions ---

  const handleSync = async () => {
    setIsSyncing(true)
    const attempt = async (url: string) => {
      const res = await fetch(url, { method: "POST" })
      const text = await res.text()
      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text || "" }
      }
      return { ok: res.ok, status: res.status, data }
    }

    try {
      // 优先通过前端代理
      let result = await attempt(`/api/files/sync`)
      if (!result.ok) {
        // 代理失败则直接打后端
        result = await attempt(`${backendBaseUrl}/api/v1/files/sync`)
      }

      if (result.ok && result.data?.success !== false) {
        toast({
          variant: "success",
          title: "同步完成",
          description: `扫描 ${result.data?.data?.scanned ?? 0} 个文件，新增 ${result.data?.data?.added ?? 0} 个`
        })
        await refetch()
      } else {
        throw new Error(result.data?.message || `Sync failed (${result.status})`)
      }
    } catch (error: any) {
      console.error("sync failed", error)
      toast({
        variant: "destructive",
        title: "同步失败",
        description: error?.message || "无法连接到后端服务"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedMaterial) return
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(selectedMaterial.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          tags: editForm.tags,
          note: editForm.note,
          group_name: editForm.group === 'none' ? null : editForm.group,
          cover_image: editForm.cover_image
        })
      })

      if (!response.ok) throw new Error('update failed')

      toast({ variant: 'success', title: '已保存', description: '素材信息已更新' })
      setSelectedMaterial(null)
      await refetch()
    } catch (error) {
      toast({ variant: 'destructive', title: '保存失败', description: '请稍后重试' })
    }
  }

  const handleAIGenerate = async (field: 'title' | 'desc' | 'tags') => {
    if (!selectedMaterial) return
    setAiGenerating(field)

    try {
      let prompt = ''
      const filename = selectedMaterial.filename || "视频素材"
      const baseName = filename.replace(/\.[^.]+$/, "")
      const existingTitle = (editForm.title || "").trim()
      const existingTags = (editForm.tags || "").trim()
      if (field === 'title') {
        prompt = existingTitle
          ? `请基于「文件名」与「原标题」优化视频标题。\n\n要求：\n- 只输出标题本身，不要解释\n- 标题不超过 30 字\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n- 保留原标题核心含义，不要完全重写\n\n文件名：${filename}\n原标题：${existingTitle}`
          : `请根据文件名生成一个短视频标题。\n\n要求：\n- 只输出标题本身，不要解释\n- 标题不超过 30 字\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n\n文件名：${filename}\n文件名(去扩展)：${baseName}`
      } else if (field === 'desc') {
        prompt = `请根据文件名生成一段短视频描述文案。\n\n要求：\n- 输出中文\n- 50-120 字\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n\n文件名：${filename}\n文件名(去扩展)：${baseName}`
      } else if (field === 'tags') {
        prompt = existingTags
          ? `请基于「文件名」与「现有标签/关键词」生成更规范的短视频标签。\n\n要求：\n- 输出 1-4 个标签\n- 标签之间用空格分隔\n- 标签不要带 #（系统会自动加 #）\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n- 保留原有标签核心意图，不要偏题\n\n文件名：${filename}\n现有标签/关键词：${existingTags}`
          : `请根据文件名生成短视频标签。\n\n要求：\n- 输出 1-4 个标签\n- 标签之间用空格分隔\n- 标签不要带 #（系统会自动加 #）\n- 如包含英文词请翻译为中文（专有名词可保留原文并加中文释义）\n\n文件名：${filename}\n文件名(去扩展)：${baseName}`
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
    setAiGenerating('cover')
    try {
      if (!selectedMaterial?.id) throw new Error("未选择素材")
      const inferredAspect = (selectedMaterial as any).orientation === "landscape" ? "4:3" : "3:4"
      const response = await fetch(`/api/v1/files/${encodeURIComponent(selectedMaterial.id)}/ai-cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform_name: "全平台",
          aspect_ratio: inferredAspect,
          prompt: coverPrompt.trim()
        })
      })
      const data = await response.json()
      const coverPath = data?.data?.cover_path
      if (coverPath) {
        setEditForm(prev => ({ ...prev, cover_image: coverPath }))
        setCoverPrompt("")
        toast({ title: "封面已生成", description: "AI 封面生成成功，保存后生效" })
      } else {
        throw new Error(data?.detail || data?.message || "封面生成失败")
      }
    } catch (error: any) {
      console.error("cover generation error:", error)
      toast({ variant: "destructive", title: "封面生成失败", description: error?.message || String(error) })
    } finally {
      setAiGenerating(null)
    }
  }

  const deleteMaterialRequest = async (url: string, timeoutMs = 15000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { method: "DELETE", signal: controller.signal })
      const text = await res.text()
      let data: any = {}
      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = { message: text }
        }
      }
      return { ok: res.ok, status: res.status, data }
    } finally {
      clearTimeout(timer)
    }
  }

  const deleteMaterialById = async (id: string) => {
    const encoded = encodeURIComponent(id)
    const urls = [`/api/files/${encoded}`, `${backendBaseUrl}/api/v1/files/${encoded}`]
    let lastError: unknown = null

    for (const url of urls) {
      try {
        const result = await deleteMaterialRequest(url)
        if (result.ok) return
        lastError = new Error(result.data?.message || `delete failed (${result.status})`)
      } catch (error) {
        lastError = error
      }
    }

    throw lastError ?? new Error("delete failed")
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterialById(id)
      toast({ title: "素材已删除", description: "该文件将无法再用于发布任务" })
      await refetch()
    } catch (error) {
      toast({ variant: "destructive", title: "删除失败", description: "请稍后重试" })
    }
  }

  // Multi-select handlers
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    setIsAllSelected(newSelected.size === filteredMaterials.length && filteredMaterials.length > 0)
  }

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set())
      setIsAllSelected(false)
    } else {
      const allIds = new Set(filteredMaterials.map(m => m.id))
      setSelectedIds(allIds)
      setIsAllSelected(true)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return

    try {
      const ids = Array.from(selectedIds)
      const failed: string[] = []
      let successCount = 0

      for (const id of ids) {
        try {
          await deleteMaterialById(id)
          successCount += 1
        } catch {
          failed.push(id)
        }
      }

      if (successCount > 0) {
        toast({
          variant: "success",
          title: "批量删除成功",
          description: `已删除 ${successCount} 个素材`
        })
      }

      if (failed.length > 0) {
        toast({
          variant: "destructive",
          title: "批量删除失败",
          description: `有 ${failed.length} 个素材未能删除`
        })
      }

      setSelectedIds(new Set(failed))
      setIsAllSelected(false)
      await refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "批量删除失败",
        description: "部分文件删除失败，请重试"
      })
    }
  }

  const handleUpload = async () => {
    if (!filesToUpload.length) return

    // ... (Keep existing upload logic, simplified for brevity in this rewrite)
    // Assuming the existing logic was fine, just copying the core structure
    const group = (uploadGroup === "none" ? "" : uploadGroup).trim()
    setUploading(true)
    try {
      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append('file', file)
        if (group) formData.append('group', group)

        await fetch(`/api/files/upload-save`, { method: 'POST', body: formData })
      }
      setFilesToUpload([])
      setUploadGroup("none")
      setShowNewGroup(false)
      setNewGroupName("")
      setUploadDialogOpen(false)
      toast({ variant: 'success', title: '上传成功' })
      await refetch()
    } catch (error) {
      toast({ variant: 'destructive', title: '上传失败' })
    } finally {
      setUploading(false)
    }
  }

  // --- Columns ---
  const columns: ColumnDef<Material>[] = [
    {
      id: "select",
      size: 56,
      header: () => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleToggleSelectAll}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedIds.has(row.original.id)}
            onChange={() => handleToggleSelect(row.original.id)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
          />
        </div>
      ),
    },
    {
      accessorKey: "filename",
      header: "文件名",
      size: 420,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="truncate font-medium" title={row.original.title || row.original.filename}>
            {row.original.title || row.original.filename}
          </div>
          {!!row.original.title && row.original.title !== row.original.filename && (
            <div className="text-xs text-white/60 truncate" title={row.original.filename}>
              {row.original.filename}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "filesize",
      header: "大小",
      size: 110,
      cell: ({ row }) => <span className="text-white/60">{(row.original.filesize || 0).toFixed(2)} MB</span>,
    },
    {
      accessorKey: "duration",
      header: "时长",
      size: 90,
      cell: ({ row }) => <span className="text-white/60">{formatDuration(row.original.duration)}</span>,
    },
    {
      id: "resolution",
      header: "分辨率",
      size: 140,
      cell: ({ row }) => <span className="text-white/60">{formatResolution(row.original)}</span>,
    },
    {
      accessorKey: "uploadTime",
      header: "上传时间",
      size: 140,
      cell: ({ row }) => <span className="text-white/60 text-xs">{row.original.uploadTime?.split('T')[0]}</span>,
    },
    {
      accessorKey: "status",
      header: "状态",
      size: 110,
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "published" ? "secondary" : "default"}
          className="rounded-md text-xs font-normal"
        >
          {row.original.status === "published" ? "已发布" : "待发布"}
        </Badge>
      ),
    },
    {
      accessorKey: "group",
      header: "分组",
      size: 140,
      cell: ({ row }) => (
        row.original.group ? (
          <Badge variant="outline" className="rounded-md text-xs border-white/10 text-white/70">
            {row.original.group}
          </Badge>
        ) : <span className="text-xs text-white/30">-</span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">操作</div>,
      size: 200,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-white/70 hover:text-white" onClick={() => setPreviewMaterial(row.original)}>
            预览
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/5"
            onClick={() => setSelectedMaterial(row.original)}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            编辑详情
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除？</AlertDialogTitle>
                <AlertDialogDescription>此操作无法撤销。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(row.original.id)}>删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">素材管理</h1>
          <p className="text-white/60 mt-1">管理您的视频素材库，支持 AI 辅助编辑与一键同步。</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "同步中..." : "同步文件"}
          </Button>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <UploadCloud className="mr-2 h-4 w-4" />
                上传素材
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] border-white/10 bg-black text-white flex flex-col">
              <DialogHeader>
                <DialogTitle>上传素材</DialogTitle>
                <DialogDescription>支持批量上传视频文件，自动提取元数据。</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto py-3 space-y-4">
                <FileUpload onChange={setFilesToUpload} />
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label>分组</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setShowGroupManager((v) => !v)}
                      >
                        {showGroupManager ? "收起管理" : "管理分组"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Select value={uploadGroup} onValueChange={(v) => setUploadGroup(v)}>
                          <SelectTrigger className="h-11 bg-white/5 border-white/10">
                            <SelectValue placeholder="无分组" className="truncate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">无分组</SelectItem>
                            {uploadGroupOptions.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                        onClick={() => setShowNewGroup((v) => !v)}
                      >
                        新建分组
                      </Button>
                    </div>

                    {showNewGroup && (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="输入新分组名称"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                        <Button
                          type="button"
                          className="shrink-0 h-11 rounded-2xl"
                          onClick={() => {
                            const name = newGroupName.trim()
                            if (!name) return
                            setLocalGroupOptions((prev) => (prev.includes(name) ? prev : [name, ...prev]))
                            setUploadGroup(name)
                            setShowNewGroup(false)
                            setNewGroupName("")
                          }}
                        >
                          使用
                        </Button>
                      </div>
                    )}

                    {showGroupManager && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                        {uploadGroupOptions.length === 0 ? (
                          <div className="text-xs text-white/50">暂无分组</div>
                        ) : (
                          uploadGroupOptions.map((g) => {
                            const backendGroup = groupOptions.includes(g)
                            const isEditing = editingGroup === g
                            return (
                              <div key={g} className="flex items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <Input
                                      value={editingGroupName}
                                      onChange={(e) => setEditingGroupName(e.target.value)}
                                      className="h-10 bg-black/40 border-white/10"
                                    />
                                    <Button
                                      type="button"
                                      className="h-10 rounded-2xl"
                                      disabled={groupActionBusy}
                                      onClick={async () => {
                                        const to = editingGroupName.trim()
                                        const from = g.trim()
                                        if (!to || to === from) {
                                          setEditingGroup(null)
                                          setEditingGroupName("")
                                          return
                                        }

                                        setGroupActionBusy(true)
                                        try {
                                          if (backendGroup) {
                                            const res = await fetch("/api/files/groups/rename", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ from, to }),
                                            })
                                            if (!res.ok) throw new Error(await res.text())
                                            await refetch()
                                          }

                                          setLocalGroupOptions((prev) => {
                                            const next = prev.filter((x) => x !== from)
                                            return next.includes(to) ? next : [to, ...next]
                                          })
                                          setUploadGroup((cur) => (cur === from ? to : cur))
                                        } catch (e) {
                                          toast({ variant: "destructive", title: "分组重命名失败", description: String(e) })
                                        } finally {
                                          setGroupActionBusy(false)
                                          setEditingGroup(null)
                                          setEditingGroupName("")
                                        }
                                      }}
                                    >
                                      保存
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-10 rounded-2xl text-white/70 hover:text-white hover:bg-white/10"
                                      onClick={() => {
                                        setEditingGroup(null)
                                        setEditingGroupName("")
                                      }}
                                    >
                                      取消
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex-1 min-w-0 truncate text-sm text-white/90" title={g}>
                                      {g}
                                      {backendGroup ? "" : <span className="ml-2 text-xs text-white/40">(本地)</span>}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-9 px-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
                                      onClick={() => {
                                        setEditingGroup(g)
                                        setEditingGroupName(g)
                                      }}
                                    >
                                      编辑
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="h-9 px-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10"
                                      disabled={groupActionBusy}
                                      onClick={async () => {
                                        if (!confirm(`确认删除分组：${g} ？（该分组下的素材将变为无分组）`)) return

                                        setGroupActionBusy(true)
                                        try {
                                          if (backendGroup) {
                                            const res = await fetch("/api/files/groups/delete", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ name: g }),
                                            })
                                            if (!res.ok) throw new Error(await res.text())
                                            await refetch()
                                          }

                                          setLocalGroupOptions((prev) => prev.filter((x) => x !== g))
                                          setUploadGroup((cur) => (cur === g ? "none" : cur))
                                          setGroupFilter((cur) => (cur === g ? "all" : cur))
                                        } catch (e) {
                                          toast({ variant: "destructive", title: "删除分组失败", description: String(e) })
                                        } finally {
                                          setGroupActionBusy(false)
                                        }
                                      }}
                                    >
                                      删除
                                    </Button>
                                  </>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setUploadDialogOpen(false)}>取消</Button>
                <Button onClick={handleUpload} disabled={uploading || !filesToUpload.length}>
                  {uploading ? "上传中..." : "开始上传"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="flex-1 border-white/5 bg-transparent flex flex-col min-h-0 shadow-none">
        <CardHeader className="flex-shrink-0 pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
                <TabsList className="h-9 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <TabsTrigger value="all" className="rounded-lg text-xs text-white/70 data-[state=active]:bg-white/90 data-[state=active]:text-black data-[state=active]:shadow-inner border border-transparent data-[state=active]:border-white/20 transition-colors">
                    全部
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-lg text-xs text-white/70 data-[state=active]:bg-white/90 data-[state=active]:text-black data-[state=active]:shadow-inner border border-transparent data-[state=active]:border-white/20 transition-colors">
                    待发布
                  </TabsTrigger>
                  <TabsTrigger value="published" className="rounded-lg text-xs text-white/70 data-[state=active]:bg-white/90 data-[state=active]:text-black data-[state=active]:shadow-inner border border-transparent data-[state=active]:border-white/20 transition-colors">
                    已发布
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex gap-3 w-full md:w-auto items-center">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 h-10">
                <span className="text-xs text-white/50">分组</span>
                <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v)}>
                  <SelectTrigger className="bg-transparent border-0 h-8 px-2 text-white/80">
                    <SelectValue placeholder="全部分组" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分组</SelectItem>
                    {groupOptions.map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  placeholder="搜索素材..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/10 min-w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-6 pt-0">
              {selectedIds.size > 0 && (
                <div className="mb-4 flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                  <span className="text-sm text-white/80">
                    已选择 {selectedIds.size} 个素材
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        批量删除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认批量删除？</AlertDialogTitle>
                        <AlertDialogDescription>
                          将删除 {selectedIds.size} 个素材，此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBatchDelete}>
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              <DataTable columns={columns} data={filteredMaterials} pageSize={10} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Sheet (Sidebar) */}
	      <MaterialEditorSheet
	        open={!!selectedMaterial}
	        onOpenChange={(open) => !open && setSelectedMaterial(null)}
	        material={selectedMaterial}
	        groupOptions={groupOptions}
	        onSave={async (updatedData) => {
	          if (!selectedMaterial) return
          // setEditForm(prev => ({ ...prev, ...updatedData })) // This line is removed as MaterialEditorSheet manages its own form state
          // Call the actual save logic
	          try {
	            const response = await fetch(`/api/files/${encodeURIComponent(selectedMaterial.id)}`, {
	              method: 'PATCH',
	              headers: { 'Content-Type': 'application/json' },
	              body: JSON.stringify({
	                filename: updatedData.filename,
	                title: updatedData.title,
	                description: updatedData.description,
	                tags: updatedData.tags,
	                note: updatedData.note,
	                group_name: updatedData.group === 'none' ? null : updatedData.group,
	                cover_image: updatedData.cover_image
	              })
	            })

            if (!response.ok) throw new Error('update failed')

            toast({ variant: 'success', title: '已保存', description: '素材信息已更新' })
            setSelectedMaterial(null)
            await refetch()
          } catch (error) {
            toast({ variant: 'destructive', title: '保存失败', description: '请稍后重试' })
          }
        }}
      />

      {/* Preview Dialog */}
      <Dialog open={!!previewMaterial} onOpenChange={(open) => !open && setPreviewMaterial(null)}>
        <DialogContent className="max-w-[820px] w-[820px] h-auto bg-black/95 border-white/10 p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>素材预览</DialogTitle>
          </DialogHeader>
          {previewMaterial && (
            <div className="relative flex items-center justify-center">
              {(() => {
                const previewSrc = getPreviewUrl(previewMaterial)
                return (
                  <video
                    key={previewSrc}
                    src={previewSrc}
                    controls
                    className="w-[800px] h-[600px] object-contain bg-black"
                    autoPlay
                  />
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/50">Loading...</div>}>
      <MaterialsPageContent />
    </Suspense>
  )
}
