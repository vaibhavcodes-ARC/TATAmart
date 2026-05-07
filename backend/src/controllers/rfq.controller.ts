import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. BUYER creates a new RFQ
export const createRfq = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, quantity, targetPrice, categoryId, productId } = req.body;
    const buyerId = req.user!.id;

    if (req.user!.role !== 'BUYER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only buyers can submit RFQs' });
    }

    const rfq = await prisma.rfq.create({
      data: {
        buyerId,
        title,
        description,
        quantity: parseInt(quantity),
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        categoryId,
        productId: productId || null,
        status: 'PENDING',
      },
      include: {
        category: true,
        product: true,
      },
    });

    res.status(201).json(rfq);
  } catch (error) {
    console.error('Error creating RFQ:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// 2. SELLERS view incoming RFQs (leads board)
export const getRfqLeads = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'SELLER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch all active RFQs for sellers to bid on
    const rfqs = await prisma.rfq.findMany({
      include: {
        category: true,
        product: true,
        buyer: { select: { name: true, email: true } },
        responses: {
          where: { sellerId: req.user!.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rfqs);
  } catch (error) {
    console.error('Error fetching RFQ leads:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// 3. BUYER views their submitted RFQs and compared bids
export const getBuyerRfqs = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user!.id;

    const rfqs = await prisma.rfq.findMany({
      where: { buyerId },
      include: {
        category: true,
        product: true,
        responses: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                profile: { select: { companyName: true, isVerified: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rfqs);
  } catch (error) {
    console.error('Error fetching buyer RFQs:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// 4. SELLER submits pricing/lead-time quotation
export const submitRfqResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { rfqId, priceQuote, leadTimeDays, notes } = req.body;
    const sellerId = req.user!.id;

    if (req.user!.role !== 'SELLER' && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only verified suppliers can submit quotations' });
    }

    // Check if RFQ exists
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    // Check if seller already responded
    const existing = await prisma.rfqResponse.findFirst({
      where: { rfqId, sellerId },
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a quotation for this lead' });
    }

    const response = await prisma.rfqResponse.create({
      data: {
        rfqId,
        sellerId,
        priceQuote: parseFloat(priceQuote),
        leadTimeDays: parseInt(leadTimeDays),
        notes: notes || '',
        status: 'PENDING',
      },
    });

    // Update RFQ status to RESPONDED
    await prisma.rfq.update({
      where: { id: rfqId },
      data: { status: 'RESPONDED' },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Error submitting RFQ response:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// 5. BUYER selects preferred seller quotation
export const selectRfqResponse = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string; // RfqResponse ID
    const buyerId = req.user!.id;

    const quote = await prisma.rfqResponse.findUnique({
      where: { id },
      include: { rfq: true },
    }) as any;

    if (!quote) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quote.rfq.buyerId !== buyerId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Mark selected response as ACCEPTED
    const selected = await prisma.rfqResponse.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    // Reject other responses for this RFQ
    await prisma.rfqResponse.updateMany({
      where: {
        rfqId: quote.rfqId,
        id: { not: id },
      },
      data: { status: 'REJECTED' },
    });

    // Close the RFQ
    await prisma.rfq.update({
      where: { id: quote.rfqId },
      data: { status: 'CLOSED' },
    });

    res.json({ message: 'Quotation selected successfully', selected });
  } catch (error) {
    console.error('Error selecting RFQ response:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
