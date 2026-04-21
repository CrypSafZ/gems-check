import Image from "next/image";
import { cn } from "@/lib/utils";

export function GemLogo({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/gem.jpg"
        alt="AlphaGEMs"
        width={size}
        height={size}
        className="rounded-full gem-glow"
        priority
      />
    </div>
  );
}
