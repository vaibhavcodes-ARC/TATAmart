'use client';

import React from 'react';
import Header from '../../components/Header';
import { motion } from 'framer-motion';
import { Cpu, Laptop, Settings, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const categoriesList = [
    {
      id: 'electronics',
      name: 'Electronics & Components',
      description: 'High precision active and passive electronics components, semiconductors, prototype PCBs, and STM32 microcontrollers.',
      icon: Cpu,
      color: 'from-blue-600 to-indigo-500',
      shadow: 'shadow-blue-500/20',
      subcategories: ['Semiconductors', 'PCBs & Prototyping', 'Sensors & Modules', 'Active Components']
    },
    {
      id: 'computers',
      name: 'Computers & IT Hardware',
      description: 'Enterprise rackmount servers, network routing hardware, bulk storage, and multi-tenant IT hardware components.',
      icon: Laptop,
      color: 'from-indigo-600 to-purple-500',
      shadow: 'shadow-indigo-500/20',
      subcategories: ['Enterprise Servers', 'Network Switch & Routers', 'Storage Units', 'Workstations']
    },
    {
      id: 'mechanical',
      name: 'Mechanical Parts & Components',
      description: 'Heavy duty spur gears, high precision ball bearings, custom CNC milled parts, and mechanical structures.',
      icon: Settings,
      color: 'from-violet-600 to-fuchsia-500',
      shadow: 'shadow-violet-500/20',
      subcategories: ['Gears & Transmissions', 'Steel Ball Bearings', 'Pneumatic Fittings', 'Custom CNC Parts']
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="text-center mb-12 relative overflow-hidden py-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          <h1 className="font-hero text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10">Industrial Product Catalog</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto relative z-10 font-medium">Explore premium niche categories and source high-quality materials from verified global B2B industrial suppliers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoriesList.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 hover:shadow-md transition-all"
            >
              <div>
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${cat.color} text-white shadow-lg ${cat.shadow} mb-5`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="font-inter text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed font-medium">
                  {cat.description}
                </p>

                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-3">Popular Subcategories</h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map((sub) => (
                      <span key={sub} className="text-xs bg-zinc-100 dark:bg-zinc-800/60 py-1.5 px-3 rounded-xl text-zinc-600 dark:text-zinc-300 font-semibold border border-zinc-200/10 dark:border-zinc-700/10">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={`/products?niche=${cat.id}`}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/15 transition-all"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
