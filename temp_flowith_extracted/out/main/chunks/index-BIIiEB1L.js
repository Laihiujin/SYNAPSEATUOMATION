"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const config = require("./supabaseManager-BAbRVJxx.js"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js");
require("@supabase/supabase-js"), require("electron"), require("mitt");
class TaskSkillService {
  baseUrl;
  uploadedTaskIds = /* @__PURE__ */ new Set();
  constructor() {
    this.baseUrl = config.g();
    console.log("[TaskSkillService] 初始化，Base URL:", this.baseUrl);
    mainEventBus.m.on("agent:finished", ({ agent, taskHistory }) => {
      if (taskHistory.stopReason === "complete") {
        const hasMatchedCloud = agent.skillMatcher.hasMatchedCloudTaskSkills?.();
        if (!hasMatchedCloud) {
          this.tryGenerateTaskSkill(taskHistory).catch((err) => {
            console.warn("[AgentManager] Task Skill 生成失败:", err);
          });
        }
      }
    });
  }
  /**
   * 生成并上传 Task Skill
   * @param taskId - 任务 ID
   * @param agentData - Agent 任务数据
   * @returns 上传结果
   */
  async generateAndUpload(taskId, agentData) {
    console.log("[TaskSkillService] 🔥 开始生成 Task Skill...");
    console.log(`[TaskSkillService] Task ID: ${taskId}`);
    console.log(`[TaskSkillService] Instruction: ${agentData.instruction.substring(0, 60)}...`);
    try {
      if (this.uploadedTaskIds.has(taskId)) {
        console.log("[TaskSkillService] ⏭️ Task Skill 已上传过，跳过");
        return { success: true, error: "Already uploaded" };
      }
      const generateRequest = this.serializeTaskData(agentData);
      console.log("[TaskSkillService] 📡 调用生成 API...");
      const generateResponse = await this.callGenerateAPI(generateRequest);
      if (!generateResponse.success) {
        console.error("[TaskSkillService] ❌ 生成失败:", generateResponse.error);
        return { success: false, error: generateResponse.error };
      }
      const skill = generateResponse.existingSkill || generateResponse.skill;
      if (!skill) {
        console.error("[TaskSkillService] ❌ 未返回 skill 数据");
        return { success: false, error: "No skill returned" };
      }
      if (generateResponse.isDuplicate) {
        console.log("[TaskSkillService] 🔄 检测到重复任务:", skill.skillName);
        console.log("[TaskSkillService] 📊 相似度:", `${(generateResponse.existingSkill.similarity * 100).toFixed(1)}%`);
        console.log("[TaskSkillService] 🆔 已存在 Skill ID:", generateResponse.existingSkill.skillId);
        this.uploadedTaskIds.add(taskId);
        return { success: true, skillId: generateResponse.existingSkill.skillId };
      }
      console.log("[TaskSkillService] ✨ 生成新 Skill:", skill.skillName);
      console.log("[TaskSkillService] 📊 质量分数:", skill.qualityScore.overallScore);
      console.log("[TaskSkillService] 📡 调用上传 API...");
      const uploadRequest = this.buildUploadRequest(skill, agentData);
      const uploadResponse = await this.callUploadAPI(uploadRequest);
      if (uploadResponse.success) {
        console.log("[TaskSkillService] ✅ 上传成功，Skill ID:", uploadResponse.skillId);
        this.uploadedTaskIds.add(taskId);
        return { success: true, skillId: uploadResponse.skillId };
      } else {
        console.error("[TaskSkillService] ❌ 上传失败:", uploadResponse.error);
        return { success: false, error: uploadResponse.error };
      }
    } catch (error) {
      console.error("[TaskSkillService] ❌ 异常:", error.message);
      return { success: false, error: error.message };
    }
  }
  /**
   * 序列化 Agent 数据为 API 请求格式
   */
  serializeTaskData(agentData) {
    return {
      instruction: agentData.instruction,
      steps: agentData.steps.map((step) => ({
        stepNumber: step.stepNumber,
        actions: step.results.map((r) => ({
          actionName: r.actionName,
          success: r.success
        })),
        reasoning: step.subgoal
        // 🎯 subgoal 对应 reasoning
      })),
      result: agentData.result,
      totalDuration: Date.now() - agentData.createdAt
    };
  }
  /**
   * 构建上传请求
   */
  buildUploadRequest(skill, agentData) {
    return {
      skillName: skill.skillName,
      taskPattern: skill.taskPattern,
      markdownContent: skill.markdown,
      strategySection: skill.strategySection,
      originalInstruction: skill.originalInstruction,
      stepCount: agentData.steps.length,
      totalDurationMs: Date.now() - agentData.createdAt,
      toolsUsed: skill.toolsUsed,
      actionCategories: skill.actionCategories,
      qualityScore: skill.qualityScore,
      taskId: agentData.taskId
      // Include taskId for deletion on refund
    };
  }
  /**
   * 调用生成 API
   */
  async callGenerateAPI(request) {
    const url = `${this.baseUrl}/task-skills/generate`;
    const headers = await this.getAuthHeaders();
    console.log(`[TaskSkillService] 🚀 POST ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TaskSkillService] ❌ Generate API failed: ${response.status}`);
      console.error(`[TaskSkillService] Error: ${errorText}`);
      throw new Error(`Generate API failed: ${response.status}`);
    }
    return response.json();
  }
  /**
   * 调用上传 API
   */
  async callUploadAPI(request) {
    const url = `${this.baseUrl}/task-skills/upload`;
    const headers = await this.getAuthHeaders();
    console.log(`[TaskSkillService] 🚀 POST ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TaskSkillService] ❌ Upload API failed: ${response.status}`);
      console.error(`[TaskSkillService] Error: ${errorText}`);
      throw new Error(`Upload API failed: ${response.status}`);
    }
    return response.json();
  }
  /**
   * 匹配 Task Skills（云端）
   * @param instruction - 用户指令
   * @param options - 匹配选项
   * @returns 匹配的 Task Skills
   */
  async matchSkills(instruction, options = {}) {
    const { minScore = 80, limit = 5 } = options;
    try {
      const params = new URLSearchParams({
        instruction,
        minScore: minScore.toString(),
        limit: limit.toString()
      });
      const url = `${this.baseUrl}/task-skills/match?${params.toString()}`;
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: "GET",
        headers
      });
      if (!response.ok) {
        console.error(`[TaskSkillService] ❌ Match API failed: ${response.status}`);
        return [];
      }
      const data = await response.json();
      if (data.success && data.matches) {
        console.log(`[TaskSkillService] ✅ 找到 ${data.matches.length} 个云端匹配`);
        return data.matches;
      } else {
        console.log("[TaskSkillService] ⚠️ 匹配失败:", data.error);
        return [];
      }
    } catch (error) {
      console.error("[TaskSkillService] ❌ 匹配异常:", error.message);
      return [];
    }
  }
  /**
   * 获取认证 Headers
   */
  async getAuthHeaders() {
    const session = await config.s.getSession();
    if (!session?.access_token) {
      throw new Error("未找到有效的认证会话");
    }
    return {
      Authorization: session.access_token,
      "X-Flo-Key": process.env.VITE_EDGE_KEY || "",
      "Content-Type": "application/json"
    };
  }
  /**
   * Delete task skills by task ID
   */
  async deleteByTaskId(taskId) {
    const url = `${this.baseUrl}/task-skills/delete`;
    const headers = await this.getAuthHeaders();
    console.log(`[TaskSkillService] 🗑️ DELETE ${url}`, { taskId });
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ taskId })
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[TaskSkillService] ⚠️ Delete endpoint not found, returning 0`);
        return 0;
      }
      const errorText = await response.text();
      console.error(`[TaskSkillService] ❌ Delete failed: ${response.status}`);
      console.error(`[TaskSkillService] Error: ${errorText}`);
      throw new Error(`Delete failed: ${response.status}`);
    }
    const result = await response.json();
    console.log(`[TaskSkillService] ✅ Deleted ${result.deletedCount} task skills`);
    return result.deletedCount || 0;
  }
  async tryGenerateTaskSkill(taskHistory) {
    console.log("[AgentManager] 🔥 开始生成 Task Skill...");
    try {
      const cleanInstruction = taskHistory.instruction.startsWith("=skill=") ? taskHistory.instruction.substring(7).trim() : taskHistory.instruction;
      const agentData = {
        taskId: taskHistory.id,
        instruction: cleanInstruction,
        steps: taskHistory.history.map((step) => ({
          stepNumber: step.stepNumber,
          subgoal: step.subgoal,
          results: step.results.map((r) => ({
            actionName: r.actionName,
            success: r.success
          }))
        })),
        result: taskHistory.result || "",
        createdAt: taskHistory.createdAt
      };
      const result = await this.generateAndUpload(taskHistory.id, agentData);
      if (result.success) {
        console.log("[AgentManager] ✅ Task Skill 生成成功:", result.skillId);
      } else {
        console.log("[AgentManager] ⚠️ Task Skill 生成失败:", result.error);
      }
    } catch (error) {
      console.error("[AgentManager] ❌ Task Skill 生成异常:", error.message);
    }
  }
}
const taskSkillService = new TaskSkillService();
exports.taskSkillService = taskSkillService;
