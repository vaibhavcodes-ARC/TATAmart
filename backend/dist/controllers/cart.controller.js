"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const server_1 = require("../server");
const getCart = async (req, res) => {
    try {
        const buyerId = req.user.id;
        let cart = await server_1.prisma.cart.findUnique({
            where: { buyerId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        if (!cart) {
            cart = await server_1.prisma.cart.create({
                data: { buyerId },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });
        }
        res.json(cart);
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { productId, quantity = 1 } = req.body;
        let cart = await server_1.prisma.cart.findUnique({
            where: { buyerId },
        });
        if (!cart) {
            cart = await server_1.prisma.cart.create({
                data: { buyerId },
            });
        }
        const existingItem = await server_1.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
            },
        });
        if (existingItem) {
            const updated = await server_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + Number(quantity) },
                include: { product: true },
            });
            return res.json(updated);
        }
        const newItem = await server_1.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity: Number(quantity),
            },
            include: { product: true },
        });
        res.json(newItem);
    }
    catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const id = req.params.id;
        const { quantity } = req.body;
        const updated = await server_1.prisma.cartItem.update({
            where: { id },
            data: { quantity: Number(quantity) },
            include: { product: true },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateCartItem = updateCartItem;
const deleteCartItem = async (req, res) => {
    try {
        const id = req.params.id;
        await server_1.prisma.cartItem.delete({
            where: { id },
        });
        res.json({ success: true, message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteCartItem = deleteCartItem;
