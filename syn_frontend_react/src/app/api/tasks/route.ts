import { NextResponse } from "next/server"
import crypto from "crypto"

import { backendBaseUrl } from "@/lib/env"
import type { TaskRecord, TaskStatus } from "./tasks-store"

const platformDisplay: Record<string, string> = {
  "1": "小红书",
  "2": "视频号",
  "3": "抖音",
  "4": "快手",
  "5": "B站",
}

const normalizeStatus = (value: unknown, hasSchedule: boolean): TaskStatus => {
  const raw = typeof value === "string" ? value.toLowerCase() : ""
  if (raw === "success" || raw === "published" || raw === "done") return "success"
  if (raw === "error" || raw === "failed" || raw === "fail") return "error"
  if (raw === "cancelled") return "cancelled"
  if (raw === "running") return "running"
  if (hasSchedule) return "scheduled"
  return "pending"
}

const resolvePlatformName = (value: unknown): string => {
  const key = typeof value === "number" ? String(value) : String(value || "").trim()
  if (platformDisplay[key]) return platformDisplay[key]
  const lower = key.toLowerCase()
  if (lower.includes("douyin")) return "抖音"
  if (lower.includes("kuaishou")) return "快手"
  if (lower.includes("hongshu") || lower.includes("redbook") || lower.includes("xhs")) return "小红书"
  if (lower.includes("bili")) return "B站"
  if (lower.includes("video") || lower.includes("channel") || lower.includes("shipin")) return "视频号"
  return key || "未知平台"
}



const buildSummaryFromTasks = (tasks: TaskRecord[]) => {
  const summary = { scheduled: 0, success: 0, error: 0, pending: 0, total: tasks.length }
  tasks.forEach((task) => {
    if (task.status === "success") summary.success += 1
    else if (task.status === "error") summary.error += 1
    else if (task.status === "scheduled") summary.scheduled += 1
    else summary.pending += 1
  })
  return summary
}

// 获取账号映射 Map<id, name>
const fetchAccountsMap = async () => {
  try {
    const response = await fetch(`${backendBaseUrl}/api/v1/accounts/`, { cache: "no-store" })
    if (!response.ok) return new Map<string, string>()
    const payload = await response.json().catch(() => ({}))
    const items = Array.isArray(payload?.items) ? payload.items : []
    const map = new Map<string, string>()
    items.forEach((item: {
      account_id?: string | number
      id?: string | number
      accountId?: string | number
      user_id?: string | number
      userId?: string | number
      original_name?: string
      name?: string
      nickname?: string
      note?: string
    }) => {
      const rawId = item.account_id ?? item.id ?? item.accountId
      const userId = item.user_id ?? item.userId
      if (!rawId && !userId) return
      const displayName =
        item.original_name ||
        item.name ||
        item.nickname ||
        item.note ||
        `账号 ${rawId ?? userId ?? ""}`
      if (rawId) {
        map.set(String(rawId), String(displayName))
      }
      if (userId) {
        map.set(String(userId), String(displayName))
      }
    })
    return map
  } catch (e) {
    console.error("Failed to fetch accounts map", e)
    return new Map<string, string>()
  }
}

// 获取素材映射 Map<id, filename>
const fetchMaterialsMap = async () => {
  try {
    const response = await fetch(`${backendBaseUrl}/api/v1/files/`, { cache: "no-store" })
    if (!response.ok) return new Map<string, string>()
    const payload = await response.json().catch(() => ({}))
    const items = Array.isArray(payload?.items) ? payload.items : []
    const map = new Map<string, string>()
    items.forEach((item: { id?: string | number; filename?: string }) => {
      if (item.id) map.set(String(item.id), item.filename || "未知文件")
    })
    return map
  } catch (e) {
    console.error("Failed to fetch materials map", e)
    return new Map<string, string>()
  }
}

const formatTaskQueueRow = (row: any, accountMap: Map<string, string>, materialMap: Map<string, string>): TaskRecord => {
  const payload = row?.data && typeof row.data === "object" ? (row.data as Record<string, unknown>) : {}
  const schedule = (payload.schedule_time as string) ?? (payload.scheduleTime as string)
  const status = normalizeStatus(row?.status, Boolean(schedule))
  const platformRaw = payload.platform ?? payload.platform_code ?? payload.platformCode ?? row?.task_type

  const materialId = String(payload.material_id ?? payload.file_id ?? payload.video_path ?? payload.file_path ?? payload.material ?? "")
  const accountId = String(payload.account_id ?? payload.account ?? payload.user_id ?? "")

  // 尝试从映射获取，如果失败则尝试解析文件名
  let materialName = materialMap.get(materialId)
  if (!materialName && materialId) {
    materialName = materialId.split('\\').pop()?.split('/').pop() || "-"
  }

  return {
    id: String(row?.task_id ?? row?.id ?? crypto.randomUUID()),
    title: ((payload.title as string) ?? (payload.name as string) ?? (row?.task_type as string) ?? "任务").trim() || "任务",
    platform: resolvePlatformName(platformRaw),
    account: accountMap.get(accountId) || accountId || "-",
    material: materialName || "-",
    status,
    createdAt: (row?.created_at as string) ?? new Date().toISOString(),
    scheduledAt: schedule ? String(schedule) : undefined,
    result: undefined,
  }
}

const fetchTaskQueueRecords = async (accountMap: Map<string, string>, materialMap: Map<string, string>) => {
  try {
    const response = await fetch(`${backendBaseUrl}/api/v1/tasks/`, { cache: "no-store" })
    if (!response.ok) return null
    const payload = await response.json().catch(() => ({}))
    const rows: any[] = Array.isArray(payload?.data) ? payload.data : []
    const tasks = rows.map(row => formatTaskQueueRow(row, accountMap, materialMap))

    const rawSummary = payload?.summary
    const summary = rawSummary ? {
      scheduled: rawSummary.scheduled ?? 0,
      success: rawSummary.success ?? rawSummary.completed ?? 0,
      error: rawSummary.error ?? rawSummary.failed ?? 0,
      pending: (rawSummary.pending ?? 0) + (rawSummary.retry ?? 0) + (rawSummary.queued ?? 0),
      total: rawSummary.total ?? tasks.length
    } : buildSummaryFromTasks(tasks)

    return { tasks, summary }
  } catch (error) {
    console.error("Failed to load task queue records", error)
    return null
  }
}

const fetchPublishTasks = async (accountMap: Map<string, string>, materialMap: Map<string, string>) => {
  try {
    const response = await fetch(`${backendBaseUrl}/api/v1/tasks/?limit=200`, { cache: "no-store" })
    if (!response.ok) return null
    const payload = await response.json().catch(() => ({}))
    const rows: any[] = Array.isArray(payload?.data) ? payload.data : []
    const summary = payload?.summary

    const tasks: TaskRecord[] = rows.map((row) => {
      const taskData = row?.data ?? {}
      const platform = String(taskData?.platform ?? "")
      const platformName = platformDisplay[platform] || platform || "未知平台"
      const schedule = (taskData?.scheduled_time as string) || undefined
      const status = normalizeStatus(row?.status, Boolean(schedule))

      const accountId = String(taskData?.account_id ?? "")
      const materialId = String(taskData?.file_id ?? taskData?.material_id ?? "")

      return {
        id: String(row?.task_id ?? row?.id ?? crypto.randomUUID()),
        title: (String(taskData?.title ?? row?.task_type ?? "发布任务").trim() || "发布任务"),
        platform: platformName,
        account: accountMap.get(accountId) || accountId || "-",
        material: materialMap.get(materialId) || materialId || "-",
        status,
        createdAt: (row?.created_at as string) ?? new Date().toISOString(),
        scheduledAt: schedule,
        result: (row?.error_message as string) ?? undefined,
      }
    })

    return { tasks, summary }
  } catch (error) {
    console.error("Failed to load publish tasks", error)
    return null
  }
}

export async function GET() {
  try {
    console.log("[/api/tasks] Start fetching tasks...")

    // 并行获取辅助数据
    const [accountMap, materialMap] = await Promise.all([
      fetchAccountsMap(),
      fetchMaterialsMap()
    ])

    const queueData = await fetchTaskQueueRecords(accountMap, materialMap)
    console.log("[/api/tasks] Queue data fetched:", queueData ? "success" : "failed")

    const publishData = queueData ?? (await fetchPublishTasks(accountMap, materialMap))
    console.log("[/api/tasks] Publish data fetched:", publishData ? "success" : "failed")

    const tasks = publishData?.tasks ?? []
    const finalSummary = publishData?.summary ?? buildSummaryFromTasks(tasks)

    console.log(`[/api/tasks] 返回 ${tasks.length} 个任务`)

    return NextResponse.json({
      code: 200,
      msg: null,
      data: tasks,
      total: tasks.length,
      summary: finalSummary,
      updatedAt: Date.now(),
    })
  } catch (error) {
    console.error("[/api/tasks] 加载任务失败:", error)
    return NextResponse.json({ code: 500, msg: "failed to load tasks", data: [] }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({ code: 405, msg: "Not supported" }, { status: 405 })
}
