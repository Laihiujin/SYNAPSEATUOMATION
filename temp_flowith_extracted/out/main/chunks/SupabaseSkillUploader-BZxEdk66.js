"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const index = require("./index-QCbZNpvt.js");
require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("electron"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
class SupabaseSkillUploader {
  /**
   * Upload skill via backend API
   */
  async upload(params) {
    console.log("[SupabaseSkillUploader] Starting upload...");
    console.log(`[SupabaseSkillUploader] Skill: ${params.skillName}`);
    console.log(`[SupabaseSkillUploader] Hostname: ${params.hostname}`);
    console.log(`[SupabaseSkillUploader] Score: ${params.qualityScore.overallScore}/100`);
    try {
      const result = await index.scriptSkillService.upload({
        skillName: params.skillName,
        hostname: params.hostname,
        markdownContent: params.markdownContent,
        originalTask: params.originalTask,
        qualityScore: params.qualityScore,
        taskId: params.taskId,
        metadata: params.metadata
      });
      if (result.isDuplicate) {
        console.warn("[SupabaseSkillUploader] Skill already exists (duplicate)");
        return {
          success: true,
          error: "Skill already exists (duplicate)"
        };
      }
      if (!result.success) {
        console.error("[SupabaseSkillUploader] Upload failed:", result.error);
        return {
          success: false,
          error: result.error
        };
      }
      console.log("[SupabaseSkillUploader] Upload successful");
      console.log("[SupabaseSkillUploader] Skill ID:", result.skillId);
      return { success: true };
    } catch (error) {
      console.error("[SupabaseSkillUploader] Upload error:", error.message);
      return {
        success: false,
        error: error.message || "Unknown upload error"
      };
    }
  }
}
exports.SupabaseSkillUploader = SupabaseSkillUploader;
