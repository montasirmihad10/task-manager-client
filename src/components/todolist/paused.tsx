"use client";

import { CircleStop } from "lucide-react";
import StatusColumn from "./status-column";

type Props = {
  openModal: (status: string) => void;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: string) => void;
};

export default function Paused(props: Props) {
  return (
    <StatusColumn
      title="Paused Information"
      status="paused"
      buttonLabel="Add paused Info"
      buttonClassName="bg-red-500 text-white"
      Icon={CircleStop}
      {...props}
    />
  );
}
