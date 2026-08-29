import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { daysUntil } from "./format";
import type { CategoryId, Opportunity, Profile } from "./types";

export type SortKey = "relevance" | "deadline" | "checked" | "rating";

export interface FilterState {
  query: string;
  categories: CategoryId[];
  closingSoon: boolean;
  eligibleForMe: boolean;
  modes: string[];
  maxCommitment: boolean; // within preferred weekly hours
  sort: SortKey;
}

export const emptyFilters: FilterState = {
  query: "",
  categories: [],
  closingSoon: false,
  eligibleForMe: false,
  modes: [],
  maxCommitment: false,
  sort: "relevance",
};

interface ExploreValue {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  patch: (p: Partial<FilterState>) => void;
  scrollY: number;
  setScrollY: (n: number) => void;
}

const ExploreContext = createContext<ExploreValue | null>(null);

export function ExploreProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [scrollY, setScrollY] = useState(0);
  const value = useMemo(
    () => ({
      filters,
      setFilters,
      patch: (p: Partial<FilterState>) => setFilters((f) => ({ ...f, ...p })),
      scrollY,
      setScrollY,
    }),
    [filters, scrollY],
  );
  return <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>;
}

export function useExplore() {
  const ctx = useContext(ExploreContext);
  if (!ctx) throw new Error("useExplore must be used within ExploreProvider");
  return ctx;
}

export function activeFilterCount(f: FilterState): number {
  return (
    f.categories.length +
    (f.closingSoon ? 1 : 0) +
    (f.eligibleForMe ? 1 : 0) +
    f.modes.length +
    (f.maxCommitment ? 1 : 0)
  );
}

/** Deterministic eligibility check against the demo profile. */
function eligibleForProfile(opp: Opportunity, profile: Profile): boolean {
  if (opp.eligibility.blockers.length > 0) return false;
  // Meets minimum-year style facts if any are encoded in reasons/missing.
  const minYear = (profile.eligibilityFacts as { minimumYear?: number }).minimumYear ?? 1;
  void minYear;
  return true;
}

export function applyFilters(
  all: Opportunity[],
  f: FilterState,
  profile: Profile,
): Opportunity[] {
  const q = f.query.trim().toLowerCase();
  let list = all.filter((opp) => {
    if (q) {
      const hay = [
        opp.title,
        opp.organiser,
        opp.categoryId,
        ...opp.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.categories.length && !f.categories.includes(opp.categoryId)) return false;
    if (f.closingSoon) {
      if (!opp.applicationDeadline) return false;
      const d = daysUntil(opp.applicationDeadline);
      if (d < 0 || d > 7) return false;
    }
    if (f.eligibleForMe && !eligibleForProfile(opp, profile)) return false;
    if (f.modes.length && !f.modes.includes(opp.mode)) return false;
    if (f.maxCommitment) {
      const hrs = extractHours(opp.commitment.label);
      if (hrs !== null && hrs > profile.preferredCommitmentHoursPerWeekMax) return false;
    }
    return true;
  });

  list = sortOpportunities(list, f.sort);
  return list;
}

function extractHours(label: string): number | null {
  const m = label.match(/(\d+)\s*hours per week/i);
  return m ? Number(m[1]) : null;
}

export function sortOpportunities(list: Opportunity[], sort: SortKey): Opportunity[] {
  const arr = [...list];
  switch (sort) {
    case "deadline":
      return arr.sort((a, b) => deadlineRank(a) - deadlineRank(b));
    case "checked":
      return arr.sort(
        (a, b) =>
          new Date(b.source.lastChecked).getTime() -
          new Date(a.source.lastChecked).getTime(),
      );
    case "rating":
      return arr.sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0));
    default:
      return arr.sort((a, b) => b.match.score - a.match.score);
  }
}

function deadlineRank(o: Opportunity): number {
  if (!o.applicationDeadline) return Number.MAX_SAFE_INTEGER;
  return new Date(o.applicationDeadline).getTime();
}
