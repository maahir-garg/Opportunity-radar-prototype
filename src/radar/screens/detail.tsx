import {
  AlertTriangle,
  Bell,
  Bookmark,
  BookmarkCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  CircleHelp,
  ExternalLink,
  Flag,
  MapPin,
  Share2,
  Timer,
} from "lucide-react";
import { categoryById, reviewsFor } from "../data";
import { daysUntil, formatDate, formatDeadline, formatRange } from "../format";
import { useNav } from "../nav";
import { useStore } from "../store";
import {
  CategoryIcon,
  DeadlineBadge,
  MatchIndicator,
  ProgressPill,
  ReviewCard,
  ReviewSummary,
  Section,
  SourceStatusLabel,
} from "../components";
import { Button, Feedback, IconButton } from "../ui";
import { ChildTopBar } from "../shell";
import type { Opportunity } from "../types";

export function Detail({ id }: { id: string }) {
  const { getOpportunity, opportunities, toggleSave, setStatus, pushToast } = useStore();
  const { navigate, openSheet } = useNav();
  const opp = getOpportunity(id);
  if (!opp) return null;

  const cat = categoryById(opp.categoryId);
  const saved = opp.progress.status !== "none" && opp.progress.status !== "dismissed";
  const applied = opp.progress.status === "applied" || opp.progress.status === "completed";
  const isClosed =
    opp.availability === "closed" || opp.availability === "cancelled" || opp.availability === "full";
  const stale = daysUntil(opp.source.lastChecked) < -14;
  const reviews = reviewsFor(opp.id);

  const similar = opportunities
    .filter((o) => o.id !== opp.id && o.categoryId === opp.categoryId && o.availability !== "closed")
    .slice(0, 2);

  return (
    <>
      <ChildTopBar
        title="Opportunity"
        actions={
          <>
            <IconButton label="Share" onClick={() => pushToast("Link copied")}>
              <Share2 size={20} aria-hidden />
            </IconButton>
            <IconButton label={saved ? "Saved - remove" : "Save"} onClick={() => toggleSave(opp.id)}>
              {saved ? <BookmarkCheck size={20} aria-hidden /> : <Bookmark size={20} aria-hidden />}
            </IconButton>
          </>
        }
      />

      <div className="screen stack">
        {/* Category artwork band */}
        <div
          className="card"
          style={{
            background: "var(--radar-color-surface-subdued)",
            display: "flex",
            alignItems: "center",
            gap: "var(--radar-space-3)",
            border: "none",
          }}
        >
          <span
            style={{
              width: "var(--radar-space-12)",
              height: "var(--radar-space-12)",
              borderRadius: "var(--radar-radius-medium)",
              background: "var(--radar-color-surface)",
              display: "grid",
              placeItems: "center",
              color: "var(--radar-color-action-primary)",
            }}
          >
            <CategoryIcon id={opp.categoryId} size={24} />
          </span>
          <div>
            <p className="overline">{cat.label}</p>
            <p className="deadline__abs">{opp.tags.join(" · ")}</p>
          </div>
        </div>

        {isClosed ? (
          <div className="alert alert--warning">
            <AlertTriangle size={16} aria-hidden style={{ flex: "none" }} />
            {opp.availability === "cancelled"
              ? "This opportunity was cancelled."
              : opp.availability === "full"
                ? "This opportunity is full."
                : `Applications closed ${opp.applicationDeadline ? formatDate(opp.applicationDeadline) : ""}.`}
          </div>
        ) : null}

        <DeadlineBadge opp={opp} />

        <div>
          <h1 className="section__title" style={{ fontSize: "var(--radar-font-size-heading-2)", lineHeight: "var(--radar-line-height-heading-2)" }}>
            {opp.title}
          </h1>
          <p className="oppcard__org">{opp.organiser}</p>
        </div>

        <SourceStatusLabel status={opp.source.status} />

        {opp.forecast.status !== "expected" ? <MatchIndicator opp={opp} /> : null}

        {opp.progress.status !== "none" && opp.progress.status !== "dismissed" ? (
          <div style={{ display: "flex", gap: "var(--radar-space-2)", alignItems: "center", flexWrap: "wrap" }}>
            <ProgressPill status={opp.progress.status} />
            {opp.progress.reminderAt ? (
              <span className="tag">
                <Bell size={12} aria-hidden /> Reminder {formatDate(opp.progress.reminderAt)}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* At a glance */}
        <Section title="At a glance">
          <div className="card glance">
            <div className="glance__item">
              <span className="glance__label">Programme dates</span>
              <span className="glance__value tnum">
                {opp.programmeDates
                  ? formatRange(opp.programmeDates.start, opp.programmeDates.end)
                  : "Not announced"}
              </span>
            </div>
            <div className="glance__item">
              <span className="glance__label">Location & mode</span>
              <span className="glance__value">
                {opp.location} · {opp.mode}
              </span>
            </div>
            <div className="glance__item">
              <span className="glance__label">Commitment</span>
              <span className="glance__value">{opp.commitment.label}</span>
            </div>
            <div className="glance__item">
              <span className="glance__label">Category</span>
              <span className="glance__value">{cat.label}</span>
            </div>
          </div>
          <p
            className="deadline__abs"
            style={{
              marginTop: "var(--radar-space-2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--radar-space-2)",
            }}
          >
            <Timer size={12} aria-hidden className="eligrow__icon" />
            Commitment from: {opp.commitment.provenance}
          </p>
        </Section>

        {/* Eligibility */}
        <Section title="Eligibility">
          <div className="card stack stack--sm">
            {opp.eligibility.confirmed.map((e) => (
              <p key={e} className="eligrow">
                <CheckCircle2 size={18} className="eligrow__icon" aria-hidden color="var(--radar-color-match-text)" />
                <span><strong>You meet:</strong> {e}</span>
              </p>
            ))}
            {opp.eligibility.toCheck.map((e) => (
              <p key={e} className="eligrow">
                <CircleHelp size={18} className="eligrow__icon" aria-hidden color="var(--radar-color-text-secondary)" />
                <span><strong>Check this:</strong> {e}</span>
              </p>
            ))}
            {opp.eligibility.blockers.map((e) => (
              <p key={e} className="eligrow">
                <AlertTriangle size={18} className="eligrow__icon" aria-hidden color="var(--radar-color-warning-text)" />
                <span><strong>Blocker:</strong> {e}</span>
              </p>
            ))}
            {!opp.eligibility.confirmed.length && !opp.eligibility.toCheck.length ? (
              <p className="deadline__abs">Eligibility details not published yet.</p>
            ) : null}
          </div>
        </Section>

        {/* Summary */}
        <Section title="About this opportunity">
          <p style={{ color: "var(--radar-color-text-body)" }}>{opp.summary}</p>
        </Section>

        {/* Source trust block */}
        <div className={`source ${stale ? "source--stale" : ""}`}>
          {stale ? (
            <p
              style={{
                fontWeight: 600,
                color: "var(--radar-color-warning-text)",
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--radar-space-2)",
              }}
            >
              <AlertTriangle size={16} aria-hidden className="eligrow__icon" />
              We could not re-check this listing.
            </p>
          ) : null}
          <div className="source__row" style={{ justifyContent: "space-between" }}>
            <SourceStatusLabel status={opp.source.status} />
            <span className="deadline__abs tnum">Checked {formatDate(opp.source.lastChecked)}</span>
          </div>
          <p className="deadline__abs">
            Destination: <span className="tnum">{opp.source.domain}</span>. “Official source” describes the organiser page - Radar is not an official NUS service.
          </p>
          <div className="source__actions">
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink size={14} aria-hidden />}
              onClick={() => openSheet({ name: "handoff", id: opp.id })}
            >
              View source
            </Button>
            <Button variant="tertiary" size="sm" icon={<Flag size={14} aria-hidden />}>
              Report an issue
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <Section
          title="Student reviews"
          action={
            reviews.length ? (
              <button className="linkbtn" onClick={() => navigate({ name: "reviews", id: opp.id })}>
                See all
              </button>
            ) : undefined
          }
        >
          <div className="stack">
            <ReviewSummary opp={opp} />
            {opp.rating.count >= 3
              ? reviews.slice(0, 2).map((r) => <ReviewCard key={r.id} review={r} />)
              : null}
          </div>
        </Section>

        {/* Similar */}
        {similar.length ? (
          <Section title="Similar opportunities">
            <SimilarList list={similar} />
          </Section>
        ) : null}
      </div>

      {/* Sticky action */}
      <div className="stickybar" style={{ flexDirection: "column" }}>
        {applied ? (
          <div style={{ display: "flex", gap: "var(--radar-space-2)", width: "100%" }}>
            <Button variant="secondary" block icon={<CheckCircle2 size={18} aria-hidden />} disabled>
              Marked as applied
            </Button>
            <Button variant="tertiary" onClick={() => setStatus(opp.id, "saved")}>
              Undo
            </Button>
          </div>
        ) : isClosed ? (
          <Button block variant="secondary" onClick={() => navigate({ name: "reviews", id: opp.id })}>
            Find similar opportunities
          </Button>
        ) : (
          <>
            <Button
              block
              size="lg"
              icon={<ExternalLink size={18} aria-hidden />}
              onClick={() => openSheet({ name: "handoff", id: opp.id })}
            >
              Open official application
            </Button>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--radar-space-2)", width: "100%" }}>
              <Button
                variant="secondary"
                block
                icon={saved ? <BookmarkCheck size={16} aria-hidden /> : <Bookmark size={16} aria-hidden />}
                onClick={() => toggleSave(opp.id)}
                aria-pressed={saved}
                style={{ flex: "1 1 9.5rem", whiteSpace: "nowrap" }}
              >
                {saved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="secondary"
                block
                icon={<Bell size={16} aria-hidden />}
                onClick={() => openSheet({ name: "reminder", id: opp.id })}
                style={{ flex: "1 1 9.5rem", whiteSpace: "nowrap" }}
              >
                Set reminder
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SimilarList({ list }: { list: Opportunity[] }) {
  const { navigate } = useNav();
  return (
    <div className="stack">
      {list.map((o) => (
        <button
          key={o.id}
          className="oppcard oppcard--list"
          style={{ cursor: "pointer" }}
          onClick={() => navigate({ name: "detail", id: o.id })}
        >
          <span className="deadline__state tnum">
            <CalendarDays size={16} aria-hidden />
            {o.applicationDeadline ? `Closes ${formatDate(o.applicationDeadline)}` : "Dates not announced"}
          </span>
          <h3 className="oppcard__title">{o.title}</h3>
          <span className="oppcard__org">{o.organiser}</span>
          <div className="oppcard__meta">
            <span className="oppcard__metaitem"><MapPin size={14} aria-hidden /> {o.location}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Reviews screen (S12) */

const SORTS = [
  { id: "helpful", label: "Most helpful" },
  { id: "newest", label: "Newest" },
  { id: "critical", label: "Most critical" },
];

export function Reviews({ id }: { id: string }) {
  const { getOpportunity } = useStore();
  const opp = getOpportunity(id);
  if (!opp) return null;
  const reviews = reviewsFor(id);

  return (
    <>
      <ChildTopBar title="Reviews" />
      <div className="screen stack">
        <div>
          <h1 className="section__title">{opp.title}</h1>
          <p className="oppcard__org">{opp.organiser}</p>
        </div>
        <ReviewSummary opp={opp} />

        {opp.rating.count >= 3 ? (
          <>
            <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
              {SORTS.map((s, i) => (
                <button key={s.id} className="chip" aria-pressed={i === 0}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="stack">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
            <p
              className="deadline__abs"
              style={{ display: "flex", alignItems: "flex-start", gap: "var(--radar-space-2)" }}
            >
              <Clock size={12} aria-hidden className="eligrow__icon" />
              Reviews are from NUS students. Moderation removes personal contact details.
            </p>
          </>
        ) : (
          <Feedback
            icon={<CalendarClock size={32} aria-hidden color="var(--radar-color-text-secondary)" />}
            title="Not enough reviews yet"
            text={
              opp.rating.count === 0
                ? "No student reviews have been submitted."
                : `Only ${opp.rating.count} response${opp.rating.count === 1 ? "" : "s"} so far - not enough for a confident aggregate.`
            }
          />
        )}
      </div>
    </>
  );
}
