export type CategoryId =
  | "career"
  | "research"
  | "venture"
  | "competition"
  | "global"
  | "impact"
  | "event"
  | "funding";

export type Availability =
  | "upcoming"
  | "open"
  | "closingSoon"
  | "closed"
  | "full"
  | "cancelled";

export type ProgressStatus =
  | "none"
  | "saved"
  | "preparing"
  | "applied"
  | "completed"
  | "dismissed";

export type ForecastStatus = "confirmed" | "expected" | "watching";

export type SourceStatus =
  | "official"
  | "organiserVerified"
  | "communitySubmitted"
  | "needsReview";

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organiser: string;
  categoryId: CategoryId;
  tags: string[];
  summary: string;
  availability: Availability;
  applicationDeadline: string | null;
  programmeDates: { start: string; end: string } | null;
  location: string;
  mode: "in-person" | "hybrid" | "online";
  eligibility: { confirmed: string[]; toCheck: string[]; blockers: string[] };
  commitment: { label: string; provenance: string };
  source: {
    status: SourceStatus;
    label: string;
    domain: string;
    url: string;
    lastChecked: string;
  };
  match: {
    score: number;
    label: string;
    reasons: string[];
    missing: string[];
    blockers: string[];
    disclaimer: string;
  };
  rating: {
    average: number | null;
    count: number;
    wouldRecommendPercent: number | null;
    wouldRecommendCount: number;
  };
  reviewIds: string[];
  progress: {
    status: ProgressStatus;
    nextAction: string | null;
    reminderAt: string | null;
    updatedAt: string | null;
  };
  forecast: {
    status: ForecastStatus;
    basis: string;
    previousOccurrence: { announced: string; applicationDeadline: string } | null;
  };
}

export interface Review {
  id: string;
  opportunityId: string;
  rating: number;
  wouldRecommend: boolean;
  commitmentAccuracy: string;
  organiserCommunication: string;
  bestFor: string[];
  note: string;
  reviewer: {
    displayName: string;
    year: number;
    faculty: string;
    participationYear: number;
    verification: "attendanceVerified" | "nusStudentVerified";
  };
  createdAt: string;
}

export interface AssistantScenario {
  id: string;
  matches: string[];
  interpretedCriteria: string[];
  resultOpportunityIds: string[];
  response: string;
}

export interface AppNotification {
  id: string;
  type: "deadline" | "sourceChanged" | "expectedItemConfirmed" | "recommendation";
  opportunityId: string;
  createdAt: string;
  isRead: boolean;
  title: string;
  body: string;
}

export interface Profile {
  id: string;
  firstName: string;
  year: number;
  faculty: string;
  interests: CategoryId[];
  goals: string[];
  preferredModes: string[];
  preferredCommitmentHoursPerWeekMax: number;
  eligibilityFacts: Record<string, unknown>;
}
