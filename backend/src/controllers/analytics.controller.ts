import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middlewares/auth.middleware';

const PHP_SERVICE_URL = process.env.PHP_SERVICE_URL || 'http://localhost:8080';

export const getSellerAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Call the PHP microservice
    const response = await axios.get(`${PHP_SERVICE_URL}/index.php`, {
      params: {
        action: 'seller-stats',
        sellerId: sellerId,
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error fetching seller analytics from PHP service:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to communicate with PHP analytics service',
      error: error.message,
    });
  }
};

export const getAdminAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Call the PHP microservice
    const response = await axios.get(`${PHP_SERVICE_URL}/index.php`, {
      params: {
        action: 'admin-stats',
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error fetching admin analytics from PHP service:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to communicate with PHP analytics service',
      error: error.message,
    });
  }
};
