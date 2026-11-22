"use client";

import { MailCheck } from "lucide-react";
import StatusColumn from "./status-column";

type Props = {
  openModal: (status: string) => void;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: string) => void;
};

export default function ReadyToLaunch(props: Props) {
  return (
    <StatusColumn
      title="Completed Information"
      status="ready-to-launch"
      buttonLabel="Add ready Info"
      buttonClassName="bg-green-500 text-black"
      Icon={MailCheck}
      {...props}
    />
  );
}
