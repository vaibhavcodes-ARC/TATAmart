"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInquiryStatus = exports.getSellerInquiries = exports.getBuyerInquiries = exports.createInquiry = exports.searchProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const server_1 = require("../server");
const elasticsearch_1 = require("../utils/elasticsearch");
const createProduct = async (req, res) => {
    try {
        const { title, description, price, moq, categoryId, images } = req.body;
        const sellerId = req.user.id;
        const product = await server_1.prisma.product.create({
            data: {
                title,
                description,
                price,
                moq,
                categoryId,
                images: images ? images : [],
                sellerId,
            },
        });
        try {
            await elasticsearch_1.esClient.index({
                index: 'products',
                id: product.id,
                document: {
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    categoryId: product.categoryId,
                    sellerId: product.sellerId,
                    createdAt: product.createdAt
                }
            });
        }
        catch (esError) {
            console.error('Error indexing product in Elasticsearch', esError);
        }
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const products = await server_1.prisma.product.findMany({
            include: {
                category: true,
                seller: {
                    select: { id: true, name: true, profile: { select: { companyName: true } } }
                }
            }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await server_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                seller: {
                    select: { id: true, name: true, profile: { select: { companyName: true, isVerified: true } } }
                }
            }
        });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const sellerId = req.user.id;
        const updateData = req.body;
        const product = await server_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.sellerId !== sellerId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updatedProduct = await server_1.prisma.product.update({
            where: { id },
            data: updateData,
        });
        try {
            await elasticsearch_1.esClient.update({
                index: 'products',
                id: updatedProduct.id,
                doc: {
                    title: updatedProduct.title,
                    description: updatedProduct.description,
                    price: updatedProduct.price,
                    categoryId: updatedProduct.categoryId
                }
            });
        }
        catch (esError) {
            console.error('Error updating product in Elasticsearch', esError);
        }
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const sellerId = req.user.id;
        const product = await server_1.prisma.product.findUnique({ where: { id } });
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        if (product.sellerId !== sellerId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await server_1.prisma.product.delete({ where: { id } });
        try {
            await elasticsearch_1.esClient.delete({
                index: 'products',
                id: id
            });
        }
        catch (esError) {
            console.error('Error deleting product from Elasticsearch', esError);
        }
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteProduct = deleteProduct;
const searchProducts = async (req, res) => {
    try {
        const { q, categoryId, minPrice, maxPrice } = req.query;
        let must = [];
        if (q) {
            must.push({
                multi_match: {
                    query: q,
                    fields: ['title^3', 'description'], // Give title 3x boost
                    fuzziness: 'AUTO'
                }
            });
        }
        if (categoryId) {
            must.push({ term: { categoryId: categoryId } });
        }
        if (minPrice || maxPrice) {
            let range = {};
            if (minPrice)
                range.gte = Number(minPrice);
            if (maxPrice)
                range.lte = Number(maxPrice);
            must.push({ range: { price: range } });
        }
        // If no search parameters, just match all
        if (must.length === 0) {
            must.push({ match_all: {} });
        }
        const result = await elasticsearch_1.esClient.search({
            index: 'products',
            query: {
                bool: { must }
            }
        });
        const hits = result.hits.hits.map((hit) => hit._source);
        res.json({ total: result.hits.total, products: hits });
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search error', error });
    }
};
exports.searchProducts = searchProducts;
const createInquiry = async (req, res) => {
    try {
        const { productId, message } = req.body;
        const buyerId = req.user.id;
        const product = await server_1.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const inquiry = await server_1.prisma.inquiry.create({
            data: {
                buyerId,
                sellerId: product.sellerId,
                productId,
                message,
                status: 'PENDING',
            },
        });
        res.status(201).json(inquiry);
    }
    catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createInquiry = createInquiry;
const getBuyerInquiries = async (req, res) => {
    try {
        const buyerId = req.user.id;
        const inquiries = await server_1.prisma.inquiry.findMany({
            where: { buyerId },
            include: {
                product: true,
                seller: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(inquiries);
    }
    catch (error) {
        console.error('Error fetching buyer inquiries:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getBuyerInquiries = getBuyerInquiries;
const getSellerInquiries = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const inquiries = await server_1.prisma.inquiry.findMany({
            where: { sellerId },
            include: {
                product: true,
                buyer: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(inquiries);
    }
    catch (error) {
        console.error('Error fetching seller inquiries:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getSellerInquiries = getSellerInquiries;
const updateInquiryStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;
        const sellerId = req.user.id;
        const inquiry = await server_1.prisma.inquiry.findUnique({
            where: { id },
        });
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        if (inquiry.sellerId !== sellerId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const updated = await server_1.prisma.inquiry.update({
            where: { id },
            data: { status },
        });
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating inquiry status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateInquiryStatus = updateInquiryStatus;
