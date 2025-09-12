import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type LoreData = {
  overview: string;
  places: string[];
  factions: string[];
  hooks: string[];
};

export type LoreOutputTabsProps = {
  lore: LoreData | null;
  className?: string;
};

export default function LoreOutputTabs({ lore, className }: LoreOutputTabsProps) {
  const hasLore = !!lore;
  const safeLore: LoreData = lore ?? {
    overview:
      "No lore generated yet. Choose a seed and model, then press Generate World.",
    places: [],
    factions: [],
    hooks: [],
  };

  return (
    <div className={className}>
      <Tabs defaultValue="hooks">
        <TabsList aria-label="Lore sections" className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="places">Places</TabsTrigger>
          <TabsTrigger value="factions">Factions</TabsTrigger>
          <TabsTrigger value="hooks">Hooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" role="region" aria-label="Overview">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {safeLore.overview}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="places" role="region" aria-label="Places">
          <div className="rounded-lg border bg-card p-4">
            {safeLore.places.length ? (
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
                {safeLore.places.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hasLore ? "No places found in this result." : "Generate to see notable places."}
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="factions" role="region" aria-label="Factions">
          <div className="rounded-lg border bg-card p-4">
            {safeLore.factions.length ? (
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
                {safeLore.factions.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hasLore ? "No factions found in this result." : "Generate to see factions."}
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hooks" role="region" aria-label="Hooks">
          <div className="rounded-lg border bg-card p-4">
            {safeLore.hooks.length ? (
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
                {safeLore.hooks.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {hasLore ? "No hooks found in this result." : "Generate to see adventure hooks."}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
