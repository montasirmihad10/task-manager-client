"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

type DropAreaProps = {
  onDrop: () => void;
};

export default function DropArea({ onDrop }: DropAreaProps) {
  const [showDrop, setShowDrop] = useState(false);

  return (
    <div
      onDragEnter={() => setShowDrop(true)}
      onDragLeave={() => setShowDrop(false)}
      onDrop={() => {
        onDrop();
        setShowDrop(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      className={
        showDrop
          ? "mb-2 flex h-16 items-center justify-center border border-dashed border-accent-deep bg-accent/20 text-accent-ink transition"
          : "h-2"
      }
    >
      {showDrop ? <Plus size={18} /> : null}
    </div>
  );
}
