"use client";

import { useRouter } from "next/navigation";
import { type FormEvent } from "react";
import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const trimmed = String(data.get("q") ?? "").trim();
    if (!trimmed) return;
    router.push(`/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      action="/search"
      method="get"
      className="w-full max-w-xl mx-auto"
      role="search"
    >
      <label htmlFor="gem-search" className="sr-only">
        Discord username or ID
      </label>
      <div className="glass-strong rounded-2xl flex items-center gap-3 px-5 py-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-400/60 focus-within:border-violet-400/40">
        <Search className="w-5 h-5 text-lavender" aria-hidden="true" />
        <input
          id="gem-search"
          name="q"
          type="text"
          defaultValue={defaultValue}
          placeholder="Discord username or ID"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none text-gem-white placeholder:text-lavender/50 font-mono text-base"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-gem-white text-sm font-semibold tracking-wide transition-all duration-200 hover:brightness-110 cursor-pointer"
        >
          Check
        </button>
      </div>
    </form>
  );
}
