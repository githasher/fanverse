'use client';

import { useRef, useEffect, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  type Variants
} from 'framer-motion';
import Link from 'next/link';
import {
  Compass,
  Clock,
  Bell,
  Heart,
  Ticket,
  Accessibility,
  ChevronRight,
  Sparkles,
  Zap,
  Users,
  Globe,
  Timer,
  ArrowRight,
  Star,
  Brain,
  MapPin,
  Eye,
  Activity,
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ============================================
   AnimatedCounter Component
   ============================================ */
function AnimatedCounter({
  target,
  suffix = '',
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );
  const [display, setDisplay] = useState(decimals > 0 ? '0.0' : '0');

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, target, {
        duration: 2,
        ease: 'easeOut',
      });
      return controls.stop;
    }
  }, [isInView, motionValue, target]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

/* ============================================
   Floating Particles
   ============================================ */
function FloatingParticles() {
  const particles = [
    { x: '10%', y: '20%', size: 4, delay: 0, duration: 5 },
    { x: '20%', y: '60%', size: 3, delay: 1, duration: 7 },
    { x: '70%', y: '30%', size: 5, delay: 0.5, duration: 6 },
    { x: '80%', y: '70%', size: 3, delay: 2, duration: 8 },
    { x: '50%', y: '15%', size: 4, delay: 1.5, duration: 5.5 },
    { x: '30%', y: '80%', size: 3, delay: 0.8, duration: 7.5 },
    { x: '90%', y: '40%', size: 4, delay: 2.5, duration: 6.5 },
    { x: '15%', y: '45%', size: 3, delay: 1.2, duration: 8.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: i % 3 === 0 ? '#00F5FF' : i % 3 === 1 ? '#FFD700' : '#10B981',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ============================================
   Section Header Component
   ============================================ */
function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      className="text-center mb-16"
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeInUp}
    >
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-[family-name:var(--font-outfit)] font-bold text-white mb-4">
        <span className="gradient-underline">{title}</span>
      </h2>
      {subtitle && (
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-6">{subtitle}</p>
      )}
    </motion.div>
  );
}

/* ============================================
   Main Landing Page
   ============================================ */
export default function LandingPage() {
  return (
    <main className="relative bg-[#0A0E27]">
      <HeroSection />
      <StatsBar />
      <JourneySection />
      <FeaturesGrid />
      <ArchitectureSection />
      <CTASection />
      <Footer />
    </main>
  );
}

/* ============================================
   Hero Section
   ============================================ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden stadium-grid">
      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(0,245,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(255,215,0,0.06),transparent_50%)]" />

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Stadium silhouette arc */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[300px] rounded-[50%] border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Gemini Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-[#00F5FF]/20 text-sm text-[#00F5FF] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles className="w-4 h-4" />
          <span>Powered by Google Gemini AI</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-[family-name:var(--font-outfit)] font-black tracking-tight leading-none mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="block text-7xl md:text-8xl lg:text-9xl bg-gradient-to-r from-[#00F5FF] via-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent">
            FANVERSE
          </span>
          <span className="block text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-[#FFD700] to-[#00F5FF] bg-clip-text text-transparent mt-2">
            AI
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-3 font-[family-name:var(--font-outfit)] font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Your Personal FIFA Stadium Intelligence Agent
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-gray-500 italic text-base md:text-lg mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          An AI that thinks ahead, not just answers questions
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <Link href="/dashboard">
            <motion.div
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#00C4CC] text-black font-semibold text-lg shadow-[0_0_30px_rgba(0,245,255,0.3)] hover:shadow-[0_0_50px_rgba(0,245,255,0.5)] transition-shadow duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter Stadium
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </Link>
          <motion.button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-5 h-5" />
            Watch Demo
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#00F5FF]"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}

/* ============================================
   Stats Bar
   ============================================ */
function StatsBar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const stats = [
    { value: 82500, suffix: '+', label: 'Fans Guided', icon: Users, decimals: 0 },
    { value: 7, suffix: '', label: 'Languages', icon: Globe, decimals: 0 },
    { value: 45, suffix: ' min', label: 'Avg Time Saved', icon: Timer, decimals: 0 },
    { value: 99.9, suffix: '%', label: 'Uptime', icon: Activity, decimals: 1 },
  ];

  return (
    <section className="relative py-16 -mt-20 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-[#00F5FF]/20 hover:bg-white/[0.07] transition-all duration-300"
                variants={fadeInUp}
              >
                <Icon className="w-6 h-6 text-[#00F5FF] mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-outfit)] mb-1">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   Journey Section (4 Phases)
   ============================================ */
function JourneySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const phases = [
    {
      number: '01',
      icon: MapPin,
      title: 'Before Match',
      features: [
        'AI parking guidance',
        'Real-time transit updates',
        'Pre-match atmosphere alerts',
        'Personalized arrival time',
      ],
      accent: '#00F5FF',
    },
    {
      number: '02',
      icon: Ticket,
      title: 'Entering Stadium',
      features: [
        'Fastest gate finder',
        'Digital ticket AI assist',
        'Queue time predictions',
        'VIP route optimization',
      ],
      accent: '#10B981',
    },
    {
      number: '03',
      icon: Compass,
      title: 'Inside Stadium',
      features: [
        'Smart food ordering',
        'Restroom wait times',
        'Seat upgrade alerts',
        'Live atmosphere heatmap',
      ],
      accent: '#FFD700',
    },
    {
      number: '04',
      icon: Star,
      title: 'After Match',
      features: [
        'Fastest exit routes',
        'Transport coordination',
        'Match highlights recap',
        'Next match suggestions',
      ],
      accent: '#EF4444',
    },
  ];

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Your Stadium Journey"
          subtitle="From arrival to departure, AI guides every moment of your matchday experience"
        />

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {phases.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <motion.div key={i} className="relative" variants={fadeInUp}>
                {/* Connector arrow (desktop only) */}
                {i < phases.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-white/20">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}

                <motion.div
                  className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group"
                  whileHover={{
                    scale: 1.02,
                    borderColor: phase.accent + '40',
                    boxShadow: `0 0 30px ${phase.accent}15`,
                  }}
                >
                  {/* Phase number */}
                  <span
                    className="text-xs font-bold tracking-widest mb-4 block"
                    style={{ color: phase.accent }}
                  >
                    PHASE {phase.number}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: phase.accent + '15' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: phase.accent }} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-4 font-[family-name:var(--font-outfit)]">
                    {phase.title}
                  </h3>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {phase.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: phase.accent }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   AI Features Grid
   ============================================ */
function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Compass,
      title: 'AI Dynamic Navigation',
      desc: 'Real-time pathfinding that adapts to crowd density, closures, and your preferences. Never get lost in the stadium.',
    },
    {
      icon: Clock,
      title: 'Predictive Queue Intelligence',
      desc: 'Know wait times before you walk. AI predicts queue lengths for food, restrooms, and merch with 94% accuracy.',
    },
    {
      icon: Bell,
      title: 'Proactive Notifications',
      desc: 'Get alerts before you need them. Weather changes, crowd surges, special moments — AI anticipates your needs.',
    },
    {
      icon: Heart,
      title: 'Personalized Recommendations',
      desc: 'Food, merch, experiences tailored to your preferences, dietary needs, and past behavior. Your stadium, your way.',
    },
    {
      icon: Ticket,
      title: 'Ticket-to-Seat Intelligence',
      desc: 'From parking lot to your exact seat — one seamless AI-guided journey with turn-by-turn stadium navigation.',
    },
    {
      icon: Accessibility,
      title: 'Accessibility AI',
      desc: 'Wheelchair routes, sensory-friendly zones, assistance alerts, and inclusive navigation for every fan.',
    },
  ];

  return (
    <section className="relative py-24 md:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,245,255,0.04),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Intelligent Features"
          subtitle="Six AI-powered capabilities that transform your stadium experience"
        />

        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-[#00F5FF]/30 hover:shadow-[0_0_40px_rgba(0,245,255,0.08)] transition-all duration-300"
                variants={fadeInUp}
                whileHover={{ y: -4 }}
              >
                {/* Icon container */}
                <div className="w-14 h-14 rounded-2xl bg-[#00F5FF]/10 flex items-center justify-center mb-5 group-hover:bg-[#00F5FF]/15 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-[#00F5FF]" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-outfit)]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   Architecture Section
   ============================================ */
function ArchitectureSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const agents = [
    { name: 'Navigation Agent', icon: Compass, color: '#00F5FF', desc: 'Pathfinding & routing' },
    { name: 'Crowd Agent', icon: Users, color: '#10B981', desc: 'Density & flow analysis' },
    { name: 'Recommendation Agent', icon: Star, color: '#FFD700', desc: 'Personalized suggestions' },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 stadium-grid-dense" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Multi-Agent Architecture"
          subtitle="A coordinated system of specialized AI agents working together"
        />

        <motion.div
          ref={ref}
          className="relative"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          {/* Fan Node */}
          <motion.div className="flex justify-center mb-6" variants={scaleIn}>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-xl border-2 border-[#00F5FF]/50 flex items-center justify-center pulse-glow">
                <Users className="w-8 h-8 text-[#00F5FF]" />
              </div>
              <span className="text-sm font-medium text-white mt-2 font-[family-name:var(--font-outfit)]">
                Fan
              </span>
            </div>
          </motion.div>

          {/* Connection line down */}
          <motion.div
            className="flex justify-center mb-6"
            variants={fadeIn}
          >
            <div className="w-px h-12 connection-line relative">
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-[#00F5FF] -left-[3px]"
                animate={{ y: [0, 40, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

          {/* AI Orchestrator */}
          <motion.div className="flex justify-center mb-6" variants={scaleIn}>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-10 py-6 text-center max-w-sm w-full">
              {/* Gradient border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00F5FF]/20 to-[#FFD700]/20 blur-xl opacity-30" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00F5FF]/20 to-[#FFD700]/20 flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-7 h-7 text-[#00F5FF]" />
                </div>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                  AI Orchestrator
                </h3>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Sparkles className="w-3 h-3 text-[#FFD700]" />
                  <span className="text-xs text-gray-400">Powered by Gemini</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Connection lines to agents */}
          <motion.div
            className="flex justify-center mb-6"
            variants={fadeIn}
          >
            <div className="relative w-full max-w-lg">
              {/* Center line down */}
              <div className="absolute left-1/2 -translate-x-1/2 w-px h-12 connection-line">
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-[#00F5FF] -left-[3px]"
                  animate={{ y: [0, 40, 0] }}
                  transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              {/* Horizontal line */}
              <div className="absolute top-12 left-[16.66%] right-[16.66%] h-px connection-line-horizontal" />
              {/* Left vertical */}
              <div className="absolute top-12 left-[16.66%] w-px h-8 connection-line">
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-[#00F5FF] -left-[3px]"
                  animate={{ y: [0, 24, 0] }}
                  transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              {/* Right vertical */}
              <div className="absolute top-12 right-[16.66%] w-px h-8 connection-line">
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-[#FFD700] -left-[3px]"
                  animate={{ y: [0, 24, 0] }}
                  transition={{ duration: 2, delay: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              {/* Center vertical */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-8 connection-line">
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-[#10B981] -left-[3px]"
                  animate={{ y: [0, 24, 0] }}
                  transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="h-20" />
            </div>
          </motion.div>

          {/* Agent Nodes */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            variants={staggerContainer}
          >
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={i}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center hover:border-white/20 transition-all duration-300"
                  variants={scaleIn}
                  whileHover={{ scale: 1.03 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: agent.color + '15' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: agent.color }} />
                  </div>
                  <h4 className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                    {agent.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{agent.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Connection down to stadium layer */}
          <motion.div className="flex justify-center mb-6" variants={fadeIn}>
            <div className="w-px h-8 connection-line" />
          </motion.div>

          {/* Stadium Intelligence Layer */}
          <motion.div variants={scaleIn}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 px-6 flex items-center justify-center gap-3">
              <Activity className="w-5 h-5 text-[#00F5FF] pulse-dot" />
              <span className="text-sm font-semibold text-white font-[family-name:var(--font-outfit)]">
                Stadium Intelligence Layer
              </span>
              <div className="flex gap-1.5 ml-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#00F5FF]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#10B981]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-[#FFD700]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================
   CTA Section
   ============================================ */
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,245,255,0.08),transparent_60%)]" />

      <motion.div
        ref={ref}
        className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl md:text-5xl font-[family-name:var(--font-outfit)] font-bold text-white mb-8 leading-tight"
          variants={fadeInUp}
        >
          Ready to Experience the Future of{' '}
          <span className="bg-gradient-to-r from-[#00F5FF] to-[#FFD700] bg-clip-text text-transparent">
            Stadium Navigation
          </span>
          ?
        </motion.h2>

        <motion.div variants={fadeInUp}>
          <Link href="/dashboard">
            <motion.div
              className="inline-flex items-center gap-2 px-12 py-5 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#00C4CC] text-black font-semibold text-lg shadow-[0_0_40px_rgba(0,245,255,0.3)] hover:shadow-[0_0_60px_rgba(0,245,255,0.5)] transition-shadow duration-300 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="w-5 h-5" />
              Get Started
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mt-8"
          variants={fadeInUp}
        >
          <Sparkles className="w-4 h-4 text-[#FFD700]" />
          Powered by Google Gemini AI
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ============================================
   Footer
   ============================================ */
function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-white/[0.02] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left - Logo */}
          <div>
            <h3 className="text-2xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-[#00F5FF] to-[#FFD700] bg-clip-text text-transparent">
              FANVERSE AI
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Built for FIFA World Cup 2026
            </p>
          </div>

          {/* Center - Links */}
          <div className="flex items-center justify-center gap-8">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-[#00F5FF] transition-colors text-sm"
            >
              Dashboard
            </Link>
            <a
              href="#features"
              className="text-gray-400 hover:text-[#00F5FF] transition-colors text-sm"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-400 hover:text-[#00F5FF] transition-colors text-sm"
            >
              About
            </a>
          </div>

          {/* Right - Powered by */}
          <div className="flex items-center justify-end gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            Powered by Google Gemini AI
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="border-t border-white/5 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2026 FANVERSE AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
