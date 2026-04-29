import type { Metadata } from "next";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { ShareActions } from "@/components/ShareActions";
import { GemLogo } from "@/components/GemLogo";
import {
  getMeta,
  getRoles,
  lookupMember,
  lookupOverride,
  normalizeQuery,
} from "@/lib/lookup";
import { tierForRank } from "@/lib/tiers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const query = normalizeQuery(id);
  const member = lookupMember(query);
  const override = lookupOverride(member?.username ?? query);
  const baseTier = tierForRank(member?.rank ?? null);
  const tier = {
    ...baseTier,
    label: override?.customLabel?.trim() || baseTier.label,
    title: override?.customTitle?.trim() || baseTier.title,
    roast: override?.customRoast?.trim() || baseTier.roast,
  };
  const label = tier.label.replace(/^[^A-Za-z]+/, "").trim();

  const title = member
    ? `@${member.username} — ${label} · gems-check`
    : `@${query} — ${label} · gems-check`;

  const description = member
    ? `Rank #${member.rank} in AlphaGEMs · ${member.msgAll.toLocaleString()} messages all-time. ${tier.roast}`
    : tier.roast;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/card/${encodeURIComponent(query)}`,
          width: 1200,
          height: 675,
          alt: `${query} — ${label}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/card/${encodeURIComponent(query)}`],
    },
  };
}

export default async function CheckPage({ params }: PageProps) {
  const { id } = await params;
  const query = normalizeQuery(id);
  const member = lookupMember(query);
  const meta = getMeta();
  const override = lookupOverride(member?.username ?? query);
  const roles = member ? getRoles(member.roleIds) : [];

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 sm:py-14">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Back to home"
        >
          <GemLogo size={40} />
          <span className="font-heading text-base sm:text-lg font-black uppercase tracking-tight text-gem-white group-hover:text-violet-300 transition-colors">
            GEM Unemployment{" "}
            <span className="italic font-display font-bold normal-case text-violet-300/95">
              checker
            </span>
          </span>
        </Link>

        <SearchBar defaultValue={query} />

        <StatCard
          member={member}
          query={query}
          meta={meta}
          override={override}
          roles={roles}
        />

        <ShareActions member={member} query={query} />
      </div>

      <footer className="mt-auto pt-16 flex flex-col items-center gap-2 text-center">
        <a
          href="https://x.com/0xAlphaGEMs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold text-gem-white hover:bg-violet-500/20 hover:text-violet-100 transition-all duration-200"
        >
          <span className="text-violet-300">𝕏</span>
          <span>@0xAlphaGEMs</span>
        </a>
      </footer>
    </main>
  );
}
