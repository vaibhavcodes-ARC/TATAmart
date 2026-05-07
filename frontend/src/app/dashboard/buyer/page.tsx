'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import { api } from '../../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  Package,
  PlusCircle,
  TrendingUp,
  Truck,
  ShieldCheck,
  Check,
  ShoppingBag,
  ArrowRight,
  User,
  X,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface RfqResponse {
  id: string;
  priceQuote: number;
  leadTimeDays: number;
  notes: string;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    profile?: {
      companyName?: string;
      isVerified?: boolean;
    };
  };
}

interface Rfq {
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
  product?: {
    id: string;
    title: string;
    images: string[];
    price: number;
  } | null;
  responses: RfqResponse[];
}

export default function BuyerDashboard() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRfqForm, setShowRfqForm] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // RFQ Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formQty, setFormQty] = useState(10);
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Cart/Checkout States
  const [checkoutRfq, setCheckoutRfq] = useState<Rfq | null>(null);
  const [checkoutResponse, setCheckoutResponse] = useState<RfqResponse | null>(null);
  const [checkoutShipping, setCheckoutShipping] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  const fetchRfqsAndCategories = async () => {
    try {
      setLoading(true);
      const [rfqRes, catRes] = await Promise.all([
        api.get('/rfqs/buyer'),
        api.get('/categories')
      ]);
      setRfqs(rfqRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) {
        setFormCategory(catRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load procurement details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqsAndCategories();
  }, []);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      await api.post('/rfqs', {
        title: formTitle,
        description: formDesc,
        quantity: formQty,
        targetPrice: formPrice ? parseFloat(formPrice) : null,
        categoryId: formCategory,
      });

      // Reset form
      setFormTitle('');
      setFormDesc('');
      setFormQty(10);
      setFormPrice('');
      setShowRfqForm(false);
      
      // Refresh
      fetchRfqsAndCategories();
    } catch (err) {
      console.error('Error submitting RFQ:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSelectQuote = async (quote: RfqResponse, rfq: Rfq) => {
    try {
      // 1. Accept quotation in backend
      await api.post(`/rfqs/responses/${quote.id}/select`);
      
      // 2. Clear previous cart, and insert this quote product/seller dynamically
      // To simulate immediate checkout, we open the Checkout Overlay for this selected response
      setCheckoutRfq(rfq);
      setCheckoutResponse(quote);
    } catch (err) {
      console.error('Error accepting quote:', err);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutResponse || !checkoutRfq) return;

    try {
      setCheckoutSubmitting(true);
      
      // We populate direct checkout cart
      await api.post('/cart', {
        productId: checkoutRfq.product?.id || 'seeded-product-id', // fallback if general RFQ
        quantity: checkoutRfq.quantity,
      });

      // Post final order creation with selected quotation reference
      await api.post('/orders', {
        shippingAdd: checkoutShipping || 'Enterprise Headquarters, Block C, Sector 62, Noida, UP - 201301',
        rfqResponseId: checkoutResponse.id,
      });

      // Clear checkout overlay and open stunning success modal
      setCheckoutRfq(null);
      setCheckoutResponse(null);
      setCheckoutShipping('');
      setSuccessModal(true);

      // Refresh data
      fetchRfqsAndCategories();
    } catch (err) {
      console.error('Failed to place B2B order:', err);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
            <Clock className="h-3 w-3" />
            <span>Awaiting Quotes</span>
          </span>
        );
      case 'RESPONDED':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50">
            <Send className="h-3 w-3" />
            <span>Offers Received ({rfqs.find(r => r.status === 'RESPONDED')?.responses.length || 1})</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
            <CheckCircle2 className="h-3 w-3" />
            <span>Quotation Closed</span>
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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        {/* Portal Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">B2B RFQ Procurement Portal</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Submit high-volume industrial RFQs, receive side-by-side bids from verified sellers, and complete direct contracts.</p>
          </div>
          <button
            onClick={() => setShowRfqForm(true)}
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post New RFQ</span>
          </button>
        </div>

        {/* Dashboard Cards Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total B2B RFQs</span>
              <h3 className="text-3xl font-black mt-0.5">{rfqs.length}</h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Awaiting Supplier Quotes</span>
              <h3 className="text-3xl font-black mt-0.5">
                {rfqs.filter((i) => i.status === 'PENDING').length}
              </h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Closed Procurement Contracts</span>
              <h3 className="text-3xl font-black mt-0.5">
                {rfqs.filter((i) => i.status === 'CLOSED').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Submitted Quotes list */}
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden mb-20">
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-base uppercase tracking-wider">Active RFQ Procurement Pipeline</h3>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 py-1 px-3 rounded-full text-zinc-500 font-bold uppercase tracking-widest">Live Status</span>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rfqs.length === 0 ? (
            <div className="py-20 flex flex-col items-center text-zinc-400">
              <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-800 mb-3" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200">No Request for Quotes Found</p>
              <p className="text-xs mt-1 text-zinc-500 max-w-sm text-center">Post a new RFQ above to tell verified suppliers what products you need and receive bidding quotes.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rfqs.map((rfq, idx) => (
                <motion.div
                  key={rfq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight">{rfq.title}</h4>
                          {getStatusBadge(rfq.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                          <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">Category: {rfq.category.name}</span>
                          <span>•</span>
                          <span>Required Quantity: {rfq.quantity.toLocaleString()} units</span>
                          <span>•</span>
                          {rfq.targetPrice && (
                            <>
                              <span>Target Price: ₹{rfq.targetPrice.toLocaleString()}/unit</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Submitted: {new Date(rfq.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-2.5 max-w-2xl bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200/30 dark:border-zinc-800/30">
                          {rfq.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col md:items-end justify-center">
                      <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase mb-1">RFQ ID: #{rfq.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  {/* Seller Responses comparison section */}
                  {rfq.responses && rfq.responses.length > 0 && (
                    <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Supplier Pricing Offers ({rfq.responses.length})</span>
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rfq.responses.map((quote) => (
                          <div
                            key={quote.id}
                            className={`rounded-2xl border p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                              quote.status === 'ACCEPTED'
                                ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                                : 'bg-white border-zinc-100 hover:border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800/40'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                  <User className="h-4 w-4 text-indigo-500" />
                                  <span>{quote.seller.profile?.companyName || quote.seller.name}</span>
                                  {quote.seller.profile?.isVerified && (
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                  )}
                                </span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                  ₹{quote.priceQuote.toLocaleString()}/unit
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 mb-3">"{quote.notes || 'No extra supplier notes provided.'}"</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                              <span className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                                <Truck className="h-3.5 w-3.5" />
                                <span>Est. Delivery: {quote.leadTimeDays} days</span>
                              </span>
                              {rfq.status !== 'CLOSED' ? (
                                <button
                                  onClick={() => handleSelectQuote(quote, rfq)}
                                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-sm shadow-indigo-600/10 transition-all flex items-center gap-1"
                                >
                                  <span>Accept & Order</span>
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              ) : quote.status === 'ACCEPTED' ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                  <Check className="h-4 w-4" />
                                  <span>Accepted Offer</span>
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-zinc-400">Ignored</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Post New RFQ Form Modal */}
      <AnimatePresence>
        {showRfqForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRfqForm(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-lg uppercase tracking-wider">Post Industrial RFQ</h3>
                <button onClick={() => setShowRfqForm(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRfq} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Product/Service Name</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Bulk Nitrile Protective Gloves"
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">procurement Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Required Quantity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formQty}
                      onChange={(e) => setFormQty(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Target Price per unit (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Detailed Specifications</label>
                  <textarea
                    required
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Describe material requirements, certifications (e.g. ISO), dimensions, and usage."
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition-all shadow-md mt-2 flex items-center justify-center"
                >
                  {formSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Submit RFQ to Suppliers</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkout/Order Confirmation Overlay */}
      <AnimatePresence>
        {checkoutResponse && checkoutRfq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCheckoutRfq(null);
                setCheckoutResponse(null);
              }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-lg uppercase tracking-wider">Confirm B2B Procurement Contract</h3>
                <button
                  onClick={() => {
                    setCheckoutRfq(null);
                    setCheckoutResponse(null);
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200/30 mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400 font-bold uppercase">Product / RFQ</span>
                  <span className="text-xs font-black text-indigo-600">ID: #{checkoutRfq.id.slice(0, 8)}</span>
                </div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{checkoutRfq.title}</h4>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-200/30">
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase">Contracted Supplier</span>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{checkoutResponse.seller.name}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase">Agreed Rate</span>
                    <span className="font-bold text-xs text-indigo-600">₹{checkoutResponse.priceQuote.toLocaleString()}/unit</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase">Procurement Volume</span>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{checkoutRfq.quantity} units</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-bold uppercase">Contract Value</span>
                    <span className="font-extrabold text-xs text-indigo-600">₹{(checkoutResponse.priceQuote * checkoutRfq.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Enterprise Shipping Address</label>
                  <input
                    type="text"
                    required
                    value={checkoutShipping}
                    onChange={(e) => setCheckoutShipping(e.target.value)}
                    placeholder="e.g. Block C, Sector 62, Noida, UP - 201301"
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex items-center gap-2.5 text-xs text-zinc-400 bg-amber-50/50 dark:bg-amber-950/10 p-3.5 rounded-xl border border-amber-200/30">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>By placing this order, you authorize the dynamic stock allocation and close the procurement bid on this RFQ.</span>
                </div>

                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition-all shadow-md flex items-center justify-center mt-2"
                >
                  {checkoutSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Sign & Place Order</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessModal(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 text-center overflow-hidden"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-6 border border-emerald-100">
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <ShoppingBag className="h-10 w-10" />
                </motion.div>
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Order Placed!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                Your B2B procurement contract has been signed successfully. The supplier is preparing shipment allocations.
              </p>

              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-zinc-200/20 text-xs font-bold text-zinc-400 mt-5 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Enterprise transaction fully verified</span>
              </div>

              <button
                onClick={() => setSuccessModal(false)}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition-all shadow-md mt-6"
              >
                Continue Pipeline Tracking
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
