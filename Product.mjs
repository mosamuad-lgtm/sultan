import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'اسم المنتج مطلوب'],
            trim: true,
            maxlength: [100, 'لا يمكن أن يتجاوز اسم المنتج 100 حرف']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'لا يمكن أن يتجاوز الوصف 500 حرف'],
            default: ''
        },
        size: {
            type: String,
            trim: true,
            maxlength: [50, 'لا يمكن أن يتجاوز الحجم 50 حرف'],
            default: ''
        },
        price: {
            type: Number,
            required: [true, 'السعر مطلوب'],
            min: [0, 'السعر يجب أن يكون موجباً']
        },
        quantity: {
            type: Number,
            default: 0,
            min: [0, 'الكمية يجب أن تكون موجبة']
        },
        image: {
            type: String, // Base64 encoded image
            default: null
        },
        category: {
            type: String,
            default: 'عام'
        },
        sku: {
            type: String,
            unique: true,
            sparse: true,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
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
        collection: 'products'
    }
);

// تحديث updatedAt تلقائياً
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// إنشاء فهرس للبحث السريع
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
