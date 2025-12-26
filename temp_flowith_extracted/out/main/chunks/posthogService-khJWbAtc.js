"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), posthogNode = require("posthog-node"), identityManager = require("./identityManager-BCbqUN0U.js");
require("uuid"), require("./index-Bf0u4cvK.js"), require("path"), require("fs/promises"), require("fs"), require("./supabaseManager-BAbRVJxx.js"), require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
const POSTHOG_PUBLIC_KEY = "phc_E77M8wndJX2WhR33cKTb6aMien1PiVQdKRJgRk1C01l";
const POSTHOG_DEFAULT_HOST = "https://us.i.posthog.com";
class PostHogService {
  client = null;
  initialized = false;
  enabled = false;
  /**
   * 初始化 PostHog 客户端
   * 只要存在 API Key 就启用，不检查用户的 enableAnalytics 设置
   */
  async initialize() {
    if (this.initialized) {
      console.warn("[PostHog] Already initialized");
      return;
    }
    try {
      this.client = new posthogNode.PostHog(POSTHOG_PUBLIC_KEY, {
        host: process.env.VITE_PUBLIC_POSTHOG_HOST || POSTHOG_DEFAULT_HOST,
        flushAt: 10,
        // Electron 应用建议较小的批量
        flushInterval: 1e4,
        // 10秒自动 flush
        // 启用个人API密钥时的配置（可选）
        personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY
      });
      this.enabled = true;
      console.log("[PostHog] Service initialized successfully");
      await this.identifyCurrentUser();
      this.initialized = true;
    } catch (error) {
      console.error("[PostHog] Failed to initialize:", error);
      this.initialized = true;
    }
  }
  /**
   * 识别当前用户
   */
  async identifyCurrentUser() {
    if (!this.client || !this.enabled) return;
    try {
      const distinctId = await identityManager.analyticsIdentityManager.getDistinctId();
      const properties = await identityManager.analyticsIdentityManager.getUserProperties();
      this.client.identify({
        distinctId,
        properties
      });
      console.log("[PostHog] User identified:", distinctId);
    } catch (error) {
      console.error("[PostHog] Failed to identify user:", error);
    }
  }
  /**
   * 追踪事件
   * @param event 事件名称
   * @param properties 事件属性
   */
  async track(event, properties) {
    if (!this.enabled || !this.client) {
      return;
    }
    try {
      const distinctId = await identityManager.analyticsIdentityManager.getDistinctId();
      const enrichedProperties = {
        ...properties,
        app_version: electron.app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electron_version: process.versions.electron,
        chrome_version: process.versions.chrome,
        node_version: process.versions.node,
        timestamp: Date.now(),
        $lib: "electron-main"
      };
      this.client.capture({
        distinctId,
        event,
        properties: enrichedProperties
      });
    } catch (error) {
      console.error("[PostHog] Failed to track event:", event, error);
    }
  }
  /**
   * 识别用户并设置属性
   * @param properties 用户属性
   */
  async identify(properties) {
    if (!this.enabled || !this.client) {
      return;
    }
    try {
      const distinctId = await identityManager.analyticsIdentityManager.getDistinctId();
      const userProperties = properties || await identityManager.analyticsIdentityManager.getUserProperties();
      this.client.identify({
        distinctId,
        properties: userProperties
      });
      console.log("[PostHog] User identified with properties");
    } catch (error) {
      console.error("[PostHog] Failed to identify user:", error);
    }
  }
  /**
   * 关联匿名用户和已登录用户
   * 在用户登录时调用
   * @param userId 用户ID（不带前缀）
   */
  async alias(userId) {
    if (!this.enabled || !this.client) {
      return;
    }
    try {
      const previousAnonymousId = identityManager.analyticsIdentityManager.getPreviousAnonymousId();
      const newDistinctId = `user_${userId}`;
      if (previousAnonymousId && previousAnonymousId !== newDistinctId) {
        this.client.alias({
          distinctId: newDistinctId,
          alias: previousAnonymousId
        });
        console.log("[PostHog] Alias created:", {
          from: previousAnonymousId,
          to: newDistinctId
        });
        identityManager.analyticsIdentityManager.clearPreviousAnonymousId();
      }
    } catch (error) {
      console.error("[PostHog] Failed to create alias:", error);
    }
  }
  /**
   * 设置用户属性（不触发 identify）
   * @param properties 要设置的属性
   */
  async setUserProperties(properties) {
    if (!this.enabled || !this.client) {
      return;
    }
    try {
      const distinctId = await identityManager.analyticsIdentityManager.getDistinctId();
      this.client.capture({
        distinctId,
        event: "$set",
        properties: {
          $set: properties
        }
      });
      console.log("[PostHog] User properties set");
    } catch (error) {
      console.error("[PostHog] Failed to set user properties:", error);
    }
  }
  /**
   * 检查分析是否启用
   */
  isEnabled() {
    return this.enabled;
  }
  /**
   * 获取当前 distinct ID
   */
  async getDistinctId() {
    if (!this.enabled) {
      return null;
    }
    return identityManager.analyticsIdentityManager.getDistinctId();
  }
  /**
   * 立即 flush 所有待发送的事件
   */
  async flush() {
    if (!this.client) {
      return;
    }
    try {
      await this.client.flush();
      console.log("[PostHog] Events flushed");
    } catch (error) {
      console.error("[PostHog] Failed to flush events:", error);
    }
  }
  /**
   * 关闭服务，确保所有事件都已发送
   * 在应用退出时调用
   */
  async shutdown() {
    if (!this.client) {
      return;
    }
    try {
      console.log("[PostHog] Shutting down service...");
      await this.client.shutdown();
      console.log("[PostHog] Service shutdown complete");
    } catch (error) {
      console.error("[PostHog] Failed to shutdown:", error);
    }
  }
  /**
   * 重置服务（用于测试）
   */
  reset() {
    this.client = null;
    this.initialized = false;
    this.enabled = false;
  }
}
const posthogService = new PostHogService();
exports.posthogService = posthogService;
