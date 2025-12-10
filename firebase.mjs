import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * تهيئة Firebase Admin SDK
 */
export const initializeFirebase = () => {
    try {
        // التحقق من وجود بيانات Firebase
        if (!process.env.FIREBASE_PROJECT_ID) {
            console.warn('⚠️ تحذير: بيانات Firebase غير محددة. يرجى تحديث ملف .env');
            return null;
        }

        // إنشاء كائن بيانات الاعتماد
        const serviceAccount = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        };

        // تهيئة Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('✅ تم تهيئة Firebase بنجاح');
        return admin;
    } catch (error) {
        console.error('❌ خطأ في تهيئة Firebase:', error.message);
        return null;
    }
};

/**
 * الحصول على Firebase Auth
 */
export const getFirebaseAuth = () => {
    try {
        return admin.auth();
    } catch (error) {
        console.error('❌ خطأ في الحصول على Firebase Auth:', error.message);
        return null;
    }
};

/**
 * التحقق من Firebase Token
 */
export const verifyFirebaseToken = async (token) => {
    try {
        const auth = getFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase غير مهيأ');
        }
        const decodedToken = await auth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('❌ خطأ في التحقق من Token:', error.message);
        return null;
    }
};

/**
 * إنشاء مستخدم في Firebase
 */
export const createFirebaseUser = async (email, password, displayName) => {
    try {
        const auth = getFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase غير مهيأ');
        }

        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
        });

        return userRecord;
    } catch (error) {
        console.error('❌ خطأ في إنشاء مستخدم Firebase:', error.message);
        throw error;
    }
};

/**
 * حذف مستخدم من Firebase
 */
export const deleteFirebaseUser = async (uid) => {
    try {
        const auth = getFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase غير مهيأ');
        }

        await auth.deleteUser(uid);
        return true;
    } catch (error) {
        console.error('❌ خطأ في حذف مستخدم Firebase:', error.message);
        throw error;
    }
};

/**
 * تحديث بيانات المستخدم في Firebase
 */
export const updateFirebaseUser = async (uid, updates) => {
    try {
        const auth = getFirebaseAuth();
        if (!auth) {
            throw new Error('Firebase غير مهيأ');
        }

        const userRecord = await auth.updateUser(uid, updates);
        return userRecord;
    } catch (error) {
        console.error('❌ خطأ في تحديث مستخدم Firebase:', error.message);
        throw error;
    }
};

export default admin;
