"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { PageHeader } from "@/components/layout/page-scaffold"

export default function TrendsPage() {
    return (
        <div className="space-y-8 px-4 py-4 md:px-6 md:py-6">
            <PageHeader
                title="数据趋势"
                description="分析视频数据趋势和表现"
            />

            {/* Coming Soon */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-black/40 border-black">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <CardTitle className="text-white">播放量趋势</CardTitle>
                        </div>
                        <CardDescription className="text-white/60">
                            查看播放量随时间的变化趋势
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-white/40">
                            <p className="text-sm">即将推出...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-black">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-white">平台对比</CardTitle>
                        </div>
                        <CardDescription className="text-white/60">
                            对比不同平台的视频表现
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-white/40">
                            <p className="text-sm">即将推出...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-black">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-primary" />
                            <CardTitle className="text-white">内容分析</CardTitle>
                        </div>
                        <CardDescription className="text-white/60">
                            分析热门内容类型和标签
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-white/40">
                            <p className="text-sm">即将推出...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-black">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            <CardTitle className="text-white">互动率分析</CardTitle>
                        </div>
                        <CardDescription className="text-white/60">
                            分析点赞、评论、分享等互动数据
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-white/40">
                            <p className="text-sm">即将推出...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-black">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <CardTitle className="text-white">最佳发布时间</CardTitle>
                        </div>
                        <CardDescription className="text-white/60">
                            找出最佳的视频发布时间段
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-white/40">
                            <p className="text-sm">即将推出...</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/40 border-black">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-white">账号表现</CardTitle>
                        </div>
                        <CardDescription className="text-white/60">
                            对比不同账号的整体表现
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32 text-white/40">
                            <p className="text-sm">即将推出...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info */}
            <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <h3 className="font-medium text-white mb-1">数据趋势分析功能</h3>
                            <p className="text-sm text-white/70">
                                我们正在开发强大的数据分析功能，包括趋势图表、平台对比、内容分析等。
                                这些功能将帮助您更好地理解视频表现，优化内容策略。
                            </p>
                            <p className="text-sm text-white/70 mt-2">
                                敬请期待！
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
