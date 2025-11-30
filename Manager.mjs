import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const managerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'اسم المستخدم مطلوب'],
            unique: true,
            trim: true,
            minlength: [3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'],
            maxlength: [50, 'اسم المستخدم يجب ألا يتجاوز 50 حرف']
        },
        password: {
            type: String,
            required: [true, 'كلمة المرور مطلوبة'],
            minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
            select: false // لا تُرجع كلمة المرور افتراضياً
        },
        email: {
            type: String,
            required: [true, 'البريد الإلكتروني مطلوب'],
            unique: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
        },
        fullName: {
            type: String,
            required: [true, 'الاسم الكامل مطلوب'],
            trim: true
        },
        role: {
            type: String,
            enum: ['admin', 'manager'],
            default: 'manager'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastLogin: {
            type: Date,
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        collection: 'managers'
    }
);

// تشفير كلمة المرور قبل الحفظ
managerSchema.pre('save', async function(next) {
    // إذا لم تتم تعديل كلمة المرور، تابع
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // توليد salt
        const salt = await bcryptjs.genSalt(10);
        
        // تشفير كلمة المرور
        this.password = await bcryptjs.hash(this.password, salt);
        
        next();
    } catch (error) {
        next(error);
    }
});

// دالة للتحقق من كلمة المرور
managerSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcryptjs.compare(enteredPassword, this.password);
};

// دالة لتحديث آخر تسجيل دخول
managerSchema.methods.updateLastLogin = async function() {
    this.lastLogin = Date.now();
    await this.save();
};

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;
