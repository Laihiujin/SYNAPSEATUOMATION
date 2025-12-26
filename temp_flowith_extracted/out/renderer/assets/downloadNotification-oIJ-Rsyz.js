import { r as reactExports, j as jsxRuntimeExports, d as ReactDOM, R as React } from "./client-DljuHW-m.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { X } from "./x-Xqx6LWQK.js";
/* empty css              */
import { s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import "./createLucideIcon-Dg7FO9tW.js";
import "./theme-sVdefUwF.js";
const DownloadToast = () => {
  const [data, setData] = reactExports.useState(null);
  const [isVisible, setIsVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[DownloadNotification] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  reactExports.useEffect(() => {
    const unsubShow = window.downloadNotificationAPI.onShow((showData) => {
      setData(showData);
      setIsVisible(true);
    });
    return () => {
      unsubShow();
    };
  }, []);
  const handleViewClick = async (e) => {
    e.stopPropagation();
    await window.downloadNotificationAPI.openDownloads();
    setIsVisible(false);
  };
  const handleDismiss = async (e) => {
    e.stopPropagation();
    await window.downloadNotificationAPI.dismiss();
    setIsVisible(false);
  };
  if (!data) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isVisible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: -20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.95 },
      transition: {
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1]
      },
      className: "absolute inset-0 p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-full rounded-2xl backdrop-blur-xl bg-white/85 dark:bg-black-10/85 border border-black-90/50 dark:border-black-20/50 shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full flex items-center justify-between gap-4 px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-medium text-black-primary dark:text-black-95 truncate leading-tight", children: data.filename }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-black-secondary dark:text-black-60 mt-1", children: "View in Downloads" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleViewClick,
              className: "px-3 py-1.5 rounded-lg text-[11px] font-medium bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200",
              children: "View"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleDismiss,
              className: "w-6 h-6 rounded-lg hover:bg-black-90/60 dark:hover:bg-black-20/60 flex items-center justify-center transition-all duration-200 opacity-60 hover:opacity-100",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5 text-black-secondary dark:text-black-60", strokeWidth: 2.5 })
            }
          )
        ] })
      ] }) })
    }
  ) });
};
setupRendererThemeBridge();
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadToast, {}) })
);
