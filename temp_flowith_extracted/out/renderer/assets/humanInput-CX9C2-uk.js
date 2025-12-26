import { r as reactExports, j as jsxRuntimeExports, d as ReactDOM, R as React } from "./client-DljuHW-m.js";
import { E as R, B as PromptInput } from "./PromptInput-bRCob0UZ.js";
import { s } from "./CaretLeft.es-BLuJm8Hv.js";
import { s as s$1 } from "./CaretRight.es-D13xy2ea.js";
import { l } from "./UploadFileList-qn3fk1BB.js";
import { e } from "./X.es-dtM8PpYH.js";
import { N as NumberFlow } from "./NumberFlow-client-48rw3j0J-B5w-VoXL.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { I as I18nextProvider, i as instance, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import "./extends-BwmuZ0dU.js";
import "./index-CoFqUOPt.js";
import "./floating-ui.react-dom-CjpOSN3U.js";
import "./IconBase.es-_t4ebd3Z.js";
import "./theme-sVdefUwF.js";
import "./context-CbCu0iMB.js";
function App() {
  const { t } = useTranslation();
  const themeMode = useThemeStore((s2) => s2.resolvedMode);
  const [queue, setQueue] = reactExports.useState({
    activeRequest: null,
    pendingRequests: [],
    totalCount: 0
  });
  const [selectedRequestId, setSelectedRequestId] = reactExports.useState(null);
  const [remain, setRemain] = reactExports.useState(0);
  const contentRef = reactExports.useRef(null);
  const [slideDirection, setSlideDirection] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[HumanInput] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const promptInputRef = reactExports.useRef(null);
  const allRequests = reactExports.useMemo(() => {
    const requests = [];
    if (queue.activeRequest) requests.push(queue.activeRequest);
    requests.push(...queue.pendingRequests);
    return requests;
  }, [queue]);
  const currentRequest = reactExports.useMemo(() => {
    if (selectedRequestId) {
      return allRequests.find((r) => r.requestId === selectedRequestId) || allRequests[0];
    }
    return allRequests[0];
  }, [allRequests, selectedRequestId]);
  const currentIndex = reactExports.useMemo(() => {
    if (!currentRequest) return 0;
    return allRequests.findIndex((r) => r.requestId === currentRequest.requestId);
  }, [allRequests, currentRequest]);
  reactExports.useEffect(() => {
    if (!contentRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const contentHeight = entry.contentRect.height;
        const totalHeight = contentHeight + 16;
        window.agentWidgetAPI.browserAgent.setHumanInputHeight(totalHeight);
      }
    });
    resizeObserver.observe(contentRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  reactExports.useEffect(() => {
    window.agentWidgetAPI.browserAgent.getHumanInputQueue().then((snapshot) => {
      setQueue(snapshot);
      if (!selectedRequestId && snapshot.activeRequest) {
        setSelectedRequestId(snapshot.activeRequest.requestId);
      }
    }).catch((error) => {
      console.error("[HumanInputOverlay] Failed to fetch initial queue:", error);
    });
    const unsubscribe = window.agentWidgetAPI.browserAgent.onHumanInputQueueUpdate((snapshot) => {
      setQueue(snapshot);
      if (!selectedRequestId && snapshot.activeRequest) {
        setSelectedRequestId(snapshot.activeRequest.requestId);
      } else if (selectedRequestId) {
        const stillExists = snapshot.activeRequest?.requestId === selectedRequestId || snapshot.pendingRequests.some((r) => r.requestId === selectedRequestId);
        if (!stillExists) {
          setSelectedRequestId(snapshot.activeRequest?.requestId || null);
        }
      }
    });
    return unsubscribe;
  }, [selectedRequestId]);
  reactExports.useEffect(() => {
    if (!currentRequest) {
      setRemain(0);
      return;
    }
    const elapsed = Math.floor((Date.now() - currentRequest.createdAt) / 1e3);
    const remaining = Math.max(0, currentRequest.timeout - elapsed);
    setRemain(remaining);
    const interval = setInterval(() => {
      setRemain((prev) => Math.max(0, prev - 1));
    }, 1e3);
    return () => clearInterval(interval);
  }, [currentRequest?.requestId, currentRequest?.timeout, currentRequest?.createdAt]);
  const doSubmit = async (value) => {
    if (!currentRequest) return;
    try {
      await window.agentWidgetAPI.browserAgent.submitHumanInput({
        taskId: currentRequest.taskId,
        requestId: currentRequest.requestId,
        response: value
      });
      setSelectedRequestId(null);
    } catch (error) {
      console.error("[HumanInputOverlay] Failed to submit response:", error);
    }
  };
  const handleClose = () => {
    doSubmit(t("humanInput.declinedToAnswer"));
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setSlideDirection("right");
      setSelectedRequestId(allRequests[currentIndex - 1].requestId);
    }
  };
  const goNext = () => {
    if (currentIndex < allRequests.length - 1) {
      setSlideDirection("left");
      setSelectedRequestId(allRequests[currentIndex + 1].requestId);
    }
  };
  const handleDragEnter = (e2) => {
    e2.preventDefault();
    e2.stopPropagation();
    if (e2.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };
  const handleDragLeave = (e2) => {
    e2.preventDefault();
    e2.stopPropagation();
    const rect = e2.currentTarget.getBoundingClientRect();
    const x = e2.clientX;
    const y = e2.clientY;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };
  const handleDragOver = (e2) => {
    e2.preventDefault();
    e2.stopPropagation();
  };
  const handleDrop = (e2) => {
    e2.preventDefault();
    e2.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e2.dataTransfer.files);
    if (files.length > 0 && promptInputRef.current) {
      promptInputRef.current.addFiles(files);
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect = (e2) => {
    const files = Array.from(e2.target.files || []);
    if (files.length > 0 && promptInputRef.current) {
      promptInputRef.current.addFiles(files);
    }
    e2.target.value = "";
  };
  if (queue.totalCount === 0 || !currentRequest) {
    return null;
  }
  const options = (() => {
    if (currentRequest.type === "selection" && Array.isArray(currentRequest.options)) {
      return currentRequest.options;
    }
    if (currentRequest.type === "confirmation") {
      if (Array.isArray(currentRequest.options) && currentRequest.options.length >= 2) {
        return currentRequest.options;
      }
      return ["Yes", "No"];
    }
    return [];
  })();
  const showNavigation = allRequests.length > 1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allRequests.length - 1;
  const getTitle = () => {
    const count = allRequests.length;
    if (count === 1) return t("humanInput.needOneInput");
    if (count === 2) return t("humanInput.needTwoInputs");
    if (count === 3) return t("humanInput.needThreeInputs");
    return t("humanInput.waitingOnInputs", { count });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(R, { className: "h-full w-full !bg-transparent", accentColor: "gray", radius: "large", appearance: themeMode, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none flex h-full w-full items-end justify-end p-2 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: currentRequest && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      ref: contentRef,
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 10, scale: 0.98 },
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
        // cubic-bezier(0.4, 0, 0.2, 1)
      },
      className: "pointer-events-auto flex w-full max-w-[380px] min-h-[340px] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-[8px] bg-white/75 backdrop-blur-md border border-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.12)] dark:bg-[#18191b]/90 dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: -5 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1, duration: 0.2 },
            className: "flex-shrink-0 border-b border-black/5 bg-white/80 px-3 py-2.5 backdrop-blur-sm dark:border-white/5 dark:bg-[#18191b]/95",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "flex-1 text-[12px] font-semibold text-black-primary dark:text-white", children: getTitle() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                remain > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn(
                  "text-[11px] font-medium tabular-nums",
                  remain <= 10 ? "text-red-500 dark:text-red-400" : "text-black-60 dark:text-white/60"
                ), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(NumberFlow, { value: remain }),
                  "s"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleClose,
                    className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors text-black-60 hover:text-black-primary hover:bg-black-95 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/15",
                    "aria-label": t("humanInput.declineToAnswer"),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(e, { size: 13, weight: "bold" })
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-0 flex-1 overflow-y-auto mark-scroll-bar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: {
              x: slideDirection === "left" ? 20 : slideDirection === "right" ? -20 : 0,
              opacity: 0
            },
            animate: { x: 0, opacity: 1 },
            exit: {
              x: slideDirection === "left" ? -20 : slideDirection === "right" ? 20 : 0,
              opacity: 0
            },
            transition: {
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            },
            onAnimationComplete: () => setSlideDirection(null),
            className: "px-3 py-3",
            children: [
              currentRequest.taskPrompt && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 text-[9px] text-black-60 dark:text-white/40 truncate", children: currentRequest.taskPrompt }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-[13px] leading-[1.6] text-black-primary dark:text-white/90", children: currentRequest.prompt })
            ]
          },
          currentRequest.requestId
        ) }) }),
        options.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: -10 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.1, duration: 0.2 },
            className: "flex flex-shrink-0 flex-col gap-1.5 px-3 pb-2.5",
            children: options.map((opt, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.button,
              {
                initial: { opacity: 0, x: -10 },
                animate: { opacity: 1, x: 0 },
                transition: { delay: 0.15 + idx * 0.05, duration: 0.2 },
                type: "button",
                onClick: () => doSubmit(opt),
                className: cn(
                  "flex h-8 w-full items-center justify-center rounded-md px-3 text-[12px] transition-colors",
                  currentRequest.recommendedOption === opt ? "bg-black-primary font-semibold text-white hover:bg-black-secondary dark:bg-white dark:text-black-primary dark:hover:bg-white/90" : "bg-black-95/50 font-medium text-black-primary hover:bg-black-90 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                ),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: opt })
              },
              opt
            ))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 border-t border-black/5 dark:border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "relative px-3 py-2 transition-colors",
                isDragging && "bg-black-95/50 dark:bg-white/5"
              ),
              onDragEnter: handleDragEnter,
              onDragLeave: handleDragLeave,
              onDragOver: handleDragOver,
              onDrop: handleDrop,
              children: [
                isDragging && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-white/90 px-3 py-2 text-[11px] font-medium text-black-primary shadow-sm dark:bg-black-primary/90 dark:text-white", children: t("humanInput.dropFilesHere") }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "[&>div]:!shadow-none [&>div]:!ring-0 [&>div]:!bg-transparent [&>div]:!p-0 [&>div]:!h-[100px] [&>div]:!min-h-[100px] [&>div]:!max-h-[100px] [&_textarea]:dark:!text-white [&_textarea]:dark:placeholder:!text-white/50 [&_textarea]:!text-[13px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PromptInput,
                  {
                    ref: promptInputRef,
                    onSubmit: ({ text }) => doSubmit(text),
                    placeholder: currentRequest.type === "text" ? t("humanInput.typeYourAnswer") : t("humanInput.orTypeCustom"),
                    hideUpload: true
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleUploadClick,
                    className: cn(
                      "absolute bottom-3 right-4 flex h-6 w-6 items-center justify-center rounded-full transition-colors",
                      "bg-black-95 text-black-60 hover:bg-black-90 hover:text-black-primary",
                      "dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15 dark:hover:text-white"
                    ),
                    "aria-label": t("humanInput.uploadFiles"),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(l, { size: 12, weight: "bold" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: fileInputRef,
                    type: "file",
                    multiple: true,
                    className: "hidden",
                    onChange: handleFileSelect
                  }
                )
              ]
            }
          ),
          showNavigation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 border-t border-black/5 py-1.5 dark:border-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: goPrev,
                disabled: !hasPrev,
                className: cn(
                  "flex h-5 w-5 items-center justify-center rounded transition-colors",
                  hasPrev ? "text-black-60 hover:text-black-primary dark:text-white/60 dark:hover:text-white" : "cursor-not-allowed text-black-95 dark:text-white/20"
                ),
                "aria-label": t("humanInput.previousQuestion"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(s, { size: 14, weight: "bold" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: allRequests.map((_, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.button,
              {
                onClick: () => {
                  const targetRequest = allRequests[idx];
                  if (targetRequest) {
                    setSlideDirection(idx > currentIndex ? "left" : idx < currentIndex ? "right" : null);
                    setSelectedRequestId(targetRequest.requestId);
                  }
                },
                className: cn(
                  "h-1 rounded-full transition-all duration-200",
                  idx === currentIndex ? "w-4 bg-black-primary dark:bg-white" : "w-1 bg-black-90 hover:bg-black-secondary dark:bg-white/30 dark:hover:bg-white/50"
                ),
                animate: idx === currentIndex ? { scale: [1, 1.2, 1] } : {},
                transition: { duration: 0.3 },
                "aria-label": t("humanInput.goToQuestion", { number: idx + 1 })
              },
              idx
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: goNext,
                disabled: !hasNext,
                className: cn(
                  "flex h-5 w-5 items-center justify-center rounded transition-colors",
                  hasNext ? "text-black-60 hover:text-black-primary dark:text-white/60 dark:hover:text-white" : "cursor-not-allowed text-black-95 dark:text-white/20"
                ),
                "aria-label": t("humanInput.nextQuestion"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(s$1, { size: 14, weight: "bold" })
              }
            )
          ] })
        ] })
      ]
    },
    "human-input-card"
  ) }) }) });
}
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
    console.log("[HumanInput:LocaleSync] Locale changed to:", locale);
    instance.changeLanguage(locale).catch(() => {
    });
  }, [locale]);
  reactExports.useEffect(() => {
    console.log("[HumanInput:LocaleSync] Setting up locale listener, localeAPI available:", !!window.localeAPI);
    if (!window.localeAPI) {
      console.warn("[HumanInput:LocaleSync] localeAPI not available!");
      return;
    }
    const unsubscribe = window.localeAPI.onLocaleChange((state) => {
      console.log("[HumanInput:LocaleSync] Received locale update from main:", state.locale);
      useLocaleStore.setState({ locale: state.locale });
    });
    window.localeAPI.requestSync?.();
    return unsubscribe;
  }, []);
  return null;
}
async function bootstrap() {
  let unsubscribe = null;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[HumanInput] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().mode;
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
    throw new Error("Human input root container not found");
  }
  const root = ReactDOM.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    ] }) })
  );
}
void bootstrap();
