'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { api } from '../../../utils/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import { TrendingUp, MailOpen, Clock, AlertCircle, ShoppingCart, Percent, Tag, Plus, Trash2, Edit3, ArrowRight, ShieldCheck, Mail, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsData {
  totalLeads: number;
  responseRate: number;
  statusCounts: {
    PENDING: number;
    REPLIED: number;
    CLOSED: number;
  };
  topProducts: Array<{
    id: string;
    title: string;
    inquiries_count: number;
  }>;
  monthlyLeads: Array<{
    month: string;
    count: number;
  }>;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  moq: number;
  categoryId: string;
}

interface Inquiry {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  product: {
    title: string;
    price: number;
  };
  buyer: {
    name: string;
  };
}

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'catalog' | 'leads'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodMoq, setProdMoq] = useState('');
  const [prodCategory, setProdCategory] = useState('electronics');

  const fetchData = async () => {
    try {
      const [analyticsRes, productsRes, inquiriesRes] = await Promise.all([
        api.get('/analytics/seller'),
        api.get('/products'),
        api.get('/products/inquiries/seller'),
      ]);

      setAnalytics(analyticsRes.data.data);
      // Filter products only owned by this seller
      if (user) {
        setProducts(productsRes.data.filter((p: any) => p.sellerId === user.id));
      } else {
        setProducts(productsRes.data);
      }
      setInquiries(inquiriesRes.data);
    } catch (error) {
      console.error('Error fetching seller command center data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProd = {
        title: prodTitle,
        description: prodDesc,
        price: Number(prodPrice),
        moq: Number(prodMoq),
        categoryId: prodCategory,
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'],
      };

      await api.post('/products', newProd);
      setShowAddModal(false);
      setProdTitle('');
      setProdDesc('');
      setProdPrice('');
      setProdMoq('');
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleUpdateInquiryStatus = async (inqId: string, newStatus: string) => {
    try {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((i) => (i.id === inqId ? { ...i, status: newStatus } : i))
      );
      await api.put(`/products/inquiries/${inqId}`, { status: newStatus });
      fetchData(); // Refresh metrics
    } catch (error) {
      console.error('Failed to transition inquiry status:', error);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-monoenterprise">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 pb-6 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Enterprise Portal</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
              <span>Seller Command Center</span>
              {user?.role === 'SELLER' && (
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Supplier</span>
                </span>
              )}
            </h1>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Manage Catalog
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'leads'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Leads & RFQs ({inquiries.filter(i => i.status === 'PENDING').length} New)
            </button>
          </div>
        </div>

        {/* Tab Content 1: Lead Analytics */}
        {activeTab === 'analytics' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Leads</span>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.totalLeads}</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Total inquiries sent for your products</div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Response Rate</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Percent className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.responseRate}%</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Leads with REPLIED or CLOSED state</div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending RFQs</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.statusCounts.PENDING}</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Leads currently waiting for a callback</div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Answered / Closed</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <MailOpen className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.statusCounts.REPLIED + analytics.statusCounts.CLOSED}</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Resolved trade RFQs</div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Inquired Products */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">Top Inquired Products</h3>
                {analytics.topProducts.length === 0 ? (
                  <p className="text-xs text-zinc-400">No active product inquiries yet.</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.topProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl">
                        <span className="text-xs font-bold">{p.title}</span>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 py-1 px-2.5 rounded-full">
                          {p.inquiries_count} inquiries
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lead Trend */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Monthly Inquiry Velocity</h3>
                </div>
                {analytics.monthlyLeads.length === 0 ? (
                  <p className="text-xs text-zinc-400">No historical analytics recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.monthlyLeads.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500">{m.month}</span>
                        <div className="flex-1 mx-6 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${(m.count / Math.max(...analytics.monthlyLeads.map(l => l.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold">{m.count} inquiries</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content 2: Manage Catalog (CRUD) */}
        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Your Product Inventory ({products.length})</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/15 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="p-5">Product Details</th>
                      <th className="p-5">Industrial Niche</th>
                      <th className="p-5">Unit price</th>
                      <th className="p-5">MOQ</th>
                      <th className="p-5 text-right">Moderation Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-semibold">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-400">No active listings in your inventory. Add your first parts item above.</td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                          <td className="p-5 font-bold text-zinc-900 dark:text-white">{p.title}</td>
                          <td className="p-5 uppercase text-[10px] font-bold text-indigo-500">{p.categoryId}</td>
                          <td className="p-5 font-bold">₹{p.price.toLocaleString()}</td>
                          <td className="p-5 font-bold">{p.moq} units</td>
                          <td className="p-5 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content 3: Leads & RFQs */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Incoming Buyer Procurement Requests</h3>

            {inquiries.length === 0 ? (
              <div className="rounded-2xl bg-white border border-zinc-200/40 p-12 text-center text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800/40">
                No inquiries submitted for your listed products yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="rounded-2xl border border-zinc-200/40 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div>
                          <span className="text-[10px] font-black text-indigo-500 tracking-wider">RFQ ID: #{inq.id.slice(0, 8)}</span>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5">{inq.product.title}</h4>
                        </div>
                        <span className={`inline-flex items-center space-x-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                          inq.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                            : inq.status === 'REPLIED'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                        }`}>
                          {inq.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <div className="flex justify-between">
                          <span>Buyer Representative</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-300">{inq.buyer.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date Submitted</span>
                          <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-100 dark:bg-zinc-950/50 dark:border-zinc-800/30 mt-4 leading-relaxed italic">
                        "{inq.message}"
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Transition RFQ State</span>
                      <div className="flex space-x-2">
                        {inq.status !== 'REPLIED' && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, 'REPLIED')}
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                          >
                            <Send className="h-3 w-3" />
                            <span>Mark Replied</span>
                          </button>
                        )}
                        {inq.status !== 'CLOSED' && (
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, 'CLOSED')}
                            className="inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Close Deal</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800 p-8 shadow-2xl overflow-hidden relative"
            >
              <h3 className="text-lg font-black tracking-tight mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <Tag className="h-5 w-5 text-indigo-500" />
                <span>List New Parts Item</span>
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Product Title</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. Broadcom Gigabit Ethernet Transceiver IC"
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Description Specification</label>
                  <textarea
                    required
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Provide full technical parameters, core speed, impedance ratings..."
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 placeholder-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Unit Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Minimum Order Quantity</label>
                    <input
                      type="number"
                      required
                      value={prodMoq}
                      onChange={(e) => setProdMoq(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Industrial Niche</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 cursor-pointer text-zinc-500"
                  >
                    <option value="electronics">Electronics & Components</option>
                    <option value="computers">Computers & IT Hardware</option>
                    <option value="mechanical">Mechanical Parts</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-6 text-xs font-bold text-white shadow-md shadow-indigo-600/15 transition-all"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
