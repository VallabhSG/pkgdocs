"use client";

import Link from "next/link";
import { motion } from "motion/react";

type HeroSectionProps = {
  packageCount: number;
  pypiCount: number;
  npmCount: number;
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function HeroSection({ packageCount, pypiCount, npmCount }: HeroSectionProps) {
  return (
    <section className="bg-white border-b border-warm-200">
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-22">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="flex items-center gap-2.5 mb-7"
        >
          <span className="w-5 h-px bg-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-[0.15em]">
            Visual Package Documentation
          </span>
        </motion.div>

        {/* Headline — plain, confident, no gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.07 }}
          className="text-5xl sm:text-6xl lg:text-[4.25rem] font-extrabold text-warm-950 leading-[1.06] tracking-tight text-balance mb-6"
        >
          Package docs that
          <br />
          <span className="relative inline-block">
            actually make sense
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-0 right-0 h-[3px] rounded-full bg-accent"
            />
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.14 }}
          className="max-w-xl text-lg text-warm-500 leading-relaxed mb-9"
        >
          Every package explained with a story, a visual API map, a live demo,
          and copy-paste recipes — for beginners and experts alike.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
          className="flex items-center gap-5 text-sm text-warm-400 mb-10"
        >
          <span>
            <strong className="text-warm-900 font-bold tabular-nums">{packageCount}</strong>
            {" "}packages
          </span>
          <span className="text-warm-200 select-none">·</span>
          <span>
            <strong className="text-blue-600 font-semibold tabular-nums">{pypiCount}</strong>
            {" "}Python
          </span>
          <span className="text-warm-200 select-none">·</span>
          <span>
            <strong className="text-rose-500 font-semibold tabular-nums">{npmCount}</strong>
            {" "}npm
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.26 }}
          className="flex flex-col sm:flex-row items-start gap-3"
        >
          <Link
            href="#search"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Browse {packageCount} packages
          </Link>
          <a
            href="https://github.com/VallabhSG/pkgdocs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg text-warm-600 hover:text-warm-950 hover:bg-warm-100 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Star on GitHub
          </a>
        </motion.div>

      </div>
    </section>
  );
}
