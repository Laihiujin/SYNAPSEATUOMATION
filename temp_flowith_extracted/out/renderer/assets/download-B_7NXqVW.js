import { r as reactExports, j as jsxRuntimeExports, d as ReactDOM, R as React } from "./client-DljuHW-m.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { u as useDownloadStore, S as StatusFilter, D as DownloadList } from "./StatusFilter-BQ000MKn.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { S as Search, a as SquareCheckBig, b as Square, T as Trash2 } from "./trash-2-0o5iz-Pa.js";
import { X } from "./x-Xqx6LWQK.js";
import { D as Download } from "./download-0fN9YWaY.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
/* empty css              */
import "./theme-sVdefUwF.js";
import "./format-CX3JBwaj.js";
import "./createLucideIcon-Dg7FO9tW.js";
import "./context-CbCu0iMB.js";
const DownloadPage = () => {
  const { t } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const {
    items,
    stats,
    isLoading,
    selectedIds,
    loadDownloads,
    removeBatchDownloads,
    clearAllDownloads,
    selectAll,
    clearSelection,
    updateProgress,
    updateDownloadStatus
  } = useDownloadStore();
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [activeStatus, setActiveStatus] = reactExports.useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = reactExports.useState(false);
  const [deleteAction, setDeleteAction] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);
  reactExports.useEffect(() => {
    const unsubProgress = window.downloadAPI.onProgress((progress) => {
      updateProgress(progress);
    });
    const unsubStarted = window.downloadAPI.onStarted(() => {
      loadDownloads();
    });
    const unsubCompleted = window.downloadAPI.onCompleted(({ id }) => {
      updateDownloadStatus(id, { state: "completed", endTime: Date.now() });
      useDownloadStore.getState().loadStats();
    });
    const unsubFailed = window.downloadAPI.onFailed(({ id, error }) => {
      updateDownloadStatus(id, { state: "failed", error, endTime: Date.now() });
      useDownloadStore.getState().loadStats();
    });
    const unsubCancelled = window.downloadAPI.onCancelled(({ id }) => {
      updateDownloadStatus(id, { state: "cancelled", endTime: Date.now() });
      useDownloadStore.getState().loadStats();
    });
    return () => {
      unsubProgress();
      unsubStarted();
      unsubCompleted();
      unsubFailed();
      unsubCancelled();
    };
  }, [updateProgress, updateDownloadStatus, loadDownloads]);
  const filteredItems = reactExports.useMemo(() => {
    let filtered = items;
    if (activeStatus !== "all") {
      filtered = filtered.filter((item) => {
        if (activeStatus === "progressing") {
          return item.state === "progressing" || item.state === "paused";
        }
        return item.state === activeStatus;
      });
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) => item.filename.toLowerCase().includes(query) || item.url.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [items, activeStatus, searchQuery]);
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleteAction(() => async () => {
      await removeBatchDownloads(Array.from(selectedIds));
      clearSelection();
      setShowDeleteConfirm(false);
    });
    setShowDeleteConfirm(true);
  };
  const handleClearAll = async () => {
    setDeleteAction(() => async () => {
      await clearAllDownloads();
      clearSelection();
      setShowDeleteConfirm(false);
    });
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (deleteAction) {
      await deleteAction();
      setDeleteAction(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  };
  const allSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex flex-col h-screen w-screen overflow-hidden",
        mode === "dark" ? "bg-black-10 text-black-95" : "bg-white text-black-primary"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "px-6 py-4 border-b",
              mode === "dark" ? "border-black-30/40" : "border-black-90/40"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold mb-4", children: t("downloads.title") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-md", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black-caption dark:text-black-60" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: searchQuery,
                      onChange: (e) => setSearchQuery(e.target.value),
                      placeholder: t("common.search"),
                      className: cn(
                        "w-full h-10 pl-10 pr-10 rounded-lg text-sm outline-none border-0 ring-0 focus:outline-none placeholder:text-black-caption",
                        mode === "dark" ? "bg-black-20/60 text-black-95" : "bg-black-95 text-black-primary"
                      )
                    }
                  ),
                  searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setSearchQuery(""),
                      className: "absolute right-3 top-1/2 -translate-y-1/2",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-black-caption dark:text-black-60" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => allSelected ? clearSelection() : selectAll(),
                    className: cn(
                      "flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-colors",
                      mode === "dark" ? "bg-black-20/60 hover:bg-black-20/80 text-black-95" : "bg-black-95 hover:bg-black-90 text-black-primary"
                    ),
                    children: [
                      allSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: allSelected ? t("common.cancel") : t("downloads.all") })
                    ]
                  }
                ),
                selectedIds.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: handleBatchDelete,
                    className: "flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        t("common.delete"),
                        " (",
                        selectedIds.size,
                        ")"
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: handleClearAll,
                    className: "flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("history.clearHistory") })
                    ]
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "w-64 border-r overflow-y-auto",
                mode === "dark" ? "border-black-30/40" : "border-black-90/40"
              ),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                StatusFilter,
                {
                  activeStatus,
                  onStatusSelect: setActiveStatus,
                  stats
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-black-caption dark:text-black-60", children: t("downloads.loadingDownloads") }) }) : filteredItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-16 h-16 mb-4 text-black-caption dark:text-black-60 opacity-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-black-caption dark:text-black-60", children: t("downloads.noDownloads") })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadList, { items: filteredItems }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showDeleteConfirm && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6",
            onClick: cancelDelete,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { scale: 0.95, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.95, opacity: 0 },
                onClick: (e) => e.stopPropagation(),
                className: cn(
                  "w-full max-w-sm rounded-2xl shadow-2xl p-6",
                  mode === "dark" ? "bg-black-15" : "bg-white"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold mb-2", children: t("common.delete") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-black-secondary dark:text-black-light mb-6", children: t("downloads.deleteConfirmMessage") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: cancelDelete,
                        className: cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                          mode === "dark" ? "bg-black-20/60 hover:bg-black-20/80 text-black-95" : "bg-black-95 hover:bg-black-90 text-black-primary"
                        ),
                        children: t("common.cancel")
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: confirmDelete,
                        className: "flex-1 py-2 rounded-lg text-sm font-medium transition-colors bg-red-500 hover:bg-red-600 text-white",
                        children: t("common.delete")
                      }
                    )
                  ] })
                ]
              }
            )
          }
        ) })
      ]
    }
  );
};
async function bootstrap() {
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[Download] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
    document.body.classList.toggle("dark", fallbackMode === "dark");
  }
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadPage, {}) })
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
