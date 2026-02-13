"use client";

import { useRef, useEffect, useState } from 'react';
import { Lightning, ThumbsUp, Copy } from '@phosphor-icons/react';
import { motion, useInView } from 'framer-motion';

interface UsageStatsDisplayProps {
  generations: number;
  likes: number;
  copies: number;
  loading?: boolean;
}

function useCountUp(target: number, loading: boolean, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as React.RefObject<Element>, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || loading || target === 0 || hasAnimated.current) return;
    hasAnimated.current = true;

    let start = 0;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }

    requestAnimationFrame(step);
  }, [isInView, loading, target, duration]);

  return { count, ref };
}

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

const stats = [
  { key: 'generations', label: 'Codes Generated', Icon: Lightning, color: 'text-emerald-500' },
  { key: 'likes', label: 'Helpful Votes', Icon: ThumbsUp, color: 'text-emerald-500' },
  { key: 'copies', label: 'Codes Copied', Icon: Copy, color: 'text-emerald-500' },
] as const;

export function UsageStatsDisplay({ generations, likes, copies, loading }: UsageStatsDisplayProps) {
  const values = { generations, likes, copies };

  const genCounter = useCountUp(generations, !!loading);
  const likesCounter = useCountUp(likes, !!loading);
  const copiesCounter = useCountUp(copies, !!loading);

  const counters = [genCounter, likesCounter, copiesCounter];

  return (
    <div className="py-10 px-4 bg-card/40">
      <div className="container mx-auto max-w-4xl">
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-medium text-muted-foreground mb-8 uppercase tracking-widest"
        >
          App Usage Statistics
        </motion.h3>
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {stats.map((stat, i) => {
            const counter = counters[i];
            const displayValue = loading ? "--" : formatNumber(counter.count);

            return (
              <motion.div
                key={stat.key}
                ref={counter.ref}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                className="flex flex-col items-center gap-3 p-4 sm:p-6 rounded-xl bg-background/50 border border-border/30"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.Icon className="h-5 w-5 text-primary" weight="duotone" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums min-w-[2.6ch] text-center">
                  {displayValue}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground text-center">{stat.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
