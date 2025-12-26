import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { B as BaseDialog } from "./BaseDialog-DZnFUs_f.js";
import { D as DialogHeader, a as DialogTitle, c as DialogContent, f as DialogFooter, d as DialogButton } from "./DialogComponents-CXVCvPqf.js";
import { c as cn, h as handlePageUpDownNavigation } from "./utils-C6LcAPXa.js";
import { C as COLOR_TW } from "./preset-OurIE8P2.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { I as I18nextProvider, i as instance, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import "./index-viF2D8av.js";
import "./proxy-BWWQsHt4.js";
import "./theme-sVdefUwF.js";
import "./context-CbCu0iMB.js";
const COLOR_OPTIONS = [
  {
    value: "blue",
    labelKey: "blank.colorBlue",
    bg: COLOR_TW.blue.bg,
    ring: COLOR_TW.blue.ring
  },
  {
    value: "green",
    labelKey: "blank.colorGreen",
    bg: COLOR_TW.green.bg,
    ring: COLOR_TW.green.ring
  },
  {
    value: "yellow",
    labelKey: "blank.colorYellow",
    bg: COLOR_TW.yellow.bg,
    ring: COLOR_TW.yellow.ring
  },
  {
    value: "red",
    labelKey: "blank.colorRed",
    bg: COLOR_TW.red.bg,
    ring: COLOR_TW.red.ring
  }
];
const Overlay = () => {
  const { t } = useTranslation();
  const themeMode = useThemeStore((s) => s.mode);
  const isDark = themeMode === "dark";
  const [visible, setVisible] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("create");
  const [name, setName] = reactExports.useState("");
  const [instruction, setInstruction] = reactExports.useState("");
  const [color, setColor] = reactExports.useState("blue");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const nameInputRef = reactExports.useRef(null);
  const instructionInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[PresetDialog] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  reactExports.useEffect(() => {
    const cleanup = window.presetDialogAPI.onShow((config) => {
      setMode(config.mode);
      if (config.mode === "edit" && config.initialData) {
        setName(config.initialData.name);
        setInstruction(config.initialData.instruction);
        setColor(config.initialData.color);
        setVisible(true);
        setTimeout(() => {
          instructionInputRef.current?.focus();
        }, 100);
      } else {
        setName("");
        setInstruction("");
        setColor("blue");
        setVisible(true);
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
      }
      setIsSubmitting(false);
    });
    setTimeout(() => {
      console.log("[PresetDialog] React ready");
    }, 100);
    return cleanup;
  }, []);
  const canSubmit = name.trim() !== "" && instruction.trim() !== "" && !isSubmitting;
  const handleClose = () => {
    setVisible(false);
    window.presetDialogAPI.sendResult(null);
  };
  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setIsSubmitting(true);
      const result = {
        name: name.trim(),
        instruction: instruction.trim(),
        color
      };
      setVisible(false);
      window.presetDialogAPI.sendResult(result);
    } catch (error) {
      console.error("[PresetDialog] Failed to submit:", error);
      setIsSubmitting(false);
    }
  };
  const handleKeyDown = (e) => {
    if (handlePageUpDownNavigation(e)) return;
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void handleSubmit();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(BaseDialog, { visible, onClose: handleClose, width: 420, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "edit" ? t("blank.editPreset") : t("blank.createPreset") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "pb-0 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "label",
          {
            htmlFor: "preset-name",
            className: "text-[12px] leading-[16px] tracking-[-0.02em]",
            style: { color: isDark ? "#FFFFFF" : "#2D3139" },
            children: t("blank.presetName")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: nameInputRef,
            "data-dialog-input": true,
            id: "preset-name",
            type: "text",
            value: name,
            onChange: (e) => setName(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: t(
              mode === "create" ? "blank.presetNamePlaceholderCreate" : "blank.presetNamePlaceholderEdit"
            ),
            className: cn(
              "h-7 rounded-md border px-2 py-1.5 text-[12px] leading-[16px] tracking-[-0.02em] outline-none transition-colors duration-200 focus:border-[#5837FB]",
              isDark ? "placeholder:text-[#5A6272] selection:bg-[#736BFF]/20 selection:text-[#c6cad2]" : "placeholder:text-[#8B8F95] selection:bg-[#736BFF]/20 selection:text-[#0F172A]"
            ),
            style: {
              backgroundColor: isDark ? "#1A1D1F" : "#FFFFFF",
              borderColor: isDark ? "#2A2D30" : "#D1D5DB",
              color: isDark ? "#FFFFFF" : "#000000"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "label",
          {
            htmlFor: "preset-instruction",
            className: "text-[12px] leading-[16px] tracking-[-0.02em]",
            style: { color: isDark ? "#FFFFFF" : "#2D3139" },
            children: t("blank.instruction")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            ref: instructionInputRef,
            "data-dialog-input": true,
            id: "preset-instruction",
            value: instruction,
            onChange: (e) => setInstruction(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: t(
              mode === "create" ? "blank.instructionPlaceholderCreate" : "blank.instructionPlaceholderEdit"
            ),
            rows: 6,
            className: cn(
              "resize-none rounded-md border px-2 py-1.5 text-[12px] leading-[16px] tracking-[-0.02em] outline-none transition-colors duration-200 focus:border-[#5837FB]",
              isDark ? "placeholder:text-[#5A6272] selection:bg-[#736BFF]/20 selection:text-[#c6cad2]" : "placeholder:text-[#8B8F95] selection:bg-[#736BFF]/20 selection:text-[#0F172A]"
            ),
            style: {
              backgroundColor: isDark ? "#1A1D1F" : "#FFFFFF",
              borderColor: isDark ? "#2A2D30" : "#D1D5DB",
              color: isDark ? "#FFFFFF" : "#000000"
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 pt-2", children: COLOR_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setColor(option.value),
          className: cn(
            "h-5 w-5 rounded-full transition-all",
            option.bg,
            color === option.value ? `ring-2 ${option.ring} ring-offset-2` : "opacity-60 hover:opacity-80"
          ),
          style: {
            ...color === option.value && {
              "--tw-ring-offset-color": isDark ? "#121516" : "#FFFFFF"
            }
          },
          "aria-label": t("blank.selectColor", { color: t(option.labelKey) })
        },
        option.value
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogButton, { onClick: handleClose, variant: "secondary", children: t("common.cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogButton, { onClick: handleSubmit, disabled: !canSubmit, variant: "primary", children: isSubmitting ? mode === "edit" ? t("blank.updating") : t("blank.creating") : mode === "edit" ? t("blank.update") : t("blank.create") })
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
function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);
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
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[PresetDialog] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().resolvedMode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Preset dialog root container not found");
  }
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, {})
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
