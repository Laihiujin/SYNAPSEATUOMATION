"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const config = require("./supabaseManager-BAbRVJxx.js"), log = require("electron-log");
require("@supabase/supabase-js"), require("electron"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
log.transports.console.level = false;
async function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  try {
    const session = await config.s.getSession();
    if (session?.access_token) {
      ;
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    const hasToken = Boolean(session?.access_token);
    log.info("[AppUpdateAPI] getAuthHeaders", { hasToken });
  } catch {
  }
  return headers;
}
async function getUserAccess() {
  try {
    const headers = await getAuthHeaders();
    const url = `${config.g()}/app_update/user/access?app_id=flowith-browser`;
    log.info("[AppUpdateAPI] GET /app_update/user/access", { url });
    const res = await fetch(url, { method: "GET", headers });
    log.info("[AppUpdateAPI] user/access status", { status: res.status });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const rawLog = {
      channels: data?.channels,
      currentChannel: data?.currentChannel
    };
    log.info("[AppUpdateAPI] user/access raw", rawLog);
    const rawChannels = Array.isArray(data?.channels) ? data.channels : [];
    const isValidChannel = (ch) => ch === "stable" || ch === "beta" || ch === "alpha";
    const normalizedChannels = rawChannels.filter(isValidChannel);
    const channels = normalizedChannels.length > 0 ? normalizedChannels : ["stable"];
    const currentChannel = isValidChannel(data?.currentChannel) ? data.currentChannel : "stable";
    log.info("[AppUpdateAPI] user/access normalized", { channels, currentChannel });
    return { channels, currentChannel, latest: data?.latest };
  } catch (error) {
    log.warn("[AppUpdateAPI] user/access failed, fallback to stable", {
      error: error instanceof Error ? error.message : String(error)
    });
    console.warn("[AppUpdateAPI] user/access failed, fallback to stable");
    return { channels: ["stable"], currentChannel: "stable" };
  }
}
async function setUserChannel(channel) {
  try {
    const headers = await getAuthHeaders();
    const hasAuth = typeof headers === "object" && headers !== null && "Authorization" in headers;
    log.info("[AppUpdateAPI] POST /app_update/user/channel", { channel, hasAuth });
    const res = await fetch(`${config.g()}/app_update/user/channel`, {
      method: "POST",
      headers,
      body: JSON.stringify({ appId: "flowith-browser", channel })
    });
    log.info("[AppUpdateAPI] setUserChannel status", { status: res.status });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      log.warn("[AppUpdateAPI] setUserChannel failed", { status: res.status, text: text?.slice(0, 200) });
      console.warn("[AppUpdateAPI] setUserChannel failed:", res.status, (text || "").slice(0, 200));
      return { success: false, error: `HTTP ${res.status}: ${text || res.statusText}` };
    }
    await res.text().catch(() => {
    });
    log.info("[AppUpdateAPI] setUserChannel success", { channel });
    return { success: true };
  } catch (error) {
    log.error("[AppUpdateAPI] setUserChannel exception", {
      error: error instanceof Error ? error.message : String(error)
    });
    console.error("[AppUpdateAPI] setUserChannel exception:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
exports.getUserAccess = getUserAccess;
exports.setUserChannel = setUserChannel;
