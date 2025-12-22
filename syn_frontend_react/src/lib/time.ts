const normalizeDateInput = (value: Date | string | number): Date => {
  if (typeof value === "string") {
    const trimmed = value.trim()
    const hasTimezone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed)
    if (trimmed.includes("T") && !hasTimezone) {
      return new Date(`${trimmed}Z`)
    }
  }
  return new Date(value)
}

export function formatBeijingDateTime(date: Date | string | number = new Date()): string {
  const d = normalizeDateInput(date)
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return "刚刚"
}

// 格式化北京时间为时钟格式 HH:mm
export function formatBeijingClock(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

// 格式化北京时间为完整时间格式 HH:mm:ss
export function formatBeijingTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

// 获取北京时间的日期key YYYY-MM-DD
export function getBeijingDayKey(date?: Date | string | number): string {
  const d = date ? new Date(date) : new Date()
  return d.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, "-")
}

// 解析日志时间戳
export function parseLogTimestamp(timestamp: string): Date {
  // 支持多种时间戳格式
  // ISO格式: 2024-01-01T12:00:00.000Z
  // 北京时间格式: 2024-01-01 12:00:00
  if (timestamp.includes("T")) {
    return new Date(timestamp)
  }
  // 假设是北京时间,转换为UTC
  const [datePart, timePart] = timestamp.split(" ")
  const [year, month, day] = datePart.split("-")
  const [hour, minute, second] = timePart.split(":")
  // 北京时间是UTC+8
  const utcDate = new Date(Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour) - 8,
    parseInt(minute),
    parseInt(second || "0")
  ))
  return utcDate
}
