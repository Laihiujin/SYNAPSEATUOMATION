import { r as reactExports, j as jsxRuntimeExports } from "./client-DljuHW-m.js";
import { u as useFaviconWithFallback, c as cn } from "./utils-C6LcAPXa.js";
import { a as formatTime } from "./format-CX3JBwaj.js";
import { c as create, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { a as SquareCheckBig, b as Square, T as Trash2 } from "./trash-2-0o5iz-Pa.js";
import { c as createLucideIcon } from "./createLucideIcon-Dg7FO9tW.js";
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$2);
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$1);
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
];
const Globe = createLucideIcon("globe", __iconNode);
const useHistoryStore = create((set, get) => ({
  // State
  entries: [],
  stats: null,
  isLoading: false,
  error: null,
  selectedIds: /* @__PURE__ */ new Set(),
  // Actions
  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const entries = await window.historyAPI.getAll();
      set({ entries, isLoading: false });
      await get().loadStats();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to load history";
      set({ error: errorMsg, isLoading: false });
      console.error("[HistoryStore] Failed to load history:", error);
    }
  },
  loadStats: async () => {
    try {
      const stats = await window.historyAPI.getStats();
      set({ stats });
    } catch (error) {
      console.error("[HistoryStore] Failed to load stats:", error);
    }
  },
  searchHistory: async (keyword) => {
    if (!keyword.trim()) {
      await get().loadHistory();
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const result = await window.historyAPI.search(keyword);
      set({ entries: result.entries, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to search history";
      set({ error: errorMsg, isLoading: false });
      console.error("[HistoryStore] Failed to search history:", error);
    }
  },
  loadByTimeRange: async (range, custom) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await window.historyAPI.getByTimeRange(range, custom);
      set({ entries, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to load history by time range";
      set({ error: errorMsg, isLoading: false });
      console.error("[HistoryStore] Failed to load by time range:", error);
    }
  },
  removeHistory: async (id) => {
    try {
      await window.historyAPI.remove(id);
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        selectedIds: new Set([...state.selectedIds].filter((selectedId) => selectedId !== id))
      }));
      await get().loadStats();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to remove history";
      set({ error: errorMsg });
      console.error("[HistoryStore] Failed to remove history:", error);
    }
  },
  removeBatchHistory: async (ids) => {
    try {
      await window.historyAPI.removeBatch(ids);
      const idsSet = new Set(ids);
      set((state) => ({
        entries: state.entries.filter((entry) => !idsSet.has(entry.id)),
        selectedIds: /* @__PURE__ */ new Set()
      }));
      await get().loadStats();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to remove batch history";
      set({ error: errorMsg });
      console.error("[HistoryStore] Failed to remove batch history:", error);
    }
  },
  removeByTimeRange: async (range, custom) => {
    try {
      await window.historyAPI.removeByTimeRange(range, custom);
      await get().loadHistory();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to remove history by time range";
      set({ error: errorMsg });
      console.error("[HistoryStore] Failed to remove by time range:", error);
    }
  },
  clearAllHistory: async () => {
    try {
      await window.historyAPI.clear();
      set({ entries: [], selectedIds: /* @__PURE__ */ new Set(), stats: { total: 0, hasToday: false, hasYesterday: false, hasLast7Days: false, hasThisMonth: false, hasLastMonth: false } });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to clear history";
      set({ error: errorMsg });
      console.error("[HistoryStore] Failed to clear history:", error);
    }
  },
  toggleSelect: (id) => {
    set((state) => {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedIds: newSelected };
    });
  },
  selectAll: () => {
    set((state) => ({
      selectedIds: new Set(state.entries.map((e) => e.id))
    }));
  },
  clearSelection: () => {
    set({ selectedIds: /* @__PURE__ */ new Set() });
  },
  setError: (error) => {
    set({ error });
  }
}));
const HistoryList = ({ entries, groupByDate = true, customTitle }) => {
  const { t } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const grouped = reactExports.useMemo(() => {
    if (!groupByDate) {
      return { today: [], yesterday: [], earlier: entries };
    }
    const now = Date.now();
    const startOfToday = new Date(now).setHours(0, 0, 0, 0);
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1e3;
    const result = {
      today: [],
      yesterday: [],
      earlier: []
    };
    entries.forEach((entry) => {
      if (entry.timestamp >= startOfToday) {
        result.today.push(entry);
      } else if (entry.timestamp >= startOfYesterday) {
        result.yesterday.push(entry);
      } else {
        result.earlier.push(entry);
      }
    });
    return result;
  }, [entries, groupByDate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 space-y-8", children: [
    grouped.today.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryGroup, { title: t("history.today"), entries: grouped.today, mode }),
    grouped.yesterday.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryGroup, { title: t("history.yesterday"), entries: grouped.yesterday, mode }),
    grouped.earlier.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryGroup, { title: customTitle || t("history.earlier"), entries: grouped.earlier, mode })
  ] });
};
const HistoryGroup = ({ title, entries, mode }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-semibold uppercase tracking-wider text-black-caption dark:text-black-60 mb-3", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: entries.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryItem, { entry, mode }, entry.id)) })
  ] });
};
const HistoryItem = ({ entry, mode }) => {
  const { t } = useTranslation();
  const { removeHistory, toggleSelect, selectedIds } = useHistoryStore();
  const isSelected = selectedIds.has(entry.id);
  const { faviconUrl, onError, className: invertClass, showFallbackIcon } = useFaviconWithFallback(entry.url, null, false, true);
  const handleClick = () => {
    if (window.tabsAPI) {
      window.tabsAPI.navigateCurrent(entry.url);
    } else if (window.sideBarAPI) {
      window.sideBarAPI.tabs.create(entry.url);
    }
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    removeHistory(entry.id);
  };
  const handleToggleSelect = (e) => {
    e.stopPropagation();
    toggleSelect(entry.id);
  };
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = /* @__PURE__ */ new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date >= today) {
      return t("history.today");
    } else if (date >= yesterday) {
      return t("history.yesterday");
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : void 0
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      },
      className: cn(
        "group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200",
        // hover 背景
        mode === "dark" ? "hover:bg-black-20/40" : "hover:bg-black-95"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleToggleSelect,
            className: "flex-shrink-0",
            children: isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: cn(
              "w-4 h-4",
              mode === "dark" ? "text-indigo-400" : "text-indigo-600"
            ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "w-4 h-4 text-black-caption dark:text-black-60" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-5 h-5 flex items-center justify-center", children: showFallbackIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-4 h-4 text-black-caption dark:text-black-60" }) : faviconUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: faviconUrl,
            alt: "",
            className: cn("w-full h-full rounded-sm", invertClass),
            onError
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-4 h-4 text-black-caption dark:text-black-60" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 cursor-pointer", onClick: handleClick, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h3",
              {
                className: "text-sm font-medium truncate flex-1",
                children: entry.title || t("history.untitled")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-black-caption dark:text-black-60 flex-shrink-0", children: [
              formatDate(entry.timestamp),
              " · ",
              formatTime(entry.timestamp)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-black-secondary dark:text-black-light truncate", children: entry.url }),
          entry.visitCount && entry.visitCount > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-black-caption dark:text-black-60 mt-0.5", children: t("history.visitedTimes", { count: entry.visitCount }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                if (window.tabsAPI) {
                  window.tabsAPI.create(entry.url, true);
                } else if (window.sideBarAPI) {
                  window.sideBarAPI.tabs.create(entry.url);
                }
              },
              className: cn(
                "p-2 rounded-lg transition-colors",
                mode === "dark" ? "hover:bg-black-20/60" : "hover:bg-black-90"
              ),
              title: t("history.openInNewTab"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4 text-black-secondary dark:text-black-light" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleDelete,
              className: cn(
                "p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500"
              ),
              title: t("history.delete"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] })
      ]
    }
  );
};
const TimeRangeFilter = ({
  activeRange,
  onRangeSelect,
  onRangeDelete,
  stats
}) => {
  const { t } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const allTimeRangeOptions = [
    { value: "all", labelKey: "history.timeRangeAll", descriptionKey: "history.timeRangeAllDesc" },
    { value: "today", labelKey: "history.timeRangeToday", descriptionKey: "history.timeRangeTodayDesc", statsKey: "hasToday" },
    { value: "yesterday", labelKey: "history.timeRangeYesterday", descriptionKey: "history.timeRangeYesterdayDesc", statsKey: "hasYesterday" },
    { value: "last7days", labelKey: "history.timeRangeLast7Days", descriptionKey: "history.timeRangeLast7DaysDesc", statsKey: "hasLast7Days" },
    { value: "thisMonth", labelKey: "history.timeRangeThisMonth", descriptionKey: "history.timeRangeThisMonthDesc", statsKey: "hasThisMonth" },
    { value: "lastMonth", labelKey: "history.timeRangeLastMonth", descriptionKey: "history.timeRangeLastMonthDesc", statsKey: "hasLastMonth" }
  ];
  const [hoveredRange, setHoveredRange] = reactExports.useState(null);
  const handleRangeClick = (range) => {
    if (activeRange === range) {
      onRangeSelect(null);
    } else {
      onRangeSelect(range);
    }
  };
  const handleDelete = (e, range) => {
    e.stopPropagation();
    onRangeDelete(range);
  };
  const visibleOptions = reactExports.useMemo(() => {
    if (!stats) return allTimeRangeOptions;
    return allTimeRangeOptions.filter((option) => {
      if (option.value === "all") return true;
      if (!option.statsKey) return true;
      return stats[option.statsKey];
    });
  }, [stats]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-black-caption dark:text-black-60" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-black-caption dark:text-black-60", children: t("history.timePeriod") })
    ] }),
    visibleOptions.map((option) => {
      const isActive = activeRange === option.value;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          onMouseEnter: () => setHoveredRange(option.value),
          onMouseLeave: () => setHoveredRange(null),
          onClick: () => handleRangeClick(option.value),
          className: cn(
            "group relative px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
            // 选中态背景
            isActive && (mode === "dark" ? "bg-indigo-500/20" : "bg-indigo-50"),
            // hover 背景
            !isActive && (mode === "dark" ? "hover:bg-black-20/40" : "hover:bg-black-95")
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "text-sm font-medium mb-0.5 transition-colors",
                    isActive && (mode === "dark" ? "text-indigo-300" : "text-indigo-700")
                  ),
                  children: t(option.labelKey)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-black-secondary dark:text-black-light", children: t(option.descriptionKey) })
            ] }),
            hoveredRange === option.value && option.value !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: (e) => handleDelete(e, option.value),
                className: cn(
                  "flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-red-500/10 hover:text-red-500",
                  "ml-2"
                ),
                title: t("history.deleteTimeRange", { range: t(option.labelKey).toLowerCase() }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] })
        },
        option.value
      );
    })
  ] });
};
export {
  HistoryList as H,
  TimeRangeFilter as T,
  useHistoryStore as u
};
