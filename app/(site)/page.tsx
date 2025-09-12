// app/(site)/page.tsx – Lore UI landing per philosophy
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/marketing/SectionHeader";
import FeatureCard from "@/components/marketing/FeatureCard";
import MapPanel from "@/components/marketing/MapPanel";
import LoreWorkbench from "@/components/marketing/LoreWorkbench";
import { Sparkles, Layout, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <main className="space-y-24">
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <p className="text-sm font-semibold text-primary">Generate</p>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight">
              Generate rich lore for your fantasy world.
            </h1>
            <p className="lead">
              Warm parchment UI, accessible primitives, and a clean, focused workflow for worldbuilders.
            </p>
            <div className="flex gap-3">
              <a href="#workbench">
                <Button size="lg" aria-label="Jump to the generator">
                  Generate World
                </Button>
              </a>
              <a href="#how">
                <Button size="lg" variant="secondary" aria-label="Learn how it works">
                  How it works
                </Button>
              </a>
            </div>
          </div>
          <MapPanel
            src="/assets/watabou/city/120.svg"
            label="City Map"
            caption="Watabou mock map used for preview"
          />
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <SectionHeader
          eyebrow="Why this surface"
          title="Old atlas meets clean app"
          subtitle="Tokens drive the look, shadcn primitives keep it accessible, and motion stays subtle."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard title="Token-first theming" icon={<Layers />}>
            Parchment background, royal purple primary, and radius via a single variable.
          </FeatureCard>
          <FeatureCard title="Composable primitives" icon={<Layout />}>
            Tabs, buttons, cards—consistent, semantic building blocks from shadcn/ui.
          </FeatureCard>
          <FeatureCard title="Tasteful motion" icon={<Sparkles />}>
            Soft shadows, gentle entrances, and full reduced-motion support.
          </FeatureCard>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container">
        <SectionHeader
          title="How it works"
          subtitle="Pick a seed, choose a model, and generate. Refine places, factions, and hooks via tabs."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <FeatureCard title="1. Pick a seed" icon={<Layers />}>
            Choose a starting region or world seed to guide generation.
          </FeatureCard>
          <FeatureCard title="2. Choose a model" icon={<Layout />}>
            Balance speed and creativity to fit the prep task at hand.
          </FeatureCard>
          <FeatureCard title="3. Generate & refine" icon={<Sparkles />}>
            Review overview, places, factions, and hooks; iterate quickly.
          </FeatureCard>
        </div>
      </section>

      {/* Generator + Map + Output */}
      <section id="workbench" className="container">
        <SectionHeader
          align="left"
          eyebrow="Workbench"
          title="Generator and output"
          subtitle="Use the console to produce mock lore, view a map preview, and browse results across tabs."
        />
        <div className="mt-8">
          <LoreWorkbench />
        </div>
      </section>
    </main>
  );
}
