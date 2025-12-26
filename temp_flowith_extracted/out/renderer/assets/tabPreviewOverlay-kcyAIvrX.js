import { r as reactExports, c as clientExports, j as jsxRuntimeExports } from "./client-DljuHW-m.js";
import { s as setupRendererThemeBridge } from "./themeBridge-XpPGWB57.js";
import { f as fromUserFriendlyUrl, r as r$1 } from "./urlTransform-APxFwMwF.js";
import { t } from "./CaretLeft.es-BLuJm8Hv.js";
import { e as e$1 } from "./CaretRight.es-D13xy2ea.js";
import { o } from "./Check.es-CHhIdSpi.js";
import { e as e$2 } from "./Copy.es-BpumgQRg.js";
import { e as e$3 } from "./Plus.es-C0yir3SN.js";
import { p } from "./IconBase.es-_t4ebd3Z.js";
import { e } from "./X.es-dtM8PpYH.js";
import { c as cn } from "./utils-C6LcAPXa.js";
import { A as ACTIVE_ITEM_STYLES } from "./activeItemStyles-TJXb1m4Z.js";
import { b as animateVisualElement, s as setTarget, u as useConstant, c as useIsomorphicLayoutEffect, m as motion } from "./proxy-BWWQsHt4.js";
import { A as AnimatePresence } from "./index-viF2D8av.js";
import { s as stringType } from "./types-Cja2BTNu.js";
import "./theme-sVdefUwF.js";
function stopAnimation(visualElement) {
  visualElement.values.forEach((value) => value.stop());
}
function setVariants(visualElement, variantLabels) {
  const reversedLabels = [...variantLabels].reverse();
  reversedLabels.forEach((key) => {
    const variant = visualElement.getVariant(key);
    variant && setTarget(visualElement, variant);
    if (visualElement.variantChildren) {
      visualElement.variantChildren.forEach((child) => {
        setVariants(child, variantLabels);
      });
    }
  });
}
function setValues(visualElement, definition) {
  if (Array.isArray(definition)) {
    return setVariants(visualElement, definition);
  } else if (typeof definition === "string") {
    return setVariants(visualElement, [definition]);
  } else {
    setTarget(visualElement, definition);
  }
}
function animationControls() {
  const subscribers = /* @__PURE__ */ new Set();
  const controls = {
    subscribe(visualElement) {
      subscribers.add(visualElement);
      return () => void subscribers.delete(visualElement);
    },
    start(definition, transitionOverride) {
      const animations = [];
      subscribers.forEach((visualElement) => {
        animations.push(animateVisualElement(visualElement, definition, {
          transitionOverride
        }));
      });
      return Promise.all(animations);
    },
    set(definition) {
      return subscribers.forEach((visualElement) => {
        setValues(visualElement, definition);
      });
    },
    stop() {
      subscribers.forEach((visualElement) => {
        stopAnimation(visualElement);
      });
    },
    mount() {
      return () => {
        controls.stop();
      };
    }
  };
  return controls;
}
function useAnimationControls() {
  const controls = useConstant(animationControls);
  useIsomorphicLayoutEffect(controls.mount, []);
  return controls;
}
const useAnimation = useAnimationControls;
const l = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M243,96a20.33,20.33,0,0,0-17.74-14l-56.59-4.57L146.83,24.62a20.36,20.36,0,0,0-37.66,0L87.35,77.44,30.76,82A20.45,20.45,0,0,0,19.1,117.88l43.18,37.24-13.2,55.7A20.37,20.37,0,0,0,79.57,233L128,203.19,176.43,233a20.39,20.39,0,0,0,30.49-22.15l-13.2-55.7,43.18-37.24A20.43,20.43,0,0,0,243,96ZM172.53,141.7a12,12,0,0,0-3.84,11.86L181.58,208l-47.29-29.08a12,12,0,0,0-12.58,0L74.42,208l12.89-54.4a12,12,0,0,0-3.84-11.86L41.2,105.24l55.4-4.47a12,12,0,0,0,10.13-7.38L128,41.89l21.27,51.5a12,12,0,0,0,10.13,7.38l55.4,4.47Z" }))
  ],
  [
    "duotone",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(
      "path",
      {
        d: "M229.06,108.79l-48.7,42,14.88,62.79a8.4,8.4,0,0,1-12.52,9.17L128,189.09,73.28,222.74a8.4,8.4,0,0,1-12.52-9.17l14.88-62.79-48.7-42A8.46,8.46,0,0,1,31.73,94L95.64,88.8l24.62-59.6a8.36,8.36,0,0,1,15.48,0l24.62,59.6L224.27,94A8.46,8.46,0,0,1,229.06,108.79Z",
        opacity: "0.2"
      }
    ), /* @__PURE__ */ reactExports.createElement("path", { d: "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z" }))
  ],
  [
    "fill",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z" }))
  ],
  [
    "light",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M237.28,97.87A14.18,14.18,0,0,0,224.76,88l-60.25-4.87-23.22-56.2a14.37,14.37,0,0,0-26.58,0L91.49,83.11,31.24,88a14.18,14.18,0,0,0-12.52,9.89A14.43,14.43,0,0,0,23,113.32L69,152.93l-14,59.25a14.4,14.4,0,0,0,5.59,15,14.1,14.1,0,0,0,15.91.6L128,196.12l51.58,31.71a14.1,14.1,0,0,0,15.91-.6,14.4,14.4,0,0,0,5.59-15l-14-59.25L233,113.32A14.43,14.43,0,0,0,237.28,97.87Zm-12.14,6.37-48.69,42a6,6,0,0,0-1.92,5.92l14.88,62.79a2.35,2.35,0,0,1-.95,2.57,2.24,2.24,0,0,1-2.6.1L131.14,184a6,6,0,0,0-6.28,0L70.14,217.61a2.24,2.24,0,0,1-2.6-.1,2.35,2.35,0,0,1-1-2.57l14.88-62.79a6,6,0,0,0-1.92-5.92l-48.69-42a2.37,2.37,0,0,1-.73-2.65,2.28,2.28,0,0,1,2.07-1.65l63.92-5.16a6,6,0,0,0,5.06-3.69l24.63-59.6a2.35,2.35,0,0,1,4.38,0l24.63,59.6a6,6,0,0,0,5.06,3.69l63.92,5.16a2.28,2.28,0,0,1,2.07,1.65A2.37,2.37,0,0,1,225.14,104.24Z" }))
  ],
  [
    "regular",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Zm-15.34,5.47-48.7,42a8,8,0,0,0-2.56,7.91l14.88,62.8a.37.37,0,0,1-.17.48c-.18.14-.23.11-.38,0l-54.72-33.65a8,8,0,0,0-8.38,0L69.09,215.94c-.15.09-.19.12-.38,0a.37.37,0,0,1-.17-.48l14.88-62.8a8,8,0,0,0-2.56-7.91l-48.7-42c-.12-.1-.23-.19-.13-.5s.18-.27.33-.29l63.92-5.16A8,8,0,0,0,103,91.86l24.62-59.61c.08-.17.11-.25.35-.25s.27.08.35.25L153,91.86a8,8,0,0,0,6.75,4.92l63.92,5.16c.15,0,.24,0,.33.29S224,102.63,223.84,102.73Z" }))
  ],
  [
    "thin",
    /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("path", { d: "M235.36,98.49A12.21,12.21,0,0,0,224.59,90l-61.47-5L139.44,27.67a12.37,12.37,0,0,0-22.88,0L92.88,85,31.41,90a12.45,12.45,0,0,0-7.07,21.84l46.85,40.41L56.87,212.64a12.35,12.35,0,0,0,18.51,13.49L128,193.77l52.62,32.36a12.12,12.12,0,0,0,13.69-.51,12.28,12.28,0,0,0,4.82-13l-14.32-60.42,46.85-40.41A12.29,12.29,0,0,0,235.36,98.49Zm-8.93,7.26-48.68,42a4,4,0,0,0-1.28,3.95l14.87,62.79a4.37,4.37,0,0,1-1.72,4.65,4.24,4.24,0,0,1-4.81.18L130.1,185.67a4,4,0,0,0-4.2,0L71.19,219.32a4.24,4.24,0,0,1-4.81-.18,4.37,4.37,0,0,1-1.72-4.65L79.53,151.7a4,4,0,0,0-1.28-3.95l-48.68-42A4.37,4.37,0,0,1,28.25,101a4.31,4.31,0,0,1,3.81-3L96,92.79a4,4,0,0,0,3.38-2.46L124,30.73a4.35,4.35,0,0,1,8.08,0l24.62,59.6A4,4,0,0,0,160,92.79l63.9,5.15a4.31,4.31,0,0,1,3.81,3A4.37,4.37,0,0,1,226.43,105.75Z" }))
  ]
]);
const r = reactExports.forwardRef((t2, a) => /* @__PURE__ */ reactExports.createElement(p, { ref: a, ...t2, weights: l }));
r.displayName = "StarIcon";
const urlSchema = stringType().url();
function classifyInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return { type: "search", value: "" };
  if (/^(file|flowith|https?|ftp):\/\//i.test(trimmed)) {
    return { type: "url", value: trimmed };
  }
  let urlToTest = trimmed;
  if (!trimmed.match(/^[a-z]+:\/\//i)) {
    if (/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+/.test(trimmed)) {
      urlToTest = `https://${trimmed}`;
    }
  }
  const urlValidation = urlSchema.safeParse(urlToTest);
  return urlValidation.success ? { type: "url", value: urlToTest } : { type: "search", value: trimmed };
}
const App = () => {
  const [state, setState] = reactExports.useState({ open: false, payload: null });
  const [editedUrl, setEditedUrl] = reactExports.useState("");
  const pointerInsideRef = reactExports.useRef(false);
  const animationControls2 = useAnimation();
  const payload = state.payload;
  const [isClosing, setIsClosing] = reactExports.useState(false);
  const hasNotifiedHideRef = reactExports.useRef(false);
  const inputRef = reactExports.useRef(null);
  const currentTabIdRef = reactExports.useRef(null);
  const [isUrlComposing, setIsUrlComposing] = reactExports.useState(false);
  const [isSearchComposing, setIsSearchComposing] = reactExports.useState(false);
  const [isNewFolderComposing, setIsNewFolderComposing] = reactExports.useState(false);
  const [showBookmarkDropdown, setShowBookmarkDropdown] = reactExports.useState(false);
  const [optimisticBookmarked, setOptimisticBookmarked] = reactExports.useState(null);
  const [optimisticCanGoBack, setOptimisticCanGoBack] = reactExports.useState(null);
  const [optimisticCanGoForward, setOptimisticCanGoForward] = reactExports.useState(null);
  const [bookmarkFolders, setBookmarkFolders] = reactExports.useState([]);
  const [allBookmarkFolders, setAllBookmarkFolders] = reactExports.useState([]);
  const [selectedFolderId, setSelectedFolderId] = reactExports.useState(null);
  const [folderSearchQuery, setFolderSearchQuery] = reactExports.useState("");
  const searchInputRef = reactExports.useRef(null);
  const [isAddingNewFolder, setIsAddingNewFolder] = reactExports.useState(false);
  const [newFolderName, setNewFolderName] = reactExports.useState("");
  const newFolderInputRef = reactExports.useRef(null);
  const previewCardRef = reactExports.useRef(null);
  const [previewCardHeight, setPreviewCardHeight] = reactExports.useState(90);
  const [copied, setCopied] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const handleOpen = (event) => {
      const detail = event.detail;
      if (detail) {
        currentTabIdRef.current = detail.tab.id;
        setState({ open: true, payload: detail });
        setEditedUrl(detail.tab.url);
        setIsClosing(false);
        hasNotifiedHideRef.current = false;
        pointerInsideRef.current = false;
        setOptimisticBookmarked(null);
        setOptimisticCanGoBack(null);
        setOptimisticCanGoForward(null);
      }
    };
    const handleUpdate = (event) => {
      const detail = event.detail;
      if (detail) {
        currentTabIdRef.current = detail.tab.id;
        setState({ open: true, payload: detail });
        setEditedUrl(detail.tab.url);
        setIsClosing(false);
        hasNotifiedHideRef.current = false;
        setOptimisticBookmarked(null);
        setOptimisticCanGoBack(null);
        setOptimisticCanGoForward(null);
      }
    };
    const handleClose = () => {
      currentTabIdRef.current = null;
      setState({ open: false, payload: null });
      setIsClosing(false);
      hasNotifiedHideRef.current = false;
      pointerInsideRef.current = false;
      setShowBookmarkDropdown(false);
      setOptimisticBookmarked(null);
      setOptimisticCanGoBack(null);
      setOptimisticCanGoForward(null);
    };
    const handlePrepareHide = () => {
      setState((prev) => prev.payload ? { open: false, payload: prev.payload } : prev);
      setIsClosing(true);
      hasNotifiedHideRef.current = false;
    };
    window.addEventListener("tabPreviewOverlay:open", handleOpen);
    window.addEventListener("tabPreviewOverlay:update", handleUpdate);
    window.addEventListener("tabPreviewOverlay:close", handleClose);
    window.addEventListener("tabPreviewOverlay:prepareHide", handlePrepareHide);
    return () => {
      window.removeEventListener("tabPreviewOverlay:open", handleOpen);
      window.removeEventListener("tabPreviewOverlay:update", handleUpdate);
      window.removeEventListener("tabPreviewOverlay:close", handleClose);
      window.removeEventListener("tabPreviewOverlay:prepareHide", handlePrepareHide);
    };
  }, []);
  reactExports.useEffect(() => {
    const theme = state.payload?.theme ?? "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [state.payload?.theme]);
  reactExports.useEffect(() => {
    if (!state.open) {
      pointerInsideRef.current = false;
      setShowBookmarkDropdown(false);
      setBookmarkFolders([]);
      setAllBookmarkFolders([]);
      setSelectedFolderId(null);
      setFolderSearchQuery("");
      setIsAddingNewFolder(false);
      setNewFolderName("");
    }
  }, [state.open]);
  reactExports.useEffect(() => {
    if (state.open && payload) {
      const sequence = async () => {
        animationControls2.stop();
        animationControls2.set({ opacity: 0, scale: 0.96, x: -20, y: -4 });
        await animationControls2.start({
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.22, ease: [0.22, 0.94, 0.36, 1] }
        });
      };
      void sequence();
    }
  }, [state.open, payload, animationControls2]);
  reactExports.useEffect(() => {
    if (state.open && previewCardRef.current) {
      const height = previewCardRef.current.offsetHeight;
      if (height > 0) {
        setPreviewCardHeight(height);
      }
    }
  }, [state.open, payload]);
  reactExports.useEffect(() => {
    if (!isClosing || !payload) {
      return;
    }
    let cancelled = false;
    const sequence = async () => {
      animationControls2.stop();
      await animationControls2.start({
        opacity: 0,
        scale: 0.94,
        y: 12,
        transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] }
      });
      if (!cancelled && !hasNotifiedHideRef.current) {
        hasNotifiedHideRef.current = true;
        window.tabPreviewOverlay?.notifyHideReady?.();
      }
    };
    void sequence();
    return () => {
      cancelled = true;
    };
  }, [isClosing, payload, animationControls2]);
  const tabId = payload?.tab.id;
  const isDark = reactExports.useMemo(() => (payload?.theme ?? "light") === "dark", [payload?.theme]);
  const isBookmarked = optimisticBookmarked ?? payload?.tab.isBookmarked ?? false;
  const canGoBack = optimisticCanGoBack ?? payload?.tab.canGoBack ?? false;
  const canGoForward = optimisticCanGoForward ?? payload?.tab.canGoForward ?? false;
  const sendAction = reactExports.useCallback(
    (type, params) => {
      if (!tabId) return;
      window.tabPreviewOverlay?.performAction?.({ type, tabId, ...params });
    },
    [tabId]
  );
  const handlePointerEnter = reactExports.useCallback(() => {
    if (!pointerInsideRef.current) {
      pointerInsideRef.current = true;
      sendAction("pointer-enter");
    }
  }, [sendAction]);
  const handlePointerLeave = reactExports.useCallback(() => {
    if (pointerInsideRef.current) {
      pointerInsideRef.current = false;
      sendAction("pointer-leave");
    }
  }, [sendAction]);
  const handlePointerMove = reactExports.useCallback(() => {
    if (!pointerInsideRef.current) {
      pointerInsideRef.current = true;
      sendAction("pointer-enter");
    }
  }, [sendAction]);
  const handleCopy = reactExports.useCallback(() => {
    if (payload?.tab.url) {
      navigator.clipboard.writeText(payload.tab.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    }
  }, [payload]);
  const handleUrlChange = reactExports.useCallback((e2) => {
    setEditedUrl(e2.target.value);
  }, []);
  const handleUrlKeyDown = reactExports.useCallback((e2) => {
    if (isUrlComposing) return;
    if (e2.key === "Enter") {
      e2.stopPropagation();
      const originalUrl = payload?.tab.url || "";
      if (editedUrl && editedUrl !== originalUrl) {
        e2.preventDefault();
        const convertedUrl = fromUserFriendlyUrl(editedUrl);
        const { type, value } = classifyInput(convertedUrl);
        const finalUrl = type === "url" ? value : `https://www.google.com/search?q=${encodeURIComponent(value)}`;
        sendAction("navigate", { url: finalUrl });
      }
    }
  }, [isUrlComposing, editedUrl, payload?.tab.url, sendAction]);
  const handleBookmark = reactExports.useCallback(() => {
    if (isBookmarked) {
      setOptimisticBookmarked(false);
      setShowBookmarkDropdown(false);
      sendAction("unbookmark");
    } else {
      setOptimisticBookmarked(true);
      setShowBookmarkDropdown(true);
      sendAction("bookmark");
    }
  }, [isBookmarked, sendAction]);
  reactExports.useEffect(() => {
    if (showBookmarkDropdown && window.tabPreviewOverlay?.bookmarks) {
      const loadFolders = async () => {
        try {
          const bookmarks = await window.tabPreviewOverlay.bookmarks.getAll();
          const extractFolders = (items, level = 0) => {
            const folders = [];
            for (const item of items) {
              if (item.type === "folder") {
                folders.push({ id: item.id, title: item.title, level });
                if (item.children) {
                  folders.push(...extractFolders(item.children, level + 1));
                }
              }
            }
            return folders;
          };
          const allFolders = extractFolders(bookmarks);
          setAllBookmarkFolders(allFolders);
          setBookmarkFolders(allFolders);
          console.log("Loaded all bookmark folders:", allFolders);
        } catch (error) {
          console.error("Failed to load bookmark folders:", error);
        }
      };
      loadFolders();
    }
  }, [showBookmarkDropdown]);
  reactExports.useEffect(() => {
    const timerId = setTimeout(() => {
      if (folderSearchQuery.trim()) {
        const filtered = allBookmarkFolders.filter(
          (folder) => folder.title.toLowerCase().includes(folderSearchQuery.toLowerCase())
        );
        setBookmarkFolders(filtered);
      } else {
        setBookmarkFolders(allBookmarkFolders);
      }
    }, 300);
    return () => clearTimeout(timerId);
  }, [folderSearchQuery, allBookmarkFolders]);
  reactExports.useEffect(() => {
    if (!showBookmarkDropdown) {
      setBookmarkFolders([]);
      setAllBookmarkFolders([]);
      setSelectedFolderId(null);
      setFolderSearchQuery("");
      setIsAddingNewFolder(false);
      setNewFolderName("");
    }
  }, [showBookmarkDropdown]);
  reactExports.useEffect(() => {
    if (isAddingNewFolder && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [isAddingNewFolder]);
  const handleFolderSelect = reactExports.useCallback(async (targetFolderId) => {
    if (!payload?.tab.url || !window.tabPreviewOverlay?.bookmarks) return;
    try {
      setSelectedFolderId(targetFolderId);
      const allBookmarks = await window.tabPreviewOverlay.bookmarks.getAll();
      const findBookmarkByUrl = (items, url) => {
        for (const item of items) {
          if (item.type === "url" && item.url === url) {
            return { bookmark: item, parentId: item.parentId || null };
          }
          if (item.type === "folder" && item.children) {
            const found = findBookmarkByUrl(item.children, url);
            if (found) return found;
          }
        }
        return null;
      };
      const result = findBookmarkByUrl(allBookmarks, payload.tab.url);
      if (result?.bookmark) {
        await window.tabPreviewOverlay.bookmarks.move(result.bookmark.id, targetFolderId, 0);
        console.log(`Moved bookmark "${result.bookmark.title}" to folder "${targetFolderId}"`);
      } else {
        console.warn("Could not find bookmark for current tab URL:", payload.tab.url);
      }
      setShowBookmarkDropdown(false);
    } catch (error) {
      console.error("Failed to move bookmark:", error);
      setShowBookmarkDropdown(false);
    }
  }, [payload]);
  const handleAddNewFolder = reactExports.useCallback(async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName || !window.tabPreviewOverlay?.bookmarks) return;
    try {
      const tempId = `temp-${Date.now()}`;
      const newFolder = { id: tempId, title: trimmedName, level: 0 };
      setAllBookmarkFolders((prev) => [...prev, newFolder]);
      setBookmarkFolders((prev) => [...prev, newFolder]);
      setIsAddingNewFolder(false);
      setNewFolderName("");
      const createdFolder = await window.tabPreviewOverlay.bookmarks.createFolder(trimmedName);
      setAllBookmarkFolders((prev) => prev.map((f) => f.id === tempId ? { ...f, id: createdFolder.id } : f));
      setBookmarkFolders((prev) => prev.map((f) => f.id === tempId ? { ...f, id: createdFolder.id } : f));
      console.log("Created new folder:", createdFolder);
    } catch (error) {
      console.error("Failed to create folder:", error);
      setAllBookmarkFolders((prev) => prev.filter((f) => !f.id.startsWith("temp-")));
      setBookmarkFolders((prev) => prev.filter((f) => !f.id.startsWith("temp-")));
    }
  }, [newFolderName]);
  const handleHeaderClick = reactExports.useCallback(() => {
    inputRef.current?.focus();
  }, []);
  const actionButtonClass = "w-[20px] h-[20px] rounded-[6px] flex items-center justify-center transition-colors";
  const placement = payload?.placement ?? "bottom";
  const cardY = payload?.bounds.y ?? 0;
  const DROPDOWN_MAX_HEIGHT = 200;
  const SPACING = 1;
  const dropdownTop = placement === "top" ? cardY - DROPDOWN_MAX_HEIGHT - SPACING : cardY + previewCardHeight + SPACING;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full pointer-events-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute w-full pointer-events-none",
        style: { top: `${cardY}px` },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: payload && (state.open || isClosing) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            ref: previewCardRef,
            className: cn(
              "w-full flex flex-col gap-[6px] p-[8px] rounded-[8px] border pointer-events-auto",
              isDark ? "border-white/5 bg-[#121516]" : "border-black/8 bg-[#FFFFFF]"
            ),
            initial: { opacity: 0, scale: 0.96, x: -20, y: -4 },
            animate: animationControls2,
            exit: { opacity: 0, scale: 0.98, x: 20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
            onPointerEnter: handlePointerEnter,
            onPointerMove: handlePointerMove,
            onPointerLeave: handlePointerLeave,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-col pb-[4px] border-b cursor-text", isDark ? "border-[#22252B]" : "border-[#E2E4E8]"), onClick: handleHeaderClick, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h2",
                  {
                    className: cn("text-[12px] leading-4 tracking-[-0.02em] select-none truncate", isDark ? "text-white" : "text-[#1B1D21]"),
                    onMouseDown: (e2) => e2.preventDefault(),
                    title: payload.tab.title || "Untitled",
                    children: payload.tab.title || "Untitled"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    ref: inputRef,
                    type: "text",
                    value: editedUrl,
                    onChange: handleUrlChange,
                    onKeyDown: handleUrlKeyDown,
                    onCompositionStart: () => setIsUrlComposing(true),
                    onCompositionEnd: () => setIsUrlComposing(false),
                    className: cn(
                      "w-full text-[10px] leading-4 tracking-[-0.02em] bg-transparent border transition-all",
                      "py-[4px] mt-[4px] rounded-[6px] hover:px-[8px] focus:px-[8px]",
                      "border-transparent focus:outline-none",
                      ACTIVE_ITEM_STYLES.inputFocusBorder,
                      isDark ? "text-[#8D95A5] hover:bg-[#2D3139] hover:text-white focus:bg-transparent focus:text-[#8D95A5]" : "text-[#5A6272] hover:bg-[#E2E4E8] hover:text-[#5A6272] focus:bg-transparent focus:text-[#5A6272]"
                    )
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    type: "button",
                    className: cn(
                      actionButtonClass,
                      isDark ? "text-[#8D95A5] hover:bg-white/10" : "text-[#5A6272] hover:bg-[#E2E4E8]"
                    ),
                    onClick: () => sendAction("close-tab"),
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(e, { size: 12, weight: "bold" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    type: "button",
                    disabled: !canGoBack,
                    className: cn(
                      actionButtonClass,
                      !canGoBack ? isDark ? "text-[#2D3139] cursor-not-allowed" : "text-[#C6CAD2] cursor-not-allowed" : isDark ? "text-[#8D95A5] hover:bg-white/10" : "text-[#5A6272] hover:bg-[#E2E4E8]"
                    ),
                    onClick: () => {
                      if (canGoBack) {
                        setOptimisticCanGoBack(false);
                        if (!canGoForward) {
                          setOptimisticCanGoForward(true);
                        }
                        sendAction("back");
                      }
                    },
                    whileHover: canGoBack ? { scale: 1.05 } : {},
                    whileTap: canGoBack ? { scale: 0.95 } : {},
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(t, { size: 12, weight: "bold" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    type: "button",
                    disabled: !canGoForward,
                    className: cn(
                      actionButtonClass,
                      !canGoForward ? isDark ? "text-[#2D3139] cursor-not-allowed" : "text-[#C6CAD2] cursor-not-allowed" : isDark ? "text-[#8D95A5] hover:bg-white/10" : "text-[#5A6272] hover:bg-[#E2E4E8]"
                    ),
                    onClick: () => {
                      if (canGoForward) {
                        setOptimisticCanGoForward(false);
                        if (!canGoBack) {
                          setOptimisticCanGoBack(true);
                        }
                        sendAction("forward");
                      }
                    },
                    whileHover: canGoForward ? { scale: 1.05 } : {},
                    whileTap: canGoForward ? { scale: 0.95 } : {},
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(e$1, { size: 12, weight: "bold" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    type: "button",
                    className: cn(
                      actionButtonClass,
                      isDark ? "text-[#8D95A5] hover:bg-white/10" : "text-[#5A6272] hover:bg-[#E2E4E8]"
                    ),
                    onClick: () => sendAction("reload"),
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(r$1, { size: 12, weight: "bold" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    type: "button",
                    className: cn(
                      actionButtonClass,
                      copied ? "text-green-30 dark:text-green-40" : isDark ? "text-[#8D95A5] hover:bg-white/10" : "text-[#5A6272] hover:bg-[#E2E4E8]"
                    ),
                    onClick: handleCopy,
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                    children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 12, weight: "bold" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(e$2, { size: 12, weight: "bold" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  motion.button,
                  {
                    type: "button",
                    className: cn(
                      actionButtonClass,
                      isBookmarked ? "text-[#FFCC00] hover:text-[#FFB800]" : isDark ? "text-[#8D95A5] hover:bg-white/10" : "text-[#5A6272] hover:bg-[#E2E4E8]"
                      // Not bookmarked - gray
                    ),
                    onClick: handleBookmark,
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(r, { size: 12, weight: isBookmarked ? "fill" : "bold" })
                  }
                )
              ] })
            ]
          },
          "tab-preview-card"
        ) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showBookmarkDropdown && payload && (state.open || isClosing) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        className: cn(
          "absolute w-full flex flex-col py-[10px] px-[8px] rounded-[8px] border pointer-events-auto overflow-hidden max-h-[200px]",
          isDark ? "border-white/5 bg-[#121516]" : "border-black/8 bg-[#FFFFFF]"
        ),
        style: {
          transformOrigin: placement === "top" ? "bottom center" : "top center",
          top: `${dropdownTop}px`
        },
        initial: {
          opacity: 0,
          scale: 0.96,
          y: placement === "top" ? 16 : -16
        },
        animate: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.25,
            ease: [0.16, 1, 0.3, 1],
            opacity: {
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          y: placement === "top" ? 12 : -12,
          transition: {
            duration: 0.2,
            ease: [0.4, 0, 1, 1]
          }
        },
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: searchInputRef,
              type: "text",
              value: folderSearchQuery,
              onChange: (e2) => setFolderSearchQuery(e2.target.value),
              onCompositionStart: () => setIsSearchComposing(true),
              onCompositionEnd: () => setIsSearchComposing(false),
              placeholder: "Add to",
              className: cn(
                "text-[10px] leading-[12px] tracking-[-0.02em] bg-transparent border-none outline-none px-0 py-0",
                isDark ? "text-[#5A6272] placeholder:text-[#5A6272]" : "text-[#8D95A5] placeholder:text-[#8D95A5]"
              ),
              style: {
                outline: "none",
                boxShadow: "none"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-px mt-[8px]", isDark ? "bg-[#22252B]" : "bg-[#E2E4E8]") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex flex-col gap-[4px] pt-[4px] flex-1 overflow-y-auto min-h-0",
              style: {
                maskImage: "linear-gradient(to bottom, black calc(100% - 8px), transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 8px), transparent 100%)"
              },
              children: bookmarkFolders.length > 0 ? bookmarkFolders.map((folder) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.button,
                {
                  type: "button",
                  className: cn(
                    "w-full px-[8px] py-[4px] rounded-[4px] text-[12px] leading-[16px] tracking-[-0.02em] text-left transition-colors truncate shrink-0",
                    isDark ? "text-[#8D95A5] hover:text-[#C6CAD2] hover:bg-[#22252B]" : "text-[#5A6272] hover:bg-[#E2E4E8]",
                    selectedFolderId === folder.id && (isDark ? "bg-[#22252B]" : "bg-[#E2E4E8]")
                  ),
                  onClick: () => handleFolderSelect(folder.id),
                  whileHover: { scale: 1.01 },
                  whileTap: { scale: 0.99 },
                  title: folder.title,
                  children: folder.title
                },
                folder.id
              )) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8D95A5] text-[10px] leading-[12px] tracking-[-0.02em] px-[8px] py-[4px] shrink-0", children: folderSearchQuery ? "No matching folders" : "No folders yet" })
            }
          ),
          isAddingNewFolder ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
            "relative flex items-center justify-center h-[24px] box-border px-[8px] py-[4px] border rounded-[6px] mt-[4px] shrink-0",
            isDark ? "border-[#AB9BFD]" : "border-[#5837FB]"
          ), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: newFolderInputRef,
                type: "text",
                value: newFolderName,
                onChange: (e2) => setNewFolderName(e2.target.value),
                onCompositionStart: () => setIsNewFolderComposing(true),
                onCompositionEnd: () => setIsNewFolderComposing(false),
                onKeyDown: (e2) => {
                  if (isNewFolderComposing) return;
                  if (e2.key === "Enter") {
                    e2.stopPropagation();
                    if (newFolderName.trim()) {
                      e2.preventDefault();
                      handleAddNewFolder();
                    }
                  } else if (e2.key === "Escape") {
                    e2.stopPropagation();
                    setIsAddingNewFolder(false);
                    setNewFolderName("");
                  }
                },
                placeholder: "New collection",
                className: cn(
                  "w-full pr-[16px] text-[12px] leading-[16px] tracking-[-0.02em] bg-transparent border-none outline-none placeholder:text-[#8D95A5] p-0",
                  isDark ? "text-white" : "text-black"
                ),
                style: {
                  outline: "none",
                  boxShadow: "none"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: cn(
                  "absolute right-[4px] top-1/2 -translate-y-1/2 p-[3px] rounded-[4px] transition-colors",
                  isDark ? "bg-[#2D3139] hover:bg-[#33373F]" : "hover:bg-[#E2E4E8]"
                ),
                onClick: handleAddNewFolder,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(o, { size: 10, weight: "bold", className: cn(isDark ? "text-[#8D95A5]" : "text-[#5A6272]") })
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              type: "button",
              className: cn(
                "w-full px-[8px] py-[4px] flex items-center gap-[6px] text-[12px] leading-[16px] tracking-[-0.02em] rounded-[4px] transition-colors mt-[4px] shrink-0",
                isDark ? "text-white hover:bg-[#22252B]" : "text-[#2D3139] hover:bg-[#E2E4E8]"
              ),
              onClick: () => setIsAddingNewFolder(true),
              whileHover: { scale: 1.01 },
              whileTap: { scale: 0.99 },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(e$3, { size: 10, weight: "bold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add new collection" })
              ]
            }
          )
        ]
      },
      "bookmark-dropdown"
    ) })
  ] });
};
setupRendererThemeBridge();
const container = document.getElementById("root");
if (!container) {
  throw new Error("Tab preview overlay root container not found");
}
const root = clientExports.createRoot(container);
root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(App, {}));
