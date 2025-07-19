const cartItems = {}; // เก็บข้อมูลสินค้าในตะกร้า { "ชื่อหนังสือ": จำนวน }

const bookPrices = {
    "เอื้อมพระเกี้ยวเช้า": 1,
    "เอื้อมพระเกี้ยวบ่าย": 1,
    "หนังสือสินิทธ์": 1
};



// โค้ดหลักที่จะเริ่มทำงานเมื่อหน้าเว็บโหลดเสร็จสมบูรณ์
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- ระบบ Tab Navigation ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetId)?.classList.add('active');

            if (targetId === 'pre-order') {
                updateOrderSummary();
            }
        });
    });

    // --- ฟังก์ชันสำหรับระบบตะกร้าสินค้า ---
    function addToCart(bookName) {
        cartItems[bookName] = (cartItems[bookName] || 0) + 1;
        showNotification(`${bookName} ถูกเพิ่มลงในตะกร้าแล้ว!`);
        renderCartPopup(); // อัปเดต Popup ตะกร้าทุกครั้งที่เพิ่มของ
    }

    function calculateTotalPrice() {
        let total = 0;
        for (const bookName in cartItems) {
            if (bookPrices[bookName]) {
                total += cartItems[bookName] * bookPrices[bookName];
            }
        }
        return total;
    }

    function showNotification(message) {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notification = document.createElement('div');
        notification.className = 'notification show';
        notification.textContent = message;
        container.appendChild(notification);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 500);
        }, 3000);
    }

    // --- ทำให้ปุ่ม "เพิ่มลงตะกร้า" ในหน้า Home ทำงาน ---
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // ป้องกันไม่ให้ Popup ของหนังสือเปิดขึ้นมาพร้อมกัน
            const bookName = button.getAttribute('data-book');
            addToCart(bookName);
        });
    });

    // --- ระบบ Popup ของหนังสือแต่ละเล่ม ---
    function setupPopup(openId, popupId, closeId) {
        const openButton = document.getElementById(openId);
        const popup = document.getElementById(popupId);
        const closeButton = document.getElementById(closeId);

        openButton?.addEventListener('click', () => popup.style.display = 'flex');
        closeButton?.addEventListener('click', () => popup.style.display = 'none');
        popup?.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
            }
        });
    }
    setupPopup('openPopup', 'popup', 'closePopup');
    setupPopup('openPopup2', 'popup2', 'closePopup2');
    setupPopup('openPopup3', 'popup3', 'closePopup3');


    // --- ระบบ Popup ตะกร้าสินค้า ---
    const cartIconButton = document.getElementById('sticky');
    const cartPopup = document.getElementById('cart-popup');
    const closeCartButton = document.querySelector('.cart-close-button');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceSpan = document.getElementById('cart-total-price');
    const checkoutButton = document.getElementById('checkout-button');

    cartIconButton?.addEventListener('click', () => {
        renderCartPopup();
        cartPopup.style.display = 'block';
    });
    closeCartButton?.addEventListener('click', () => cartPopup.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target == cartPopup) {
            cartPopup.style.display = 'none';
        }
    });
    checkoutButton?.addEventListener('click', () => {
        document.querySelector('.tab-link[href="#pre-order"]').click();
        cartPopup.style.display = 'none';
    });

    function renderCartPopup() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        const bookNames = Object.keys(cartItems);

        if (bookNames.length === 0) {
            cartItemsContainer.innerHTML = '<p>ตะกร้าของคุณว่างเปล่า</p>';
            cartTotalPriceSpan.textContent = '0 THB';
            return;
        }

        bookNames.forEach(bookName => {
            const quantity = cartItems[bookName];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <span>${bookName}</span>
                <div class="cart-item-controls">
                    <button data-book="${bookName}" class="cart-decrease">-</button>
                    <span>${quantity}</span>
                    <button data-book="${bookName}" class="cart-increase">+</button>
                    <button data-book="${bookName}" class="cart-remove">×</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        cartTotalPriceSpan.textContent = `${calculateTotalPrice()} THB`;
    }

    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const bookName = target.getAttribute('data-book');
        if (!bookName) return;

        if (target.classList.contains('cart-increase')) {
            cartItems[bookName]++;
        } else if (target.classList.contains('cart-decrease')) {
            cartItems[bookName] > 1 ? cartItems[bookName]-- : delete cartItems[bookName];
        } else if (target.classList.contains('cart-remove')) {
            delete cartItems[bookName];
        }
        
        renderCartPopup();
        updateOrderSummary(); // อัปเดตหน้า Order ด้วย
    });
    
    function updateOrderSummary() {
        const summaryDiv = document.getElementById('order-summary');
        const totalPriceH4 = document.getElementById('order-total-price');
        const orderDataInput = document.getElementById('order-data');

        if (!summaryDiv) return;

        const bookNames = Object.keys(cartItems);

        if (bookNames.length === 0) {
            summaryDiv.innerHTML = "กรุณาเลือกสินค้า...";
            totalPriceH4.textContent = "ราคารวม: 0 THB";
            orderDataInput.value = "";
            return;
        }

        let summaryHTML = '<ul>' + bookNames.map(book => `<li>${book} (จำนวน: ${cartItems[book]})</li>`).join('') + '</ul>';
        let dataString = bookNames.map(book => `${book} (x${cartItems[book]})`).join(', ');
        const totalPrice = calculateTotalPrice();

        summaryDiv.innerHTML = summaryHTML;
        totalPriceH4.textContent = `ราคารวม: ${totalPrice} THB`;
        orderDataInput.value = dataString;
    }
    window.updateOrderSummary = updateOrderSummary;
    // --- ระบบปุ่มลัดบนหน้า Order ---
    const quickAddBook1 = document.getElementById('quick-add-book1');
    const quickAddBook2 = document.getElementById('quick-add-book2');
    const quickAddBook3 = document.getElementById('quick-add-book3');
    const quickAddAll = document.getElementById('quick-add-all');

    // ปุ่มสำหรับหนังสือเล่มที่ 1
    quickAddBook1?.addEventListener('click', () => {
        addToCart("เอื้อมพระเกี้ยวเช้า");
        updateOrderSummary(); // อัปเดตสรุปรายการทันที
    });

    // ปุ่มสำหรับหนังสือเล่มที่ 2
    quickAddBook2?.addEventListener('click', () => {
        addToCart("เอื้อมพระเกี้ยวบ่าย");
        updateOrderSummary();
    });

    // ปุ่มสำหรับหนังสือเล่มที่ 3
    quickAddBook3?.addEventListener('click', () => {
        addToCart("หนังสือสินิทธ์");
        updateOrderSummary();
    });

    // ปุ่มสำหรับสั่งซื้อทั้ง 3 เล่ม
    quickAddAll?.addEventListener('click', () => {
        addToCart("เอื้อมพระเกี้ยวเช้า");
        addToCart("เอื้อมพระเกี้ยวบ่าย");
        addToCart("หนังสือสินิทธ์");
        showNotification("หนังสือทั้ง 3 เล่มถูกเพิ่มลงตะกร้าแล้ว!");
        updateOrderSummary();
    });

    // --- ระบบฟอร์มสั่งซื้อ (Pre-order Form) ---
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', e => {
            e.preventDefault();
            const responseMessage = document.getElementById('response-message');
            const orderData = document.getElementById('order-data').value;
            if (!orderData) {
                responseMessage.innerHTML = "❌ กรุณาเลือกสินค้าก่อน";
                return;
            }
            responseMessage.innerHTML = "กำลังส่งข้อมูล...";
            const data = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                gmail: document.getElementById('gmail').value,
                address: document.getElementById('address').value,
                order: orderData,
                total: document.getElementById('order-total-price').textContent
            };

            const scriptURL = 'https://script.google.com/macros/s/AKfycbwfuvTM9mtVGe96XYJ4wrcmn4w3bcrdt4eQLkKPxVSDLl6C6kEZnCHGOVLNi2NI39nk/exec'; 

            fetch(scriptURL, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => res.text())
            .then(msg => {
                responseMessage.innerHTML = "✅ ส่งข้อมูลเรียบร้อยแล้ว!";
                orderForm.reset();
                Object.keys(cartItems).forEach(key => delete cartItems[key]);
                updateOrderSummary();
                renderCartPopup();
                setTimeout(() => { responseMessage.innerHTML = ''; }, 5000);
            })
            .catch(err => {
                responseMessage.innerHTML = "❌ เกิดข้อผิดพลาด กรุณาลองใหม่";
                console.error(err);
            });
        });
    }

    // --- ระบบค้นหา Tracking Number ---
    const searchButton = document.querySelector('.tracking-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const resultDiv = document.getElementById('result');
            const nameInput = document.getElementById('tracking-name');
            const phoneInput = document.getElementById('tracking-phone');
            
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name || !phone) {
                resultDiv.innerHTML = '<p style="color: yellow;">กรุณากรอกทั้งชื่อและเบอร์โทรศัพท์</p>';
                return;
            }
            resultDiv.innerHTML = '<p>กำลังค้นหา...</p>';
            
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwfuvTM9mtVGe96XYJ4wrcmn4w3bcrdt4eQLkKPxVSDLl6C6kEZnCHGOVLNi2NI39nk/exec'; 
            const searchURL = `${scriptURL}?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`;
            
            fetch(searchURL)
                .then(res => res.json())
                .then(data => {
                    if (data.found && data.tracking) {
                        resultDiv.innerHTML = `<p>สถานะ: พบข้อมูล<br>Tracking Number: <strong>${data.tracking}</strong></p>`;
                    } else {
                        resultDiv.innerHTML = '<p style="color: red;">ไม่พบข้อมูลการสั่งซื้อ</p>';
                    }
                })
                .catch(error => {
                    resultDiv.innerHTML = '<p style="color: red;">เกิดข้อผิดพลาดในการเชื่อมต่อ</p>';
                    console.error('Error:', error);
                });
        });
    }
    
});
document.addEventListener('contextmenu', event => event.preventDefault());