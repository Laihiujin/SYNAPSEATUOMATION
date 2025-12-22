import { z } from "zod"

// Platform types
export type PlatformKey = "all" | "kuaishou" | "douyin" | "channels" | "xiaohongshu" | "bilibili"

// Material interface
export interface Material {
  id: string
  filename: string
  storageKey?: string
  filesize: number
  uploadTime: string
  type: "video" | "image" | "other"
  fileUrl: string
  status: "pending" | "published" | "failed"
  publishedAt?: string
  note?: string
  group?: string
  title?: string
  description?: string
  tags?: string
  cover_image?: string
  // 兼容旧字段，可选
  size?: number
  duration?: number
  uploadedAt?: string
  video_width?: number
  video_height?: number
  aspect_ratio?: string
  orientation?: "portrait" | "landscape" | "square" | string
}

// Account interface  
export interface Account {
  id: string
  name: string
  platform: PlatformKey
  avatar?: string
  status: "正常" | "异常" | "待激活"
  boundAt: string
  filePath?: string
  original_name?: string
  note?: string
  user_id?: string
}

// Mock data
export const mockMaterials: Material[] = []
export const mockAccounts: Account[] = []

// Quick Actions
export const quickActions = [
  {
    id: "upload",
    title: "上传视频",
    description: "上传新的视频素材",
    icon: "Upload",
    href: "/materials",
  },
  {
    id: "publish",
    title: "发布内容",
    description: "发布视频到各平台",
    icon: "Send",
    href: "/publish",
  },
  {
    id: "accounts",
    title: "账号管理",
    description: "管理平台账号",
    icon: "Users",
    href: "/accounts",
  },
  {
    id: "ai",
    title: "AI助手",
    description: "使用AI生成内容",
    icon: "Sparkles",
    href: "/ai",
  },
]

// Recommended Topics
export const recommendedTopics = [
  "生活vlog",
  "美食探店",
  "旅行日记",
  "科技数码",
  "时尚穿搭",
  "健身运动",
  "学习分享",
  "宠物日常",
]
