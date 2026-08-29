import {
  AlertTriangle,
  BadgeDollarSign,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Clock,
  FlaskConical,
  Globe2,
  HeartHandshake,
  MapPin,
  Presentation,
  Rocket,
  ShieldCheck,
  Star,
  ThumbsUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { categoryById } from "./data";
import {
  daysUntil,
  formatDate,
  formatDeadline,
  relativeDeadline,
} from "./format";
import { useNav } from "./nav";
import { useStore } from "./store";
import type { Opportunity, Review, SourceStatus } from "./types";

/* ---------------------------------------------------------------- Category icon */

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "briefcase-business": BriefcaseBusiness,
  "flask-conical": FlaskConical,
  rocket: Rocket,
  trophy: Trophy,
  "globe-2": Globe2,
  "heart-handshake": HeartHandshake,
  presentation: Presentation,
  "badge-dollar-sign": BadgeDollarSign,
};

const CATEGORY_ACCENT: Record<string, string> = {
  career: "var(--radar-blue-700)",
  research: "var(--radar-teal-700)",
  venture: "var(--radar-orange-600)",
  competition: "var(--radar-navy-800)",
  global: "var(--radar-blue-700)",
  impact: "var(--radar-teal-700)",
  event: "var(--radar-navy-800)",
  funding: "var(--radar-amber-700)",
};

export function CategoryIcon({ id, size = 16 }: { id: string; size?: number }) {
  const cat = categoryById(id);
  const Icon = CATEGORY_ICONS[cat.icon] ?? BriefcaseBusiness;
  return <Icon size={size} aria-hidden />;
}

/* ---------------------------------------------------------------- Deadline */

type DeadlineTone = "normal" | "warning" | "critical" | "closed";

function deadlineInfo(opp: Opportunity): {
  tone: DeadlineTone;
  state: string;
  abs?: string;
  relative?: string;
} {
  if (opp.availability === "cancelled")
    return { tone: "closed", state: "Cancelled" };
  if (opp.availability === "full") return { tone: "closed", state: "Full" };
  if (!opp.applicationDeadline)
    return { tone: "normal", state: "Dates not announced" };
  const d = daysUntil(opp.applicationDeadline);
  if (opp.availability === "closed" || d < 0)
    return {
      tone: "closed",
      state: `Applications closed`,
      abs: formatDate(opp.applicationDeadline),
    };
  const abs = formatDeadline(opp.applicationDeadline);
  const relative = relativeDeadline(opp.applicationDeadline);
  if (d <= 1) return { tone: "critical", state: relative, abs, relative };
  if (d <= 7) return { tone: "warning", state: relative, abs, relative };
  return { tone: "normal", state: "Applications open", abs, relative };
}

export function DeadlineBadge({ opp }: { opp: Opportunity }) {
  const info = deadlineInfo(opp);
  const toneClass =
    info.tone === "warning"
      ? "tone-warning"
      : info.tone === "critical"
        ? "tone-critical"
        : info.tone === "closed"
          ? "tone-closed"
          : "tone-normal";
  return (
    <span className="deadline">
      <span className={`deadline__state ${toneClass}`}>
        <CalendarClock size={16} aria-hidden />
        {info.state}
        {info.abs && info.tone === "normal" ? (
          <span className="tnum" style={{ fontWeight: 400 }}>
            · {info.abs}
          </span>
        ) : null}
      </span>
      {info.abs && info.tone !== "normal" ? (
        <span className="deadline__abs tnum">{info.abs}</span>
      ) : null}
    </span>
  );
}

/* ---------------------------------------------------------------- Match */

export function matchVariant(opp: Opportunity): {
  variant: "strong" | "good" | "possible" | "issue";
  label: string;
} {
  if (opp.eligibility.blockers.length > 0)
    return { variant: "issue", label: "Eligibility issue" };
  const label = opp.match.label;
  if (label.includes("Strong")) return { variant: "strong", label };
  if (label.includes("Good")) return { variant: "good", label };
  return { variant: "possible", label };
}

export function MatchIndicator({
  opp,
  showWhy = true,
}: {
  opp: Opportunity;
  showWhy?: boolean;
}) {
  const { openSheet } = useNav();
  const { variant, label } = matchVariant(opp);
  return (
    <span className="match">
      <span className={`match__pill match__pill--${variant}`}>
        <span aria-hidden>◎</span>
        {variant === "issue" ? (
          label
        ) : (
          <>
            <span className="tnum">{opp.match.score}%</span> {label}
          </>
        )}
      </span>
      {showWhy ? (
        <button
          className="match__why"
          onClick={() => openSheet({ name: "why", id: opp.id })}
          aria-label={`Why this matches: ${opp.title}`}
        >
          <CircleHelp size={16} aria-hidden /> Why this matches
        </button>
      ) : null}
    </span>
  );
}

/* ---------------------------------------------------------------- Source trust */

const SOURCE_META: Record<
  SourceStatus,
  { label: string; icon: LucideIcon }
> = {
  official: { label: "Official source", icon: ShieldCheck },
  organiserVerified: { label: "Organiser verified", icon: CheckCircle2 },
  communitySubmitted: { label: "Community submitted", icon: Users },
  needsReview: { label: "Needs review", icon: AlertTriangle },
};

export function SourceStatusLabel({ status }: { status: SourceStatus }) {
  const meta = SOURCE_META[status];
  const Icon = meta.icon;
  const tone =
    status === "official" || status === "organiserVerified"
      ? "var(--radar-color-match-text)"
      : status === "needsReview"
        ? "var(--radar-color-warning-text)"
        : "var(--radar-color-text-secondary)";
  return (
    <span className="source__status" style={{ color: tone }}>
      <Icon size={16} aria-hidden />
      {meta.label}
    </span>
  );
}

/* ---------------------------------------------------------------- Stars */

export function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          aria-hidden
          fill={n <= rounded ? "currentColor" : "none"}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}

export function RatingLine({ opp }: { opp: Opportunity }) {
  if (opp.rating.count < 3) {
    return (
      <span className="oppcard__org">
        {opp.rating.count === 0
          ? "No reviews yet"
          : `Not enough reviews yet · ${opp.rating.count}`}
      </span>
    );
  }
  return (
    <span className="oppcard__metaitem tnum">
      <Star size={14} aria-hidden fill="var(--radar-color-signal)" stroke="none" />
      {opp.rating.average?.toFixed(1)} · {opp.rating.count} reviews
    </span>
  );
}

/* ---------------------------------------------------------------- Progress pill */

const PROGRESS_LABELS: Record<string, string> = {
  saved: "Saved",
  preparing: "Preparing",
  applied: "Applied",
  completed: "Completed",
};

export function ProgressPill({ status }: { status: string }) {
  if (!PROGRESS_LABELS[status]) return null;
  const strong = status === "applied" || status === "completed";
  return (
    <span
      className="match__pill"
      style={{
        background: strong
          ? "var(--radar-color-match-surface)"
          : "var(--radar-color-surface-subdued)",
        color: strong
          ? "var(--radar-color-match-text)"
          : "var(--radar-color-text-secondary)",
      }}
    >
      {strong ? <CheckCircle2 size={14} aria-hidden /> : <Bookmark size={14} aria-hidden />}
      {PROGRESS_LABELS[status]}
    </span>
  );
}

/* ---------------------------------------------------------------- Save control */

export function SaveButton({ opp, block }: { opp: Opportunity; block?: boolean }) {
  const { toggleSave } = useStore();
  const saved = opp.progress.status !== "none" && opp.progress.status !== "dismissed";
  return (
    <Button
      variant={saved ? "secondary" : "primary"}
      size="sm"
      block={block}
      onClick={() => toggleSave(opp.id)}
      aria-pressed={saved}
      icon={saved ? <BookmarkCheck size={16} aria-hidden /> : <Bookmark size={16} aria-hidden />}
    >
      {saved ? "Saved" : "Save"}
    </Button>
  );
}

/* ---------------------------------------------------------------- OpportunityCard */

export function OpportunityCard({
  opp,
  variant = "list",
}: {
  opp: Opportunity;
  variant?: "featured" | "list" | "compact";
}) {
  const { navigate } = useNav();
  const cat = categoryById(opp.categoryId);
  const isClosed =
    opp.availability === "closed" ||
    opp.availability === "cancelled" ||
    opp.availability === "full";
  const stale = daysUntil(opp.source.lastChecked) < -14;
  const showMatch = variant !== "list" || opp.match.score >= 50;

  return (
    <article
      className={`oppcard ${variant === "list" || variant === "compact" ? "oppcard--list" : ""} ${
        isClosed ? "oppcard--closed" : ""
      }`}
      aria-labelledby={`opp-${opp.id}-${variant}`}
    >
      <span
        className="oppcard__accent"
        style={{ background: CATEGORY_ACCENT[opp.categoryId] }}
        aria-hidden
      />
      <button
        className="oppcard__open"
        onClick={() => navigate({ name: "detail", id: opp.id })}
      >
        <DeadlineBadge opp={opp} />
        <h3 className="oppcard__title" id={`opp-${opp.id}-${variant}`}>
          {opp.title}
        </h3>
        <span className="oppcard__org">{opp.organiser}</span>
      </button>

      <div className="oppcard__meta">
        <SourceStatusLabel status={opp.source.status} />
      </div>

      {showMatch && opp.forecast.status !== "expected" ? (
        <MatchIndicator opp={opp} showWhy={variant !== "list"} />
      ) : null}

      {variant !== "compact" && (opp.match.reasons.length && variant === "featured") ? (
        <ul className="stack--sm" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {opp.match.reasons.slice(0, 2).map((r) => (
            <li key={r} className="eligrow">
              <CheckCircle2 size={16} className="eligrow__icon" aria-hidden color="var(--radar-color-match-text)" />
              {r}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="oppcard__meta">
        <span className="oppcard__metaitem">
          <CategoryIcon id={opp.categoryId} /> {cat.label}
        </span>
        <span className="oppcard__metaitem">
          <MapPin size={14} aria-hidden /> {opp.location}
        </span>
        {opp.rating.count >= 3 ? <RatingLine opp={opp} /> : null}
      </div>

      {stale ? (
        <p className="deadline__abs" style={{ color: "var(--radar-color-warning-text)" }}>
          <Clock size={14} aria-hidden /> Source last checked {formatDate(opp.source.lastChecked)}
        </p>
      ) : null}

      <div className="oppcard__footer">
        {opp.progress.status !== "none" && opp.progress.status !== "dismissed" ? (
          <ProgressPill status={opp.progress.status} />
        ) : (
          <span className="oppcard__org">Checked {formatDate(opp.source.lastChecked)}</span>
        )}
        {isClosed ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ name: "detail", id: opp.id })}
          >
            Find similar
          </Button>
        ) : (
          <SaveButton opp={opp} />
        )}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Review card */

export function ReviewCard({ review }: { review: Review }) {
  const verif =
    review.reviewer.verification === "attendanceVerified"
      ? "Attendance verified"
      : "NUS student verified";
  return (
    <article className="card card--quiet stack--sm">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
        <Stars value={review.rating} />
        <span className="deadline__abs">{formatDate(review.createdAt + "T00:00:00+08:00")}</span>
      </div>
      <p style={{ fontSize: "var(--radar-font-size-small)" }}>{review.note}</p>
      <div className="oppcard__meta">
        {review.bestFor.map((b) => (
          <span className="tag" key={b}>
            Best for: {b}
          </span>
        ))}
      </div>
      <p className="deadline__abs">
        Year {review.reviewer.year} · {review.reviewer.faculty} · Took part{" "}
        {review.reviewer.participationYear} · {verif}
      </p>
      <button className="linkbtn" style={{ fontSize: "var(--radar-font-size-caption)" }}>
        Report review
      </button>
    </article>
  );
}

export function ReviewSummary({ opp }: { opp: Opportunity }) {
  if (opp.rating.count < 3) {
    return (
      <div className="card stack--sm">
        <p className="feedback__title" style={{ fontSize: "var(--radar-font-size-body)" }}>
          Not enough reviews yet
        </p>
        <p className="feedback__text" style={{ textAlign: "left" }}>
          {opp.rating.count === 0
            ? "No student reviews have been submitted for this opportunity."
            : `Only ${opp.rating.count} response${opp.rating.count === 1 ? "" : "s"} so far - not enough for a confident aggregate.`}
        </p>
      </div>
    );
  }
  return (
    <div className="card stack">
      <div style={{ display: "flex", gap: "var(--radar-space-4)", alignItems: "center" }}>
        <div>
          <p className="tnum" style={{ fontSize: "var(--radar-font-size-heading-1)", fontWeight: 700, lineHeight: 1 }}>
            {opp.rating.average?.toFixed(1)}
          </p>
          <Stars value={opp.rating.average ?? 0} />
          <p className="deadline__abs">{opp.rating.count} student reviews</p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p className="match__pill match__pill--strong" style={{ display: "inline-flex" }}>
            <ThumbsUp size={14} aria-hidden />
            <span className="tnum">{opp.rating.wouldRecommendPercent}%</span> recommend
          </p>
          <p className="deadline__abs">from {opp.rating.wouldRecommendCount} responses</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Button re-export
 * (imported lazily here to avoid a circular import in ui.tsx consumers) */
import { Button } from "./ui";

/* ---------------------------------------------------------------- Section helper */

export function Section({
  title,
  action,
  children,
  overline,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  overline?: string;
}) {
  return (
    <section className="section">
      <div className="section__head">
        <div>
          {overline ? <p className="overline">{overline}</p> : null}
          <h2 className="section__title">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
