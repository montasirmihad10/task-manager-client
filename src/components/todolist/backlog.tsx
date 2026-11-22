"use client";

import { AlarmClockCheck } from "lucide-react";
import StatusColumn from "./status-column";

type Props = {
  openModal: (status: string) => void;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: string) => void;
};

export default function BackLog(props: Props) {
  return (
    <StatusColumn
      title="BackLog Information"
      status="backlog"
      buttonLabel="Add BackLog Info"
      buttonClassName="bg-blue-500 text-white"
      Icon={AlarmClockCheck}
      prevClassName="text-purple-600 font-semibold rounded text-lg transition cursor-pointer hover:underline underline-offset-4"
      nextClassName="rounded transition text-lg text-purple-600 font-semibold cursor-pointer hover:underline underline-offset-4"
      {...props}
    />
  );
}
