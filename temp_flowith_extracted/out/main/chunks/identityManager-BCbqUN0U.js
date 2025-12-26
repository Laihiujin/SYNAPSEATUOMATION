"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), uuid = require("uuid"), index = require("./index-Bf0u4cvK.js"), config = require("./supabaseManager-BAbRVJxx.js"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js");
require("path"), require("fs/promises"), require("fs"), require("@supabase/supabase-js"), require("mitt");
class AnalyticsIdentityManager {
  cachedDistinctId = null;
  previousAnonymousId = null;
  constructor() {
    this.setupAuthListeners();
  }
  /**
   * 设置认证事件监听器
   */
  setupAuthListeners() {
    mainEventBus.m.on("auth:loginSuccess", async () => {
      const session = await config.s.getSession();
      if (session?.user?.id) {
        await this.identifyUser(session.user.id);
      }
    });
    mainEventBus.m.on("auth:userInfoUpdate", async (userInfo) => {
      if (!userInfo) {
        this.resetToAnonymous();
      }
    });
  }
  /**
   * 获取用户的唯一标识
   * 优先级：登录用户ID > 匿名设备ID
   */
  async getDistinctId() {
    try {
      const session = await config.s.getSession();
      if (session?.user?.id) {
        const distinctId = `user_${session.user.id}`;
        this.cachedDistinctId = distinctId;
        return distinctId;
      }
    } catch (error) {
      console.warn("[AnalyticsIdentity] Failed to get session:", error);
    }
    if (this.cachedDistinctId && this.cachedDistinctId.startsWith("anon_")) {
      return this.cachedDistinctId;
    }
    try {
      const storage = index.getAppStorage();
      if (!storage?.store?.appSettings) {
        console.warn("[AnalyticsIdentity] Store not initialized, using temporary ID");
        const tempId = this.generateAnonymousId();
        this.cachedDistinctId = `anon_${tempId}`;
        return this.cachedDistinctId;
      }
      let anonymousId = storage.store.appSettings.get("analytics.anonymousId");
      if (!anonymousId) {
        anonymousId = this.generateAnonymousId();
        storage.store.appSettings.set("analytics.anonymousId", anonymousId);
        console.log("[AnalyticsIdentity] Generated new anonymous ID");
      }
      this.cachedDistinctId = `anon_${anonymousId}`;
      return this.cachedDistinctId;
    } catch (error) {
      console.warn("[AnalyticsIdentity] Failed to access storage, using temporary ID:", error);
      const tempId = this.generateAnonymousId();
      this.cachedDistinctId = `anon_${tempId}`;
      return this.cachedDistinctId;
    }
  }
  /**
   * 生成匿名设备 ID
   * 使用 UUID v4 确保唯一性
   */
  generateAnonymousId() {
    return uuid.v4();
  }
  /**
   * 当用户登录时，关联匿名ID和用户ID
   * 返回 previousAnonymousId 用于 PostHog alias
   */
  async identifyUser(userId) {
    const currentDistinctId = this.cachedDistinctId;
    if (currentDistinctId && currentDistinctId.startsWith("anon_")) {
      this.previousAnonymousId = currentDistinctId;
    } else {
      this.previousAnonymousId = null;
    }
    this.cachedDistinctId = `user_${userId}`;
    console.log("[AnalyticsIdentity] User identified:", {
      previousId: this.previousAnonymousId,
      newId: this.cachedDistinctId
    });
    return this.previousAnonymousId;
  }
  /**
   * 获取之前的匿名ID（用于 alias 操作）
   */
  getPreviousAnonymousId() {
    return this.previousAnonymousId;
  }
  /**
   * 清除之前的匿名ID记录
   */
  clearPreviousAnonymousId() {
    this.previousAnonymousId = null;
  }
  /**
   * 用户登出时重置为匿名 ID
   */
  resetToAnonymous() {
    this.cachedDistinctId = null;
    this.previousAnonymousId = null;
    console.log("[AnalyticsIdentity] Reset to anonymous");
  }
  /**
   * 获取用户属性（用于 PostHog identify）
   */
  async getUserProperties() {
    try {
      const session = await config.s.getSession();
      if (session?.user) {
        return {
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          created_at: session.user.created_at,
          is_anonymous: false,
          app_version: electron.app.getVersion(),
          platform: process.platform,
          arch: process.arch
        };
      }
    } catch (error) {
      console.warn("[AnalyticsIdentity] Failed to get user properties:", error);
    }
    return {
      is_anonymous: true,
      app_version: electron.app.getVersion(),
      platform: process.platform,
      arch: process.arch
    };
  }
  /**
   * 检查当前是否为已登录用户
   */
  async isAuthenticatedUser() {
    const distinctId = await this.getDistinctId();
    return distinctId.startsWith("user_");
  }
  /**
   * 获取纯粹的用户ID（不带前缀）
   */
  async getUserId() {
    const distinctId = await this.getDistinctId();
    if (distinctId.startsWith("user_")) {
      return distinctId.replace("user_", "");
    }
    return null;
  }
}
const analyticsIdentityManager = new AnalyticsIdentityManager();
exports.AnalyticsIdentityManager = AnalyticsIdentityManager;
exports.analyticsIdentityManager = analyticsIdentityManager;
