import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Tab = "foryou" | "explore" | "plan" | "profile";

export type Route =
  | { name: "detail"; id: string }
  | { name: "radar" }
  | { name: "expected"; id: string }
  | { name: "askradar" }
  | { name: "reviews"; id: string }
  | { name: "notifications" }
  | { name: "widget" };

export type Sheet =
  | { name: "why"; id: string }
  | { name: "reminder"; id: string }
  | { name: "filter" }
  | { name: "handoff"; id: string; failed?: boolean }
  | { name: "howMatching" }
  | { name: "widget" };

export type Phase = "landing" | "welcome" | "setup" | "app";

interface NavValue {
  phase: Phase;
  setPhase: (p: Phase) => void;
  tab: Tab;
  stack: Route[];
  current: Route | null;
  sheet: Sheet | null;
  navigate: (r: Route) => void;
  back: () => void;
  switchTab: (t: Tab) => void;
  openSheet: (s: Sheet) => void;
  closeSheet: () => void;
}

const NavContext = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [tab, setTab] = useState<Tab>("foryou");
  const [stack, setStack] = useState<Route[]>([]);
  const [sheet, setSheet] = useState<Sheet | null>(null);

  const navigate = useCallback((r: Route) => {
    setStack((s) => [...s, r]);
    window.scrollTo({ top: 0 });
  }, []);

  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  const switchTab = useCallback((t: Tab) => {
    setTab(t);
    setStack([]);
    setSheet(null);
  }, []);

  const openSheet = useCallback((s: Sheet) => setSheet(s), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  const value = useMemo<NavValue>(
    () => ({
      phase,
      setPhase,
      tab,
      stack,
      current: stack.length ? stack[stack.length - 1] : null,
      sheet,
      navigate,
      back,
      switchTab,
      openSheet,
      closeSheet,
    }),
    [phase, tab, stack, sheet, navigate, back, switchTab, openSheet, closeSheet],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
