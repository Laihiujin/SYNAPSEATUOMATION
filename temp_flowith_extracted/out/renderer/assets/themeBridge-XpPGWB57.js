import { r as resolveSystemTheme } from "./theme-sVdefUwF.js";
import { R as React } from "./client-DljuHW-m.js";
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const api = { setState, getState, getInitialState, subscribe };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = ((createState) => createState ? createStoreImpl(createState) : createStoreImpl);
const identity = (arg) => arg;
function useStore(api, selector = identity) {
  const slice = React.useSyncExternalStore(
    api.subscribe,
    React.useCallback(() => selector(api.getState()), [api, selector]),
    React.useCallback(() => selector(api.getInitialState()), [api, selector])
  );
  React.useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = ((createState) => createState ? createImpl(createState) : createImpl);
const GRADIENT_STORAGE_KEY = "flowith-os-gradient";
const CUSTOM_BACKGROUND_STORAGE_KEY = "flowith-os-custom-background";
const persistMode = (mode) => {
  try {
    localStorage.setItem("flowith-theme-mode", mode);
  } catch {
  }
};
const getInitialMode = () => {
  try {
    const saved = localStorage.getItem("flowith-theme-mode");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
  }
  return "dark";
};
const persistGradient = (gradientId) => {
  try {
    localStorage.setItem(GRADIENT_STORAGE_KEY, gradientId);
  } catch {
  }
};
const getInitialGradient = () => {
  try {
    const saved = localStorage.getItem(GRADIENT_STORAGE_KEY);
    if (saved) return saved;
  } catch {
  }
  return "midnight-sage";
};
const persistCustomBackground = (background) => {
  try {
    if (background) {
      localStorage.setItem(CUSTOM_BACKGROUND_STORAGE_KEY, JSON.stringify(background));
    } else {
      localStorage.removeItem(CUSTOM_BACKGROUND_STORAGE_KEY);
    }
  } catch {
  }
};
const getInitialCustomBackground = () => {
  try {
    const saved = localStorage.getItem(CUSTOM_BACKGROUND_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
  }
  return null;
};
const sendModeToMain = (mode, resolvedMode) => {
  try {
    window.themeAPI?.setMode(mode, resolvedMode);
  } catch {
  }
};
const sendGradientToMain = (gradientId) => {
  try {
    window.themeAPI?.setGradientId(gradientId);
  } catch {
  }
};
const getInitialResolvedMode = () => {
  const mode = getInitialMode();
  if (mode === "system") return resolveSystemTheme();
  return mode;
};
const useThemeStore = create((set, get) => ({
  mode: getInitialMode(),
  resolvedMode: getInitialResolvedMode(),
  gradientId: getInitialGradient(),
  customBackground: getInitialCustomBackground(),
  setMode: (mode) => {
    if (mode !== "light" && mode !== "dark" && mode !== "system") return;
    const resolved = mode === "system" ? resolveSystemTheme() : mode;
    set({ mode, resolvedMode: resolved });
    persistMode(mode);
    sendModeToMain(mode, resolved);
  },
  toggle: () => {
    const current = get().mode;
    const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";
    get().setMode(next);
  },
  updateResolvedMode: () => {
    const current = get().mode;
    if (current === "system") {
      const resolved = resolveSystemTheme();
      if (get().resolvedMode !== resolved) {
        set({ resolvedMode: resolved });
        sendModeToMain("system", resolved);
      }
    }
  },
  applyExternalMode: (mode) => {
    if (mode !== "light" && mode !== "dark" && mode !== "system") return;
    const current = get().mode;
    if (current === mode) {
      persistMode(mode);
      return;
    }
    const resolved = mode === "system" ? resolveSystemTheme() : mode;
    set({ mode, resolvedMode: resolved });
    persistMode(mode);
  },
  applyExternalGradient: (gradientId) => {
    if (!gradientId) return;
    const current = get().gradientId;
    if (current === gradientId) {
      persistGradient(gradientId);
      return;
    }
    set({ gradientId });
    persistGradient(gradientId);
  },
  setGradientId: (gradientId) => {
    set({ gradientId });
    persistGradient(gradientId);
    sendGradientToMain(gradientId);
  },
  setCustomBackground: (background) => {
    set({ customBackground: background, gradientId: "custom" });
    persistCustomBackground(background);
    persistGradient("custom");
    sendGradientToMain("custom");
  }
}));
const isBrowserEnvironment = typeof window !== "undefined";
const updateDocumentThemeClass = (resolvedMode) => {
  if (!isBrowserEnvironment) return;
  document.documentElement.classList.toggle("dark", resolvedMode === "dark");
  document.body.classList.toggle("dark", resolvedMode === "dark");
};
const defaultOptions = {
  applyToDocument: true
};
const applyThemeState = (state, applyDocument) => {
  const store = useThemeStore.getState();
  if (state.mode && state.resolvedMode !== void 0) {
    if (store.mode !== state.mode) {
      store.applyExternalMode(state.mode);
    }
    if (store.resolvedMode !== state.resolvedMode) {
      useThemeStore.setState({ resolvedMode: state.resolvedMode });
    }
  } else {
    const normalized = state.mode === "light" ? "light" : "dark";
    store.applyExternalMode(normalized);
  }
  store.applyExternalGradient(state.gradientId);
  if (applyDocument) {
    const currentResolvedMode = useThemeStore.getState().resolvedMode;
    updateDocumentThemeClass(currentResolvedMode);
  }
};
async function setupRendererThemeBridge(options = defaultOptions) {
  const opts = { ...defaultOptions, ...options };
  if (!isBrowserEnvironment) {
    return () => {
    };
  }
  const themeAPI = window.themeAPI;
  if (!themeAPI) {
    const current = useThemeStore.getState().resolvedMode;
    if (opts.applyToDocument) {
      updateDocumentThemeClass(current);
    }
    return () => {
    };
  }
  const localResolvedMode = useThemeStore.getState().resolvedMode;
  if (opts.applyToDocument) {
    updateDocumentThemeClass(localResolvedMode);
  }
  const maxAttempts = 5;
  const baseDelayMs = 120;
  let cancelled = false;
  const unsubscribe = themeAPI.onModeChange((state) => {
    if (cancelled) return;
    applyThemeState(state, !!opts.applyToDocument);
  });
  try {
    const [remoteMode, remoteGradientId] = await Promise.all([
      themeAPI.getMode(),
      themeAPI.getGradientId()
    ]);
    if (!cancelled) {
      applyThemeState({ mode: remoteMode, gradientId: remoteGradientId }, !!opts.applyToDocument);
    }
  } catch {
  }
  const attemptSync = async (attempt) => {
    if (cancelled) return;
    try {
      themeAPI.requestSync?.();
      return;
    } catch {
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return attemptSync(attempt + 1);
      }
    }
  };
  void attemptSync(0);
  return () => {
    try {
      unsubscribe();
    } catch {
    }
    cancelled = true;
  };
}
export {
  create as c,
  setupRendererThemeBridge as s,
  useThemeStore as u
};
