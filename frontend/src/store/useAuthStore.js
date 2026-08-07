import { create } from "zustand";
import { getCurrentUser, login as apiLogin } from "../services/api";
import { clearToken, getToken, storeLoginToken } from "../services/auth";
export const useAuthStore = create(set => ({
  user: null, token: getToken(), isLoading: false,
  async login(email, password, slug) {
    set({ isLoading: true });
    try { const r = await apiLogin(email, password, slug); storeLoginToken(r); const user = await getCurrentUser(); set({ token: r.access_token, user, isLoading: false }); return user; }
    catch (e) { set({ isLoading: false }); throw e; }
  },
  async fetchUser() { if (!getToken()) return; try { set({ user: await getCurrentUser() }); } catch { clearToken(); set({ user: null, token: null }); } },
  logout() { clearToken(); set({ user: null, token: null }); window.location.href = "/login"; },
}));
