import raw from "../imports/05-MOCK-DATA.json";
import type {
  AppNotification,
  AssistantScenario,
  Category,
  Opportunity,
  Profile,
  Review,
} from "./types";

export const PROTOTYPE_TODAY = new Date(raw.meta.prototypeToday);

export const seedProfile = raw.profile as Profile;
export const categories = raw.categories as Category[];
export const seedOpportunities = raw.opportunities as Opportunity[];
export const reviews = raw.reviews as Review[];
export const assistantScenarios = raw.assistantScenarios as AssistantScenario[];
export const seedNotifications = raw.notifications as AppNotification[];

export const goalLabels: Record<string, string> = {
  "build-experience": "Build experience",
  "explore-ai": "Explore AI",
  "meet-mentors": "Meet mentors",
  "give-back": "Give back",
  "travel": "Study or work overseas",
  "earn-funding": "Earn funding",
};

export function categoryById(id: string): Category {
  return categories.find((c) => c.id === id) ?? categories[0];
}

export function reviewsFor(opportunityId: string): Review[] {
  return reviews.filter((r) => r.opportunityId === opportunityId);
}
