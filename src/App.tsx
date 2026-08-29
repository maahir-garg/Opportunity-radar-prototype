import { ExploreProvider } from "./radar/filters";
import { NavProvider, useNav } from "./radar/nav";
import { StoreProvider } from "./radar/store";
import { AppShell } from "./radar/shell";
import { SheetHost } from "./radar/sheets";
import { ToastHost } from "./radar/ui";
import { Landing, ProfileSetup, Welcome } from "./radar/screens/onboarding";
import { ForYou } from "./radar/screens/foryou";
import { Explore } from "./radar/screens/explore";
import { Detail, Reviews } from "./radar/screens/detail";
import { ExpectedPreview, Radar30 } from "./radar/screens/forecast";
import { Plan } from "./radar/screens/plan";
import { AskRadar } from "./radar/screens/ask";
import { Notifications, Profile, WidgetScreen } from "./radar/screens/misc";

function CurrentScreen() {
  const { tab, current } = useNav();

  if (current) {
    switch (current.name) {
      case "detail":
        return <Detail id={current.id} />;
      case "reviews":
        return <Reviews id={current.id} />;
      case "radar":
        return <Radar30 />;
      case "expected":
        return <ExpectedPreview id={current.id} />;
      case "askradar":
        return <AskRadar />;
      case "notifications":
        return <Notifications />;
      case "widget":
        return <WidgetScreen />;
    }
  }

  switch (tab) {
    case "foryou":
      return <ForYou />;
    case "explore":
      return <Explore />;
    case "plan":
      return <Plan />;
    case "profile":
      return <Profile />;
  }
}

function Router() {
  const { phase } = useNav();

  if (phase === "landing") return <Landing />;
  if (phase === "welcome") return <Welcome />;
  if (phase === "setup") return <ProfileSetup />;

  return (
    <>
      <AppShell>
        <CurrentScreen />
      </AppShell>
      <SheetHost />
      <ToastHost />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ExploreProvider>
        <NavProvider>
          <Router />
        </NavProvider>
      </ExploreProvider>
    </StoreProvider>
  );
}
