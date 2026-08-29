import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { categories } from "../data";
import {
  activeFilterCount,
  applyFilters,
  emptyFilters,
  useExplore,
} from "../filters";
import { useNav } from "../nav";
import { useStore } from "../store";
import { CategoryIcon, OpportunityCard, matchVariant } from "../components";
import { Button, Chip, Feedback } from "../ui";
import { RootTopBar } from "../shell";

const SORT_LABELS: Record<string, string> = {
  relevance: "Relevance",
  deadline: "Deadline soonest",
  checked: "Recently checked",
  rating: "Rating",
};

export function Explore() {
  const { opportunities, profile } = useStore();
  const { filters, patch, setFilters } = useExplore();
  const { navigate, openSheet } = useNav();

  const results = applyFilters(opportunities, filters, profile);
  const count = results.length;
  const activeCount = activeFilterCount(filters);
  void matchVariant;

  return (
    <>
      <RootTopBar title="Explore" />
      <div className="screen stack">
        <div className="searchbar">
          <div className="searchfield">
            <Search size={18} className="searchfield__icon" aria-hidden />
            <input
              className="input"
              type="search"
              placeholder="Search titles, organisers, tags"
              aria-label="Search opportunities"
              value={filters.query}
              onChange={(e) => patch({ query: e.target.value })}
            />
            {filters.query ? (
              <button
                className="iconbtn searchfield__clear"
                aria-label="Clear search"
                onClick={() => patch({ query: "" })}
              >
                <X size={18} aria-hidden />
              </button>
            ) : null}
          </div>
          <Button
            variant="secondary"
            icon={<SlidersHorizontal size={16} aria-hidden />}
            onClick={() => openSheet({ name: "filter" })}
          >
            {activeCount ? `Filters (${activeCount})` : "Filters"}
          </Button>
        </div>

        <Button
          variant="tertiary"
          icon={<Sparkles size={16} aria-hidden />}
          onClick={() => navigate({ name: "askradar" })}
          style={{ alignSelf: "flex-start" }}
        >
          Or Ask Radar to describe what you want
        </Button>

        <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
          {categories.map((c) => (
            <Chip
              key={c.id}
              pressed={filters.categories.includes(c.id)}
              onToggle={() =>
                patch({
                  categories: filters.categories.includes(c.id)
                    ? filters.categories.filter((x) => x !== c.id)
                    : [...filters.categories, c.id],
                })
              }
            >
              <CategoryIcon id={c.id} /> {c.label}
            </Chip>
          ))}
        </div>

        <div className="source__row" style={{ justifyContent: "space-between" }} aria-live="polite">
          <span className="deadline__abs tnum">
            {count} {count === 1 ? "opportunity" : "opportunities"}
          </span>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--radar-space-2)", fontSize: "var(--radar-font-size-small)" }}>
            Sort
            <select
              className="input"
              style={{ width: "auto", minHeight: "var(--radar-size-control-compact)" }}
              value={filters.sort}
              onChange={(e) => patch({ sort: e.target.value as never })}
              aria-label="Sort opportunities"
            >
              {Object.entries(SORT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>

        {count === 0 ? (
          <Feedback
            icon={<Search size={32} aria-hidden color="var(--radar-color-text-secondary)" />}
            title={
              activeCount || filters.query
                ? `No opportunities match ${activeCount + (filters.query ? 1 : 0)} filter${activeCount + (filters.query ? 1 : 0) === 1 ? "" : "s"}.`
                : "No opportunities to show."
            }
            text="Your search text is kept. Clear filters to see the full catalogue."
            action={
              <Button onClick={() => setFilters({ ...emptyFilters })}>Clear filters</Button>
            }
            secondary={<Button variant="tertiary">Watch this search</Button>}
          />
        ) : (
          <div className="stack">
            {results.map((o) => (
              <OpportunityCard key={o.id} opp={o} variant="list" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
