"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const https = require("https"), http = require("http"), electron = require("electron"), config = require("./supabaseManager-BAbRVJxx.js");
require("@supabase/supabase-js"), require("./mainEventBus-D2ZkkKhI.js"), require("mitt");
function getGeminiProxyBaseURL() {
  const url = process.env.OS_AI_PROXY_BASE_URL || "https://os-ai-proxy.flowith.net";
  return url;
}
class GeminiProxyClient {
  getBaseURL() {
    const url = getGeminiProxyBaseURL();
    return url;
  }
  constructor() {
  }
  /**
   * 获取当前用户的认证 Token
   */
  async getAuthToken() {
    try {
      const client = config.s.getClient();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token || null;
      if (!token) {
        console.error("[GeminiProxyClient] ❌ Token 为空");
      }
      return token;
    } catch (error) {
      console.error("[GeminiProxyClient] ❌ 获取 auth token 失败:", error);
      return null;
    }
  }
  /**
   * 调用 Gemini Proxy API
   */
  async generateContent(request, signal) {
    const baseURL = this.getBaseURL();
    const token = await this.getAuthToken();
    if (!token) {
      console.error("[GeminiProxyClient] ❌ 认证失败: 无 token");
      throw new Error("User not authenticated");
    }
    const url = new URL(`${baseURL}/gemini-proxy`);
    const isHttps = url.protocol === "https:";
    const httpModule = isHttps ? https : http;
    const requestData = JSON.stringify(request);
    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname,
        method: "POST",
        headers: {
          Authorization: token,
          // 直接传 token，不加 Bearer
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
          "x-client-version": electron.app.getVersion()
        }
      };
      const req = httpModule.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            if (res.statusCode === 200) {
              const response = JSON.parse(data);
              resolve(response);
            } else {
              console.error("[GeminiProxyClient] ❌ 请求失败:", res.statusCode);
              console.error("  - Response:", data.substring(0, 200));
              reject(new Error(`Gemini Proxy API error: ${res.statusCode} - ${data}`));
            }
          } catch (error) {
            console.error("[GeminiProxyClient] ❌ 解析失败:", error.message);
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });
      if (signal) {
        signal.addEventListener("abort", () => {
          req.destroy();
          reject(new Error("Request aborted"));
        });
      }
      req.on("error", (error) => {
        console.error("[GeminiProxyClient] ❌ 网络错误:", error.message);
        reject(new Error(`Request error: ${error.message}`));
      });
      req.setTimeout(12e4, () => {
        req.destroy();
        reject(new Error("Request timeout (120s)"));
      });
      req.write(requestData);
      req.end();
    });
  }
}
const geminiProxyClient = new GeminiProxyClient();
exports.GeminiProxyClient = GeminiProxyClient;
exports.geminiProxyClient = geminiProxyClient;
