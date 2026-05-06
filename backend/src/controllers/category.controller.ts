import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentId } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        parentId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    // Get all top-level categories with their children
    const categories = await prisma.category.findMany({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const updateData = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // Optional: check if category has products before deleting
    // We are relying on prisma relations rules or custom logic

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
