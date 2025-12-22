"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AnalyticsChartProps {
    data: Array<{
        date: string
        playCount: number
    }>
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-white/50">
                暂无数据
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickLine={false}
                />
                <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => {
                        if (value >= 10000) {
                            return (value / 10000).toFixed(1) + 'w'
                        }
                        return value.toLocaleString()
                    }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                    }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.6)' }}
                />
                <Line
                    type="monotone"
                    dataKey="playCount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
