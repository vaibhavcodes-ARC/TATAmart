'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { api } from '../../../utils/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  MailOpen,
  Clock,
  AlertCircle,
  ShoppingCart,
  Percent,
  Tag,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Truck,
  Box,
  Layers
} from 'lucide-react';
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
  stock: number;
  categoryId: string;
}

interface RfqLeads {
  id: string;
  title: string;
  description: string;
  quantity: number;
  targetPrice: number | null;
  status: string;
  createdAt: string;
  category: {
    name: string;
  };
  buyer: {
    name: string;
    email: string;
  };
  responses: Array<{
    id: string;
    sellerId: string;
    priceQuote: number;
    status: string;
  }>;
}

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'catalog' | 'leads' | 'orders'>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqLeads, setRfqLeads] = useState<RfqLeads[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodMoq, setProdMoq] = useState('');
  const [prodStock, setProdStock] = useState('100');
  const [prodCategory, setProdCategory] = useState('');

  // Bid Form States
  const [biddingRfq, setBiddingRfq] = useState<RfqLeads | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidLeadTime, setBidLeadTime] = useState('5');
  const [bidNotes, setBidNotes] = useState('');
  const [biddingSubmitting, setBiddingSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsRes, productsRes, rfqLeadsRes, ordersRes] = await Promise.all([
        api.get('/analytics/seller'),
        api.get('/products'),
        api.get('/rfqs/leads'),
        api.get('/orders') // Assigned B2B orders
      ]);

      setAnalytics(analyticsRes.data.data);
      setRfqLeads(rfqLeadsRes.data);
      setOrders(ordersRes.data);

      // Filter products only owned by this seller
      if (user) {
        setProducts(productsRes.data.filter((p: any) => p.sellerId === user.id));
      } else {
        setProducts(productsRes.data);
      }
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
      const categoriesRes = await api.get('/categories');
      const activeCategory = prodCategory || categoriesRes.data[0]?.id;

      const newProd = {
        title: prodTitle,
        description: prodDesc,
        price: Number(prodPrice),
        moq: Number(prodMoq),
        stock: Number(prodStock),
        categoryId: activeCategory,
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop'],
      };

      await api.post('/products', newProd);
      setShowAddModal(false);
      setProdTitle('');
      setProdDesc('');
      setProdPrice('');
      setProdMoq('');
      setProdStock('100');
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

  const handleUpdateStock = async (prodId: string, newStock: number) => {
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, stock: newStock } : p))
      );
      await api.put(`/products/${prodId}`, { stock: newStock });
    } catch (error) {
      console.error('Failed to update stock:', error);
      fetchData();
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingRfq) return;

    try {
      setBiddingSubmitting(true);
      await api.post('/rfqs/respond', {
        rfqId: biddingRfq.id,
        priceQuote: parseFloat(bidPrice),
        leadTimeDays: parseInt(bidLeadTime),
        notes: bidNotes,
      });

      // Clear states
      setBiddingRfq(null);
      setBidPrice('');
      setBidLeadTime('5');
      setBidNotes('');

      // Refresh
      fetchData();
    } catch (err) {
      console.error('Error submitting bid:', err);
    } finally {
      setBiddingSubmitting(false);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 pb-6 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Enterprise Control Panel</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 flex items-center gap-2 uppercase">
              <span>Supplier Control Center</span>
              {user?.role === 'SELLER' && (
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Tata Supplier</span>
                </span>
              )}
            </h1>
          </div>

          <div className="flex space-x-2.5 mt-4 md:mt-0 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Inventory Catalog
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'leads'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              B2B Leads Board ({rfqLeads.filter(r => r.status === 'PENDING').length} New)
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Procured Orders ({orders.length})
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Procurement Leads</span>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.totalLeads}</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Total incoming Requests for Quote (RFQs)</div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quotation Bid Rate</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Percent className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.responseRate}%</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Percentage of RFQs responded with a quote</div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Open Bids</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{analytics.statusCounts.PENDING}</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">RFQs currently awaiting quotes</div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Catalog Items</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Box className="h-4 w-4" />
                  </div>
                </div>
                <span className="text-3xl font-black">{products.length}</span>
                <div className="text-[10px] text-zinc-400 mt-2 font-semibold">Listed parts & industrial materials</div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Inquired Products */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">Top Inquired Industrial Assets</h3>
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Monthly Procurement Velocity</h3>
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

        {/* Tab Content 2: Catalog Inventory Stock Control */}
        {activeTab === 'catalog' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Your Product Inventory ({products.length})</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-bold text-white shadow-md transition-all"
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
                      <th className="p-5">Niche Category</th>
                      <th className="p-5">Unit Price</th>
                      <th className="p-5">Available Stock</th>
                      <th className="p-5">MOQ</th>
                      <th className="p-5 text-right">Moderation Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-semibold">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-400">No active listings in your inventory. Add your first parts item above.</td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                          <td className="p-5 font-bold text-zinc-900 dark:text-white">{p.title}</td>
                          <td className="p-5 uppercase text-[10px] font-bold text-indigo-500">{p.categoryId}</td>
                          <td className="p-5 font-bold">₹{p.price.toLocaleString()}</td>
                          <td className="p-5">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={p.stock}
                                onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                                className="w-16 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent py-1 px-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-center"
                              />
                              <span className="text-zinc-400">units</span>
                            </div>
                          </td>
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

        {/* Tab Content 3: Leads Board & Bidding */}
        {activeTab === 'leads' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Industrial Procurement Demands Pipeline</h3>

            {rfqLeads.length === 0 ? (
              <div className="rounded-2xl bg-white border border-zinc-200/40 p-12 text-center text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800/40">
                No active buyer RFQ leads available to quote on currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rfqLeads.map((rfq) => {
                  const hasResponded = rfq.responses && rfq.responses.length > 0;
                  const myBid = hasResponded ? rfq.responses[0] : null;

                  return (
                    <div
                      key={rfq.id}
                      className="rounded-2xl border border-zinc-200/40 bg-white p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                          <div>
                            <span className="text-[10px] font-black text-indigo-500 tracking-wider">LEAD ID: #{rfq.id.slice(0, 8)}</span>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5">{rfq.title}</h4>
                          </div>
                          <span className={`inline-flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-bold ${
                            rfq.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-600'
                              : rfq.status === 'RESPONDED'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {rfq.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                          <div className="flex justify-between">
                            <span>Procurement Volume</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{rfq.quantity.toLocaleString()} units</span>
                          </div>
                          {rfq.targetPrice && (
                            <div className="flex justify-between">
                              <span>Target Rate</span>
                              <span className="font-bold text-indigo-600">₹{rfq.targetPrice.toLocaleString()}/unit</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Industrial Category</span>
                            <span className="uppercase text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-extrabold">{rfq.category.name}</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 dark:bg-zinc-950/50 dark:border-zinc-800/30 mt-4 leading-relaxed">
                          "{rfq.description}"
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                        {hasResponded ? (
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span>Your Bid: ₹{myBid?.priceQuote.toLocaleString()}/unit</span>
                            </span>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-1.5 px-3 rounded-md">
                              Status: {myBid?.status}
                            </span>
                          </div>
                        ) : rfq.status !== 'CLOSED' ? (
                          <>
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Active Procurement Lead</span>
                            <button
                              onClick={() => setBiddingRfq(rfq)}
                              className="inline-flex items-center space-x-1 py-2 px-3.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>Submit Quotation</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-zinc-400 w-full text-center py-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl">Bid Closed</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Tab Content 4: Procured Orders */}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-monoenterprise">B2B Assigned Orders Log</h3>

            {orders.length === 0 ? (
              <div className="rounded-2xl bg-white border border-zinc-200/40 p-12 text-center text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800/40">
                No procured orders assigned to your control center yet.
              </div>
            ) : (
              <div className="rounded-2xl bg-white shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-5">Order ID</th>
                        <th className="p-5">Destination Address</th>
                        <th className="p-5">Shipment Value</th>
                        <th className="p-5">Status</th>
                        <th className="p-5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-semibold">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                          <td className="p-5 font-bold text-indigo-600">#{ord.id.slice(0, 8)}</td>
                          <td className="p-5 text-zinc-500 max-w-xs truncate">{ord.shippingAdd}</td>
                          <td className="p-5 font-bold">₹{ord.total.toLocaleString()}</td>
                          <td className="p-5">
                            <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200/50">
                              <Truck className="h-3.5 w-3.5" />
                              <span>{ord.status}</span>
                            </span>
                          </td>
                          <td className="p-5 text-zinc-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Submit Quote Modal */}
      <AnimatePresence>
        {biddingRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBiddingRfq(null)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden animate-spring"
            >
              <h3 className="font-extrabold text-lg uppercase tracking-wider mb-2">Submit quotation pricing</h3>
              <p className="text-xs text-zinc-400 mb-5">Submit a competitive quotation rate to procure the contract for Lead ID #{biddingRfq.id.slice(0, 8)}.</p>

              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Your Quote Rate (per unit)</label>
                    <input
                      type="number"
                      required
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      placeholder={biddingRfq.targetPrice?.toString() || 'e.g. 150'}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Est. Delivery lead time (Days)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={bidLeadTime}
                      onChange={(e) => setBidLeadTime(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Supplier Notes / Compliance Remarks</label>
                  <textarea
                    rows={3}
                    value={bidNotes}
                    onChange={(e) => setBidNotes(e.target.value)}
                    placeholder="Provide details on parts authenticity, quality assurance, or specific payment terms."
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-200/30">
                  <button
                    type="button"
                    onClick={() => setBiddingRfq(null)}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={biddingSubmitting}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-6 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center"
                  >
                    {biddingSubmitting ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Place Competitive Quote</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3 className="text-lg font-black tracking-tight mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 uppercase">
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

                <div className="grid grid-cols-3 gap-4">
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
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">MOQ</label>
                    <input
                      type="number"
                      required
                      value={prodMoq}
                      onChange={(e) => setProdMoq(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Initial Stock</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="e.g. 500"
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
                    <option value="">Select Industrial Category</option>
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
