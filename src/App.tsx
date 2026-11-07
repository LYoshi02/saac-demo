import { useState } from "react";
import type { FeatureId } from "./features";
import HomeScreen from "./screens/home";
import OrganizerScreen from "./screens/organizer";
import SequencerScreen from "./screens/sequencer";
import TimerScreen from "./screens/timer";

type Screen = "home" | FeatureId;

/** Navegación simple por estado (sin router por ahora). */
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const goHome = () => setScreen("home");

  switch (screen) {
    case "timer":
      return <TimerScreen onBack={goHome} />;
    case "organizer":
      return <OrganizerScreen onBack={goHome} />;
    case "sequencer":
      return <SequencerScreen onBack={goHome} />;
    default:
      return <HomeScreen onSelect={setScreen} />;
  }
}
