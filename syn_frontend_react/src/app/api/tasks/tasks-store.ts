import { promises as fs } from "fs"
import path from "path"

export type TaskStatus = "pending" | "success" | "error" | "scheduled"

export interface TaskRecord {
  id: string
  title: string
  platform: string
  account: string
  material: string
  status: TaskStatus
  createdAt: string
  scheduledAt?: string
  result?: string
}

const tasksFile = path.join(process.cwd(), "data", "tasks.json")

async function ensureFile() {
  try {
    await fs.access(tasksFile)
  } catch {
    await fs.mkdir(path.dirname(tasksFile), { recursive: true })
    await fs.writeFile(tasksFile, "[]", "utf-8")
  }
}

export async function readTasks(): Promise<TaskRecord[]> {
  await ensureFile()
  const raw = await fs.readFile(tasksFile, "utf-8")
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TaskRecord[]) : []
  } catch {
    return []
  }
}

export async function writeTasks(tasks: TaskRecord[]) {
  await ensureFile()
  await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2), "utf-8")
}
