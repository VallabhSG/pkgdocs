'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { cn } from '@/lib/utils';

const itemVariants: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
  },
};

const transitionVariants = { item: itemVariants };

type HeroSectionProps = {
  packageCount: number;
  pypiCount: number;
  npmCount: number;
};

export function HeroSection({ packageCount, pypiCount, npmCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Decorative radial blobs */}
      <div
        aria-hidden
        className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
      >
        <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(245,80%,70%,.1)_0,hsla(245,60%,50%,.03)_50%,transparent_80%)]" />
        <div className="h-[80rem] absolute right-0 top-0 w-56 rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(270,80%,70%,.07)_0,transparent_100%)] [translate:-5%_-50%]" />
      </div>

      {/* Night-sky background (dark only) */}
      <AnimatedGroup
        variants={{ container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1.5 } } }, item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.3, duration: 2 } } } }}
        className="absolute inset-0 -z-20 pointer-events-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
          alt=""
          aria-hidden
          className="absolute inset-x-0 top-0 -z-20 w-full h-full object-cover opacity-30"
          width="3276"
          height="4095"
        />
      </AnimatedGroup>

      {/* Bottom fade-out to bg-slate-50 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,rgb(2,6,23)_75%)] pointer-events-none"
      />

      <div className="relative mx-auto max-w-5xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="text-center">

          {/* Announcement pill */}
          <AnimatedGroup variants={transitionVariants}>
            <Link
              href="#search"
              className="group mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-1.5 shadow-md shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800/60 mb-8"
            >
              <span className="text-sm text-slate-300">
                <span className="text-indigo-400 font-semibold">{pypiCount} Python</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-rose-400 font-semibold">{npmCount} npm</span>
                <span className="text-slate-400 ml-2">packages</span>
              </span>
              <div className="flex size-5 items-center justify-center rounded-full bg-slate-700 group-hover:bg-indigo-600 transition-colors duration-300">
                <ArrowRight className="size-3 text-slate-300" />
              </div>
            </Link>

            {/* Headline */}
            <h1 className="mt-2 text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.07] tracking-tight text-balance">
              Package docs that
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                actually make sense
              </span>
            </h1>

            {/* Sub */}
            <p className="mx-auto mt-7 max-w-2xl text-lg text-slate-400 leading-relaxed text-balance">
              Every package explained with a story, a visual API map, a live demo,
              and copy-paste recipes — for beginners and experts alike.
            </p>
          </AnimatedGroup>

          {/* CTA buttons */}
          <AnimatedGroup
            variants={{
              container: { visible: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } } },
              ...transitionVariants,
            }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-0.5">
              <Button asChild size="lg" className="rounded-xl px-6 font-semibold gap-2 text-base">
                <Link href="#search">
                  <Package className="size-4" />
                  Browse {packageCount} packages
                </Link>
              </Button>
            </div>
            <Button asChild size="lg" variant="ghost" className="h-11 rounded-xl px-5 gap-2">
              <a href="https://github.com/VallabhSG/pkgdocs" target="_blank" rel="noopener noreferrer">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Star on GitHub
              </a>
            </Button>
          </AnimatedGroup>

          {/* Feature pills row */}
          <AnimatedGroup
            preset="blur-slide"
            variants={{ container: { visible: { transition: { staggerChildren: 0.08, delayChildren: 1.0 } } } }}
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
          >
            {[
              { icon: '📖', label: 'Story View' },
              { icon: '▶', label: 'Live Demos' },
              { icon: '🗺', label: 'API Maps' },
              { icon: '⚡', label: 'Recipes' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/40 px-3.5 py-1.5 text-sm text-slate-400 backdrop-blur-sm"
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </AnimatedGroup>

        </div>
      </div>
    </section>
  );
}
