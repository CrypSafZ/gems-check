import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { ShareActions } from "@/components/ShareActions";
import { GemLogo } from "@/components/GemLogo";
import { getMeta, lookupMember } from "@/lib/lookup";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckPage({ params }: PageProps) {
  const { id } = await params;
  const query = decodeURIComponent(id);
  const member = lookupMember(query);
  const meta = getMeta();

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 sm:py-14">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Back to home"
        >
          <GemLogo size={40} />
          <span className="font-display text-2xl font-semibold text-gem-white group-hover:text-violet-300 transition-colors">
            gems-check
          </span>
        </Link>

        <SearchBar defaultValue={query} />

        <StatCard member={member} query={query} meta={meta} />

        <ShareActions member={member} query={query} />
      </div>

      <footer className="mt-auto pt-16 text-[10px] font-mono uppercase tracking-[0.2em] text-lavender/40">
        0xAlphaGEMs · snapshot preview
      </footer>
    </main>
  );
}
