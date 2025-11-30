import express from 'express';
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
// Middleware
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// إعدادات التخزين المؤقت (Caching)
// ============================================

app.use(express.static(__dirname, {
    maxAge: '1d',
    etag: false,
    lastModified: true
}));

app.get('*.js', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=86400');
    next();
});

app.get('*.css', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=86400');
    next();
});

app.get('*.jpg', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=604800');
    next();
});

app.get('*.png', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=604800');
    next();
});

// ============================================
// API Routes - المنتجات
// ============================================

// الحصول على جميع المنتجات
app.get('/api/products', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=300');
        const products = await Product.find({ isActive: true });
        res.json(products);
    } catch (error) {
        console.error('خطأ في جلب المنتجات:', error);
        res.status(500).json({ error: 'خطأ في جلب المنتجات' });
    }
});

// الحصول على منتج واحد
app.get('/api/products/:id', async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=300');
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        res.json(product);
    } catch (error) {
        console.error('خطأ في جلب المنتج:', error);
        res.status(500).json({ error: 'خطأ في جلب المنتج' });
    }
});

// إضافة منتج جديد (يتطلب مصادقة)
app.post('/api/products', isManager, validateProductData, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        const { name, description, size, price, quantity, image, category } = req.body;

        const newProduct = new Product({
            name,
            description: description || '',
            size: size || '',
            price: parseFloat(price),
            quantity: Math.max(0, parseInt(quantity) || 0),
            image: image || null,
            category: category || 'عام'
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('خطأ في إضافة المنتج:', error);
        res.status(500).json({ error: 'خطأ في إضافة المنتج' });
    }
});

// تحديث منتج (يتطلب مصادقة)
app.put('/api/products/:id', isManager, validateProductData, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        const { name, description, size, price, quantity, image, category, isActive } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description: description || '',
                size: size || '',
                price: parseFloat(price),
                quantity: Math.max(0, parseInt(quantity) || 0),
                image: image || null,
                category: category || 'عام',
                isActive: isActive !== undefined ? isActive : true
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }

        res.json(product);
    } catch (error) {
        console.error('خطأ في تحديث المنتج:', error);
        res.status(500).json({ error: 'خطأ في تحديث المنتج' });
    }
});

// حذف منتج (يتطلب مصادقة)
app.delete('/api/products/:id', isManager, async (req, res) => {
    try {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }

        res.json({ message: 'تم حذف المنتج بنجاح', product });
    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        res.status(500).json({ error: 'خطأ في حذف المنتج' });
    }
});

// ============================================
// API Routes - المصادقة
// ============================================

// تسجيل دخول مدير المتجر
app.post('/api/auth/login', verifyManagerLogin, (req, res) => {
    try {
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        
        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            manager: {
                id: req.manager._id,
                username: req.manager.username,
                email: req.manager.email,
                fullName: req.manager.fullName,
                role: req.manager.role
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ error: 'خطأ في تسجيل الدخول' });
    }
});

// ============================================
// صفحات أخرى
// ============================================

app.get('/', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600');
    res.sendFile(join(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(join(__dirname, 'admin.html'));
});

app.get('/manager-login.html', (req, res) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(join(__dirname, 'manager-login.html'));
});

// معالجة الأخطاء 404
app.use((req, res) => {
    res.status(404).json({ error: 'الصفحة غير موجودة' });
});

// معالجة الأخطاء العامة
app.use(errorHandler);

// ============================================
// بدء الخادم
// ============================================

const startServer = async () => {
    try {
        // الاتصال بقاعدة البيانات
        await connectDB();

        // إنشاء مدير افتراضي إذا لم يكن موجوداً
        const existingManager = await Manager.findOne({ username: process.env.MANAGER_USERNAME });
        if (!existingManager) {
            const defaultManager = new Manager({
                username: process.env.MANAGER_USERNAME,
                password: process.env.MANAGER_PASSWORD,
                email: process.env.STORE_EMAIL,
                fullName: 'مدير المتجر',
                role: 'admin'
            });
            await defaultManager.save();
            console.log('✅ تم إنشاء حساب مدير افتراضي');
        }

        // بدء الخادم
        app.listen(PORT, () => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
            console.log(`📊 لوحة التحكم: http://localhost:${PORT}/admin.html`);
            console.log(`🔐 إعدادات الأمان: مفعلة`);
            console.log(`💾 قاعدة البيانات: MongoDB`);
            console.log(`🔒 تشفير كلمات المرور: bcryptjs`);
            console.log(`📍 الموقع: ${process.env.STORE_LOCATION}`);
            console.log(`📧 البريد: ${process.env.STORE_EMAIL}`);
            console.log(`📞 الهاتف: ${process.env.STORE_PHONE}`);
            console.log(`${'='.repeat(50)}\n`);
        });
    } catch (error) {
        console.error('❌ خطأ في بدء الخادم:', error);
        process.exit(1);
    }
};

startServer();

// معالجة إشارات الإيقاف
process.on('SIGINT', async () => {
    console.log('\n🛑 جاري إيقاف الخادم...');
    process.exit(0);
});
