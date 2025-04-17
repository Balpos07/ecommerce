
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBaP_tOf8UoALDfwOSnRc05RyyHq3SYMzQ",
    authDomain: "mediashop-1c505.firebaseapp.com",
    projectId: "mediashop-1c505",
    // storageBucket: "mediashop-1c505.firebasestorage.app",
    messagingSenderId: "902470795591",
    appId: "1:902470795591:web:667b8f15e10377a8ab4c62"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// const storage = firebase.storage();

// Check Authentication Status
function checkAuthStatus() {
    auth.onAuthStateChanged(user => {
        const authLink = document.getElementById('auth-link');
        if (user) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = () => {
                auth.signOut().then(() => {
                    window.location.href = 'index.html';
                });
            };
        } else {
            authLink.textContent = 'Login';
            authLink.href = 'auth.html';
            authLink.onclick = null;
        }
    });
}

// Load Featured Products
async function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;

    try {
        const snapshot = await db.collection('products').where('featured', '==', true).limit(4).get();
        featuredContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            featuredContainer.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)}
                        </div>
                        <button class="btn add-to-cart" data-id="${doc.id}">Add to Cart</button>
                    </div>
                </div>
            `;
        });

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

// Load All Products
async function loadAllProducts() {
    const productsContainer = document.getElementById('all-products');
    if (!productsContainer) return;

    try {
        const snapshot = await db.collection('products').get();
        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            productsContainer.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)}
                        </div>
                        <a href="product-detail.html?id=${doc.id}" class="btn">View Details</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Filter Products
async function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const productsContainer = document.getElementById('all-products');
    
    try {
        let query = db.collection('products');
        
        if (category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        const snapshot = await query.get();
        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            productsContainer.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)}
                        </div>
                        <a href="product-detail.html?id=${doc.id}" class="btn">View Details</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

// Sort Products
async function sortProducts() {
    const sortBy = document.getElementById('sort-by').value;
    const productsContainer = document.getElementById('all-products');
    
    try {
        let query = db.collection('products');
        
        switch (sortBy) {
            case 'price-asc':
                query = query.orderBy('price', 'asc');
                break;
            case 'price-desc':
                query = query.orderBy('price', 'desc');
                break;
            case 'name-asc':
                query = query.orderBy('name', 'asc');
                break;
            default:
                // No sorting
                break;
        }
        
        const snapshot = await query.get();
        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            productsContainer.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)}
                        </div>
                        <a href="product-detail.html?id=${doc.id}" class="btn">View Details</a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error sorting products:', error);
    }
}

// Load Product Details
async function loadProductDetails(productId) {
    const productContainer = document.getElementById('product-detail');
    if (!productContainer) return;

    try {
        const doc = await db.collection('products').doc(productId).get();
        
        if (!doc.exists) {
            window.location.href = 'products.html';
            return;
        }
        
        const product = doc.data();
        
        productContainer.innerHTML = `
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${product.imageURL}" alt="${product.name}">
                </div>
                <div class="thumbnail">
                    <img src="${product.imageURL}" alt="${product.name}">
                </div>
                <div class="thumbnail">
                    <img src="${product.imageURL}" alt="${product.name}">
                </div>
            </div>
            <div class="product-content">
                <h1>${product.name}</h1>
                <div class="product-rating">
                    ${getRatingStars(product.rating)} (${product.reviews} reviews)
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-description">
                    <p>${product.description}</p>
                </div>
                <div class="quantity-selector">
                    <button class="decrease">-</button>
                    <input type="number" value="1" min="1" id="quantity">
                    <button class="increase">+</button>
                </div>
                <button class="btn add-to-cart" data-id="${doc.id}" style="width: 100%;">Add to Cart</button>
            </div>
        `;
        
        // Add event listener to "Add to Cart" button
        document.querySelector('.add-to-cart').addEventListener('click', addToCart);
        
        // Quantity selector functionality
        document.querySelector('.decrease').addEventListener('click', () => {
            const quantityInput = document.getElementById('quantity');
            if (quantityInput.value > 1) {
                quantityInput.value--;
            }
        });
        
        document.querySelector('.increase').addEventListener('click', () => {
            const quantityInput = document.getElementById('quantity');
            quantityInput.value++;
        });
        
        // Thumbnail click functionality
        document.querySelectorAll('.thumbnail img').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const mainImage = document.querySelector('.main-image img');
                mainImage.src = thumb.src;
            });
        });
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Add to Cart Function
function addToCart(event) {
    const productId = event.target.getAttribute('data-id');
    let quantity = 1;
    
    // Check if we're on the product detail page with quantity selector
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantity = parseInt(quantityInput.value);
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show notification
    showNotification('Product added to cart!');
}

// Update Cart Count in Header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Helper function to generate rating stars
function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Notification Styles (added dynamically)
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--success-color);
    color: white;
    padding: 15px 25px;
    border-radius: 4px;
    box-shadow: var(--box-shadow);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
}

.notification.show {
    opacity: 1;
}
`;
document.head.appendChild(notificationStyles);