"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategories = exports.createCategory = void 0;
const server_1 = require("../server");
const createCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const category = await server_1.prisma.category.create({
            data: {
                name,
                parentId,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        // Get all top-level categories with their children
        const categories = await server_1.prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    include: {
                        children: true // Up to 3 levels deep for example
                    }
                }
            }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getCategories = getCategories;
const updateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const category = await server_1.prisma.category.update({
            where: { id },
            data: updateData,
        });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        // Optional: check if category has products before deleting
        // We are relying on prisma relations rules or custom logic
        await server_1.prisma.category.delete({ where: { id } });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.deleteCategory = deleteCategory;
