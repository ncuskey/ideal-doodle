'use client';
import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgress(){
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.3 });
  return (
    <motion.div style={{ scaleX }} className="fixed left-0 top-0 z-[60] h-1 w-full origin-left bg-blue-600" />
  );
}
