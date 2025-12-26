import { r as reactExports, j as jsxRuntimeExports } from "./client-DljuHW-m.js";
function OverlayTooltip({ children, content, show: controlledShow, hideDelay = 100, shiftLeft = 0, maxWidth, isDark = false }) {
  const [position, setPosition] = reactExports.useState(null);
  const hideTimeoutRef = reactExports.useRef(null);
  const handleMouseEnter = reactExports.useCallback((event) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2 - shiftLeft,
      y: rect.top - 8
      // 8px above the trigger
    });
  }, [shiftLeft]);
  const handleMouseLeave = reactExports.useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setPosition(null);
    }, hideDelay);
  }, [hideDelay]);
  reactExports.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  const isVisible = controlledShow !== void 0 ? controlledShow && position !== null : position !== null;
  const shouldShow = isVisible && content;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children
      }
    ),
    shouldShow && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "pointer-events-none transition-opacity duration-200",
        style: {
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -100%)",
          zIndex: 1e4
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `px-2 py-1 text-[11px] rounded leading-[16px] ${isDark ? "bg-white text-black" : "bg-black text-white"} ${maxWidth ? "break-words" : "whitespace-nowrap"}`,
            style: {
              maxWidth,
              minWidth: shiftLeft !== 0 ? `${Math.abs(shiftLeft) * 2 + 40}px` : void 0
            },
            children: [
              content,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `absolute top-full -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent ${isDark ? "border-t-white" : "border-t-black"}`,
                  style: { left: `calc(50% + ${shiftLeft}px)` }
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
export {
  OverlayTooltip as O
};
