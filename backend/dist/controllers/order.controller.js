"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getOrders = void 0;
const server_1 = require("../server");
const prismaAny = server_1.prisma;
const getOrders = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const orders = await prismaAny.order.findMany({
            where: { buyerId },
            include: {
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getOrders = getOrders;
const createOrder = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const { shippingAdd, rfqResponseId } = req.body;
        const cart = await prismaAny.cart.findUnique({
            where: { buyerId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }
        let total = 0;
        const orderItemsData = cart.items.map((item) => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
            };
        });
        // Run order creation, stock deduction, and cart clearing in a transaction
        const result = await prismaAny.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    buyerId,
                    total,
                    shippingAdd: shippingAdd || 'Primary Enterprise Address',
                    rfqResponseId: rfqResponseId || null,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });
            // Deduct stock for each product in the order
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            // Clear the cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return order;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createOrder = createOrder;
