import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  ChevronRight,
  Info,
  LogOut,
  Radar as RadarIcon,
  RefreshCcw,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { categories, goalLabels } from "../data";
import { formatDeadline, timestampLabel } from "../format";
import { useNav } from "../nav";
import { useStore } from "../store";
import { CategoryIcon, Section } from "../components";
import { Button, Chip, Feedback, RadarMark } from "../ui";
import { ChildTopBar } from "../shell";
import type { AppNotification, CategoryId } from "../types";

/* ---------------------------------------------------------------- Notifications */

const NOTIF_ICON = {
  deadline: CalendarClock,
  sourceChanged: RefreshCcw,
  expectedItemConfirmed: Sparkles,
  recommendation: RadarIcon,
} as const;

export function Notifications() {
  const { notifications, unreadCount, markNotificationRead, markAllRead, notificationsPermission, setNotificationsPermission } = useStore();
  const { navigate } = useNav();

  const today = notifications.filter((n) => n.createdAt.startsWith("2026-08-28"));
  const earlier = notifications.filter((n) => !n.createdAt.startsWith("2026-08-28"));

  function open(n: AppNotification) {
    markNotificationRead(n.id);
    if (n.type === "expectedItemConfirmed") navigate({ name: "detail", id: n.opportunityId });
    else navigate({ name: "detail", id: n.opportunityId });
  }

  const Group = ({ title, list }: { title: string; list: AppNotification[] }) =>
    list.length ? (
      <div className="stack">
        <p className="overline">{title}</p>
        {list.map((n) => {
          const Icon = NOTIF_ICON[n.type];
          return (
            <button key={n.id} className={`notif ${n.isRead ? "" : "notif--unread"}`} onClick={() => open(n)}>
              <span className="notif__icon" aria-hidden><Icon size={18} /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "flex", gap: "var(--radar-space-2)", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>{n.title}</span>
                  <span className="deadline__abs tnum" style={{ whiteSpace: "nowrap" }}>{timestampLabel(n.createdAt)}</span>
                </span>
                <span style={{ display: "block", fontSize: "var(--radar-font-size-small)", color: "var(--radar-color-text-secondary)" }}>
                  {n.body}
                </span>
              </span>
              {!n.isRead ? <span className="notif__dot" aria-label="Unread" /> : null}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <>
      <ChildTopBar
        title="Notifications"
        actions={
          <button
            className="linkbtn"
            style={{
              paddingInline: "var(--radar-space-2)",
              ...(unreadCount === 0
                ? { color: "var(--radar-color-text-disabled)", cursor: "default" }
                : null),
            }}
            onClick={unreadCount === 0 ? undefined : markAllRead}
            disabled={unreadCount === 0}
            aria-disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        }
      />
      <div className="screen stack">
        {notificationsPermission === "denied" ? (
          <div className="alert alert--warning">
            <AlertTriangle size={16} aria-hidden style={{ flex: "none", marginTop: "0.125rem" }} />
            Push notifications are off. You still see updates here for saved and watched items.
            <button className="linkbtn" onClick={() => setNotificationsPermission("granted")}>Turn on</button>
          </div>
        ) : null}

        {notifications.length === 0 ? (
          <Feedback icon={<BellRing size={32} aria-hidden color="var(--radar-color-text-secondary)" />} title="You're all caught up" text="Updates for saved and watched opportunities appear here." />
        ) : (
          <>
            <Group title="Today" list={today} />
            <Group title="Earlier" list={earlier} />
          </>
        )}

        <Button variant="tertiary" icon={<Shield size={16} aria-hidden />}>
          Notification settings
        </Button>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Profile */

const DISCLAIMER = "Student-built for NUS students - not an official NUS service.";

export function Profile() {
  const { profile, updateProfile, resetDemo, notificationsPermission, setNotificationsPermission } = useStore();
  const { setPhase, openSheet, navigate } = useNav();

  function toggleInterest(c: CategoryId) {
    const has = profile.interests.includes(c);
    if (has) updateProfile({ interests: profile.interests.filter((x) => x !== c) });
    else if (profile.interests.length < 3) updateProfile({ interests: [...profile.interests, c] });
  }

  return (
    <>
      <ChildTopBar title="Profile" actions={undefined} />
      <div className="screen stack">
        <div className="card stack--sm">
          <p className="section__title">{profile.firstName}</p>
          <p className="deadline__abs">Year {profile.year} · {profile.faculty}</p>
        </div>

        <Section title="Your interests">
          <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
            {categories.map((c) => (
              <Chip
                key={c.id}
                pressed={profile.interests.includes(c.id)}
                onToggle={() => toggleInterest(c.id)}
                disabled={!profile.interests.includes(c.id) && profile.interests.length >= 3}
              >
                <CategoryIcon id={c.id} /> {c.label}
              </Chip>
            ))}
          </div>
          <p className="deadline__abs" style={{ marginTop: "var(--radar-space-2)" }}>
            Up to three. Changes update your For You feed immediately.
          </p>
        </Section>

        <Section title="Goals">
          <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
            {profile.goals.map((g) => (
              <span key={g} className="tag">{goalLabels[g] ?? g}</span>
            ))}
          </div>
        </Section>

        <Section title="How matching works">
          <button className="optionrow" onClick={() => openSheet({ name: "howMatching" })}>
            <Info size={18} aria-hidden />
            <span style={{ flex: 1 }}>See the scoring factors and disclaimer</span>
            <ChevronRight size={18} aria-hidden />
          </button>
        </Section>

        <Section title="Notifications & privacy">
          <div className="stack--sm">
            <div className="optionrow" style={{ cursor: "default" }}>
              <BellRing size={18} aria-hidden />
              <span style={{ flex: 1 }}>Push notifications</span>
              <Button
                size="sm"
                variant={notificationsPermission === "granted" ? "secondary" : "primary"}
                onClick={() =>
                  setNotificationsPermission(notificationsPermission === "granted" ? "denied" : "granted")
                }
              >
                {notificationsPermission === "granted" ? "On" : notificationsPermission === "denied" ? "Off" : "Turn on"}
              </Button>
            </div>
            <button className="optionrow" onClick={() => navigate({ name: "widget" })}>
              <Smartphone size={18} aria-hidden />
              <span style={{ flex: 1 }}>Preview lock-screen widget</span>
              <ChevronRight size={18} aria-hidden />
            </button>
            <button className="optionrow" onClick={() => navigate({ name: "notifications" })}>
              <BellRing size={18} aria-hidden />
              <span style={{ flex: 1 }}>Open notifications</span>
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </Section>

        <Section title="About">
          <div className="card stack--sm">
            <p style={{ fontWeight: 600 }}>{DISCLAIMER}</p>
            <p className="deadline__abs">
              Demo content is fictional. Radar is a decision and planning layer above official
              sources - it does not submit applications or claim any NUS partnership.
            </p>
          </div>
        </Section>

        <div className="stack--sm">
          <Button variant="secondary" icon={<RefreshCcw size={16} aria-hidden />} onClick={resetDemo}>
            Reset demo data
          </Button>
          <Button variant="destructive" icon={<LogOut size={16} aria-hidden />} onClick={() => { resetDemo(); setPhase("landing"); }}>
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Widget screen */

export function WidgetScreen() {
  const { opportunities, isWatching, notificationsPermission, setNotificationsPermission } = useStore();
  const { back, navigate } = useNav();

  const saved = opportunities.find((o) => o.progress.status === "saved" || o.progress.status === "preparing");
  const best = [...opportunities]
    .filter((o) => o.availability === "open" || o.availability === "closingSoon")
    .sort((a, b) => b.match.score - a.match.score)[0];
  const opp = saved ?? best;
  const isStale = opp?.availability === "closed";

  return (
    <>
      <ChildTopBar title="Lock-screen Widget" />
      <div className="screen stack">
        <p className="feedback__text" style={{ textAlign: "left" }}>
          The Radar widget pins your top saved opportunity to your lock screen so you never miss a deadline.
        </p>

        {/* Phone frame mockup */}
        <div style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: "18rem",
          background: "var(--radar-navy-950)",
          borderRadius: "2.5rem",
          padding: "1rem",
          boxShadow: "0 0 0 6px #1a1a2e, 0 24px 48px rgba(0,0,0,0.5)",
          position: "relative",
        }}>
          {/* Camera pill */}
          <div style={{
            width: "7rem",
            height: "1.75rem",
            background: "#000",
            borderRadius: "999px",
            margin: "0 auto 1.25rem",
          }} aria-hidden />

          {/* Lock screen content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--radar-space-4)", padding: "0 var(--radar-space-2) var(--radar-space-4)" }}>
            {/* Clock */}
            <div style={{ textAlign: "center", color: "var(--radar-color-text-inverse)" }}>
              <p style={{ fontSize: "4rem", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>9:41</p>
              <p style={{ fontSize: "var(--radar-font-size-body)", opacity: 0.75, marginTop: "var(--radar-space-1)" }}>Friday, 28 August</p>
            </div>

            {/* Widget card */}
            {notificationsPermission === "denied" ? (
              <div style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                borderRadius: "var(--radar-radius-large)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "var(--radar-space-4)",
                color: "var(--radar-color-text-inverse)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--radar-space-2)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--radar-space-2)" }}>
                  <RadarMark size={16} />
                  <span style={{ fontSize: "var(--radar-font-size-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.7 }}>Radar</span>
                </div>
                <p style={{ fontSize: "var(--radar-font-size-small)", opacity: 0.7 }}>Enable notifications to activate the widget.</p>
              </div>
            ) : opp ? (
              <button
                style={{
                  all: "unset",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "var(--radar-radius-large)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "var(--radar-space-4)",
                  color: "var(--radar-color-text-inverse)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--radar-space-2)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onClick={() => navigate({ name: "detail", id: opp.id })}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--radar-space-1)" }}>
                    <RadarMark size={18} />
                    <span style={{ fontSize: "var(--radar-font-size-small)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--radar-color-signal)" }}>Radar</span>
                  </span>
                  {isWatching(opp.id) ? (
                    <span style={{ fontSize: "var(--radar-font-size-caption)", background: "rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0.1rem 0.5rem", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>Watching</span>
                  ) : opp.match.score >= 50 ? (
                    <span style={{ fontSize: "var(--radar-font-size-caption)", color: "var(--radar-color-match-text)", fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>{opp.match.score}% {opp.match.label}</span>
                  ) : null}
                </div>

                <p style={{ fontWeight: 700, fontSize: "var(--radar-font-size-small)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {opp.title}
                </p>

                <p style={{ fontSize: "var(--radar-font-size-caption)", opacity: 0.75, fontVariantNumeric: "tabular-nums" }}>
                  {isStale
                    ? "Applications closed"
                    : opp.applicationDeadline
                      ? formatDeadline(opp.applicationDeadline)
                      : "Dates not yet announced"}
                </p>
              </button>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                borderRadius: "var(--radar-radius-large)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "var(--radar-space-4)",
                color: "var(--radar-color-text-inverse)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--radar-space-2)" }}>
                  <RadarMark size={16} />
                  <span style={{ fontSize: "var(--radar-font-size-caption)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.7 }}>Radar</span>
                </div>
                <p style={{ fontSize: "var(--radar-font-size-small)", marginTop: "var(--radar-space-2)", opacity: 0.7 }}>Save an opportunity to pin it here.</p>
              </div>
            )}

            {/* Home indicator */}
            <div style={{ width: "6rem", height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.3)", margin: "0.5rem auto 0" }} aria-hidden />
          </div>
        </div>

        {/* Controls below phone mockup */}
        <div className="card stack--sm" style={{ marginTop: "var(--radar-space-2)" }}>
          <p className="overline">Widget settings</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--radar-space-3)" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "var(--radar-font-size-small)" }}>Push notifications</p>
              <p className="deadline__abs">Required to show deadline alerts</p>
            </div>
            <Button
              size="sm"
              variant={notificationsPermission === "granted" ? "secondary" : "primary"}
              onClick={() => setNotificationsPermission(notificationsPermission === "granted" ? "denied" : "granted")}
            >
              {notificationsPermission === "granted" ? "On" : "Enable"}
            </Button>
          </div>
        </div>

        <div className="alert alert--info">
          <Info size={16} aria-hidden style={{ flex: "none", marginTop: "0.125rem" }} />
          <span>
            The widget updates automatically when you save an opportunity or a deadline changes.
            In this prototype, no real notifications are sent.
          </span>
        </div>
      </div>
    </>
  );
}
