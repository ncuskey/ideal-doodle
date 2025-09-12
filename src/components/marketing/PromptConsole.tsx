"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "@/components/ui/Button";

export type GenerateParams = {
  seed: string;
  model: string;
};

export type LoreData = {
  overview: string;
  places: string[];
  factions: string[];
  hooks: string[];
};

export type PromptConsoleProps = {
  onGenerate?: (params: GenerateParams) => Promise<LoreData>;
  onResult?: (lore: LoreData) => void;
  defaultSeed?: string;
  defaultModel?: string;
  className?: string;
};

const schema = z.object({
  seed: z.string().min(1, "Choose a seed"),
  model: z.string().min(1, "Choose a model"),
});

const SEEDS = [
  { label: "Southia", value: "southia" },
  { label: "Northreach", value: "northreach" },
  { label: "Eastrun", value: "eastrun" },
  { label: "Westerfell", value: "westerfell" },
];

const MODELS = [
  { label: "Fast (Mock-1)", value: "mock-fast" },
  { label: "Balanced (Mock-2)", value: "mock-balanced" },
  { label: "Creative (Mock-3)", value: "mock-creative" },
];

async function mockGenerate({ seed, model }: GenerateParams): Promise<LoreData> {
  // simple deterministic mock for demo; replace with server action when available
  const tone =
    model === "mock-creative"
      ? "whimsical"
      : model === "mock-balanced"
      ? "grounded"
      : "concise";
  const title = seed[0].toUpperCase() + seed.slice(1);
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          overview: `${title} is a ${tone} realm of old roads, river trade, and watchful heraldry. The capital keeps ancient customs while frontier burgs barter news and grain.`,
          places: [
            "Highmarsh, a river port famed for indigo-dyed sails.",
            "Stonebridge Pass, the only safe route through the Greyback Hills.",
            "The Lanternfields, wheat plains that glow with fireflies at dusk.",
          ],
          factions: [
            "The Ledger Guild, scribes who arbitrate trade disputes.",
            "Wardens of the Greyback, rangers sworn to keep roads open.",
            "Circle of Lanterns, a benevolent order funding granaries and waystations.",
          ],
          hooks: [
            "A vanished caravan leaves heraldry scraps near Stonebridge.",
            "A border burg claims its well runs warm with 'omens.'",
            "Guild ledgers show duplicate seals—perfect for a forgery plot.",
          ],
        }),
      650
    )
  );
}

export default function PromptConsole({
  onGenerate,
  onResult,
  defaultSeed = SEEDS[0].value,
  defaultModel = MODELS[1].value,
  className,
}: PromptConsoleProps) {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const { register, handleSubmit, formState, setError } = useForm<GenerateParams>({
    defaultValues: { seed: defaultSeed, model: defaultModel },
    mode: "onSubmit",
  });

  const submit = async (data: GenerateParams) => {
    // zod validation without adding @hookform/resolvers
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as "seed" | "model", { message: issue.message });
      }
      setStatus("error");
      return;
    }
    try {
      setStatus("pending");
      const gen = onGenerate ?? mockGenerate;
      const result = await gen(parsed.data);
      onResult?.(result);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const disabled = status === "pending" || formState.isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={`rounded-lg border bg-card p-4 shadow-soft ${className || ""}`}
      noValidate
      aria-describedby="console-status"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="seed" className="text-sm font-medium">
              Seed
            </label>
            <select
              id="seed"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("seed")}
              disabled={disabled}
              aria-invalid={!!formState.errors.seed}
              aria-describedby={formState.errors.seed ? "seed-error" : undefined}
            >
              {SEEDS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {formState.errors.seed ? (
              <p id="seed-error" className="mt-1 text-xs text-destructive">
                {formState.errors.seed.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="model" className="text-sm font-medium">
              Model
            </label>
            <select
              id="model"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("model")}
              disabled={disabled}
              aria-invalid={!!formState.errors.model}
              aria-describedby={formState.errors.model ? "model-error" : undefined}
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {formState.errors.model ? (
              <p id="model-error" className="mt-1 text-xs text-destructive">
                {formState.errors.model.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            size="lg"
            type="submit"
            aria-label="Generate world from seed and model"
            disabled={disabled}
          >
            {disabled ? "Generating…" : "Generate World"}
          </Button>
          <span
            id="console-status"
            role="status"
            aria-live="polite"
            className="text-sm text-muted-foreground"
          >
            {status === "pending" ? "Working on your lore…" : status === "done" ? "Done." : "\u00A0"}
          </span>
        </div>
      </div>
    </form>
  );
}
