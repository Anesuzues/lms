import { X } from "lucide-react";
import { useEffect } from "react";
import IntakeForm from "./IntakeForm";

interface IntakeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formUrl?: string;
}

const IntakeFormModal = ({ isOpen, onClose, formUrl }: IntakeFormModalProps) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[90vh] mx-4 bg-background rounded-2xl shadow-2xl animate-scale-in overflow-hidden border border-border/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold">Start Your Free Course</h2>
            <p className="text-sm text-muted-foreground">Fill out the form to receive Module 0 via email</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="h-[calc(100%-80px)] overflow-y-auto overflow-x-hidden">
          <IntakeForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
};

export default IntakeFormModal;
