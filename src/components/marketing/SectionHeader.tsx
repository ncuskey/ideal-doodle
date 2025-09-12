import clsx from "clsx";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: Props) {
  const wrapper = clsx(
    "mx-auto max-w-3xl",
    align === "center" ? "text-center" : "text-left",
    className
  );

  return (
    <div className={wrapper}>
      {eyebrow ? (
        <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-1 font-serif text-3xl md:text-4xl font-semibold tracking-tight">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
