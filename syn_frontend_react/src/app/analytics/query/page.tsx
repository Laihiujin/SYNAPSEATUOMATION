"use client"

import { useMemo, useState } from "react"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

type Platform = "douyin" | "xiaohongshu" | "kuaishou"

function parseDouyinUserId(input: string): string {
  const s = (input || "").trim()
  if (!s) return ""
  try {
    const url = new URL(s)
    if (url.hostname.includes("douyin.com")) {
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts[0] === "user" && parts[1]) return parts[1]
    }
  } catch {
    // ignore
  }
  // allow direct input of sec_uid
  return s
}

function parseXhsUserId(input: string): string {
  const s = (input || "").trim()
  if (!s) return ""
  try {
    const url = new URL(s)
    if (url.hostname.includes("xiaohongshu.com")) {
      const parts = url.pathname.split("/").filter(Boolean)
      // /user/profile/<id>
      if (parts[0] === "user" && parts[1] === "profile" && parts[2]) return parts[2]
    }
  } catch {
    // ignore
  }
  return s
}

function parseKsUserId(input: string): string {
  const s = (input || "").trim()
  if (!s) return ""
  try {
    const url = new URL(s)
    if (url.hostname.includes("kuaishou.com")) {
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts[0] === "profile" && parts[1]) return parts[1]
    }
  } catch {
    // ignore
  }
  return s
}

export default function AnalyticsQueryPage() {
  const { toast } = useToast()

  const [platform, setPlatform] = useState<Platform>("douyin")

  // Work ID
  const [workIdsText, setWorkIdsText] = useState("")
  const [workLimit, setWorkLimit] = useState(50)
  const [refreshWorkIds, setRefreshWorkIds] = useState(false)
  const [isWorkLoading, setIsWorkLoading] = useState(false)

  // Comments
  const [commentWorkId, setCommentWorkId] = useState("")
  const [commentLimit, setCommentLimit] = useState(50)
  const [isCommentLoading, setIsCommentLoading] = useState(false)

  // User ID
  const [userInput, setUserInput] = useState("")
  const [userWorksLimit, setUserWorksLimit] = useState(20)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [isUserWorksLoading, setIsUserWorksLoading] = useState(false)

  const parsedUserId = useMemo(() => {
    if (platform === "douyin") return parseDouyinUserId(userInput)
    if (platform === "xiaohongshu") return parseXhsUserId(userInput)
    return parseKsUserId(userInput)
  }, [platform, userInput])

  const workIds = useMemo(() => {
    return workIdsText
      .split(/[\n,，\s]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
  }, [workIdsText])

  const handleFetchWorkData = async () => {
    setIsWorkLoading(true)
    try {
      const res = await fetch("/api/data/copilot/works-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          work_ids: workIds.length ? workIds : undefined,
          limit: workLimit,
          refresh_work_ids: workIds.length ? false : refreshWorkIds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || "Request failed")
      const info = data?.data || {}
      toast({
        title: "作品数据采集完成",
        description: `成功 ${info.success ?? 0}，失败 ${info.failed ?? 0}`,
      })
    } catch (e) {
      toast({ variant: "destructive", title: "作品数据采集失败", description: String(e) })
    } finally {
      setIsWorkLoading(false)
    }
  }

  const handleFetchComments = async () => {
    if (platform !== "douyin") {
      toast({ variant: "destructive", title: "暂未支持", description: "评论采集目前先支持抖音" })
      return
    }
    if (!commentWorkId.trim()) {
      toast({ variant: "destructive", title: "缺少作品ID", description: "请输入 work_id（抖音 aweme_id）" })
      return
    }
    setIsCommentLoading(true)
    try {
      const res = await fetch("/api/data/copilot/work-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          work_id: commentWorkId.trim(),
          limit: commentLimit,
          cursor: 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || "Request failed")
      toast({ title: "评论抓取成功", description: "已返回评论数据（暂未写入表格）" })
      // TODO: store/export comments in UI
      console.log("comments:", data)
    } catch (e) {
      toast({ variant: "destructive", title: "评论抓取失败", description: String(e) })
    } finally {
      setIsCommentLoading(false)
    }
  }

  const handleFetchUserInfo = async () => {
    if (platform !== "douyin") {
      toast({ variant: "destructive", title: "暂未支持", description: "用户数据目前先支持抖音" })
      return
    }
    if (!parsedUserId) {
      toast({ variant: "destructive", title: "缺少用户ID", description: "请输入用户主页链接或用户ID" })
      return
    }
    setIsUserLoading(true)
    try {
      const res = await fetch("/api/data/copilot/user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          user_id: parsedUserId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || "Request failed")
      toast({ title: "用户信息抓取成功", description: "已返回用户数据（控制台可见）" })
      console.log("user-info:", data)
    } catch (e) {
      toast({ variant: "destructive", title: "用户信息抓取失败", description: String(e) })
    } finally {
      setIsUserLoading(false)
    }
  }

  const handleFetchUserWorks = async () => {
    if (platform !== "douyin") {
      toast({ variant: "destructive", title: "暂未支持", description: "用户作品列表目前先支持抖音" })
      return
    }
    if (!parsedUserId) {
      toast({ variant: "destructive", title: "缺少用户ID", description: "请输入用户主页链接或用户ID" })
      return
    }
    setIsUserWorksLoading(true)
    try {
      const res = await fetch("/api/data/copilot/user-works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          user_id: parsedUserId,
          limit: userWorksLimit,
          cursor: 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || data?.error || "Request failed")
      toast({ title: "用户作品抓取成功", description: "已返回作品列表（控制台可见）" })
      console.log("user-works:", data)
    } catch (e) {
      toast({ variant: "destructive", title: "用户作品抓取失败", description: String(e) })
    } finally {
      setIsUserWorksLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">数据查询</h1>
        <p className="text-white/60 mt-1">手动输入作品ID / 用户ID，调用社媒助手抓取数据</p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">基础配置</CardTitle>
          <CardDescription className="text-white/60">先选择平台；抖音用户ID建议粘贴主页链接：https://www.douyin.com/user/&lt;sec_uid&gt; → sec_uid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-2">
            <Label>平台</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="选择平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="douyin">抖音</SelectItem>
                <SelectItem value="xiaohongshu">小红书</SelectItem>
                <SelectItem value="kuaishou">快手</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="work" className="w-full">
        <TabsList>
          <TabsTrigger value="work">作品ID</TabsTrigger>
          <TabsTrigger value="user">用户ID</TabsTrigger>
        </TabsList>

        <TabsContent value="work">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">采集指定作品的数据</CardTitle>
                <CardDescription className="text-white/60">作品详情、播放/点赞/评论等，并写入视频数据表</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>作品ID（可选）</Label>
                  <Textarea className="rounded-xl min-h-[96px]" placeholder="一行一个 aweme_id / 视频链接 / 分享口令文本；留空则从库读取（需要先“刷新作品ID”）" value={workIdsText} onChange={(e) => setWorkIdsText(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>读取数量</Label>
                    <Input className="rounded-xl" type="number" min={1} max={500} value={workLimit} onChange={(e) => setWorkLimit(parseInt(e.target.value || "50", 10))} />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" className="rounded-2xl w-full" onClick={() => setRefreshWorkIds((v) => !v)}>
                      {refreshWorkIds ? "✅ 先刷新作品ID" : "❌ 不刷新作品ID"}
                    </Button>
                  </div>
                </div>

                <Button className="rounded-2xl" onClick={handleFetchWorkData} disabled={isWorkLoading}>
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isWorkLoading ? "animate-spin" : ""}`} />
                  {isWorkLoading ? "采集中..." : "开始采集并写入"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">采集指定作品的评论</CardTitle>
                <CardDescription className="text-white/60">目前先支持抖音；结果返回到浏览器控制台</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>作品ID</Label>
                  <Input className="rounded-xl" placeholder="aweme_id / 视频链接 / 分享口令文本" value={commentWorkId} onChange={(e) => setCommentWorkId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>评论数量</Label>
                  <Input className="rounded-xl" type="number" min={1} max={200} value={commentLimit} onChange={(e) => setCommentLimit(parseInt(e.target.value || "50", 10))} />
                </div>

                <Button className="rounded-2xl" onClick={handleFetchComments} disabled={isCommentLoading}>
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isCommentLoading ? "animate-spin" : ""}`} />
                  {isCommentLoading ? "抓取中..." : "抓取评论"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">采集指定创作者的数据</CardTitle>
                <CardDescription className="text-white/60">输入用户主页链接或用户ID（抖音为 sec_uid）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>用户主页链接 / 用户ID</Label>
                  <Input
                    className="rounded-xl"
                    placeholder={
                      platform === "douyin"
                        ? "https://www.douyin.com/user/<sec_uid> → sec_uid"
                        : "粘贴用户主页链接或用户ID"
                    }
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                  <p className="text-xs text-white/50">解析结果：{parsedUserId || "--"}</p>
                </div>

                <Button className="rounded-2xl" onClick={handleFetchUserInfo} disabled={isUserLoading}>
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isUserLoading ? "animate-spin" : ""}`} />
                  {isUserLoading ? "抓取中..." : "抓取用户信息"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">采集指定创作者的作品列表</CardTitle>
                <CardDescription className="text-white/60">目前先支持抖音；结果返回到浏览器控制台</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>作品数量</Label>
                  <Input className="rounded-xl" type="number" min={1} max={50} value={userWorksLimit} onChange={(e) => setUserWorksLimit(parseInt(e.target.value || "20", 10))} />
                </div>

                <Button className="rounded-2xl" onClick={handleFetchUserWorks} disabled={isUserWorksLoading}>
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isUserWorksLoading ? "animate-spin" : ""}`} />
                  {isUserWorksLoading ? "抓取中..." : "抓取用户作品"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
