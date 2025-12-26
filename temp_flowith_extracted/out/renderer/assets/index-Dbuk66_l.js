import { r as reactExports, j as jsxRuntimeExports, c as clientExports } from "./client-DljuHW-m.js";
/* empty css              */
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { I as I18nextProvider, i as instance, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import "./theme-sVdefUwF.js";
import "./context-CbCu0iMB.js";
function App() {
  const resolvedMode = useThemeStore((s) => s.resolvedMode);
  reactExports.useEffect(() => {
    console.log("[App] 🚀 主窗口 App 组件已挂载");
  }, []);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  }, [resolvedMode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: resolvedMode === "dark" ? "flex h-screen overflow-hidden bg-black-10" : "flex h-screen overflow-hidden bg-black-95",
      children: [
        !window.runtime?.isWindows && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "drag-region pointer-events-none fixed left-0 right-0 top-0 z-50 h-[15px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "drag-region pointer-events-none fixed bottom-0 left-0 right-0 z-50 h-[15px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "drag-region pointer-events-none fixed bottom-0 left-0 top-0 z-50 w-[8px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "drag-region pointer-events-none fixed bottom-0 right-0 top-0 z-50 w-[8px]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "relative flex min-w-0 flex-1 flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: resolvedMode === "dark" ? "relative flex-1 bg-black-10" : "relative flex-1 bg-black-95"
          }
        ) })
      ]
    }
  );
}
let initialized = false;
function initFacebookPixel() {
  if (initialized) {
    console.warn("[Facebook Pixel] Already initialized");
    return;
  }
  try {
    if (typeof window.fbq === "function") {
      initialized = true;
      console.log("[Facebook Pixel] Service initialized");
    } else {
      console.warn("[Facebook Pixel] fbq function not found, waiting for script to load...");
      setTimeout(() => {
        if (typeof window.fbq === "function") {
          initialized = true;
          console.log("[Facebook Pixel] Service initialized (delayed)");
        }
      }, 1e3);
    }
  } catch (error) {
    console.error("[Facebook Pixel] Failed to initialize:", error);
    initialized = true;
  }
}
function trackFacebookEvent(eventName, params) {
  if (!window.fbq) {
    console.warn("[Facebook Pixel] Not initialized, skipping event:", eventName);
    return;
  }
  try {
    window.fbq("track", eventName, params);
    console.log("[Facebook Pixel] Event tracked:", eventName, params);
  } catch (error) {
    console.error("[Facebook Pixel] Failed to track event:", error);
  }
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
  try {
    await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[MainRenderer] Failed to synchronize theme before render:", error);
  }
  try {
    const localGradient = useThemeStore.getState().gradientId;
    if (localGradient && window.themeAPI) {
      window.themeAPI.setGradientId(localGradient);
    }
  } catch (error) {
    console.warn("[MainRenderer] Failed to sync local gradient to main process:", error);
  }
  try {
    initFacebookPixel();
  } catch (error) {
    console.warn("[MainRenderer] Failed to initialize Facebook Pixel:", error);
  }
  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.on("facebook-pixel:track", (_event, eventName, params) => {
      trackFacebookEvent(eventName, params);
    });
  }
  clientExports.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    ] }) })
  );
}
void bootstrap();
