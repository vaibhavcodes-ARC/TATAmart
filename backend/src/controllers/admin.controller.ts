import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: { products: true, inquiries: true, leads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const toggleUserVerification = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const id = req.params.id as string;
    const { isVerified } = req.body;

    const profile = await prisma.profile.findFirst({
      where: { userId: id },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: { isVerified: Boolean(isVerified) },
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error toggling verification:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [totalUsers, totalProducts, totalInquiries, totalOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.inquiry.count(),
      prisma.order.count(),
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalInquiries,
      totalOrders,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
