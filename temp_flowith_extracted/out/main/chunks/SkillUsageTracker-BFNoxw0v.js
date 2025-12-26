"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const index = require("./index-QCbZNpvt.js");
require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("electron"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
class SkillUsageTracker {
  /**
   * Update usage stats via backend API (atomic updates)
   */
  async trackUsage(params) {
    if (params.matchedSkillNames.length === 0) {
      console.log("[SkillUsageTracker] No skills to track");
      return;
    }
    console.log(`[SkillUsageTracker] Tracking usage for ${params.matchedSkillNames.length} skills`);
    console.log(`[SkillUsageTracker] Task success: ${params.taskSuccess}`);
    try {
      const result = await index.scriptSkillService.trackUsage({
        matchedSkillNames: params.matchedSkillNames,
        hostname: params.hostname,
        taskSuccess: params.taskSuccess
      });
      if (result.updated.length > 0) {
        console.log("[SkillUsageTracker] Successfully tracked:", {
          updated: result.updated.map((u) => ({
            name: u.skillName,
            useCount: u.newUseCount,
            successCount: u.newSuccessCount
          }))
        });
      }
      if (result.failed.length > 0) {
        console.warn("[SkillUsageTracker] Some tracking failed:", {
          failed: result.failed.map((f) => ({
            name: f.skillName,
            error: f.error
          }))
        });
      }
      console.log(`[SkillUsageTracker] Tracking complete: ${result.updated.length} success, ${result.failed.length} failed`);
    } catch (error) {
      console.error("[SkillUsageTracker] Tracking error:", error.message);
    }
  }
}
exports.SkillUsageTracker = SkillUsageTracker;
