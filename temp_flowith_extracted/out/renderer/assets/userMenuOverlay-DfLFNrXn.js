import { r as reactExports, d as ReactDOM, j as jsxRuntimeExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { r as resolveSystemTheme } from "./theme-sVdefUwF.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { p } from "./IconBase.es-_t4ebd3Z.js";
import { g as getFlowithWebsiteUrl, o as o$1, c as c$1 } from "./constants-BVkfsh2w.js";
import { e as e$5 } from "./Globe.es-CmyzxKvS.js";
import { o as o$2 } from "./SmileySticker.es-CCbPvZ_U.js";
import { I as I18nextProvider, i as instance, L as LocaleSync, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import "./context-CbCu0iMB.js";
const a$1 = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M192,64V168L88,64Z", opacity: "0.2" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M192,56H88a8,8,0,0,0-5.66,13.66L128.69,116,58.34,186.34a8,8,0,0,0,11.32,11.32L140,127.31l46.34,46.35A8,8,0,0,0,200,168V64A8,8,0,0,0,192,56Zm-8,92.69-38.34-38.34h0L107.31,72H184Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M200,64V168a8,8,0,0,1-13.66,5.66L140,127.31,69.66,197.66a8,8,0,0,1-11.32-11.32L128.69,116,82.34,69.66A8,8,0,0,1,88,56H192A8,8,0,0,1,200,64Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M198,64V168a6,6,0,0,1-12,0V78.48L68.24,196.24a6,6,0,0,1-8.48-8.48L177.52,70H88a6,6,0,0,1,0-12H192A6,6,0,0,1,198,64Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M196,64V168a4,4,0,0,1-8,0V73.66L66.83,194.83a4,4,0,0,1-5.66-5.66L182.34,68H88a4,4,0,0,1,0-8H192A4,4,0,0,1,196,64Z" }))
  ]
]);
const l = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M230.66,86l-96-64a12,12,0,0,0-13.32,0l-96,64A12,12,0,0,0,20,96V200a20,20,0,0,0,20,20H216a20,20,0,0,0,20-20V96A12,12,0,0,0,230.66,86ZM89.81,152,44,184.31v-65ZM114.36,164h27.28L187,196H69.05ZM166.19,152,212,119.29v65ZM128,46.42l74.86,49.91L141.61,140H114.39L53.14,96.33Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M224,96l-78.55,56h-34.9L32,96l96-64Z", opacity: "0.2" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M228.44,89.34l-96-64a8,8,0,0,0-8.88,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.44,89.34ZM96.72,152,40,192V111.53Zm16.37,8h29.82l56.63,40H56.46Zm46.19-8L216,111.53V192ZM128,41.61l81.91,54.61-67,47.78H113.11l-67-47.78Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M228.44,89.34l-96-64a8,8,0,0,0-8.88,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.44,89.34ZM96.72,152,40,192V111.53Zm16.37,8h29.82l56.63,40H56.46Zm46.19-8L216,111.53V192Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M227.33,91l-96-64a6,6,0,0,0-6.66,0l-96,64A6,6,0,0,0,26,96V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V96A6,6,0,0,0,227.33,91ZM100.18,152,38,195.9V107.65Zm12.27,6h31.1l62.29,44H50.16Zm43.37-6L218,107.65V195.9ZM128,39.21l85.43,57L143.53,146H112.47L42.57,96.17Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M228.44,89.34l-96-64a8,8,0,0,0-8.88,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.44,89.34ZM96.72,152,40,192V111.53Zm16.37,8h29.82l56.63,40H56.46Zm46.19-8L216,111.53V192ZM128,41.61l81.91,54.61-67,47.78H113.11l-67-47.78Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M226.22,92.67l-96-64a4,4,0,0,0-4.44,0l-96,64A4,4,0,0,0,28,96V200a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V96A4,4,0,0,0,226.22,92.67ZM103.63,152,36,199.76v-96Zm8.19,4h32.36l68,48H43.86Zm40.55-4L220,103.76v96ZM128,36.81,217,96.11,144.17,148H111.83L39.05,96.11Z" }))
  ]
]);
const a = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M236.37,139.4a12,12,0,0,0-12-3A84.07,84.07,0,0,1,119.6,31.59a12,12,0,0,0-15-15A108.86,108.86,0,0,0,49.69,55.07,108,108,0,0,0,136,228a107.09,107.09,0,0,0,64.93-21.69,108.86,108.86,0,0,0,38.44-54.94A12,12,0,0,0,236.37,139.4Zm-49.88,47.74A84,84,0,0,1,68.86,69.51,84.93,84.93,0,0,1,92.27,48.29Q92,52.13,92,56A108.12,108.12,0,0,0,200,164q3.87,0,7.71-.27A84.79,84.79,0,0,1,186.49,187.14Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M227.89,147.89A96,96,0,1,1,108.11,28.11,96.09,96.09,0,0,0,227.89,147.89Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M235.54,150.21a104.84,104.84,0,0,1-37,52.91A104,104,0,0,1,32,120,103.09,103.09,0,0,1,52.88,57.48a104.84,104.84,0,0,1,52.91-37,8,8,0,0,1,10,10,88.08,88.08,0,0,0,109.8,109.8,8,8,0,0,1,10,10Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M232.13,143.64a6,6,0,0,0-6-1.49A90.07,90.07,0,0,1,113.86,29.85a6,6,0,0,0-7.49-7.48A102.88,102.88,0,0,0,54.48,58.68,102,102,0,0,0,197.32,201.52a102.88,102.88,0,0,0,36.31-51.89A6,6,0,0,0,232.13,143.64Zm-42,48.29a90,90,0,0,1-126-126A90.9,90.9,0,0,1,99.65,37.66,102.06,102.06,0,0,0,218.34,156.35,90.9,90.9,0,0,1,190.1,191.93Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M230.72,145.06a4,4,0,0,0-4-1A92.08,92.08,0,0,1,111.94,29.27a4,4,0,0,0-5-5A100.78,100.78,0,0,0,56.08,59.88a100,100,0,0,0,140,140,100.78,100.78,0,0,0,35.59-50.87A4,4,0,0,0,230.72,145.06ZM191.3,193.53A92,92,0,0,1,62.47,64.7a93,93,0,0,1,39.88-30.35,100.09,100.09,0,0,0,119.3,119.3A93,93,0,0,1,191.3,193.53Z" }))
  ]
]);
const e$4 = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M227.85,46.89a20,20,0,0,0-18.74-18.74c-13.13-.77-46.65.42-74.48,28.24L131,60H74.36a19.83,19.83,0,0,0-14.14,5.86L25.87,100.19a20,20,0,0,0,11.35,33.95l37.14,5.18,42.32,42.32,5.19,37.18A19.88,19.88,0,0,0,135.34,235a20.13,20.13,0,0,0,6.37,1,19.9,19.9,0,0,0,14.1-5.87l34.34-34.35A19.85,19.85,0,0,0,196,181.64V125l3.6-3.59C227.43,93.54,228.62,60,227.85,46.89ZM76,84h31L75.75,115.28l-27.23-3.8ZM151.6,73.37A72.27,72.27,0,0,1,204,52a72.17,72.17,0,0,1-21.38,52.41L128,159,97,128ZM172,180l-27.49,27.49-3.8-27.23L172,149Zm-72,22c-8.71,11.85-26.19,26-60,26a12,12,0,0,1-12-12c0-33.84,14.12-51.32,26-60A12,12,0,1,1,68.18,175.3C62.3,179.63,55.51,187.8,53,203c15.21-2.51,23.37-9.3,27.7-15.18A12,12,0,1,1,100,202Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M184,120v61.65a8,8,0,0,1-2.34,5.65l-34.35,34.35a8,8,0,0,1-13.57-4.53L128,176ZM136,72H74.35a8,8,0,0,0-5.65,2.34L34.35,108.69a8,8,0,0,0,4.53,13.57L80,128ZM40,216c37.65,0,50.69-19.69,54.56-28.18L68.18,161.44C59.69,165.31,40,178.35,40,216Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M223.85,47.12a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.41,27.07L132.69,64H74.36A15.91,15.91,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A15.91,15.91,0,0,0,192,181.64V123.31l4.77-4.77C223.45,91.86,224.6,59.71,223.85,47.12ZM74.36,80h42.33L77.16,119.52,40,114.34Zm74.41-9.45a76.65,76.65,0,0,1,59.11-22.47,76.46,76.46,0,0,1-22.42,59.16L128,164.68,91.32,128ZM176,181.64,141.67,216l-5.19-37.17L176,139.31Zm-74.16,9.5C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M221.86,47.24a14,14,0,0,0-13.11-13.1c-12.31-.73-43.77.39-69.88,26.5L133.52,66H74.35a13.9,13.9,0,0,0-9.89,4.1L30.11,104.44a14,14,0,0,0,7.94,23.76l39.13,5.46,45.16,45.16L127.8,218a14,14,0,0,0,23.76,7.92l34.35-34.35a13.91,13.91,0,0,0,4.1-9.89V122.48l5.35-5.35h0C221.46,91,222.59,59.56,221.86,47.24ZM38.11,115a2,2,0,0,1,.49-2L72.94,78.58A2,2,0,0,1,74.35,78h47.17L77.87,121.64l-38.14-5.32A1.93,1.93,0,0,1,38.11,115ZM178,181.65a2,2,0,0,1-.59,1.41L143.08,217.4a2,2,0,0,1-3.4-1.11l-5.32-38.16L178,134.48Zm8.87-73h0L128,167.51,88.49,128l58.87-58.88a78.47,78.47,0,0,1,60.69-23A2,2,0,0,1,209.88,48,78.47,78.47,0,0,1,186.88,108.64ZM100,190.31C95.68,199.84,81.13,222,40,222a6,6,0,0,1-6-6c0-41.13,22.16-55.68,31.69-60a6,6,0,1,1,5,10.92c-7,3.17-22.53,13.52-24.47,42.91,29.39-1.94,39.74-17.52,42.91-24.47a6,6,0,1,1,10.92,5Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M223.85,47.12a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.41,27.07L132.69,64H74.36A15.91,15.91,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A15.91,15.91,0,0,0,192,181.64V123.31l4.77-4.77C223.45,91.86,224.6,59.71,223.85,47.12ZM74.36,80h42.33L77.16,119.52,40,114.34Zm74.41-9.45a76.65,76.65,0,0,1,59.11-22.47,76.46,76.46,0,0,1-22.42,59.16L128,164.68,91.32,128ZM176,181.64,141.67,216l-5.19-37.17L176,139.31Zm-74.16,9.5C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M219.86,47.36a12,12,0,0,0-11.22-11.22c-12-.71-42.82.38-68.35,25.91L134.35,68h-60a11.9,11.9,0,0,0-8.48,3.52L31.52,105.85a12,12,0,0,0,6.81,20.37l39.79,5.55,46.11,46.11,5.55,39.81a12,12,0,0,0,20.37,6.79l34.34-34.35a11.9,11.9,0,0,0,3.52-8.48v-60l5.94-5.94C219.48,90.18,220.57,59.41,219.86,47.36ZM36.21,115.6a3.94,3.94,0,0,1,1-4.09L71.53,77.17A4,4,0,0,1,74.35,76h52L78.58,123.76,39.44,118.3A3.94,3.94,0,0,1,36.21,115.6ZM180,181.65a4,4,0,0,1-1.17,2.83l-34.35,34.34a4,4,0,0,1-6.79-2.25l-5.46-39.15L180,129.65Zm-52-11.31L85.66,128l60.28-60.29c23.24-23.24,51.25-24.23,62.22-23.58a3.93,3.93,0,0,1,3.71,3.71c.65,11-.35,39-23.58,62.22ZM98.21,189.48C94,198.66,80,220,40,220a4,4,0,0,1-4-4c0-40,21.34-54,30.52-58.21a4,4,0,0,1,3.32,7.28c-7.46,3.41-24.43,14.66-25.76,46.85,32.19-1.33,43.44-18.3,46.85-25.76a4,4,0,1,1,7.28,3.32Z" }))
  ]
]);
const e$3 = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M124,216a12,12,0,0,1-12,12H48a12,12,0,0,1-12-12V40A12,12,0,0,1,48,28h64a12,12,0,0,1,0,24H60V204h52A12,12,0,0,1,124,216Zm108.49-96.49-40-40a12,12,0,0,0-17,17L195,116H112a12,12,0,0,0,0,24h83l-19.52,19.51a12,12,0,0,0,17,17l40-40A12,12,0,0,0,232.49,119.51Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M224,56V200a16,16,0,0,1-16,16H48V40H208A16,16,0,0,1,224,56Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40A8,8,0,0,0,176,88v32H112a8,8,0,0,0,0,16h64v32a8,8,0,0,0,13.66,5.66l40-40A8,8,0,0,0,229.66,122.34Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M118,216a6,6,0,0,1-6,6H48a6,6,0,0,1-6-6V40a6,6,0,0,1,6-6h64a6,6,0,0,1,0,12H54V210h58A6,6,0,0,1,118,216Zm110.24-92.24-40-40a6,6,0,0,0-8.48,8.48L209.51,122H112a6,6,0,0,0,0,12h97.51l-29.75,29.76a6,6,0,1,0,8.48,8.48l40-40A6,6,0,0,0,228.24,123.76Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M116,216a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V40a4,4,0,0,1,4-4h64a4,4,0,0,1,0,8H52V212h60A4,4,0,0,1,116,216Zm110.83-90.83-40-40a4,4,0,0,0-5.66,5.66L214.34,124H112a4,4,0,0,0,0,8H214.34l-33.17,33.17a4,4,0,0,0,5.66,5.66l40-40A4,4,0,0,0,226.83,125.17Z" }))
  ]
]);
const e$2 = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M116,36V20a12,12,0,0,1,24,0V36a12,12,0,0,1-24,0Zm80,92a68,68,0,1,1-68-68A68.07,68.07,0,0,1,196,128Zm-24,0a44,44,0,1,0-44,44A44.05,44.05,0,0,0,172,128ZM51.51,68.49a12,12,0,1,0,17-17l-12-12a12,12,0,0,0-17,17Zm0,119-12,12a12,12,0,0,0,17,17l12-12a12,12,0,1,0-17-17ZM196,72a12,12,0,0,0,8.49-3.51l12-12a12,12,0,0,0-17-17l-12,12A12,12,0,0,0,196,72Zm8.49,115.51a12,12,0,0,0-17,17l12,12a12,12,0,0,0,17-17ZM48,128a12,12,0,0,0-12-12H20a12,12,0,0,0,0,24H36A12,12,0,0,0,48,128Zm80,80a12,12,0,0,0-12,12v16a12,12,0,0,0,24,0V220A12,12,0,0,0,128,208Zm108-92H220a12,12,0,0,0,0,24h16a12,12,0,0,0,0-24Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M184,128a56,56,0,1,1-56-56A56,56,0,0,1,184,128Z", opacity: "0.2" }), /* @__PURE__ */ reactExports.createElement("path", { d: "M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm8,24a64,64,0,1,0,64,64A64.07,64.07,0,0,0,128,64ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M122,40V16a6,6,0,0,1,12,0V40a6,6,0,0,1-12,0Zm68,88a62,62,0,1,1-62-62A62.07,62.07,0,0,1,190,128Zm-12,0a50,50,0,1,0-50,50A50.06,50.06,0,0,0,178,128ZM59.76,68.24a6,6,0,1,0,8.48-8.48l-16-16a6,6,0,0,0-8.48,8.48Zm0,119.52-16,16a6,6,0,1,0,8.48,8.48l16-16a6,6,0,1,0-8.48-8.48ZM192,70a6,6,0,0,0,4.24-1.76l16-16a6,6,0,0,0-8.48-8.48l-16,16A6,6,0,0,0,192,70Zm4.24,117.76a6,6,0,0,0-8.48,8.48l16,16a6,6,0,0,0,8.48-8.48ZM46,128a6,6,0,0,0-6-6H16a6,6,0,0,0,0,12H40A6,6,0,0,0,46,128Zm82,82a6,6,0,0,0-6,6v24a6,6,0,0,0,12,0V216A6,6,0,0,0,128,210Zm112-88H216a6,6,0,0,0,0,12h24a6,6,0,0,0,0-12Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M124,40V16a4,4,0,0,1,8,0V40a4,4,0,0,1-8,0Zm64,88a60,60,0,1,1-60-60A60.07,60.07,0,0,1,188,128Zm-8,0a52,52,0,1,0-52,52A52.06,52.06,0,0,0,180,128ZM61.17,66.83a4,4,0,0,0,5.66-5.66l-16-16a4,4,0,0,0-5.66,5.66Zm0,122.34-16,16a4,4,0,0,0,5.66,5.66l16-16a4,4,0,0,0-5.66-5.66ZM192,68a4,4,0,0,0,2.83-1.17l16-16a4,4,0,1,0-5.66-5.66l-16,16A4,4,0,0,0,192,68Zm2.83,121.17a4,4,0,0,0-5.66,5.66l16,16a4,4,0,0,0,5.66-5.66ZM40,124H16a4,4,0,0,0,0,8H40a4,4,0,0,0,0-8Zm88,88a4,4,0,0,0-4,4v24a4,4,0,0,0,8,0V216A4,4,0,0,0,128,212Zm112-88H216a4,4,0,0,0,0,8h24a4,4,0,0,0,0-8Z" }))
  ]
]);
const r = reactExports.forwardRef((t2, e2) => /* @__PURE__ */ reactExports.createElement(p, { ref: e2, ...t2, weights: a$1 }));
r.displayName = "ArrowUpRightIcon";
const o = reactExports.forwardRef((n, p$1) => /* @__PURE__ */ reactExports.createElement(p, { ref: p$1, ...n, weights: l }));
o.displayName = "EnvelopeOpenIcon";
const e$1 = reactExports.forwardRef((r2, t2) => /* @__PURE__ */ reactExports.createElement(p, { ref: t2, ...r2, weights: a }));
e$1.displayName = "MoonIcon";
const s$1 = e$1;
const c = reactExports.forwardRef((e2, t2) => /* @__PURE__ */ reactExports.createElement(p, { ref: t2, ...e2, weights: e$4 }));
c.displayName = "RocketLaunchIcon";
const t = reactExports.forwardRef((e2, r2) => /* @__PURE__ */ reactExports.createElement(p, { ref: r2, ...e2, weights: e$3 }));
t.displayName = "SignOutIcon";
const e = reactExports.forwardRef((r2, t2) => /* @__PURE__ */ reactExports.createElement(p, { ref: t2, ...r2, weights: e$2 }));
e.displayName = "SunIcon";
const s = e;
const SUBSCRIPTION_COLORS = {
  free: {
    light: "#2D3139",
    // text-black-primary
    dark: "#FFFFFF"
    // text-white
  },
  professional: {
    light: "#0F80F0",
    // blue-50
    dark: "#6FB2F6"
    // blue-70
  },
  ultimate: {
    light: "#5837FB",
    // purple-60
    dark: "#AB9BFD"
    // purple-80
  },
  infinite: {
    light: "#CCA300",
    // yellow-40
    dark: "#FFCC00"
    // yellow-50
  }
};
const THEME_PILL_ANIMATION = {
  // Spring animation for pill scale/opacity (stiffness: 400, damping: 25)
  SPRING_DURATION: 400,
  // ~400ms for spring to settle
  // Label expand animation (spring with same config)
  LABEL_EXPAND_DURATION: 300,
  // ~300ms for width animation
  // Buffer for color transitions and visual settling
  VISUAL_BUFFER: 200,
  // Total time user sees the animation before menu closes
  get TOTAL_DURATION() {
    return Math.max(this.SPRING_DURATION, this.LABEL_EXPAND_DURATION) + this.VISUAL_BUFFER;
  }
};
const getSubscriptionColor = (subType, isDark) => {
  const defaultColor = isDark ? "#FFFFFF" : "#2D3139";
  if (!subType) return defaultColor;
  const normalizedType = subType.toLowerCase();
  const colors = SUBSCRIPTION_COLORS[normalizedType];
  if (!colors) {
    return defaultColor;
  }
  return isDark ? colors.dark : colors.light;
};
const formatCredits = (credits) => {
  if (credits >= 1e6) {
    return `${(credits / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (credits >= 1e3) {
    return `${(credits / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return credits.toString();
};
const ThemeSlider = ({ currentMode, isDark, onModeChange, t: t2 }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const handleExpand = () => {
    setIsExpanded(true);
  };
  const modes = [
    {
      id: "light",
      icon: s,
      label: t2("userMenu.lightMode").replace(" Mode", "").replace("模式", ""),
      weight: "duotone"
    },
    {
      id: "dark",
      icon: s$1,
      label: t2("userMenu.darkMode").replace(" Mode", "").replace("模式", ""),
      weight: "duotone"
    },
    {
      id: "system",
      icon: c$1,
      label: t2("userMenu.systemMode").replace(" Mode", "").replace("模式", ""),
      weight: "duotone"
    }
  ];
  const currentModeData = modes.find((m) => m.id === currentMode);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", style: { height: "36px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, mode: "wait", children: !isExpanded ? (
    // Collapsed: Menu item button
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.button,
      {
        type: "button",
        onClick: handleExpand,
        className: cn(
          "absolute inset-0 flex w-full items-center gap-3 rounded-[8px] pl-0 px-2 py-2 text-sm transition-colors",
          isDark ? "text-[#D0D4DB] hover:bg-[#22252B]" : "text-[#2C3038] hover:bg-[#F1F2F4]"
        ),
        initial: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            currentModeData.icon,
            {
              className: "flex-shrink-0 h-4 w-4",
              weight: currentModeData.weight,
              style: { color: isDark ? "#C6CAD2" : "#2D3139" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left", children: t2("userMenu.theme") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px]", isDark ? "text-[#747D8A]" : "text-[#68707F]"), children: currentModeData.label })
        ]
      },
      "collapsed"
    )
  ) : (
    // Expanded: Show floating pills
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute inset-0 flex items-center justify-center gap-1.5 px-2 py-0",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
        children: modes.map((mode) => {
          const isActive = currentMode === mode.id;
          const Icon = mode.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              onClick: () => onModeChange(mode.id),
              className: "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-all overflow-hidden",
              style: {
                backgroundColor: isActive ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" : "transparent",
                border: `1px solid ${isActive ? isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" : "transparent"}`,
                color: isActive ? isDark ? "#E5E7EB" : "#1F2937" : isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
                boxShadow: isActive ? isDark ? "0 1px 2px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1)" : "0 1px 2px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(255,255,255,0.6)" : "none"
              },
              initial: { scale: 0.8, opacity: 0 },
              animate: {
                scale: isActive ? 1 : 0.92,
                opacity: isActive ? 1 : 0.6
              },
              whileHover: {
                scale: 1,
                opacity: 1,
                backgroundColor: isActive ? isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
              },
              whileTap: { scale: 0.96 },
              transition: { type: "spring", stiffness: 400, damping: 25 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    animate: {
                      scale: isActive ? 1 : 0.9
                    },
                    transition: { type: "spring", stiffness: 300, damping: 20 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14, weight: mode.weight })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.span,
                  {
                    initial: { width: 0, opacity: 0, marginLeft: 0 },
                    animate: { width: "auto", opacity: 1, marginLeft: 0 },
                    exit: { width: 0, opacity: 0, marginLeft: 0 },
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      opacity: { duration: 0.15 }
                    },
                    className: "text-[10px] font-medium whitespace-nowrap",
                    style: {
                      fontFamily: "ABC Oracle, sans-serif",
                      fontWeight: 400,
                      letterSpacing: "-0.01em"
                    },
                    children: mode.label
                  }
                ) }),
                isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.div,
                  {
                    className: "absolute inset-0 rounded-full pointer-events-none",
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                    style: {
                      background: isDark ? "radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)" : "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)",
                      mixBlendMode: isDark ? "lighten" : "overlay"
                    }
                  }
                )
              ]
            },
            mode.id
          );
        })
      },
      "expanded"
    )
  ) }) });
};
const App = () => {
  const { t: t$1 } = useTranslation();
  const [open, setOpen] = reactExports.useState(false);
  const [payload, setPayload] = reactExports.useState(null);
  const [hasInvitationCodes, setHasInvitationCodes] = reactExports.useState(false);
  const [isMounting, setIsMounting] = reactExports.useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = reactExports.useState(false);
  const { locale } = useLocaleStore();
  const cardRef = reactExports.useRef(null);
  const lastHeightRef = reactExports.useRef(0);
  const [currentMode, setCurrentMode] = reactExports.useState("dark");
  const [menuOpenKey, setMenuOpenKey] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const handleOpen = (event) => {
      const detail = event.detail;
      if (detail) {
        const theme = detail.theme ?? "light";
        document.documentElement.classList.toggle("dark", theme === "dark");
        setIsMounting(true);
        setPayload(detail);
        setCurrentMode(detail.mode ?? "dark");
        setHasInvitationCodes(!!detail.hasInvitationCodes);
        setMenuOpenKey((prev) => prev + 1);
        setOpen(true);
      }
    };
    const handleClose = () => {
      setOpen(false);
    };
    window.addEventListener("userMenuOverlay:open", handleOpen);
    window.addEventListener("userMenuOverlay:close", handleClose);
    return () => {
      window.removeEventListener("userMenuOverlay:open", handleOpen);
      window.removeEventListener("userMenuOverlay:close", handleClose);
    };
  }, []);
  reactExports.useEffect(() => {
    const themeAPI = window.themeAPI;
    if (!themeAPI?.onModeChange) return;
    const cleanup = themeAPI.onModeChange((state) => {
      setCurrentMode(state.mode);
    });
    return () => cleanup?.();
  }, []);
  reactExports.useEffect(() => {
    if (!open) {
      lastHeightRef.current = 0;
      setLanguageDialogOpen(false);
    }
  }, [open]);
  reactExports.useLayoutEffect(() => {
    if (open && isMounting) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsMounting(false);
        });
      });
    }
  }, [open, isMounting]);
  reactExports.useLayoutEffect(() => {
    if (!open) return;
    const element = cardRef.current;
    if (!element) return;
    const sendHeight = () => {
      const rect = element.getBoundingClientRect();
      const measured = Math.ceil(rect.height) + 4;
      if (!measured) return;
      if (Math.abs(measured - lastHeightRef.current) <= 2) return;
      lastHeightRef.current = measured;
      window.userMenuOverlay?.resize?.(measured);
    };
    const measureWhenReady = async () => {
      try {
        await document.fonts.load('350 14px "ABC Oracle"');
        await document.fonts.load('400 14px "ABC Oracle"');
        await document.fonts.load('350 12px "ABC Oracle"');
        sendHeight();
      } catch (error) {
        console.warn("[UserMenu] Font loading check failed, measuring anyway:", error);
        sendHeight();
      }
    };
    measureWhenReady();
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        sendHeight();
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [open]);
  reactExports.useEffect(() => {
    const handleCodesUpdate = (event) => {
      const detail = event.detail;
      if (detail) {
        setHasInvitationCodes(detail.hasInvitationCodes);
      }
    };
    window.addEventListener("userMenuOverlay:codesUpdate", handleCodesUpdate);
    return () => {
      window.removeEventListener(
        "userMenuOverlay:codesUpdate",
        handleCodesUpdate
      );
    };
  }, []);
  reactExports.useEffect(() => {
    const handleLanguageDialogOpen = () => {
      setLanguageDialogOpen(true);
    };
    const handleLanguageDialogClose = () => {
      setLanguageDialogOpen(false);
    };
    window.addEventListener("languageDialog:opened", handleLanguageDialogOpen);
    window.addEventListener("languageDialog:closed", handleLanguageDialogClose);
    return () => {
      window.removeEventListener("languageDialog:opened", handleLanguageDialogOpen);
      window.removeEventListener("languageDialog:closed", handleLanguageDialogClose);
    };
  }, []);
  reactExports.useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      backgroundColor: body.style.backgroundColor,
      backgroundImage: body.style.backgroundImage,
      backdropFilter: body.style.backdropFilter,
      margin: body.style.margin,
      htmlBackgroundColor: html.style.backgroundColor,
      htmlBackgroundImage: html.style.backgroundImage
    };
    body.style.backgroundColor = "transparent";
    body.style.backgroundImage = "none";
    body.style.backdropFilter = "none";
    body.style.margin = "0";
    html.style.backgroundColor = "transparent";
    html.style.backgroundImage = "none";
    return () => {
      body.style.backgroundColor = previous.backgroundColor;
      body.style.backgroundImage = previous.backgroundImage;
      body.style.backdropFilter = previous.backdropFilter;
      body.style.margin = previous.margin;
      html.style.backgroundColor = previous.htmlBackgroundColor;
      html.style.backgroundImage = previous.htmlBackgroundImage;
    };
  }, []);
  const user = payload?.user;
  const [isDark, setIsDark] = React.useState((payload?.theme ?? "light") === "dark");
  const userInfoRef = React.useRef(null);
  React.useEffect(() => {
    const resolved = currentMode === "system" ? resolveSystemTheme() : currentMode;
    setIsDark(resolved === "dark");
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [currentMode]);
  React.useEffect(() => {
    if (open) {
      rainbowState.activeIndex = -1;
      rainbowState.subscribers.forEach((cb) => {
        try {
          cb(-1);
        } catch (error) {
          console.warn("[UserMenu] Error resetting subscriber:", error);
        }
      });
    }
  }, [open]);
  React.useEffect(() => {
    if (!open || !user || !user.email) return;
    const userInfoElement = userInfoRef.current;
    if (!userInfoElement) return;
    let cleanupFn = null;
    const handleMouseEnter = () => {
      try {
        const name = user.fullName || user.email;
        if (!name || typeof name !== "string" || typeof user.email !== "string") return;
        const totalLength = name.length + user.email.length;
        if (totalLength <= 0 || totalLength > 500) return;
        cleanupFn = startRainbowAnimation(totalLength, true);
      } catch (error) {
        console.warn("[UserMenu] Error starting rainbow animation:", error);
      }
    };
    const handleMouseLeave = () => {
      if (cleanupFn) {
        cleanupFn();
        cleanupFn = null;
      }
    };
    userInfoElement.addEventListener("mouseenter", handleMouseEnter);
    userInfoElement.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      userInfoElement.removeEventListener("mouseenter", handleMouseEnter);
      userInfoElement.removeEventListener("mouseleave", handleMouseLeave);
      if (cleanupFn) cleanupFn();
    };
  }, [open, user]);
  const sendAction = React.useCallback((type, mode) => {
    window.userMenuOverlay?.performAction?.({ type, mode });
  }, []);
  const handleThemeToggle = React.useCallback((mode) => {
    setCurrentMode(mode);
    sendAction("setTheme", mode);
    setTimeout(() => {
      window.userMenuOverlay?.close();
    }, THEME_PILL_ANIMATION.TOTAL_DURATION);
  }, [sendAction]);
  const handleAction = React.useCallback(
    (type) => {
      sendAction(type);
      window.userMenuOverlay?.close();
    },
    [sendAction]
  );
  reactExports.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        window.userMenuOverlay?.close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none relative h-full w-full bg-transparent", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        [data-mounting="true"] *,
        [data-mounting="true"] *::before,
        [data-mounting="true"] *::after {
          transition: none !important;
          animation: none !important;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && user && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "pointer-events-auto absolute inset-0",
          isDark ? "text-[#D0D4DB]" : "text-[#2C3038]"
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: cardRef, style: { width: `${payload?.size.width ?? 250}px` }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            "data-mounting": isMounting,
            className: cn(
              "flex w-full flex-col overflow-hidden rounded-[8px] border",
              isDark ? "border-[#2B3036] bg-[#121516]" : "border-black-95 bg-[#FFFFFF]"
            ),
            initial: { opacity: 0, scale: 0.96 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.96 },
            transition: {
              duration: 0.15,
              ease: [0.16, 1, 0.3, 1]
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col", children: [
                payload?.totalCredits !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      const locale2 = useLocaleStore.getState().locale;
                      window.sideBarAPI?.tabs?.create(`${getFlowithWebsiteUrl(locale2)}/sub`, true);
                      window.userMenuOverlay?.close();
                    },
                    className: cn(
                      "flex items-center gap-2 px-4 pt-3 pb-2 w-full transition-all cursor-pointer group",
                      "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    ),
                    title: t$1("userMenu.clickToManageSubscription"),
                    children: [
                      payload.subscriptionType && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "text-[8px] font-extrabold uppercase tracking-wide flex-shrink-0",
                          style: { color: getSubscriptionColor(payload.subscriptionType, isDark) },
                          children: payload.subscriptionType
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-[4] relative group/progress flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: cn(
                            "h-1 rounded-full overflow-hidden w-full",
                            isDark ? "bg-[#1F2326]" : "bg-[#E5E7EB]"
                          ),
                          title: `Total: ${payload.totalCredits.toLocaleString()} credits`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "h-full transition-all duration-300",
                              style: {
                                backgroundColor: getSubscriptionColor(payload.subscriptionType, isDark),
                                width: `${Math.min(100, Math.max(0, (payload.remainingCredits ?? 0) / payload.totalCredits * 100))}%`
                              }
                            }
                          )
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group/credits flex-shrink-0 flex items-center", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "span",
                          {
                            className: "text-[8px] font-medium cursor-default",
                            style: { color: getSubscriptionColor(payload.subscriptionType, isDark) },
                            children: [
                              formatCredits(payload.remainingCredits ?? 0),
                              " ",
                              t$1("userMenu.creditsLeft")
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-5 right-0 opacity-0 group-hover/credits:opacity-100 pointer-events-none transition-opacity z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
                          "text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-lg",
                          isDark ? "bg-[#2B3036] text-[#D0D4DB]" : "bg-[#1F2326] text-white"
                        ), children: [
                          (payload.remainingCredits ?? 0).toLocaleString(),
                          " credits"
                        ] }) })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: userInfoRef, className: "flex flex-col gap-2 px-4 pb-3 pt-1 relative cursor-pointer", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      RainbowText,
                      {
                        text: user.fullName || user.email,
                        isDark,
                        type: "name"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          const locale2 = useLocaleStore.getState().locale;
                          window.sideBarAPI?.tabs?.create(`${getFlowithWebsiteUrl(locale2)}/pricing`, true);
                          window.userMenuOverlay?.close();
                        },
                        className: cn(
                          "group relative px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 flex items-center gap-1 overflow-hidden",
                          "transition-colors duration-300",
                          "hover:backdrop-blur-md",
                          isDark ? "bg-[#22252B] hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 text-[#C6CAD2] hover:text-[#E0E4EB]" : "bg-[#F1F2F4] hover:bg-gradient-to-br hover:from-black/5 hover:to-black/3 text-[#2D3139]"
                        ),
                        style: {
                          boxShadow: "none",
                          border: "1px solid transparent"
                        },
                        onMouseEnter: (e2) => {
                          const target = e2.currentTarget;
                          if (isDark) {
                            target.style.boxShadow = "inset 0 1px 0 0 rgba(255,255,255,0.1), 0 1px 2px 0 rgba(0,0,0,0.2)";
                            target.style.borderColor = "rgba(255,255,255,0.12)";
                          } else {
                            target.style.boxShadow = "inset 0 1px 0 0 rgba(255,255,255,0.5), 0 1px 2px 0 rgba(0,0,0,0.05)";
                            target.style.borderColor = "rgba(0,0,0,0.08)";
                          }
                        },
                        onMouseLeave: (e2) => {
                          const target = e2.currentTarget;
                          target.style.boxShadow = "none";
                          target.style.borderColor = "transparent";
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            r,
                            {
                              className: "relative z-10 flex-shrink-0 h-3 w-3 transition-colors"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative z-10", children: t$1("userMenu.upgrade") })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    RainbowText,
                    {
                      text: user.email,
                      isDark,
                      type: "email",
                      nameLength: (user.fullName || user.email).length
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TransitionSmoke,
                    {
                      nameLength: (user.fullName || user.email).length,
                      totalLength: (user.fullName || user.email).length + user.email.length,
                      isDark
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-scrollbar flex-1 space-y-1 overflow-y-auto pl-2 pr-2 pt-1 pb-2 max-h-[360px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ThemeSlider,
                  {
                    currentMode,
                    isDark,
                    onModeChange: handleThemeToggle,
                    t: t$1
                  },
                  menuOpenKey
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OverlayButton,
                  {
                    icon: e$5,
                    label: t$1("userMenu.language"),
                    rightContent: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                        "text-[10px] font-mono uppercase tracking-wide",
                        isDark ? "text-[#747D8A]" : "text-[#68707F]"
                      ), children: locale }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "w-1.5 h-1.5 rounded-full",
                          style: {
                            backgroundColor: getSubscriptionColor(payload?.subscriptionType, isDark)
                          }
                        }
                      )
                    ] }),
                    onClick: (e2) => {
                      const button = e2.currentTarget;
                      const rect = button.getBoundingClientRect();
                      const position = {
                        x: rect.right + 5,
                        // 5px gap to the right
                        y: rect.top,
                        buttonWidth: rect.width,
                        buttonHeight: rect.height
                      };
                      window.sideBarAPI?.ui?.showLanguageDialog?.(position);
                    },
                    isDark,
                    isActive: languageDialogOpen
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OverlayButton,
                  {
                    icon: o$1,
                    label: t$1("userMenu.settings"),
                    onClick: () => {
                      window.sideBarAPI?.tabs?.create?.("flowith://settings", true);
                      window.userMenuOverlay?.close();
                    },
                    isDark
                  }
                ),
                hasInvitationCodes && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OverlayButton,
                  {
                    icon: o$2,
                    label: t$1("userMenu.invitationCode"),
                    onClick: () => {
                      console.log("[UserMenu] Opening invitation codes modal...");
                      window.sideBarAPI?.ui?.openInvitationCodesModal?.();
                      window.userMenuOverlay?.close();
                    },
                    isDark
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OverlayButton,
                  {
                    icon: c,
                    label: t$1("userMenu.checkUpdates"),
                    onClick: async () => {
                      console.log("🔍 [UserMenu] Check for Updates clicked");
                      try {
                        window.userMenuOverlay?.close();
                        console.log(
                          "🔍 [UserMenu] Calling window.sideBarAPI.update.checkForUpdates()"
                        );
                        const result = await window.sideBarAPI?.update?.checkForUpdates();
                        console.log("🔍 [UserMenu] Check result:", result);
                      } catch (error) {
                        console.error("🔍 [UserMenu] Check for Updates failed:", error);
                      }
                    },
                    isDark
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OverlayButton,
                  {
                    icon: o,
                    label: t$1("userMenu.contactUs"),
                    onClick: () => handleAction("openHelp"),
                    isDark
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "footer",
                {
                  className: cn(
                    "border-t pl-2 pr-2 py-2",
                    isDark ? "border-[#23272B]" : "border-[#E5E7EB]"
                  ),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    OverlayButton,
                    {
                      icon: t,
                      label: t$1("userMenu.signOut"),
                      onClick: () => handleAction("signOut"),
                      isDark,
                      variant: "danger"
                    }
                  )
                }
              )
            ]
          }
        ) })
      }
    ) })
  ] });
};
const RAINBOW_COLORS = [
  "#FF6B9D",
  // Soft coral pink
  "#C44569",
  // Deep rose
  "#A55EEA",
  // Vibrant purple
  "#5F27CD",
  // Royal purple
  "#48DBFB",
  // Bright cyan
  "#0ABDE3",
  // Ocean blue
  "#00D2D3",
  // Turquoise
  "#1DD1A1",
  // Mint green
  "#10AC84",
  // Emerald
  "#FFC312",
  // Sunset gold
  "#EE5A6F",
  // Coral red
  "#FF6348"
  // Soft orange-red
];
const getColorForIndex = (index) => {
  return RAINBOW_COLORS[index % RAINBOW_COLORS.length];
};
const rainbowState = {
  activeIndex: -1,
  subscribers: /* @__PURE__ */ new Set(),
  letterRefs: /* @__PURE__ */ new Map()
};
const RainbowText = ({ text, isDark, type, nameLength = 0 }) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const letters = text?.split("") || [];
  const offset = type === "email" ? nameLength : 0;
  React.useEffect(() => {
    const updateIndex = (globalIndex) => {
      try {
        const localIndex = globalIndex - offset;
        setActiveIndex(localIndex);
      } catch (error) {
        console.warn("[RainbowText] Error in updateIndex:", error);
      }
    };
    rainbowState.subscribers.add(updateIndex);
    return () => {
      rainbowState.subscribers.delete(updateIndex);
    };
  }, [offset]);
  const defaultColor = isDark ? "#D0D4DB" : "#2C3038";
  const emailColor = isDark ? "#747D8A" : "#68707F";
  if (!text || typeof text !== "string" || letters.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "truncate",
        type === "name" ? "flex-1" : ""
      ),
      style: {
        fontFamily: "ABC Oracle, sans-serif",
        fontWeight: type === "name" ? 400 : 350,
        fontSize: type === "name" ? "14px" : "12px",
        lineHeight: type === "name" ? "22px" : "16px",
        letterSpacing: "-0.02em"
      },
      children: letters.map((char, index) => {
        const isActive = activeIndex === index;
        const globalIndex = offset + index;
        const colorValue = getColorForIndex(globalIndex);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.span,
          {
            ref: (el) => {
              if (el) {
                rainbowState.letterRefs.set(globalIndex, el);
              } else {
                rainbowState.letterRefs.delete(globalIndex);
              }
            },
            style: {
              display: "inline-block"
            },
            animate: isActive ? {
              // Smooth smoke-like glow only
              color: [
                type === "email" ? emailColor : defaultColor,
                colorValue,
                colorValue,
                type === "email" ? emailColor : defaultColor
              ],
              textShadow: [
                `0 0 0px ${colorValue}00`,
                `0 0 16px ${colorValue}50, 0 0 8px ${colorValue}30`,
                `0 0 16px ${colorValue}50, 0 0 8px ${colorValue}30`,
                `0 0 0px ${colorValue}00`
              ],
              opacity: [1, 1, 1, 1]
            } : {
              color: type === "email" ? emailColor : defaultColor,
              textShadow: `0 0 0px transparent`
            },
            transition: {
              duration: 0.8,
              times: [0, 0.3, 0.7, 1],
              ease: "easeInOut"
            },
            children: char
          },
          `${char}-${index}`
        );
      })
    }
  );
};
const TransitionSmoke = ({ nameLength, totalLength }) => {
  const [showTransition, setShowTransition] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState("#e78284");
  const [pathData, setPathData] = React.useState({ startX: 0, startY: 0, endX: 0, endY: 0, length: 0, angle: 0 });
  const prevIndexRef = React.useRef(-1);
  const containerRef = React.useRef(null);
  const timeoutRef = React.useRef(null);
  React.useEffect(() => {
    const checkTransition = (globalIndex) => {
      try {
        const prevIndex = prevIndexRef.current;
        if (typeof globalIndex !== "number" || globalIndex < 0 || globalIndex >= totalLength) {
          return;
        }
        if (prevIndex === nameLength - 1 && globalIndex === nameLength) {
          const success = calculatePath(nameLength - 1, nameLength);
          if (success) {
            setCurrentColor(getColorForIndex(nameLength - 1));
            setShowTransition(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setShowTransition(false), 500);
          }
        } else if (prevIndex === nameLength && globalIndex === nameLength - 1) {
          const success = calculatePath(nameLength, nameLength - 1);
          if (success) {
            setCurrentColor(getColorForIndex(nameLength));
            setShowTransition(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setShowTransition(false), 500);
          }
        }
        prevIndexRef.current = globalIndex;
      } catch (error) {
        console.warn("[TransitionSmoke] Error in checkTransition:", error);
      }
    };
    rainbowState.subscribers.add(checkTransition);
    return () => {
      rainbowState.subscribers.delete(checkTransition);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nameLength, totalLength]);
  const calculatePath = (fromIndex, toIndex) => {
    try {
      const fromEl = rainbowState.letterRefs.get(fromIndex);
      const toEl = rainbowState.letterRefs.get(toIndex);
      if (!fromEl || !toEl || !containerRef.current) {
        return false;
      }
      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      if (!containerRect.width || !containerRect.height || !fromRect.width || !toRect.width) {
        return false;
      }
      const startX = fromRect.left - containerRect.left + fromRect.width / 2;
      const startY = fromRect.top - containerRect.top + fromRect.height / 2;
      const endX = toRect.left - containerRect.left + toRect.width / 2;
      const endY = toRect.top - containerRect.top + toRect.height / 2;
      if (!Number.isFinite(startX) || !Number.isFinite(startY) || !Number.isFinite(endX) || !Number.isFinite(endY)) {
        return false;
      }
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (length < 5) {
        return false;
      }
      setPathData({ startX, startY, endX, endY, length, angle });
      return true;
    } catch (error) {
      console.warn("[TransitionSmoke] Error in calculatePath:", error);
      return false;
    }
  };
  if (!showTransition) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: "absolute inset-0 pointer-events-none" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "absolute inset-0 pointer-events-none", style: { zIndex: 10 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute",
        style: {
          left: `${pathData.startX}px`,
          top: `${pathData.startY}px`,
          width: "4px",
          height: "4px",
          marginLeft: "-2px",
          marginTop: "-2px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${currentColor}FF 0%, ${currentColor}CC 50%, transparent 80%)`,
          boxShadow: `0 0 8px ${currentColor}DD, 0 0 16px ${currentColor}77`
        },
        initial: {
          opacity: 0,
          x: 0,
          y: 0
        },
        animate: {
          opacity: [0, 1, 0.8, 0],
          x: [0, pathData.endX - pathData.startX],
          y: [0, pathData.endY - pathData.startY]
        },
        transition: {
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1]
        }
      }
    ),
    [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "absolute",
        style: {
          left: `${pathData.startX}px`,
          top: `${pathData.startY}px`,
          width: `${3 - i * 0.5}px`,
          height: `${3 - i * 0.5}px`,
          marginLeft: `${-(3 - i * 0.5) / 2}px`,
          marginTop: `${-(3 - i * 0.5) / 2}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${currentColor}${Math.floor(200 - i * 40)} 0%, transparent 70%)`,
          boxShadow: `0 0 ${6 - i}px ${currentColor}${Math.floor(170 - i * 30)}`
        },
        initial: {
          opacity: 0,
          x: 0,
          y: 0
        },
        animate: {
          opacity: [0, 0.7 - i * 0.15, 0.5 - i * 0.1, 0],
          x: [0, pathData.endX - pathData.startX],
          y: [0, pathData.endY - pathData.startY]
        },
        transition: {
          duration: 0.4,
          delay: i * 0.04,
          ease: [0.25, 0.1, 0.25, 1]
        }
      },
      i
    ))
  ] });
};
const startRainbowAnimation = (totalLength, oneLoopOnly = false) => {
  if (!totalLength || totalLength <= 0) {
    console.warn("[startRainbowAnimation] Invalid totalLength:", totalLength);
    return null;
  }
  const letterDelay = 280;
  const pauseDuration = 1200;
  let currentIndex = -1;
  let currentDirection = "forward";
  let pauseTimeoutId = null;
  let intervalId = null;
  const cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    if (pauseTimeoutId) clearTimeout(pauseTimeoutId);
    intervalId = null;
    pauseTimeoutId = null;
  };
  const notifySubscribers = (index) => {
    rainbowState.activeIndex = index;
    rainbowState.subscribers.forEach((cb) => {
      try {
        cb(index);
      } catch (error) {
        console.warn("[Animation] Subscriber error:", error);
      }
    });
  };
  const animate = () => {
    try {
      if (currentDirection === "forward") {
        currentIndex++;
        if (currentIndex >= totalLength) {
          currentDirection = "backward";
          currentIndex = totalLength - 1;
          pauseTimeoutId = setTimeout(() => {
            notifySubscribers(currentIndex);
          }, pauseDuration);
          return;
        }
      } else {
        currentIndex--;
        if (currentIndex < -1) {
          if (oneLoopOnly) {
            cleanup();
            return;
          }
          currentDirection = "forward";
          currentIndex = -1;
          pauseTimeoutId = setTimeout(() => {
            notifySubscribers(currentIndex);
          }, pauseDuration);
          return;
        }
      }
      notifySubscribers(currentIndex);
    } catch (error) {
      console.warn("[Animation] Animate error:", error);
    }
  };
  intervalId = setInterval(animate, letterDelay);
  return cleanup;
};
const OverlayButton = ({
  icon: Icon,
  label,
  onClick,
  isDark,
  variant = "default",
  rightContent,
  isActive = false
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "button",
  {
    type: "button",
    onClick,
    className: cn(
      "flex w-full items-center gap-3 rounded-[8px] pl-0 px-2 py-2 text-sm transition-colors",
      variant === "danger" ? "text-red-500 hover:bg-red-500/10 hover:text-red-600" : isDark ? cn(
        "text-[#D0D4DB] hover:bg-[#22252B]",
        isActive && "bg-[#22252B]"
      ) : cn(
        "text-[#2C3038] hover:bg-[#F1F2F4]",
        isActive && "bg-[#F1F2F4]"
      )
    ),
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Icon,
        {
          className: "flex-shrink-0 h-4 w-4",
          style: {
            color: variant === "danger" ? void 0 : isDark ? "#C6CAD2" : "#2D3139"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left", children: label }),
      rightContent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: rightContent })
    ]
  }
);
setupRendererThemeBridge();
const container = document.getElementById("root");
if (container) {
  ReactDOM.createRoot(container).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(I18nextProvider, { i18n: instance, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LocaleSync, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(App, {})
    ] }) })
  );
}
