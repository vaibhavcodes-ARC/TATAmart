import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    let cart = await prisma.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { buyerId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    let cart = await prisma.cart.findUnique({
      where: { buyerId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { buyerId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + Number(quantity) },
        include: { product: true },
      });
      return res.json(updated);
    }

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: Number(quantity),
      },
      include: { product: true },
    });

    res.json(newItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { quantity } = req.body;

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: Number(quantity) },
      include: { product: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
