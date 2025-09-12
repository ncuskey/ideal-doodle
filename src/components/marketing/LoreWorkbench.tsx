"use client";

import { useState } from "react";
import PromptConsole, { LoreData } from "@/components/marketing/PromptConsole";
import LoreOutputTabs from "@/components/marketing/LoreOutputTabs";
import MapPanel from "@/components/marketing/MapPanel";

export default function LoreWorkbench() {
  const [lore, setLore] = useState<LoreData | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <PromptConsole onResult={setLore} />
      <MapPanel className="z-0" src="/assets/watabou/city/120.svg" label="City Map" />
      <LoreOutputTabs className="relative z-10 mt-3" lore={lore} />
    </div>
  );
}
