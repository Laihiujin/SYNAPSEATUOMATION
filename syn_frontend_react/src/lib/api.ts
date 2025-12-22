import { backendBaseUrl } from "./env"

export interface ApiResponse<T = any> {
  code: number
  msg: string | null
  data: T
}

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = "ApiError"
  }
}

import { z } from "zod"

export async function fetcher<T = any>(
  url: string,
  schemaOrOptions?: z.ZodType<any> | RequestInit
): Promise<T> {
  // 区分是 schema 还是 options
  const isSchema = schemaOrOptions && 'parse' in schemaOrOptions
  const options = isSchema ? undefined : (schemaOrOptions as RequestInit)
  const schema = isSchema ? (schemaOrOptions as z.ZodType<any>) : undefined

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP error! status: ${response.status}`
      )
    }

    const result: ApiResponse<any> = await response.json()

    if (result.code !== 200) {
      throw new ApiError(result.code, result.msg || "API request failed", result.data)
    }

    // 如果提供了 schema，则验证数据
    if (schema) {
      try {
        const validated = schema.parse(result)
        return validated as T  // 返回整个验证后的对象，而不是只返回data字段
      } catch (error) {
        console.error("Schema validation failed:", error)
        throw new ApiError(400, "Data validation failed", error)
      }
    }

    return result.data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, error instanceof Error ? error.message : "Unknown error")
  }
}

export async function apiGet<T = any>(url: string): Promise<T> {
  return fetcher<T>(url, { method: "GET" })
}

export async function apiPost<T = any>(
  url: string,
  data?: any
): Promise<T> {
  return fetcher<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  return fetcher<T>(url, { method: "DELETE" })
}

export async function apiPut<T = any>(
  url: string,
  data?: any
): Promise<T> {
  return fetcher<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// 文件上传
export async function uploadFile(file: File, filename?: string): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  if (filename) {
    formData.append("filename", filename)
  }

  const response = await fetch(`${backendBaseUrl}/uploadSave`, {
    method: "POST",
    body: formData,
  })

  const result: ApiResponse<{ filepath: string }> = await response.json()

  if (result.code !== 200) {
    throw new ApiError(result.code, result.msg || "Upload failed")
  }

  return result.data.filepath
}
