import { ArrowRight, CalendarClock, Eye, Info } from "lucide-react";
import { categoryById } from "../data";
import { daysUntil, formatDate, formatDeadline } from "../format";
import { useNav } from "../nav";
import { useStore } from "../store";
import { CategoryIcon, OpportunityCard, Section } from "../components";
import { Button, Feedback } from "../ui";
import { ChildTopBar } from "../shell";
import type { Opportunity } from "../types";

function within30(o: Opportunity): boolean {
  if (!o.applicationDeadline) return o.forecast.status === "expected";
  const d = daysUntil(o.applicationDeadline);
  return d >= 0 && d <= 30;
}

function Legend() {
  return (
    <div className="legend" role="note">
      <span className="legend__item">
        <span className="tl__dot tl__dot--confirmed" style={{ margin: 0 }} aria-hidden /> Confirmed - exact dates
      </span>
      <span className="legend__item">
        <span className="tl__dot tl__dot--expected" style={{ margin: 0 }} aria-hidden /> Expected - dates not announced
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- Preview (C12) */

export function ForecastPreview() {
  const { opportunities } = useStore();
  const { navigate } = useNav();
  const confirmed = opportunities.filter(
    (o) => o.forecast.status === "confirmed" && within30(o) && o.availability !== "closed",
  );
  const expected = opportunities.filter((o) => o.forecast.status === "expected");
  const nearest = [...confirmed]
    .sort((a, b) => daysUntil(a.applicationDeadline!) - daysUntil(b.applicationDeadline!))
    .slice(0, 2);

  return (
    <section className="card stack" aria-labelledby="forecast-preview-h">
      <div className="section__head" style={{ marginBottom: 0 }}>
        <h2 className="section__title" id="forecast-preview-h" style={{ display: "inline-flex", gap: "var(--radar-space-2)", alignItems: "center" }}>
          Your 30-day Radar
        </h2>
      </div>
      <div className="legend">
        <span className="legend__item tnum">
          <span className="tl__dot tl__dot--confirmed" style={{ margin: 0 }} aria-hidden />
          {confirmed.length} confirmed
        </span>
        <span className="legend__item tnum">
          <span className="tl__dot tl__dot--expected" style={{ margin: 0 }} aria-hidden />
          {expected.length} expected
        </span>
      </div>
      <ul className="stack stack--sm">
        {nearest.map((o) => (
          <li key={o.id} className="source__row" style={{ justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, minWidth: 0, flex: "1 1 auto" }}>{o.title}</span>
            <span className="deadline__abs tnum" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
              {formatDate(o.applicationDeadline!)}
            </span>
          </li>
        ))}
      </ul>
      <Button variant="secondary" block icon={<ArrowRight size={16} aria-hidden />} onClick={() => navigate({ name: "radar" })}>
        Open Radar
      </Button>
    </section>
  );
}

/* ---------------------------------------------------------------- 30-day Radar (S07) */

export function Radar30() {
  const { opportunities } = useStore();
  const { navigate } = useNav();

  const confirmed = opportunities
    .filter((o) => o.forecast.status === "confirmed" && within30(o) && o.availability !== "closed")
    .sort((a, b) => daysUntil(a.applicationDeadline!) - daysUntil(b.applicationDeadline!));
  const expected = opportunities.filter((o) => o.forecast.status === "expected");

  const empty = confirmed.length === 0 && expected.length === 0;

  return (
    <>
      <ChildTopBar
        title="30-day Radar"
        actions={
          <button className="iconbtn" aria-label="About the forecast" onClick={() => navigate({ name: "radar" })}>
            <Info size={20} aria-hidden />
          </button>
        }
      />
      <div className="screen stack">
        <p className="overline">Next 30 days</p>
        <Legend />

        {empty ? (
          <Feedback
            icon={<CalendarClock size={32} aria-hidden color="var(--radar-color-text-secondary)" />}
            title="Nothing on the Radar yet"
            text="Confirmed deadlines and expected windows will appear here as they arrive."
          />
        ) : (
          <>
            {/* Accessible chronological timeline */}
            <ol className="tl" aria-label="Forecast timeline, chronological">
              {confirmed.map((o, i) => (
                <li className="tl__item" key={o.id}>
                  <div className="tl__rail">
                    <span className="tl__dot tl__dot--confirmed" aria-hidden />
                    {i < confirmed.length + expected.length - 1 ? <span className="tl__line" aria-hidden /> : null}
                  </div>
                  <button
                    className="tl__body card card--quiet stack stack--sm"
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() => navigate({ name: "detail", id: o.id })}
                  >
                    <span className="deadline__state tnum">
                      Confirmed · {formatDate(o.applicationDeadline!)}
                    </span>
                    <p style={{ fontWeight: 600 }}>{o.title}</p>
                    <p className="deadline__abs">{o.organiser} · {categoryById(o.categoryId).label}</p>
                  </button>
                </li>
              ))}
              {expected.map((o, i) => (
                <li className="tl__item" key={o.id}>
                  <div className="tl__rail">
                    <span className="tl__dot tl__dot--expected" aria-hidden />
                    {i < expected.length - 1 ? <span className="tl__line" aria-hidden /> : null}
                  </div>
                  <button
                    className="tl__body tl__span--expected stack stack--sm"
                    style={{ textAlign: "left", cursor: "pointer", borderRadius: "var(--radar-radius-medium)", padding: "var(--radar-space-4)" }}
                    onClick={() => navigate({ name: "expected", id: o.id })}
                  >
                    <span className="deadline__state" style={{ color: "var(--radar-color-signal-text)" }}>
                      Expected · Dates not announced
                    </span>
                    <p style={{ fontWeight: 600 }}>{o.title}</p>
                    <p className="deadline__abs">{o.organiser} · {categoryById(o.categoryId).label}</p>
                  </button>
                </li>
              ))}
            </ol>

            <Section title="Needs action">
              <div className="stack">
                {confirmed.length ? (
                  confirmed.map((o) => <OpportunityCard key={o.id} opp={o} variant="list" />)
                ) : (
                  <p className="deadline__abs">No confirmed deadlines in the next 30 days.</p>
                )}
              </div>
            </Section>

            <Section title="Worth watching">
              <div className="stack">
                {expected.length ? (
                  expected.map((o) => <ExpectedRow key={o.id} opp={o} />)
                ) : (
                  <p className="deadline__abs">No expected windows right now.</p>
                )}
              </div>
            </Section>

            <p className="deadline__abs">
              Expected windows use previous organiser dates; current dates have not
              been announced.
            </p>
          </>
        )}
      </div>
    </>
  );
}

function ExpectedRow({ opp }: { opp: Opportunity }) {
  const { navigate } = useNav();
  const { isWatching } = useStore();
  return (
    <button
      className="oppcard oppcard--list tl__span--expected"
      style={{ cursor: "pointer" }}
      onClick={() => navigate({ name: "expected", id: opp.id })}
    >
      <span className="deadline__state" style={{ color: "var(--radar-color-signal-text)" }}>
        <CalendarClock size={16} aria-hidden /> Expected · Dates not announced
      </span>
      <h3 className="oppcard__title">{opp.title}</h3>
      <span className="oppcard__org">{opp.organiser}</span>
      <div className="oppcard__footer">
        <span className="oppcard__metaitem">
          <CategoryIcon id={opp.categoryId} /> {categoryById(opp.categoryId).label}
        </span>
        {isWatching(opp.id) ? <span className="tag">Watching</span> : <span className="linkbtn">View basis</span>}
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------- Expected preview (S08) */

export function ExpectedPreview({ id }: { id: string }) {
  const { getOpportunity, watchForecast, isWatching, notificationsPermission, setNotificationsPermission } = useStore();
  const { navigate } = useNav();
  const opp = getOpportunity(id);
  if (!opp) return null;
  const watching = isWatching(opp.id);
  const prev = opp.forecast.previousOccurrence;

  return (
    <>
      <ChildTopBar title="Expected window" />
      <div className="screen stack">
        <span className="match__pill match__pill--issue" style={{ alignSelf: "flex-start", background: "var(--radar-color-surface-accent)", color: "var(--radar-color-signal-text)" }}>
          <CalendarClock size={14} aria-hidden /> Expected
        </span>
        <div>
          <h2 className="section__title">{opp.title}</h2>
          <p className="oppcard__org">{opp.organiser} · {categoryById(opp.categoryId).label}</p>
        </div>

        <div className="card card--quiet stack stack--sm">
          <p className="overline">Approximate window</p>
          <p style={{ fontWeight: 600 }}>
            {prev ? `Around ${formatDate(prev.announced + "T00:00:00+08:00")} (based on last cycle)` : "Seasonal - timing not yet known"}
          </p>
          <p className="deadline__abs">Dates not announced for the current cycle.</p>
        </div>

        <div className="stack stack--sm">
          <p className="overline">Why we expect it</p>
          <p style={{ fontSize: "var(--radar-font-size-small)" }}>{opp.forecast.basis}</p>
          {prev ? (
            <p className="deadline__abs tnum">
              Previous cycle: announced {formatDate(prev.announced + "T00:00:00+08:00")}, deadline {formatDate(prev.applicationDeadline + "T00:00:00+08:00")}.
            </p>
          ) : null}
        </div>

        <div className="stack stack--sm">
          <p className="overline">What is still unknown</p>
          {opp.eligibility.toCheck.map((t) => (
            <p key={t} className="eligrow">
              <Info size={16} className="eligrow__icon" aria-hidden color="var(--radar-color-text-secondary)" /> {t}
            </p>
          ))}
        </div>

        <div className="source">
          <span className="source__row">
            <Eye size={16} aria-hidden /> {opp.source.label}
          </span>
          <span className="deadline__abs">Checked {formatDate(opp.source.lastChecked)}</span>
        </div>

        {notificationsPermission === "default" ? (
          <div className="alert alert--info">
            <Info size={16} aria-hidden style={{ flex: "none" }} />
            Watching sends a mock notification when dates are announced. It is an alert preference, not a prediction of confidence.
          </div>
        ) : null}
      </div>

      <div className="stickybar">
        {watching ? (
          <Button variant="secondary" block disabled>
            Watching - you'll be alerted
          </Button>
        ) : (
          <Button
            block
            icon={<Eye size={18} aria-hidden />}
            onClick={() => {
              if (notificationsPermission === "default") setNotificationsPermission("granted");
              watchForecast(opp.id);
            }}
          >
            Watch for announcement
          </Button>
        )}
      </div>
    </>
  );
}
