// متغير لتخزين معرف المنتج المراد تعديله
let editingProductId = null;
let currentProductImage = null;

// تحميل المنتجات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateDashboard();

    // إضافة مستمع لحقل الصورة
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentProductImage = event.target.result;
                    document.getElementById('preview-img').src = currentProductImage;
                    document.getElementById('image-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// عرض/إخفاء الأقسام
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // إظهار القسم المختار
    document.getElementById(sectionId).classList.add('active');

    // تحديث الروابط النشطة
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// تحميل المنتجات من الخادم
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProductsTable(products);
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        document.getElementById('products-tbody').innerHTML = '<tr><td colspan="6" class="no-data">خطأ في تحميل المنتجات</td></tr>';
    }
}

// عرض المنتجات في الجدول
function displayProductsTable(products) {
    const tbody = document.getElementById('products-tbody');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">لا توجد منتجات</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.size}</td>
            <td>${product.price} ريال</td>
            <td>${product.quantity}</td>
            <td>
                <span class="status-badge ${product.quantity > 0 ? 'status-available' : 'status-out-of-stock'}">
                    ${product.quantity > 0 ? 'متاح' : 'منتهي'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-edit" onclick="editProduct('${product.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// عرض نموذج إضافة منتج
function showAddProductForm() {
    editingProductId = null;
    currentProductImage = null;
    document.getElementById('form-title').textContent = 'إضافة منتج جديد';
    document.getElementById('product-form').reset();
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('product-form-container').style.display = 'block';
}

// إخفاء نموذج إضافة منتج
function hideAddProductForm() {
    document.getElementById('product-form-container').style.display = 'none';
    editingProductId = null;
    currentProductImage = null;
}

// تعديل منتج
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        document.getElementById('form-title').textContent = 'تعديل المنتج';
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-size').value = product.size;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = product.quantity;

        currentProductImage = product.image || null;
        if (currentProductImage) {
            document.getElementById('preview-img').src = currentProductImage;
            document.getElementById('image-preview').style.display = 'block';
        } else {
            document.getElementById('image-preview').style.display = 'none';
        }

        editingProductId = productId;
        document.getElementById('product-form-container').style.display = 'block';
    } catch (error) {
        console.error('خطأ في تحميل المنتج:', error);
        alert('حدث خطأ في تحميل بيانات المنتج');
    }
}

// حفظ المنتج (إضافة أو تعديل)
async function handleProductSubmit(event) {
    event.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        size: document.getElementById('product-size').value,
        price: parseFloat(document.getElementById('product-price').value),
        quantity: parseInt(document.getElementById('product-quantity').value),
        image: currentProductImage
    };

    try {
        let response;
        if (editingProductId) {
            // تعديل منتج موجود
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // إضافة منتج جديد
            response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            alert(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
            hideAddProductForm();
            loadProducts();
            updateDashboard();
        } else {
            alert('حدث خطأ في حفظ المنتج');
        }
    } catch (error) {
        console.error('خطأ:', error);
        alert('حدث خطأ في الاتصال بالخادم');
    }
}

// حذف منتج
async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('تم حذف المنتج بنجاح');
            loadProducts();
            updateDashboard();
        } else {
            alert('حدث خطأ في حذف المنتج');
        }
    } catch (error) {
        console.error('خطأ:', error);
        alert('حدث خطأ في الاتصال بالخادم');
    }
}

// تحديث لوحة المعلومات
async function updateDashboard() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        const totalProducts = products.length;
        const availableProducts = products.filter(p => p.quantity > 0).length;
        const outOfStock = products.filter(p => p.quantity === 0).length;

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('available-products').textContent = availableProducts;
        document.getElementById('out-of-stock').textContent = outOfStock;
    } catch (error) {
        console.error('خطأ في تحديث لوحة المعلومات:', error);
    }
}
