// تأثيرات ديناميكية إضافية

// تأثير الظهور عند التمرير
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// مراقبة عناصر المنتجات والخدمات
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.product-card, .service-card, .info-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });

    // إضافة تأثير الحركة للشعار
    const logo = document.querySelector('.logo h1');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.6s ease-in-out';
        });
        
        logo.addEventListener('animationend', function() {
            this.style.animation = 'none';
        });
    }

    // تأثير الزر عند الضغط
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease-out';
        });
    }

    // تأثير التمرير السلس
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// تأثير الضوء عند الحركة
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.product-card, .service-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // حساب المسافة من الوسط
        const distance = Math.sqrt(
            Math.pow(x - rect.width / 2, 2) + 
            Math.pow(y - rect.height / 2, 2)
        );
        
        // إضافة تأثير الضوء إذا كانت المسافة قريبة
        if (distance < 300) {
            const opacity = 1 - (distance / 300);
            card.style.boxShadow = `0 0 ${30 * opacity}px rgba(157, 139, 92, ${0.5 * opacity})`;
        }
    });
});

// تأثير الإطار الدوار (Spinning Tire)
function createSpinningTire() {
    const tires = document.querySelectorAll('.product-image');
    tires.forEach(tire => {
        tire.addEventListener('mouseenter', function() {
            this.style.animation = 'spin 2s linear infinite';
        });
        
        tire.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
        });
    });
}

// استدعاء الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    createSpinningTire();
});

// تأثير الموجة عند التمرير
function createWaveEffect() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            navbar.style.background = `linear-gradient(
                ${135 + x * 45}deg,
                var(--primary-dark) 0%,
                var(--secondary-gray) ${50 + y * 20}%,
                var(--primary-gold) 100%
            )`;
        });
    }
}

document.addEventListener('DOMContentLoaded', createWaveEffect);

// تأثير الفقاعات العائمة
function createFloatingBubbles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            position: absolute;
            width: ${Math.random() * 100 + 50}px;
            height: ${Math.random() * 100 + 50}px;
            background: radial-gradient(circle at 30% 30%, rgba(157, 139, 92, 0.2), transparent);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 3 + 3}s ease-in-out infinite;
            z-index: 0;
        `;
        hero.appendChild(bubble);
    }
}

document.addEventListener('DOMContentLoaded', createFloatingBubbles);
