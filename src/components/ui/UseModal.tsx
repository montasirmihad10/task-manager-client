"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type TRmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  footer?: React.ReactNode;
};

const UseModal = ({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-md",
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
}: TRmModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-paper shadow-[0_-12px_40px_rgba(16,20,24,0.2)] sm:max-h-[85dvh] sm:rounded-2xl sm:shadow-xl ${width}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden" />
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/10 px-4 py-3.5 sm:px-6 sm:py-4">
          <h3 className="min-w-0 truncate font-display text-base font-semibold text-ink sm:text-lg">
            {title}
          </h3>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-mist hover:text-ink"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {footer ? (
          <div className="safe-pb shrink-0 border-t border-ink/10 bg-mist/80 px-4 py-3 sm:px-6 sm:py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UseModal;
