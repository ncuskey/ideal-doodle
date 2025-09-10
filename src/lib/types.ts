export type BurgOverlay = {
  burg_id: number; state_id: number;
  population_multiplier?: number; state_trade_multiplier?: number;
  assets_destroyed?: string[];
  law_enforcement?: { status: "none" | "curfew" | "martial_law_local"; until?: string | null };
  hooks_active?: Array<{ hook_instance_id: string; chain_id: string; hook_template_id: string; rationale?: string; }>;
  generated_at: string; notes?: string[];
};
export type RenderedBurg = {
  burg_id: number; name: string; state_id: number; province_id?: string | null;
  heraldry_path?: string; tags?: string[]; economy_roles?: string[]; problems?: string[];
  religion_presence?: string[]; culture_notes?: string[];
  overlay?: BurgOverlay | null;
  maps?: { city_svg_path?: string; village_svg_path?: string; city_seed?: string; village_seed?: string; watabou_url?: string } | null;
  generated_at: string;
};
export type RenderedState = {
  state_id: number; name: string;
  economy_pillars?: string[]; culture?: any; religion?: any;
  heraldry_path?: string;
  overlay?: { trade_multiplier?: number; law_enforcement?: { status: string; until?: string | null }; reputations?: Array<{ faction: string; score: number }>; generated_at: string } | null;
  generated_at: string;
};
export type MarkerIndex = { markers: Array<{ id: string; name: string; type: string; tags: string[]; legend_text?: string; runes_text?: string; near_burg_ids_hint?: number[] }>; };
export type HookSuggestion = { sugg_id: string; hook_template_id: string; burg_id: number; state_id: number; score?: number; rationale?: string };
export type HookInstance = { hook_instance_id: string; chain_id: string; hook_template_id: string; burg_id: number; state_id: number; status: "available" | "withdrawn" | "active" | "consumed"; rationale?: string };
