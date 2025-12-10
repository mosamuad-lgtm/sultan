import { verifyFirebaseToken } from '../config/firebase.mjs';
import Manager from '../models/Manager.mjs';

/**
 * Middleware للتحقق من Firebase Token
 */
export const verifyFirebaseAuth = async (req, res, next) => {
    try {
        // الحصول على Token من رأس الطلب
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'لم يتم توفير Token'
            });
        }

        const token = authHeader.substring(7); // إزالة "Bearer "

        // التحقق من Token
        const decodedToken = await verifyFirebaseToken(token);

        if (!decodedToken) {
            return res.status(401).json({
                error: 'Token غير صحيح أو منتهي الصلاحية'
            });
        }

        // البحث عن المدير في MongoDB
        const manager = await Manager.findOne({ firebaseUID: decodedToken.uid });

        if (!manager) {
            return res.status(403).json({
                error: 'المستخدم غير مسجل في النظام'
            });
        }

        if (!manager.isActive) {
            return res.status(403).json({
                error: 'حسابك معطل'
            });
        }

        // إضافة بيانات المدير والـ Firebase إلى الطلب
        req.manager = manager;
        req.firebaseUser = decodedToken;
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
export const isFirebaseManager = (req, res, next) => {
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
export const isFirebaseAdmin = (req, res, next) => {
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
