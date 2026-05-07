'use client';

import React from 'react';
import Header from '../../components/Header';
import { motion } from 'framer-motion';
import { Laptop, Cpu, Package, ShoppingBag, Truck, Home, Shirt, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const categoriesList = [
    {
      id: 'computers',
      name: 'Computer and IT',
      description: 'Enterprise rackmount servers, network routing hardware, bulk storage, and high-performance workstations.',
      icon: Laptop,
      color: 'from-blue-600 to-indigo-500',
      shadow: 'shadow-blue-500/20',
      subcategories: ['Enterprise Servers', 'Network Switch & Routers', 'Storage Units', 'Workstations']
    },
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'High precision active and passive electronics components, semiconductors, prototype PCBs, and STM32 microcontrollers.',
      icon: Cpu,
      color: 'from-indigo-600 to-purple-500',
      shadow: 'shadow-indigo-500/20',
      subcategories: ['Semiconductors', 'PCBs & Prototyping', 'Sensors & Modules', 'Active Components']
    },
    {
      id: 'logistics',
      name: 'Logistics',
      description: 'Industrial wooden shipping pallets, durable stretch wrap film rolls, and heavy-duty global cargo packing materials.',
      icon: Package,
      color: 'from-violet-600 to-fuchsia-500',
      shadow: 'shadow-violet-500/20',
      subcategories: ['Wooden Pallets', 'Stretch Wrap Film', 'Cargo Packings', 'Storage Boxes']
    },
    {
      id: 'daily_needs',
      name: 'Daily Needs',
      description: 'Premium eco-friendly biodegradable bulk hand soap, nitrile protective examination gloves, and hygiene essentials.',
      icon: ShoppingBag,
      color: 'from-fuchsia-600 to-pink-500',
      shadow: 'shadow-pink-500/20',
      subcategories: ['Bulk Soap', 'Nitrile Gloves', 'Sanitary Essentials', 'Cleaning Agents']
    },
    {
      id: 'transport',
      name: 'Transport',
      description: 'Heavy-payload electric cargo tricycles, hydraulic manual lift pallet jacks, and industrial utility transit vehicles.',
      icon: Truck,
      color: 'from-emerald-600 to-teal-500',
      shadow: 'shadow-teal-500/20',
      subcategories: ['Cargo Tricycles', 'Pallet Jacks', 'Electric Vehicles', 'Utility Trolleys']
    },
    {
      id: 'decor_furniture',
      name: 'Decor and Furniture',
      description: 'Orthopedic mesh office chairs, modular conference room tables, and commercial office interior furnishings.',
      icon: Home,
      color: 'from-amber-600 to-orange-500',
      shadow: 'shadow-orange-500/20',
      subcategories: ['Office Chairs', 'Conference Tables', 'Modular Desks', 'Lighting Systems']
    },
    {
      id: 'apparel',
      name: 'Apparel(bulk)',
      description: 'Combed cotton unisex blank t-shirts for branding, industrial high-visibility reflective safety vests, and custom uniforms.',
      icon: Shirt,
      color: 'from-cyan-600 to-blue-500',
      shadow: 'shadow-cyan-500/20',
      subcategories: ['Blank T-Shirts', 'Reflective Vests', 'Factory Uniforms', 'Custom Hoodies']
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="text-center mb-12 relative overflow-hidden py-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight relative z-10">Industrial Product Catalog</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto relative z-10 font-medium">Explore premium niche categories and source high-quality materials from verified global B2B industrial suppliers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
