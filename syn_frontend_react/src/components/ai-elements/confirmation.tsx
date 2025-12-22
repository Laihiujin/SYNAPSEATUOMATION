"use client"

import * as React from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

export type ConfirmationState = "request" | "accepted" | "rejected"

interface ConfirmationProps {
  /**
   * 当前确认状态
   */
  state?: ConfirmationState

  /**
   * 工具名称
   */
  toolName?: string

  /**
   * 工具调用的参数
   */
  args?: Record<string, any>

  /**
   * 确认消息
   */
  message?: string

  /**
   * 接受回调
   */
  onAccept?: () => void

  /**
   * 拒绝回调
   */
  onReject?: () => void

  /**
   * 子元素
   */
  children?: React.ReactNode
}

/**
 * Confirmation 组件 - 用于工具执行前的用户确认
 *
 * 使用场景：
 * - Agent 需要执行敏感操作前请求用户确认
 * - 显示工具调用的详细信息
 * - 提供接受/拒绝按钮
 */
export function Confirmation({
  state = "request",
  toolName,
  args,
  message,
  onAccept,
  onReject,
  children
}: ConfirmationProps) {
  const stateConfig = {
    request: {
      icon: AlertCircle,
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500/30",
      bgColor: "bg-yellow-500/10"
    },
    accepted: {
      icon: CheckCircle2,
      iconColor: "text-green-500",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10"
    },
    rejected: {
      icon: XCircle,
      iconColor: "text-red-500",
      borderColor: "border-red-500/30",
      bgColor: "bg-red-500/10"
    }
  }

  const config = stateConfig[state]
  const Icon = config.icon

  return (
    <Alert className={`${config.borderColor} ${config.bgColor} border`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-4 w-4 mt-0.5 ${config.iconColor}`} />

        <div className="flex-1 space-y-2">
          <AlertDescription className="text-white/90">
            {children || message || (
              <>
                {state === "request" && (
                  <>
                    <div className="font-semibold mb-1">
                      🤖 Agent 请求执行工具
                    </div>
                    {toolName && (
                      <div className="text-sm text-white/70 mb-2">
                        工具: <code className="bg-black/30 px-1 py-0.5 rounded">{toolName}</code>
                      </div>
                    )}
                    {args && Object.keys(args).length > 0 && (
                      <div className="text-xs text-white/60 bg-black/20 p-2 rounded font-mono">
                        {JSON.stringify(args, null, 2)}
                      </div>
                    )}
                  </>
                )}
                {state === "accepted" && "✅ 已确认执行"}
                {state === "rejected" && "❌ 已拒绝执行"}
              </>
            )}
          </AlertDescription>

          {state === "request" && (onAccept || onReject) && (
            <div className="flex gap-2 pt-1">
              {onAccept && (
                <Button
                  size="sm"
                  onClick={onAccept}
                  className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                >
                  ✓ 确认
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  className="border-red-500/30 hover:bg-red-500/20 text-white/80 h-7 text-xs"
                >
                  ✗ 拒绝
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}
