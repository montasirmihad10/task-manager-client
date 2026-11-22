"use client";

import { FormEvent } from "react";
import { Search as SearchIcon } from "lucide-react";

type SearchProps = {
  handleSearch: (e: FormEvent<HTMLFormElement>) => void;
};

export default function Search({ handleSearch }: SearchProps) {
  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
      <div className="relative flex-1">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          name="search"
          placeholder="Search tasks by title..."
          className="w-full rounded-md border border-ink/15 bg-paper py-2.5 pr-3 pl-9 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-accent/40"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-ink-soft"
      >
        Search
      </button>
    </form>
  );
}
