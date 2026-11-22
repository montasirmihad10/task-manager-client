"use client";

import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { LucideIcon, Plus } from "lucide-react";
import DropArea from "./drop-area";
import ToDoCard from "./todo-card";
import { ITask, TTaskStatus, useGetUserTasksQuery } from "@/redux/api/taskApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { columnAccentFor } from "@/lib/statusStyles";

type StatusColumnProps = {
  title: string;
  status: TTaskStatus;
  buttonLabel: string;
  buttonClassName?: string;
  Icon: LucideIcon;
  openModal: (status: string) => void;
  setActiveCard: (id: string | null) => void;
  onDrop: (status: string) => void;
  prevClassName?: string;
  nextClassName?: string;
};

export default function StatusColumn({
  title,
  status,
  buttonLabel,
  Icon,
  openModal,
  setActiveCard,
  onDrop,
}: StatusColumnProps) {
  const { data: profileResult } = useGetMyProfileQuery(undefined);
  const user = profileResult?.data as { email?: string } | undefined;
  const { data: tasksResult } = useGetUserTasksQuery(user?.email || "", {
    skip: !user?.email,
  });
  const data = (tasksResult?.data || []) as ITask[];
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const filtered = data.filter((item) => item.status === status);
  const pageCount = Math.ceil(filtered.length / itemsPerPage) || 0;
  const currentItems = filtered.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <div
      className={`panel-lift flex h-full flex-col border border-ink/10 border-l-4 bg-paper/95 ${columnAccentFor(status)}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-3 py-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>
          <p className="text-[11px] text-muted">{filtered.length} tasks</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openModal(status)}
        className="m-3 flex items-center justify-center gap-2 rounded-md border border-dashed border-ink/20 px-3 py-2.5 text-sm font-medium text-ink transition duration-200 hover:-translate-y-0.5 hover:border-accent-deep hover:bg-accent/20"
      >
        <Plus size={16} />
        {buttonLabel}
      </button>

      <div className="flex-1 space-y-0 px-3 pb-3">
        <DropArea onDrop={() => onDrop(status)} />
        {currentItems.length > 0 ? (
          currentItems.map((item) => (
            <React.Fragment key={item._id}>
              <ToDoCard item={item} setActiveCard={setActiveCard} />
              <DropArea onDrop={() => onDrop(status)} />
            </React.Fragment>
          ))
        ) : (
          <p className="px-2 py-10 text-center text-sm text-muted">
            Empty column
          </p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="border-t border-ink/10 px-3 py-2">
          <ReactPaginate
            previousLabel="Prev"
            nextLabel="Next"
            onPageChange={({ selected }) => setCurrentPage(selected)}
            pageCount={pageCount}
            containerClassName="flex items-center justify-between gap-2 text-xs"
            previousClassName="rounded-md border border-ink/15 px-2 py-1 text-ink hover:bg-mist cursor-pointer"
            nextClassName="rounded-md bg-ink px-2 py-1 text-accent hover:bg-ink-soft cursor-pointer"
            disabledClassName="opacity-40 cursor-not-allowed"
            breakClassName="hidden"
            pageClassName="hidden"
          />
        </div>
      )}
    </div>
  );
}
