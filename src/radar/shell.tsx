import { ArrowLeft, Bell, BookMarked, Compass, User, Radar } from "lucide-react";
import type { ReactNode } from "react";
import { useNav, type Tab } from "./nav";
import { useStore } from "./store";
import { IconButton, RadarMark } from "./ui";

const TABS: { id: Tab; label: string; icon: typeof Compass }[] = [
  { id: "foryou", label: "For You", icon: Radar },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "plan", label: "Plan", icon: BookMarked },
  { id: "profile", label: "Profile", icon: User },
];

export function RootTopBar({ title }: { title: string }) {
  const { navigate } = useNav();
  const { unreadCount } = useStore();
  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <span className="topbar__spacer" />
      <IconButton
        label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        badge={unreadCount || undefined}
        onClick={() => navigate({ name: "notifications" })}
      >
        <Bell size={22} aria-hidden />
      </IconButton>
    </header>
  );
}

export function ChildTopBar({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  const { back } = useNav();
  return (
    <header className="topbar">
      <IconButton label="Back" onClick={back}>
        <ArrowLeft size={22} aria-hidden />
      </IconButton>
      <h1 className="topbar__title">{title}</h1>
      <span className="topbar__spacer" />
      {actions}
    </header>
  );
}

export function BottomNav() {
  const { tab, switchTab, stack } = useNav();
  // The active tab highlight reflects the root destination even inside a stack.
  return (
    <nav className="bottomnav" aria-label="Primary">
      {TABS.map((t) => {
        const Icon = t.icon;
        const current = tab === t.id && stack.length === 0;
        return (
          <button
            key={t.id}
            className="navitem"
            aria-current={current ? "page" : undefined}
            onClick={() => switchTab(t.id)}
          >
            <span className="navitem__ind" aria-hidden />
            <Icon size={24} aria-hidden />
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

export function NavigationRail() {
  const { tab, switchTab, stack } = useNav();
  return (
    <aside className="rail">
      <div className="rail__brand">
        <RadarMark size={28} /> Radar
      </div>
      <nav aria-label="Primary">
        {TABS.map((t) => {
          const Icon = t.icon;
          const current = tab === t.id && stack.length === 0;
          return (
            <button
              key={t.id}
              className="railitem"
              aria-current={current ? "page" : undefined}
              onClick={() => switchTab(t.id)}
            >
              <Icon size={20} aria-hidden />
              {t.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="radar-app shell shell--nav">
      <a className="skip-link" href="#radar-main">
        Skip to content
      </a>
      <NavigationRail />
      <div className="shell__frame">
        <main className="shell__main" id="radar-main">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
