// app/(site)/home/page.tsx
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/marketing/SectionHeader";
import FeatureCard from "@/components/marketing/FeatureCard";
import { Sparkles, Layout, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <main className="space-y-24">
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold text-primary">Introducing</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Build beautiful UIs, faster.
            </h1>
            <p className="lead">
              Opinionated tokens, accessible components, and a clean layout system. Ship a polished UI today.
            </p>
            <div className="flex gap-3">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="secondary">
                Live Demo
              </Button>
            </div>
          </div>
          <div className="animate-fade-in-up rounded-2xl border bg-card p-6 shadow-soft">
            {/* Replace this box with your real preview */}
            <div className="aspect-video rounded-xl bg-gradient-to-br from-accent/50 to-primary/10" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <SectionHeader
          eyebrow="Why this stack"
          title="Designed for velocity and polish"
          subtitle="Tokens map to CSS variables, components use shadcn, and Tailwind keeps everything consistent."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard title="Practical tokens" icon={<Layers />}>
            One source of truth for colors, borders, radii, and shadows—dark mode included.
          </FeatureCard>
          <FeatureCard title="Composable primitives" icon={<Layout />}>
            shadcn/ui + Tailwind = fast iteration and consistent accessibility.
          </FeatureCard>
          <FeatureCard title="Tasteful motion" icon={<Sparkles />}>
            Subtle enter animations and hover states—no jank, no clutter.
          </FeatureCard>
        </div>
      </section>

      {/* CTA */}
      <section className="container-tight pb-24 text-center">
        <SectionHeader
          title="Ready to redesign your UI?"
          subtitle="Keep the stack; upgrade the experience. Start with the hero, ship in slices."
        />
        <div className="mt-6">
          <Button size="lg">Start the redesign</Button>
        </div>
      </section>
    </main>
  );
}
