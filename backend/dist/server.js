"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const rfq_routes_1 = __importDefault(require("./routes/rfq.routes"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const elasticsearch_1 = require("./utils/elasticsearch");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = new client_1.PrismaClient({ adapter });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/rfqs', rfq_routes_1.default);
app.get('/', (req, res) => {
    res.send('TATAmart Backend API is running...');
});
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    try {
        await (0, elasticsearch_1.initializeElasticsearch)();
    }
    catch (esErr) {
        console.warn('[ELASTICSEARCH] Failed to initialize cluster, but backend server is successfully listening on port:', port);
    }
    // Keep event loop alive
    setInterval(() => { }, 1000);
});
