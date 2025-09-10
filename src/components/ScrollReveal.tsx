'use client';
import { motion } from 'framer-motion';

export default function ScrollReveal({ children, delay=0 }:{ children: React.ReactNode; delay?: number }){
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, delay }}
      className="fade-in"
    >
      {children}
    </motion.div>
  );
}
