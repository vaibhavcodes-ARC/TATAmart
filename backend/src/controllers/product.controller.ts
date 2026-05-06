import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth.middleware';
import { esClient } from '../utils/elasticsearch';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, moq, categoryId, images } = req.body;
    const sellerId = req.user!.id;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        moq,
        categoryId,
        images: images ? (images as string[]) : [],
        sellerId,
      },
    });

    try {
      await esClient.index({
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
    } catch (esError) {
      console.error('Error indexing product in Elasticsearch', esError);
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, profile: { select: { companyName: true } } }
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, profile: { select: { companyName: true, isVerified: true } } }
        }
      }
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const sellerId = req.user!.id;
    const updateData = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.sellerId !== sellerId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    try {
      await esClient.update({
        index: 'products',
        id: updatedProduct.id,
        doc: {
          title: updatedProduct.title,
          description: updatedProduct.description,
          price: updatedProduct.price,
          categoryId: updatedProduct.categoryId
        }
      });
    } catch (esError) {
      console.error('Error updating product in Elasticsearch', esError);
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const sellerId = req.user!.id;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.sellerId !== sellerId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.product.delete({ where: { id } });

    try {
      await esClient.delete({
        index: 'products',
        id: id as string
      });
    } catch (esError) {
      console.error('Error deleting product from Elasticsearch', esError);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, categoryId, minPrice, maxPrice } = req.query;
    
    let must: any[] = [];
    
    if (q) {
      must.push({
        multi_match: {
          query: q as string,
          fields: ['title^3', 'description'], // Give title 3x boost
          fuzziness: 'AUTO'
        }
      });
    }

    if (categoryId) {
      must.push({ term: { categoryId: categoryId as string } });
    }

    if (minPrice || maxPrice) {
      let range: any = {};
      if (minPrice) range.gte = Number(minPrice);
      if (maxPrice) range.lte = Number(maxPrice);
      must.push({ range: { price: range } });
    }

    // If no search parameters, just match all
    if (must.length === 0) {
      must.push({ match_all: {} });
    }

    const result = await esClient.search({
      index: 'products',
      query: {
        bool: { must }
      }
    });

    const hits = result.hits.hits.map((hit: any) => hit._source);
    res.json({ total: result.hits.total, products: hits });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search error', error });
  }
};

export const createInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, message } = req.body;
    const buyerId = req.user!.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        buyerId,
        sellerId: product.sellerId,
        productId,
        message,
        status: 'PENDING',
      },
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getBuyerInquiries = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const inquiries = await prisma.inquiry.findMany({
      where: { buyerId },
      include: {
        product: true,
        seller: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching buyer inquiries:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSellerInquiries = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.id;
    const inquiries = await prisma.inquiry.findMany({
      where: { sellerId },
      include: {
        product: true,
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching seller inquiries:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const status = req.body.status as string;
    const sellerId = req.user!.id;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (inquiry.sellerId !== sellerId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


