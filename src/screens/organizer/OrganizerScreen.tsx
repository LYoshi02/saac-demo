import Placeholder from "../../components/Placeholder";
import ScreenLayout from "../../components/ScreenLayout";

interface OrganizerScreenProps {
  onBack: () => void;
}

/** Organizador – HU-04 (gestionar agenda diaria). */
export default function OrganizerScreen({ onBack }: OrganizerScreenProps) {
  return (
    <ScreenLayout title="Organizador" onBack={onBack}>
      <Placeholder stories={["HU-04"]} />
    </ScreenLayout>
  );
}

