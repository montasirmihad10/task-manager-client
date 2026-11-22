"use client";

import UseModal from "@/components/ui/UseModal";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <UseModal
      isOpen={open}
      onClose={onClose}
      title={title}
      width="max-w-sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
              danger
                ? "bg-signal text-white"
                : "bg-ink text-accent"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </UseModal>
  );
}
