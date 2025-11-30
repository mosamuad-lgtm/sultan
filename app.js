// تحميل المنتجات من الخادم
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        document.getElementById('products-grid').innerHTML = '<div class="loading">عذراً، حدث خطأ في تحميل المنتجات</div>';
    }
}

// عرض المنتجات
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="loading">لا توجد منتجات متاحة حالياً</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image ? `<img src="${product.image}" alt="${product.name}">` : '🛞'}</div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-size">الحجم: ${product.size}</div>
                <div class="product-price">${product.price} ريال</div>
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name}')">أضف للسلة</button>
            </div>
        </div>
    `).join('');
}

// إضافة المنتج للسلة
function addToCart(productId, productName) {
    alert(`تمت إضافة ${productName} إلى السلة`);
    // يمكن تطوير هذه الوظيفة لاحقاً
}

// تحميل صورة من ملف محلي
function loadImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// تحميل المنتجات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadProducts);
