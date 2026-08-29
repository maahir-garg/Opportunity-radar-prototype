import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronLeft,
  Radar as RadarIcon,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { categories, goalLabels, seedProfile } from "../data";
import { formatDeadline } from "../format";
import { useNav } from "../nav";
import { useStore } from "../store";
import { Button, Chip, RadarMark } from "../ui";
import type { CategoryId, Profile } from "../types";

const DISCLAIMER = "Student-built for NUS students - not an official NUS service.";

/* ---------------------------------------------------------------- Landing */

export function Landing() {
  const { setPhase } = useNav();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <div className="radar-app landing">
      <div className="landing__container">
        <nav className="landing__nav">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-2)", fontWeight: 700, fontSize: "var(--radar-font-size-heading-3)", color: "var(--radar-color-text-primary)" }}>
            <RadarMark size={28} /> Radar
          </span>
          <div style={{ display: "flex", gap: "var(--radar-space-2)", alignItems: "center" }}>
            <a className="btn btn--tertiary landing__nav-secondary" href="#how">How it works</a>
            <Button size="sm" onClick={() => setPhase("welcome")}>
              Open the demo
            </Button>
          </div>
        </nav>

        <header className="landing__hero">
          <div className="stack">
            <p className="overline">The opportunity planner built around you</p>
            <h1 className="landing__display">Find the opportunities worth your time.</h1>
            <p style={{ fontSize: "var(--radar-font-size-body-large)", lineHeight: "var(--radar-line-height-body-large)", color: "var(--radar-color-text-secondary)", maxWidth: "34rem" }}>
              Radar brings NUS internships, research, competitions, exchanges and
              grants into one calm view - personalised discovery, clear source
              evidence for every claim, and one place to plan deadlines.
            </p>
            <div style={{ display: "flex", gap: "var(--radar-space-3)", flexWrap: "wrap" }}>
              <Button size="lg" onClick={() => setPhase("welcome")} icon={<ArrowRight size={18} aria-hidden />}>
                Set up my Radar
              </Button>
              <a className="btn btn--secondary btn--lg" href="#how">See how it works</a>
            </div>
          </div>
          <ProductPreview />
        </header>

        <section id="how" className="section landing__grid3">
          {[
            { icon: Sparkles, title: "Discover what fits", body: "A manageable shortlist from your year, interests and goals - not a high-volume feed you have to sift through." },
            { icon: Target, title: "Decide with evidence", body: "Every card shows source, freshness, eligibility and commitment. “Why this matches” is always one tap away." },
            { icon: CalendarClock, title: "Act before the deadline", body: "Save, set a reminder, and plan the next 30 days with confirmed and expected windows kept clearly apart." },
          ].map((o) => (
            <div className="card stack--sm" key={o.title}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--radar-space-2)" }}>
                <o.icon size={22} aria-hidden color="var(--radar-color-action-primary)" />
                <h3 className="section__title" style={{ fontSize: "var(--radar-font-size-title, 1.125rem)" }}>{o.title}</h3>
              </div>
              <p className="feedback__text" style={{ textAlign: "left" }}>{o.body}</p>
            </div>
          ))}
        </section>

        <section className="section card stack">
          <h2 className="section__title">Sources and forecasts you can question</h2>
          <div className="landing__grid3">
            <p className="eligrow"><ShieldCheck size={18} className="eligrow__icon" aria-hidden color="var(--radar-color-match-text)" /> Every listing states its source status and the date it was last checked.</p>
            <p className="eligrow"><Check size={18} className="eligrow__icon" aria-hidden color="var(--radar-color-match-text)" /> Match scores measure profile fit - never a chance of acceptance.</p>
            <p className="eligrow"><CalendarClock size={18} className="eligrow__icon" aria-hidden color="var(--radar-color-match-text)" /> Forecasts separate confirmed openings from expected seasonal windows.</p>
          </div>
        </section>

        <section className="section card stack" aria-labelledby="waitlist-h">
          <h2 className="section__title" id="waitlist-h">Join the waitlist</h2>
          {joined ? (
            <div className="alert alert--info" role="status">
              <Check size={16} aria-hidden style={{ flex: "none", alignSelf: "center" }} /> Thanks - you're on the demo waitlist. This prototype stores nothing.
            </div>
          ) : (
            <form
              style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setJoined(true);
              }}
            >
              <input
                className="input"
                style={{ flex: "1 1 16rem" }}
                type="email"
                required
                placeholder="you@u.nus.edu"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit">Join waitlist</Button>
            </form>
          )}
        </section>

        <footer className="landing__footer">
          <p>{DISCLAIMER}</p>
          <p>Demo content is fictional. Privacy & contact: hello@radar.example · No live NUS integration.</p>
        </footer>
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="card stack" aria-hidden style={{ boxShadow: "var(--radar-shadow-level-1)" }}>
      <span className="match__pill match__pill--strong" style={{ alignSelf: "flex-start" }}>
        <span className="tnum">95%</span> Strong match
      </span>
      <h3 className="oppcard__title">Undergraduate Research Taster: Human-Centred AI</h3>
      <p className="oppcard__org">Computing Research Studio · Official source</p>
      <div className="source">
        <span className="source__row"><CalendarClock size={16} aria-hidden /> Closes 2 Sep 2026, 11:59 PM SGT</span>
        <span className="deadline__abs">Why this matches → Research + AI, open to your year</span>
      </div>
      <div className="legend">
        <span className="legend__item"><span className="tl__dot tl__dot--confirmed" style={{ margin: 0 }} /> Confirmed</span>
        <span className="legend__item"><span className="tl__dot tl__dot--expected" style={{ margin: 0 }} /> Expected</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Welcome */

export function Welcome() {
  const { setPhase } = useNav();
  const { completeOnboarding } = useStore();
  const [error, setError] = useState(false);

  return (
    <div className="radar-app">
      <div className="center-screen">
        <div className="stack--sm" style={{ alignItems: "flex-start" }}>
          <RadarMark size={44} />
          <p style={{ fontSize: "var(--radar-font-size-heading-1)", fontWeight: 700, color: "var(--radar-color-text-primary)", lineHeight: "var(--radar-line-height-heading-1)" }}>
            Radar
          </p>
        </div>
        <div className="stack--sm">
          <h1 className="landing__display" style={{ fontSize: "var(--radar-font-size-heading-1)", lineHeight: "var(--radar-line-height-heading-1)" }}>
            Find the opportunities worth your time.
          </h1>
          <p style={{ fontSize: "var(--radar-font-size-body-large)", lineHeight: "var(--radar-line-height-body-large)", color: "var(--radar-color-text-secondary)" }}>
            Personalised NUS-relevant opportunities, clear source information, and
            one place to plan deadlines.
          </p>
        </div>

        {error ? (
          <div className="alert alert--error" role="alert">
            We couldn't complete NUS sign-in. Try the demo instead.
          </div>
        ) : null}

        <div className="stack--sm" style={{ gap: "var(--radar-space-4)" }}>
          <Button size="lg" block onClick={() => setPhase("setup")}>
            Set up my Radar
          </Button>
          <Button
            variant="secondary"
            size="lg"
            block
            onClick={() => {
              completeOnboarding(seedProfile);
              setPhase("app");
            }}
          >
            View demo
          </Button>
          <Button
            variant="tertiary"
            block
            onClick={() => setError(true)}
          >
            Continue with NUS email
          </Button>
        </div>
        <p className="deadline__abs">{DISCLAIMER}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Profile setup */

const GOALS = Object.entries(goalLabels).slice(0, 6);

export function ProfileSetup() {
  const { setPhase } = useNav();
  const { completeOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [year, setYear] = useState(3);
  const [yearTouched, setYearTouched] = useState(false);
  const [faculty, setFaculty] = useState("School of Computing");
  const [facultyTouched, setFacultyTouched] = useState(false);
  const [interests, setInterests] = useState<CategoryId[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  // Starts unselected, matching the Interests and Goals chip groups above -
  // an empty selection here honestly means "no preference set", not "all picked".
  const [modes, setModes] = useState<string[]>([]);

  const steps = ["Study context", "Interests", "Goals", "Review"];
  const canNext =
    step === 0 ? !!faculty : step === 1 ? interests.length > 0 : true;

  function toggleInterest(c: CategoryId) {
    setInterests((i) =>
      i.includes(c) ? i.filter((x) => x !== c) : i.length < 3 ? [...i, c] : i,
    );
  }
  function finish() {
    // Persist exactly what the user actually chose - including empty
    // selections when a step was skipped. seedProfile only supplies fields
    // this wizard never collects (id, firstName, eligibility facts); it must
    // never silently stand in for interests/goals the user never picked.
    const profile: Profile = {
      ...seedProfile,
      year,
      faculty,
      interests,
      goals,
      preferredModes: modes,
    };
    completeOnboarding(profile);
    setPhase("app");
  }

  return (
    <div className="radar-app">
      <div className="shell__frame">
        <header className="topbar">
          {step > 0 ? (
            <button className="iconbtn" aria-label="Back" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft size={22} aria-hidden />
            </button>
          ) : (
            <button className="iconbtn" aria-label="Back to welcome" onClick={() => setPhase("welcome")}>
              <ChevronLeft size={22} aria-hidden />
            </button>
          )}
          <h1 className="topbar__title">Set up my Radar</h1>
        </header>

        <div className="screen stack">
          <div className="stack--sm">
            <div className="progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4} aria-label={`Step ${step + 1} of 4`}>
              <div className="progress__fill" style={{ width: `${((step + 1) / 4) * 100}%` }} />
            </div>
            <p className="overline">Step {step + 1} of 4 · {steps[step]}</p>
          </div>

          {step === 0 ? (
            <div className="stack">
              <label className="field">
                <span className="field__label">Year of study</span>
                <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
                  {[1, 2, 3, 4].map((y) => (
                    <Chip
                      key={y}
                      pressed={year === y}
                      onToggle={() => {
                        setYear(y);
                        setYearTouched(true);
                      }}
                    >
                      Year {y}
                    </Chip>
                  ))}
                </div>
              </label>
              <label className="field">
                <span className="field__label">Faculty or school</span>
                <select
                  className="input"
                  value={faculty}
                  onChange={(e) => {
                    setFaculty(e.target.value);
                    setFacultyTouched(true);
                  }}
                >
                  {["School of Computing", "College of Design and Engineering", "Faculty of Arts and Social Sciences", "NUS Business School", "Faculty of Science"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="stack">
              <p className="feedback__text" style={{ textAlign: "left" }}>Choose up to three. This shapes your Top matches.</p>
              <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
                {categories.map((c) => (
                  <Chip
                    key={c.id}
                    pressed={interests.includes(c.id)}
                    onToggle={() => toggleInterest(c.id)}
                    disabled={!interests.includes(c.id) && interests.length >= 3}
                  >
                    {c.label}
                  </Chip>
                ))}
              </div>
              <p className="deadline__abs">{interests.length}/3 selected</p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="stack">
              <p className="field__label">What are you hoping for?</p>
              <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
                {GOALS.map(([id, label]) => (
                  <Chip
                    key={id}
                    pressed={goals.includes(id)}
                    onToggle={() =>
                      setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]))
                    }
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              <p className="field__label">Preferred mode</p>
              <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
                {[["in-person", "In person"], ["hybrid", "Hybrid"], ["online", "Online"]].map(([id, label]) => (
                  <Chip
                    key={id}
                    pressed={modes.includes(id)}
                    onToggle={() =>
                      setModes((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))
                    }
                  >
                    {label}
                  </Chip>
                ))}
              </div>
              <p className="deadline__abs">Optional eligibility facts can be added later - you can skip this.</p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="stack">
              <p className="feedback__text" style={{ textAlign: "left" }}>Here is how each factor will shape your results. You can change any of these anytime in Profile.</p>
              {(
                [
                  {
                    label: "Year & faculty",
                    value: yearTouched || facultyTouched ? `Year ${year} · ${faculty}` : "Not set - you can add this in Profile later",
                    why: "Used to check eligibility windows.",
                    notSet: !(yearTouched || facultyTouched),
                  },
                  {
                    label: "Interests",
                    value: interests.length
                      ? interests.map((i) => categories.find((c) => c.id === i)?.label).join(", ")
                      : "Not set - you can add this in Profile later",
                    why: "Ranks matching categories higher.",
                    notSet: interests.length === 0,
                  },
                  {
                    label: "Goals",
                    value: goals.length ? goals.map((g) => goalLabels[g] ?? g).join(", ") : "Not set - you can add this in Profile later",
                    why: "Adds goal-alignment points.",
                    notSet: goals.length === 0,
                  },
                  {
                    label: "Mode",
                    value: modes.length ? modes.join(", ") : "Any (no preference set)",
                    why: "Small preference weighting.",
                    notSet: false,
                  },
                ] as const
              ).map((row) => (
                <div className="card card--quiet stack--sm" key={row.label}>
                  <p className="glance__label">{row.label}</p>
                  <p
                    style={{
                      fontWeight: row.notSet ? 400 : 600,
                      fontStyle: row.notSet ? "italic" : "normal",
                      color: row.notSet ? "var(--radar-color-text-secondary)" : undefined,
                    }}
                  >
                    {row.value}
                  </p>
                  <p className="deadline__abs">{row.why}</p>
                </div>
              ))}
              <p className="deadline__abs">We never use faculty, year or personal facts to guess your chance of acceptance. <span className="linkbtn">Privacy explained</span></p>
            </div>
          ) : null}
        </div>

        <div className="stickybar">
          {step < 3 ? (
            <Button variant="tertiary" onClick={() => setStep((s) => Math.min(3, s + 1))}>
              Skip for now
            </Button>
          ) : null}
          {step < 3 ? (
            <Button block disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button block onClick={finish} icon={<RadarIcon size={18} aria-hidden />}>
              See my matches
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Widget preview */

export function WidgetPreview() {
  const { opportunities, isWatching } = useStore();
  const nav = useNav();
  const { notificationsPermission } = useStore();

  // Choose the opted-in saved item, else best current match.
  const saved = opportunities.find((o) => o.progress.status === "saved" || o.progress.status === "preparing");
  const best = [...opportunities]
    .filter((o) => o.availability === "open" || o.availability === "closingSoon")
    .sort((a, b) => b.match.score - a.match.score)[0];
  const opp = saved ?? best;

  if (notificationsPermission === "denied") {
    return (
      <div className="lockscreen">
        <div className="lockscreen__clock">
          <p className="tnum" style={{ fontSize: "var(--radar-font-size-display)", fontWeight: 700 }}>9:41</p>
          <p>Monday, 31 August</p>
        </div>
        <div className="widget">
          <p className="overline" style={{ color: "var(--radar-color-text-inverse)" }}>Radar widget</p>
          <p>Widget unavailable - notifications are turned off.</p>
          <Button size="sm" variant="secondary" onClick={() => nav.switchTab("profile")}>Enable in settings</Button>
        </div>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="lockscreen">
        <div className="widget">
          <p className="overline" style={{ color: "var(--radar-color-text-inverse)" }}>Radar widget</p>
          <p>No saved opportunities yet. Save one to pin it here.</p>
        </div>
      </div>
    );
  }

  const isStale = opp.availability === "closed";

  return (
    <div className="lockscreen">
      <div className="lockscreen__clock">
        <p className="tnum" style={{ fontSize: "var(--radar-font-size-display)", fontWeight: 700 }}>9:41</p>
        <p>Monday, 31 August</p>
      </div>
      <button
        className="widget"
        style={{ textAlign: "left", border: "none" }}
        onClick={() => {
          nav.setPhase("app");
          nav.navigate({ name: "detail", id: opp.id });
          nav.closeSheet();
        }}
      >
        <span className="overline" style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-1)", color: "var(--radar-color-signal)" }}>
          <RadarMark size={16} /> Radar
        </span>
        {isWatching(opp.id) ? (
          <span className="tag">Watching</span>
        ) : opp.match.score >= 50 && opp.forecast.status !== "expected" ? (
          <span className="tnum" style={{ color: "var(--radar-color-signal)", fontWeight: 700 }}>
            {opp.match.score}% {opp.match.label}
          </span>
        ) : null}
        <span style={{ fontWeight: 700 }}>{opp.title}</span>
        <span className="tnum" style={{ fontSize: "var(--radar-font-size-small)", opacity: 0.85 }}>
          {isStale
            ? "Applications closed"
            : opp.applicationDeadline
              ? formatDeadline(opp.applicationDeadline)
              : "Dates not announced"}
        </span>
        {opp.progress.nextAction ? (
          <span style={{ fontSize: "var(--radar-font-size-small)", opacity: 0.85 }}>
            Next: {opp.progress.nextAction}
          </span>
        ) : null}
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-1)", color: "var(--radar-color-signal)", fontWeight: 600, fontSize: "var(--radar-font-size-small)" }}>
          Tap to view <ArrowRight size={14} aria-hidden />
        </span>
      </button>
    </div>
  );
}
