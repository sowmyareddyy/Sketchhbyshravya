// script.js

const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const modeLabel = document.querySelector('.mode-label');

// Dark Mode
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.checked = true;
    modeLabel.textContent = 'Dark Mode';
}

themeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    modeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Cart Logic
let cart = {};

function updateCartDisplay() {
    const cartItems = document.querySelector('#cart-items');
    const cartTotal = document.querySelector('#cart-total');
    cartItems.innerHTML = '';
    let total = 0;

    Object.keys(cart).forEach(itemId => {
        const item = cart[itemId];
        const li = document.createElement('li');
        li.textContent = `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`;
        cartItems.appendChild(li);
        total += item.price * item.quantity;

        // Update visible quantity near product
        const qtySpan = document.getElementById(`qty-${itemId}`);
        if (qtySpan) qtySpan.textContent = item.quantity;
    });

    // Reset counts for items not in cart
    document.querySelectorAll('.qty-count').forEach(span => {
        const id = span.id.replace('qty-', '');
        if (!cart[id]) span.textContent = '0';
    });

    if (total > 0) total += 100; // Delivery Charge
    cartTotal.textContent = `Total: ₹${total}`;
}


function addToCart(id, name, price, section) {
    if (section === 'painting' && cart[id]) {
        alert('Only 1 painting allowed. DM on WhatsApp for more.');
        return;
    }
    if (section === 'craft' && cart[id] && cart[id].quantity >= 8) {
        alert('Only 8 craft items allowed at a time. DM on WhatsApp for bulk orders.');
        return;
    }

    if (!cart[id]) {
        cart[id] = {
            name,
            price,
            quantity: 1
        };
    } else {
        cart[id].quantity += 1;
    }

    updateCartDisplay();
}

function removeFromCart(id) {
    if (cart[id]) {
        cart[id].quantity -= 1;
        if (cart[id].quantity <= 0) delete cart[id];
    }
    updateCartDisplay();
}

function validateForm() {
    const name = document.querySelector('#cust-name').value.trim();
    const address = document.querySelector('#cust-address').value.trim();
    const pincode = document.querySelector('#cust-pincode').value.trim();
    const phone = document.querySelector('#cust-phone').value.trim();

    if (!name || !address || !pincode || !phone) {
        alert('Please fill in all fields.');
        return false;
    }

    if (!/^\d{6}$/.test(pincode)) {
        alert('Enter a valid 6-digit pincode.');
        return false;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert('Enter a valid 10-digit phone number.');
        return false;
    }

    return true;
}

function showSuccessMessage() {
    alert('🎉 Congrats! Order placed successfully.');
    document.querySelector('#order-form').reset();
    document.querySelector('#order-form-section').style.display = 'none';
    cart = {};
    updateCartDisplay();
}

// Attach handlers dynamically
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-add]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            const price = parseFloat(btn.dataset.price);
            const section = btn.dataset.section;
            addToCart(id, name, price, section);
        });
    });

    document.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            removeFromCart(id);
        });
    });

    document.getElementById('pay-now').addEventListener('click', () => {
        if (Object.keys(cart).length === 0) {
            alert('Your cart is empty!');
            return;
        }
        document.querySelector('#order-form-section').scrollIntoView({
            behavior: 'smooth'
        });
        document.querySelector('#order-form-section').style.display = 'block';
    });

    document.getElementById('pay-now-final').addEventListener('click', () => {
        if (!validateForm()) return;
        window.open('https://phon.pe/YOUR-LINK-HERE', '_blank');
        showSuccessMessage();

        // Email notification to seller (optional)
        fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: document.querySelector('#cust-name').value,
                address: document.querySelector('#cust-address').value,
                pincode: document.querySelector('#cust-pincode').value,
                phone: document.querySelector('#cust-phone').value,
                message: 'New order placed on Art Portfolio!'
            })
        });
    });
});