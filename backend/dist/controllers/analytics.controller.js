"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAnalytics = exports.getSellerAnalytics = void 0;
const axios_1 = __importDefault(require("axios"));
const PHP_SERVICE_URL = process.env.PHP_SERVICE_URL || 'http://localhost:8080';
const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        if (!sellerId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }
        // Call the PHP microservice
        const response = await axios_1.default.get(`${PHP_SERVICE_URL}/index.php`, {
            params: {
                action: 'seller-stats',
                sellerId: sellerId,
            },
        });
        return res.status(response.status).json(response.data);
    }
    catch (error) {
        console.error('Error fetching seller analytics from PHP service:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to communicate with PHP analytics service',
            error: error.message,
        });
    }
};
exports.getSellerAnalytics = getSellerAnalytics;
const getAdminAnalytics = async (req, res) => {
    try {
        // Call the PHP microservice
        const response = await axios_1.default.get(`${PHP_SERVICE_URL}/index.php`, {
            params: {
                action: 'admin-stats',
            },
        });
        return res.status(response.status).json(response.data);
    }
    catch (error) {
        console.error('Error fetching admin analytics from PHP service:', error.message);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to communicate with PHP analytics service',
            error: error.message,
        });
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
