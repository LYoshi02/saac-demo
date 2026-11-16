import { useEffect, useId } from "react";
import type { Pictogram } from "../../services/arasaac";
import PictogramPicker, { type PictogramPickerProps } from "./PictogramPicker";

export interface PictogramPickerModalProps extends PictogramPickerProps {
  /** Controla si el diálogo modal está abierto. */
  isOpen: boolean;
  /** Callback para cerrar el modal sin cambiar la selección. */
  onClose: () => void;
  /** Título del encabezado del modal (por defecto "Elegir pictograma"). */
  title?: string;
  /** Si es true (por defecto), cierra automáticamente el modal al elegir un pictograma. */
  closeOnSelect?: boolean;
}

/**
 * Ventana modal accesible que envuelve a `PictogramPicker` para usar desde cualquier módulo
 * (Cronómetro, Organizador o Secuenciador).
 */
export default function PictogramPickerModal({
  isOpen,
  onClose,
  title = "Elegir pictograma",
  closeOnSelect = true,
  onSelect,
  ...pickerProps
}: PictogramPickerModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (pictogram: Pictogram) => {
    onSelect(pictogram);
    if (closeOnSelect) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <h2 id={titleId} className="text-2xl font-extrabold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-400"
          >
            Cerrar
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <PictogramPicker {...pickerProps} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}

