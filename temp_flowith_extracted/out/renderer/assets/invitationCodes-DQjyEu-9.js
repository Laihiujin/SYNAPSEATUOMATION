import { c as create } from "./themeBridge-XpPGWB57.js";
import "./theme-sVdefUwF.js";
import "./client-DljuHW-m.js";
const CACHE_DURATION = 3e4;
const useInvitationCodesStore = create((set, get) => ({
  codes: [],
  isLoading: false,
  error: null,
  lastFetchTime: null,
  fetchCodes: async () => {
    const state = get();
    if (state.isLoading) {
      console.log("[InvitationCodesStore] Fetch already in progress, skipping");
      return;
    }
    const now = Date.now();
    if (state.lastFetchTime && now - state.lastFetchTime < CACHE_DURATION) {
      console.log("[InvitationCodesStore] Using cached data");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const result = await window.sideBarAPI?.osInvitation?.getMyCodes?.();
      if (result?.error) {
        console.error("[InvitationCodesStore] API error:", result.error);
        set({ error: result.error, codes: [], isLoading: false });
      } else if (result?.codes) {
        console.log("[InvitationCodesStore] Fetched codes:", result.codes.length);
        set({
          codes: result.codes,
          error: null,
          isLoading: false,
          lastFetchTime: Date.now()
        });
      } else {
        set({ error: "Unexpected response format", codes: [], isLoading: false });
      }
    } catch (error) {
      console.error("[InvitationCodesStore] Fetch error:", error);
      set({ error: String(error), codes: [], isLoading: false });
    }
  },
  getCachedCodes: () => get().codes,
  hasAllCodesActivated: () => {
    const codes = get().codes;
    if (codes.length === 0) return false;
    return codes.every((code) => code.used === true);
  },
  reset: () => {
    set({ codes: [], isLoading: false, error: null, lastFetchTime: null });
  }
}));
export {
  useInvitationCodesStore
};
