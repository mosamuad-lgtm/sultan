import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/database.mjs';
import Product from './models/Product.mjs';
import Manager from './models/Manager.mjs';
import { verifyManagerLogin, isManager, validateProductData, errorHandler } from './middleware/auth.mjs';

// تحميل متغيرات البيئة
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// إعدادات الأمان (Security Headers)
// ============================================

app.disable('x-powered-by');

app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// ============================================
// إعدادات CORS
// ============================================
const corsOrigin = NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://alsultan-tires.manus.space'
    : '*';

app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================