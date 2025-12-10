import express from 'express';
import { createFirebaseUser, deleteFirebaseUser, updateFirebaseUser } from '../config/firebase.mjs';
import Manager from '../models/Manager.mjs';
import { verifyFirebaseAuth, isFirebaseManager } from '../middleware/firebase-auth.mjs';

const router = express.Router();

/**
 * تسجيل مستخدم جديد عبر Firebase
 * POST /api/auth/firebase/register
 */
router.post('/firebase/register', async (req, res) => {
    try {
        const { email, password, username, fullName } = req.body;

        // التحقق من البيانات المطلوبة
        if (!email || !password || !username || !fullName) {
            return res.status(400).json({
                error: 'البريد الإلكتروني واسم المستخدم وكلمة المرور والاسم الكامل مطلوبة'
            });
        }

        // التحقق من أن البريد الإلكتروني لم يتم تسجيله من قبل
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({
                error: 'البريد الإلكتروني مسجل بالفعل'
            });
        }

        // إنشاء مستخدم في Firebase
        const firebaseUser = await createFirebaseUser(email, password, fullName);

        // إنشاء مستخدم في MongoDB
        const newManager = new Manager({
            firebaseUID: firebaseUser.uid,
            username,
            email,
            fullName,
            password: null, // لا نحفظ كلمة المرور عند استخدام Firebase
            authMethod: 'firebase',
            role: 'manager'
        });

        await newManager.save();

        res.status(201).json({
            message: 'تم التسجيل بنجاح',
            manager: {
                id: newManager._id,
                firebaseUID: firebaseUser.uid,
                username: newManager.username,
                email: newManager.email,
                fullName: newManager.fullName
            }
        });
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({
            error: error.message || 'حدث خطأ في التسجيل'
        });
    }
});

/**
 * تسجيل الدخول عبر Firebase Token
 * POST /api/auth/firebase/login
 */
router.post('/firebase/login', async (req, res) => {
    try {
        const { firebaseToken } = req.body;

        if (!firebaseToken) {
            return res.status(400).json({
                error: 'Firebase Token مطلوب'
            });
        }

        // البحث عن المدير باستخدام Firebase UID
        // ملاحظة: يجب التحقق من Token في الـ Frontend قبل إرساله
        const manager = await Manager.findOne({ firebaseUID: firebaseToken });

        if (!manager) {
            return res.status(401).json({
                error: 'المستخدم غير مسجل في النظام'
            });
        }

        if (!manager.isActive) {
            return res.status(403).json({
                error: 'حسابك معطل'
            });
        }

        // تحديث آخر تسجيل دخول
        manager.lastLogin = new Date();
        await manager.save();

        res.json({
            message: 'تم تسجيل الدخول بنجاح',
            manager: {
                id: manager._id,
                username: manager.username,
                email: manager.email,
                fullName: manager.fullName,
                role: manager.role
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({
            error: 'حدث خطأ في تسجيل الدخول'
        });
    }
});

/**
 * الحصول على بيانات المستخدم الحالي
 * GET /api/auth/firebase/me
 */
router.get('/firebase/me', verifyFirebaseAuth, async (req, res) => {
    try {
        res.json({
            manager: {
                id: req.manager._id,
                firebaseUID: req.manager.firebaseUID,
                username: req.manager.username,
                email: req.manager.email,
                fullName: req.manager.fullName,
                role: req.manager.role,
                lastLogin: req.manager.lastLogin
            }
        });
    } catch (error) {
        console.error('خطأ في الحصول على البيانات:', error);
        res.status(500).json({
            error: 'حدث خطأ في الحصول على البيانات'
        });
    }
});

/**
 * تحديث بيانات المستخدم
 * PUT /api/auth/firebase/update
 */
router.put('/firebase/update', verifyFirebaseAuth, async (req, res) => {
    try {
        const { fullName, email } = req.body;

        // تحديث بيانات المستخدم في MongoDB
        const updatedManager = await Manager.findByIdAndUpdate(
            req.manager._id,
            {
                fullName: fullName || req.manager.fullName,
                email: email || req.manager.email
            },
            { new: true, runValidators: true }
        );

        // تحديث بيانات المستخدم في Firebase
        if (fullName || email) {
            const updates = {};
            if (fullName) updates.displayName = fullName;
            if (email) updates.email = email;
            
            await updateFirebaseUser(req.manager.firebaseUID, updates);
        }

        res.json({
            message: 'تم تحديث البيانات بنجاح',
            manager: {
                id: updatedManager._id,
                username: updatedManager.username,
                email: updatedManager.email,
                fullName: updatedManager.fullName
            }
        });
    } catch (error) {
        console.error('خطأ في تحديث البيانات:', error);
        res.status(500).json({
            error: error.message || 'حدث خطأ في تحديث البيانات'
        });
    }
});

/**
 * حذف حساب المستخدم
 * DELETE /api/auth/firebase/delete
 */
router.delete('/firebase/delete', verifyFirebaseAuth, async (req, res) => {
    try {
        const managerId = req.manager._id;
        const firebaseUID = req.manager.firebaseUID;

        // حذف المستخدم من Firebase
        await deleteFirebaseUser(firebaseUID);

        // حذف المستخدم من MongoDB
        await Manager.findByIdAndDelete(managerId);

        res.json({
            message: 'تم حذف الحساب بنجاح'
        });
    } catch (error) {
        console.error('خطأ في حذف الحساب:', error);
        res.status(500).json({
            error: error.message || 'حدث خطأ في حذف الحساب'
        });
    }
});

export default router;
