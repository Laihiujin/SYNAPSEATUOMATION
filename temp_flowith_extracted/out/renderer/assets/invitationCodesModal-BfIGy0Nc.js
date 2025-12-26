import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { I as I18nextProvider, i as instance, L as LocaleSync } from "./i18n-BoThyQPF.js";
import "./context-CbCu0iMB.js";
import "./theme-sVdefUwF.js";
function App() {
  const { t } = useTranslation();
  const [codes, setCodes] = reactExports.useState([]);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [copiedId, setCopiedId] = reactExports.useState(null);
  const fetchCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.invitationCodesModal.getMyCodes();
      if (result?.codes) {
        setCodes(result.codes);
      } else if (result?.error) {
        setError(result.error);
      } else {
        setError(t("invitationCodes.noCodesFound"));
      }
    } catch (err) {
      console.error("[InvitationCodesModal] Failed to fetch codes:", err);
      setError(t("invitationCodes.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[InvitationCodesModal] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  reactExports.useEffect(() => {
    fetchCodes();
    const cleanup = window.invitationCodesModal.onRefresh(() => {
      fetchCodes();
    });
    return cleanup;
  }, []);
  const handleCopy = async (code) => {
    console.log("[InvitationCodesModal] Copying code:", code);
    try {
      await window.invitationCodesModal.copyToClipboard(code);
      console.log("[InvitationCodesModal] Copy successful");
      setCopiedId(code);
      setTimeout(() => setCopiedId(null), 2e3);
    } catch (err) {
      console.error("[InvitationCodesModal] Failed to copy:", err);
    }
  };
  const handleClose = () => {
    window.invitationCodesModal.close();
  };
  const unusedCount = codes.filter((c) => !c.used).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-md dark:bg-black/70", onClick: handleClose }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
        className: "relative w-full max-w-lg",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border bg-[#FFFFFF] shadow-2xl backdrop-blur-xl border-black-95 dark:border-[#2B3036] dark:bg-[#121516]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative border-b border-[#E5E7EB] px-6 py-5 dark:border-[#23272B]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-[#2C3038] dark:text-[#D0D4DB]", children: t("invitationCodes.title") }),
              !isLoading && !error && codes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-[#68707F] dark:text-[#747D8A]", children: t("invitationCodes.availableToShare", { unused: unusedCount, total: codes.length }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleClose,
                className: "rounded-lg p-1.5 text-[#68707F] transition-colors hover:bg-[#F1F2F4] hover:text-[#2C3038] dark:text-[#747D8A] dark:hover:bg-[#22252B] dark:hover:text-[#D0D4DB]",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    className: "h-5 w-5",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })
                  }
                )
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[500px] overflow-y-auto px-6 py-5", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#2D3139] dark:border-[#2B3036] dark:border-t-[#D0D4DB]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[#68707F] dark:text-[#747D8A]", children: t("invitationCodes.loading") })
          ] }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                className: "h-6 w-6 text-red-500 dark:text-red-400",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 2,
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-500 dark:text-red-400", children: error })
          ] }) : codes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F2F4] dark:bg-[#22252B]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                className: "h-8 w-8 text-[#8d95a5] dark:text-[#747D8A]",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: 1.5,
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    d: "M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-[#68707F] dark:text-[#747D8A]", children: [
              t("invitationCodes.noCodesYet"),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[#8d95a5] dark:text-[#68707F]", children: t("invitationCodes.useCodeHint") })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: codes.map((code, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            CodeCard,
            {
              code,
              index,
              isCopied: copiedId === code.id,
              onCopy: () => handleCopy(code.id)
            },
            code.id
          )) }) }),
          !isLoading && !error && codes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-[#E5E7EB] px-6 py-4 text-center dark:border-[#23272B]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[#8d95a5] dark:text-[#68707F]", children: t("invitationCodes.shareHint") }) })
        ] })
      }
    )
  ] });
}
const CodeCard = ({ code, isCopied, onCopy }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `group relative rounded-xl border transition-all duration-200 ${code.used ? "border-[#E5E7EB] bg-[#F9FAFB] opacity-60 dark:border-[#2B3036] dark:bg-[#1A1D21]" : "border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#D0D4DB] hover:shadow-sm dark:border-[#2B3036] dark:bg-[#1F2326] dark:hover:border-[#3A3E44]"}`,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `h-2 w-2 flex-shrink-0 rounded-full ${code.used ? "bg-[#D0D4DB] dark:bg-[#5a6272]" : "bg-emerald-500"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-lg font-semibold tracking-wide text-[#2D3139] dark:text-[#D0D4DB]", children: code.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              console.log(
                "[CodeCard] Button clicked, code:",
                code.id,
                "used:",
                code.used,
                "isCopied:",
                isCopied
              );
              e.stopPropagation();
              onCopy();
            },
            disabled: code.used || isCopied,
            className: `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${code.used ? "cursor-not-allowed bg-[#F1F2F4] text-[#8d95a5] dark:bg-[#22252B] dark:text-[#5a6272]" : isCopied ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-[#F1F2F4] text-[#2D3139] hover:bg-[#E5E7EB] dark:bg-[#22252B] dark:text-[#C6CAD2] dark:hover:bg-[#2A2E34]"} ${isHovered || isCopied ? "opacity-100" : "pointer-events-none opacity-0"}`,
            children: code.used ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  className: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("invitationCodes.used") })
            ] }) : isCopied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  className: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2.5,
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common.copied") })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  className: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 2,
                  viewBox: "0 0 24 24",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common.copy") })
            ] })
          }
        )
      ] })
    }
  );
};
function ThemeSync() {
  const resolvedMode = useThemeStore((s) => s.resolvedMode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);
  return null;
}
async function bootstrap() {
  try {
    if (window.themeAPI) {
      const mode = await window.themeAPI.getMode();
      console.log("[InvitationCodesModal] Received theme from main:", mode);
      useThemeStore.getState().applyExternalMode(mode);
      const resolvedMode = useThemeStore.getState().resolvedMode;
      document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    } else {
      console.error("[InvitationCodesModal] window.themeAPI not available!");
    }
  } catch (error) {
    console.error("[InvitationCodesModal] Failed to fetch theme from main process:", error);
  }
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
    console.log("[InvitationCodesModal] Theme bridge setup complete");
  } catch (error) {
    console.warn("[InvitationCodesModal] Failed to setup theme bridge:", error);
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Invitation codes modal root container not found");
  }
  console.log("[InvitationCodesModal] Rendering with mode:", useThemeStore.getState().mode);
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
