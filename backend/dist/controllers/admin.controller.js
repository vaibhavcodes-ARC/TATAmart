"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = exports.toggleUserVerification = exports.getProducts = exports.getUsers = void 0;
const server_1 = require("../server");
const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const users = await server_1.prisma.user.findMany({
            include: {
                profile: true,
                _count: {
                    select: { products: true, inquiries: true, leads: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUsers = getUsers;
const getProducts = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const products = await server_1.prisma.product.findMany({
            include: {
                category: true,
                seller: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProducts = getProducts;
const toggleUserVerification = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const id = req.params.id;
        const { isVerified } = req.body;
        const profile = await server_1.prisma.profile.findFirst({
            where: { userId: id },
        });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        const updatedProfile = await server_1.prisma.profile.update({
            where: { id: profile.id },
            data: { isVerified: Boolean(isVerified) },
        });
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Error toggling verification:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.toggleUserVerification = toggleUserVerification;
const getAdminStats = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const [totalUsers, totalProducts, totalInquiries, totalOrders] = await Promise.all([
            server_1.prisma.user.count(),
            server_1.prisma.product.count(),
            server_1.prisma.inquiry.count(),
            server_1.prisma.order.count(),
        ]);
        res.json({
            totalUsers,
            totalProducts,
            totalInquiries,
            totalOrders,
        });
    }
    catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getAdminStats = getAdminStats;
