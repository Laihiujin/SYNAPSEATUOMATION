import { r as reactExports, j as jsxRuntimeExports, R as React, c as clientExports } from "./client-DljuHW-m.js";
import { f as fromUserFriendlyUrl, r } from "./urlTransform-APxFwMwF.js";
import { t } from "./CaretLeft.es-BLuJm8Hv.js";
import { e as e$1 } from "./CaretRight.es-D13xy2ea.js";
import { e as e$3 } from "./CopySimple.es-BpfswoDw.js";
import { e as e$2 } from "./Minus.es-B7r-UXfU.js";
import { p, o as o$3 } from "./IconBase.es-_t4ebd3Z.js";
import { e as e$4 } from "./X.es-dtM8PpYH.js";
import { c as create, s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { o as o$1, b as a$1 } from "./Play.es-CCZEDg-p.js";
import { o as o$2 } from "./Check.es-CHhIdSpi.js";
import { e } from "./Copy.es-BpumgQRg.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import "./theme-sVdefUwF.js";
import "./context-CbCu0iMB.js";
const a = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,28H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28Zm-4,176H52V52H204Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M216,48V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,34H48A14,14,0,0,0,34,48V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V48A14,14,0,0,0,208,34Zm2,174a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V48a2,2,0,0,1,2-2H208a2,2,0,0,1,2,2Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,36H48A12,12,0,0,0,36,48V208a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V48A12,12,0,0,0,208,36Zm4,172a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V48a4,4,0,0,1,4-4H208a4,4,0,0,1,4,4Z" }))
  ]
]);
const o = reactExports.forwardRef((r2, a$12) => /* @__PURE__ */ reactExports.createElement(p, { ref: a$12, ...r2, weights: a }));
o.displayName = "SquareIcon";
const flowithIcon = "" + new URL("flowithIcon-CoSvdEu0.svg", import.meta.url).href;
const useWindowStore = create((set) => {
  let isInitialized = false;
  let unsubscribe = null;
  const windowApi = window.windowsTitleBar.window;
  const applyState = (state) => {
    set({ isMaximized: state.isMaximized });
  };
  return {
    isMaximized: false,
    init: () => {
      if (isInitialized) return;
      void windowApi.getWindowState().then(applyState);
      unsubscribe = windowApi.onWindowStateChanged(applyState);
      isInitialized = true;
    },
    destroy: () => {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      isInitialized = false;
    },
    minimize: () => windowApi.minimize(),
    toggleMaximize: () => windowApi.toggleMaximize(),
    close: () => windowApi.close()
  };
});
const defaultState = {
  canGoBack: false,
  canGoForward: false,
  canRefresh: true,
  currentUrl: ""
};
const useNavStore = create((set) => {
  let isInitialized = false;
  let unsubscribe = null;
  const navApi = window.windowsTitleBar.navigation;
  const applyState = (s) => {
    let title = "";
    if (s.currentUrl) {
      const url = s.currentUrl;
      if (url.startsWith("file://")) {
        try {
          const filePath = url.replace("file://", "").replace(/^\/+/, "");
          const pathParts = filePath.split(/[/\\]/);
          title = pathParts[pathParts.length - 1] || filePath;
        } catch {
          title = url;
        }
      } else {
        try {
          title = new URL(url).host;
        } catch {
          title = url;
        }
      }
    }
    set({ ...s, centerTitle: title });
  };
  return {
    ...defaultState,
    centerTitle: "",
    init: () => {
      if (isInitialized) return;
      void navApi.getNavState().then(applyState);
      unsubscribe = navApi.onNavStateChanged(applyState);
      isInitialized = true;
    },
    destroy: () => {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      isInitialized = false;
      set({ ...defaultState, centerTitle: "" });
    },
    navigateBack: () => navApi.navigateBack(),
    navigateForward: () => navApi.navigateForward(),
    navigateTo: (url) => navApi.navigateTo(url),
    reload: () => navApi.reload()
  };
});
const TitleBarIconButton = ({
  ariaLabel,
  onClick,
  disabled,
  className,
  children
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      "aria-label": ariaLabel,
      disabled,
      className: cn(
        "no-drag hover-bg grid h-6 w-6 place-items-center rounded-md",
        "disabled:text-black-light disabled:hover:bg-transparent dark:disabled:text-black-20",
        className
      ),
      onClick,
      children
    }
  );
};
const useTaskStore = create((set) => {
  let isInitialized = false;
  let unsubscribe = null;
  const taskApi = window.windowsTitleBar.task;
  const applyTask = (task) => {
    set({ currentTabTask: task });
  };
  return {
    currentTabTask: null,
    init: () => {
      if (isInitialized) return;
      void taskApi.getCurrentTabTask().then(applyTask);
      unsubscribe = taskApi.onCurrentTabTaskChanged(applyTask);
      isInitialized = true;
    },
    destroy: () => {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      isInitialized = false;
      set({ currentTabTask: null });
    },
    setCurrentTabTaskStatus: (status) => taskApi.setCurrentTabTaskStatus(status)
  };
});
function ControlButton({ onClick, icon, label }) {
  const onDoubleClick = (e2) => {
    e2.stopPropagation();
    e2.preventDefault();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onDoubleClick,
      onClick,
      className: "no-drag flex h-5 cursor-pointer items-center gap-1 rounded-[6px] bg-purple-60 px-2 text-[11px] font-medium text-white transition-colors hover:bg-[#6B4EFF]",
      children: [
        icon,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-none", children: label })
      ]
    }
  );
}
function AgentControl() {
  const { currentTabTask, setCurrentTabTaskStatus } = useTaskStore();
  const status = currentTabTask?.status;
  const onClickPause = () => {
    setCurrentTabTaskStatus("paused");
  };
  const onClickResume = () => {
    setCurrentTabTaskStatus("running");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
    status === "running" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ControlButton,
      {
        onClick: onClickPause,
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(o$1, { weight: "bold", size: 12, color: "white" }),
        label: "Pause Agent"
      }
    ),
    status === "paused" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ControlButton,
      {
        onClick: onClickResume,
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(a$1, { weight: "bold", size: 12, color: "white" }),
        label: "Resume Agent"
      }
    )
  ] });
}
function urlToNavigateOrSearch(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("flowith://") && !url.startsWith("file://")) {
    if (url.includes(".") || url.startsWith("localhost")) {
      url = "https://" + url;
    } else {
      url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
  }
  return url;
}
function TitleBar() {
  const { t: t2 } = useTranslation();
  const { currentUrl, centerTitle, navigateTo } = useNavStore();
  const { currentTabTask } = useTaskStore();
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editingUrl, setEditingUrl] = reactExports.useState("");
  const isDisabled = currentTabTask && (currentTabTask.status === "running" || currentTabTask.status === "paused");
  const inputRef = reactExports.useRef(null);
  const [copied, setCopied] = reactExports.useState(false);
  const onClickCopyUrl = async () => {
    if (!currentUrl) return;
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 800);
  };
  const handleUrlClick = () => {
    if (isDisabled || !currentUrl) return;
    setIsEditing(true);
    setEditingUrl(currentUrl);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };
  const exitEditing = () => {
    setIsEditing(false);
    setEditingUrl("");
  };
  const editingContent = /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        `no-drag flex h-5 max-w-[440px] flex-1 items-center rounded-[4px] px-1`,
        "ring-1 ring-purple-60 dark:ring-purple-80",
        isDisabled ? "cursor-default" : "cursor-text"
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          autoFocus: true,
          type: "text",
          value: editingUrl,
          onChange: (e2) => setEditingUrl(e2.target.value),
          onBlur: exitEditing,
          onKeyDown: (e2) => {
            if (e2.key === "Enter") {
              e2.preventDefault();
              let trimed = editingUrl.trim();
              if (!trimed) {
                return;
              }
              const convertedUrl = fromUserFriendlyUrl(trimed);
              const url = urlToNavigateOrSearch(convertedUrl);
              navigateTo(url);
              exitEditing();
            } else if (e2.key === "Escape") {
              exitEditing();
            }
          },
          className: `h-4 w-full border-none bg-transparent text-body-book-12 font-[350] outline-none`
        }
      )
    }
  );
  const normalContent = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "flex h-5 items-center justify-center rounded px-1 transition-colors",
          isDisabled ? "drag cursor-default" : "no-drag cursor-pointer",
          "hover-bg"
        ),
        onClick: handleUrlClick,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `min-w-0 max-w-full truncate text-body-book-12`, children: centerTitle })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TitleBarIconButton,
      {
        ariaLabel: copied ? t2("common.copied") : t2("common.copyUrl"),
        onClick: onClickCopyUrl,
        className: "h-5 w-5",
        children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(o$2, { size: 12, weight: "bold", className: "text-green-30 dark:text-green-40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(e, { size: 12 })
      }
    )
  ] });
  return isEditing ? editingContent : normalContent;
}
const WindowsTitleBar = () => {
  const {
    isMaximized,
    init: initWindow,
    destroy: destroyWindow,
    minimize,
    toggleMaximize,
    close
  } = useWindowStore();
  const {
    canGoBack,
    canGoForward,
    canRefresh,
    init: initNav,
    destroy: destroyNav,
    navigateBack,
    navigateForward,
    reload
  } = useNavStore();
  const { init: initTask, destroy: destroyTask } = useTaskStore();
  React.useEffect(() => {
    initWindow();
    initNav();
    initTask();
    return () => {
      destroyWindow();
      destroyNav();
      destroyTask();
    };
  }, [initWindow, initNav, destroyWindow, destroyNav, initTask, destroyTask]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "drag flex h-8 w-full flex-row-reverse items-center justify-between bg-white text-black dark:bg-dark-900 dark:text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-3 flex min-w-0 items-center gap-2 overflow-x-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-3.5 flex h-6 w-7 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: flowithIcon,
          alt: "Flowith",
          width: 16,
          height: 16,
          className: "dark:brightness-0 dark:invert"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-drag flex h-6 items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleBarIconButton, { ariaLabel: "Back", disabled: !canGoBack, onClick: navigateBack, children: /* @__PURE__ */ jsxRuntimeExports.jsx(t, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TitleBarIconButton,
          {
            ariaLabel: "Forward",
            disabled: !canGoForward,
            onClick: navigateForward,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(e$1, {})
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleBarIconButton, { ariaLabel: "Refresh", disabled: !canRefresh, onClick: reload, children: /* @__PURE__ */ jsxRuntimeExports.jsx(r, {}) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "order-2 flex h-full w-0 min-w-0 flex-1 items-center justify-center overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AgentControl, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TitleBar, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-drag z-10 order-1 flex h-full shrink-0 items-stretch", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: minimize, className: "win-btn hover-bg", "aria-label": "Minimize", children: /* @__PURE__ */ jsxRuntimeExports.jsx(e$2, { size: 12 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: toggleMaximize,
          className: "win-btn hover-bg",
          "aria-label": isMaximized ? "Restore" : "Maximize",
          children: isMaximized ? /* @__PURE__ */ jsxRuntimeExports.jsx(e$3, { size: 12 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 12 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: close,
          className: "win-btn hover:bg-red-60 dark:hover:bg-red-40",
          "aria-label": "Close",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(e$4, { size: 14 })
        }
      )
    ] })
  ] });
};
function ThemeSync() {
  const resolvedMode = useThemeStore((s) => s.resolvedMode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);
  return null;
}
async function bootstrap() {
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch {
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  const root = clientExports.createRoot(rootEl);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsxs(React.StrictMode, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(o$3.Provider, { value: { size: 14, weight: "bold" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(WindowsTitleBar, {}) })
    ] })
  );
  window.addEventListener("beforeunload", () => {
    unsubscribe?.();
  });
}
void bootstrap();
