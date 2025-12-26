import { c as clientExports, j as jsxRuntimeExports, R as React } from "./client-DljuHW-m.js";
import { s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import "./theme-sVdefUwF.js";
setupRendererThemeBridge();
const DOUBLE_CLICK_THRESHOLD = 300;
const HINT_DISPLAY_DURATION = 2e3;
const TabBorderOverlay = () => {
  const [state, setState] = React.useState({
    visible: false,
    rotating: false,
    blockInteraction: false
  });
  const [showHint, setShowHint] = React.useState(false);
  const [hintFadeOut, setHintFadeOut] = React.useState(false);
  const lastClickTimeRef = React.useRef(0);
  const hintTimerRef = React.useRef(null);
  React.useEffect(() => {
    console.log("[TabBorderOverlay Renderer] 🚀 Component mounted, listening for state updates");
    return window.tabBorderOverlayAPI.onStateUpdate((newState) => {
      console.log("[TabBorderOverlay Renderer] 📥 State update received:", {
        visible: newState.visible,
        rotating: newState.rotating,
        blockInteraction: newState.blockInteraction,
        hasColors: !!newState.colors,
        colors: newState.colors
      });
      setState(newState);
    });
  }, []);
  React.useEffect(() => {
    console.log("[TabBorderOverlay Renderer] 🎨 State applied:", {
      visible: state.visible,
      rotating: state.rotating,
      blockInteraction: state.blockInteraction,
      className: state.blockInteraction ? "blocking" : "passthrough"
    });
    setTimeout(() => {
      const containers = document.querySelectorAll(".border-container, .border-container-rounded");
      console.log("[TabBorderOverlay Renderer] 🔍 Border containers:", {
        count: containers.length,
        details: Array.from(containers).map((el) => {
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          return {
            className: el.className,
            visible: styles.opacity !== "0",
            opacity: styles.opacity,
            pointerEvents: styles.pointerEvents,
            cursor: styles.cursor,
            rect: { width: rect.width, height: rect.height, x: rect.x, y: rect.y }
          };
        })
      });
    }, 100);
  }, [state.visible, state.rotating, state.blockInteraction]);
  const handleClick = React.useCallback(() => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    console.log("[TabBorderOverlay Renderer] 🖱️ Click detected:", {
      blockInteraction: state.blockInteraction,
      visible: state.visible,
      rotating: state.rotating,
      hasColors: !!state.colors,
      timeSinceLastClick,
      isDoubleClick: timeSinceLastClick < DOUBLE_CLICK_THRESHOLD && timeSinceLastClick > 0,
      threshold: DOUBLE_CLICK_THRESHOLD
    });
    if (state.blockInteraction) {
      console.log("[TabBorderOverlay Renderer] 🔴 In BLOCKING mode - processing click...");
      if (timeSinceLastClick < DOUBLE_CLICK_THRESHOLD && timeSinceLastClick > 0) {
        console.log("[TabBorderOverlay Renderer] ✅✅✅ Double-click CONFIRMED! Sending pause request...");
        try {
          window.tabBorderOverlayAPI.requestRelease();
          console.log("[TabBorderOverlay Renderer] 📤 requestRelease() called successfully");
        } catch (error) {
          console.error("[TabBorderOverlay Renderer] ❌ Failed to call requestRelease():", error);
        }
        lastClickTimeRef.current = 0;
        setShowHint(false);
        setHintFadeOut(false);
        if (hintTimerRef.current) {
          clearTimeout(hintTimerRef.current);
          hintTimerRef.current = null;
        }
        return;
      }
      console.log("[TabBorderOverlay Renderer] ℹ️ Single click - showing hint");
      setShowHint(true);
      setHintFadeOut(false);
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
      hintTimerRef.current = setTimeout(() => {
        setHintFadeOut(true);
        setTimeout(() => {
          setShowHint(false);
          setHintFadeOut(false);
        }, 300);
      }, HINT_DISPLAY_DURATION);
    } else {
      console.log("[TabBorderOverlay Renderer] ⚠️ In PASSTHROUGH mode - click ignored for pause");
    }
    lastClickTimeRef.current = now;
  }, [state.blockInteraction]);
  React.useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);
  const colors = state.colors || {
    primary: "#2563EB",
    secondary: "#93C5FD",
    accent: "#DBEAFE"
  };
  const gradientStyle = {
    background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.secondary}, ${colors.primary})`
  };
  const shadowStyle = {
    boxShadow: `
      inset 0 0 0 1px ${colors.primary},
      inset 0 0 4px 1px ${colors.accent},
      inset 0 0 8px 2px ${colors.primary},
      inset 0 0 16px 4px ${colors.secondary},
      inset 0 0 32px 8px ${colors.primary}
    `
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `shadow-overlay ${state.visible ? "visible" : ""}`,
        style: shadowStyle
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `border-container ${state.visible ? "visible" : ""} ${state.blockInteraction ? "blocking" : ""}`,
        onClick: handleClick,
        onMouseEnter: () => console.log("[TabBorderOverlay Renderer] 🖱️ Mouse entered border-container"),
        onMouseMove: () => console.log("[TabBorderOverlay Renderer] 🖱️ Mouse moving over border-container"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `gradient-spinner ${state.rotating ? "rotating" : ""}`,
            style: gradientStyle
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `border-container-rounded ${state.visible ? "visible" : ""} ${state.blockInteraction ? "blocking" : ""}`,
        onClick: handleClick,
        onMouseEnter: () => console.log("[TabBorderOverlay Renderer] 🖱️ Mouse entered border-container-rounded"),
        onMouseMove: () => console.log("[TabBorderOverlay Renderer] 🖱️ Mouse moving over border-container-rounded"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `gradient-spinner ${state.rotating ? "rotating" : ""}`,
            style: gradientStyle
          }
        )
      }
    ),
    state.blockInteraction && showHint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `hint-overlay ${hintFadeOut ? "hint-fade-out" : "hint-fade-in"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hint-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hint-text", children: "🖱️ Double click to pause and take control" }) }) })
  ] });
};
console.log("[TabBorderOverlay Renderer] 🎬 Initializing...");
const container = document.getElementById("root");
if (container) {
  console.log("[TabBorderOverlay Renderer] ✅ Root container found, mounting React app");
  const root = clientExports.createRoot(container);
  root.render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabBorderOverlay, {}) })
  );
} else {
  console.error("[TabBorderOverlay Renderer] ❌ Root container not found!");
}
