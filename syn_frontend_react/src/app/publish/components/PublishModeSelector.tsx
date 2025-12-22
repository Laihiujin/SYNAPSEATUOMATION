"use client"

import { cn } from "@/lib/utils"
import { Sparkles, LayoutGrid, FileVideo } from "lucide-react"

export type PublishMode = "single" | "matrix"

interface PublishModeSelectorProps {
    selected: PublishMode
    onSelect: (mode: PublishMode) => void
}

export function PublishModeSelector({ selected, onSelect }: PublishModeSelectorProps) {
    const modes = [
        {
            id: "single" as PublishMode,
            title: "单一发布",
            description: "精细化编辑单个视频，支持多平台同步发布",
            icon: FileVideo,
        },
        {
            id: "matrix" as PublishMode,
            title: "矩阵发布",
            description: "多账号、多素材批量分发，AI 自动匹配文案",
            icon: LayoutGrid,
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modes.map((mode) => {
                const isSelected = selected === mode.id
                const Icon = mode.icon

                return (
                    <div
                        key={mode.id}
                        onClick={() => onSelect(mode.id)}
                        className={cn(
                            "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                            isSelected
                                ? "border-primary bg-primary/10 shadow-[0_0_20px_-10px_rgba(var(--primary),0.3)]"
                                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-lg transition-colors",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/60 group-hover:text-white"
                        )}>
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h3 className={cn(
                                    "font-medium transition-colors",
                                    isSelected ? "text-primary" : "text-white"
                                )}>
                                    {mode.title}
                                </h3>
                                {isSelected && (
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">
                                {mode.description}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
