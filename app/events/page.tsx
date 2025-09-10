async function planEvent(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) {
    await fetch("/api/events/plan", { method: "POST", body: JSON.stringify({ id }), headers: { "content-type": "application/json" } });
  }
}

async function applyEvent(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) {
    await fetch("/api/events/apply", { method: "POST", body: JSON.stringify({ id }), headers: { "content-type": "application/json" } });
    await fetch("/api/ops/overlays/build", { method: "POST" });
    await fetch("/api/ops/render/dirty", { method: "POST" });
  }
}

export default function EventsPage() {
  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Events</h2>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <form className="flex flex-wrap items-end gap-3" action={planEvent}>
          <div>
            <label className="block text-xs text-zinc-500">Action ID (without .json)</label>
            <input name="id" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm" placeholder="act_2025_09_08_portgrey_arson" />
          </div>
          <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white">Plan Effects</button>
        </form>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <form className="flex flex-wrap items-end gap-3" action={applyEvent}>
          <div>
            <label className="block text-xs text-zinc-500">Action ID</label>
            <input name="id" className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm" placeholder="act_2025_09_08_portgrey_arson" />
          </div>
          <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white">Apply → Overlays → Render</button>
        </form>
      </div>
    </main>
  );
}
