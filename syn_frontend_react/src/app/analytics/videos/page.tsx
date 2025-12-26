"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { Video, RefreshCw, TrendingUp, Eye, Heart, MessageCircle, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const PLATFORMS = [
    { value: "all", label: "全部平台" },
    { value: "douyin", label: "抖音" },
    { value: "bilibili", label: "B站" },
    { value: "kuaishou", label: "快手" },
    { value: "xiaohongshu", label: "小红书" },
    { value: "channels", label: "视频号" },
]

export default function VideosPage() {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const [selectedPlatform, setSelectedPlatform] = useState("all")
    const [isCollecting, setIsCollecting] = useState(false)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [sheetPlatform, setSheetPlatform] = useState("douyin")

    // 获取视频数据
    useEffect(() => {
        const platformParam = searchParams.get("platform")
        if (!platformParam) return
        const isValid = PLATFORMS.some((platform) => platform.value === platformParam)
        if (isValid) {
            setSelectedPlatform(platformParam)
        }
    }, [searchParams])

    useEffect(() => {
        if (selectedPlatform === "douyin" || selectedPlatform === "bilibili") {
            setSheetPlatform(selectedPlatform)
        }
    }, [selectedPlatform])

    const { data: videosData, isLoading } = useQuery({
        queryKey: ["videos", selectedPlatform],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (selectedPlatform !== "all") {
                params.append("platform", selectedPlatform)
            }
            params.append("limit", "50")

            const res = await fetch(`/api/analytics/videos?${params}`)
            return res.json()
        },
        refetchInterval: 30000, // 每30秒刷新
    })

    const rawVideos = videosData?.data || []

    const normalizeVideo = (video: any) => ({
        ...video,
        views: video.views || video.playCount || video.play_count || 0,
        likes: video.likes || video.likeCount || video.like_count || 0,
        comments: video.comments || video.commentCount || video.comment_count || 0,
        shares: video.shares || video.shareCount || video.share_count || 0,
        publish_time: video.publish_time || video.publishDate || video.publish_date || "",
        cover_url: video.cover_url || video.thumbnail || "",
    })

    const videos = rawVideos.map(normalizeVideo)


    const { data: sheetVideosData, isLoading: isSheetLoading } = useQuery({
        queryKey: ["videos", "sheet"],
        queryFn: async () => {
            const params = new URLSearchParams()
            params.append("limit", "200")
            const res = await fetch(`/api/analytics/videos?${params}`)
            return res.json()
        },
        enabled: isSheetOpen,
    })

    const normalizedSheetPlatform = sheetPlatform.toLowerCase()
    const sheetSource = sheetVideosData?.data || rawVideos
    const sheetVideos = sheetSource.map(normalizeVideo).filter((video: any) => (video.platform || "").toLowerCase() === normalizedSheetPlatform)

    // 触发数据采集
    const handleCollect = async () => {
        setIsCollecting(true)
        try {
            const payload: Record<string, any> = { mode: "accounts" }
            if (selectedPlatform !== "all") {
                payload.platform = selectedPlatform
            }

            const endpoint = selectedPlatform !== "all"
                ? `/api/analytics/collect/${selectedPlatform}`
                : "/api/analytics/collect"

            const res = await fetch(endpoint, {

                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()

            if (data.success || res.ok) {
                const stats = data.data || {}
                const total = stats.total ?? stats.success ?? 0
                const success = stats.success ?? 0
                const failed = stats.failed ?? 0
                toast({
                    title: "采集完成",
                    description: `成功 ${success}/${total || success}，失败 ${failed}`,
                })
                queryClient.invalidateQueries({ queryKey: ["videos"] })
            } else {
                toast({
                    title: "采集失败",
                    description: data.error,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "采集出错",
                description: String(error),
                variant: "destructive",
            })
        } finally {
            setIsCollecting(false)
        }
    }

    // 格式化数字
    const formatNumber = (num: number) => {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + "万"
        }
        return num.toString()
    }

    const resolveVideoLink = (video: any) => {
        const direct = video.url || video.video_url || video.videoUrl || video.link
        if (direct) return direct
        const platform = String(video.platform || "").toLowerCase()
        if (platform === "bilibili") {
            if (video.bvid) return `https://www.bilibili.com/video/${video.bvid}`
            if (video.aid) return `https://www.bilibili.com/video/av${video.aid}`
        }
        return ""
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">视频数据</h1>
                    <p className="text-white/60 mt-1">查看和分析视频表现数据</p>
                    <p className="text-xs text-white/50">采集方式：按账号抓取该账号下的全部作品，无需填写作品ID</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="选择平台" />
                        </SelectTrigger>
                        <SelectContent className=" border-white/10">
                            {PLATFORMS.map((platform) => (
                                <SelectItem key={platform.value} value={platform.value} className="text-white">
                                    {platform.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => setIsSheetOpen(true)}
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                        表格视图
                    </Button>
                    <Button
                        onClick={handleCollect}
                        disabled={isCollecting}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isCollecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                采集中...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                采集数据
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">总视频数</CardTitle>
                        <Video className="h-4 w-4 text-white/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{videos.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">总播放量</CardTitle>
                        <Eye className="h-4 w-4 text-white/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatNumber(videos.reduce((sum: number, v: any) => sum + (v.views || 0), 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">总点赞数</CardTitle>
                        <Heart className="h-4 w-4 text-white/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatNumber(videos.reduce((sum: number, v: any) => sum + (v.likes || 0), 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/70">平均互动率</CardTitle>
                        <TrendingUp className="h-4 w-4 text-white/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {videos.length > 0
                                ? ((videos.reduce((sum: number, v: any) => sum + (v.likes || 0), 0) /
                                    videos.reduce((sum: number, v: any) => sum + (v.views || 0), 0)) *
                                    100
                                ).toFixed(2)
                                : 0}
                            %
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Video List */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">视频列表</CardTitle>
                    <CardDescription className="text-white/60">
                        最近采集的视频数据
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-white/40">
                            <Video className="h-12 w-12 mb-4" />
                            <p>暂无视频数据</p>
                            <p className="text-sm mt-2">点击"采集数据"按钮开始采集</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map((video: any) => (
                                <div
                                    key={video.id}
                                    className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    {/* Cover */}
                                    {video.cover_url && (
                                        <img
                                            src={video.cover_url}
                                            alt={video.title}
                                            className="w-32 h-20 object-cover rounded"
                                        />
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-white font-medium line-clamp-2">{video.title || "无标题"}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {video.platform}
                                                    </Badge>
                                                    <span className="text-xs text-white/40">{video.publish_time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 mt-3 text-sm text-white/60">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                <span>{formatNumber(video.views || 0)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-4 w-4" />
                                                <span>{formatNumber(video.likes || 0)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{formatNumber(video.comments || 0)}</span>
                                            </div>
                                            {video.shares > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Share2 className="h-4 w-4" />
                                                    <span>{formatNumber(video.shares)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-4xl bg-black border-white/10">
                    <SheetHeader>
                        <SheetTitle>视频数据表</SheetTitle>
                        <SheetDescription>
                            按平台查看视频详细数据，当前支持抖音与B站
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Select value={sheetPlatform} onValueChange={setSheetPlatform}>
                                <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="选择平台" />
                                </SelectTrigger>
                                <SelectContent className="border-white/10">
                                    <SelectItem value="douyin" className="text-white">抖音</SelectItem>
                                    <SelectItem value="bilibili" className="text-white">B站</SelectItem>
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="text-xs">{sheetVideos.length} 条</Badge>
                        </div>

                        {isSheetLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                            </div>
                        ) : sheetVideos.length === 0 ? (
                            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                                暂无数据，请先点击"采集数据"
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>标题</TableHead>
                                        <TableHead>链接</TableHead>
                                        <TableHead>播放</TableHead>
                                        <TableHead>点赞</TableHead>
                                        <TableHead>评论</TableHead>
                                        <TableHead>分享</TableHead>
                                        <TableHead>发布时间</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sheetVideos.map((video: any, index: number) => {
                                        const link = resolveVideoLink(video)
                                        return (
                                            <TableRow key={video.id || video.video_id || video.bvid || video.aid || index}>
                                                <TableCell className="max-w-[260px]">
                                                    <div className="line-clamp-2 text-white">{video.title || "无标题"}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {link ? (
                                                        <a
                                                            href={link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            打开
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-white/40">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatNumber(video.views || 0)}</TableCell>
                                                <TableCell>{formatNumber(video.likes || 0)}</TableCell>
                                                <TableCell>{formatNumber(video.comments || 0)}</TableCell>
                                                <TableCell>{formatNumber(video.shares || 0)}</TableCell>
                                                <TableCell className="text-xs text-white/60">{video.publish_time || "-"}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    )
}
