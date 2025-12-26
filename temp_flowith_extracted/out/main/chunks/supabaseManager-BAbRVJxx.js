"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const supabaseJs = require("@supabase/supabase-js"), electron = require("electron"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js");
const SUPABASE_URL = "https://aibdxsebwhalbnugsqel.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpYmR4c2Vid2hhbGJudWdzcWVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ0Mjk4NDksImV4cCI6MjAyMDAwNTg0OX0.FZz_aYXHu7YA_TljWyvSylrqaMBF1dGhkV-ZD01QyYI";
typeof process !== "undefined" && process.env ? process.env.WORKER_URL || "" : "";
const getFlowithWebsiteUrl = (locale) => {
  return locale === "zh-CN" ? "https://flowith.net" : "https://flowith.io";
};
const FLOWITH_WEBSITE_URL = "https://flowith.io";
const OAUTH_CALLBACK_HOSTS = "flo.ing,flowith.io".split(",").map((h) => h.trim()).filter(Boolean);
let hasInvitationCodes = false;
function getHasInvitationCodes() {
  return hasInvitationCodes;
}
function setHasInvitationCodes(hasCodes) {
  if (hasInvitationCodes === hasCodes) {
    return;
  }
  hasInvitationCodes = hasCodes;
  mainEventBus.m.emit("osInvitation:codesUpdated", { hasCodes });
}
function getWorkerURL() {
  return process.env.WORKER_URL || "https://edge.flo.ing";
}
const config = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, getWorkerURL }, Symbol.toStringTag, { value: "Module" }));
function isEmailAuthParams(params) {
  return "email" in params && "password" in params && "type" in params && params.type === "login";
}
function isOAuthAuthParams(params) {
  return "provider" in params;
}
function isRegisterParams(params) {
  return "email" in params && "password" in params && "type" in params && params.type === "register";
}
function isVerifyOtpParams(params) {
  return "email" in params && "token" in params && "type" in params && params.type === "verify-otp";
}
function isRequestPasswordResetParams(params) {
  return "type" in params && params.type === "request-reset";
}
function isResetPasswordParams(params) {
  return "type" in params && params.type === "reset-password" && "token" in params && "newPassword" in params;
}
async function fetchWithAuth(url, options) {
  try {
    const headers = new Headers(options?.headers);
    const session = await supabaseManager.getSession();
    if (!session) {
      console.error("[User API] No session found");
      throw new Error("Authentication required: No active session");
    }
    if (!session.access_token) {
      console.error("[User API] Session exists but no access token");
      throw new Error("Authentication required: No access token");
    }
    headers.set("Authorization", session.access_token);
    const response = await fetch(url, { ...options, headers });
    return response;
  } catch (error) {
    console.error("[User API] Fetch error:", error);
    return Promise.reject(error);
  }
}
async function callOsDistribute() {
  try {
    const url = `${getWorkerURL()}/user/os-distribute`;
    const response = await fetchWithAuth(url, {
      method: "GET"
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[User API] os-distribute failed:", response.status, errorText);
      void refreshInvitationCodesState();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }
    const data = await response.json();
    console.log("[User API] os-distribute success:", data);
    void refreshInvitationCodesState();
    return { success: true };
  } catch (error) {
    console.error("[User API] os-distribute exception:", error);
    void refreshInvitationCodesState();
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function getUserCredits() {
  try {
    const response = await fetchWithAuth(`${getWorkerURL()}/user/credits`, {
      method: "GET"
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[User API] Get credits failed:", response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }
    const allSubscriptions = await response.json();
    if (!Array.isArray(allSubscriptions) || allSubscriptions.length === 0) {
      return {
        success: true,
        remainingCredits: 0,
        totalCredits: 0,
        subscriptionType: null,
        allSubscriptions: []
      };
    }
    const remainingCredits = allSubscriptions.reduce(
      (sum, credit) => sum + credit.remain_quota,
      0
    );
    const totalCredits = allSubscriptions.reduce(
      (sum, credit) => sum + credit.init_quota,
      0
    );
    const primarySubscription = allSubscriptions.find(
      (credit) => credit.sub_type !== "invitation"
    );
    const subscriptionType = primarySubscription?.sub_type ?? null;
    return {
      success: true,
      remainingCredits,
      totalCredits,
      subscriptionType,
      allSubscriptions
    };
  } catch (error) {
    console.error("[User API] Get credits exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
async function refreshInvitationCodesState() {
  try {
    const cachedFetch = global.__cachedFetchInvitationCodes;
    if (cachedFetch) {
      const result = await cachedFetch();
      const hasCodes2 = Array.isArray(result?.codes) && result.codes.length > 0;
      setHasInvitationCodes(hasCodes2);
      console.log("[User API] ✅ Invitation codes state refreshed via cache (hasCodes:", hasCodes2, ")");
      return;
    }
    console.log("[User API] Cache not available, using direct API call");
    const response = await fetchWithAuth(`${getWorkerURL()}/user/os-invitation/my-codes`, {
      method: "GET"
    });
    if (!response.ok) {
      console.warn(
        "[User API] Failed to refresh invitation codes status:",
        response.status,
        response.statusText
      );
      setHasInvitationCodes(false);
      return;
    }
    const data = await response.json();
    const hasCodes = Array.isArray(data?.codes) && data.codes.length > 0;
    setHasInvitationCodes(hasCodes);
    console.log("[User API] ✅ Invitation codes state refreshed via direct call (hasCodes:", hasCodes, ")");
  } catch (error) {
    console.error("[User API] Error refreshing invitation codes status:", error);
    setHasInvitationCodes(false);
  }
}
function getTaskCreditsErrorKey(statusCode, errorText) {
  let backendError = null;
  try {
    const parsed = JSON.parse(errorText);
    backendError = parsed.error || parsed.message || null;
  } catch {
    backendError = errorText;
  }
  const errorLower = (backendError || "").toLowerCase();
  if (statusCode === 401 || statusCode === 403) {
    return "notAuthenticated";
  }
  if (statusCode >= 500) {
    return "systemError";
  }
  if (errorLower.includes("no usage data")) {
    return "noUsageData";
  }
  if (errorLower.includes("already refund")) {
    return "alreadyRefunded";
  }
  return "unknownError";
}
async function getTaskCredits(taskId) {
  try {
    const response = await fetchWithAuth(
      `${getWorkerURL()}/os/task-credits?taskId=${taskId}`,
      {
        method: "GET"
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[User API] Get task credits failed:", response.status, errorText);
      const errorKey = getTaskCreditsErrorKey(response.status, errorText);
      return {
        success: false,
        error: errorKey
      };
    }
    const data = await response.json();
    return {
      success: true,
      credits: data.credits,
      isLegacy: data.isLegacy,
      stepCount: data.stepCount,
      hasRefunded: data.hasRefunded || false,
      message: data.message,
      taskId: data.taskId
    };
  } catch (error) {
    console.error("[User API] Get task credits exception:", error);
    return {
      success: false,
      error: "networkError"
    };
  }
}
async function refundTaskCredits(taskId, taskSnapshot) {
  try {
    const response = await fetchWithAuth(`${getWorkerURL()}/os/refund-task-credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        taskId,
        taskSnapshot
      })
    });
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text() };
        }
      } else {
        errorData = { error: await response.text() };
      }
      console.error("[User API] Refund task credits failed:", response.status, errorData);
      const errorKey = getTaskCreditsErrorKey(response.status, errorData.error || "");
      return {
        success: false,
        error: errorKey,
        hasRefunded: errorData.hasRefunded || false
      };
    }
    const data = await response.json();
    return {
      success: true,
      creditsRefunded: data.creditsRefunded,
      isLegacy: data.isLegacy,
      message: data.message,
      taskId: data.taskId
    };
  } catch (error) {
    console.error("[User API] Refund task credits exception:", error);
    return {
      success: false,
      error: "networkError"
    };
  }
}
async function validateRefundReason(reason) {
  try {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return {
        success: true,
        valid: false,
        message: "Reason cannot be empty"
      };
    }
    const workerURL = getWorkerURL();
    const url = `${workerURL}/os/validate-refund-reason`;
    console.log("[User API] Validating refund reason:", {
      reasonLength: trimmedReason.length,
      url
    });
    const response = await fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reason: trimmedReason })
    });
    if (!response.ok) {
      console.error("[User API] Validation failed:", response.status, response.statusText);
      return {
        success: false,
        error: "validationFailed"
      };
    }
    const result = await response.json();
    console.log("[User API] Validation result:", result);
    return result;
  } catch (error) {
    console.error("[User API] Validate refund reason exception:", error);
    return {
      success: false,
      error: "networkError"
    };
  }
}
async function awardCredits(credits, reason, checkClaimed = false) {
  try {
    if (checkClaimed && reason) {
      const client = supabaseManager.getClient();
      const { data: userData } = await client.auth.getUser();
      const claimKey = `has_claimed_${reason}`;
      if (userData?.user?.user_metadata?.[claimKey]) {
        return { success: true, alreadyClaimed: true };
      }
    }
    const response = await fetchWithAuth(`${getWorkerURL()}/user/award-credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        credits,
        reason,
        checkClaimed
      })
    });
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `Failed to parse error response: ${response.statusText}` };
        }
      } else {
        const text = await response.text();
        errorData = { error: `${response.statusText}: ${text.substring(0, 200)}` };
      }
      console.error("[User API] Award credits failed:", response.status, errorData);
      if (response.status === 400 && errorData.alreadyClaimed) {
        return { success: true, alreadyClaimed: true };
      }
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    await response.json();
    if (checkClaimed && reason) {
      const client = supabaseManager.getClient();
      const claimKey = `has_claimed_${reason}`;
      await client.auth.updateUser({
        data: {
          [claimKey]: true,
          [`${claimKey}_at`]: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    }
    return { success: true, alreadyClaimed: false };
  } catch (error) {
    console.error("[User API] Award credits exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
const user = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, awardCredits, callOsDistribute, getTaskCredits, getUserCredits, refundTaskCredits, validateRefundReason }, Symbol.toStringTag, { value: "Module" }));
let sessionStore = null;
async function initializeStore() {
  if (sessionStore) return sessionStore;
  const Store = (await import("electron-store")).default;
  const store = new Store({
    name: "supabase-session",
    encryptionKey: "flowith-browser-supabase-encryption-key-2024"
  });
  sessionStore = {
    get: (key) => store.get(key),
    set: (key, value) => store.set(key, value),
    delete: (key) => store.delete(key)
  };
  return sessionStore;
}
const electronStorage = {
  getItem: (key) => {
    if (!sessionStore) {
      console.warn("[electronStorage] Store not initialized, returning null");
      return null;
    }
    const value = sessionStore.get(key);
    return value ? String(value) : null;
  },
  setItem: (key, value) => {
    if (!sessionStore) {
      console.warn("[electronStorage] Store not initialized yet");
      return;
    }
    sessionStore.set(key, value);
  },
  removeItem: (key) => {
    if (!sessionStore) return;
    sessionStore.delete(key);
  }
};
class SupabaseManager {
  supabaseClient = null;
  pendingOAuthSource = void 0;
  initialized = false;
  presenceChannel = null;
  presenceKey = null;
  dailyActiveInterval = null;
  initPresenceTimeout = null;
  initDailyActiveTimeout = null;
  isReportingDailyActive = false;
  lastReportTimestamp = 0;
  retryTimeout = null;
  /**
   * 初始化 Supabase 客户端（异步）
   */
  async initialize() {
    if (this.initialized) {
      console.warn("[SupabaseManager] Already initialized");
      return;
    }
    await initializeStore();
    this.supabaseClient = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: electronStorage
        // 使用 electron-store 持久化
      }
    });
    this.supabaseClient.auth.onAuthStateChange((event, _session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        this.getUserInfo().then((userInfo) => {
          mainEventBus.m.emit("auth:userInfoUpdate", userInfo);
        });
        this.reportDailyActive();
      } else if (event === "SIGNED_OUT") {
        mainEventBus.m.emit("auth:userInfoUpdate", null);
      }
    });
    this.initializeIpcHandlers();
    this.initialized = true;
    this.restoreSessionOnStartup();
    this.initPresenceTimeout = setTimeout(() => {
      this.initializePresence().catch((error) => {
        console.error("[SupabaseManager] Failed to initialize presence:", error);
      });
    }, 3e3);
    this.initDailyActiveTimeout = setTimeout(() => {
      this.setupDailyActiveReporting();
    }, 5e3);
  }
  /**
   * 应用启动时恢复 session
   */
  async restoreSessionOnStartup() {
    try {
      const { data, error } = await this.supabaseClient.auth.getSession();
      if (error) {
        console.error("[SupabaseManager] ❌ Failed to restore session:", error.message);
        mainEventBus.m.emit("auth:userInfoUpdate", null);
        return;
      }
      if (data.session) {
        console.log(`[SupabaseManager]   ✓ Session restored: ${data.session.user?.email}`);
        const userInfo = await this.getUserInfo();
        mainEventBus.m.emit("auth:userInfoUpdate", userInfo);
        this.triggerOsDistribute("session restore");
      } else {
        mainEventBus.m.emit("auth:userInfoUpdate", null);
      }
    } catch (error) {
      console.error("[SupabaseManager] ❌ 恢复 session 异常:", error);
      mainEventBus.m.emit("auth:userInfoUpdate", null);
    }
  }
  triggerOsDistribute(context) {
    callOsDistribute().then((result) => {
      if (result.success) ;
      else {
        console.warn(`[SupabaseManager] ⚠️ os-distribute failed (${context}):`, result.error);
      }
    }).catch((error) => {
      console.error(`[SupabaseManager] ❌ os-distribute exception (${context}):`, error);
    });
  }
  async onOAuthLoginSuccess(url) {
    if (!this.supabaseClient) {
      console.error("[SupabaseManager] Supabase client not initialized");
      return;
    }
    try {
      const urlObj = new URL(url);
      let loginSuccess = false;
      let oauthProvider = "unknown";
      if (url.includes("google")) oauthProvider = "google";
      else if (url.includes("github")) oauthProvider = "github";
      else if (url.includes("twitter") || url.includes("x.com")) oauthProvider = "twitter";
      const code = urlObj.searchParams.get("code");
      if (code) {
        const { error } = await this.supabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[Auth Flow] exchangeCodeForSession error:", error);
        } else {
          loginSuccess = true;
        }
      } else if (urlObj.hash && urlObj.hash.includes("access_token=")) {
        const params = new URLSearchParams(urlObj.hash.replace(/^#/, ""));
        const access_token = params.get("access_token") || "";
        const refresh_token = params.get("refresh_token") || "";
        if (access_token && refresh_token) {
          try {
            const { error } = await this.supabaseClient.auth.setSession({
              access_token,
              refresh_token
            });
            if (error) {
              console.error("[Auth Flow] setSession error:", error);
            } else {
              loginSuccess = true;
            }
          } catch (e) {
            console.error("[Auth Flow] Failed to set session:", e);
          }
        }
      } else {
        await this.supabaseClient.auth.getSession();
      }
      if (loginSuccess) {
        this.trackAuthEvent("user_login", { method: oauthProvider });
        this.triggerOsDistribute("OAuth user");
        mainEventBus.m.emit("auth:loginSuccess", { source: this.pendingOAuthSource });
        this.pendingOAuthSource = void 0;
      }
    } catch (e) {
      console.error("[Auth Flow] Failed to process OAuth redirect:", e);
      this.pendingOAuthSource = void 0;
    }
  }
  initializeIpcHandlers() {
    electron.ipcMain.handle("auth:login", async (_event, params) => {
      try {
        if (isRegisterParams(params)) {
          const response = await this.signUp(params.email, params.password);
          if (response.error) {
            return { success: false, error: response.error.message };
          }
          if (response.data.user && response.data.user.identities && response.data.user.identities.length === 0) {
            console.log("[SupabaseManager] 该账号已注册过");
            return {
              success: false,
              error: "该账号已注册过，请直接登录",
              userAlreadyExists: true
            };
          }
          if (response.data.user) {
            this.trackAuthEvent("user_registered", { method: "email" });
            console.log("[SupabaseManager] 注册成功，需要邮箱验证");
            return { success: true, needsVerification: true };
          }
        } else if (isVerifyOtpParams(params)) {
          const verifyResponse = await this.verifyOtp(params.email, params.token, "email");
          if (verifyResponse.error) {
            return { success: false, error: verifyResponse.error.message };
          }
          console.log("[SupabaseManager] OTP 验证成功，开始登录");
          const loginResponse = await this.signInWithPassword(params.email, params.password);
          if (loginResponse.error) {
            return { success: false, error: loginResponse.error.message };
          }
          this.trackAuthEvent("user_login", { method: "email" });
          this.triggerOsDistribute("registration");
          mainEventBus.m.emit("auth:loginSuccess", { source: params.source });
          return { success: true };
        } else if (isEmailAuthParams(params)) {
          const response = await this.signInWithPassword(params.email, params.password);
          if (response.error) {
            return { success: false, error: response.error.message };
          }
          this.trackAuthEvent("user_login", { method: "email" });
          this.triggerOsDistribute("email login");
          mainEventBus.m.emit("auth:loginSuccess", { source: params.source });
          return { success: true };
        } else if (isOAuthAuthParams(params)) {
          const response = await this.signInWithOAuth(params.provider);
          if (response.error) {
            return { success: false, error: response.error.message };
          }
          const url = response.data.url;
          if (url) {
            this.pendingOAuthSource = params.source;
            const { oauthPopupManager } = await Promise.resolve().then(() => require("./index-DwDWcaDA.js"));
            console.log("[SupabaseManager] Opening OAuth popup for:", params.provider, "source:", params.source);
            oauthPopupManager.openOAuthPopup(url).then((success) => {
              console.log("[SupabaseManager] OAuth popup result:", success);
              if (!success) {
                this.pendingOAuthSource = void 0;
              }
            });
            return { success: true };
          }
          return { success: false, error: "Failed to get OAuth URL" };
        } else if (isRequestPasswordResetParams(params)) {
          const response = await this.requestPasswordReset(params.email);
          if (response.error) {
            return { success: false, error: response.error.message };
          }
          return { success: true, message: "Verification code sent to your email" };
        } else if (isResetPasswordParams(params)) {
          const response = await this.resetPasswordWithOtp(
            params.email,
            params.token,
            params.newPassword
          );
          if (response.error) {
            return { success: false, error: response.error.message };
          }
          return { success: true };
        }
        return { success: false, error: "Invalid login parameters" };
      } catch (error) {
        console.error("[SupabaseManager] Login error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Authentication failed"
        };
      }
    });
    electron.ipcMain.on("auth:logout", async () => {
      this.trackAuthEvent("user_logout");
      await this.signOut();
    });
    electron.ipcMain.handle("auth:getUserInfo", () => {
      return this.getUserInfo();
    });
    electron.ipcMain.handle("auth:getAccessToken", async () => {
      try {
        const session = await this.getSession();
        return session?.access_token || null;
      } catch (error) {
        console.error("[SupabaseManager] Error getting access token:", error);
        return null;
      }
    });
    electron.ipcMain.handle(
      "auth:syncSession",
      async (_event, session) => {
        if (!this.supabaseClient) {
          console.warn("[SupabaseManager] Client not initialized, cannot sync session");
          return;
        }
        if (session) {
          const currentSession = await this.supabaseClient.auth.getSession();
          if (currentSession.data.session?.user?.id === session.user?.id) {
            return;
          }
          console.log("[SupabaseManager] 收到渲染进程 session 同步:", {
            user: session.user?.email,
            expiresAt: session.expires_at,
            hasAccessToken: !!session.access_token,
            hasRefreshToken: !!session.refresh_token
          });
          try {
            console.log("[SupabaseManager] 开始调用 setSession...");
            const { error } = await this.supabaseClient.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
            if (error) {
              console.error("[SupabaseManager] ⚠️ setSession 失败，但保留现有 session:", error.message);
            } else {
              console.log("[SupabaseManager] ✅ setSession 调用成功");
            }
          } catch (error) {
            console.error("[SupabaseManager] ⚠️ Session 同步异常，但保留现有 session:", error);
          }
        } else {
          console.log("[SupabaseManager] 渲染进程请求清除 session");
          await this.supabaseClient.auth.signOut();
        }
      }
    );
  }
  /**
   * 获取 Supabase 客户端，这个客户端应该只用于调用supabase的API，不用于管理认证状态如signIn, signOut等
   *
   * 认证状态由主窗口的渲染进程管理，通过ipc同步到主进程
   */
  getClient() {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    return this.supabaseClient;
  }
  /**
   * 获取当前认证数据
   */
  async getSession() {
    if (!this.supabaseClient) {
      console.warn("[SupabaseManager] getSession: Client not initialized");
      return null;
    }
    const { data, error } = await this.supabaseClient.auth.getSession();
    if (error) {
      console.error("[SupabaseManager] Error getting current auth data:", error);
      return null;
    }
    const session = data.session;
    return session;
  }
  destroy() {
    if (this.dailyActiveInterval) {
      clearInterval(this.dailyActiveInterval);
      this.dailyActiveInterval = null;
    }
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    if (this.initPresenceTimeout) {
      clearTimeout(this.initPresenceTimeout);
      this.initPresenceTimeout = null;
    }
    if (this.initDailyActiveTimeout) {
      clearTimeout(this.initDailyActiveTimeout);
      this.initDailyActiveTimeout = null;
    }
    if (this.presenceChannel && this.supabaseClient) {
      this.cleanupPresence().catch((error) => {
        console.error("[SupabaseManager] Error during cleanup in destroy:", error);
      });
    }
    this.supabaseClient = null;
    this.initialized = false;
  }
  async getUserInfo() {
    const userResponse = await this.supabaseClient?.auth.getUser();
    const userMetadata = userResponse?.data?.user?.user_metadata || null;
    if (!userMetadata) {
      console.log("[SupabaseManager] No user metadata found, returning null");
      return null;
    }
    let remainingCredits = 0;
    let totalCredits = 0;
    let subscriptionType;
    try {
      const userId = userResponse?.data?.user?.id;
      if (userId) {
        const result = await getUserCredits();
        if (result.success) {
          remainingCredits = result.remainingCredits ?? 0;
          totalCredits = result.totalCredits ?? 0;
          subscriptionType = result.subscriptionType ?? void 0;
        } else {
          console.error("[SupabaseManager] Failed to fetch credits:", result.error);
        }
      } else {
        console.log("[SupabaseManager] No user ID available, skipping credit fetch");
      }
    } catch (error) {
      console.error("[SupabaseManager] Error fetching credits (exception):", error);
    }
    return {
      ...userMetadata,
      remaining_credits: remainingCredits,
      total_credits: totalCredits,
      subscription_type: subscriptionType
    };
  }
  async signUp(email, password) {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    const response = await this.supabaseClient.auth.signUp({
      email,
      password
    });
    console.log("[SupabaseManager] 注册响应:", response);
    if (response?.error) {
      console.error("[SupabaseManager] Error signing up:", response.error);
    }
    if (response?.error && response.error.message.includes("Unexpected status code returned from hook: 403")) {
      response.error.message = "This email address is flagged as risky. Please use a different email address.";
    }
    return response;
  }
  async verifyOtp(email, token, type) {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    const response = await this.supabaseClient.auth.verifyOtp({
      email,
      token,
      type: type === "email" ? "email" : "sms"
    });
    if (response?.error) {
      console.error("[SupabaseManager] Error verifying OTP:", response.error);
    }
    return response;
  }
  async signInWithPassword(email, password) {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    const response = await this.supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (response?.error) {
      console.error("[SupabaseManager] Error signing in with password:", response.error);
    }
    return response;
  }
  async signInWithOAuth(provider) {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    const response = await this.supabaseClient.auth.signInWithOAuth({
      provider
    });
    if (response?.error) {
      console.error("[SupabaseManager] Error signing in with OAuth:", response.error);
    }
    return response;
  }
  async signOut() {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    const response = await this.supabaseClient.auth.signOut();
    if (response?.error) {
      console.error("[SupabaseManager] Error signing out:", response.error);
    }
  }
  async requestPasswordReset(email) {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    console.log("[SupabaseManager] 📧 发送密码重置邮件到:", email);
    const { data, error } = await this.supabaseClient.auth.resetPasswordForEmail(email);
    if (error) {
      console.error("[SupabaseManager] ❌ 发送密码重置邮件失败:", error);
      console.error("[SupabaseManager] 错误详情:", {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name
      });
      return { error };
    }
    console.log("[SupabaseManager] ✅ 密码重置邮件已发送");
    console.log("[SupabaseManager] 📦 完整响应:", data);
    console.log("[SupabaseManager] 💡 如果收不到邮件，请检查：");
    console.log("[SupabaseManager] 1. Supabase Dashboard → Authentication → Email Templates → Reset Password");
    console.log("[SupabaseManager] 2. 检查垃圾邮件文件夹");
    console.log("[SupabaseManager] 3. 确认邮箱地址已注册:", email);
    return {};
  }
  async resetPasswordWithOtp(email, token, newPassword) {
    if (!this.supabaseClient) {
      throw new Error("Supabase client not initialized");
    }
    console.log("[SupabaseManager] 🔐 验证 OTP 并重置密码");
    console.log("[SupabaseManager] 邮箱:", email, "验证码长度:", token.length);
    const verifyResponse = await this.supabaseClient.auth.verifyOtp({
      email,
      token,
      type: "recovery"
      // 使用 'recovery' 类型（对应 resetPasswordForEmail）
    });
    console.log("[SupabaseManager] 验证响应:", {
      hasError: !!verifyResponse.error,
      hasUser: !!verifyResponse.data?.user,
      hasSession: !!verifyResponse.data?.session
    });
    if (verifyResponse.error) {
      console.error("[SupabaseManager] ❌ OTP 验证失败:", verifyResponse.error);
      return { error: verifyResponse.error };
    }
    console.log("[SupabaseManager] ✅ OTP 验证成功，用户已登录");
    const updateResponse = await this.supabaseClient.auth.updateUser({
      password: newPassword
    });
    if (updateResponse.error) {
      console.error("[SupabaseManager] 更新密码失败:", updateResponse.error);
      return { error: updateResponse.error };
    }
    console.log("[SupabaseManager] 密码重置成功");
    await this.supabaseClient.auth.signOut();
    console.log("[SupabaseManager] 已登出，请用新密码登录");
    return {};
  }
  /**
   * 追踪认证相关事件
   */
  trackAuthEvent(event, properties) {
    Promise.resolve().then(() => require("./posthogService-khJWbAtc.js")).then(({ posthogService }) => {
      posthogService.track(event, properties);
    }).catch((error) => {
      console.error("[SupabaseManager] Failed to track auth event:", error);
    });
    if (event === "user_registered") {
      try {
        const allWindows = electron.BrowserWindow.getAllWindows();
        allWindows.forEach((win) => {
          if (win && !win.isDestroyed()) {
            win.webContents.send("facebook-pixel:track", "CompleteRegistration", {
              method: properties?.method || "unknown"
            });
          }
        });
        console.log("[SupabaseManager] Facebook Pixel CompleteRegistration event sent");
      } catch (error) {
        console.error("[SupabaseManager] Failed to send Facebook Pixel event:", error);
      }
    }
  }
  /**
   * 初始化 Realtime Presence
   * 让当前客户端加入 online-users 频道并上报在线状态
   */
  async initializePresence() {
    if (!this.supabaseClient) {
      console.warn("[SupabaseManager] Client not initialized, skipping presence");
      return;
    }
    try {
      const { analyticsIdentityManager } = await Promise.resolve().then(() => require("./identityManager-BCbqUN0U.js"));
      this.presenceKey = await analyticsIdentityManager.getDistinctId();
      this.presenceChannel = this.supabaseClient.channel("online-users", {
        config: {
          presence: {
            key: this.presenceKey
          }
        }
      });
      this.presenceChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { app } = await import("electron");
          await this.presenceChannel.track({
            online_at: (/* @__PURE__ */ new Date()).toISOString(),
            app_version: app.getVersion(),
            platform: process.platform,
            arch: process.arch,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: app.getLocale()
          });
        } else if (status === "CHANNEL_ERROR") {
          console.error("[SupabaseManager] ❌ Presence channel error");
        } else if (status === "TIMED_OUT") {
          console.error("[SupabaseManager] ⏱️ Presence subscription timeout");
        }
      });
    } catch (error) {
      console.error("[SupabaseManager] ❌ Failed to initialize presence:", error);
    }
  }
  /**
   * 清理 Presence 连接
   * 在应用退出时调用
   */
  async reportFinalDailyActive() {
    this.isReportingDailyActive = false;
    this.lastReportTimestamp = 0;
    await this.reportDailyActive();
  }
  async cleanupPresence() {
    if (!this.presenceChannel || !this.supabaseClient) {
      return;
    }
    try {
      console.log("[SupabaseManager] 🔄 Cleaning up presence channel...");
      await this.supabaseClient.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
      console.log("[SupabaseManager] ✅ Presence channel cleaned up");
    } catch (error) {
      console.error("[SupabaseManager] ❌ Failed to cleanup presence:", error);
    }
  }
  async reportDailyActive() {
    if (!this.supabaseClient) {
      return;
    }
    if (this.isReportingDailyActive) {
      return;
    }
    this.isReportingDailyActive = true;
    try {
      const { data: { session } } = await this.supabaseClient.auth.getSession();
      if (!session?.user?.id) {
        this.isReportingDailyActive = false;
        return;
      }
      const { app } = await import("electron");
      const now = /* @__PURE__ */ new Date();
      const nowTimestamp = now.getTime();
      const nowISO = now.toISOString();
      const activityDate = nowISO.split("T")[0];
      if (this.lastReportTimestamp > 0) {
        const timeSinceLastReport = nowTimestamp - this.lastReportTimestamp;
        if (timeSinceLastReport < 6e4) {
          this.isReportingDailyActive = false;
          return;
        }
      }
      let firstActiveAt = nowISO;
      try {
        const existingRecord = await this.supabaseClient.from("os_user_active").select("first_active_at").eq("user_id", session.user.id).eq("activity_date", activityDate).single();
        if (existingRecord.data?.first_active_at) {
          firstActiveAt = existingRecord.data.first_active_at;
        }
      } catch (selectError) {
        if (selectError?.code !== "PGRST116") {
          console.warn("[SupabaseManager] Query existing record failed:", selectError);
        }
      }
      const recordData = {
        user_id: session.user.id,
        activity_date: activityDate,
        first_active_at: firstActiveAt,
        last_active_at: nowISO,
        app_version: app.getVersion(),
        platform: process.platform
      };
      const { error } = await this.supabaseClient.from("os_user_active").upsert(recordData, {
        onConflict: "user_id,activity_date",
        ignoreDuplicates: false
      });
      if (error) {
        console.error("[SupabaseManager] Failed to report daily active:", error);
        if (this.retryTimeout) {
          clearTimeout(this.retryTimeout);
        }
        this.retryTimeout = setTimeout(() => {
          this.retryTimeout = null;
          this.reportDailyActive();
        }, 6e4);
      } else {
        this.lastReportTimestamp = nowTimestamp;
      }
    } catch (error) {
      console.error("[SupabaseManager] Exception in reportDailyActive:", error);
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }
      this.retryTimeout = setTimeout(() => {
        this.retryTimeout = null;
        this.reportDailyActive();
      }, 6e4);
    } finally {
      this.isReportingDailyActive = false;
    }
  }
  setupDailyActiveReporting() {
    if (!this.supabaseClient) {
      return;
    }
    this.reportDailyActive();
    this.dailyActiveInterval = setInterval(() => {
      this.reportDailyActive();
    }, 30 * 60 * 1e3);
    console.log("[SupabaseManager] Daily active reporting initialized (30min interval)");
  }
}
const supabaseManager = new SupabaseManager();
const supabaseManager$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, supabaseManager }, Symbol.toStringTag, { value: "Module" }));
exports.F = FLOWITH_WEBSITE_URL;
exports.O = OAUTH_CALLBACK_HOSTS;
exports.a = awardCredits;
exports.b = setHasInvitationCodes;
exports.c = getFlowithWebsiteUrl;
exports.d = getHasInvitationCodes;
exports.e = config;
exports.f = supabaseManager$1;
exports.g = getWorkerURL;
exports.s = supabaseManager;
exports.u = user;
