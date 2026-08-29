import { useEffect, useState } from "react";
import { Radar as RadarIcon, SlidersHorizontal } from "lucide-react";
import { categories } from "../data";
import { daysUntil } from "../format";
import { useNav } from "../nav";
import { useStore } from "../store";
import { OpportunityCard, Section } from "../components";
import { Button, Feedback, Skeleton } from "../ui";
import { RootTopBar } from "../shell";
import { ForecastPreview } from "./forecast";

function CardSkeleton() {
  return (
    <div className="oppcard oppcard--list" aria-hidden>
      <Skeleton w="40%" />
      <Skeleton h="1.25rem" w="85%" />
      <Skeleton w="55%" />
      <Skeleton w="70%" />
    </div>
  );
}

export function ForYou() {
  const { opportunities, profile } = useStore();
  const { switchTab } = useNav();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(t);
  }, []);

  const interestLabels = profile.interests
    .map((i) => categories.find((c) => c.id === i)?.label ?? i);

  const visible = opportunities.filter((o) => o.progress.status !== "dismissed");

  // Track opportunities already placed in an earlier section so later
  // sections don't select (and render) the same card again.
  const usedIds = new Set<string>();

  const topMatches = [...visible]
    .filter((o) => o.forecast.status !== "expected" && o.match.score >= 70 && o.availability !== "closed")
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 2);
  topMatches.forEach((o) => usedIds.add(o.id));

  // Not capped to a fixed N, so excluding already-used ids naturally
  // backfills with the next-best (by deadline) eligible candidate instead
  // of leaving the section short.
  const closingSoon = visible
    .filter(
      (o) =>
        !usedIds.has(o.id) &&
        o.applicationDeadline &&
        daysUntil(o.applicationDeadline) >= 0 &&
        daysUntil(o.applicationDeadline) <= 10,
    )
    .sort((a, b) => daysUntil(a.applicationDeadline!) - daysUntil(b.applicationDeadline!));
  closingSoon.forEach((o) => usedIds.add(o.id));

  const primaryInterest = profile.interests[0];
  const becauseOf = visible.filter(
    (o) => o.categoryId === primaryInterest && !usedIds.has(o.id),
  );

  return (
    <>
      <RootTopBar title="For You" />
      <div className="screen">
        <p className="feedback__text" style={{ textAlign: "left", marginBottom: "var(--radar-space-4)" }}>
          Hello {profile.firstName}. Based on {profile.interests.length} interests
          {interestLabels.length ? ` - ${interestLabels.join(", ")}` : ""}.{" "}
          <button className="linkbtn" onClick={() => switchTab("profile")}>
            Edit
          </button>
        </p>

        <ForecastPreview />

        <Section title="Top matches">
          {loading ? (
            <div className="stack">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : topMatches.length ? (
            <div className="stack">
              {topMatches.map((o) => (
                <OpportunityCard key={o.id} opp={o} variant="featured" />
              ))}
            </div>
          ) : (
            <Feedback
              icon={<RadarIcon size={32} aria-hidden color="var(--radar-color-text-secondary)" />}
              title="No strong matches yet"
              text="Add another interest or explore everything to widen your signal."
              action={<Button onClick={() => switchTab("explore")}>Explore everything</Button>}
            />
          )}
        </Section>

        {closingSoon.length ? (
          <Section title="Closing soon">
            <div className="stack">
              {closingSoon.map((o) => (
                <OpportunityCard key={o.id} opp={o} variant="list" />
              ))}
            </div>
          </Section>
        ) : null}

        {becauseOf.length ? (
          <Section
            title={`Because you chose ${categories.find((c) => c.id === primaryInterest)?.label ?? "your interests"}`}
          >
            <div className="stack">
              {becauseOf.map((o) => (
                <OpportunityCard key={o.id} opp={o} variant="list" />
              ))}
            </div>
          </Section>
        ) : null}

        <div style={{ marginTop: "var(--radar-space-8)" }}>
          <Button variant="tertiary" icon={<SlidersHorizontal size={16} aria-hidden />} onClick={() => switchTab("profile")}>
            Tune my Radar
          </Button>
        </div>
      </div>
    </>
  );
}
