import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { B as BaseDialog } from "./BaseDialog-DZnFUs_f.js";
import { D as DialogHeader, a as DialogTitle, b as DialogDescription, f as DialogFooter, d as DialogButton } from "./DialogComponents-CXVCvPqf.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import "./index-viF2D8av.js";
import "./proxy-BWWQsHt4.js";
import "./theme-sVdefUwF.js";
const Overlay = () => {
  const [visible, setVisible] = reactExports.useState(false);
  const [config, setConfig] = reactExports.useState(null);
  const [inputValue, setInputValue] = reactExports.useState("");
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[ConfirmDialog] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  reactExports.useEffect(() => {
    const handleShowDialog = (dialogConfig) => {
      setConfig(dialogConfig);
      setInputValue(dialogConfig.defaultValue || "");
      setVisible(true);
    };
    if (!window.electron?.ipcRenderer) {
      return;
    }
    window.electron.ipcRenderer.on("show-confirm-dialog", handleShowDialog);
    return () => {
      window.electron?.ipcRenderer?.removeListener("show-confirm-dialog", handleShowDialog);
    };
  }, []);
  reactExports.useEffect(() => {
    if (visible && config?.mode === "prompt" && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [visible, config?.mode]);
  const handleConfirm = () => {
    setVisible(false);
    const ipc = window.electron?.ipcRenderer;
    if (ipc?.send) {
      if (config?.mode === "prompt") {
        ipc.send("confirm-dialog-result", inputValue.trim() || null);
      } else {
        ipc.send("confirm-dialog-result", true);
      }
    }
  };
  const handleCancel = () => {
    setVisible(false);
    const ipc = window.electron?.ipcRenderer;
    if (ipc?.send) {
      if (config?.mode === "prompt") {
        ipc.send("confirm-dialog-result", null);
      } else {
        ipc.send("confirm-dialog-result", false);
      }
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  if (!config) {
    return null;
  }
  const isPrompt = config.mode === "prompt";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(BaseDialog, { visible, onClose: handleCancel, width: isPrompt ? 368 : 396, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(isPrompt ? "pb-[20px]" : ""), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: config.title }) }) }),
    !isPrompt && /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: config.content }),
    isPrompt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-[24px] flex flex-col gap-[8px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-[4px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-normal leading-[22px] tracking-[-0.28px] text-[#5a6272] dark:text-[#8D95A5]", children: config.placeholder || "Collection Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[14px] font-normal leading-[22px] text-[#ed1912]", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "text",
          value: inputValue,
          onChange: (e) => setInputValue(e.target.value),
          onKeyDown: handleKeyDown,
          className: cn(
            "w-full h-[32px] px-3 rounded-[8px]",
            "bg-white dark:bg-black-15",
            "border border-[#e2e4e8] dark:border-black-20",
            "text-[14px] text-black-primary dark:text-black-95",
            "focus:outline-none focus:ring-2 focus:ring-purple-60/20 dark:focus:ring-purple-50/20",
            "transition-all duration-200"
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogButton, { variant: "secondary", onClick: handleCancel, children: config.cancelText || "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DialogButton,
        {
          variant: "primary",
          onClick: handleConfirm,
          disabled: isPrompt && !inputValue.trim(),
          children: config.confirmText || "Confirm"
        }
      )
    ] })
  ] });
};
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, {});
}
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
  } catch (error) {
    console.warn("[ConfirmDialog] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Confirm dialog root container not found");
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
