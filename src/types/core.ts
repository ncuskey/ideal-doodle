export type Id = number | string;
export interface WorldFacts { mapName: string; year: number; era: string; }
export interface StateFacts {
  id: number; name: string; color?: string;
  capitalBurgId?: number|null; neighbors?: number[];
  population?: number; area?: number; military?: number;
}
export interface BurgFacts {
  id: number; name: string; stateId?: number|null; pop?: number;
  port?: boolean; x?: number; y?: number; cell?: number;
}
