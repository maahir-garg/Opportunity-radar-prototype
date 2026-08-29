import { useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Eye,
  Pencil,
} from "lucide-react";
import { categoryById } from "../data";
import { daysUntil, formatDate, formatDeadline } from "../format";
import { useNav } from "../nav";
import { useStore } from "../store";
import { DeadlineBadge, Section } from "../components";
import { Button, Feedback } from "../ui";
import { RootTopBar } from "../shell";
import type { Opportunity, ProgressStatus } from "../types";

type PlanTab = "saved" | "preparing" | "applied" | "past";

const TABS: { id: PlanTab; label: string; statuses: ProgressStatus[] }[] = [
  { id: "saved", label: "Saved", statuses: ["saved"] },
  { id: "preparing", label: "Preparing", statuses: ["preparing"] },
  { id: "applied", label: "Applied", statuses: ["applied"] },
  { id: "past", label: "Past", statuses: ["completed"] },
];

const EMPTY_COPY: Record<PlanTab, string> = {
  saved: "Save an opportunity from For You or Explore and it appears here.",
  preparing: "Move a saved item to Preparing once you start your application.",
  applied: "Items you mark as applied after the official handoff land here.",
  past: "Completed and closed opportunities are archived here.",
};

function monthKey(iso: string): string {
  const d = new Date(iso);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const local = new Date(utc + 8 * 3600000);
  return local.toLocaleString("en-SG", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function Plan() {
  const { opportunities, isWatching } = useStore();
  const { navigate } = useNav();
  const [tab, setTab] = useState<PlanTab>("saved");

  const active = TABS.find((t) => t.id === tab)!;
  const items = opportunities.filter((o) => active.statuses.includes(o.progress.status));
  const watched = opportunities.filter((o) => isWatching(o.id));

  // Next up: nearest upcoming deadline among saved/preparing.
  const nextUp = opportunities
    .filter(
      (o) =>
        (o.progress.status === "saved" || o.progress.status === "preparing") &&
        o.applicationDeadline &&
        daysUntil(o.applicationDeadline) >= 0,
    )
    .sort((a, b) => daysUntil(a.applicationDeadline!) - daysUntil(b.applicationDeadline!))[0];

  // Group by deadline month.
  const groups = new Map<string, Opportunity[]>();
  for (const o of items) {
    const key = o.applicationDeadline ? monthKey(o.applicationDeadline) : "No deadline";
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }

  return (
    <>
      <RootTopBar title="Plan" />
      <div className="screen stack">
        {nextUp ? (
          <div className="card stack--sm" style={{ borderColor: "var(--radar-color-border-strong)" }}>
            <p className="overline">Next up</p>
            <p style={{ fontWeight: 600 }}>{nextUp.title}</p>
            <p
              className="deadline__abs tnum"
              style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-1)" }}
            >
              <CalendarClock size={14} aria-hidden /> {formatDeadline(nextUp.applicationDeadline!)}
            </p>
            {nextUp.progress.nextAction ? (
              <p style={{ fontSize: "var(--radar-font-size-small)" }}>
                Next action: {nextUp.progress.nextAction}
              </p>
            ) : null}
            <Button size="sm" variant="secondary" onClick={() => navigate({ name: "detail", id: nextUp.id })} style={{ alignSelf: "flex-start" }}>
              Open
            </Button>
          </div>
        ) : null}

        <div className="tabs" role="tablist" aria-label="Plan status">
          {TABS.map((t) => (
            <button
              key={t.id}
              className="tab"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <Feedback
            icon={<CalendarClock size={32} aria-hidden color="var(--radar-color-text-secondary)" />}
            title={`Nothing in ${active.label} yet`}
            text={EMPTY_COPY[tab]}
          />
        ) : (
          [...groups.entries()].map(([month, list]) => (
            <div className="stack" key={month}>
              <p className="overline">{month}</p>
              {list.map((o) => (
                <PlanCard key={o.id} opp={o} />
              ))}
            </div>
          ))
        )}

        {watched.length ? (
          <Section title="Watched windows">
            <div className="stack">
              {watched.map((o) => (
                <button
                  key={o.id}
                  className="oppcard oppcard--list tl__span--expected"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate({ name: "expected", id: o.id })}
                >
                  <span className="deadline__state" style={{ color: "var(--radar-color-signal-text)" }}>
                    <Eye size={16} aria-hidden /> Watching · Dates not announced
                  </span>
                  <h3 className="oppcard__title">{o.title}</h3>
                  <span className="oppcard__org">{o.organiser} · {categoryById(o.categoryId).label}</span>
                </button>
              ))}
            </div>
          </Section>
        ) : null}

        <Button variant="tertiary" icon={<ArrowRight size={16} aria-hidden />} onClick={() => navigate({ name: "radar" })}>
          Open full 30-day Radar
        </Button>
      </div>
    </>
  );
}

const STATUS_OPTIONS: { value: ProgressStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "preparing", label: "Preparing" },
  { value: "applied", label: "Applied" },
  { value: "completed", label: "Past / completed" },
];

function PlanCard({ opp }: { opp: Opportunity }) {
  const { navigate, openSheet } = useNav();
  const { setStatus, setNextAction } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(opp.progress.nextAction ?? "");

  return (
    <article className="oppcard oppcard--list">
      <button className="oppcard__open" onClick={() => navigate({ name: "detail", id: opp.id })}>
        <DeadlineBadge opp={opp} />
        <h3 className="oppcard__title">{opp.title}</h3>
        <span className="oppcard__org">{opp.organiser}</span>
      </button>

      {opp.progress.nextAction && !editing ? (
        <p className="source__row" style={{ gap: "0.375rem" }}>
          <CheckCircle2 size={14} aria-hidden color="var(--radar-color-match-text)" />
          <span style={{ fontSize: "var(--radar-font-size-small)" }}>{opp.progress.nextAction}</span>
        </p>
      ) : null}

      {editing ? (
        <div className="stack--sm">
          <input
            className="input"
            value={draft}
            aria-label="Next action"
            placeholder="e.g. Confirm teammate by 29 Aug"
            onChange={(e) => setDraft(e.target.value)}
          />
          <div style={{ display: "flex", gap: "var(--radar-space-2)" }}>
            <Button
              size="sm"
              onClick={() => {
                setNextAction(opp.id, draft);
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {opp.progress.reminderAt ? (
        <p
          className="deadline__abs"
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-1)" }}
        >
          <Bell size={12} aria-hidden /> Reminder set for {formatDate(opp.progress.reminderAt)}
        </p>
      ) : null}

      <div className="oppcard__footer">
        <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-2)", fontSize: "var(--radar-font-size-small)" }}>
          <span className="visually-hidden">Change status for {opp.title}</span>
          <select
            className="input"
            style={{ width: "auto", minHeight: "var(--radar-size-control-compact)" }}
            value={opp.progress.status === "none" ? "saved" : opp.progress.status}
            onChange={(e) => setStatus(opp.id, e.target.value as ProgressStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: "var(--radar-space-1)" }}>
          <Button size="sm" variant="tertiary" icon={<Pencil size={14} aria-hidden />} onClick={() => setEditing((v) => !v)}>
            Next action
          </Button>
          <Button size="sm" variant="secondary" icon={<Bell size={14} aria-hidden />} onClick={() => openSheet({ name: "reminder", id: opp.id })}>
            Reminder
          </Button>
        </div>
      </div>
    </article>
  );
}
