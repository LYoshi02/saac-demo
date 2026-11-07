import Placeholder from "../../components/Placeholder";
import ScreenLayout from "../../components/ScreenLayout";

interface TimerScreenProps {
  onBack: () => void;
}

/** Cronómetro – HU-01 (configurar) y HU-02 (ejecutar con indicador y aviso sonoro). */
export default function TimerScreen({ onBack }: TimerScreenProps) {
  return (
    <ScreenLayout title="Cronómetro" onBack={onBack}>
      <Placeholder stories={["HU-01", "HU-02"]} />
    </ScreenLayout>
  );
}

