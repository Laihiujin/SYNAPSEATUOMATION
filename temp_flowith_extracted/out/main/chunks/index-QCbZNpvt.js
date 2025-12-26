"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const config = require("./supabaseManager-BAbRVJxx.js");
require("@supabase/supabase-js"), require("electron"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
class ScriptSkillService {
  baseUrl;
  constructor() {
    this.baseUrl = config.g();
  }
  async getAuthHeaders() {
    const session = await config.s.getSession();
    if (!session?.access_token) {
      throw new Error("User not authenticated");
    }
    return {
      Authorization: session.access_token,
      // NO "Bearer " prefix
      "Content-Type": "application/json"
    };
  }
  async upload(request) {
    const url = `${this.baseUrl}/os/script-skills/upload`;
    const headers = await this.getAuthHeaders();
    console.log(`[ScriptSkillService] POST ${url}`, {
      skillName: request.skillName,
      hostname: request.hostname,
      score: request.qualityScore.overallScore
    });
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ScriptSkillService] Upload failed: ${response.status}`);
      console.error(`[ScriptSkillService] Error: ${errorText}`);
      throw new Error(`Upload failed: ${response.status}`);
    }
    const result = await response.json();
    console.log(`[ScriptSkillService] Upload result:`, result);
    return result;
  }
  async trackUsage(request) {
    const url = `${this.baseUrl}/os/script-skills/track-usage`;
    const headers = await this.getAuthHeaders();
    console.log(`[ScriptSkillService] POST ${url}`, {
      skills: request.matchedSkillNames.length,
      hostname: request.hostname,
      success: request.taskSuccess
    });
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ScriptSkillService] Track usage failed: ${response.status}`);
      console.error(`[ScriptSkillService] Error: ${errorText}`);
      throw new Error(`Track usage failed: ${response.status}`);
    }
    const result = await response.json();
    console.log(`[ScriptSkillService] Track usage result:`, {
      updated: result.updated.length,
      failed: result.failed.length
    });
    return result;
  }
  async deleteByTaskId(taskId) {
    const url = `${this.baseUrl}/os/script-skills/delete`;
    const headers = await this.getAuthHeaders();
    console.log(`[ScriptSkillService] DELETE ${url}`, { taskId });
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ taskId })
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[ScriptSkillService] Endpoint not found, returning 0`);
        return 0;
      }
      const errorText = await response.text();
      console.error(`[ScriptSkillService] Delete failed: ${response.status}`);
      console.error(`[ScriptSkillService] Error: ${errorText}`);
      throw new Error(`Delete failed: ${response.status}`);
    }
    const result = await response.json();
    console.log(`[ScriptSkillService] Deleted ${result.deletedCount} skills`);
    return result.deletedCount;
  }
}
const scriptSkillService = new ScriptSkillService();
exports.scriptSkillService = scriptSkillService;
