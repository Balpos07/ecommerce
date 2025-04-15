// Load Cart Items
async function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutItemsContainer = document.getElementById('checkout-items');
    
    if (!cartItemsContainer && !checkoutItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                    <a href="products.html" class="btn">Continue Shopping</a>
                </div>
            `;
        }
        return;
    }
    
    try {
        // Get all product details at once
        const productIds = cart.map(item => item.id);
        const snapshot = await db.collection('products').where(firebase.firestore.FieldPath.documentId(), 'in', productIds).get();
        
        const products = {};
        snapshot.forEach(doc => {
            products[doc.id] = doc.data();
        });
        
        // Render cart items
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            
            cart.forEach(item => {
                const product = products[item.id];
                if (!product) return;
                
                cartItemsContainer.innerHTML += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${product.imageURL}" alt="${product.name}">
                        </div>
                        <div class="cart-item-details">
                            <h3>${product.name}</h3>
                            <div class="cart-item-price">$${product.price.toFixed(2)}</div>
                            <div class="cart-item-quantity">
                                <button class="decrease">-</button>
                                <input type="number" value="${item.quantity}" min="1">
                                <button class="increase">+</button>
                            </div>
                        </div>
                        <div class="cart-item-remove">
                            <i class="fas fa-trash"></i>
                        </div>
                    </div>
                `;
            });
            
            // Add event listeners
            document.querySelectorAll('.cart-item .decrease').forEach(button => {
                button.addEventListener('click', decreaseQuantity);
            });
            
            document.querySelectorAll('.cart-item .increase').forEach(button => {
                button.addEventListener('click', increaseQuantity);
            });
            
            document.querySelectorAll('.cart-item-remove').forEach(button => {
                button.addEventListener('click', removeItem);
            });
            
            document.querySelectorAll('.cart-item input').forEach(input => {
                input.addEventListener('change', updateQuantity);
            });
        }
        
        // Render checkout items (simplified)
        if (checkoutItemsContainer) {
            checkoutItemsContainer.innerHTML = '';
            
            cart.forEach(item => {
                const product = products[item.id];
                if (!product) return;
                
                checkoutItemsContainer.innerHTML += `
                    <div class="summary-item">
                        <div class="summary-item-image">
                            <img src="${product.imageURL}" alt="${product.name}">
                        </div>
                        <div class="summary-item-details">
                            <h4>${product.name}</h4>
                            <p>Qty: ${item.quantity}</p>
                        </div>
                        <div class="summary-item-price">
                            $${(product.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `;
            });
        }
        
        // Calculate and update totals
        updateCartTotals(cart, products);
    } catch (error) {
        console.error('Error loading cart items:', error);
    }
}

// Update Cart Totals
function updateCartTotals(cart, products) {
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => {
        const product = products[item.id];
        return total + (product.price * item.quantity);
    }, 0);
    
    // Shipping (fixed for now)
    const shipping = 5.99;
    
    // Tax (simplified calculation)
    const taxRate = 0.08; // 8%
    const tax = subtotal * taxRate;
    
    // Total
    const total = subtotal + shipping + tax;
    
    // Update cart page totals
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }
    
    // Update checkout page totals
    if (document.getElementById('checkout-subtotal')) {
        document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('checkout-shipping').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('checkout-tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
    }
}

// Decrease Quantity
function decreaseQuantity(e) {
    const cartItem = e.target.closest('.cart-item');
    const productId = cartItem.getAttribute('data-id');
    const input = cartItem.querySelector('input');
    
    if (parseInt(input.value) > 1) {
        input.value--;
        updateCartItemQuantity(productId, parseInt(input.value));
    }
}

// Increase Quantity
function increaseQuantity(e) {
    const cartItem = e.target.closest('.cart-item');
    const productId = cartItem.getAttribute('data-id');
    const input = cartItem.querySelector('input');
    
    input.value++;
    updateCartItemQuantity(productId, parseInt(input.value));
}

// Update Quantity
function updateQuantity(e) {
    const cartItem = e.target.closest('.cart-item');
    const productId = cartItem.getAttribute('data-id');
    const quantity = parseInt(e.target.value);
    
    if (quantity >= 1) {
        updateCartItemQuantity(productId, quantity);
    } else {
        e.target.value = 1;
    }
}

// Update Cart Item Quantity
function updateCartItemQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Reload cart items to update totals
        loadCartItems();
    }
}

// Remove Item from Cart
function removeItem(e) {
    const cartItem = e.target.closest('.cart-item');
    const productId = cartItem.getAttribute('data-id');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Remove item from DOM
    cartItem.remove();
    
    // If cart is now empty, show empty message
    if (cart.length === 0 && document.getElementById('cart-items')) {
        document.getElementById('cart-items').innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="products.html" class="btn">Continue Shopping</a>
            </div>
        `;
        
        // Reset totals
        document.getElementById('subtotal').textContent = '$0.00';
        document.getElementById('shipping').textContent = '$0.00';
        document.getElementById('tax').textContent = '$0.00';
        document.getElementById('total').textContent = '$0.00';
    } else {
        // Reload cart items to update totals
        loadCartItems();
    }
    
    // Show notification
    showNotification('Item removed from cart');
}

// Load Checkout Items (simplified version of loadCartItems)
async function loadCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (!checkoutItemsContainer) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    try {
        // Get all product details at once
        const productIds = cart.map(item => item.id);
        const snapshot = await db.collection('products').where(firebase.firestore.FieldPath.documentId(), 'in', productIds).get();
        
        const products = {};
        snapshot.forEach(doc => {
            products[doc.id] = doc.data();
        });
        
        // Render checkout items
        checkoutItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const product = products[item.id];
            if (!product) return;
            
            checkoutItemsContainer.innerHTML += `
                <div class="summary-item">
                    <div class="summary-item-image">
                        <img src="${product.imageURL}" alt="${product.name}">
                    </div>
                    <div class="summary-item-details">
                        <h4>${product.name}</h4>
                        <p>Qty: ${item.quantity}</p>
                    </div>
                    <div class="summary-item-price">
                        $${(product.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `;
        });
        
        // Calculate and update totals
        updateCartTotals(cart, products);
    } catch (error) {
        console.error('Error loading checkout items:', error);
    }
}