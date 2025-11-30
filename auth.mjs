import Manager from '../models/Manager.mjs';

/**
 * Middleware للتحقق من بيانات دخول مدير المتجر
 */
export const verifyManagerLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // التحقق من وجود البيانات
        if (!username || !password) {
            return res.status(400).json({
                error: 'اسم المستخدم وكلمة المرور مطلوبان'
            });
        }

        // البحث عن المدير
        const manager = await Manager.findOne({ username }).select('+password');

        if (!manager) {
            return res.status(401).json({
                error: 'بيانات دخول غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isPasswordValid = await manager.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'بيانات دخول غير صحيحة'
            });
        }

        // التحقق من أن المدير نشط
        if (!manager.isActive) {
            return res.status(403).json({
                error: 'حسابك معطل'
            });
        }

        // تحديث آخر تسجيل دخول
        await manager.updateLastLogin();

        // إضافة بيانات المدير إلى الطلب
        req.manager = manager;
        next();
    } catch (error) {
        console.error('خطأ في المصادقة:', error);
        res.status(500).json({
            error: 'حدث خطأ في المصادقة'
        });
    }
};

/**
 * Middleware للتحقق من أن المستخدم مدير
 */
export const isManager = (req, res, next) => {
    if (!req.manager) {
        return res.status(401).json({
            error: 'يجب تسجيل الدخول أولاً'
        });
    }

    if (req.manager.role !== 'admin' && req.manager.role !== 'manager') {
        return res.status(403).json({
            error: 'ليس لديك صلاحيات كافية'
        });
    }

    next();
};

/**
 * Middleware للتحقق من أن المستخدم مسؤول
 */
export const isAdmin = (req, res, next) => {
    if (!req.manager) {
        return res.status(401).json({
            error: 'يجب تسجيل الدخول أولاً'
        });
    }

    if (req.manager.role !== 'admin') {
        return res.status(403).json({
            error: 'ليس لديك صلاحيات كافية'
        });
    }

    next();
};

/**
 * Middleware للتحقق من صحة البيانات
 */
export const validateProductData = (req, res, next) => {
    const { name, price } = req.body;

    // التحقق من الحقول المطلوبة
    if (!name || !price) {
        return res.status(400).json({
            error: 'الاسم والسعر مطلوبان'
        });
    }

    // التحقق من أن السعر رقم موجب
    if (isNaN(price) || parseFloat(price) < 0) {
        return res.status(400).json({
            error: 'السعر يجب أن يكون رقماً موجباً'
        });
    }

    // التحقق من حجم الصورة
    if (req.body.image) {
        const maxSize = process.env.MAX_IMAGE_SIZE || 5242880; // 5MB
        if (req.body.image.length > maxSize) {
            return res.status(413).json({
                error: 'حجم الصورة كبير جداً'
            });
        }
    }

    next();
};

/**
 * Middleware لمعالجة الأخطاء
 */
export const errorHandler = (err, req, res, next) => {
    console.error('خطأ:', err);

    // أخطاء Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }

    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ error: `${field} موجود بالفعل` });
    }

    // أخطاء أخرى
    res.status(err.statusCode || 500).json({
        error: err.message || 'حدث خطأ في الخادم'
    });
};
