"use strict";
const electron = require("electron"), path = require("path"), fs = require("fs"), crypto = require("crypto");
let pendingUrls = [];
let earlyListener = null;
let directListenerInstalled = false;
function installEarlyOpenUrlListener() {
  if (process.platform !== "darwin") return;
  if (earlyListener || directListenerInstalled) return;
  earlyListener = (event, url) => {
    event.preventDefault();
    pendingUrls.push(url);
  };
  electron.app.on("open-url", earlyListener);
}
function switchOpenUrlToDirect(directHandler) {
  if (process.platform !== "darwin") return [];
  if (earlyListener) {
    electron.app.removeListener("open-url", earlyListener);
    earlyListener = null;
  }
  if (!directListenerInstalled) {
    electron.app.on("open-url", (event, url) => {
      event.preventDefault();
      directHandler(url);
    });
    directListenerInstalled = true;
  }
  const urls = pendingUrls;
  pendingUrls = [];
  return urls;
}
class CertificateManager {
  policy;
  policyPath;
  sessionExceptions = /* @__PURE__ */ new Map();
  constructor() {
    this.policyPath = path.join(electron.app.getPath("userData"), "certificate-policy.json");
    this.policy = this.loadPolicy();
    this.registerCertificateHandler();
  }
  /**
   * 加载证书策略
   */
  loadPolicy() {
    if (fs.existsSync(this.policyPath)) {
      try {
        const data = fs.readFileSync(this.policyPath, "utf8");
        return JSON.parse(data);
      } catch (error) {
        console.error("[CertificateManager] Failed to load policy:", error);
      }
    }
    return {
      allowExpiredCerts: false,
      allowSelfSignedCerts: false,
      allowInvalidAuthority: false,
      trustedDomains: [],
      exceptions: []
    };
  }
  /**
   * 保存证书策略
   */
  savePolicy() {
    try {
      fs.writeFileSync(this.policyPath, JSON.stringify(this.policy, null, 2));
    } catch (error) {
      console.error("[CertificateManager] Failed to save policy:", error);
    }
  }
  /**
   * 获取证书指纹
   */
  getCertificateFingerprint(certificate) {
    const maybeRaw = certificate;
    const raw = maybeRaw.rawDER || maybeRaw.data;
    if (raw && Buffer.isBuffer(raw)) {
      return crypto.createHash("sha256").update(raw).digest("hex");
    }
    const fallback = [
      certificate.issuerName,
      certificate.subjectName,
      String(certificate.serialNumber || ""),
      String(certificate.validStart || ""),
      String(certificate.validExpiry || "")
    ].join("|");
    return crypto.createHash("sha256").update(fallback).digest("hex");
  }
  /**
   * 检查是否为已知的证书异常
   */
  isKnownException(hostname, certificate) {
    const fingerprint = this.getCertificateFingerprint(certificate);
    return this.policy.exceptions.some(
      (exception) => exception.hostname === hostname && exception.fingerprint === fingerprint && exception.userApproved
    );
  }
  /**
   * 添加证书异常
   */
  addException(hostname, certificate, userApproved) {
    const fingerprint = this.getCertificateFingerprint(certificate);
    this.policy.exceptions = this.policy.exceptions.filter(
      (e) => !(e.hostname === hostname && e.fingerprint === fingerprint)
    );
    this.policy.exceptions.push({
      hostname,
      fingerprint,
      expiryDate: certificate.validExpiry,
      addedDate: Date.now(),
      userApproved
    });
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    this.policy.exceptions = this.policy.exceptions.filter((e) => e.addedDate > thirtyDaysAgo);
    this.savePolicy();
  }
  /**
   * 检查是否为受信任的域名
   */
  isTrustedDomain(hostname) {
    return this.policy.trustedDomains.some((domain) => {
      if (domain.startsWith("*.")) {
        const baseDomain = domain.slice(2);
        return hostname.endsWith(baseDomain);
      }
      return hostname === domain;
    });
  }
  /**
   * 处理证书错误的核心逻辑
   */
  async handleCertificateError(url, error, certificate) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const localHosts = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
    if (!electron.app.isPackaged && localHosts.includes(hostname)) {
      console.log(`[CertificateManager] Allowing local development host: ${hostname}`);
      return true;
    }
    if (this.isTrustedDomain(hostname)) {
      console.log(`[CertificateManager] Trusted domain: ${hostname}`);
      return true;
    }
    if (this.isKnownException(hostname, certificate)) {
      console.log(`[CertificateManager] Known exception: ${hostname}`);
      return true;
    }
    const sessionKey = `${hostname}:${this.getCertificateFingerprint(certificate)}`;
    if (this.sessionExceptions.get(sessionKey)) {
      return true;
    }
    let shouldAllow = false;
    let errorMessage = "";
    switch (error) {
      case "net::ERR_CERT_DATE_INVALID":
        errorMessage = "The certificate has expired or is not yet valid";
        shouldAllow = this.policy.allowExpiredCerts;
        break;
      case "net::ERR_CERT_AUTHORITY_INVALID":
        errorMessage = "The certificate authority is not trusted";
        shouldAllow = this.policy.allowInvalidAuthority;
        break;
      case "net::ERR_CERT_COMMON_NAME_INVALID":
        errorMessage = "The certificate does not match the domain";
        shouldAllow = false;
        break;
      case "net::ERR_CERT_WEAK_SIGNATURE_ALGORITHM":
        errorMessage = "The certificate uses a weak signature algorithm";
        shouldAllow = false;
        break;
      default:
        errorMessage = `Certificate error: ${error}`;
        shouldAllow = false;
    }
    if (!shouldAllow && !electron.app.isPackaged) {
      const result = await this.promptUser(hostname, errorMessage, certificate);
      if (result === "allow-once") {
        this.sessionExceptions.set(sessionKey, true);
        return true;
      } else if (result === "allow-always") {
        this.addException(hostname, certificate, true);
        return true;
      }
    }
    console.warn(`[CertificateManager] Rejected certificate for ${hostname}: ${error}`);
    console.warn(`[CertificateManager] Issuer: ${certificate.issuerName}`);
    console.warn(`[CertificateManager] Subject: ${certificate.subjectName}`);
    return shouldAllow;
  }
  /**
   * 提示用户处理证书错误
   */
  async promptUser(hostname, errorMessage, certificate) {
    if (electron.app.isPackaged) {
      return "deny";
    }
    const result = await electron.dialog.showMessageBox({
      type: "warning",
      title: "Certificate Error",
      message: `The website "${hostname}" has a certificate problem.`,
      detail: `${errorMessage}

Issuer: ${certificate.issuerName}
Subject: ${certificate.subjectName}

Do you want to proceed anyway?`,
      buttons: ["Cancel", "Continue This Time", "Always Trust This Certificate"],
      defaultId: 0,
      cancelId: 0,
      noLink: true
    });
    switch (result.response) {
      case 1:
        return "allow-once";
      case 2:
        return "allow-always";
      default:
        return "deny";
    }
  }
  /**
   * 注册证书错误处理器
   */
  registerCertificateHandler() {
    electron.app.on("certificate-error", async (event, _webContents, url, error, certificate, callback) => {
      event.preventDefault();
      try {
        const shouldAllow = await this.handleCertificateError(url, error, certificate);
        callback(shouldAllow);
      } catch (err) {
        console.error("[CertificateManager] Error handling certificate:", err);
        callback(false);
      }
    });
  }
  /**
   * 更新证书策略
   */
  updatePolicy(updates) {
    this.policy = { ...this.policy, ...updates };
    this.savePolicy();
  }
  /**
   * 添加受信任的域名
   */
  addTrustedDomain(domain) {
    if (!this.policy.trustedDomains.includes(domain)) {
      this.policy.trustedDomains.push(domain);
      this.savePolicy();
    }
  }
  /**
   * 移除受信任的域名
   */
  removeTrustedDomain(domain) {
    this.policy.trustedDomains = this.policy.trustedDomains.filter((d) => d !== domain);
    this.savePolicy();
  }
  /**
   * 清除所有会话级别的异常
   */
  clearSessionExceptions() {
    this.sessionExceptions.clear();
  }
  /**
   * 获取当前策略
   */
  getPolicy() {
    return { ...this.policy };
  }
}
const certificateManager = new CertificateManager();
exports.c = certificateManager;
exports.i = installEarlyOpenUrlListener;
exports.s = switchOpenUrlToDirect;
