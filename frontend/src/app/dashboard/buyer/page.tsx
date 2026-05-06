'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import { api } from '../../../utils/api';
import { motion } from 'framer-motion';
import { FileText, Send, CheckCircle2, Clock, HelpCircle, Package, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface Inquiry {
  id: string;
  productId: string;
  message: string;
  status: string;
  createdAt: string;
  product: {
    title: string;
    price: number;
    images: string[];
  };
  seller: {
    name: string;
  };
}

export default function BuyerDashboard() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await api.get('/products/inquiries/buyer');
        setInquiries(response.data);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
            <Clock className="h-3 w-3" />
            <span>Pending Quote</span>
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
            <Send className="h-3 w-3" />
            <span>Replied by Seller</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>Deal Closed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-600 border border-zinc-200/50">
            <HelpCircle className="h-3 w-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-monoenterprise">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Buyer Procurement Portal</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Track your submitted Requests for Quote (RFQs) and communicate directly with suppliers.</p>
          </div>
          <Link
            href="/products"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-sm font-bold text-white shadow-md shadow-indigo-600/15 transition-all"
          >
            <span>Explore Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Dashboard Cards Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase">Total RFQs Submitted</span>
              <h3 className="text-2xl font-black">{inquiries.length}</h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase">Pending Review</span>
              <h3 className="text-2xl font-black">
                {inquiries.filter((i) => i.status === 'PENDING').length}
              </h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase">Closed Contracts</span>
              <h3 className="text-2xl font-black">
                {inquiries.filter((i) => i.status === 'CLOSED').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Submitted Quotes list */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-base">Your Active RFQs</h3>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 py-1 px-3 rounded-full text-zinc-500 font-semibold">Live status</span>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-zinc-400">
              <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-800 mb-3" />
              <p className="font-bold">No Request for Quotes found</p>
              <p className="text-xs mt-1 text-zinc-500">Go to Products page and click on Send RFQ to contact suppliers.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {inquiries.map((inq, idx) => (
                <motion.div
                  key={inq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="h-16 w-16 rounded-xl bg-zinc-100 dark:bg-zinc-950 shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-900 flex items-center justify-center text-zinc-300">
                      {inq.product.images && inq.product.images[0] ? (
                        <img src={inq.product.images[0]} alt={inq.product.title} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white leading-tight">{inq.product.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-indigo-500" />
                          <span>Supplier: {inq.seller.name}</span>
                        </span>
                        <span>•</span>
                        <span>Price: ₹{inq.product.price.toLocaleString()}</span>
                        <span>•</span>
                        <span>Date: {new Date(inq.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-2.5 bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl border border-zinc-200/30 dark:border-zinc-800/30 italic">
                        "{inq.message}"
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col md:items-end justify-center">
                    <div className="mb-2">{getStatusBadge(inq.status)}</div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ID: #{inq.id.slice(0, 8)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
