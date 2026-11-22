"use client";

import { CopyPlus } from "lucide-react";
import StatusColumn from "./status-column";

type Props = {
  openModal: (status: string) => void;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: string) => void;
};

export default function GeneralInfo(props: Props) {
  return (
    <StatusColumn
      title="General Information"
      status="general"
      buttonLabel="Add General Info"
      buttonClassName="bg-slate-400 text-black"
      Icon={CopyPlus}
      {...props}
    />
  );
}
