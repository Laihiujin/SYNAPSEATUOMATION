import { NextResponse } from "next/server"

import { backendBaseUrl } from "@/lib/env"

// 修改为使用 sync-user-info 接口
// deep-sync 会导致账号数据混乱，已废弃
export async function POST() {
    try {
        const response = await fetch(`${backendBaseUrl}/api/v1/accounts/sync-user-info`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("User info sync error:", error)
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        )
    }
}
