'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import { api } from '../../utils/api';
import { Search, SlidersHorizontal, ShoppingBag, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  moq: number;
  images: string[];
  categoryId: string;
  sellerId: string;
}

function ProductListContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [niche, setNiche] = useState(searchParams.get('niche') || 'ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  
  // RFQ Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rfqMessage, setRfqMessage] = useState('');
  const [rfqSuccess, setRfqSuccess] = useState(false);
  const [rfqLoading, setRfqLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Connect to Elasticsearch Advanced Search
      const response = await api.get('/products/search', {
        params: {
          q: q || undefined,
          categoryId: niche !== 'ALL' ? niche : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (prodId: string) => {
    try {
      await api.post('/cart', { productId: prodId, quantity: 1 });
      alert('Product added to corporate cart successfully!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please log in as a buyer.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, niche]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleSendRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setRfqLoading(true);
    try {
      // Send inquiry
      await api.post('/products/inquire', {
        productId: selectedProduct.id,
        message: rfqMessage,
      });
      setRfqSuccess(true);
      setRfqMessage('');
      setTimeout(() => {
        setSelectedProduct(null);
        setRfqSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit RFQ:', error);
    } finally {
      setRfqLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">
          Explore Industrial Supplies
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Side Filter Bar */}
          <div className="w-full lg:w-64 shrink-0 rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 h-fit">
            <div className="font-inter flex items-center space-x-2 font-bold mb-6">
              <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
              <span>Filter Search</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Niche Category
                </label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-transparent py-2.5 px-3 text-sm font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:text-zinc-300"
                  id="select-filter-niche"
                >
                  <option value="ALL">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="computers">Computers & IT</option>
                  <option value="mechanical">Mechanical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Price Range (INR)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2 px-3 text-xs font-semibold outline-none dark:border-zinc-800"
                    id="input-filter-min-price"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-transparent py-2 px-3 text-xs font-semibold outline-none dark:border-zinc-800"
                    id="input-filter-max-price"
                  />
                </div>
              </div>

              <button
                onClick={fetchProducts}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-all"
                id="btn-apply-filters"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Product Feed */}
          <div className="flex-1">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-zinc-200/30 dark:bg-zinc-900 dark:border-zinc-800/30">
              <input
                type="text"
                placeholder="Search microcontrollers, rack servers, hydraulic pumps..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm font-semibold outline-none"
                id="input-search-feed"
              />
              <button
                type="submit"
                className="rounded-xl bg-zinc-900 hover:bg-zinc-800 py-2.5 px-5 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all"
                id="btn-search-feed"
              >
                Search
              </button>
            </form>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-80 rounded-2xl bg-zinc-200/50 animate-pulse dark:bg-zinc-900/50"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <AlertCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-800 mb-3" />
                <p className="font-bold">No industrial products found matching criteria</p>
                <p className="text-xs mt-1">Try expanding your search keywords or price filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-zinc-300 dark:text-zinc-800 mb-4 overflow-hidden relative border border-zinc-100 dark:border-zinc-900">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.title} className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300" />
                        ) : (
                          <ShoppingBag className="h-10 w-10" />
                        )}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        {p.categoryId}
                      </span>
                      <h3 className="font-inter text-base font-bold text-zinc-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase">Est. Price</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white">₹{p.price.toLocaleString()}</span>
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handleAddToCart(p.id)}
                          className="rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 p-1.5 text-xs font-bold transition-all"
                          title="Add to Cart"
                        >
                          🛒
                        </button>
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="rounded-lg bg-indigo-600/10 hover:bg-indigo-600 py-1.5 px-3 text-xs font-bold text-indigo-600 hover:text-white transition-all"
                          id={`btn-rfq-${p.id}`}
                        >
                          Send RFQ
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* RFQ Submission Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 text-white p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white text-sm font-bold"
                id="btn-close-modal"
              >
                ✕
              </button>

              {rfqSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4 animate-bounce" />
                  <h3 className="text-xl font-bold">RFQ Submitted Successfully!</h3>
                  <p className="text-xs text-zinc-400 mt-2">The manufacturer will be in touch shortly.</p>
                </div>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Request for Quote (RFQ)</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-6">Inquire with Seller</h3>

                  <div className="rounded-2xl bg-zinc-950/60 p-4 border border-zinc-800 mb-6 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedProduct.title}</h4>
                      <p className="text-xs text-zinc-500">MOQ: {selectedProduct.moq} units | ₹{selectedProduct.price.toLocaleString()} per unit</p>
                    </div>
                  </div>

                  <form onSubmit={handleSendRFQ} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        Your RFQ message (Specify quantity, details, delivery terms)
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={rfqMessage}
                        onChange={(e) => setRfqMessage(e.target.value)}
                        placeholder="We are looking to purchase 500 units of this sensor. Please quote lead time and final pricing terms."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 px-4 text-sm font-semibold text-white outline-none focus:border-indigo-500 transition-colors placeholder-zinc-700"
                        id="textarea-rfq-message"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={rfqLoading}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all"
                      id="btn-submit-rfq"
                    >
                      {rfqLoading ? <span>Submitting Quote Request...</span> : (
                        <>
                          <span>Submit Quote Request</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
