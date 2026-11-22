"use client";

import { CircleDashed } from "lucide-react";
import StatusColumn from "./status-column";

type Props = {
  openModal: (status: string) => void;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: string) => void;
};

export default function InProgress(props: Props) {
  return (
    <StatusColumn
      title="Running Information"
      status="in-progress"
      buttonLabel="Add Running Info"
      buttonClassName="bg-yellow-500 text-black"
      Icon={CircleDashed}
      {...props}
    />
  );
}
