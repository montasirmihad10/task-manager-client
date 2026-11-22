"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";

type TRmPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
};

const UsePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = false,
}: TRmPaginationProps) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: number[] = [];
    const max = 5;

    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = start + max - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - max + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const btnBase =
    "flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition duration-200";

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          className={`${btnBase} border border-ink/15 bg-paper text-ink hover:-translate-y-0.5 hover:border-ink/30`}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      {showFirstLast && currentPage > 3 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className={`${btnBase} text-muted hover:bg-paper`}
          >
            1
          </button>
          <span className="text-muted">...</span>
        </>
      )}

      {getPages().map((page) => (
        <button
          type="button"
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnBase} ${
            page === currentPage
              ? "bg-ink text-accent shadow-sm"
              : "text-muted hover:-translate-y-0.5 hover:bg-paper hover:text-ink"
          }`}
        >
          {page}
        </button>
      ))}

      {showFirstLast && currentPage < totalPages - 2 && (
        <>
          <span className="text-muted">...</span>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className={`${btnBase} text-muted hover:bg-paper`}
          >
            {totalPages}
          </button>
        </>
      )}

      {currentPage < totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          className={`${btnBase} bg-ink text-accent hover:-translate-y-0.5 hover:bg-ink-soft`}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default UsePagination;
