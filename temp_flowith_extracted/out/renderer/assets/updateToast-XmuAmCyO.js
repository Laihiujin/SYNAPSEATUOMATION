import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
import { I as I18nextProvider, i as instance, L as LocaleSync } from "./i18n-BoThyQPF.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { R as RefreshCw } from "./refresh-cw-DD9cRxA0.js";
import { D as Download, C as CircleCheckBig } from "./download-0fN9YWaY.js";
import { c as createLucideIcon } from "./createLucideIcon-Dg7FO9tW.js";
import { M as Markdown, c as rehypeHighlight, r as remarkGfm } from "./index-CbWv2Sou.js";
import { X } from "./x-Xqx6LWQK.js";
import { T as TriangleAlert } from "./triangle-alert-Bed24EUt.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
/* empty css              */
import "./context-CbCu0iMB.js";
import "./theme-sVdefUwF.js";
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode);
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};
const UpdateToast = () => {
  const { t } = useTranslation();
  const [state, setState] = reactExports.useState("hidden");
  const [updateInfo, setUpdateInfo] = reactExports.useState(null);
  const [progress, setProgress] = reactExports.useState({ percent: 0 });
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  const [isDark, setIsDark] = reactExports.useState(() => document.documentElement.classList.contains("dark"));
  const [isInstalling, setIsInstalling] = reactExports.useState(false);
  const isManualCheckRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    console.log("[UpdateToast] ✅ 组件已挂载");
    console.log("[UpdateToast] window.updateToast 是否存在:", !!window.updateToast);
  }, []);
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
    if (!window.updateToast) {
      console.warn("[UpdateToast] window.updateToast API 不可用，无法订阅更新事件");
      return;
    }
    console.log("[UpdateToast] 开始订阅更新事件");
    const handleUpdateInfo = (info) => {
      console.log("[UpdateToast] 🔔 收到更新信息:", JSON.stringify(info, null, 2));
      console.log("[UpdateToast] 更新类型:", info.type);
      console.log("[UpdateToast] 更新版本:", info.version);
      setUpdateInfo(info);
      setState(info.type);
      console.log("[UpdateToast] 状态已更新为:", info.type);
      if (info.type === "checking") {
        isManualCheckRef.current = true;
      }
      if (info.type === "ready-to-install" || info.type === "no-update" || info.type === "error" || info.type === "hidden" || info.type === "update-completed") {
        isManualCheckRef.current = false;
      }
      if (info.type === "ready-to-install") {
        setIsExpanded(true);
      }
    };
    const handleProgress = (progressData) => {
      console.log("[UpdateToast] 下载进度:", progressData.percent.toFixed(1) + "%");
      if (!isManualCheckRef.current) {
        return;
      }
      setProgress(progressData);
      setState("downloading");
    };
    const unsubInfo = window.updateToast.onUpdateInfo(handleUpdateInfo);
    const unsubProgress = window.updateToast.onDownloadProgress(handleProgress);
    console.log("[UpdateToast] ✅ 更新事件订阅完成");
    return () => {
      console.log("[UpdateToast] 取消订阅更新事件");
      unsubInfo?.();
      unsubProgress?.();
    };
  }, []);
  reactExports.useEffect(() => {
    if (state !== "ready-to-install") {
      setIsInstalling(false);
    }
  }, [state]);
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };
  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return "--";
    return formatBytes(bytesPerSecond) + "/s";
  };
  const getRelativeTime = (dateStr) => {
    const now = /* @__PURE__ */ new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 6e4);
    const diffHours = Math.floor(diffMs / 36e5);
    const diffDays = Math.floor(diffMs / 864e5);
    if (diffMins < 1) return t("updateToast.time.justNow");
    if (diffMins < 60) return t("updateToast.time.minutesAgo", { count: diffMins });
    if (diffHours < 24) return t("updateToast.time.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("updateToast.time.daysAgo", { count: diffDays });
    if (diffDays < 30) return t("updateToast.time.weeksAgo", { count: Math.floor(diffDays / 7) });
    if (diffDays < 365) return t("updateToast.time.monthsAgo", { count: Math.floor(diffDays / 30) });
    return t("updateToast.time.yearsAgo", { count: Math.floor(diffDays / 365) });
  };
  const handleInstall = async () => {
    console.log("[UpdateToast] 用户点击立即安装");
    console.log("[UpdateToast] 当前 updateInfo:", JSON.stringify(updateInfo, null, 2));
    setIsInstalling(true);
    try {
      const installData = updateInfo ? {
        version: updateInfo.version || "",
        releaseNotes: updateInfo.releaseNotes
      } : void 0;
      console.log("[UpdateToast] 传递给主进程的 installData:", JSON.stringify(installData, null, 2));
      await window.updateToast.install(installData);
    } catch (err) {
      console.error("[UpdateToast] 安装失败:", err);
      setIsInstalling(false);
      setState("error");
      setUpdateInfo((prev) => ({
        type: "error",
        version: prev?.version,
        currentVersion: prev?.currentVersion,
        releaseDate: prev?.releaseDate,
        releaseNotes: prev?.releaseNotes,
        installedAt: prev?.installedAt,
        channel: prev?.channel,
        errorMessage: "Install failed. Please try again."
      }));
    }
  };
  const handleDismiss = async () => {
    console.log("[UpdateToast] 用户点击稍后提醒");
    try {
      await window.updateToast.dismiss();
      setState("hidden");
    } catch (err) {
      console.error("[UpdateToast] 关闭失败:", err);
    }
  };
  const handleMinimize = async () => {
    console.log("[UpdateToast] 用户点击最小化，转为后台静默下载");
    try {
      isManualCheckRef.current = false;
      await window.updateToast.minimize();
      setState("hidden");
    } catch (err) {
      console.error("[UpdateToast] 最小化失败:", err);
    }
  };
  const handleOpenInstaller = async () => {
    console.log("[UpdateToast] 用户请求打开安装包");
    try {
      const result = await window.updateToast.openDownloadedInstaller();
      if (result.success) {
        console.log("[UpdateToast] 安装包已在文件管理器中打开:", result.file);
      } else {
        console.warn("[UpdateToast] 未找到安装包:", result.message);
      }
    } catch (err) {
      console.error("[UpdateToast] 打开安装包失败:", err);
    }
  };
  const handleDismissCompleted = async () => {
    console.log("[UpdateToast] 用户关闭更新完成提示");
    try {
      setState("hidden");
      console.log("[UpdateToast] UI 已设置为 hidden");
      await window.updateToast.dismissCompleted();
      console.log("[UpdateToast] dismissCompleted IPC 调用成功");
    } catch (err) {
      console.error("[UpdateToast] 删除更新日志失败:", err);
    }
  };
  const visible = state !== "hidden";
  console.log("[UpdateToast] 🎨 渲染检查:", {
    visible,
    state,
    hasUpdateInfo: !!updateInfo,
    version: updateInfo?.version
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: {
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1]
      },
      className: "pointer-events-auto",
      style: {
        position: "fixed",
        bottom: "16px",
        left: "16px",
        zIndex: 9999
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            "relative w-96 rounded-xl transition-all duration-300",
            isDark ? "text-black-95" : "text-black-primary"
          ),
          style: {
            background: isDark ? "rgba(26, 29, 31, 0.98)" : "rgba(255, 255, 255, 0.98)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(20px)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-x-0 top-0 h-px",
                style: {
                  background: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
              state === "checking" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex h-10 w-10 items-center justify-center rounded-lg",
                    style: {
                      background: isDark ? "rgba(99, 102, 241, 0.12)" : "rgba(99, 102, 241, 0.08)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      RefreshCw,
                      {
                        className: "h-5 w-5 animate-spin",
                        style: { color: isDark ? "#818cf8" : "#6366f1" }
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("updateToast.checking") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn("text-xs", isDark ? "text-black-60" : "text-black-secondary"),
                      children: t("updateToast.pleaseWait")
                    }
                  )
                ] })
              ] }),
              state === "update-available" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "flex h-10 w-10 items-center justify-center rounded-lg",
                    style: {
                      background: isDark ? "rgba(34, 197, 94, 0.12)" : "rgba(34, 197, 94, 0.08)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Download,
                      {
                        className: "h-5 w-5 animate-pulse",
                        style: { color: isDark ? "#4ade80" : "#22c55e" }
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("updateToast.preparingDownload", { version: updateInfo?.version }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn("text-xs", isDark ? "text-black-60" : "text-black-secondary"),
                      children: t("updateToast.pleaseWait")
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleMinimize,
                    className: cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                      isDark ? "hover:bg-black-20/60" : "hover:bg-black-90/60"
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }),
              state === "downloading" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isDark ? "bg-white/10" : "bg-black-90/10"
                      ),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Download,
                        {
                          className: cn(
                            "h-5 w-5 animate-pulse",
                            isDark ? "text-white" : "text-black-80"
                          )
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: t("updateToast.downloading", { version: updateInfo?.version }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: cn("text-xs", isDark ? "text-black-60" : "text-black-secondary"),
                        children: [
                          Math.round(progress.percent),
                          "% • ",
                          formatSpeed(progress.bytesPerSecond)
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: handleMinimize,
                      className: cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                        isDark ? "hover:bg-black-20/60" : "hover:bg-black-90/60"
                      ),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "h-1.5 overflow-hidden rounded-full",
                    style: {
                      background: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        className: "h-full rounded-full",
                        style: {
                          background: isDark ? "#60a5fa" : "#3b82f6"
                        },
                        initial: { width: 0 },
                        animate: { width: `${progress.percent}%` },
                        transition: { duration: 0.3, ease: "easeOut" }
                      }
                    )
                  }
                ),
                progress.transferred && progress.total && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: cn(
                      "text-right text-xs",
                      isDark ? "text-black-60" : "text-black-secondary"
                    ),
                    children: [
                      formatBytes(progress.transferred),
                      " / ",
                      formatBytes(progress.total)
                    ]
                  }
                )
              ] }),
              state === "no-update" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      style: {
                        // 柔和的灰绿色，低调显示
                        background: isDark ? "rgba(156, 163, 175, 0.10)" : "rgba(156, 163, 175, 0.06)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CircleCheckBig,
                        {
                          className: "h-5 w-5",
                          style: { color: isDark ? "#9ca3af" : "#6b7280" }
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("update.noUpdate.title") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(isDark ? "text-black-60" : "text-black-secondary"), children: t("update.noUpdate.currentVersion", {
                        version: updateInfo?.currentVersion || updateInfo?.version
                      }) }),
                      updateInfo?.checkedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(isDark ? "text-black-40" : "text-black-90"), children: "•" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "font-medium",
                            style: {
                              color: isDark ? "#60a5fa" : "#3b82f6",
                              fontSize: "11px"
                            },
                            children: getRelativeTime(updateInfo.checkedAt)
                          }
                        )
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 flex-col items-end gap-1", children: [
                    updateInfo?.channel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "rounded border px-2 py-0.5 text-xs",
                        style: {
                          background: isDark ? "rgba(31, 41, 55, 0.5)" : "rgba(249, 250, 251, 0.8)",
                          borderColor: isDark ? "rgba(75, 85, 99, 0.4)" : "rgba(209, 213, 219, 0.6)",
                          color: isDark ? "#e5e7eb" : "#111827",
                          fontSize: "11px"
                        },
                        children: updateInfo.channel.charAt(0).toUpperCase() + updateInfo.channel.slice(1)
                      }
                    ),
                    updateInfo?.releaseNotes && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "cursor-pointer whitespace-nowrap text-xs hover:underline",
                        style: {
                          color: isDark ? "#60a5fa" : "#3b82f6",
                          fontSize: "11px"
                        },
                        onClick: () => setIsExpanded(!isExpanded),
                        children: isExpanded ? t("updateToast.collapseLog") : t("updateToast.viewLog")
                      }
                    )
                  ] })
                ] }),
                isExpanded && updateInfo?.releaseNotes && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { height: 0, opacity: 0 },
                    animate: { height: "auto", opacity: 1 },
                    exit: { height: 0, opacity: 0 },
                    className: "overflow-hidden",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "max-h-48 overflow-y-auto rounded-lg border p-3 text-xs leading-relaxed",
                        style: {
                          background: isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.02)",
                          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                          color: isDark ? "#9ca3af" : "#6b7280"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Markdown,
                          {
                            remarkPlugins: [remarkGfm],
                            rehypePlugins: [rehypeHighlight],
                            components: {
                              a: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { ...props, target: "_blank", rel: "noreferrer" }),
                              h1: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "14px", margin: "8px 0" }, ...props }),
                              h2: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "13px", margin: "8px 0" }, ...props }),
                              h3: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "12px", margin: "6px 0" }, ...props })
                            },
                            children: updateInfo.releaseNotes
                          }
                        )
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleDismiss,
                    className: "w-full rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    style: {
                      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                      color: isDark ? "#9ca3af" : "#6b7280"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.background = "transparent";
                    },
                    children: t("update.noUpdate.close")
                  }
                )
              ] }),
              state === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      style: {
                        background: isDark ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5", style: { color: isDark ? "#fca5a5" : "#ef4444" } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("updateToast.updateCheckFailed") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "mt-1 text-xs",
                          isDark ? "text-black-60" : "text-black-secondary"
                        ),
                        children: updateInfo?.errorMessage || t("updateToast.unknownError")
                      }
                    ),
                    updateInfo?.channel && updateInfo?.expectedManifest && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "mt-1 text-xs",
                          isDark ? "text-black-caption" : "text-black-secondary"
                        ),
                        children: t("updateToast.channelInfo", {
                          channel: updateInfo.channel,
                          manifest: updateInfo.expectedManifest
                        })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "mt-2 cursor-pointer text-xs hover:underline",
                        style: {
                          color: isDark ? "#60a5fa" : "#3b82f6"
                        },
                        onClick: handleOpenInstaller,
                        children: t("updateToast.manualDownloadHint")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: handleDismiss,
                      className: cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                        isDark ? "hover:bg-black-20/60" : "hover:bg-black-90/60"
                      ),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleDismiss,
                    className: "w-full rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    style: {
                      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                      color: isDark ? "#9ca3af" : "#6b7280"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.background = "transparent";
                    },
                    children: t("updateToast.close")
                  }
                )
              ] }),
              state === "channel-downgraded" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      style: {
                        background: isDark ? "rgba(251, 191, 36, 0.12)" : "rgba(251, 191, 36, 0.08)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5", style: { color: isDark ? "#fbbf24" : "#f59e0b" } })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: t("updateToast.channelDowngraded.title") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "mt-1 text-xs",
                          isDark ? "text-black-60" : "text-black-secondary"
                        ),
                        children: t("updateToast.channelDowngraded.message", {
                          previousChannel: updateInfo?.previousChannel?.toUpperCase(),
                          newChannel: updateInfo?.newChannel?.toUpperCase()
                        })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: handleDismiss,
                      className: cn(
                        "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                        isDark ? "hover:bg-black-20/60" : "hover:bg-black-90/60"
                      ),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleDismiss,
                    className: "w-full rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    style: {
                      borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                      color: isDark ? "#9ca3af" : "#6b7280"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.background = "transparent";
                    },
                    children: t("updateToast.close")
                  }
                )
              ] }),
              (state === "ready-to-install" || state === "update-completed") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      style: {
                        background: isDark ? "rgba(34, 197, 94, 0.12)" : "rgba(34, 197, 94, 0.08)"
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        CircleCheckBig,
                        {
                          className: "h-5 w-5",
                          style: { color: isDark ? "#4ade80" : "#22c55e" }
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: state === "ready-to-install" ? t("updateToast.newVersionReady") : t("updateToast.updatedTo", { version: updateInfo?.version }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(isDark ? "text-black-60" : "text-black-secondary"), children: t("updateToast.version", { version: updateInfo?.version }) }),
                      (updateInfo?.releaseDate || updateInfo?.installedAt) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(isDark ? "text-black-40" : "text-black-90"), children: "•" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "font-medium",
                            style: {
                              color: isDark ? "#60a5fa" : "#3b82f6",
                              fontSize: "11px"
                            },
                            children: state === "update-completed" && updateInfo?.installedAt ? getRelativeTime(new Date(updateInfo.installedAt).toISOString()) : updateInfo?.releaseDate ? getRelativeTime(updateInfo.releaseDate) : ""
                          }
                        )
                      ] })
                    ] })
                  ] }),
                  state === "ready-to-install" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 flex-col items-end gap-1", children: [
                    updateInfo?.channel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "rounded border px-2 py-0.5 text-xs",
                        style: {
                          background: isDark ? "rgba(31, 41, 55, 0.5)" : "rgba(249, 250, 251, 0.8)",
                          borderColor: isDark ? "rgba(75, 85, 99, 0.4)" : "rgba(209, 213, 219, 0.6)",
                          color: isDark ? "#e5e7eb" : "#111827",
                          fontSize: "11px"
                        },
                        children: updateInfo.channel.charAt(0).toUpperCase() + updateInfo.channel.slice(1)
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "cursor-pointer whitespace-nowrap text-xs hover:underline",
                        style: {
                          color: isDark ? "#60a5fa" : "#3b82f6",
                          fontSize: "11px"
                        },
                        onClick: () => setIsExpanded(!isExpanded),
                        children: isExpanded ? t("updateToast.collapseLog") : t("updateToast.viewLog")
                      }
                    )
                  ] }),
                  state === "update-completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 flex-col items-end gap-1", children: [
                    updateInfo?.channel && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "rounded border px-2 py-0.5 text-xs",
                        style: {
                          background: isDark ? "rgba(31, 41, 55, 0.5)" : "rgba(249, 250, 251, 0.8)",
                          borderColor: isDark ? "rgba(75, 85, 99, 0.4)" : "rgba(209, 213, 219, 0.6)",
                          color: isDark ? "#e5e7eb" : "#111827",
                          fontSize: "11px",
                          opacity: 0.8
                        },
                        children: updateInfo.channel.charAt(0).toUpperCase() + updateInfo.channel.slice(1)
                      }
                    ),
                    updateInfo?.releaseNotes && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "cursor-pointer whitespace-nowrap text-xs hover:underline",
                        style: {
                          color: isDark ? "#60a5fa" : "#3b82f6",
                          fontSize: "11px"
                        },
                        onClick: () => setIsExpanded(!isExpanded),
                        children: isExpanded ? t("updateToast.collapseLog") : t("updateToast.viewLog")
                      }
                    )
                  ] })
                ] }),
                isExpanded && updateInfo?.releaseNotes && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    initial: { height: 0, opacity: 0 },
                    animate: { height: "auto", opacity: 1 },
                    exit: { height: 0, opacity: 0 },
                    className: "overflow-hidden",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "max-h-48 overflow-y-auto rounded-lg border p-3 text-xs leading-relaxed",
                        style: {
                          background: isDark ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.02)",
                          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                          color: isDark ? "#9ca3af" : "#6b7280"
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Markdown,
                          {
                            remarkPlugins: [remarkGfm],
                            rehypePlugins: [rehypeHighlight],
                            components: {
                              a: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { ...props, target: "_blank", rel: "noreferrer" }),
                              h1: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "14px", margin: "8px 0" }, ...props }),
                              h2: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "13px", margin: "8px 0" }, ...props }),
                              h3: ({ ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontSize: "12px", margin: "6px 0" }, ...props })
                            },
                            children: updateInfo.releaseNotes
                          }
                        )
                      }
                    )
                  }
                ),
                state === "ready-to-install" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: handleInstall,
                        disabled: isInstalling,
                        className: "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                        style: {
                          background: isInstalling ? isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)" : isDark ? "#ffffff" : "#000000",
                          color: isDark ? "#000000" : "#ffffff",
                          cursor: isInstalling ? "not-allowed" : "pointer",
                          opacity: isInstalling ? "0.7" : "1"
                        },
                        onMouseEnter: (e) => {
                          if (!isInstalling) {
                            e.currentTarget.style.opacity = "0.9";
                          }
                        },
                        onMouseLeave: (e) => {
                          if (!isInstalling) {
                            e.currentTarget.style.opacity = "1";
                          }
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", isInstalling && "animate-spin") }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isInstalling ? t("updateToast.restarting") : t("updateToast.installNow") })
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: handleDismiss,
                        className: "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                        style: {
                          borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                          color: isDark ? "#9ca3af" : "#6b7280"
                        },
                        onMouseEnter: (e) => {
                          e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
                        },
                        onMouseLeave: (e) => {
                          e.currentTarget.style.background = "transparent";
                        },
                        children: t("updateToast.later")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "cursor-pointer text-center text-xs hover:underline",
                      style: {
                        color: isDark ? "#60a5fa" : "#3b82f6"
                      },
                      onClick: handleOpenInstaller,
                      children: t("updateToast.manualDownloadHint")
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleDismissCompleted,
                    className: "w-full rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    style: {
                      background: isDark ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      color: "#ffffff",
                      boxShadow: isDark ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "0 4px 12px rgba(99, 102, 241, 0.2)"
                    },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                    },
                    children: t("updateToast.gotIt")
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  ) });
};
function ThemeSync() {
  const resolvedMode = useThemeStore((s) => s.resolvedMode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);
  return null;
}
function App() {
  reactExports.useEffect(() => {
    if (window.lifecycleAPI?.sendReady) {
      window.lifecycleAPI.sendReady();
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UpdateToast, {})
  ] });
}
async function bootstrap() {
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[UpdateToast] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Update toast root container not found");
  }
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
  );
  if (typeof window !== "undefined" && typeof unsubscribe === "function") {
    window.addEventListener("beforeunload", () => {
      try {
        unsubscribe?.();
      } catch {
      }
    });
  }
}
void bootstrap();
