import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { a as LOCALES, b as LOCALE_CONFIG, u as useLocaleStore, i as instance, I as I18nextProvider } from "./i18n-BoThyQPF.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { e } from "./CaretDown.es-Bx19Sy5E.js";
import { o } from "./CaretUp.es-DyHiHsbm.js";
import { o as o$1 } from "./Check.es-CHhIdSpi.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import "./context-CbCu0iMB.js";
import "./IconBase.es-_t4ebd3Z.js";
import "./theme-sVdefUwF.js";
const SUBSCRIPTION_COLORS = {
  free: {
    light: "#2D3139",
    dark: "#FFFFFF"
  },
  professional: {
    light: "#0F80F0",
    dark: "#6FB2F6"
  },
  ultimate: {
    light: "#5837FB",
    dark: "#AB9BFD"
  },
  infinite: {
    light: "#CCA300",
    dark: "#FFCC00"
  }
};
const getSubscriptionColor = (subType, isDark) => {
  const defaultColor = isDark ? "#FFFFFF" : "#2D3139";
  if (!subType) return defaultColor;
  const normalizedType = subType.toLowerCase();
  const colors = SUBSCRIPTION_COLORS[normalizedType];
  if (!colors) return defaultColor;
  return isDark ? colors.dark : colors.light;
};
function App() {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const [currentLocale, setCurrentLocale] = reactExports.useState("en");
  const [subscriptionType, setSubscriptionType] = reactExports.useState("free");
  const [position, setPosition] = reactExports.useState();
  const [showTopGradient, setShowTopGradient] = reactExports.useState(false);
  const [showBottomGradient, setShowBottomGradient] = reactExports.useState(true);
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    window.electron?.ipcRenderer?.send("language-dialog:ready");
    const handleShow = (_event, locale, subType, pos) => {
      setCurrentLocale(locale);
      setSubscriptionType(subType || "free");
      setPosition(pos);
      setIsVisible(true);
    };
    window.electron?.ipcRenderer?.on("show-language-dialog", handleShow);
    return () => {
      window.electron?.ipcRenderer?.removeListener("show-language-dialog", handleShow);
    };
  }, []);
  const handleClose = reactExports.useCallback(() => {
    setIsVisible(false);
    window.electron?.ipcRenderer?.send("language-dialog:close");
  }, []);
  const handleSelectLanguage = reactExports.useCallback((locale) => {
    window.localeAPI?.setLocale(locale);
    setCurrentLocale(locale);
    setTimeout(() => {
      handleClose();
    }, 200);
  }, [handleClose]);
  const handleScroll = reactExports.useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtTop = scrollTop <= 4;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 4;
    setShowTopGradient(!isAtTop);
    setShowBottomGradient(!isAtBottom);
  }, []);
  reactExports.useEffect(() => {
    if (!isVisible) return;
    const checkScrollState = () => {
      const element = scrollRef.current;
      if (!element) return;
      const { scrollHeight, clientHeight } = element;
      const hasScroll = scrollHeight > clientHeight;
      setShowBottomGradient(hasScroll);
      setShowTopGradient(false);
    };
    const timer = setTimeout(checkScrollState, 50);
    return () => clearTimeout(timer);
  }, [isVisible]);
  reactExports.useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e2) => {
      if (e2.key === "Escape") {
        e2.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handleClose]);
  const handleBackdropClick = (e2) => {
    if (e2.target === e2.currentTarget) {
      handleClose();
    }
  };
  if (!isVisible) return null;
  const accentColor = getSubscriptionColor(subscriptionType, isDark);
  const gap = 8;
  let dialogStyle = {};
  if (position) {
    const left = position.x + gap;
    const top = position.y;
    dialogStyle = {
      position: "absolute",
      left: `${left}px`,
      top: `${top}px`
    };
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      onClick: handleBackdropClick,
      className: cn(
        "pointer-events-auto fixed inset-0 z-[9999]",
        position ? "flex" : "flex items-center justify-center"
      ),
      style: {
        // No visible backdrop when positioned as submenu, but still capture clicks
        backgroundColor: position ? "transparent" : isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
        backdropFilter: position ? "none" : "blur(12px)"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          onClick: (e2) => e2.stopPropagation(),
          className: cn(
            "pointer-events-auto w-[220px] flex flex-col overflow-hidden rounded-[8px] border",
            isDark ? "border-[#2B3036] bg-[#121516]" : "border-black-95 bg-[#FFFFFF]",
            isDark ? "text-[#D0D4DB]" : "text-[#2C3038]"
          ),
          style: dialogStyle,
          initial: { opacity: 0, scale: 0.96, x: position ? -8 : 0 },
          animate: { opacity: 1, scale: 1, x: 0 },
          exit: { opacity: 0, scale: 0.96, x: position ? -8 : 0 },
          transition: {
            duration: 0.15,
            ease: [0.16, 1, 0.3, 1]
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showTopGradient && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.2 },
                className: "pointer-events-none absolute left-0 right-0 top-0 z-10 h-12",
                style: {
                  background: isDark ? "linear-gradient(to bottom, #121516 0%, rgba(18, 21, 22, 0.8) 50%, transparent 100%)" : "linear-gradient(to bottom, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)"
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showTopGradient && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 4 },
                animate: {
                  opacity: 1,
                  y: 0
                },
                exit: { opacity: 0, y: 4 },
                transition: { duration: 0.2 },
                className: "pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-20",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: {
                      y: [0, -3, 0]
                    },
                    transition: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      o,
                      {
                        size: 16,
                        weight: "bold",
                        style: {
                          color: isDark ? "rgba(208, 212, 219, 0.15)" : "rgba(44, 48, 56, 0.1)"
                        }
                      }
                    )
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                ref: scrollRef,
                onScroll: handleScroll,
                className: "no-scrollbar overflow-y-auto h-[256px] px-2 py-2",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: LOCALES.map((locale) => {
                  const isCurrent = locale === currentLocale;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleSelectLanguage(locale),
                      className: cn(
                        "flex w-full items-center justify-between gap-3 rounded-[8px] px-2 py-1.5 text-sm transition-colors",
                        isDark ? "text-[#D0D4DB] hover:bg-[#22252B]" : "text-[#2C3038] hover:bg-[#F1F2F4]"
                      ),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "text-left text-sm",
                            style: {
                              fontFamily: "ABC Oracle, sans-serif",
                              letterSpacing: "-0.02em",
                              fontWeight: isCurrent ? 500 : 400
                            },
                            children: LOCALE_CONFIG[locale].nativeName
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-4 h-4 flex items-center justify-center", children: isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          motion.div,
                          {
                            initial: { scale: 0.8, opacity: 0 },
                            animate: { scale: 1, opacity: 1 },
                            transition: {
                              duration: 0.2,
                              ease: [0.4, 0, 0.2, 1]
                            },
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              o$1,
                              {
                                size: 13,
                                weight: "bold",
                                style: { color: accentColor }
                              }
                            )
                          }
                        ) })
                      ]
                    },
                    locale
                  );
                }) })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showBottomGradient && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.2 },
                className: "pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-12",
                style: {
                  background: isDark ? "linear-gradient(to top, #121516 0%, rgba(18, 21, 22, 0.8) 50%, transparent 100%)" : "linear-gradient(to top, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)"
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showBottomGradient && /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, y: -4 },
                animate: {
                  opacity: 1,
                  y: 0
                },
                exit: { opacity: 0, y: -4 },
                transition: { duration: 0.2 },
                className: "pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-20",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: {
                      y: [0, 3, 0]
                    },
                    transition: {
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      e,
                      {
                        size: 16,
                        weight: "bold",
                        style: {
                          color: isDark ? "rgba(208, 212, 219, 0.15)" : "rgba(44, 48, 56, 0.1)"
                        }
                      }
                    )
                  }
                )
              }
            ) })
          ] })
        }
      )
    }
  ) });
}
function ThemeSync() {
  const resolvedMode = useThemeStore((s) => s.resolvedMode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);
  return null;
}
function LocaleSync() {
  const currentLocale = useLocaleStore((s) => s.locale);
  reactExports.useEffect(() => {
    instance.changeLanguage(currentLocale).catch(() => {
    });
  }, [currentLocale]);
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
  const initLocale = useLocaleStore.getState().locale;
  await instance.changeLanguage(initLocale).catch(() => {
  });
  try {
    if (window.themeAPI) {
      const mode = await window.themeAPI.getMode();
      console.log("[LanguageDialog] Received theme from main:", mode);
      useThemeStore.getState().applyExternalMode(mode);
      const resolvedMode = useThemeStore.getState().resolvedMode;
      document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    } else {
      console.error("[LanguageDialog] window.themeAPI not available!");
    }
  } catch (error) {
    console.error("[LanguageDialog] Failed to fetch theme from main process:", error);
  }
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
    console.log("[LanguageDialog] Theme bridge setup complete");
  } catch (error) {
    console.warn("[LanguageDialog] Failed to setup theme bridge:", error);
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Language dialog root container not found");
  }
  console.log("[LanguageDialog] Rendering with mode:", useThemeStore.getState().mode);
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
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
