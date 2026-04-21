import Link from "next/link";
import { GemLogo } from "@/components/GemLogo";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-6 max-w-lg">
        <GemLogo size={64} />
        <h1 className="font-display text-5xl font-semibold text-gem-white">
          404
        </h1>
        <p className="text-lavender/80">
          That page doesn&apos;t live in the cave.
        </p>
        <Link
          href="/"
          className="px-5 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-gem-white text-sm font-semibold hover:brightness-110 transition-all duration-200"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
