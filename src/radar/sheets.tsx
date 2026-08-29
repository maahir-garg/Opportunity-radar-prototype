import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  useExplore,
  type SortKey,
} from "./filters";
import { categories } from "./data";
import { formatDate, formatDeadline } from "./format";
import { useNav } from "./nav";
import { useStore } from "./store";
import { Button, Chip, Sheet } from "./ui";
import { CategoryIcon, matchVariant } from "./components";
import type { CategoryId } from "./types";

/* ---------------------------------------------------------------- Why match */

function WhyMatchSheet({ id }: { id: string }) {
  const { getOpportunity } = useStore();
  const nav = useNav();
  const closeSheet = nav.closeSheet;
  const opp = getOpportunity(id);
  if (!opp) return null;
  const { variant, label } = matchVariant(opp);
  const blockers = [...opp.eligibility.blockers, ...opp.match.blockers];
  return (
    <Sheet title="Why this matches" onClose={closeSheet} labelledBy="why-title">
      <div className="stack">
        <div className="match">
          <span className={`match__pill match__pill--${variant}`}>
            {variant !== "issue" ? <span className="tnum">{opp.match.score}% </span> : null}
            {label}
          </span>
        </div>
        <div className="alert alert--info">
          <Info size={16} aria-hidden style={{ flex: "none", marginTop: "0.125rem" }} />
          Profile fit, not chance of acceptance.
        </div>

        <div className="stack--sm">
          <p className="overline">What fits your profile</p>
          {opp.match.reasons.map((r) => (
            <p key={r} className="eligrow">
              <CheckCircle2
                size={18}
                className="eligrow__icon"
                aria-hidden
                color="var(--radar-color-match-text)"
              />
              {r}
            </p>
          ))}
        </div>

        {opp.match.missing.length ? (
          <div className="stack--sm">
            <p className="overline">Unknown - we could not confirm</p>
            {opp.match.missing.map((m) => (
              <p key={m} className="eligrow">
                <CircleHelp
                  size={18}
                  className="eligrow__icon"
                  aria-hidden
                  color="var(--radar-color-text-secondary)"
                />
                {m}
              </p>
            ))}
          </div>
        ) : null}

        {blockers.length ? (
          <div className="stack--sm">
            <p className="overline">Possible blockers</p>
            {blockers.map((b) => (
              <p key={b} className="eligrow">
                <AlertTriangle
                  size={18}
                  className="eligrow__icon"
                  aria-hidden
                  color="var(--radar-color-warning-text)"
                />
                {b}
              </p>
            ))}
          </div>
        ) : null}

        <div className="stack--sm">
          <Button
            variant="secondary"
            block
            onClick={() => {
              nav.closeSheet();
              nav.switchTab("profile");
            }}
          >
            Update profile
          </Button>
          <Button variant="tertiary" block onClick={() => nav.openSheet({ name: "howMatching" })}>
            How matching works
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- How matching */

function HowMatchingSheet() {
  const { closeSheet } = useNav();
  return (
    <Sheet title="How matching works" onClose={closeSheet}>
      <div className="stack">
        <p>
          Radar scores profile fit with a transparent, fixed rule set - it is a
          ranking aid, <strong>not</strong> a prediction of admission or success.
        </p>
        <ul className="stack--sm">
          {[
            ["Eligibility satisfied", "40 points"],
            ["Interest / category alignment", "25 points"],
            ["Goal alignment", "20 points"],
            ["Timing / availability", "10 points"],
            ["Location / mode preference", "5 points"],
          ].map(([k, v]) => (
            <li key={k} className="source__row" style={{ justifyContent: "space-between" }}>
              <span>{k}</span>
              <span className="tnum" style={{ fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
                {v}
              </span>
            </li>
          ))}
        </ul>
        <p className="deadline__abs">
          A known eligibility blocker overrides a high interest score and shows an
          eligibility issue instead.
        </p>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- Reminder */

const PRESETS: { id: string; label: string; days: number | null }[] = [
  { id: "1w", label: "1 week before", days: 7 },
  { id: "3d", label: "3 days before", days: 3 },
  { id: "1d", label: "1 day before", days: 1 },
  { id: "custom", label: "Custom date", days: null },
];

function ReminderSheet({ id }: { id: string }) {
  const { getOpportunity, setReminder, notificationsPermission } = useStore();
  const { closeSheet } = useNav();
  const opp = getOpportunity(id);
  const [choice, setChoice] = useState("3d");
  const [custom, setCustom] = useState("");
  if (!opp) return null;

  function save() {
    if (!opp) return;
    if (!opp.applicationDeadline && choice !== "custom") {
      setReminder(id, custom ? new Date(custom).toISOString() : null);
      closeSheet();
      return;
    }
    const preset = PRESETS.find((p) => p.id === choice);
    let iso: string | null = null;
    if (preset?.days != null && opp.applicationDeadline) {
      iso = new Date(
        new Date(opp.applicationDeadline).getTime() - preset.days * 86400000,
      ).toISOString();
    } else if (custom) {
      iso = new Date(custom).toISOString();
    }
    setReminder(id, iso);
    closeSheet();
  }

  return (
    <Sheet title="Set a reminder" onClose={closeSheet}>
      <div className="stack">
        <div>
          <p style={{ fontWeight: 600 }}>{opp.title}</p>
          <p className="deadline__abs tnum">
            {opp.applicationDeadline
              ? `Deadline ${formatDeadline(opp.applicationDeadline)}`
              : "No confirmed deadline yet"}
          </p>
        </div>
        <div className="stack--sm" role="radiogroup" aria-label="Reminder timing">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className="optionrow"
              role="radio"
              aria-checked={choice === p.id}
              onClick={() => setChoice(p.id)}
              disabled={p.days != null && !opp.applicationDeadline}
            >
              <span className="optionrow__radio" aria-hidden />
              <span>{p.label}</span>
            </button>
          ))}
          {choice === "custom" ? (
            <label className="field">
              <span className="field__label">Reminder date and time</span>
              <input
                className="input"
                type="datetime-local"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </label>
          ) : null}
        </div>
        <div className="alert alert--info">
          <Info size={16} aria-hidden style={{ flex: "none", marginTop: "0.125rem" }} />
          {notificationsPermission === "denied"
            ? "Notifications are off - the reminder is saved and shown in Plan, but no push alert will be sent."
            : "Reminders appear in Plan and as a mock notification. No real alert is sent in this prototype."}
        </div>
        <Button block onClick={save}>
          Save and remind me
        </Button>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- Handoff */

function HandoffSheet({ id, failed }: { id: string; failed?: boolean }) {
  const { getOpportunity, setStatus } = useStore();
  const { closeSheet } = useNav();
  const opp = getOpportunity(id);
  const [returned, setReturned] = useState(false);
  if (!opp) return null;

  if (failed) {
    return (
      <Sheet title="Link unavailable" onClose={closeSheet}>
        <div className="stack">
          <div className="alert alert--error">
            <AlertTriangle size={16} aria-hidden style={{ flex: "none", marginTop: "0.125rem" }} />
            We could not reach the official application page.
          </div>
          <p className="deadline__abs">
            Last confirmed working on {formatDate(opp.source.lastChecked)}.
          </p>
          <Button variant="secondary" block>
            Report a broken link
          </Button>
          <Button variant="tertiary" block onClick={closeSheet}>
            Close
          </Button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title="Leaving Radar" onClose={closeSheet}>
      {!returned ? (
        <div className="stack">
          <p>You are about to open the official application on an external site.</p>
          <div className="source">
            <span className="source__row">
              <ExternalLink size={16} aria-hidden />
              <span className="tnum">{opp.source.domain}</span>
            </span>
            <span className="deadline__abs">{opp.source.label}</span>
          </div>
          <p className="deadline__abs">
            Radar does not submit applications. You complete it on the organiser's
            site, then return here to update your status.
          </p>
          <Button block icon={<ExternalLink size={16} aria-hidden />} onClick={() => setReturned(true)}>
            Open official application
          </Button>
        </div>
      ) : (
        <div className="stack">
          <p style={{ fontWeight: 600 }}>Did you apply?</p>
          <p className="deadline__abs">
            Mark your status so you can find this in Plan under the right tab.
          </p>
          <Button
            block
            onClick={() => {
              setStatus(id, "applied");
              closeSheet();
            }}
          >
            Mark as applied
          </Button>
          <Button variant="secondary" block onClick={closeSheet}>
            Not yet
          </Button>
        </div>
      )}
    </Sheet>
  );
}

/* ---------------------------------------------------------------- Filter sheet */

const MODES = [
  { id: "in-person", label: "In person" },
  { id: "hybrid", label: "Hybrid" },
  { id: "online", label: "Online" },
];
const SORTS: { id: SortKey; label: string }[] = [
  { id: "relevance", label: "Relevance" },
  { id: "deadline", label: "Deadline soonest" },
  { id: "checked", label: "Recently checked" },
  { id: "rating", label: "Rating" },
];

function FilterSheet() {
  const { filters, setFilters } = useExplore();
  const { opportunities, profile } = useStore();
  const { closeSheet } = useNav();
  const [draft, setDraft] = useState(filters);
  const count = applyFilters(opportunities, draft, profile).length;

  function toggleCat(c: CategoryId) {
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(c)
        ? d.categories.filter((x) => x !== c)
        : [...d.categories, c],
    }));
  }
  function toggleMode(m: string) {
    setDraft((d) => ({
      ...d,
      modes: d.modes.includes(m) ? d.modes.filter((x) => x !== m) : [...d.modes, m],
    }));
  }

  return (
    <Sheet title="Filters" onClose={closeSheet}>
      <div className="stack">
        <div className="stack--sm">
          <p className="overline">Category</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--radar-space-2)" }}>
            {categories.map((c) => (
              <Chip
                key={c.id}
                pressed={draft.categories.includes(c.id)}
                onToggle={() => toggleCat(c.id)}
              >
                <CategoryIcon id={c.id} /> {c.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="stack--sm">
          <p className="overline">Eligibility & deadline</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--radar-space-2)" }}>
            <Chip
              pressed={draft.eligibleForMe}
              onToggle={() => setDraft((d) => ({ ...d, eligibleForMe: !d.eligibleForMe }))}
            >
              Eligible for me
            </Chip>
            <Chip
              pressed={draft.closingSoon}
              onToggle={() => setDraft((d) => ({ ...d, closingSoon: !d.closingSoon }))}
            >
              Closing soon
            </Chip>
            <Chip
              pressed={draft.maxCommitment}
              onToggle={() => setDraft((d) => ({ ...d, maxCommitment: !d.maxCommitment }))}
            >
              Within {profile.preferredCommitmentHoursPerWeekMax} hrs/week
            </Chip>
          </div>
        </div>

        <div className="stack--sm">
          <p className="overline">Mode</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--radar-space-2)" }}>
            {MODES.map((m) => (
              <Chip key={m.id} pressed={draft.modes.includes(m.id)} onToggle={() => toggleMode(m.id)}>
                {m.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="stack--sm">
          <p className="overline">Sort by</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--radar-space-2)" }}>
            {SORTS.map((s) => (
              <Chip
                key={s.id}
                pressed={draft.sort === s.id}
                onToggle={() => setDraft((d) => ({ ...d, sort: s.id }))}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </div>

        {count === 0 ? (
          <div className="alert alert--warning">
            <AlertTriangle size={16} aria-hidden style={{ flex: "none", marginTop: "0.125rem" }} />
            No opportunities match these filters. Try removing one.
          </div>
        ) : null}

        <div className="stickybar" style={{ position: "static", boxShadow: "none", border: "none", padding: 0 }}>
          <Button
            variant="secondary"
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            onClick={() => setDraft({ ...emptyFilters, query: draft.query })}
            disabled={activeFilterCount(draft) === 0}
          >
            Clear all
          </Button>
          <Button
            block
            onClick={() => {
              setFilters(draft);
              closeSheet();
            }}
          >
            Show {count} {count === 1 ? "opportunity" : "opportunities"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- Widget sheet */

import { WidgetPreview } from "./screens/onboarding";

function WidgetSheet() {
  const { closeSheet } = useNav();
  return (
    <Sheet title="Lock-screen widget" onClose={closeSheet}>
      <WidgetPreview />
    </Sheet>
  );
}

/* ---------------------------------------------------------------- Host */

export function SheetHost() {
  const { sheet } = useNav();
  if (!sheet) return null;
  switch (sheet.name) {
    case "why":
      return <WhyMatchSheet id={sheet.id} />;
    case "reminder":
      return <ReminderSheet id={sheet.id} />;
    case "filter":
      return <FilterSheet />;
    case "handoff":
      return <HandoffSheet id={sheet.id} failed={sheet.failed} />;
    case "howMatching":
      return <HowMatchingSheet />;
    case "widget":
      return <WidgetSheet />;
    default:
      return null;
  }
}
