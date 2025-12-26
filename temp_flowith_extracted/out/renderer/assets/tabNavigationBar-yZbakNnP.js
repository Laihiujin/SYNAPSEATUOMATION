import { r as reactExports, j as jsxRuntimeExports, d as ReactDOM, R as React } from "./client-DljuHW-m.js";
import { m, f as fromUserFriendlyUrl } from "./urlTransform-APxFwMwF.js";
import { s } from "./CaretLeft.es-BLuJm8Hv.js";
import { s as s$1 } from "./CaretRight.es-D13xy2ea.js";
import { s as s$3 } from "./CaretUp.es-DyHiHsbm.js";
import { n as n$2 } from "./Check.es-CHhIdSpi.js";
import { s as s$2 } from "./Copy.es-BpumgQRg.js";
import { n, a as n$1 } from "./Play.es-CCZEDg-p.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { u as useLocaleStore, I as I18nextProvider, i as instance } from "./i18n-BoThyQPF.js";
/* empty css              */
import "./IconBase.es-_t4ebd3Z.js";
import "./theme-sVdefUwF.js";
import "./context-CbCu0iMB.js";
const HIDE_DELAY = 3e3;
const COLLAPSE_RESET_DELAY = 1e4;
const COLLAPSE_ANIMATION_DELAY = 320;
function useTabNavigationState() {
  const [state, setState] = reactExports.useState({
    url: "",
    canGoBack: false,
    canGoForward: false,
    taskSnapshot: void 0
  });
  reactExports.useEffect(() => {
    if (!window.tabNavigationBar) {
      console.error("[TabNavigationBar] API not available");
      return;
    }
    window.tabNavigationBar.getCurrentState?.().then((initialState) => initialState && setState(initialState)).catch((err) => console.error("[TabNavigationBar] Failed to get initial state:", err));
    return window.tabNavigationBar.onStateUpdate(setState);
  }, []);
  return state;
}
function useVisibilityControl(showAgentControls, isCollapsed) {
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const timerRef = reactExports.useRef(void 0);
  const wasCollapsedRef = reactExports.useRef(isCollapsed);
  const resetHideTimer = reactExports.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!showAgentControls) {
      timerRef.current = setTimeout(() => setIsVisible(false), HIDE_DELAY);
    }
  }, [showAgentControls]);
  reactExports.useEffect(() => {
    if (wasCollapsedRef.current && !isCollapsed) {
      setIsVisible(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    wasCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);
  reactExports.useEffect(() => {
    if (showAgentControls) {
      setIsVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      resetHideTimer();
    }
  }, [showAgentControls, resetHideTimer]);
  reactExports.useEffect(() => {
    if (isCollapsed) return;
    const handleMouseMove = () => {
      setIsVisible(true);
      resetHideTimer();
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetHideTimer, isCollapsed]);
  return { isVisible, resetHideTimer };
}
function useCollapseControl(showAgentControls) {
  const [isCollapsed, setIsCollapsed] = reactExports.useState(false);
  const timerRef = reactExports.useRef(void 0);
  const collapse = reactExports.useCallback(() => {
    setIsCollapsed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => {
      window.tabNavigationBar?.sendAction({ type: "collapsed-state-changed", isCollapsed: true });
    }, COLLAPSE_ANIMATION_DELAY);
  }, []);
  const restore = reactExports.useCallback(() => {
    setIsCollapsed(false);
    window.tabNavigationBar?.sendAction({ type: "collapsed-state-changed", isCollapsed: false });
  }, []);
  reactExports.useEffect(() => {
    if (!isCollapsed) return;
    timerRef.current = setTimeout(restore, COLLAPSE_RESET_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isCollapsed, restore]);
  reactExports.useEffect(() => {
    if (showAgentControls && isCollapsed) {
      restore();
    }
  }, [showAgentControls, isCollapsed, restore]);
  return { isCollapsed, collapse };
}
function useUrlEditing(currentUrl) {
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editingUrl, setEditingUrl] = reactExports.useState("");
  const inputRef = reactExports.useRef(null);
  const startEditing = reactExports.useCallback(() => {
    setIsEditing(true);
    setEditingUrl(currentUrl);
    window.tabNavigationBar?.sendAction({ type: "editing-state-changed", isEditing: true });
  }, [currentUrl]);
  const stopEditing = reactExports.useCallback(() => {
    setIsEditing(false);
    setEditingUrl("");
    window.tabNavigationBar?.sendAction({ type: "editing-state-changed", isEditing: false });
  }, []);
  const handleNavigate = reactExports.useCallback(() => {
    if (!editingUrl.trim()) return;
    let url = editingUrl.trim();
    const convertedUrl = fromUserFriendlyUrl(url);
    if (convertedUrl !== url) {
      url = convertedUrl;
    } else if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("flowith://") && !url.startsWith("file://")) {
      url = url.includes(".") || url.startsWith("localhost") ? `https://${url}` : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    window.tabNavigationBar?.sendAction({ type: "navigate", url });
    stopEditing();
  }, [editingUrl, stopEditing]);
  return {
    isEditing,
    editingUrl,
    setEditingUrl,
    inputRef,
    startEditing,
    stopEditing,
    handleNavigate
  };
}
function normalizeUrl(url, newTabText, terminalText) {
  if (!url) return "";
  if (url.startsWith("flowith://blank")) return newTabText;
  if (url.startsWith("flowith://terminal")) return terminalText;
  if (url.startsWith("file://")) {
    return url.replace("file://", "").replace(/^\/+/, "");
  }
  return url;
}
function simplifyUrl(url, newTabText, terminalText) {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("Agent:") || url.startsWith("Intelligence:") || url === newTabText || url === terminalText) {
    return url;
  }
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    return hostname + (parsed.pathname !== "/" ? parsed.pathname : "");
  } catch {
    return url;
  }
}
function getThemeStyles(isDark, showAgentControls) {
  const isSpecialMode = isDark || showAgentControls;
  return {
    background: isSpecialMode ? "#000000" : "#FFFFFF",
    border: showAgentControls ? "1px solid rgba(255, 255, 255, 0.35)" : isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.2)",
    hoverClass: showAgentControls ? "hover:bg-white/20" : isDark ? "hover:bg-white/10" : "hover:bg-black/5",
    textClass: showAgentControls ? "text-white" : isDark ? "text-white" : "text-black",
    iconColor: showAgentControls ? "#FFFFFF" : isDark ? "rgba(255,255,255,0.6)" : "#5A6272",
    dividerColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
  };
}
const TabNavigationBar = () => {
  const { t } = useTranslation();
  const mode = useThemeStore((s2) => s2.mode);
  const isDark = mode === "dark";
  const state = useTabNavigationState();
  const showAgentControls = reactExports.useMemo(
    () => Boolean(
      state.taskSnapshot && (state.taskSnapshot.status === "running" || state.taskSnapshot.status === "paused")
    ),
    [state.taskSnapshot]
  );
  const { isCollapsed, collapse } = useCollapseControl(showAgentControls);
  const { isVisible, resetHideTimer } = useVisibilityControl(showAgentControls, isCollapsed);
  const {
    isEditing,
    editingUrl,
    setEditingUrl,
    inputRef,
    startEditing,
    stopEditing,
    handleNavigate
  } = useUrlEditing(state.url);
  const [copied, setCopied] = reactExports.useState(false);
  const newTabText = t("tabs.newTab");
  const terminalText = t("tabs.terminal");
  const displayUrl = reactExports.useMemo(
    () => normalizeUrl(state.url, newTabText, terminalText),
    [state.url, newTabText, terminalText]
  );
  const simplifiedUrl = reactExports.useMemo(
    () => simplifyUrl(displayUrl, newTabText, terminalText),
    [displayUrl, newTabText, terminalText]
  );
  const styles = reactExports.useMemo(
    () => getThemeStyles(isDark, showAgentControls),
    [isDark, showAgentControls]
  );
  const sendAction = reactExports.useCallback(
    (type) => {
      window.tabNavigationBar?.sendAction({ type });
      if (type === "copy-url") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2e3);
      }
    },
    []
  );
  const handleCollapse = reactExports.useCallback(() => {
    if (isEditing || showAgentControls) return;
    collapse();
  }, [isEditing, showAgentControls, collapse]);
  const handleUrlClick = reactExports.useCallback(() => {
    if (!showAgentControls) startEditing();
  }, [showAgentControls, startEditing]);
  const containerWidth = isEditing ? 444 : showAgentControls ? 280 : 254;
  const translateClass = isCollapsed ? "-translate-y-[60px] opacity-0" : isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed left-0 top-0 z-[9999] flex h-[28px] w-full items-start justify-center pt-[12px]",
      style: { pointerEvents: "none" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `pointer-events-auto flex h-[28px] items-center justify-between gap-2 rounded-[8px] px-[3px] py-[2px] backdrop-blur-[4px] transition-all duration-300 ${translateClass}`,
          style: {
            width: containerWidth,
            backgroundColor: styles.background,
            border: styles.border,
            boxShadow: "0px 4px 20px rgba(45, 49, 57, 0.08)"
          },
          onMouseEnter: resetHideTimer,
          onMouseMove: resetHideTimer,
          children: [
            showAgentControls ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              state.taskSnapshot?.status === "running" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => sendAction("pause-agent"),
                  className: "flex h-5 items-center gap-1 rounded-[6px] bg-[#5837FB] px-2 text-[11px] font-medium text-white transition-colors hover:bg-[#6B4EFF]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(n, { weight: "bold", className: "size-[12px]" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-none", children: t("tabs.pauseAgent") })
                  ]
                }
              ),
              state.taskSnapshot?.status === "paused" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => sendAction("resume-agent"),
                  className: "flex h-5 items-center gap-1 rounded-[6px] bg-[#5837FB] px-2 text-[11px] font-medium text-white transition-colors hover:bg-[#6B4EFF]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(n$1, { weight: "bold", className: "size-[12px]" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-none", children: t("tabs.resumeAgent") })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => sendAction("go-back"),
                  disabled: !state.canGoBack,
                  className: `flex size-[20px] items-center justify-center rounded-[6px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles.hoverClass}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(s, { weight: "bold", className: "size-[12px]", color: styles.iconColor })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => sendAction("go-forward"),
                  disabled: !state.canGoForward,
                  className: `flex size-[20px] items-center justify-center rounded-[6px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles.hoverClass}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    s$1,
                    {
                      weight: "bold",
                      className: "size-[12px]",
                      color: state.canGoForward ? styles.iconColor : isDark ? "rgba(255,255,255,0.3)" : "#9BA1AE"
                    }
                  )
                }
              )
            ] }),
            isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `flex flex-1 items-center rounded-[4px] px-1 ring-1 ${isDark ? "bg-black/50 ring-purple-80" : "bg-transparent ring-[#5837FB]"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: inputRef,
                    type: "text",
                    value: editingUrl,
                    onChange: (e) => setEditingUrl(e.target.value),
                    onBlur: stopEditing,
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleNavigate();
                      } else if (e.key === "Escape") {
                        stopEditing();
                      }
                    },
                    className: `h-[16px] w-full border-none bg-transparent text-[12px] font-[350] leading-[18px] tracking-[-0.02em] outline-none ${styles.textClass}`,
                    style: { fontFamily: "ABC Oracle" },
                    autoFocus: true
                  }
                )
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `flex h-[16px] w-[110px] items-center justify-center rounded px-1 transition-colors ${showAgentControls ? "cursor-default" : "cursor-text"} ${styles.hoverClass}`,
                onClick: handleUrlClick,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `max-w-full truncate text-[12px] font-[350] leading-4 tracking-[-0.02em] ${styles.textClass}`,
                    style: { fontFamily: "ABC Oracle" },
                    children: simplifiedUrl || t("tabs.newTab")
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              !showAgentControls && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => sendAction("reload"),
                  className: `flex size-[20px] items-center justify-center rounded-[6px] transition-colors ${styles.hoverClass}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(m, { weight: "bold", className: "size-[12px]", color: styles.iconColor })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => sendAction("copy-url"),
                  className: `flex size-[20px] items-center justify-center rounded-[6px] transition-colors ${styles.hoverClass}`,
                  children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(n$2, { weight: "bold", className: "size-[12px] text-green-30 dark:text-green-40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(s$2, { weight: "bold", className: "size-[12px]", color: styles.iconColor })
                }
              ),
              !showAgentControls && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-3 w-[1px]", style: { backgroundColor: styles.dividerColor } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleCollapse,
                    disabled: isEditing,
                    className: `flex size-[20px] items-center justify-center rounded-[6px] transition-colors ${styles.hoverClass} ${isEditing ? "cursor-not-allowed opacity-40" : ""}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(s$3, { weight: "bold", className: "size-[12px]", color: styles.iconColor })
                  }
                )
              ] })
            ] })
          ]
        }
      )
    }
  );
};
function ThemeSync() {
  const mode = useThemeStore((s2) => s2.mode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.body.classList.toggle("dark", mode === "dark");
  }, [mode]);
  return null;
}
function LocaleSync() {
  const locale = useLocaleStore((s2) => s2.locale);
  reactExports.useEffect(() => {
    instance.changeLanguage(locale).catch(() => {
    });
  }, [locale]);
  reactExports.useEffect(() => {
    if (!window.localeAPI) return;
    const unsubscribe = window.localeAPI.onLocaleChange((state) => {
      useLocaleStore.setState({ locale: state.locale });
    });
    window.localeAPI.requestSync?.();
    return unsubscribe;
  }, []);
  return null;
}
async function bootstrap() {
  try {
    if (window.localeAPI) {
      const localeFromMain = await window.localeAPI.getLocale();
      if (localeFromMain) {
        useLocaleStore.setState({ locale: localeFromMain });
        console.log("[TabNavigationBar] Loaded locale from main process:", localeFromMain);
      }
    }
  } catch (error) {
    console.warn("[TabNavigationBar] Failed to fetch locale from main process:", error);
  }
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[TabNavigationBar] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().mode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
    document.body.classList.toggle("dark", fallbackMode === "dark");
  }
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabNavigationBar, {})
    ] }) })
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
