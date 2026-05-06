'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { api } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ClipboardList, CheckCircle2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    moq: number;
    images: string[];
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingAdd, setShippingAdd] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
      );
      await api.put(`/cart/${itemId}`, { quantity: newQty });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      fetchCart(); // Revert on failure
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      await api.delete(`/cart/${itemId}`);
    } catch (error) {
      console.error('Failed to remove item:', error);
      fetchCart();
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAdd.trim()) return;

    setPlacingOrder(true);
    try {
      await api.post('/orders', { shippingAdd });
      setItems([]);
      setOrderSuccess(true);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <Header />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-3xl bg-white p-8 shadow-xl border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40"
          >
            <div className="mx-auto h-16 w-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-hero text-2xl font-bold tracking-tight">Procurement Order Placed!</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-medium leading-relaxed">
              Your enterprise order has been registered in our central database. The seller has been notified to arrange freight logistics and billing invoices.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-sm transition-all"
              >
                Continue Procurement
              </Link>
              <Link
                href="/dashboard/buyer"
                className="rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-3 text-sm transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Checkout</span>
          <h1 className="font-hero text-3xl font-black tracking-tight mt-1">Enterprise Shopping Cart</h1>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-zinc-900 p-12 text-center border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm max-w-2xl mx-auto">
            <ShoppingCart className="h-12 w-12 text-zinc-300 dark:text-zinc-800 mx-auto mb-4" />
            <h3 className="font-inter text-lg font-bold">Your cart is currently empty</h3>
            <p className="text-xs text-zinc-400 mt-1.5 font-medium">Browse our high-end electronics, IT hardware, and mechanical parts catalog to add items.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-6 text-sm font-bold text-white shadow-md shadow-indigo-600/15 transition-all"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl bg-white shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-900 text-zinc-300">
                            {item.product.images && item.product.images[0] ? (
                              <img src={item.product.images[0]} alt={item.product.title} className="object-cover w-full h-full" />
                            ) : (
                              <ShoppingCart className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-snug">{item.product.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-zinc-500">Price: ₹{item.product.price.toLocaleString()}</span>
                              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 py-0.5 px-2 rounded-md font-bold">MOQ: {item.product.moq}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950/30 p-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                              className="p-1.5 hover:bg-white dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-indigo-600 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold w-10 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                              className="p-1.5 hover:bg-white dark:hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-indigo-600 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right w-24">
                            <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                              ₹{(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40">
                <div className="flex items-center space-x-2 font-bold mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <ClipboardList className="h-4 w-4 text-indigo-600" />
                  <span className="font-inter">Procurement Summary</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>GST (Corporate 18%)</span>
                    <span>₹{(subtotal * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Freight/Logistics</span>
                    <span className="text-emerald-500 font-bold">FREE (TATAmart Premium)</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
                    <span className="text-sm font-bold">Total Procurement</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      ₹{(subtotal * 1.18).toLocaleString()}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-indigo-500" />
                      <span>Corporate Delivery Address</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={shippingAdd}
                      onChange={(e) => setShippingAdd(e.target.value)}
                      placeholder="e.g. Unit 4B, Phase 1, Tata Communications Exchange, Pune, MH, 411015"
                      className="w-full rounded-xl border border-zinc-200 bg-transparent py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-zinc-800 placeholder-zinc-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition-all hover:shadow-indigo-500/25 disabled:opacity-50"
                  >
                    {placingOrder ? <span>Processing Order...</span> : (
                      <>
                        <span>Submit Procurement Order</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
