import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import "./theme-sVdefUwF.js";
const Overlay = () => {
  const [visible, setVisible] = reactExports.useState(false);
  const [progress, setProgress] = reactExports.useState(100);
  const [shortcut, setShortcut] = reactExports.useState("⌘Q");
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[QuitWarning] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  reactExports.useEffect(() => {
    let progressInterval = null;
    const handleShowWarning = (data) => {
      setVisible(true);
      setProgress(100);
      setShortcut(data.shortcut || "⌘Q");
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      const startTime = Date.now();
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - elapsed / data.duration * 100);
        setProgress(remaining);
        if (remaining <= 0 && progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      }, 16);
    };
    const handleHideWarning = () => {
      setVisible(false);
      setProgress(100);
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };
    if (!window.electron?.ipcRenderer) {
      return;
    }
    window.electron.ipcRenderer.on("show-quit-warning", handleShowWarning);
    window.electron.ipcRenderer.on("hide-quit-warning", handleHideWarning);
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      window.electron?.ipcRenderer?.removeListener("show-quit-warning", handleShowWarning);
      window.electron?.ipcRenderer?.removeListener("hide-quit-warning", handleHideWarning);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none flex items-start justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2, ease: "easeInOut" },
      className: "mt-8 pointer-events-auto",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-xl px-6 py-4 shadow-lg border border-white/20 dark:border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-8 h-8 bg-black/10 dark:bg-white/10 rounded-lg backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-black dark:text-white text-lg font-semibold", children: "⌘" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-black dark:text-white text-sm font-medium", children: [
            "Hold ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: shortcut }),
            " to Quit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 w-48 h-1 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "h-full bg-black dark:bg-white rounded-full",
              style: { width: `${progress}%` },
              transition: { duration: 0.1, ease: "linear" }
            }
          ) })
        ] })
      ] }) })
    }
  ) }) });
};
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, {});
}
function ThemeSync() {
  const mode = useThemeStore((s) => s.mode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
  return null;
}
async function bootstrap() {
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[QuitWarning] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().mode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Quit warning root container not found");
  }
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsxs(React.StrictMode, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    ] })
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
