import { j as jsxRuntimeExports } from "./client-DljuHW-m.js";
import { u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
const BaseDialog = ({
  visible,
  onClose,
  width = "420px",
  children,
  closeOnClickOutside = true,
  forceLight = false,
  noBorder = false,
  transparentBg = false
}) => {
  const mode = useThemeStore((s) => s.mode);
  const isDark = forceLight ? false : mode === "dark";
  const handleBackdropClick = () => {
    if (closeOnClickOutside && onClose) {
      onClose();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
      className: "fixed inset-0 z-[9999] flex items-center justify-center",
      onClick: handleBackdropClick,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 transition-all duration-200",
            style: {
              backgroundColor: isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.95, y: 8 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: 8 },
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
            className: "relative z-10",
            style: { width: typeof width === "number" ? `${width}px` : width },
            onClick: (e) => e.stopPropagation(),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `rounded-[12px] select-none ${noBorder ? "" : "border"} ${transparentBg ? "overflow-visible" : "overflow-hidden"}`,
                style: {
                  backgroundColor: transparentBg ? "transparent" : isDark ? "#121516" : "#FFFFFF",
                  borderColor: noBorder ? "transparent" : isDark ? "#2A2D30" : "#E2E4E8",
                  boxShadow: transparentBg ? "none" : isDark ? "0 20px 60px rgba(0, 0, 0, 0.5)" : "0 20px 60px rgba(0, 0, 0, 0.2)"
                },
                children
              }
            )
          }
        )
      ]
    }
  ) });
};
export {
  BaseDialog as B
};
