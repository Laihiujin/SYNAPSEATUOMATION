"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string
    icon: React.ReactNode
    color?: 'blue' | 'pink' | 'cyan' | 'green' | 'orange'
}

const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    pink: 'bg-pink-500/10 text-pink-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
    green: 'bg-green-500/10 text-green-400',
    orange: 'bg-orange-500/10 text-orange-400',
}

export function StatsCard({ title, value, icon, color = 'blue' }: StatsCardProps) {
    return (
        <Card className="border-white/10 bg-white/5">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">{title}</span>
                    <div className={cn("p-2 rounded-lg", colorClasses[color])}>
                        {icon}
                    </div>
                </div>
                <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
        </Card>
    )
}
