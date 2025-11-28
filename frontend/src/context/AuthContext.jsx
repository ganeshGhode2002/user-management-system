import React, { createContext, useCallback, useEffect, useState } from "react";

// create
export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

// provider
export function AuthProvider({ children }) {
  // initialise from storage (localStorage preferred for "remember")
  const initialToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || null;
  const initialUser = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(initialUser);

  // login helper
  const login = useCallback(({ token: newToken, user: newUser, remember = true }) => {
    // update react state
    setToken(newToken ?? null);
    setUser(newUser ?? null);

    // write to storage consistently
    if (remember) {
      localStorage.setItem("authToken", newToken);
      sessionStorage.removeItem("authToken");
    } else {
      sessionStorage.setItem("authToken", newToken);
      localStorage.removeItem("authToken");
    }

    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));
    else localStorage.removeItem("user");

    // notify same-tab listeners (storage event doesn't fire in same tab)
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: newToken, user: newUser } }));
  }, []);

  // logout helper
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("authToken");

    window.dispatchEvent(new CustomEvent("authChanged", { detail: { token: null, user: null } }));
  }, []);

  // keep context in sync if user manually clears storage in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken" || e.key === "user") {
        const t = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || null;
        const u = (() => {
          try {
            const s = localStorage.getItem("user");
            return s ? JSON.parse(s) : null;
          } catch {
            return null;
          }
        })();
        setToken(t);
        setUser(u);
      }
    };

    // custom event for same-tab updates
    const onAuthChanged = (e) => {
      const { token: t, user: u } = e.detail || {};
      // if detail present — use it, otherwise fallback to reading storage
      if (typeof t !== "undefined" || typeof u !== "undefined") {
        setToken(t ?? (localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || null));
        setUser(u ?? (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null));
      } else {
        onStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("authChanged", onAuthChanged);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("authChanged", onAuthChanged);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
