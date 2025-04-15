// Place Order
document.getElementById('shipping-form')?.addEventListener('submit', placeOrder);

async function placeOrder(e) {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'auth.html?redirect=checkout';
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // Get shipping info
    const shippingInfo = {
        name: document.getElementById('full-name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        phone: document.getElementById('phone').value
    };
    
    // Get payment method
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Validate form
    if (!validateShippingForm(shippingInfo)) {
        return;
    }
    
    // Payment validation (simplified)
    if (paymentMethod === 'credit-card') {
        if (!validateCreditCard()) {
            return;
        }
    }
    
    try {
        // Get product details for price calculation
        const productIds = cart.map(item => item.id);
        const snapshot = await db.collection('products').where(firebase.firestore.FieldPath.documentId(), 'in', productIds).get();
        
        const products = {};
        snapshot.forEach(doc => {
            products[doc.id] = doc.data();
        });
        
        // Calculate totals
        const subtotal = cart.reduce((total, item) => {
            return total + (products[item.id].price * item.quantity);
        }, 0);
        
        const shipping = 5.99;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;
        
        // Create order document
        const orderData = {
            userId: user.uid,
            userEmail: user.email,
            shippingInfo: shippingInfo,
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: products[item.id].price,
                name: products[item.id].name
            })),
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total,
            status: 'processing',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add order to Firestore
        const orderRef = await db.collection('orders').add(orderData);
        
        // Clear cart
        localStorage.removeItem('cart');
        updateCartCount();
        
        // Redirect to thank you page (or order confirmation)
        window.location.href = `order-confirmation.html?id=${orderRef.id}`;
    } catch (error) {
        console.error('Error placing order:', error);
        alert('There was an error placing your order. Please try again.');
    }
}

// Validate Shipping Form
function validateShippingForm(shippingInfo) {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate each field
    if (!shippingInfo.name.trim()) {
        showFieldError('full-name', 'Please enter your full name');
        isValid = false;
    }
    
    if (!shippingInfo.address.trim()) {
        showFieldError('address', 'Please enter your address');
        isValid = false;
    }
    
    if (!shippingInfo.city.trim()) {
        showFieldError('city', 'Please enter your city');
        isValid = false;
    }
    
    if (!shippingInfo.state.trim()) {
        showFieldError('state', 'Please enter your state');
        isValid = false;
    }
    
    if (!shippingInfo.zip.trim()) {
        showFieldError('zip', 'Please enter your ZIP code');
        isValid = false;
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zip)) {
        showFieldError('zip', 'Please enter a valid ZIP code');
        isValid = false;
    }
    
    if (!shippingInfo.phone.trim()) {
        showFieldError('phone', 'Please enter your phone number');
        isValid = false;
    }
    
    return isValid;
}

// Validate Credit Card (simplified)
function validateCreditCard() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    const cardNumber = document.getElementById('card-number').value.trim();
    const expiry = document.getElementById('expiry').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    const cardName = document.getElementById('card-name').value.trim();
    
    // Very basic validation
    if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        showFieldError('card-number', 'Please enter a valid card number');
        isValid = false;
    }
    
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        showFieldError('expiry', 'Please enter a valid expiry date (MM/YY)');
        isValid = false;
    }
    
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        showFieldError('cvv', 'Please enter a valid CVV');
        isValid = false;
    }
    
    if (!cardName) {
        showFieldError('card-name', 'Please enter the name on card');
        isValid = false;
    }
    
    return isValid;
}

// Show field error message
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    field.parentNode.appendChild(errorElement);
    field.focus();
}