import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function FeatureCard({ title, icon, children, className }: Props) {
  return (
    <div className={clsx("rounded-lg border bg-card p-4 shadow-soft transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground"
        >
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold font-serif">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{children}</p>
        </div>
      </div>
    </div>
  );
}
