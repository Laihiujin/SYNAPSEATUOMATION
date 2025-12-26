import { r as reactExports, j as jsxRuntimeExports, c as clientExports, R as React } from "./client-DljuHW-m.js";
/* empty css              */
import { t } from "./Atom.es-DKyNpNSc.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { u as useThemeStore, s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { T as TeachPanelContent, e } from "./TeachPanelContent-B5WSyHe1.js";
import { u as useTranslation } from "./useTranslation-BBDPFRa4.js";
import { m as motion } from "./proxy-BWWQsHt4.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { o as o$1 } from "./FileText.es-DMxGivA6.js";
import { o as o$2 } from "./Spinner.es-8gcmvKt5.js";
import { o } from "./Sticker.es-xCDZSEqn.js";
import { O as OverlayTooltip } from "./overlay-tooltip-DZS7lRVm.js";
import { I as I18nextProvider, i as instance, u as useLocaleStore } from "./i18n-BoThyQPF.js";
import "./IconBase.es-_t4ebd3Z.js";
import "./theme-sVdefUwF.js";
import "./Check.es-CHhIdSpi.js";
import "./Clock.es-Bqtl5XAC.js";
import "./Keyboard.es-BKfAOvVA.js";
import "./Play.es-CCZEDg-p.js";
import "./StopCircle.es-Ci_jGEu4.js";
import "./TextT.es-BlqGWhxg.js";
import "./context-CbCu0iMB.js";
const IGNORED_URL_PATTERNS = ["flowith://", "about:srcdoc", "about:blank", "chrome://", "file://"];
function extractHostnames(events) {
  if (!events?.length) return [];
  const hostnameMap = /* @__PURE__ */ new Map();
  for (const event of events) {
    if (!event.url || IGNORED_URL_PATTERNS.some((p) => event.url.startsWith(p))) continue;
    try {
      const hostname = new URL(event.url).hostname;
      if (!hostname) continue;
      if (!hostnameMap.has(hostname)) hostnameMap.set(hostname, []);
      hostnameMap.get(hostname).push(event);
    } catch {
    }
  }
  return Array.from(hostnameMap.entries()).filter(([, events2]) => !(events2.length === 1 && events2[0].type === "navigate")).map(([hostname]) => hostname);
}
function getElectronAPI() {
  return window.electron;
}
function StartModeContent({
  state,
  onStart,
  onCancel,
  onReset,
  onClose
}) {
  const { t: t2 } = useTranslation();
  const [goalInput, setGoalInput] = reactExports.useState("");
  const handleStart = async () => {
    const goal = goalInput.trim() || void 0;
    await onStart(goal);
  };
  if (state.status !== "idle") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pt-2 pb-6 flex-1 flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      TeachPanelContent,
      {
        state,
        onStart: handleStart,
        onCancel,
        onReset
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pb-2 flex-1 flex flex-col overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "label",
        {
          htmlFor: "goal-input",
          style: {
            fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "22px",
            letterSpacing: "-0.28px",
            color: "#5A6272"
          },
          children: t2("intelligence.teachModeGoalLabel")
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-[#E2E4E8] dark:border-[#404040] rounded-[8px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          id: "goal-input",
          value: goalInput,
          onChange: (e2) => setGoalInput(e2.target.value),
          onKeyDown: (e2) => {
            if (e2.key === "Enter" && !e2.shiftKey) {
              e2.preventDefault();
              handleStart();
            }
          },
          placeholder: t2("intelligence.teachModeGoalPlaceholder"),
          className: "w-full px-3 py-[7px] rounded-[8px] resize-none bg-transparent border-0 outline-none text-neutral-900 dark:text-neutral-100",
          style: {
            fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
            fontWeight: 350,
            fontSize: "14px",
            lineHeight: "22px",
            letterSpacing: "-0.28px",
            height: "66px"
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
          #goal-input::placeholder {
            color: #8D95A5;
            font-family: 'ABC Oracle', system-ui, -apple-system, sans-serif;
            font-weight: 350;
            font-size: 14px;
            line-height: 22px;
            letter-spacing: -0.28px;
          }
        ` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(e, { size: 12, weight: "regular", className: "shrink-0 text-[#8D95A5]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            style: {
              fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "-0.24px",
              color: "#8D95A5"
            },
            children: t2("intelligence.teachModeTaskDisabled")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 px-6 py-5 mt-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: cn(
            "h-8 rounded-[8px] font-normal transition duration-200 flex items-center justify-center",
            "bg-[#F1F2F4] dark:bg-[#252525]",
            "text-black dark:text-[#e0e0e0]",
            "hover:opacity-80"
          ),
          style: {
            fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "22px",
            letterSpacing: "-0.28px",
            paddingLeft: "12px",
            paddingRight: "12px"
          },
          children: t2("common.cancel")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleStart,
          className: cn(
            "h-8 rounded-[8px] font-normal transition duration-200",
            "bg-black dark:bg-white",
            "text-white dark:text-black",
            "flex items-center justify-center",
            "hover:opacity-80"
          ),
          style: {
            fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "22px",
            letterSpacing: "-0.28px",
            paddingLeft: "12px",
            paddingRight: "12px"
          },
          children: t2("common.start")
        }
      )
    ] })
  ] });
}
const TOTAL_TUTORIAL_PAGES = 4;
const createPageAnimations = (pageNum, isForward) => {
  const slideX = isForward ? 40 : -40;
  const easeOut = [0.22, 1, 0.36, 1];
  const easeInOut = [0.16, 1, 0.3, 1];
  const configs = {
    1: {
      // Classic slide with fade
      container: {
        initial: { opacity: 0, x: slideX, filter: "blur(8px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: easeOut, staggerChildren: 0.1 } },
        exit: { opacity: 0, x: -slideX, filter: "blur(8px)", transition: { duration: 0.5, ease: easeOut } }
      },
      image: {
        initial: { opacity: 0, scale: 0.96, y: 20, filter: "blur(10px)" },
        animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: easeInOut, delay: 0.1 } }
      },
      text: {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut, delay: 0.25 } }
      }
    },
    2: {
      // Zoom with rotation
      container: {
        initial: { opacity: 0, scale: 0.92, rotate: -2, filter: "blur(12px)" },
        animate: { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: easeInOut, staggerChildren: 0.12 } },
        exit: { opacity: 0, scale: 1.05, filter: "blur(8px)", transition: { duration: 0.4, ease: easeOut } }
      },
      image: {
        initial: { opacity: 0, scale: 0.9, filter: "blur(15px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: easeInOut, delay: 0.15 } }
      },
      text: {
        initial: { opacity: 0, x: -20, filter: "blur(5px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: easeOut, delay: 0.3 } }
      }
    },
    3: {
      // Venetian Blinds
      container: {
        initial: { opacity: 1 },
        animate: {
          opacity: 1,
          transition: { duration: 0.1, staggerChildren: 0.12 }
        },
        exit: { opacity: 0, transition: { duration: 0.4, ease: easeOut } }
      },
      image: {
        initial: {
          opacity: 0,
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 0%, 0% 0%,
            0% 20%, 100% 20%, 100% 20%, 0% 20%,
            0% 40%, 100% 40%, 100% 40%, 0% 40%,
            0% 60%, 100% 60%, 100% 60%, 0% 60%,
            0% 80%, 100% 80%, 100% 80%, 0% 80%
          )`
        },
        animate: {
          opacity: 1,
          clipPath: [
            // Start: All slats collapsed (0% height each)
            `polygon(
              0% 0%, 100% 0%, 100% 0%, 0% 0%,
              0% 20%, 100% 20%, 100% 20%, 0% 20%,
              0% 40%, 100% 40%, 100% 40%, 0% 40%,
              0% 60%, 100% 60%, 100% 60%, 0% 60%,
              0% 80%, 100% 80%, 100% 80%, 0% 80%
            )`,
            // End: All slats expanded (20% height each = 100% total)
            `polygon(
              0% 0%, 100% 0%, 100% 20%, 0% 20%,
              0% 20%, 100% 20%, 100% 40%, 0% 40%,
              0% 40%, 100% 40%, 100% 60%, 0% 60%,
              0% 60%, 100% 60%, 100% 80%, 0% 80%,
              0% 80%, 100% 80%, 100% 100%, 0% 100%
            )`
          ],
          transition: {
            clipPath: {
              duration: 1.1,
              ease: [0.19, 1, 0.22, 1],
              // Smooth deceleration
              times: [0, 1]
            },
            opacity: { duration: 0.2 }
          }
        }
      },
      text: {
        initial: { opacity: 0, y: 20, filter: "blur(6px)" },
        animate: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.75,
            ease: easeOut,
            delay: 0.5
            // Appear after blinds halfway open
          }
        }
      }
    },
    4: {
      // Windmill reveal
      container: {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { duration: 0.1, staggerChildren: 0.08 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: easeOut } }
      },
      image: {
        initial: { opacity: 0, clipPath: "polygon(50% 50%, 50% 0%, 50% 0%, 50% 50%)" },
        animate: {
          opacity: 1,
          clipPath: [
            "polygon(50% 50%, 50% 0%, 50% 0%, 50% 50%)",
            // 0%: Start
            "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%, 50% 50%)",
            // Q1
            "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 50% 50%)",
            // Q1+Q2
            "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 50% 50%)",
            // Q1+Q2+Q3
            "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)"
            // Full
          ],
          transition: {
            clipPath: {
              duration: 1.4,
              ease: [0.19, 1, 0.22, 1],
              times: [0, 0.35, 0.6, 0.8, 1]
            },
            opacity: { duration: 0.4 }
          }
        }
      },
      text: {
        initial: { opacity: 0, scale: 0.96, filter: "blur(6px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: easeOut, delay: 0.7 } }
      }
    }
  };
  return configs[pageNum] || configs[1];
};
function TutorialModeContent({ themeMode, onClose }) {
  const { t: t2 } = useTranslation();
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [previousPage, setPreviousPage] = reactExports.useState(1);
  const [imagesLoaded, setImagesLoaded] = reactExports.useState(/* @__PURE__ */ new Set());
  const getTutorialImageUrl = reactExports.useCallback((pageNumber) => {
    const theme = themeMode === "dark" ? "black" : "white";
    return `https://os-assets.flowith.net/teach-mode/teach-guide-${theme}${pageNumber}.webp`;
  }, [themeMode]);
  reactExports.useEffect(() => {
    setImagesLoaded(/* @__PURE__ */ new Set());
    const preloadImage = (pageNum, markLoadedOnError = false) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getTutorialImageUrl(pageNum);
        img.onload = () => {
          setImagesLoaded((prev) => new Set(prev).add(pageNum));
          resolve(pageNum);
        };
        img.onerror = () => {
          if (markLoadedOnError) setImagesLoaded((prev) => new Set(prev).add(pageNum));
          resolve(pageNum);
        };
      });
    };
    preloadImage(1, true).then(() => {
      Promise.all([2, 3, 4].map((n) => preloadImage(n)));
    });
  }, [themeMode, getTutorialImageUrl]);
  const handleNext = () => {
    if (currentPage < TOTAL_TUTORIAL_PAGES) {
      setPreviousPage(currentPage);
      setCurrentPage((prev) => prev + 1);
    } else {
      onClose();
    }
  };
  const isForward = currentPage > previousPage;
  const renderPageContent = (pageNum) => {
    const titleKey = `intelligence.tutorial.page${pageNum}.title`;
    const descKey = `intelligence.tutorial.page${pageNum}.description`;
    const variants = createPageAnimations(pageNum, isForward);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        variants: variants.container,
        initial: "initial",
        animate: "animate",
        exit: "exit",
        className: "flex flex-col h-full gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              variants: variants.image,
              className: "flex-none w-full rounded-[10px] overflow-hidden",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: getTutorialImageUrl(pageNum),
                  alt: "Teach Mode Guide",
                  className: "w-full h-auto block object-contain"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              variants: variants.text,
              className: "flex-1 min-h-0 flex flex-col pl-2",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-rows-[auto_auto_1fr] gap-y-1 h-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "text-[#8D95A5] dark:text-[#8D95A5]",
                    style: {
                      fontFamily: "ABC Oracle",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "16px",
                      letterSpacing: "-0.02em"
                    },
                    children: t2("intelligence.tutorial.guideLabel")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h3",
                  {
                    className: "text-[#000000] dark:text-[#FFFFFF]",
                    style: {
                      fontFamily: "ABC Oracle",
                      fontWeight: 500,
                      fontSize: "24px",
                      lineHeight: "32px",
                      letterSpacing: "-0.02em"
                    },
                    children: t2(titleKey)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: "tutorial-description text-[#2D3139] dark:text-[#C6CAD2] mb-auto",
                    style: {
                      fontFamily: "ABC Oracle",
                      fontWeight: 350,
                      fontSize: "14px",
                      lineHeight: "24px",
                      letterSpacing: "-0.02em",
                      whiteSpace: pageNum === 1 ? "pre-line" : void 0
                    },
                    dangerouslySetInnerHTML: { __html: t2(descKey) }
                  }
                ) })
              ] })
            }
          )
        ]
      },
      pageNum
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .tutorial-description strong {
          font-weight: 500;
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex flex-col", children: !imagesLoaded.has(currentPage) ? (
        // Loading state for current page
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "flex-1 flex items-center justify-center",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 border-2 border-purple-50/30 border-t-purple-50 rounded-full animate-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-black-caption dark:text-black-40", children: t2("common.loading") })
            ] })
          }
        )
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex flex-col", children: renderPageContent(currentPage) }, currentPage) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          className: "flex items-center justify-end",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              type: "button",
              onClick: handleNext,
              whileHover: { scale: 1.02 },
              whileTap: { scale: 0.98 },
              className: cn(
                "h-8 rounded-[8px] font-normal transition duration-200",
                "bg-black dark:bg-white",
                "text-white dark:text-black",
                "flex items-center justify-center",
                "hover:opacity-80"
              ),
              style: {
                fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "22px",
                letterSpacing: "-0.28px",
                paddingLeft: "16px",
                paddingRight: "16px"
              },
              children: currentPage === TOTAL_TUTORIAL_PAGES ? t2("intelligence.tutorial.gotIt") : t2("intelligence.tutorial.next")
            }
          )
        }
      )
    ] })
  ] });
}
function CompleteModeContent({
  hostnames,
  onConfirm,
  onDiscard,
  onClose,
  onGeneratingChange
}) {
  const { t: t2 } = useTranslation();
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";
  const [selectedItems, setSelectedItems] = reactExports.useState(
    /* @__PURE__ */ new Set(["preset", ...hostnames])
  );
  const [isGenerating, setIsGenerating] = reactExports.useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = reactExports.useState(false);
  reactExports.useEffect(() => {
    onGeneratingChange?.(isGenerating);
  }, [isGenerating, onGeneratingChange]);
  const toggleSelection = (item) => {
    if (isGenerating) return;
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };
  const toggleSelectAll = () => {
    if (isGenerating) return;
    const allItems = /* @__PURE__ */ new Set(["preset", ...hostnames]);
    if (selectedItems.size === allItems.size) {
      setSelectedItems(/* @__PURE__ */ new Set());
    } else {
      setSelectedItems(allItems);
    }
  };
  const getSelectAllState = () => {
    const totalItems = hostnames.length + 1;
    if (selectedItems.size === 0) return "none";
    if (selectedItems.size === totalItems) return "all";
    return "partial";
  };
  const handleConfirmClick = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      const options = {
        shouldGeneratePreset: selectedItems.has("preset"),
        skillHostnames: hostnames.filter((h) => selectedItems.has(h))
      };
      await onConfirm(options);
    } catch (error) {
      console.error("[CompleteModeContent] Generation failed:", error);
      setIsGenerating(false);
    }
  };
  const handleDiscardClick = () => {
    setIsConfirmingDiscard(true);
  };
  const handleCancelDiscard = () => {
    setIsConfirmingDiscard(false);
  };
  const handleConfirmDiscard = async () => {
    await onDiscard();
  };
  const handleCheckboxKeyDown = (e2, action) => {
    if (e2.key === " " || e2.key === "Enter") {
      e2.preventDefault();
      action();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pb-2 flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "rounded-[10px] overflow-hidden",
          "border border-[#F1F2F4] dark:border-[#333333]"
        ),
        style: { height: "228px" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "h-full overflow-y-auto",
              // Hide native scrollbar completely
              "[&::-webkit-scrollbar]:w-0",
              "[scrollbar-width:none]"
            ),
            style: {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingLeft: "4px",
              paddingRight: "4px",
              paddingTop: "2px",
              paddingBottom: "4px"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 pb-[1px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  style: {
                    fontFamily: "ABC Oracle",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    letterSpacing: "-0.02em",
                    color: "#8D95A5"
                  },
                  children: t2("intelligence.preset")
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  role: "checkbox",
                  "aria-checked": selectedItems.has("preset"),
                  "aria-label": t2("intelligence.promptSummary"),
                  onClick: () => toggleSelection("preset"),
                  onKeyDown: (e2) => handleCheckboxKeyDown(e2, () => toggleSelection("preset")),
                  disabled: isGenerating,
                  className: cn(
                    "w-full flex items-center justify-between gap-2 px-2 py-[5px] rounded-[8px] transition-all duration-200 group",
                    "hover:bg-[#F5F5F7] dark:hover:bg-[#252525]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-0",
                    isGenerating && "opacity-60 cursor-not-allowed"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 14, weight: "bold", className: "shrink-0 text-[#2D3139] dark:text-[#e0e0e0]" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "text-left",
                          style: {
                            fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                            fontWeight: 350,
                            fontSize: "14px",
                            lineHeight: "22px",
                            letterSpacing: "-0.28px",
                            color: "#2D3139"
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dark:text-[#e0e0e0]", children: t2("intelligence.promptSummary") })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      OverlayTooltip,
                      {
                        content: t2("intelligence.saveToPreset"),
                        show: !selectedItems.has("preset"),
                        isDark,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "shrink-0 rounded-[2px] border transition-all duration-200 flex items-center justify-center",
                              selectedItems.has("preset") ? "bg-black dark:bg-white border-black dark:border-white" : "bg-white dark:bg-[#2a2a2a] border-[#A9AFBB] dark:border-[#666666]"
                            ),
                            style: { width: "12px", height: "12px" },
                            children: selectedItems.has("preset") && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "path",
                              {
                                d: "M9.5 3.5L4.75 8.25L2.5 6",
                                stroke: "white",
                                strokeWidth: "1.5",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "dark:stroke-black"
                              }
                            ) })
                          }
                        )
                      }
                    )
                  ]
                }
              ),
              hostnames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 pt-1 pb-[2px] flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    style: {
                      fontFamily: "ABC Oracle",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "16px",
                      letterSpacing: "-0.02em",
                      color: "#8D95A5"
                    },
                    children: t2("intelligence.skill")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  OverlayTooltip,
                  {
                    isDark,
                    content: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        style: {
                          fontFamily: "ABC Oracle",
                          fontWeight: 400,
                          fontSize: "12px",
                          lineHeight: "16px",
                          letterSpacing: "-0.02em"
                        },
                        className: "text-white dark:text-black",
                        dangerouslySetInnerHTML: { __html: t2("intelligence.skillSectionTooltip").replace(/\n/g, "<br/>") }
                      }
                    ),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      e,
                      {
                        size: 12,
                        weight: "regular",
                        className: "text-[#8D95A5]"
                      }
                    )
                  }
                )
              ] }),
              hostnames.map((hostname) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  role: "checkbox",
                  "aria-checked": selectedItems.has(hostname),
                  "aria-label": t2("intelligence.skillHostname", { hostname }),
                  onClick: () => toggleSelection(hostname),
                  onKeyDown: (e2) => handleCheckboxKeyDown(e2, () => toggleSelection(hostname)),
                  disabled: isGenerating,
                  className: cn(
                    "w-full flex items-center justify-between gap-2 px-2 py-[5px] rounded-[8px] transition-all duration-200 h-8 group",
                    "hover:bg-[#F5F5F7] dark:hover:bg-[#252525]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-0",
                    isGenerating && "opacity-60 cursor-not-allowed"
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(o$1, { size: 12, weight: "bold", className: "shrink-0 text-[#2D3139] dark:text-[#e0e0e0]" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "text-left truncate",
                          style: {
                            fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                            fontWeight: 350,
                            fontSize: "14px",
                            lineHeight: "22px",
                            letterSpacing: "-0.28px",
                            color: "#2D3139"
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dark:text-[#e0e0e0]", children: t2("intelligence.skillHostname", { hostname }) })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      OverlayTooltip,
                      {
                        content: t2("intelligence.saveToSkill"),
                        show: !selectedItems.has(hostname),
                        isDark,
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: cn(
                              "shrink-0 rounded-[2px] border transition-all duration-200 flex items-center justify-center",
                              selectedItems.has(hostname) ? "bg-black dark:bg-white border-black dark:border-white" : "bg-[rgba(255,255,255,0.4)] dark:bg-[#2a2a2a] border-[#E2E4E8] dark:border-[#666666] group-hover:bg-white group-hover:border-[#A9AFBB] dark:group-hover:border-[#666666]"
                            ),
                            style: { width: "12px", height: "12px" },
                            children: selectedItems.has(hostname) && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "path",
                              {
                                d: "M9.5 3.5L4.75 8.25L2.5 6",
                                stroke: "white",
                                strokeWidth: "1.5",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                className: "dark:stroke-black"
                              }
                            ) })
                          }
                        )
                      }
                    )
                  ]
                },
                hostname
              ))
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-5 flex-shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          role: "checkbox",
          "aria-checked": getSelectAllState() === "all" ? true : getSelectAllState() === "partial" ? "mixed" : false,
          "aria-label": t2("intelligence.selectAll"),
          onClick: toggleSelectAll,
          onKeyDown: (e2) => handleCheckboxKeyDown(e2, toggleSelectAll),
          disabled: isGenerating,
          className: cn(
            "flex items-center gap-2 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded-[4px]",
            isGenerating && "opacity-60 cursor-not-allowed"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: cn(
                  "shrink-0 rounded-[2px] border-[0.5px] transition-all duration-200 flex items-center justify-center",
                  getSelectAllState() !== "none" ? "bg-black dark:bg-white border-black dark:border-white" : "bg-white dark:bg-[#2a2a2a] border-black dark:border-[#666666]"
                ),
                style: { width: "12px", height: "12px" },
                children: [
                  getSelectAllState() === "all" && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      d: "M9.5 3.5L4.75 8.25L2.5 6",
                      stroke: "white",
                      strokeWidth: "1.5",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      className: "dark:stroke-black"
                    }
                  ) }),
                  getSelectAllState() === "partial" && /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "8", height: "2", viewBox: "0 0 8 2", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      d: "M1 1H7",
                      stroke: "white",
                      strokeWidth: "1.5",
                      strokeLinecap: "round",
                      className: "dark:stroke-black"
                    }
                  ) })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                style: {
                  fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "22px",
                  letterSpacing: "-0.28px",
                  color: "#2D3139"
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dark:text-[#e0e0e0]", children: t2("intelligence.selectAll") })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", style: { height: "32px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "absolute right-0 flex items-center gap-2 transition-opacity duration-200",
              isConfirmingDiscard ? "opacity-0 pointer-events-none" : "opacity-100"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  disabled: isGenerating,
                  className: cn(
                    "h-8 rounded-[8px] font-normal transition duration-200 flex items-center justify-center",
                    "bg-[#F1F2F4] dark:bg-[#252525]",
                    "text-black dark:text-[#e0e0e0]",
                    isGenerating ? "opacity-40 cursor-not-allowed" : "hover:opacity-80"
                  ),
                  style: {
                    fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "22px",
                    letterSpacing: "-0.28px",
                    width: "77px"
                  },
                  children: t2("common.cancel")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: selectedItems.size === 0 ? handleDiscardClick : handleConfirmClick,
                  disabled: isGenerating,
                  className: cn(
                    "h-8 rounded-[8px] font-normal transition duration-200 whitespace-nowrap",
                    "bg-black dark:bg-white",
                    "text-white dark:text-black",
                    "flex items-center justify-center gap-2",
                    isGenerating ? "opacity-40 cursor-not-allowed" : "hover:opacity-80"
                  ),
                  style: {
                    fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "22px",
                    letterSpacing: "-0.28px",
                    paddingLeft: "12px",
                    paddingRight: "12px"
                  },
                  children: [
                    isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsx(o$2, { size: 16, weight: "bold", className: "animate-spin" }),
                    selectedItems.size === 0 ? t2("intelligence.discard") : isGenerating ? t2("intelligence.generating") : t2("intelligence.confirmAndGenerate")
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "absolute right-0 flex items-center gap-2 transition-opacity duration-200",
              isConfirmingDiscard ? "opacity-100" : "opacity-0 pointer-events-none"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleCancelDiscard,
                  disabled: isGenerating,
                  className: cn(
                    "h-8 rounded-[8px] font-normal transition duration-200 flex items-center justify-center whitespace-nowrap",
                    "bg-[#F1F2F4] dark:bg-[#252525]",
                    "text-black dark:text-[#e0e0e0]",
                    isGenerating ? "opacity-40 cursor-not-allowed" : "hover:opacity-80"
                  ),
                  style: {
                    fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "22px",
                    letterSpacing: "-0.28px",
                    paddingLeft: "12px",
                    paddingRight: "12px"
                  },
                  children: t2("common.cancel")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleConfirmDiscard,
                  disabled: isGenerating,
                  className: cn(
                    "h-8 rounded-[8px] font-normal transition duration-200 whitespace-nowrap",
                    "bg-[#D14343] dark:bg-[#B83838]",
                    "text-white",
                    "flex items-center justify-center gap-2",
                    isGenerating ? "opacity-40 cursor-not-allowed" : "hover:opacity-80"
                  ),
                  style: {
                    fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "22px",
                    letterSpacing: "-0.28px",
                    paddingLeft: "12px",
                    paddingRight: "12px"
                  },
                  children: t2("intelligence.confirmDiscard")
                }
              )
            ]
          }
        )
      ] })
    ] })
  ] });
}
function App() {
  const { t: t$1 } = useTranslation();
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("start");
  const [state, setState] = reactExports.useState({ status: "idle" });
  const themeMode = useThemeStore((s) => s.resolvedMode);
  const hostnames = reactExports.useMemo(() => extractHostnames(state.events), [state.events]);
  const [componentKey, setComponentKey] = reactExports.useState(0);
  const [isCompleteGenerating, setIsCompleteGenerating] = reactExports.useState(false);
  reactExports.useEffect(() => {
    window.electron?.ipcRenderer?.send("teach-mode-dialog:ready");
    const handleShow = (_event, dialogMode, currentState) => {
      setMode(dialogMode);
      if (currentState) setState(currentState);
      setIsVisible(true);
      setComponentKey((prev) => prev + 1);
    };
    const handleStateUpdate = (_event, newState) => setState(newState);
    window.electron?.ipcRenderer?.on("show-teach-mode-dialog", handleShow);
    window.electron?.ipcRenderer?.on("teach-mode:state-update", handleStateUpdate);
    return () => {
      window.electron?.ipcRenderer?.removeListener("show-teach-mode-dialog", handleShow);
      window.electron?.ipcRenderer?.removeListener("teach-mode:state-update", handleStateUpdate);
    };
  }, []);
  const handleClose = () => {
    if (mode === "complete" && isCompleteGenerating) return;
    setIsVisible(false);
    window.electron?.ipcRenderer?.send("teach-mode-dialog:close");
  };
  const handleStart = async (goal) => {
    const api = window.sideBarAPI?.teachMode;
    if (api) {
      const newState = await api.start(goal);
      setState(newState);
      if (newState.status === "recording") {
        handleClose();
      }
    }
  };
  const handleCancel = async (reason) => {
    const api = window.sideBarAPI?.teachMode;
    if (api) {
      const newState = await api.cancel(reason);
      setState(newState);
    }
  };
  const handleReset = async () => {
    const api = window.sideBarAPI?.teachMode;
    if (api) {
      const newState = await api.reset();
      setState(newState);
    }
  };
  const handleConfirm = async (options) => {
    const api = window.sideBarAPI?.teachMode;
    if (!api) return;
    console.log(`[TeachModeDialog] Generating ${options.skillHostnames.length} skills${options.shouldGeneratePreset ? " + preset" : ""}`);
    const completedState = await api.finish(options);
    setIsVisible(false);
    window.electron?.ipcRenderer?.send("teach-mode-dialog:close");
    if (completedState.summary?.skillsGenerated && completedState.summary.skillsGenerated.length > 0) {
      const firstSkillId = completedState.summary.skillsGenerated[0].skillId;
      const electronAPI = getElectronAPI();
      electronAPI?.ipcRenderer?.invoke("agentWidget:openFileInComposer", {
        taskId: "__intel__",
        fileId: firstSkillId
      }).then((result) => {
        console.log("[TeachModeDialog] Skill opened successfully:", result);
      }).catch((error) => {
        console.error("[TeachModeDialog] Failed to open in composer:", error);
      });
    }
  };
  const handleDiscard = async () => {
    const api = window.sideBarAPI?.teachMode;
    if (api) {
      await api.cancel("User discarded");
      await api.reset();
    }
    setIsVisible(false);
    window.electron?.ipcRenderer?.send("teach-mode-dialog:close");
  };
  if (!isVisible) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute inset-0 flex items-center justify-center",
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)"
      },
      onClick: handleClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            "relative rounded-[12px] shadow-2xl flex flex-col",
            "bg-white dark:bg-[#121516]",
            "border border-neutral-200/80 dark:border-[#333333]"
          ),
          style: {
            width: mode === "tutorial" ? "840px" : mode === "start" ? "600px" : "540px",
            minHeight: mode === "tutorial" ? "680px" : "240px",
            maxHeight: mode === "tutorial" ? "90vh" : void 0,
            height: mode === "start" ? "auto" : void 0,
            opacity: 1,
            padding: mode === "tutorial" ? "20px" : void 0
          },
          onClick: (e2) => e2.stopPropagation(),
          children: [
            mode !== "tutorial" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(t, { size: 20, weight: "bold", className: "text-neutral-900 dark:text-[#e0e0e0]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h2",
                  {
                    className: "text-neutral-900",
                    style: {
                      fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                      fontWeight: 500,
                      fontSize: "20px",
                      lineHeight: "28px",
                      letterSpacing: "-0.4px"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dark:text-[#e0e0e0]", children: mode === "start" ? t$1("intelligence.empowerOS") : t$1("intelligence.completeConfirmTitle") })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "mt-1",
                  style: {
                    fontFamily: "ABC Oracle, system-ui, -apple-system, sans-serif",
                    fontWeight: 350,
                    fontSize: "14px",
                    lineHeight: "22px",
                    letterSpacing: "-0.28px",
                    color: "#5A6272"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "dark:text-[#999999]", children: mode === "start" ? t$1("intelligence.teachModeDescription") : t$1("intelligence.completeConfirmMessage") })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [
              mode === "start" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                StartModeContent,
                {
                  state,
                  onStart: handleStart,
                  onCancel: handleCancel,
                  onReset: handleReset,
                  onClose: handleClose
                },
                componentKey
              ),
              mode === "tutorial" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                TutorialModeContent,
                {
                  themeMode,
                  onClose: handleClose
                },
                componentKey
              ),
              mode === "complete" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                CompleteModeContent,
                {
                  hostnames,
                  onConfirm: handleConfirm,
                  onDiscard: handleDiscard,
                  onClose: handleClose,
                  onGeneratingChange: setIsCompleteGenerating
                },
                componentKey
              )
            ] })
          ]
        }
      )
    }
  );
}
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
  try {
    if (window.themeAPI) {
      const mode = await window.themeAPI.getMode();
      console.log("[TeachModeDialog] Received theme from main:", mode);
      useThemeStore.getState().applyExternalMode(mode);
      const resolvedMode = useThemeStore.getState().resolvedMode;
      document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    } else {
      console.error("[TeachModeDialog] window.themeAPI not available!");
    }
  } catch (error) {
    console.error("[TeachModeDialog] Failed to fetch theme from main process:", error);
  }
  let unsubscribe;
  try {
    unsubscribe = await setupRendererThemeBridge();
    console.log("[TeachModeDialog] Theme bridge setup complete");
  } catch (error) {
    console.warn("[TeachModeDialog] Failed to setup theme bridge:", error);
  }
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Teach mode dialog root container not found");
  }
  console.log("[TeachModeDialog] Rendering with mode:", useThemeStore.getState().mode);
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
