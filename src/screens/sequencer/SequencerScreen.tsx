import Placeholder from "../../components/Placeholder";
import ScreenLayout from "../../components/ScreenLayout";

interface SequencerScreenProps {
  onBack: () => void;
}

/** Secuenciador – HU-07 (crear secuencia) y HU-08 (ejecutar paso a paso). */
export default function SequencerScreen({ onBack }: SequencerScreenProps) {
  return (
    <ScreenLayout title="Secuenciador" onBack={onBack}>
      <Placeholder stories={["HU-07", "HU-08"]} />
    </ScreenLayout>
  );
}

