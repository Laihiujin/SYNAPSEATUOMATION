"use client"

import { useRouter, usePathname } from "next/navigation"
import { PublishModeSelector, PublishMode } from "./components/PublishModeSelector"

export default function PublishLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()

    // 确定当前激活的模式
    const activeMode: PublishMode = pathname.includes("/matrix") ? "matrix" : "single"

    const handleModeChange = (mode: PublishMode) => {
        if (mode === "matrix") {
            router.push("/publish/matrix")
        } else {
            router.push("/publish/single")
        }
    }

    return (
        <div className="flex flex-col h-full bg-transparent text-white">
            <div className="px-6 pt-6 pb-4 border-b border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">发布中心</h1>
                        <p className="text-sm text-white/60 mt-1">
                            多平台矩阵发布管理
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl">
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
