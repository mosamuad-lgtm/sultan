# 🔐 دليل إعداد Firebase

هذا الدليل يشرح كيفية دمج Firebase مع متجر السلطان للمصادقة الآمنة.

---

## 📋 المتطلبات

- حساب Google
- Firebase Project
- Node.js و npm مثبتة

---

## 🚀 خطوات الإعداد

### 1️⃣ إنشاء Firebase Project

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على **"إنشاء مشروع جديد"** (Create a new project)
3. أدخل اسم المشروع: `alsultan-tires`
4. اتبع الخطوات المتبقية
5. انتظر إنشاء المشروع

---

### 2️⃣ تفعيل Firebase Authentication

1. في Firebase Console، انتقل إلى **Authentication**
2. انقر على **"Get Started"**
3. اختر **"Email/Password"** وفعّله
4. (اختياري) فعّل **"Google Sign-in"** أيضاً

---

### 3️⃣ إنشاء مفتاح خدمة Firebase Admin

1. في Firebase Console، انتقل إلى **Project Settings** (⚙️)
2. اختر تبويب **"Service Accounts"**
3. انقر على **"Generate New Private Key"**
4. سيتم تحميل ملف JSON - احفظه بأمان

---

### 4️⃣ تحديث ملف .env

افتح ملف `.env` وأضف البيانات من ملف JSON الذي حملته:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
```

---

### 5️⃣ تحديث Firebase Config في HTML

افتح ملف `manager-login-firebase.html` وحدّث:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
```

يمكنك الحصول على هذه البيانات من:
- Firebase Console → Project Settings → General → Your apps

---

### 6️⃣ تثبيت المكتبات

```bash
cd /home/ubuntu/alsultan_tires
npm install
```

---

### 7️⃣ بدء الخادم

```bash
npm start
```

---

## 📌 المسارات المتاحة

### مسارات المصادقة

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| POST | `/api/auth/firebase/register` | تسجيل مستخدم جديد |
| POST | `/api/auth/firebase/login` | تسجيل الدخول |
| GET | `/api/auth/firebase/me` | الحصول على بيانات المستخدم |
| PUT | `/api/auth/firebase/update` | تحديث البيانات |
| DELETE | `/api/auth/firebase/delete` | حذف الحساب |

### مسارات المنتجات (محمية)

جميع مسارات المنتجات تتطلب Firebase Token في رأس الطلب:

```
Authorization: Bearer <Firebase_ID_Token>
```

---

## 🔑 كيفية الحصول على Firebase Token

### من الـ Frontend

```javascript
import { getAuth } from "https://www.gstatic.com/firebasejs/10.6.1/firebase-auth.js";

const auth = getAuth();
const user = auth.currentUser;

if (user) {
    const idToken = await user.getIdToken();
    // استخدم هذا الـ Token في الطلبات
}
```

### استخدام Token في الطلبات

```javascript
const response = await fetch('/api/products', {
    headers: {
        'Authorization': `Bearer ${idToken}`
    }
});
```

---

## 🔐 الأمان

### نقاط مهمة

1. **لا تشارك ملف .env** - يحتوي على بيانات حساسة
2. **استخدم HTTPS فقط** - في الإنتاج
3. **قيّد Firebase Rules** - في Firebase Console
4. **راقب الأنشطة المريبة** - في Firebase Console

### Firebase Security Rules

في Firebase Console، انتقل إلى **Firestore Database** → **Rules** وأضف:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🧪 الاختبار

### 1. تسجيل مستخدم جديد

```bash
curl -X POST http://localhost:3000/api/auth/firebase/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "fullName": "Test User"
  }'
```

### 2. تسجيل الدخول

```bash
curl -X POST http://localhost:3000/api/auth/firebase/login \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseToken": "user-firebase-uid"
  }'
```

### 3. الحصول على البيانات

```bash
curl -X GET http://localhost:3000/api/auth/firebase/me \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: "Firebase غير مهيأ"

**السبب:** بيانات Firebase غير صحيحة في `.env`

**الحل:**
1. تحقق من ملف `.env`
2. أعد تحميل مفتاح الخدمة
3. أعد تشغيل الخادم

### الخطأ: "Token غير صحيح"

**السبب:** Token منتهي الصلاحية أو غير صحيح

**الحل:**
1. احصل على Token جديد من Firebase
2. تأكد من صحة الـ Token

### الخطأ: "المستخدم غير مسجل"

**السبب:** المستخدم موجود في Firebase لكن ليس في MongoDB

**الحل:**
1. تسجيل مستخدم جديد عبر `/api/auth/firebase/register`
2. أو إضافة المستخدم يدويًا في MongoDB

---

## 📚 مراجع مفيدة

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)

---

## ✅ قائمة التحقق

- [ ] تم إنشاء Firebase Project
- [ ] تم تفعيل Firebase Authentication
- [ ] تم إنشاء مفتاح خدمة Firebase Admin
- [ ] تم تحديث ملف `.env`
- [ ] تم تحديث Firebase Config في HTML
- [ ] تم تثبيت المكتبات
- [ ] تم بدء الخادم بنجاح
- [ ] تم اختبار التسجيل والدخول

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من Firebase Console للأخطاء
2. راجع السجلات في الخادم
3. تأكد من اتصال الإنترنت
4. أعد تشغيل الخادم

---

**آخر تحديث:** 2024
