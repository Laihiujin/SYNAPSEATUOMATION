import { r as reactExports, R as React, j as jsxRuntimeExports, c as clientExports } from "./client-DljuHW-m.js";
import { i as instance, I as I18nextProvider } from "./i18n-BoThyQPF.js";
import { b as formatBytes } from "./format-CX3JBwaj.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { X } from "./x-Xqx6LWQK.js";
import { R as RefreshCw } from "./refresh-cw-DD9cRxA0.js";
import { C as CircleCheckBig, D as Download } from "./download-0fN9YWaY.js";
import { M as Markdown, c as rehypeHighlight, r as remarkGfm } from "./index-CbWv2Sou.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import "./context-CbCu0iMB.js";
import "./createLucideIcon-Dg7FO9tW.js";
import "./theme-sVdefUwF.js";
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
const UpdateDialog = () => {
  const { t } = useTranslation();
  const [state, setState] = reactExports.useState("hidden");
  const [updateInfo, setUpdateInfo] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState({ percent: 0 });
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [isDark, setIsDark] = reactExports.useState(true);
  const [currentChannel, setCurrentChannel] = reactExports.useState("stable");
  const [readyToInstallTimer, setReadyToInstallTimer] = reactExports.useState(null);
  const isInstallingRef = reactExports.useRef(false);
  const isReadyRef = reactExports.useRef(false);
  const updateAPI = window.updateNotification;
  console.log("[UpdateDialog] 组件渲染，当前状态:", state);
  const mapUpdateErrorToFriendly = React.useCallback((info) => {
    const raw = (info.errorMessage || "").toUpperCase();
    const status = info.status;
    const ch = (info.channel || "").toLowerCase();
    const expected = (info.expectedManifest || "").toLowerCase();
    const contains = (s) => raw.includes(s);
    const is403 = status === 403 || contains(" 403 ") || contains("FORBIDDEN");
    const targetIsBetaOrAlpha = ch === "beta" || ch === "alpha" || expected.includes("beta") || expected.includes("alpha");
    if (is403 && targetIsBetaOrAlpha) {
      const channelLabel = ch || (expected.includes("beta") ? "beta" : expected.includes("alpha") ? "alpha" : "beta");
      return {
        message: t("update.error.noChannelPermission", {
          channel: channelLabel
        }),
        suggestSwitchToStable: true
      };
    }
    return { message: info.errorMessage || t("update.error.default"), suggestSwitchToStable: false };
  }, [t]);
  reactExports.useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  reactExports.useEffect(() => {
    console.log("[UpdateDialog] 初始化，开始监听事件");
    if (!window.electron?.ipcRenderer) {
      console.error("[UpdateDialog] window.electron.ipcRenderer 不可用");
      return;
    }
    const handleUpdateInfo = (info) => {
      console.log('[UpdateDialog] 📢 IPC EVENT RECEIVED: "update-info"', info);
      console.log("[UpdateDialog] 📨 收到更新信息:", info);
      console.log("[UpdateDialog] 🔄 切换状态到:", info.type);
      if (readyToInstallTimer) {
        console.log("[UpdateDialog] 🧹 清除之前的定时器");
        clearTimeout(readyToInstallTimer);
        setReadyToInstallTimer(null);
      }
      setUpdateInfo((prev) => ({
        ...prev,
        ...info
      }));
      if (info.type === "ready-to-install") {
        console.log("[UpdateDialog] 🟢 标记已进入 ready-to-install");
        isReadyRef.current = true;
      } else if (info.type === "downloading" || info.type === "update-available" || info.type === "checking") {
        isReadyRef.current = false;
      }
      setState(info.type);
      if (info.type === "error") {
        const mapped = mapUpdateErrorToFriendly(info);
        setError(mapped.message);
      } else {
        setError("");
      }
      if (info.type === "ready-to-install" && window.updateNotificationInternal) {
        window.updateNotificationInternal.sendPromptReceived();
      }
      if (info.type !== "error") ;
    };
    const handleDownloadProgress = (progressData) => {
      if (isReadyRef.current) {
        console.log("[UpdateDialog] ⏭️ 已在 ready-to-install 状态，忽略进度事件");
        return;
      }
      if (isInstallingRef.current) {
        console.log("[UpdateDialog] ⏭️ 正在安装中，忽略进度事件");
        return;
      }
      console.log("[UpdateDialog] 📥 收到下载进度:", {
        percent: progressData.percent,
        transferred: progressData.transferred,
        total: progressData.total,
        transferredMB: Math.round((progressData.transferred ?? 0) / 1024 / 1024) + "MB",
        totalMB: Math.round((progressData.total ?? 0) / 1024 / 1024) + "MB",
        speedKBps: Math.round((progressData.bytesPerSecond ?? 0) / 1024) + "KB/s"
      });
      setProgress(progressData);
      setState((prev) => {
        if (prev === "ready-to-install") {
          console.log("[UpdateDialog] ⏭️ 已经在 ready-to-install 状态，跳过切换");
          return prev;
        }
        console.log("[UpdateDialog] 🔄 切换到 downloading 状态");
        return "downloading";
      });
    };
    window.electron.ipcRenderer.on("update-info", handleUpdateInfo);
    window.electron.ipcRenderer.on("download-progress", handleDownloadProgress);
    console.log("[UpdateDialog] 事件监听器已注册");
    return () => {
      console.log("[UpdateDialog] 清理事件监听器");
      if (readyToInstallTimer) {
        console.log("[UpdateDialog] 🧹 清理组件卸载时的定时器");
        clearTimeout(readyToInstallTimer);
      }
      window.electron?.ipcRenderer?.removeListener("update-info", handleUpdateInfo);
      window.electron?.ipcRenderer?.removeListener("download-progress", handleDownloadProgress);
    };
  }, [readyToInstallTimer, mapUpdateErrorToFriendly]);
  reactExports.useEffect(() => {
    const initChannel = async () => {
      try {
        const cur = await updateAPI.getChannel?.();
        const current = cur?.channel || "stable";
        setCurrentChannel(current);
      } catch {
        setCurrentChannel("stable");
      }
    };
    void initChannel();
  }, [updateAPI]);
  reactExports.useEffect(() => {
    if (updateInfo?.channel && (updateInfo.channel === "stable" || updateInfo.channel === "beta" || updateInfo.channel === "alpha")) {
      setCurrentChannel(updateInfo.channel);
    }
  }, [updateInfo?.channel]);
  const CurrentChannelTag = () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn(
          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
          isDark ? "bg-white/10 text-white" : "bg-black-90/30 text-black-primary"
        ),
        children: currentChannel
      }
    );
  };
  const handleDownload = async () => {
    console.log("[UpdateDialog] 🚀 用户点击下载按钮");
    setIsLoading(true);
    setError("");
    try {
      console.log("[UpdateDialog] 📡 调用 window.updateNotification.download()...");
      const result = await window.updateNotification.download();
      console.log("[UpdateDialog] 📬 下载调用返回结果:", result);
      if (result.success) {
        console.log("[UpdateDialog] ✅ 下载开始成功，切换到 downloading 状态");
        setState("downloading");
      } else {
        console.error("[UpdateDialog] ❌ 下载失败:", result.error);
        setError(result.error || t("update.error.downloadFailed"));
      }
    } catch (err) {
      console.error("[UpdateDialog] ❌ 下载异常:", err);
      setError(t("update.error.downloadFailed"));
    } finally {
      setIsLoading(false);
    }
  };
  const handleInstall = async () => {
    console.log("[UpdateDialog] 🔄 用户点击安装按钮");
    setIsLoading(true);
    isInstallingRef.current = true;
    try {
      console.log("[UpdateDialog] 📡 调用 window.updateNotification.install()...");
      const result = await window.updateNotification.install();
      if (result.success) {
        console.log("[UpdateDialog] ✅ 安装调用成功，应用即将重启...");
      } else {
        console.error("[UpdateDialog] ❌ 安装失败:", result);
        if ("error" in result && result.error?.includes("not found")) {
          setError("Update file not found. Redownloading...");
          setState("downloading");
          isInstallingRef.current = false;
          setIsLoading(false);
          setTimeout(() => {
            handleDownload();
          }, 1e3);
        } else {
          setError(t("update.error.installFailed"));
          setIsLoading(false);
          isInstallingRef.current = false;
        }
      }
    } catch (err) {
      console.error("[UpdateDialog] ❌ 安装异常:", err);
      setError(t("update.error.installFailed"));
      setIsLoading(false);
      isInstallingRef.current = false;
    }
  };
  const handleOpenDownloadedInstaller = async () => {
    console.log("[UpdateDialog] 🔧 用户点击手动安装按钮");
    try {
      const res = await window.updateNotification.openDownloadedInstaller();
      console.log("[UpdateDialog] 📂 打开安装包结果:", res);
      if (!res?.success) {
        console.warn("[UpdateDialog] 未能定位安装包，信息：", res?.message);
        setError("Unable to locate the downloaded installer. Please download from flowith.com");
      }
    } catch (err) {
      console.error("[UpdateDialog] 打开安装包失败:", err);
      setError("Unable to open the installer. Please download from flowith.com");
    }
  };
  const handleDismiss = async () => {
    try {
      await window.updateNotification.dismiss();
      setState("hidden");
    } catch (err) {
      console.error("关闭错误:", err);
    }
  };
  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return "--";
    return formatBytes(bytesPerSecond, 2) + "/s";
  };
  const pad2 = (n) => n < 10 ? "0" + n : String(n);
  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const formatReleaseTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const now = /* @__PURE__ */ new Date();
    if (isSameDay(d, now)) {
      const diffMs = now.getTime() - d.getTime();
      const minutes = Math.max(0, Math.floor(diffMs / 6e4));
      if (minutes < 1) return t("update.time.justNow");
      if (minutes < 60) return t("update.time.minutesAgo", { count: minutes });
      const hours = Math.floor(minutes / 60);
      return t("update.time.hoursAgo", { count: hours });
    }
    const y = d.getFullYear();
    const M = pad2(d.getMonth() + 1);
    const D = pad2(d.getDate());
    const H = pad2(d.getHours());
    const m = pad2(d.getMinutes());
    return `${y}-${M}-${D} ${H}:${m}`;
  };
  const visible = state !== "hidden";
  console.log("[UpdateDialog] 渲染检查:", { state, visible, updateInfo });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
        className: "fixed inset-0 bg-black/40 backdrop-blur-md pointer-events-auto",
        onClick: handleDismiss
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -20 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        className: "relative z-10 pointer-events-auto",
        onClick: (e) => e.stopPropagation(),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "relative w-[50vw] max-w-[880px] min-w-[560px] rounded-xl border backdrop-blur-xl transition-colors duration-300",
              isDark ? "bg-black-10/95 border-black-30/50 text-black-95" : "bg-black-95/95 border-black-80 text-black-primary"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleDismiss,
                  className: cn(
                    "absolute top-4 right-4 p-2 rounded-lg transition-all",
                    isDark ? "hover:bg-black-20/50 text-black-60 hover:text-black-95" : "hover:bg-black-90/60 text-black-secondary hover:text-black-primary"
                  ),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
                state === "checking" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    className: "space-y-6 text-center",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: cn(
                            "w-16 h-16 rounded-full flex items-center justify-center",
                            isDark ? "bg-white/10" : "bg-black-90/10"
                          ),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("w-8 h-8 animate-spin", isDark ? "text-white" : "text-black-80") })
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold leading-tight tracking-tight mb-2", children: t("update.checking.title") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm", isDark ? "text-black-60" : "text-black-secondary"), children: t("update.checking.description") })
                      ] })
                    ]
                  }
                ),
                state === "no-update" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 },
                    className: "space-y-6 text-center",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          initial: { scale: 0, rotate: -180 },
                          animate: { scale: 1, rotate: 0 },
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.1
                          },
                          className: cn(
                            "w-16 h-16 rounded-full flex items-center justify-center",
                            isDark ? "bg-white/10" : "bg-black-90/10"
                          ),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: cn("w-8 h-8", isDark ? "text-white" : "text-black-80") })
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold leading-tight tracking-tight mb-2", children: t("update.noUpdate.title") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm", isDark ? "text-black-60" : "text-black-secondary"), children: t("update.noUpdate.currentVersion", { version: updateInfo?.currentVersion || updateInfo?.version }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentChannelTag, {}) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm mt-2", isDark ? "text-black-caption" : "text-black-secondary"), children: t("update.noUpdate.description") })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: handleDismiss,
                          className: cn(
                            "w-full px-5 py-3 rounded-lg border font-medium transition-all",
                            isDark ? "border-black-30/50 hover:bg-black-20/30 text-black-70 hover:text-black-95" : "border-black-80 hover:bg-black-90/30 text-black-secondary hover:text-black-primary"
                          ),
                          children: t("update.noUpdate.close")
                        }
                      )
                    ]
                  }
                ),
                state === "update-available" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    className: "space-y-6",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                              isDark ? "bg-white/10" : "bg-black-90/10"
                            ),
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: cn("w-6 h-6", isDark ? "text-white" : "text-black-80") })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold leading-tight tracking-tight mb-1", children: t("update.available.title") }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-sm", isDark ? "text-black-60" : "text-black-secondary"), children: [
                              t("update.available.version", { version: updateInfo?.version }),
                              updateInfo?.currentVersion && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2", children: t("update.available.currentVersion", { current: updateInfo.currentVersion }) })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentChannelTag, {}),
                            updateInfo?.releaseDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs", isDark ? "text-black-60" : "text-black-secondary"), children: t("update.available.released", { time: formatReleaseTime(updateInfo.releaseDate) }) })
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-xs", isDark ? "text-black-caption" : "text-black-secondary"), children: t("update.available.betaNote") }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: cn(
                            "p-5 rounded-lg border max-h-[40vh] overflow-y-auto",
                            isDark ? "bg-black-20/30 border-black-30/50" : "bg-black-90/30 border-black-80"
                          ),
                          children: updateInfo?.releaseNotes ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("max-w-none font-sans text-sm leading-relaxed space-y-2", isDark ? "text-black-70" : "text-black-secondary"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Markdown,
                            {
                              remarkPlugins: [remarkGfm],
                              rehypePlugins: [rehypeHighlight],
                              components: {
                                h1: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: cn("text-lg font-semibold mb-3", isDark ? "text-white" : "text-black-primary"), ...props, children }),
                                h2: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: cn("text-base font-semibold mt-3 mb-2", isDark ? "text-white" : "text-black-primary"), ...props, children }),
                                h3: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mt-2 mb-1", ...props, children }),
                                p: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", ...props, children }),
                                ul: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc pl-5 space-y-1", ...props, children }),
                                ol: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "list-decimal pl-5 space-y-1", ...props, children }),
                                li: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "leading-relaxed", ...props, children }),
                                code: (props) => {
                                  const { inline, className, children, ...rest } = props || {};
                                  if (inline) {
                                    return /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-black/10 px-1.5 py-0.5 font-mono text-[12px]", ...rest, children });
                                  }
                                  return /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: cn("block rounded-md p-3 text-[12px] overflow-x-auto", className), ...rest, children });
                                },
                                pre: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mb-2 overflow-x-auto rounded-md", ...props, children }),
                                blockquote: ({ children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("blockquote", { className: cn("border-l-2 pl-3 italic", isDark ? "border-white/20" : "border-black-80"), ...props, children }),
                                a: ({ href, children, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href, className: cn("underline", isDark ? "text-white" : "text-black-primary"), ...props, children })
                              },
                              children: updateInfo.releaseNotes
                            }
                          ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm leading-relaxed", isDark ? "text-black-70" : "text-black-secondary"), children: t("update.available.defaultReleaseNotes") })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        motion.div,
                        {
                          initial: { opacity: 0, scale: 0.95, y: -10 },
                          animate: { opacity: 1, scale: 1, y: 0 },
                          exit: { opacity: 0, scale: 0.95, y: -10 },
                          className: "flex items-start gap-3 text-rose-300 text-sm bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 rounded-xl p-4",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "svg",
                              {
                                className: "w-5 h-5 flex-shrink-0 mt-0.5",
                                fill: "currentColor",
                                viewBox: "0 0 20 20",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "path",
                                  {
                                    fillRule: "evenodd",
                                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z",
                                    clipRule: "evenodd"
                                  }
                                )
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error })
                          ]
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: handleDownload,
                            disabled: isLoading,
                            className: cn(
                              "flex-1 px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                              isDark ? "bg-white hover:bg-white/95 text-black-primary border border-black-30/50 shadow-sm" : "bg-black-90 hover:bg-black-80 text-white border border-black-80",
                              "disabled:opacity-60 disabled:cursor-not-allowed"
                            ),
                            children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("update.available.preparing") })
                            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("update.available.downloadNow") })
                            ] })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: handleDismiss,
                            className: cn(
                              "px-5 py-3 rounded-lg border font-medium transition-all",
                              isDark ? "border-black-30/50 hover:bg-black-20/30 text-black-70 hover:text-black-95" : "border-black-80 hover:bg-black-90/30 text-black-secondary hover:text-black-primary"
                            ),
                            children: t("update.available.remindLater")
                          }
                        )
                      ] })
                    ]
                  }
                ),
                state === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    className: "space-y-6 text-center",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: cn(
                            "w-16 h-16 rounded-full flex items-center justify-center",
                            isDark ? "bg-rose-500/15" : "bg-rose-100"
                          ),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: cn("w-8 h-8", isDark ? "text-rose-300" : "text-rose-600") })
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold leading-tight tracking-tight mb-2", children: t("update.error.title") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm", isDark ? "text-black-60" : "text-black-secondary"), children: error || t("update.error.default") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentChannelTag, {}) }),
                        updateInfo?.channel && updateInfo?.expectedManifest && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn("text-xs mt-2", isDark ? "text-black-caption" : "text-black-secondary"), children: [
                          "Channel: ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: updateInfo.channel }),
                          ", Manifest: ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: updateInfo.expectedManifest })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: handleDismiss,
                          className: cn(
                            "w-full px-5 py-3 rounded-lg border font-medium transition-all",
                            isDark ? "border-black-30/50 hover:bg-black-20/30 text-black-70 hover:text-black-95" : "border-black-80 hover:bg-black-90/30 text-black-secondary hover:text-black-primary"
                          ),
                          children: t("update.error.close")
                        }
                      )
                    ]
                  }
                ),
                state === "downloading" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    className: "space-y-6",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                              isDark ? "bg-white/10" : "bg-black-90/10"
                            ),
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: cn("w-6 h-6 animate-pulse", isDark ? "text-white" : "text-black-80") })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold leading-tight tracking-tight mb-1", children: t("update.downloading.title") }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm", isDark ? "text-black-60" : "text-black-secondary"), children: t("update.downloading.version", { version: updateInfo?.version }) })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isDark ? "text-black-60" : "text-black-secondary", children: t("update.downloading.progress") }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium tabular-nums", children: [
                            Math.round(progress.percent),
                            "%"
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "h-2 rounded-full overflow-hidden",
                              isDark ? "bg-black-20/30" : "bg-black-90/30"
                            ),
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              motion.div,
                              {
                                className: cn("h-full rounded-full", isDark ? "bg-white/80" : "bg-black/80"),
                                initial: { width: 0 },
                                animate: { width: `${progress.percent}%` },
                                transition: { duration: 0.3, ease: "easeOut" }
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex justify-between text-xs", isDark ? "text-black-60" : "text-black-secondary"), children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatSpeed(progress.bytesPerSecond) }),
                          progress.transferred && progress.total && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            formatBytes(progress.transferred),
                            " / ",
                            formatBytes(progress.total)
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-xs text-center", isDark ? "text-black-caption" : "text-black-secondary"), children: t("update.downloading.hint") }),
                      progress.percent >= 100 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("[UpdateDialog] 点击事件触发");
                            handleOpenDownloadedInstaller();
                          },
                          className: cn("text-xs underline cursor-pointer", isDark ? "text-white/80 hover:text-white" : "text-black-70 hover:text-black-primary"),
                          children: "Open installer directly"
                        }
                      ) })
                    ]
                  }
                ),
                state === "ready-to-install" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                    className: "space-y-6 text-center",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        motion.div,
                        {
                          initial: { scale: 0, rotate: -180 },
                          animate: { scale: 1, rotate: 0 },
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.1
                          },
                          className: cn(
                            "w-16 h-16 rounded-full flex items-center justify-center",
                            isDark ? "bg-white/10" : "bg-black-90/10"
                          ),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: cn("w-8 h-8", isDark ? "text-white" : "text-black-80") })
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold leading-tight tracking-tight mb-2", children: t("update.readyToInstall.title") }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm", isDark ? "text-black-60" : "text-black-secondary"), children: t("update.readyToInstall.downloaded", { version: updateInfo?.version }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm mt-2", isDark ? "text-black-caption" : "text-black-secondary"), children: t("update.readyToInstall.hint") })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: handleInstall,
                            disabled: isLoading,
                            className: cn(
                              "flex-1 px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
                              isDark ? "bg-white hover:bg-white/95 text-black-primary border border-black-30/50 shadow-sm" : "bg-black-90 hover:bg-black-80 text-white border border-black-80",
                              "disabled:opacity-60 disabled:cursor-not-allowed"
                            ),
                            children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("update.readyToInstall.restarting") })
                            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("update.readyToInstall.restartNow") })
                            ] })
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("[UpdateDialog] 点击手动安装按钮 (ready-to-install)");
                              handleOpenDownloadedInstaller();
                            },
                            className: cn(
                              "px-5 py-3 rounded-lg font-medium transition-all underline cursor-pointer",
                              isDark ? "text-white/80 hover:text-white" : "text-black-70 hover:text-black-primary"
                            ),
                            children: "Open installer directly"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            onClick: handleDismiss,
                            className: cn(
                              "px-5 py-3 rounded-lg border font-medium transition-all",
                              isDark ? "border-black-30/50 hover:bg-black-20/30 text-black-70 hover:text-black-95" : "border-black-80 hover:bg-black-90/30 text-black-secondary hover:text-black-primary"
                            ),
                            children: t("update.readyToInstall.restartLater")
                          }
                        )
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: cn(
                      "mt-5 text-xs text-center",
                      isDark ? "text-black-caption" : "text-black-secondary"
                    ),
                    children: "You can always download the latest version of flowithOS from flowith.com."
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] }) }) });
};
function App() {
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[UpdateNotification] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  reactExports.useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("flowith-locale");
      if (savedLocale) {
        instance.changeLanguage(savedLocale).catch(() => {
        });
      }
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const localeChannel = new BroadcastChannel("flowith-locale");
    localeChannel.addEventListener("message", (e) => {
      const data = e.data || {};
      if (data?.type === "set" && data.locale) {
        instance.changeLanguage(data.locale).catch(() => {
        });
      }
    });
    return () => {
      localeChannel.close();
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(I18nextProvider, { i18n: instance, children: /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateDialog, {}) });
}
function ThemeSync() {
  const mode = useThemeStore((s) => s.mode);
  reactExports.useEffect(() => {
    const resolvedMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    document.body.classList.toggle("dark", resolvedMode === "dark");
  }, [mode]);
  return null;
}
async function bootstrap() {
  let unsubscribe = null;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[UpdateNotification] Failed to setup theme bridge:", error);
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
    document.body.classList.toggle("dark", fallbackMode === "dark");
  }
  window.addEventListener("beforeunload", () => {
    try {
      unsubscribe?.();
    } catch {
    }
  });
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Update notification root container not found");
  }
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    ] })
  );
}
void bootstrap();
