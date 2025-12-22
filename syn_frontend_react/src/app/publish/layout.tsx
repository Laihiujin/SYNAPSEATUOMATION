"use client"

import { useRouter, usePathname } from "next/navigation"
import { PublishModeSelector, PublishMode } from "./components/PublishModeSelector"
import React, { useEffect } from "react"

export default function PublishLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()

    // 如果访问 /publish 根路径，自动跳转到矩阵发布
    useEffect(() => {
        if (pathname === "/publish" || pathname === "/publish/") {
            router.push("/publish/matrix")
        }
    }, [pathname, router])

    const activeMode: PublishMode = "matrix"

    const handleModeChange = (mode: PublishMode) => {
        router.push("/publish/matrix")
    }

    return (
        <div className="flex flex-col h-full bg-transparent text-white">
            <div className="px-6 pt-6 pb-4 border-b border-white/10 space-y-6">
                <div className="text-xs text-white/50 p-3 bg-white/5 rounded-lg border border-white/10">
                    💡 点击&quot;刷新检测&quot;按钮来检测所有 AI 提供商的连接状态和可用模型
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">发布中心</h1>
                        <p className="text-sm text-white/60 mt-1">
                            多平台矩阵发布管理
                        </p>
                    </div>
                </div>

                <div className="2xl">
                    <PublishModeSelector
                        selected={activeMode}
                        onSelect={handleModeChange}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    )
}
