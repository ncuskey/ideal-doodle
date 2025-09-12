import Image from "next/image";
import { cn } from "@/lib/utils";

export type MapPanelProps = {
  src: string;
  alt?: string;
  label?: string;
  caption?: string;
  className?: string;
};

export default function MapPanel({ src, alt = "Map preview", label = "Map", caption, className }: MapPanelProps) {
  return (
    <figure
      className={cn(
        "relative rounded-lg border bg-card p-3 shadow-soft transition-shadow hover:shadow-md",
        className
      )}
    >
      {label ? (
        <figcaption className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-ring">
          {label}
        </figcaption>
      ) : null}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
