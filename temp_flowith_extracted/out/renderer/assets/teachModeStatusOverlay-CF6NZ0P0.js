import { c as clientExports, j as jsxRuntimeExports, r as reactExports } from "./client-DljuHW-m.js";
import { t } from "./CaretLeft.es-BLuJm8Hv.js";
import { b as a, o } from "./Play.es-CCZEDg-p.js";
import { e } from "./StopCircle.es-Ci_jGEu4.js";
import { s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import "./IconBase.es-_t4ebd3Z.js";
import "./theme-sVdefUwF.js";
function formatEventLabel(event) {
  if (!event) return "";
  try {
    const base = event.type.replace(/_/g, " ");
    return event.target ? `${base} · ${event.target}` : base;
  } catch {
    return "User action";
  }
}
function formatEventMeta(event) {
  if (!event) return null;
  try {
    const parts = [];
    if (event.value) {
      parts.push(`Value: "${event.value}"`);
    }
    if (event.url) {
      try {
        const parsed = new URL(event.url);
        parts.push(`${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`);
      } catch {
        parts.push(event.url);
      }
    }
    if (event.combo && event.combo.length > 0) {
      parts.push(`Combo: ${event.combo.join(" + ")}`);
    }
    return parts.length ? parts.join(" · ") : null;
  } catch {
    return null;
  }
}
const App = () => {
  const [state, setState] = reactExports.useState({ payload: null });
  const payload = state.payload;
  reactExports.useEffect(() => {
    const handleShow = (event) => {
      const customEvent = event;
      setState({ payload: customEvent.detail });
    };
    const handleUpdate = (event) => {
      const customEvent = event;
      setState({ payload: customEvent.detail });
    };
    const handleHide = () => {
      setState({ payload: null });
    };
    window.addEventListener("teachModeStatusOverlay:show", handleShow);
    window.addEventListener("teachModeStatusOverlay:update", handleUpdate);
    window.addEventListener("teachModeStatusOverlay:hide", handleHide);
    return () => {
      window.removeEventListener("teachModeStatusOverlay:show", handleShow);
      window.removeEventListener("teachModeStatusOverlay:update", handleUpdate);
      window.removeEventListener("teachModeStatusOverlay:hide", handleHide);
    };
  }, []);
  const performAction = (action) => {
    window.teachModeStatusOverlay.performAction(action);
  };
  const handleClose = () => {
    performAction({ type: "dismiss" });
  };
  reactExports.useEffect(() => {
    if (payload?.latestEvent?.type === "session_end") {
      performAction({ type: "dismiss" });
    }
  }, [payload?.latestEvent?.type]);
  const isDark = payload?.theme === "dark";
  const eventLabel = formatEventLabel(payload?.latestEvent);
  const eventMeta = formatEventMeta(payload?.latestEvent);
  if (!payload) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-full pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute pointer-events-auto", style: { left: 0, top: 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `px-1 py-2 border rounded-[8px] shadow-lg min-w-[200px] max-w-[280px] ${isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200/80"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: (e2) => {
                  e2.stopPropagation();
                  performAction({ type: "complete" });
                },
                className: `w-[20px] h-[20px] rounded-[6px] bg-transparent flex items-center justify-center transition-colors ${isDark ? "hover:bg-black-15" : "hover:bg-[#F1F2F4]"}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  e,
                  {
                    size: 12,
                    weight: "bold",
                    className: isDark ? "text-[#FF6369]" : "text-[#E5484D]"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: (e2) => {
                  e2.stopPropagation();
                  performAction(payload.status === "paused" ? { type: "resume" } : { type: "pause" });
                },
                className: `w-[20px] h-[20px] rounded-[6px] bg-transparent flex items-center justify-center transition-colors ${isDark ? "hover:bg-black-15" : "hover:bg-[#F1F2F4]"}`,
                children: payload.status === "paused" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  a,
                  {
                    size: 12,
                    weight: "bold",
                    className: isDark ? "text-neutral-400" : "text-neutral-600"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                  o,
                  {
                    size: 12,
                    weight: "bold",
                    className: isDark ? "text-neutral-400" : "text-neutral-600"
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: (e2) => {
                e2.stopPropagation();
                handleClose();
              },
              className: `w-[20px] h-[20px] rounded-[6px] bg-transparent flex items-center justify-center transition-colors ${isDark ? "hover:bg-black-15" : "hover:bg-[#F1F2F4]"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                t,
                {
                  size: 12,
                  weight: "bold",
                  className: isDark ? "text-neutral-400" : "text-neutral-600"
                }
              )
            }
          )
        ] }),
        eventLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start pl-[4px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `text-[11px] leading-[15px] break-words ${isDark ? "text-neutral-300" : "text-neutral-700"}`,
              style: {
                fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                fontWeight: 400,
                letterSpacing: "-0.02em"
              },
              children: eventLabel
            }
          ),
          eventMeta && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "mt-0.5 text-[10px] leading-[13px] text-neutral-500 truncate",
              style: {
                fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                fontWeight: 350,
                letterSpacing: "-0.02em"
              },
              children: eventMeta
            }
          )
        ] }) })
      ]
    }
  ) }) });
};
setupRendererThemeBridge();
const container = document.getElementById("root");
if (!container) {
  throw new Error("Teach mode status overlay root container not found");
}
const root = clientExports.createRoot(container);
root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(App, {}));
