import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { B as BaseDialog } from "./BaseDialog-DZnFUs_f.js";
import { a as DialogTitle } from "./DialogComponents-CXVCvPqf.js";
import { p } from "./IconBase.es-_t4ebd3Z.js";
import { o } from "./Check.es-CHhIdSpi.js";
import { c } from "./Clock.es-Bqtl5XAC.js";
import { e as e$2 } from "./Copy.es-BpumgQRg.js";
import { e as e$1 } from "./FolderOpen.es-C_rG6qkP.js";
import { b as formatBytes, c as formatDateTime } from "./format-CX3JBwaj.js";
import { g as getFileIcon } from "./fileIcon-DZLXibZ3.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import { I as I18nextProvider, i as instance, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import "./index-viF2D8av.js";
import "./proxy-BWWQsHt4.js";
import "./FileText.es-DMxGivA6.js";
import "./context-CbCu0iMB.js";
import "./theme-sVdefUwF.js";
const V = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,28H188V24a12,12,0,0,0-24,0v4H92V24a12,12,0,0,0-24,0v4H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28ZM68,52a12,12,0,0,0,24,0h72a12,12,0,0,0,24,0h16V76H52V52ZM52,204V100H204V204Zm60-80v56a12,12,0,0,1-24,0V143.32a12,12,0,0,1-9.37-22l16-8A12,12,0,0,1,112,124Zm61.49,33.88L163.9,168H168a12,12,0,0,1,0,24H136a12,12,0,0,1-8.71-20.25L155.45,142a4,4,0,0,0,.55-2,4,4,0,0,0-7.47-2,12,12,0,0,1-20.78-12A28,28,0,0,1,180,140a27.77,27.77,0,0,1-5.64,16.86A10.63,10.63,0,0,1,173.49,157.88Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M216,48V88H40V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM112,184a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm56-8a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136a23.76,23.76,0,0,1-4.84,14.45L152,176ZM48,80V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,34H182V24a6,6,0,0,0-12,0V34H86V24a6,6,0,0,0-12,0V34H48A14,14,0,0,0,34,48V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V48A14,14,0,0,0,208,34ZM48,46H74V56a6,6,0,0,0,12,0V46h84V56a6,6,0,0,0,12,0V46h26a2,2,0,0,1,2,2V82H46V48A2,2,0,0,1,48,46ZM208,210H48a2,2,0,0,1-2-2V94H210V208A2,2,0,0,1,208,210Zm-98-90v64a6,6,0,0,1-12,0V129.71l-7.32,3.66a6,6,0,1,1-5.36-10.74l16-8A6,6,0,0,1,110,120Zm59.57,29.25L148,178h20a6,6,0,0,1,0,12H136a6,6,0,0,1-4.8-9.6L160,142a10,10,0,1,0-16.65-11A6,6,0,1,1,133,125a22,22,0,1,1,36.62,24.26Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M208,36H180V24a4,4,0,0,0-8,0V36H84V24a4,4,0,0,0-8,0V36H48A12,12,0,0,0,36,48V208a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V48A12,12,0,0,0,208,36ZM48,44H76V56a4,4,0,0,0,8,0V44h88V56a4,4,0,0,0,8,0V44h28a4,4,0,0,1,4,4V84H44V48A4,4,0,0,1,48,44ZM208,212H48a4,4,0,0,1-4-4V92H212V208A4,4,0,0,1,208,212ZM108,120v64a4,4,0,0,1-8,0V126.47l-10.21,5.11a4,4,0,0,1-3.58-7.16l16-8A4,4,0,0,1,108,120Zm60,28-24,32h24a4,4,0,0,1,0,8H136a4,4,0,0,1-3.2-6.4l28.78-38.37A11.88,11.88,0,0,0,164,136a12,12,0,0,0-22.4-6,4,4,0,0,1-6.92-4A20,20,0,0,1,172,136,19.79,19.79,0,0,1,168,148Z" }))
  ]
]);
const a$2 = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M234.36,170A12,12,0,0,1,230,186.37l-96,56a12,12,0,0,1-12.1,0l-96-56a12,12,0,0,1,12.09-20.74l90,52.48L218,165.63A12,12,0,0,1,234.36,170ZM218,117.63,128,170.11,38.05,117.63A12,12,0,0,0,26,138.37l96,56a12,12,0,0,0,12.1,0l96-56A12,12,0,0,0,218,117.63ZM20,80a12,12,0,0,1,6-10.37l96-56a12.06,12.06,0,0,1,12.1,0l96,56a12,12,0,0,1,0,20.74l-96,56a12,12,0,0,1-12.1,0l-96-56A12,12,0,0,1,20,80Zm35.82,0L128,122.11,200.18,80,128,37.89Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,80l-96,56L32,80l96-56Z", opacity: "0.2" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M220,169.09l-92,53.65L36,169.09A8,8,0,0,0,28,182.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,169.09Z" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09Z" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M28,86.91l96,56a8,8,0,0,0,8.06,0l96-56a8,8,0,0,0,0-13.82l-96-56a8,8,0,0,0-8.06,0l-96,56a8,8,0,0,0,0,13.82Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M229.18,173a6,6,0,0,1-2.16,8.2l-96,56a6,6,0,0,1-6,0l-96-56a6,6,0,0,1,6-10.36l93,54.23,93-54.23A6,6,0,0,1,229.18,173ZM221,122.82l-93,54.23L35,122.82a6,6,0,0,0-6,10.36l96,56a6,6,0,0,0,6,0l96-56a6,6,0,0,0-6-10.36ZM26,80a6,6,0,0,1,3-5.18l96-56a6,6,0,0,1,6,0l96,56a6,6,0,0,1,0,10.36l-96,56a6,6,0,0,1-6,0l-96-56A6,6,0,0,1,26,80Zm17.91,0L128,129.05,212.09,80,128,31Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M227.45,174a4,4,0,0,1-1.44,5.48l-96,56a4,4,0,0,1-4,0l-96-56a4,4,0,0,1,4-6.92l94,54.83,94-54.83A4,4,0,0,1,227.45,174ZM222,124.54l-94,54.83L34,124.54a4,4,0,0,0-4,6.92l96,56a4,4,0,0,0,4,0l96-56a4,4,0,0,0-4-6.92ZM28,80a4,4,0,0,1,2-3.46l96-56a4,4,0,0,1,4,0l96,56a4,4,0,0,1,0,6.92l-96,56a4,4,0,0,1-4,0l-96-56A4,4,0,0,1,28,80Zm11.94,0L128,131.37,216.06,80,128,28.63Z" }))
  ]
]);
const a$1 = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M246.15,133.18,146.83,33.86A19.85,19.85,0,0,0,132.69,28H40A12,12,0,0,0,28,40v92.69a19.85,19.85,0,0,0,5.86,14.14l99.32,99.32a20,20,0,0,0,28.28,0l84.69-84.69A20,20,0,0,0,246.15,133.18Zm-98.83,93.17L52,131V52h79l95.32,95.32ZM104,88A16,16,0,1,1,88,72,16,16,0,0,1,104,88Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M237.66,153,153,237.66a8,8,0,0,1-11.31,0L42.34,138.34A8,8,0,0,1,40,132.69V40h92.69a8,8,0,0,1,5.65,2.34l99.32,99.32A8,8,0,0,1,237.66,153Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63ZM84,96A12,12,0,1,1,96,84,12,12,0,0,1,84,96Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M241.91,137.42,142.59,38.1a13.94,13.94,0,0,0-9.9-4.1H40a6,6,0,0,0-6,6v92.69a13.94,13.94,0,0,0,4.1,9.9l99.32,99.32a14,14,0,0,0,19.8,0l84.69-84.69A14,14,0,0,0,241.91,137.42Zm-8.49,11.31-84.69,84.69a2,2,0,0,1-2.83,0L46.59,134.1a2,2,0,0,1-.59-1.41V46h86.69a2,2,0,0,1,1.41.59l99.32,99.31A2,2,0,0,1,233.42,148.73ZM94,84A10,10,0,1,1,84,74,10,10,0,0,1,94,84Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M240.49,138.83,141.17,39.51A11.93,11.93,0,0,0,132.69,36H40a4,4,0,0,0-4,4v92.69a11.93,11.93,0,0,0,3.51,8.48l99.32,99.32a12,12,0,0,0,17,0l84.69-84.69a12,12,0,0,0,0-17Zm-5.66,11.31-84.69,84.69a4,4,0,0,1-5.65,0L45.17,135.51A4,4,0,0,1,44,132.69V44h88.69a4,4,0,0,1,2.82,1.17l99.32,99.32A4,4,0,0,1,234.83,150.14ZM92,84a8,8,0,1,1-8-8A8,8,0,0,1,92,84Z" }))
  ]
]);
const e = reactExports.forwardRef((o2, r) => /* @__PURE__ */ reactExports.createElement(p, { ref: r, ...o2, weights: V }));
e.displayName = "CalendarIcon";
const t = reactExports.forwardRef((a2, c2) => /* @__PURE__ */ reactExports.createElement(p, { ref: c2, ...a2, weights: a$2 }));
t.displayName = "StackIcon";
const a = reactExports.forwardRef((e2, r) => /* @__PURE__ */ reactExports.createElement(p, { ref: r, ...e2, weights: a$1 }));
a.displayName = "TagIcon";
const Overlay = () => {
  const { t: t$1 } = useTranslation();
  const [visible, setVisible] = reactExports.useState(false);
  const [fileInfo, setFileInfo] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[InfoDialog] React component mounted, notified main process");
    }
  }, []);
  reactExports.useEffect(() => {
    const handleShowDialog = (data) => {
      setFileInfo(data);
      setVisible(true);
      setCopied(false);
    };
    if (!window.electron?.ipcRenderer) {
      return;
    }
    window.electron.ipcRenderer.on("show-info-dialog", handleShowDialog);
    return () => {
      window.electron?.ipcRenderer?.removeListener("show-info-dialog", handleShowDialog);
    };
  }, []);
  const handleClose = () => {
    setVisible(false);
    const ipc = window.electron?.ipcRenderer;
    if (ipc?.send) {
      ipc.send("info-dialog:close");
    }
  };
  const handleCopyPath = async () => {
    if (!fileInfo?.path) return;
    try {
      await navigator.clipboard.writeText(fileInfo.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (err) {
      console.error("Failed to copy path:", err);
    }
  };
  if (!fileInfo) {
    return null;
  }
  const fileExt = fileInfo.name.split(".").pop()?.toUpperCase() || "Unknown";
  const fileType = `Markdown (.${fileExt.toLowerCase()})`;
  const FileIconComponent = getFileIcon(fileInfo.name);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(BaseDialog, { visible, onClose: handleClose, width: 480, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-[24px] pt-[16px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: t$1("intelligence.fileInfo") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-[24px] pt-[12px] pb-[24px] flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileIconComponent, { size: 14, weight: "bold" }),
          label: t$1("intelligence.fileName"),
          value: fileInfo.name
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(t, { size: 14, weight: "bold" }),
          label: t$1("intelligence.fileSize"),
          value: formatBytes(fileInfo.size)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(a, { size: 14, weight: "bold" }),
          label: t$1("intelligence.fileType"),
          value: fileType
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(e, { size: 14, weight: "bold" }),
          label: t$1("intelligence.fileCreated"),
          value: formatDateTime(fileInfo.createdAt)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        InfoRow,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(c, { size: 14, weight: "bold" }),
          label: t$1("intelligence.fileModified"),
          value: formatDateTime(fileInfo.modifiedAt)
        }
      ),
      fileInfo.path && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 text-black-60 dark:text-black-40 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(e$1, { size: 14, weight: "bold" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-black-60 dark:text-black-40 font-medium", children: t$1("intelligence.fileLocation") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-black-95 dark:bg-black-15 px-2 py-1.5 rounded-[6px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 text-[10px] text-black-primary dark:text-black-caption font-mono break-all select-text", children: fileInfo.path }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleCopyPath,
                className: "flex-shrink-0 p-1 rounded-[4px] hover:bg-black-90 dark:hover:bg-black-20 transition-colors",
                title: copied ? t$1("common.copied") : t$1("intelligence.copyPath"),
                children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 12, weight: "bold", className: "text-green-30 dark:text-green-40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(e$2, { size: 12, weight: "bold", className: "text-black-60 dark:text-black-40" })
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
};
const InfoRow = ({
  icon,
  label,
  value
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 text-black-60 dark:text-black-40 mt-0.5", children: icon }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-0.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-black-60 dark:text-black-40 font-medium", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] text-black-primary dark:text-black-caption break-words", children: value })
  ] })
] });
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Overlay, {});
}
function ThemeSync() {
  const mode = useThemeStore((s) => s.mode);
  reactExports.useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
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
    console.warn("[InfoDialog] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().mode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Info dialog root container not found");
  }
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
