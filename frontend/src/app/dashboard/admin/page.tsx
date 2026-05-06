'use client';

import React, { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import { api } from '../../../utils/api';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, FileText, CheckCircle2, ShieldAlert, Trash2, ShieldCheck, Database, Server } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  profile: {
    companyName: string;
    gstNumber: string;
    city: string;
    isVerified: boolean;
  } | null;
}

interface Product {
  id: string;
  title: string;
  price: number;
  categoryId: string;
  seller: {
    name: string;
    email: string;
  };
}

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalInquiries: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, productsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/admin/stats'),
      ]);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, profile: u.profile ? { ...u.profile, isVerified: !currentStatus } : null }
            : u
        )
      );
      await api.put(`/admin/users/${userId}/verify`, { isVerified: !currentStatus });
    } catch (error) {
      console.error('Failed to toggle verification:', error);
      fetchData(); // Revert
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    try {
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      if (stats) setStats({ ...stats, totalProducts: stats.totalProducts - 1 });
      await api.delete(`/products/${prodId}`);
    } catch (error) {
      console.error('Failed to moderate product:', error);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-monoenterprise">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Admin Operations</span>
            <h1 className="text-3xl font-black tracking-tight mt-1 flex items-center gap-2">
              <Database className="h-7 w-7 text-indigo-500" />
              <span>Platform Control Center</span>
            </h1>
          </div>
          <div className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <Server className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>Elasticsearch Cluster: ONLINE</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Users</span>
                    <h3 className="text-2xl font-black">{stats.totalUsers}</h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
                  <div className="p-3.5 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Moderated Products</span>
                    <h3 className="text-2xl font-black">{stats.totalProducts}</h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Inquiries</span>
                    <h3 className="text-2xl font-black">{stats.totalInquiries}</h3>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 flex items-center space-x-4">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Placed Orders</span>
                    <h3 className="text-2xl font-black">{stats.totalOrders}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex space-x-3 mb-8 border-b border-zinc-200/40 dark:border-zinc-800/40 pb-4">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Enterprise Accounts
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === 'products'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30 text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Catalog Moderation
              </button>
            </div>

            {/* Responsive Tables */}
            <div className="rounded-2xl bg-white shadow-sm border border-zinc-200/40 dark:bg-zinc-900 dark:border-zinc-800/40 overflow-hidden">
              {activeTab === 'users' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-5">Representative Name</th>
                        <th className="p-5">Corporate Email</th>
                        <th className="p-5">Role</th>
                        <th className="p-5">Company & GST Details</th>
                        <th className="p-5 text-right">Moderation Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-semibold">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                          <td className="p-5 font-bold text-zinc-900 dark:text-white">{u.name}</td>
                          <td className="p-5 text-zinc-500">{u.email}</td>
                          <td className="p-5">
                            <span className={`inline-flex py-1 px-2 rounded-lg text-[10px] font-bold ${
                              u.role === 'SELLER'
                                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                                : u.role === 'ADMIN'
                                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-5">
                            {u.profile ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-zinc-800 dark:text-zinc-300">{u.profile.companyName}</span>
                                <span className="text-[10px] text-zinc-500 mt-0.5">GST: {u.profile.gstNumber || 'N/A'}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-400">Profile Pending Seeding</span>
                            )}
                          </td>
                          <td className="p-5 text-right">
                            {u.role === 'SELLER' && u.profile ? (
                              <button
                                onClick={() => handleToggleVerification(u.id, u.profile!.isVerified)}
                                className={`inline-flex items-center space-x-1 py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all border ${
                                  u.profile.isVerified
                                    ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30'
                                    : 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                                }`}
                              >
                                {u.profile.isVerified ? (
                                  <>
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    <span>Unverified (Approve)</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-zinc-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                        <th className="p-5">Product Specification Title</th>
                        <th className="p-5">Industrial Niche</th>
                        <th className="p-5">Unit Price</th>
                        <th className="p-5">Registered Manufacturer</th>
                        <th className="p-5 text-right">Moderation Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-semibold">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-all">
                          <td className="p-5 font-bold text-zinc-900 dark:text-white">{p.title}</td>
                          <td className="p-5 uppercase text-[10px] font-bold text-indigo-500">{p.categoryId}</td>
                          <td className="p-5 font-bold">₹{p.price.toLocaleString()}</td>
                          <td className="p-5">
                            <div className="flex flex-col">
                              <span className="font-bold">{p.seller.name}</span>
                              <span className="text-[10px] text-zinc-500 mt-0.5">{p.seller.email}</span>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
