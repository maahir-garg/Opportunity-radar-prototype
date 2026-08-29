import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  seedNotifications,
  seedOpportunities,
  seedProfile,
} from "./data";
import type {
  AppNotification,
  CategoryId,
  Opportunity,
  ProgressStatus,
  Profile,
} from "./types";

const STORAGE_KEY = "radar-proto-v1";

interface PersistShape {
  progress: Record<
    string,
    { status: ProgressStatus; nextAction: string | null; reminderAt: string | null; updatedAt: string | null }
  >;
  forecastWatch: Record<string, boolean>;
  readNotifications: string[];
  profile: Profile | null;
  onboarded: boolean;
  notificationsPermission: "default" | "granted" | "denied";
}

interface Toast {
  id: number;
  message: string;
  undo?: () => void;
}

interface StoreValue {
  opportunities: Opportunity[];
  profile: Profile;
  notifications: AppNotification[];
  unreadCount: number;
  notificationsPermission: PersistShape["notificationsPermission"];
  onboarded: boolean;
  toasts: Toast[];
  liveMessage: string;
  getOpportunity: (id: string) => Opportunity | undefined;
  setStatus: (id: string, status: ProgressStatus, opts?: { silent?: boolean; nextAction?: string | null }) => void;
  toggleSave: (id: string) => void;
  setReminder: (id: string, reminderAt: string | null) => void;
  setNextAction: (id: string, next: string) => void;
  watchForecast: (id: string) => void;
  isWatching: (id: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  setNotificationsPermission: (p: PersistShape["notificationsPermission"]) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  completeOnboarding: (profile: Profile) => void;
  resetDemo: () => void;
  pushToast: (message: string, undo?: () => void) => void;
  dismissToast: (id: number) => void;
  announce: (message: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadPersist(): Partial<PersistShape> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistShape) : {};
  } catch {
    return {};
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const persisted = useRef(loadPersist());

  const [progress, setProgress] = useState<PersistShape["progress"]>(() => {
    const base: PersistShape["progress"] = {};
    for (const o of seedOpportunities) base[o.id] = { ...o.progress };
    return { ...base, ...persisted.current.progress };
  });
  const [forecastWatch, setForecastWatch] = useState<Record<string, boolean>>(
    persisted.current.forecastWatch ?? {},
  );
  const [readNotifications, setReadNotifications] = useState<string[]>(
    persisted.current.readNotifications ?? [],
  );
  const [profile, setProfile] = useState<Profile>(
    persisted.current.profile ?? seedProfile,
  );
  const [onboarded, setOnboarded] = useState<boolean>(
    persisted.current.onboarded ?? false,
  );
  const [notificationsPermission, setNotificationsPermissionState] = useState<
    PersistShape["notificationsPermission"]
  >(persisted.current.notificationsPermission ?? "default");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [liveMessage, setLiveMessage] = useState("");
  const toastId = useRef(0);

  // Persist to localStorage on relevant changes.
  useEffect(() => {
    const shape: PersistShape = {
      progress,
      forecastWatch,
      readNotifications,
      profile,
      onboarded,
      notificationsPermission,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
    } catch {
      /* ignore quota / privacy errors */
    }
  }, [progress, forecastWatch, readNotifications, profile, onboarded, notificationsPermission]);

  const opportunities = useMemo(
    () => seedOpportunities.map((o) => ({ ...o, progress: progress[o.id] ?? o.progress })),
    [progress],
  );

  const getOpportunity = useCallback(
    (id: string) => opportunities.find((o) => o.id === id),
    [opportunities],
  );

  const announce = useCallback((message: string) => setLiveMessage(message), []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, undo?: () => void) => {
      const id = ++toastId.current;
      setToasts((t) => [...t, { id, message, undo }]);
      setLiveMessage(message);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
    },
    [],
  );

  const patchProgress = useCallback(
    (id: string, patch: Partial<PersistShape["progress"][string]>) => {
      setProgress((p) => {
        const prev = p[id] ?? { status: "none", nextAction: null, reminderAt: null, updatedAt: null };
        return {
          ...p,
          [id]: { ...prev, ...patch, updatedAt: new Date().toISOString() },
        };
      });
    },
    [],
  );

  const setStatus = useCallback<StoreValue["setStatus"]>(
    (id, status, opts) => {
      patchProgress(id, { status, ...(opts?.nextAction !== undefined ? { nextAction: opts.nextAction } : {}) });
      if (!opts?.silent) {
        const labels: Record<ProgressStatus, string> = {
          none: "Removed from Plan",
          saved: "Saved to Plan",
          preparing: "Moved to Preparing",
          applied: "Marked as applied",
          completed: "Marked as completed",
          dismissed: "Recommendation hidden",
        };
        announce(labels[status]);
      }
    },
    [patchProgress, announce],
  );

  const toggleSave = useCallback(
    (id: string) => {
      const current = progress[id]?.status ?? "none";
      if (current === "none" || current === "dismissed") {
        patchProgress(id, { status: "saved" });
        pushToast("Saved to Plan", () => patchProgress(id, { status: "none", reminderAt: null }));
      } else {
        patchProgress(id, { status: "none", reminderAt: null });
        pushToast("Removed from Plan", () => patchProgress(id, { status: "saved" }));
      }
    },
    [progress, patchProgress, pushToast],
  );

  const setReminder = useCallback(
    (id: string, reminderAt: string | null) => {
      patchProgress(id, { reminderAt, status: progress[id]?.status === "none" ? "saved" : progress[id]?.status });
      if (reminderAt) pushToast("Reminder set");
      else announce("Reminder removed");
    },
    [patchProgress, progress, pushToast, announce],
  );

  const setNextAction = useCallback(
    (id: string, next: string) => {
      patchProgress(id, { nextAction: next });
      announce("Next action updated");
    },
    [patchProgress, announce],
  );

  const watchForecast = useCallback(
    (id: string) => {
      setForecastWatch((f) => ({ ...f, [id]: true }));
      patchProgress(id, { status: progress[id]?.status === "none" ? "saved" : progress[id]?.status });
      pushToast("Added to your watchlist", () => setForecastWatch((f) => ({ ...f, [id]: false })));
    },
    [patchProgress, progress, pushToast],
  );

  const isWatching = useCallback((id: string) => !!forecastWatch[id], [forecastWatch]);

  const notifications = useMemo<AppNotification[]>(
    () =>
      seedNotifications.map((n) => ({
        ...n,
        isRead: readNotifications.includes(n.id) || n.isRead,
      })),
    [readNotifications],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationRead = useCallback((id: string) => {
    setReadNotifications((r) => (r.includes(id) ? r : [...r, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadNotifications(seedNotifications.map((n) => n.id));
    announce("All notifications marked read");
  }, [announce]);

  const setNotificationsPermission = useCallback((p: PersistShape["notificationsPermission"]) => {
    setNotificationsPermissionState(p);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
    announce("Profile updated - your matches will reflect the change");
  }, [announce]);

  const completeOnboarding = useCallback((next: Profile) => {
    setProfile(next);
    setOnboarded(true);
  }, []);

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const base: PersistShape["progress"] = {};
    for (const o of seedOpportunities) base[o.id] = { ...o.progress };
    setProgress(base);
    setForecastWatch({});
    setReadNotifications([]);
    setProfile(seedProfile);
    setOnboarded(false);
    setNotificationsPermissionState("default");
  }, []);

  const value: StoreValue = {
    opportunities,
    profile,
    notifications,
    unreadCount,
    notificationsPermission,
    onboarded,
    toasts,
    liveMessage,
    getOpportunity,
    setStatus,
    toggleSave,
    setReminder,
    setNextAction,
    watchForecast,
    isWatching,
    markNotificationRead,
    markAllRead,
    setNotificationsPermission,
    updateProfile,
    completeOnboarding,
    resetDemo,
    pushToast,
    dismissToast,
    announce,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export type { CategoryId };
