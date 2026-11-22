"use client";

import React from "react";

type Column<T> = {
  key: keyof T | string;
  title: React.ReactNode;
  render?: (record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  className?: string;
  /** Hide this field in the mobile card stack */
  hideOnMobile?: boolean;
};

type RmTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
  bordered?: boolean;
  striped?: boolean;
  hover?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UseTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = "No data found",
  rowClassName,
  onRowClick,
  bordered = true,
  striped = true,
  hover = true,
}: RmTableProps<T>) => {
  if (loading) {
    return (
      <div className="space-y-2 p-3 sm:p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl sm:h-11 sm:rounded-md" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
        <p className="font-display text-base font-semibold text-ink">
          Nothing here yet
        </p>
        <p className="text-sm text-muted">{emptyText}</p>
      </div>
    );
  }

  const mobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {data.map((row, rowIndex) => {
          const customRowClass =
            typeof rowClassName === "function"
              ? rowClassName(row, rowIndex)
              : rowClassName || "";
          return (
            <article
              key={row._id || rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={`rounded-2xl border border-ink/10 bg-paper p-4 shadow-[0_4px_16px_rgba(16,20,24,0.04)] ${
                onRowClick ? "cursor-pointer active:bg-mist" : ""
              } ${customRowClass}`}
            >
              <dl className="space-y-3">
                {mobileColumns.map((col) => (
                  <div
                    key={col.key as string}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      {col.title}
                    </dt>
                    <dd className="min-w-0 text-right text-sm text-ink">
                      {col.render
                        ? col.render(row, rowIndex)
                        : (row[col.key as keyof T] as React.ReactNode)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          );
        })}
      </div>

      {/* Desktop table */}
      <div
        className={`hide-scrollbar hidden w-full overflow-x-auto overflow-y-hidden md:block ${
          bordered ? "rounded-2xl border border-ink/10 bg-paper" : ""
        }`}
      >
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-ink text-accent">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={`whitespace-nowrap px-4 py-3.5 text-xs font-semibold tracking-[0.08em] uppercase ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  } ${col.className || ""}`}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowClickable = onRowClick ? "cursor-pointer" : "";
              const bgColor =
                striped && rowIndex % 2 === 1 ? "bg-mist/70" : "bg-paper";
              const hoverClass = hover ? "hover:bg-accent/15" : "";
              const customRowClass =
                typeof rowClassName === "function"
                  ? rowClassName(row, rowIndex)
                  : rowClassName || "";

              return (
                <tr
                  key={row._id || rowIndex}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  className={`border-t border-ink/10 transition-colors duration-200 ${bgColor} ${hoverClass} ${rowClickable} ${customRowClass}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key as string}
                      className={`px-4 py-3.5 text-sm text-ink ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                            ? "text-right"
                            : "text-left"
                      }`}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : (row[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UseTable;
