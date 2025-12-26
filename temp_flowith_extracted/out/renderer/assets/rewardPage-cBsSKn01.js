import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { B as BaseDialog } from "./BaseDialog-DZnFUs_f.js";
import { s as setupRendererThemeBridge, u as useThemeStore } from "./themeBridge-XpPGWB57.js";
import { u as useLocaleStore, I as I18nextProvider, i as instance, L as LocaleSync } from "./i18n-BoThyQPF.js";
import { o } from "./Check.es-CHhIdSpi.js";
import { e } from "./X.es-dtM8PpYH.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import "./index-viF2D8av.js";
import "./proxy-BWWQsHt4.js";
import "./theme-sVdefUwF.js";
import "./context-CbCu0iMB.js";
import "./IconBase.es-_t4ebd3Z.js";
const X_ICON_URL = "https://pub-fb88b93823df45229d3a9502000e9c5b.r2.dev/x-logo.png";
const REDNOTE_ICON_URL = "https://pub-fb88b93823df45229d3a9502000e9c5b.r2.dev/rednote-logo.png";
const Overlay = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = reactExports.useState(false);
  const [currentPage, setCurrentPage] = reactExports.useState(0);
  const [isTransitioning, setIsTransitioning] = reactExports.useState(false);
  const [isInitialMount, setIsInitialMount] = reactExports.useState(true);
  const [image1Loaded, setImage1Loaded] = reactExports.useState(false);
  const [image2Loaded, setImage2Loaded] = reactExports.useState(false);
  const [isAutomating, setIsAutomating] = reactExports.useState(false);
  const [automationPlatform, setAutomationPlatform] = reactExports.useState(null);
  const [automationMessage, setAutomationMessage] = reactExports.useState("");
  const [showAutomationMessage, setShowAutomationMessage] = reactExports.useState(false);
  const [showCreditToast, setShowCreditToast] = reactExports.useState(false);
  const [creditAmount, setCreditAmount] = reactExports.useState(0);
  const [invitationCodes, setInvitationCodes] = reactExports.useState([]);
  const [isLoadingCodes, setIsLoadingCodes] = reactExports.useState(false);
  const [codesError, setCodesError] = reactExports.useState(null);
  const [copiedCodeId, setCopiedCodeId] = reactExports.useState(null);
  const [hideSharePage, setHideSharePage] = reactExports.useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const isSimplifiedChinese = locale === "zh-CN";
  reactExports.useEffect(() => {
    if (typeof window.lifecycleAPI?.sendReady === "function") {
      window.lifecycleAPI.sendReady();
      console.log("[RewardPage] ✅ React 组件已挂载，通知主进程");
    }
  }, []);
  const handlePageChange = (page) => {
    if (page === currentPage || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPage(page);
    setTimeout(() => setIsTransitioning(false), 500);
  };
  const fetchInvitationCodes = async () => {
    setIsLoadingCodes(true);
    setCodesError(null);
    try {
      const result = await window.invitationCodesAPI.getMyCodes();
      if (result?.error) {
        console.error("[RewardPage] API error:", result.error);
        setCodesError(result.error);
        setInvitationCodes([]);
      } else if (result?.codes) {
        setInvitationCodes(result.codes);
      } else {
        console.error("[RewardPage] Unexpected response format:", result);
        setCodesError(t("reward.unexpectedResponse"));
        setInvitationCodes([]);
      }
    } catch (error) {
      console.error("[RewardPage] Exception fetching codes:", error);
      setCodesError(t("reward.failedToLoadCodes"));
      setInvitationCodes([]);
    } finally {
      setIsLoadingCodes(false);
    }
  };
  reactExports.useEffect(() => {
    const handleShowDialog = (_event, data) => {
      setVisible(true);
      const targetPage = data?.page !== void 0 ? data.page : 0;
      setCurrentPage(targetPage);
      setHideSharePage(data?.hideSharePage || false);
      setIsInitialMount(true);
      setTimeout(() => setIsInitialMount(false), 50);
      fetchInvitationCodes();
    };
    const handleCreditAwarded = (_event, data) => {
      setCreditAmount(data.amount);
      setShowCreditToast(true);
      setTimeout(() => setShowCreditToast(false), 4e3);
    };
    if (!window.electron?.ipcRenderer) {
      return;
    }
    window.electron.ipcRenderer.on("show-reward-page", handleShowDialog);
    window.electron.ipcRenderer.on("reward-page:credit-awarded", handleCreditAwarded);
    return () => {
      window.electron?.ipcRenderer?.removeListener("show-reward-page", handleShowDialog);
      window.electron?.ipcRenderer?.removeListener("reward-page:credit-awarded", handleCreditAwarded);
    };
  }, []);
  reactExports.useEffect(() => {
    const img1 = new Image();
    img1.onload = () => setImage1Loaded(true);
    img1.onerror = () => setImage1Loaded(false);
    img1.src = "https://pub-fb88b93823df45229d3a9502000e9c5b.r2.dev/reward-planet.png";
    const img2 = new Image();
    img2.onload = () => setImage2Loaded(true);
    img2.onerror = () => setImage2Loaded(false);
    img2.src = "https://pub-fb88b93823df45229d3a9502000e9c5b.r2.dev/reward-figure.png";
  }, []);
  const handleClose = () => {
    setVisible(false);
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send("reward-page:close");
    }
  };
  const handleCopyCode = (codeId) => {
    navigator.clipboard.writeText(codeId).then(() => {
      console.log("Code copied:", codeId);
      setCopiedCodeId(codeId);
      setTimeout(() => {
        setCopiedCodeId(null);
      }, 2e3);
    }).catch((err) => {
      console.error("Copy failed:", err);
    });
  };
  const handleShareClick = async (platform) => {
    if (isAutomating) return;
    const unusedCodes = invitationCodes.filter((code) => !code.used).slice(0, 5).map((code) => code.id);
    setIsAutomating(true);
    setAutomationPlatform(platform);
    setAutomationMessage(t("reward.neoStarting"));
    setShowAutomationMessage(true);
    try {
      const api = window.browserAgentAPI;
      const response = await api.startShareTask(platform, unusedCodes);
      if (response.success) {
        setTimeout(() => {
          setShowAutomationMessage(false);
          handleClose();
        }, 1500);
      } else {
        setAutomationMessage(`${t("reward.failed")}: ${response.error || t("reward.unknownError")}`);
        setTimeout(() => setShowAutomationMessage(false), 3e3);
      }
    } catch (error) {
      setAutomationMessage(t("reward.errorRetry"));
      setTimeout(() => setShowAutomationMessage(false), 3e3);
    } finally {
      setIsAutomating(false);
      setAutomationPlatform(null);
    }
  };
  const renderPage1 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col p-[20px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[4px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-[4px] items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "p",
        {
          className: "text-[20px] leading-[28px] tracking-[-0.4px] font-medium",
          style: {
            color: "#FFFFFF",
            fontFamily: "'ABC Oracle', sans-serif"
          },
          children: [
            "> ",
            t("reward.helloWorld")
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-[4px] items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: "text-[14px] leading-[22px] tracking-[-0.28px]",
          style: {
            color: "#8D95A5",
            fontFamily: "'ABC Oracle', sans-serif",
            fontWeight: 350
          },
          dangerouslySetInnerHTML: { __html: t("reward.helloWorldDesc") }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[20px]", style: { marginBottom: "-420px" }, children: [
      isSimplifiedChinese ? (
        // 简体中文用户：左右布局
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", style: { gap: "40px", height: "156px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-end flex-1 gap-[8px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[4px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: "text-[20px] leading-[28px] tracking-[-0.4px] font-medium",
                  style: {
                    color: "#FFFFFF",
                    fontFamily: "'ABC Oracle', sans-serif"
                  },
                  children: [
                    "> ",
                    t("reward.get2000Credits")
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-[14px] leading-[22px] tracking-[-0.28px]",
                  style: {
                    color: "#8D95A5",
                    fontFamily: "'ABC Oracle', sans-serif",
                    fontWeight: 350
                  },
                  children: t("reward.equivalent7Days")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-[1px] w-full",
                style: {
                  backgroundColor: "#2A2D30"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-[10px] leading-[16px] tracking-[-0.2px]",
                style: {
                  color: "#8D95A5",
                  fontFamily: "'ABC Oracle', sans-serif",
                  fontWeight: 350,
                  whiteSpace: "nowrap"
                },
                dangerouslySetInnerHTML: { __html: t("reward.shareInstructions") }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col justify-end", style: { width: "420px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[8px]", children: [
            isSimplifiedChinese && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                role: "button",
                tabIndex: 0,
                className: "flex items-center justify-between pl-[6px] pr-[6px] cursor-pointer transition-all group",
                style: {
                  backgroundColor: "#FFFFFF",
                  opacity: isAutomating && automationPlatform === "rednote" ? 0.5 : 1,
                  width: "420px",
                  height: "45px"
                },
                onMouseEnter: (e2) => {
                  e2.currentTarget.style.backgroundColor = "#FF2741";
                },
                onMouseLeave: (e2) => {
                  e2.currentTarget.style.backgroundColor = "#FFFFFF";
                },
                onClick: (e2) => {
                  e2.stopPropagation();
                  handleShareClick("rednote");
                },
                onKeyDown: (e2) => e2.key === "Enter" && handleShareClick("rednote"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-[8px]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "42", height: "45", viewBox: "0 0 42 45", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { y: "12", width: "21", height: "21", fill: "black" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M42 22.5L20.25 41.9856V3.01443L42 22.5Z", fill: "black" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-[32px] leading-[45px] tracking-[-0.64px] font-medium",
                        style: {
                          color: "#000000",
                          fontFamily: "'ABC Oracle', sans-serif"
                        },
                        children: t("reward.osComing")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-[45px] h-[45px] ml-[16px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      alt: "Rednote",
                      className: "w-[45px] h-[45px] object-contain",
                      src: REDNOTE_ICON_URL
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                role: "button",
                tabIndex: 0,
                className: "flex items-center justify-between pl-[6px] pr-[6px] cursor-pointer transition-all group",
                style: {
                  backgroundColor: "#FFFFFF",
                  opacity: isAutomating && automationPlatform === "x" ? 0.5 : 1,
                  width: "420px",
                  height: "45px"
                },
                onMouseEnter: (e2) => {
                  e2.currentTarget.style.backgroundColor = "#FE802C";
                },
                onMouseLeave: (e2) => {
                  e2.currentTarget.style.backgroundColor = "#FFFFFF";
                },
                onClick: (e2) => {
                  e2.stopPropagation();
                  handleShareClick("x");
                },
                onKeyDown: (e2) => e2.key === "Enter" && handleShareClick("x"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-[8px]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "42", height: "45", viewBox: "0 0 42 45", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { y: "12", width: "21", height: "21", fill: "black" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M42 22.5L20.25 41.9856V3.01443L42 22.5Z", fill: "black" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "text-[32px] leading-[45px] tracking-[-0.64px] font-medium",
                        style: {
                          color: "#000000",
                          fontFamily: "'ABC Oracle', sans-serif"
                        },
                        children: t("reward.awakeOS")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-[45px] h-[45px] ml-[16px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center bg-black rounded-[4px] w-[30px] h-[31px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      alt: "X",
                      className: "w-[30px] h-[30px] object-contain",
                      src: X_ICON_URL,
                      style: {
                        filter: "invert(1)"
                      }
                    }
                  ) }) })
                ]
              }
            )
          ] }) })
        ] })
      ) : (
        // 非简体中文用户：上下布局
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[20px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[8px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[4px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "p",
                {
                  className: "text-[20px] leading-[28px] tracking-[-0.4px] font-medium",
                  style: {
                    color: "#FFFFFF",
                    fontFamily: "'ABC Oracle', sans-serif"
                  },
                  children: [
                    "> ",
                    t("reward.get2000Credits")
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-[14px] leading-[22px] tracking-[-0.28px]",
                  style: {
                    color: "#8D95A5",
                    fontFamily: "'ABC Oracle', sans-serif",
                    fontWeight: 350
                  },
                  children: t("reward.equivalent7Days")
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "h-[1px] w-full",
                style: {
                  backgroundColor: "#2A2D30"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-[10px] leading-[16px] tracking-[-0.2px]",
                style: {
                  color: "#8D95A5",
                  fontFamily: "'ABC Oracle', sans-serif",
                  fontWeight: 350,
                  whiteSpace: "nowrap"
                },
                dangerouslySetInnerHTML: { __html: t("reward.shareInstructions") }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              role: "button",
              tabIndex: 0,
              className: "flex items-center justify-between pl-[6px] pr-[6px] cursor-pointer transition-all group",
              style: {
                backgroundColor: "#FFFFFF",
                opacity: isAutomating && automationPlatform === "x" ? 0.5 : 1,
                width: "100%",
                height: "45px"
              },
              onMouseEnter: (e2) => {
                e2.currentTarget.style.backgroundColor = "#FE802C";
              },
              onMouseLeave: (e2) => {
                e2.currentTarget.style.backgroundColor = "#FFFFFF";
              },
              onClick: (e2) => {
                e2.stopPropagation();
                handleShareClick("x");
              },
              onKeyDown: (e2) => e2.key === "Enter" && handleShareClick("x"),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-[8px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "42", height: "45", viewBox: "0 0 42 45", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { y: "12", width: "21", height: "21", fill: "black" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M42 22.5L20.25 41.9856V3.01443L42 22.5Z", fill: "black" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-[32px] leading-[45px] tracking-[-0.64px] font-medium",
                      style: {
                        color: "#000000",
                        fontFamily: "'ABC Oracle', sans-serif"
                      },
                      children: t("reward.awakeOS")
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-[45px] h-[45px] ml-[16px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center bg-black rounded-[4px] w-[30px] h-[31px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    alt: "X",
                    className: "w-[30px] h-[30px] object-contain",
                    src: X_ICON_URL,
                    style: {
                      filter: "invert(1)"
                    }
                  }
                ) }) })
              ]
            }
          )
        ] })
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-full",
          style: {
            height: "1px",
            borderTop: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.2)",
            opacity: 0.2
          }
        }
      )
    ] })
  ] });
  const renderPage2 = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col p-[20px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-[8px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-[4px] items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        className: "text-[20px] leading-[28px] tracking-[-0.4px] font-medium",
        style: {
          color: "#FFFFFF",
          fontFamily: "'ABC Oracle', sans-serif"
        },
        children: [
          "> ",
          t("reward.page2Title")
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-[20px]", style: { marginBottom: "-405px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between", style: { gap: "80px", height: "156px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-end flex-1 gap-[8px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "text-[14px] leading-[22px] tracking-[-0.28px]",
              style: {
                color: "#8D95A5",
                fontFamily: "'ABC Oracle', sans-serif",
                fontWeight: 350
              },
              children: t("reward.page2Description1")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: "text-[14px] leading-[22px] tracking-[-0.28px]",
              style: {
                color: "#8D95A5",
                fontFamily: "'ABC Oracle', sans-serif",
                fontWeight: 350
              },
              children: [
                t("reward.page2Description2"),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#FFFFFF", fontWeight: 400 }, children: "1,000" }),
                " ",
                t("reward.page2Description3")
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", style: { width: "360px", height: "156px", gap: "4px", marginBottom: "-5px" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-[4px] flex-1", children: isLoadingCodes ? (
            // Loading state
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-black/60" }) })
          ) : codesError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center flex-1 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-red-500", children: codesError }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: fetchInvitationCodes,
                className: "text-[10px] text-black/60 hover:text-black underline",
                children: t("reward.retry")
              }
            )
          ] }) : invitationCodes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-black/40", children: t("reward.noCodesYet") }) }) : invitationCodes.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              role: "button",
              tabIndex: item.used ? -1 : 0,
              className: "flex items-center justify-between px-[8px] py-[5px] h-[28px] rounded-[6px] overflow-hidden cursor-pointer transition-all duration-200 ease-out hover:opacity-80 hover:scale-[1.01]",
              style: {
                opacity: 0,
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`
              },
              onClick: (e2) => {
                e2.stopPropagation();
                !item.used && handleCopyCode(item.id);
              },
              onKeyDown: (e2) => e2.key === "Enter" && !item.used && handleCopyCode(item.id),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "flex-1 text-[10px] leading-[12px] tracking-[-0.2px] whitespace-nowrap overflow-ellipsis overflow-hidden font-geist-mono",
                    style: {
                      color: "#FFFFFF",
                      fontWeight: 400
                    },
                    children: item.id
                  }
                ),
                item.used ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-[4px] items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-[12px] h-[12px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 12, weight: "bold", color: "#09902d" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-[10px] leading-[12px] tracking-[-0.2px]",
                      style: {
                        color: "#09902d",
                        fontFamily: "'ABC Oracle', sans-serif",
                        fontWeight: 350
                      },
                      children: t("reward.activated")
                    }
                  )
                ] }) : copiedCodeId === item.id ? (
                  // Green checkmark after copying
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-[12px] h-[12px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 12, weight: "bold", color: "#09902d" }) })
                ) : (
                  // Copy icon
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-[12px] h-[12px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "svg",
                    {
                      width: "12",
                      height: "12",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "#8D95A5",
                      strokeWidth: "2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" })
                    }
                  ) })
                )
              ]
            },
            item.id
          )) }),
          !isLoadingCodes && !codesError && invitationCodes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-[1px] w-full",
              style: {
                backgroundColor: "#2A2D30"
              }
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-full",
          style: {
            height: "1px",
            borderTop: "1px solid",
            borderColor: "rgba(255, 255, 255, 0.2)",
            opacity: 0.2
          }
        }
      )
    ] })
  ] });
  const renderCard = (pageIndex) => {
    const imageSrc = pageIndex === 0 ? "https://pub-fb88b93823df45229d3a9502000e9c5b.r2.dev/reward-planet.png" : "https://pub-fb88b93823df45229d3a9502000e9c5b.r2.dev/reward-figure.png";
    const imageLoaded = pageIndex === 0 ? image1Loaded : image2Loaded;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-[440px] rounded-[12px] overflow-hidden", children: [
      imageLoaded ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: imageSrc,
          alt: `Reward ${pageIndex + 1}`,
          className: "absolute inset-0 w-full h-full object-cover"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center px-8", style: { color: "#8D95A5" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "✨" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "请将图片保存为" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono mt-2 opacity-70", children: pageIndex === 0 ? "reward-planet.png" : "reward-figure.png" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 w-full h-full", children: pageIndex === 0 ? renderPage1() : renderPage2() })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BaseDialog, { visible, onClose: handleClose, width: 900, forceLight: false, noBorder: true, transparentBg: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative w-[900px] h-[520px] p-[40px]",
        style: {
          perspective: "1200px",
          perspectiveOrigin: "center center"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClose,
              className: "absolute flex items-center justify-center w-[32px] h-[32px] transition-all duration-200 z-[100]",
              style: {
                top: "16px",
                right: "-16px",
                opacity: 0.4
              },
              onMouseEnter: (e2) => {
                e2.currentTarget.style.transform = "scale(1.1)";
                e2.currentTarget.style.opacity = "1";
              },
              onMouseLeave: (e2) => {
                e2.currentTarget.style.transform = "scale(1)";
                e2.currentTarget.style.opacity = "0.6";
              },
              "aria-label": "Close",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                e,
                {
                  size: 20,
                  weight: "bold",
                  color: "#FFFFFF"
                }
              )
            }
          ),
          !hideSharePage && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `absolute ${!isInitialMount ? "transition-all duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)]" : ""} group/card0`,
              style: {
                width: "820px",
                height: "440px",
                top: "40px",
                left: "40px",
                zIndex: currentPage === 0 ? 2 : 1,
                transformOrigin: currentPage === 0 ? "center center" : "bottom right",
                transform: currentPage === 0 ? "translate(0, 0) rotateZ(0deg) scale(1)" : "translate(5px, -5px) rotateZ(3deg) scale(1)",
                opacity: currentPage === 0 ? 1 : 1,
                boxShadow: currentPage === 0 ? "0 20px 60px rgba(0, 0, 0, 0.25)" : "0 5px 15px rgba(0, 0, 0, 0.08)",
                borderRadius: "12px",
                backgroundColor: "#121516",
                pointerEvents: currentPage === 0 ? "auto" : "all",
                cursor: currentPage === 0 ? "default" : "pointer"
              },
              onMouseEnter: (e2) => {
                if (currentPage !== 0) {
                  e2.currentTarget.style.transform = "translate(10px, -10px) rotateZ(3deg) scale(1)";
                }
              },
              onMouseLeave: (e2) => {
                if (currentPage !== 0) {
                  e2.currentTarget.style.transform = "translate(5px, -5px) rotateZ(3deg) scale(1)";
                }
              },
              onClick: currentPage === 0 ? void 0 : (e2) => {
                e2.stopPropagation();
                handlePageChange(0);
              },
              children: renderCard(0)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `absolute ${!isInitialMount ? "transition-all duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)]" : ""} group/card1`,
              style: {
                width: "820px",
                height: "440px",
                top: "40px",
                left: "40px",
                zIndex: currentPage === 1 ? 2 : 1,
                transformOrigin: currentPage === 1 ? "center center" : "bottom right",
                transform: currentPage === 1 ? "translate(0, 0) rotateZ(0deg) scale(1)" : "translate(5px, -5px) rotateZ(3deg) scale(1)",
                opacity: currentPage === 1 ? 1 : 1,
                boxShadow: currentPage === 1 ? "0 20px 60px rgba(0, 0, 0, 0.25)" : "0 5px 15px rgba(0, 0, 0, 0.08)",
                borderRadius: "12px",
                backgroundColor: "#121516",
                pointerEvents: currentPage === 1 ? "auto" : "all",
                cursor: currentPage === 1 ? "default" : "pointer"
              },
              onMouseEnter: (e2) => {
                if (currentPage !== 1) {
                  e2.currentTarget.style.transform = "translate(10px, -10px) rotateZ(3deg) scale(1)";
                }
              },
              onMouseLeave: (e2) => {
                if (currentPage !== 1) {
                  e2.currentTarget.style.transform = "translate(5px, -5px) rotateZ(3deg) scale(1)";
                }
              },
              onClick: currentPage === 1 ? void 0 : (e2) => {
                e2.stopPropagation();
                handlePageChange(1);
              },
              children: renderCard(1)
            }
          ),
          showAutomationMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg transition-all",
              style: {
                backgroundColor: "#1A1C1E",
                border: `1px solid ${"#2A2D30"}`,
                zIndex: 1e3
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-[12px] leading-[16px] tracking-[-0.24px] text-center",
                  style: {
                    color: "#FFFFFF",
                    fontFamily: "'ABC Oracle', sans-serif"
                  },
                  children: automationMessage
                }
              )
            }
          ),
          showCreditToast && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl transition-all animate-slide-down",
              style: {
                background: "linear-gradient(135deg, rgba(255, 204, 0, 0.15) 0%, rgba(255, 204, 0, 0.10) 100%)",
                border: "1px solid rgba(255, 204, 0, 0.3)",
                backdropFilter: "blur(12px)",
                boxShadow: "0px 4px 20px rgba(255, 204, 0, 0.2), 0px 1px 4px rgba(0, 0, 0, 0.1)",
                zIndex: 1001
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "🎉" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-[16px] leading-[20px] font-semibold mb-1",
                      style: {
                        color: "#FFCC00",
                        fontFamily: "'ABC Oracle', sans-serif"
                      },
                      children: t("reward.congratsCredits", { amount: creditAmount })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "text-[12px] leading-[16px] tracking-[-0.24px]",
                      style: {
                        color: "rgba(255, 204, 0, 0.8)",
                        fontFamily: "'ABC Oracle', sans-serif"
                      },
                      children: t("reward.rewardUnlocked")
                    }
                  )
                ] })
              ] })
            }
          )
        ]
      }
    ) }),
    showCreditToast && !visible && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 pointer-events-none flex items-start justify-center pt-8 z-[9999]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "px-6 py-4 rounded-xl shadow-2xl transition-all animate-bounce pointer-events-auto",
        style: {
          background: "linear-gradient(135deg, rgba(255, 204, 0, 0.15) 0%, rgba(255, 204, 0, 0.10) 100%)",
          border: "1px solid rgba(255, 204, 0, 0.3)",
          backdropFilter: "blur(12px)",
          boxShadow: "0px 4px 20px rgba(255, 204, 0, 0.2), 0px 1px 4px rgba(0, 0, 0, 0.1)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: "🎉" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-[16px] leading-[20px] font-semibold mb-1",
                style: {
                  color: "#FFCC00",
                  fontFamily: "'ABC Oracle', sans-serif"
                },
                children: t("reward.congratsCredits", { amount: creditAmount })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "text-[12px] leading-[16px] tracking-[-0.24px]",
                style: {
                  color: "rgba(255, 204, 0, 0.8)",
                  fontFamily: "'ABC Oracle', sans-serif"
                },
                children: t("reward.rewardUnlocked")
              }
            )
          ] })
        ] })
      }
    ) })
  ] });
};
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
async function bootstrap() {
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
  } catch (error) {
    console.warn("[RewardPage] Failed to synchronize theme before render:", error);
    const fallbackMode = useThemeStore.getState().mode;
    document.documentElement.classList.toggle("dark", fallbackMode === "dark");
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Reward page root container not found");
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
