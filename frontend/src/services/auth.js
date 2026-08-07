const T = "thinkhive_token", R = "thinkhive_refresh";
export const storeLoginToken = (r) => { localStorage.setItem(T, r.access_token); localStorage.setItem(R, r.refresh_token); };
export const getToken = () => localStorage.getItem(T);
export const clearToken = () => { localStorage.removeItem(T); localStorage.removeItem(R); };
