"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron"), config = require("./supabaseManager-BAbRVJxx.js"), userAgentUtils = require("./userAgentUtils-DJa5NphP.js");
require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
class OAuthPopupManager {
  static instance = null;
  popupWindow = null;
  constructor() {
  }
  static getInstance() {
    if (!OAuthPopupManager.instance) {
      OAuthPopupManager.instance = new OAuthPopupManager();
    }
    return OAuthPopupManager.instance;
  }
  /**
   * 打开 OAuth 登录弹窗
   */
  openOAuthPopup(url) {
    return new Promise((resolve) => {
      let isResolved = false;
      const resolveOnce = (value) => {
        if (isResolved) return;
        isResolved = true;
        resolve(value);
      };
      if (this.popupWindow && !this.popupWindow.isDestroyed()) {
        this.popupWindow.close();
      }
      this.popupWindow = new electron.BrowserWindow({
        width: 500,
        height: 700,
        center: true,
        resizable: true,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true
        },
        title: "Sign in",
        autoHideMenuBar: true
      });
      console.log("[OAuthPopup] Opening OAuth popup window for URL:", url);
      const popupWindow = this.popupWindow;
      const contents = popupWindow.webContents;
      const popupSession = contents.session;
      const fallbackPopupUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
      const sanitizedInitialUA = userAgentUtils.r(contents.getUserAgent());
      const basePopupUserAgent = sanitizedInitialUA.includes("Electron/") ? fallbackPopupUserAgent : sanitizedInitialUA;
      const googleOAuthPopupUserAgent = userAgentUtils.e(basePopupUserAgent);
      let activePopupUserAgent = basePopupUserAgent;
      let isPopupDestroyed = false;
      let forceGoogleOAuthUserAgent = false;
      const resolveDesiredUserAgent = (targetUrl) => {
        if (targetUrl && userAgentUtils.i(targetUrl)) {
          forceGoogleOAuthUserAgent = true;
        }
        return forceGoogleOAuthUserAgent ? googleOAuthPopupUserAgent : basePopupUserAgent;
      };
      const applyPopupUserAgentForUrl = (targetUrl) => {
        if (isPopupDestroyed || contents.isDestroyed()) {
          return;
        }
        const desiredUserAgent = resolveDesiredUserAgent(targetUrl);
        if (desiredUserAgent !== activePopupUserAgent) {
          try {
            contents.setUserAgent(desiredUserAgent);
            activePopupUserAgent = desiredUserAgent;
            console.log("[OAuthPopup] Popup User-Agent updated", {
              usesGoogleOAuthUA: desiredUserAgent === googleOAuthPopupUserAgent
            });
          } catch (error) {
            console.warn("[OAuthPopup] Failed to update popup User-Agent:", error);
          }
        }
      };
      try {
        if (!contents.isDestroyed()) {
          contents.setUserAgent(activePopupUserAgent);
          console.log("[OAuthPopup] Popup User-Agent set to base UA");
        }
      } catch (error) {
        console.error("[OAuthPopup] Failed to set initial popup User-Agent:", error);
      }
      const webRequestFilter = { urls: ["*://*/*"] };
      const onBeforeSendHeaders = (requestDetails, callback) => {
        if (isPopupDestroyed || contents.isDestroyed()) {
          callback({ requestHeaders: requestDetails.requestHeaders });
          return;
        }
        const desiredUserAgent = resolveDesiredUserAgent(requestDetails.url);
        if (requestDetails.requestHeaders["User-Agent"] !== desiredUserAgent) {
          requestDetails.requestHeaders["User-Agent"] = desiredUserAgent;
        }
        if (requestDetails.resourceType === "mainFrame" && desiredUserAgent !== activePopupUserAgent) {
          try {
            contents.setUserAgent(desiredUserAgent);
            activePopupUserAgent = desiredUserAgent;
          } catch (error) {
            console.warn(
              "[OAuthPopup] Failed to sync popup User-Agent in onBeforeSendHeaders:",
              error
            );
          }
        }
        callback({ requestHeaders: requestDetails.requestHeaders });
      };
      popupSession.webRequest.onBeforeSendHeaders(webRequestFilter, onBeforeSendHeaders);
      console.log("[OAuthPopup] webRequest interceptor registered for popup");
      popupWindow.loadURL(url);
      applyPopupUserAgentForUrl(url);
      const handleNavigation = (_event, navigatedUrl) => {
        console.log("[OAuthPopup] Navigated to:", navigatedUrl);
        applyPopupUserAgentForUrl(navigatedUrl);
        try {
          const urlObj = new URL(navigatedUrl);
          const hasCode = urlObj.searchParams.has("code");
          const hasAccessTokenInHash = urlObj.hash.includes("access_token=");
          const isAllowedHost = config.O.includes(urlObj.hostname);
          console.log("[OAuthPopup] Navigation check:", {
            hostname: urlObj.hostname,
            hasCode,
            hasAccessTokenInHash,
            isAllowedHost
          });
          if (isAllowedHost && (hasCode || hasAccessTokenInHash)) {
            console.log("[OAuthPopup] ✅ OAuth callback detected, processing...");
            config.s.onOAuthLoginSuccess(navigatedUrl).then(() => {
              console.log("[OAuthPopup] OAuth login success processed");
              resolveOnce(true);
              if (this.popupWindow && !this.popupWindow.isDestroyed()) {
                this.popupWindow.close();
              }
            }).catch((error) => {
              console.error("[OAuthPopup] OAuth login failed:", error);
              resolveOnce(false);
              if (this.popupWindow && !this.popupWindow.isDestroyed()) {
                this.popupWindow.close();
              }
            });
          }
        } catch (error) {
          console.log("[OAuthPopup] Invalid URL, ignoring:", navigatedUrl);
        }
      };
      popupWindow.webContents.on("will-navigate", handleNavigation);
      popupWindow.webContents.on("did-navigate", handleNavigation);
      popupWindow.webContents.on("will-redirect", (_event, redirectUrl) => {
        applyPopupUserAgentForUrl(redirectUrl);
      });
      popupWindow.on("closed", () => {
        console.log("[OAuthPopup] Popup window closed");
        isPopupDestroyed = true;
        try {
          popupSession.webRequest.onBeforeSendHeaders(webRequestFilter, null);
        } catch (error) {
          console.warn("[OAuthPopup] Failed to remove popup webRequest interceptor:", error);
        }
        this.popupWindow = null;
        resolveOnce(false);
      });
      popupWindow.webContents.setWindowOpenHandler((details) => {
        console.log("[OAuthPopup] Window open request:", details.url);
        popupWindow.loadURL(details.url);
        applyPopupUserAgentForUrl(details.url);
        return { action: "deny" };
      });
    });
  }
  /**
   * 关闭当前 OAuth 弹窗
   */
  closePopup() {
    if (this.popupWindow && !this.popupWindow.isDestroyed()) {
      this.popupWindow.close();
    }
  }
  /**
   * 检查是否有打开的弹窗
   */
  hasOpenPopup() {
    return this.popupWindow !== null && !this.popupWindow.isDestroyed();
  }
}
const oauthPopupManager = OAuthPopupManager.getInstance();
exports.oauthPopupManager = oauthPopupManager;
