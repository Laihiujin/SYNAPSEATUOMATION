"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), config = require("./supabaseManager-BAbRVJxx.js"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js");
require("@supabase/supabase-js"), require("mitt");
class FlowManager {
  /**
   * 获取合并的 Flow 列表（个人对话 + 协作对话）
   * 置顶的在前面，然后按更新时间排序
   */
  async fetchMergedFlows(pageIndex = 0, pageSize = 50) {
    try {
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录 - session 详情:", {
          session: !!session,
          user: !!session?.user,
          userId: session?.user?.id
        });
        return { data: null, error: new Error("用户未登录") };
      }
      const userId = session.user.id;
      const { data: personalConvs } = await client.from("conversation").select("*").eq("user_id", userId).neq("is_delete", true).order("updated_at", { ascending: false }).limit(1e4);
      const { data: cooperateRelations, error: cooperateError } = await client.from("cooperate").select("role, top, conv_id").eq("user_id", userId).limit(1e4);
      if (cooperateError) {
        console.error("[FlowManager] 查询协作关系失败:", cooperateError);
      }
      let cooperateConvs = [];
      if (cooperateRelations && cooperateRelations.length > 0) {
        const convIds = cooperateRelations.map((r) => r.conv_id).filter(Boolean);
        if (convIds.length > 0) {
          const BATCH_SIZE = 100;
          const batches = [];
          for (let i = 0; i < convIds.length; i += BATCH_SIZE) {
            batches.push(convIds.slice(i, i + BATCH_SIZE));
          }
          for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const { data: convData, error: convError } = await client.from("conversation").select("*").in("id", batch).neq("is_delete", true);
            if (convError) {
              console.error(`[FlowManager] 查询协作对话详情失败 (批次 ${i + 1}/${batches.length}):`, convError);
            } else if (convData) {
              cooperateConvs.push(...convData);
            }
          }
        }
      }
      const cooperateData = cooperateRelations?.map((rel) => ({
        role: rel.role,
        top: rel.top,
        conv_id: cooperateConvs.find((c) => c.id === rel.conv_id)
      })).filter((item) => item.conv_id) || [];
      const flowMap = /* @__PURE__ */ new Map();
      if (personalConvs) {
        personalConvs.forEach((conv) => {
          const memberCount = conv.metadata?.member_count;
          const isCooperate = typeof memberCount === "number" && memberCount > 1;
          flowMap.set(conv.id, {
            ...conv,
            isCooperate
          });
        });
      }
      if (cooperateData) {
        cooperateData.filter((item) => {
          if (!item.conv_id) return false;
          const conv = item.conv_id;
          if (conv.is_delete === true) return false;
          return true;
        }).forEach((item) => {
          const conv = item.conv_id;
          const existing = flowMap.get(conv.id);
          const memberCount = conv.metadata?.member_count;
          const isActuallyCooperate = typeof memberCount === "number" && memberCount > 1;
          if (existing) {
            flowMap.set(conv.id, {
              ...existing,
              top: isActuallyCooperate ? item.top : existing.top,
              cooperateRole: item.role
            });
          } else {
            flowMap.set(conv.id, {
              ...conv,
              top: item.top,
              isCooperate: isActuallyCooperate,
              cooperateRole: item.role
            });
          }
        });
      }
      const allFlows = Array.from(flowMap.values()).sort((a, b) => {
        const aTop = a.top === true;
        const bTop = b.top === true;
        if (aTop !== bTop) {
          return aTop ? -1 : 1;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      const flows = allFlows.slice(start, end);
      return { data: flows, error: null };
    } catch (error) {
      console.error("[FlowManager] 获取 Flow 列表失败:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error("获取列表失败")
      };
    }
  }
  /**
   * 删除个人对话
   */
  async deleteFlow(flowId) {
    try {
      console.log("[FlowManager] 开始删除对话:", flowId);
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录");
        return false;
      }
      console.log("[FlowManager] 执行软删除操作...");
      const { error, data } = await client.from("conversation").update({ is_delete: true }).eq("id", flowId).eq("user_id", session.user.id).select();
      if (error) {
        console.error("[FlowManager] 删除对话失败:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return false;
      }
      console.log("[FlowManager] 删除成功，受影响的行:", data?.length || 0);
      mainEventBus.m.emit("flow:deleted", flowId);
      return true;
    } catch (error) {
      console.error("[FlowManager] 删除对话异常:", error);
      return false;
    }
  }
  /**
   * 批量删除个人对话
   */
  async deleteFlows(flowIds) {
    try {
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录");
        return false;
      }
      const { error } = await client.from("conversation").update({ is_delete: true }).in("id", flowIds).eq("user_id", session.user.id);
      if (error) {
        console.error("[FlowManager] 批量删除对话失败:", error);
        return false;
      }
      flowIds.forEach((id) => mainEventBus.m.emit("flow:deleted", id));
      return true;
    } catch (error) {
      console.error("[FlowManager] 批量删除对话异常:", error);
      return false;
    }
  }
  /**
   * 退出协作对话
   */
  async leaveCooperate(flowId) {
    try {
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录");
        return false;
      }
      const { error } = await client.from("cooperate").delete().eq("conv_id", flowId).eq("user_id", session.user.id);
      if (error) {
        console.error("[FlowManager] 退出协作失败:", error);
        return false;
      }
      mainEventBus.m.emit("flow:left", flowId);
      return true;
    } catch (error) {
      console.error("[FlowManager] 退出协作异常:", error);
      return false;
    }
  }
  /**
   * 切换置顶状态
   */
  async togglePin(flowId, isCooperate, currentTop) {
    try {
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录");
        return false;
      }
      if (isCooperate) {
        const { error } = await client.from("cooperate").update({ top: !currentTop }).eq("conv_id", flowId).eq("user_id", session.user.id);
        if (error) {
          console.error("[FlowManager] 切换协作对话置顶失败:", error);
          return false;
        }
      } else {
        const { error } = await client.from("conversation").update({ top: !currentTop }).eq("id", flowId).eq("user_id", session.user.id);
        if (error) {
          console.error("[FlowManager] 切换对话置顶失败:", error);
          return false;
        }
      }
      mainEventBus.m.emit("flow:pinned", { flowId, pinned: !currentTop });
      return true;
    } catch (error) {
      console.error("[FlowManager] 切换置顶异常:", error);
      return false;
    }
  }
  /**
   * 创建新对话
   * @param initialText - 可选的初始文本，将通过 URL 参数传递给画布
   */
  async createFlow(initialText) {
    try {
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录");
        return { id: null, error: new Error("用户未登录") };
      }
      const { data, error } = await client.from("conversation").insert({
        title: "",
        top: false,
        user_id: session.user.id
      }).select("id").single();
      if (error) {
        console.error("[FlowManager] 创建对话失败:", error);
        return { id: null, error: new Error(error.message) };
      }
      const newFlowId = data?.id || null;
      console.log("[FlowManager] 创建对话成功:", newFlowId, initialText ? `with initialText: ${initialText.substring(0, 50)}...` : "");
      if (newFlowId) {
        mainEventBus.m.emit("flow:created", newFlowId);
      }
      return { id: newFlowId, error: null, initialText };
    } catch (error) {
      console.error("[FlowManager] 创建对话异常:", error);
      return {
        id: null,
        error: error instanceof Error ? error : new Error("创建失败")
      };
    }
  }
  /**
   * 重命名对话
   */
  async renameFlow(flowId, title) {
    try {
      const client = config.s.getClient();
      const session = await config.s.getSession();
      if (!session?.user?.id) {
        console.error("[FlowManager] 用户未登录");
        return false;
      }
      const { error } = await client.from("conversation").update({ title }).eq("id", flowId).eq("user_id", session.user.id);
      if (error) {
        console.error("[FlowManager] 重命名对话失败:", error);
        return false;
      }
      mainEventBus.m.emit("flow:renamed", { flowId, title });
      return true;
    } catch (error) {
      console.error("[FlowManager] 重命名对话异常:", error);
      return false;
    }
  }
  /**
   * 初始化 IPC 处理器
   */
  initializeIpcHandlers() {
    electron.ipcMain.handle("flow:fetch-list", async (_event, pageIndex, pageSize) => {
      return await this.fetchMergedFlows(pageIndex, pageSize);
    });
    electron.ipcMain.handle("flow:create", async (_event, initialText) => {
      return await this.createFlow(initialText);
    });
    electron.ipcMain.handle("flow:delete", async (_event, flowId) => {
      return await this.deleteFlow(flowId);
    });
    electron.ipcMain.handle("flow:delete-batch", async (_event, flowIds) => {
      return await this.deleteFlows(flowIds);
    });
    electron.ipcMain.handle("flow:leave-cooperate", async (_event, flowId) => {
      return await this.leaveCooperate(flowId);
    });
    electron.ipcMain.handle("flow:toggle-pin", async (_event, flowId, isCooperate, currentTop) => {
      return await this.togglePin(flowId, isCooperate, currentTop);
    });
    electron.ipcMain.handle("flow:rename", async (_event, flowId, title) => {
      return await this.renameFlow(flowId, title);
    });
  }
}
const flowManager = new FlowManager();
exports.flowManager = flowManager;
