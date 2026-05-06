'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { Search, Cpu, Laptop, Settings, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [niche, setNiche] = useState('ALL');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery)}&niche=${niche}`;
    }
  };

  const niches = [
    {
      id: 'electronics',
      name: 'Electronics & Components',
      description: 'Semiconductors, PCBs, active & passive electronic components, microcontrollers, and sensors.',
      icon: Cpu,
      color: 'from-blue-600 to-indigo-500',
      shadow: 'shadow-blue-500/20'
    },
    {
      id: 'computers',
      name: 'Computers & IT Hardware',
      description: 'Enterprise servers, networking hardware, workstations, bulk storage devices, and peripherals.',
      icon: Laptop,
      color: 'from-indigo-600 to-purple-500',
      shadow: 'shadow-indigo-500/20'
    },
    {
      id: 'mechanical',
      name: 'Mechanical Parts & Components',
      description: 'Industrial fasteners, bearings, precision gears, custom CNC machined parts, and hydraulic valves.',
      icon: Settings,
      color: 'from-violet-600 to-fuchsia-500',
      shadow: 'shadow-violet-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-8 bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border-b border-zinc-200/50 dark:border-zinc-800/50">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="mx-auto max-w-5xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-6 shadow-sm border border-indigo-100/50 dark:border-indigo-900/30">
              <Zap className="h-3 w-3 fill-current" />
              <span>Scale Your Business with TATAmart</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-hero text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950 bg-clip-text text-transparent dark:from-white dark:via-zinc-200 dark:to-white leading-tight sm:leading-none"
          >
            India's Premium B2B<br />Industrial Marketplace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-medium"
          >
            Connect directly with verified wholesale sellers and manufacturers of high-end electronics, enterprise IT hardware, and high-precision mechanical components.
          </motion.p>

          {/* Advanced Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-10 max-w-3xl"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-2 shadow-xl shadow-zinc-200/50 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none">
              <div className="flex items-center flex-1 px-3">
                <Search className="h-5 w-5 text-zinc-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What industrial components are you looking for?"
                  className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder-zinc-400 dark:text-white"
                  id="input-search-hero"
                />
              </div>

              <div className="flex items-center sm:border-l sm:border-zinc-200/80 sm:dark:border-zinc-800 px-3 py-2 sm:py-0">
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-zinc-600 outline-none cursor-pointer dark:text-zinc-400"
                  id="select-niche-hero"
                >
                  <option value="ALL">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="computers">Computers & IT</option>
                  <option value="mechanical">Mechanical</option>
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-500/30"
                id="btn-search-hero"
              >
                <span>Search Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 3 Industry Niches Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-inter text-3xl font-extrabold tracking-tight dark:text-white">
            Three Core Industrial Niches
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 font-medium">
            We specialize specifically in high-value, complex supply chain sectors to offer unparalleled relational trade and parts discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {niches.map((n, idx) => {
            const Icon = n.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative flex flex-col justify-between rounded-3xl bg-white p-8 shadow-md border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 hover:shadow-xl hover:border-indigo-500/20 dark:hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${n.color} text-white shadow-lg ${n.shadow} mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-inter text-lg font-bold text-zinc-900 dark:text-white mb-3">
                    {n.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {n.description}
                  </p>
                </div>
                <Link
                  href={`/products?niche=${n.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mt-6 group-hover:translate-x-1 transition-transform"
                  id={`link-niche-${n.id}`}
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Feature stats */}
      <section className="bg-zinc-900 py-16 dark:bg-zinc-900/40 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-hero text-3xl font-extrabold">100% Verified</span>
            <span className="text-sm text-zinc-400 mt-1 font-medium">All manufacturers undergo GST & physical audits</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <Zap className="h-6 w-6" />
            </div>
            <span className="font-hero text-3xl font-extrabold">&lt; 4 Hours</span>
            <span className="text-sm text-zinc-400 mt-1 font-medium">Average RFQ callback response time from sellers</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <Users className="h-6 w-6" />
            </div>
            <span className="font-hero text-3xl font-extrabold">10,000+ Active</span>
            <span className="text-sm text-zinc-400 mt-1 font-medium">Sellers, Buyers, and Enterprise Procurement teams</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="font-footer border-t border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-zinc-500 dark:text-zinc-500">
          <span className="font-bold bg-gradient-to-r from-zinc-800 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:to-zinc-600">
            TATAmart © 2026. Built for Enterprises.
          </span>
          <div className="flex space-x-6 font-semibold">
            <Link href="/privacy" className="hover:text-zinc-800 dark:hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-800 dark:hover:text-zinc-300">Terms of Trade</Link>
            <Link href="/support" className="hover:text-zinc-800 dark:hover:text-zinc-300">Support Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
