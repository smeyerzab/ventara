import { useEffect, useState } from "react";

export type Route = "home" | "translate" | "crossmode" | "settings" | "navigator";
const ROUTES: Route[] = ["home", "translate", "crossmode", "settings", "navigator"];

const parse = (): Route => {
  const r = location.hash.replace(/^#\/?/, "").split("?")[0] as Route;
  return ROUTES.includes(r) ? r : "home";
};

/** Hash routing keeps the build a static bundle that works from any host or file. */
export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => {
      setRoute(parse());
      window.scrollTo({ top: 0 });
    };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const href = (r: Route) => (r === "home" ? "#/" : `#/${r}`);

/* ── Shareable state in the URL (#/route?s=<base64url json>) ─────────────── */

const b64url = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (raw: string) => {
  // Tolerate what messaging apps and strict browsers do to links: stray whitespace, percent-encoding, missing padding.
  let s = raw.replace(/\s+/g, "");
  try {
    s = decodeURIComponent(s);
  } catch {
    /* already plain */
  }
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  s += "=".repeat((4 - (s.length % 4)) % 4);
  return decodeURIComponent(escape(atob(s)));
};

export function shareUrl(route: Route, state: unknown) {
  return `${location.href.split("#")[0]}#/${route}?s=${b64url(JSON.stringify(state))}`;
}

/** True when the URL carries a share payload that cannot be decoded (truncated or altered link). */
export function sharedLinkBroken(): boolean {
  const q = location.hash.split("?")[1];
  const s = q ? new URLSearchParams(q).get("s") : null;
  if (!s) return false;
  try {
    JSON.parse(unb64url(s));
    return false;
  } catch {
    return true;
  }
}

/** State encoded in the current URL, if any. Read once at page mount. */
export function readShared<T>(): T | null {
  const q = location.hash.split("?")[1];
  if (!q) return null;
  const s = new URLSearchParams(q).get("s");
  if (!s) return null;
  try {
    return JSON.parse(unb64url(s)) as T;
  } catch {
    return null;
  }
}

/** Per-device convenience storage. Never holds patient data. */
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem("ventara:" + key);
      return v == null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem("ventara:" + key, JSON.stringify(value));
    } catch {
      /* storage unavailable — fine */
    }
  },
};
