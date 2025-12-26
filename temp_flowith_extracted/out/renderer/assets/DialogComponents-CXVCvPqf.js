import { j as jsxRuntimeExports } from "./client-DljuHW-m.js";
import { u as useThemeStore } from "./themeBridge-XpPGWB57.js";
const DialogHeader = ({ children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-[24px] pt-[20px]", children });
};
const DialogTitle = ({ children, forceLight = false }) => {
  const mode = useThemeStore((s) => s.mode);
  const isDark = forceLight ? false : mode === "dark";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "h2",
    {
      className: "text-[20px] font-medium leading-[28px] tracking-[-0.4px]",
      style: { color: isDark ? "#FFFFFF" : "#000000" },
      children
    }
  );
};
const DialogDescription = ({
  children,
  className = ""
}) => {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-[24px] pt-[4px] pb-[20px] ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "p",
    {
      className: "text-[14px] font-normal leading-[22px] tracking-[-0.28px]",
      style: { color: isDark ? "#8D95A5" : "#5a6272" },
      children
    }
  ) });
};
const DialogContent = ({ children, className = "" }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-6 ${className}`, children });
};
const DialogFooter = ({ children, align = "right" }) => {
  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end"
  }[align];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-[24px] pt-[20px] pb-[20px] flex ${alignClass} gap-[8px]`, children });
};
const DialogButton = ({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  type = "button",
  className = "",
  forceLight = false
}) => {
  const mode = useThemeStore((s) => s.mode);
  const isDark = forceLight ? false : mode === "dark";
  const isPrimary = variant === "primary";
  const buttonClasses = isPrimary ? isDark ? "bg-white text-black hover:bg-white/90" : "bg-[#000000] text-white hover:bg-[#000000]/90" : isDark ? "bg-[#2D3139] text-white hover:bg-[#3D4149]" : "bg-[#f1f2f4] text-[#000000] hover:bg-[#e5e6e7]";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type,
      onClick,
      disabled,
      className: `flex items-center justify-center gap-[6px] shrink-0 h-[32px] px-[12px] py-[5px] rounded-[8px] text-[14px] font-normal tracking-[-0.28px] leading-[22px] transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${buttonClasses} ${className}`,
      children
    }
  );
};
const DialogDivider = ({
  text = "or",
  className = ""
}) => {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-6 pb-4 ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "w-full border-t",
        style: { borderColor: isDark ? "#2A2D30" : "#E2E4E8" }
      }
    ) }),
    text && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-[11px] uppercase tracking-wider", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "px-3 text-[#8B8F95] font-medium",
        style: { backgroundColor: isDark ? "#121516" : "white" },
        children: text
      }
    ) })
  ] }) });
};
export {
  DialogHeader as D,
  DialogTitle as a,
  DialogDescription as b,
  DialogContent as c,
  DialogButton as d,
  DialogDivider as e,
  DialogFooter as f
};
