"use client"

import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SinglePublishPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-500/10 p-4">
            <AlertCircle className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">单一发布功能暂时关闭</h1>
          <p className="text-white/60 text-sm">
            该功能正在优化升级中，请使用矩阵发布功能
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            onClick={() => router.push("/publish/matrix")}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            前往矩阵发布
          </Button>

          <Button
            onClick={() => router.push("/materials")}
            variant="ghost"
            className="w-full text-white/60 hover:text-white hover:bg-white/5"
          >
            返回素材管理
          </Button>
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-white/40">
            如有疑问，请联系技术支持
          </p>
        </div>
      </div>
    </div>
  )
}
