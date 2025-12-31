"use client"
import { PageHeader } from "@/components/layout/page-scaffold"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, Download, ExternalLink, Play, Heart, MessageCircle, Bookmark, RefreshCcw, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { DatePicker } from "@/components/ui/date-picker"
import { AnalyticsChart } from "./components/analytics-chart"
import { StatsCard } from "./components/stats-card"

export interface VideoAnalytics {
    id: number
    videoId: string
    title: string
    platform: string
    thumbnail: string
    videoUrl?: string
    publishDate: string
    playCount: number
    likeCount: number
    commentCount: number
    collectCount: number
    lastUpdated: string
}

export interface AnalyticsSummary {
    totalVideos: number
    totalPlays: number
    totalLikes: number
    totalComments: number
    totalCollects: number
    avgPlayCount: number
}

export default function AnalyticsPage() {
    const { toast } = useToast()
    const [startDate, setStartDate] = useState<string>()
    const [endDate, setEndDate] = useState<string>()
    const [isCollecting, setIsCollecting] = useState(false)

    // Fetch analytics data
    const { data: analyticsData, isLoading, refetch } = useQuery({
        queryKey: ['analytics', startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const res = await fetch(`/api/analytics?${params}`)
            if (!res.ok) throw new Error('Failed to fetch analytics')
            return res.json()
        },
    })

    // 触发数据采集
    const handleCollectData = async () => {
        setIsCollecting(true)
        try {
            const res = await fetch('/api/analytics/collect', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: "accounts" }),
            })
            const data = await res.json()

            if (data.success) {
                const stats = data.data || {}
                const total = stats.total ?? stats.success ?? 0
                const success = stats.success ?? 0
                const failed = stats.failed ?? 0
                toast({
                    title: "数据采集成功",
                    description: data.message || `成功 ${success}/${total || success}，失败 ${failed}`,
                })
                // 重新获取数据
                refetch()
            } else {
                toast({
                    variant: "destructive",
                    title: "数据采集失败",
                    description: data.error || "请稍后重试",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "数据采集失败",
                description: String(error),
            })
        } finally {
            setIsCollecting(false)
        }
    }

    const summary: AnalyticsSummary = analyticsData?.summary || {
        totalVideos: 0,
        totalPlays: 0,
        totalLikes: 0,
        totalComments: 0,
        totalCollects: 0,
        avgPlayCount: 0,
    }

    const videos: VideoAnalytics[] = analyticsData?.videos || []
    const chartData = analyticsData?.chartData || []

    const handleExport = async (format: 'csv' | 'excel') => {
        try {
            const params = new URLSearchParams()
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)
            params.append('format', format)

            const res = await fetch(`/api/analytics/export?${params}`)
            if (!res.ok) throw new Error('Export failed')

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics_${Date.now()}.${format === 'csv' ? 'csv' : 'xlsx'}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast({ title: `数据已导出为 ${format.toUpperCase()}` })
        } catch (error) {
            toast({ variant: "destructive", title: "导出失败", description: String(error) })
        }
    }

    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + 'w'
        }
        return num.toLocaleString()
    }

    return (
        <div className="space-y-8 px-4 py-4 md:px-6 md:py-6">
            <PageHeader
                title="数据中心"
                // description="视频数据分析与统计"
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="rounded-2xl border-black bg-black/40 hover:bg-black/60"
                            onClick={handleCollectData}
                            disabled={isCollecting}
                        >
                            <RefreshCcw className={`mr-2 h-4 w-4 ${isCollecting ? 'animate-spin' : ''}`} />
                            {isCollecting ? '采集中...' : '刷新数据'}
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-2xl border-black bg-black/40 hover:bg-black/60"
                            onClick={() => handleExport('csv')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            导出CSV
                        </Button>
                        <Button
                            variant="outline"
                            className="rounded-2xl border-black bg-black/40 hover:bg-black/60"
                            onClick={() => handleExport('excel')}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            导出Excel
                        </Button>
                    </div>
                }
            />

            {/* Date Range Filter */}
            <Card className="border-black bg-black/40">
                <CardHeader>
                    <CardTitle className="text-base">数据筛选</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-center">
                        <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            placeholder="开始日期"
                            className="border-black bg-black/40"
                        />
                        <span className="text-white/60">至</span>
                        <DatePicker
                            value={endDate}
                            onChange={setEndDate}
                            placeholder="结束日期"
                            className="border-black bg-black/40"
                        />
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setStartDate(undefined)
                                setEndDate(undefined)
                            }}
                        >
                            重置
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatsCard
                    title="播放总量"
                    value={formatNumber(summary.totalPlays)}
                    icon={<Play className="h-4 w-4" />}
                    color="blue"
                />
                <StatsCard
                    title="点赞"
                    value={formatNumber(summary.totalLikes)}
                    icon={<Heart className="h-4 w-4" />}
                    color="pink"
                />
                <StatsCard
                    title="评论"
                    value={formatNumber(summary.totalComments)}
                    icon={<MessageCircle className="h-4 w-4" />}
                    color="cyan"
                />
                <StatsCard
                    title="分享数"
                    value={formatNumber(summary.totalCollects)}
                    icon={<Bookmark className="h-4 w-4" />}
                    color="green"
                />
                <StatsCard
                    title="视频总数"
                    value={summary.totalVideos.toString()}
                    icon={<Calendar className="h-4 w-4" />}
                    color="orange"
                />
            </div>

            {/* Trend Chart */}
            <Card className="border-black bg-black/40">
                <CardHeader>
                    <CardTitle>播放量趋势</CardTitle>
                    <CardDescription>近期视频播放量变化</CardDescription>
                </CardHeader>
                <CardContent>
                    <AnalyticsChart data={chartData} />
                </CardContent>
            </Card>

            {/* Video Data Table */}
            <Card className="border-black bg-black/40">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>视频数据明细</CardTitle>
                            <CardDescription>所有视频的详细数据统计</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl">
                            导出当前数据
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-black/5 hover:bg-black/5">
                                <TableHead>视频</TableHead>
                                <TableHead>视频链接</TableHead>
                                <TableHead>平台</TableHead>
                                <TableHead>播放量</TableHead>
                                <TableHead>点赞</TableHead>
                                <TableHead>评论</TableHead>
                                <TableHead>收藏</TableHead>
                                <TableHead>发布时间</TableHead>
                                <TableHead>操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {videos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-white/50 py-8">
                                        {isLoading ? "加载中..." : "暂无数据"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                videos.map((video) => (
                                    <TableRow key={video.id} className="border-black/5 hover:bg-black/5">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={video.thumbnail || '/placeholder-video.png'}
                                                    alt={video.title}
                                                    className="w-16 h-9 object-cover rounded"
                                                />
                                                <div className="max-w-[200px]">
                                                    <p className="text-sm font-medium truncate">{video.title}</p>
                                                    <p className="text-xs text-white/50">ID: {video.videoId}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {video.videoUrl ? (
                                                <a
                                                    href={video.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                                                >
                                                    查看视频
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="text-white/30 text-xs">--</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{video.platform}</Badge>
                                        </TableCell>
                                        <TableCell className="text-blue-400">{formatNumber(video.playCount)}</TableCell>
                                        <TableCell className="text-pink-400">{formatNumber(video.likeCount)}</TableCell>
                                        <TableCell className="text-cyan-400">{formatNumber(video.commentCount)}</TableCell>
                                        <TableCell className="text-green-400">{formatNumber(video.collectCount)}</TableCell>
                                        <TableCell className="text-sm text-white/50">
                                            {format(new Date(video.publishDate), 'yyyy-MM-dd')}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" className="rounded-xl">
                                                查看
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
