'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ParallaxHero({ mapUrl }: { mapUrl?: string }) {
  const { scrollYProgress } = useScroll();
  // Parallax factors (reduced on prefers-reduced-motion)
  const [factor, setFactor] = useState(1);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setFactor(mq.matches ? 0.25 : 1);
    update(); mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const yBg = useTransform(scrollYProgress, [0, 1], [0, 100 * factor]);
  const yMap = useTransform(scrollYProgress, [0, 1], [0, 60 * factor]);
  const yFg = useTransform(scrollYProgress, [0, 1], [0, 30 * factor]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.25], [1, 0.6]);

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-50 to-white">
      {/* Background gradient blur */}
      <motion.div style={{ y: yBg }} aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-x-20 -top-24 h-64 rounded-full bg-blue-200 blur-3xl opacity-40" />
      </motion.div>

      {/* World map layer */}
      {mapUrl && (
        <motion.img
          src={mapUrl}
          alt="World map backdrop"
          className="pointer-events-none mx-auto mt-6 h-[38vh] w-auto max-w-4xl object-contain opacity-90"
          style={{ y: yMap }}
        />
      )}

      {/* Copy + CTA */}
      <motion.div style={{ y: yFg, opacity: opacityTitle }} className="relative z-10 px-6 pb-16 text-center sm:px-10">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Build a living world. Explore it like a player.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Scroll to descend from world canon → states → provinces → burgs.
          Hooks, markers, heraldry, and maps appear in context.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/states" className="rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">Explore States</a>
          <a href="/hooks" className="rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-500">Quest Hooks</a>
        </div>
        <div className="mt-10 flex items-center justify-center text-xs text-zinc-500" aria-hidden>
          <span className="mr-2">Scroll</span>
          <svg width="18" height="18" viewBox="0 0 24 24" className="animate-bounce"><path fill="currentColor" d="M12 16l-6-6h12z"/></svg>
        </div>
      </motion.div>
    </section>
  );
}
