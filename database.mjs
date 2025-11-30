import mongoose from 'mongoose';

/**
 * الاتصال بقاعدة بيانات MongoDB
 */
export const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI غير محدد في متغيرات البيئة');
        }

        const connection = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ تم الاتصال بقاعدة البيانات: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error(`❌ خطأ في الاتصال بقاعدة البيانات: ${error.message}`);
        process.exit(1);
    }
};

/**
 * قطع الاتصال بقاعدة البيانات
 */
export const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ تم قطع الاتصال بقاعدة البيانات');
    } catch (error) {
        console.error(`❌ خطأ في قطع الاتصال: ${error.message}`);
        process.exit(1);
    }
};

/**
 * التعامل مع أخطاء الاتصال
 */
mongoose.connection.on('error', (error) => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ تم قطع الاتصال بقاعدة البيانات');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ تم إعادة الاتصال بقاعدة البيانات');
});
