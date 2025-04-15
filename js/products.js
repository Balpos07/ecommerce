// Global variables for pagination
let currentPage = 1;
const productsPerPage = 8; // Adjust as needed

// Enhanced Load All Products with Pagination
async function loadAllProducts() {
    const productsContainer = document.getElementById('all-products');
    const loadingState = document.getElementById('loading-state');
    const noProducts = document.getElementById('no-products');
    
    if (!productsContainer) return;
    
    // Show loading state
    productsContainer.innerHTML = '';
    loadingState.classList.remove('hidden');
    noProducts.classList.add('hidden');
    
    try {
        let query = db.collection('products');
        
        // Get total count for pagination
        const countQuery = await query.count().get();
        const totalProducts = countQuery.data().count;
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        
        // Apply pagination
        query = query.limit(productsPerPage).offset((currentPage - 1) * productsPerPage);
        
        const snapshot = await query.get();
        loadingState.classList.add('hidden');
        
        if (snapshot.empty) {
            noProducts.classList.remove('hidden');
            return;
        }
        
        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            const isNew = product.createdAt && 
                         (new Date() - product.createdAt.toDate()) < (30 * 24 * 60 * 60 * 1000); // New if < 30 days old
            
            productsContainer.innerHTML += `
                <div class="product-card">
                    ${isNew ? '<div class="product-badge">New</div>' : ''}
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">
                            ${product.discountedPrice ? `
                                <span class="original-price">$${product.price.toFixed(2)}</span>
                                <span>$${product.discountedPrice.toFixed(2)}</span>
                            ` : `$${product.price.toFixed(2)}`}
                        </div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)} (${product.reviews || 0})
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn quick-view" data-id="${doc.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn add-to-wishlist" data-id="${doc.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn add-to-cart" data-id="${doc.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Setup pagination
        setupPagination(totalPages);
        
        // Add event listeners
        addProductEventListeners();
        
    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.classList.add('hidden');
        noProducts.classList.remove('hidden');
    }
}

// Filter Products with Pagination
async function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const productsContainer = document.getElementById('all-products');
    const loadingState = document.getElementById('loading-state');
    const noProducts = document.getElementById('no-products');
    
    // Reset to first page when filtering
    currentPage = 1;
    
    // Show loading state
    productsContainer.innerHTML = '';
    loadingState.classList.remove('hidden');
    noProducts.classList.add('hidden');
    
    try {
        let query = db.collection('products');
        
        if (category !== 'all') {
            query = query.where('category', '==', category);
        }
        
        // Get total count for pagination
        const countQuery = await query.count().get();
        const totalProducts = countQuery.data().count;
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        
        // Apply pagination
        query = query.limit(productsPerPage).offset((currentPage - 1) * productsPerPage);
        
        const snapshot = await query.get();
        loadingState.classList.add('hidden');
        
        if (snapshot.empty) {
            noProducts.classList.remove('hidden');
            return;
        }
        
        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            productsContainer.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)} (${product.reviews || 0})
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn quick-view" data-id="${doc.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn add-to-wishlist" data-id="${doc.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn add-to-cart" data-id="${doc.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Setup pagination
        setupPagination(totalPages);
        
        // Add event listeners
        addProductEventListeners();
        
    } catch (error) {
        console.error('Error filtering products:', error);
        loadingState.classList.add('hidden');
        noProducts.classList.remove('hidden');
    }
}

// Sort Products
async function sortProducts() {
    const sortBy = document.getElementById('sort-by').value;
    const productsContainer = document.getElementById('all-products');
    const loadingState = document.getElementById('loading-state');
    const noProducts = document.getElementById('no-products');
    
    // Reset to first page when sorting
    currentPage = 1;
    
    // Show loading state
    productsContainer.innerHTML = '';
    loadingState.classList.remove('hidden');
    noProducts.classList.add('hidden');
    
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
            case 'rating-desc':
                query = query.orderBy('rating', 'desc');
                break;
            default:
                // No sorting
                break;
        }
        
        // Get total count for pagination
        const countQuery = await query.count().get();
        const totalProducts = countQuery.data().count;
        const totalPages = Math.ceil(totalProducts / productsPerPage);
        
        // Apply pagination
        query = query.limit(productsPerPage).offset((currentPage - 1) * productsPerPage);
        
        const snapshot = await query.get();
        loadingState.classList.add('hidden');
        
        if (snapshot.empty) {
            noProducts.classList.remove('hidden');
            return;
        }
        
        productsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            productsContainer.innerHTML += `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.imageURL}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-rating">
                            ${getRatingStars(product.rating)} (${product.reviews || 0})
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn quick-view" data-id="${doc.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn add-to-wishlist" data-id="${doc.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn add-to-cart" data-id="${doc.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Setup pagination
        setupPagination(totalPages);
        
        // Add event listeners
        addProductEventListeners();
        
    } catch (error) {
        console.error('Error sorting products:', error);
        loadingState.classList.add('hidden');
        noProducts.classList.remove('hidden');
    }
}

// Setup Pagination
function setupPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add event listeners
    document.querySelectorAll('.pagination-btn:not(.prev-btn):not(.next-btn)').forEach(btn => {
        if (!btn.classList.contains('active')) {
            btn.addEventListener('click', function() {
                currentPage = parseInt(this.textContent);
                applyCurrentFilters();
            });
        }
    });
    
    document.querySelector('.prev-btn')?.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            applyCurrentFilters();
        }
    });
    
    document.querySelector('.next-btn')?.addEventListener('click', function() {
        const totalPages = document.querySelectorAll('.pagination-btn:not(.prev-btn):not(.next-btn)').length;
        if (currentPage < totalPages) {
            currentPage++;
            applyCurrentFilters();
        }
    });
}

// Apply current filters with pagination
function applyCurrentFilters() {
    const sortBy = document.getElementById('sort-by').value;
    const category = document.getElementById('category-filter').value;
    
    if (sortBy !== 'default') {
        sortProducts();
    } else if (category !== 'all') {
        filterProducts();
    } else {
        loadAllProducts();
    }
}

// Add event listeners to product actions
function addProductEventListeners() {
    // Quick view
    document.querySelectorAll('.quick-view').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            // Implement quick view modal here
            console.log('Quick view:', productId);
        });
    });
    
    // Add to wishlist
    document.querySelectorAll('.add-to-wishlist').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            addToWishlist(productId);
        });
    });
    
    // Add to cart
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.getAttribute('data-id');
            addToCart({ target: this });
        });
    });
    
    // Whole card click
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.querySelector('.add-to-cart').getAttribute('data-id');
            window.location.href = `product-detail.html?id=${productId}`;
        });
    });
}

// Add to wishlist function
function addToWishlist(productId) {
    const user = auth.currentUser;
    
    if (!user) {
        window.location.href = 'auth.html?redirect=products';
        return;
    }
    
    // Check if already in wishlist
    db.collection('users').doc(user.uid).collection('wishlist').doc(productId).get()
        .then(doc => {
            if (doc.exists) {
                // Remove from wishlist
                return db.collection('users').doc(user.uid).collection('wishlist').doc(productId).delete()
                    .then(() => {
                        showNotification('Removed from wishlist');
                        updateWishlistButton(productId, false);
                    });
            } else {
                // Add to wishlist
                return db.collection('users').doc(user.uid).collection('wishlist').doc(productId).set({
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    showNotification('Added to wishlist');
                    updateWishlistButton(productId, true);
                });
            }
        })
        .catch(error => {
            console.error('Error updating wishlist:', error);
            showNotification('Error updating wishlist');
        });
}

// Update wishlist button appearance
function updateWishlistButton(productId, isInWishlist) {
    document.querySelectorAll(`.add-to-wishlist[data-id="${productId}"]`).forEach(btn => {
        if (isInWishlist) {
            btn.innerHTML = '<i class="fas fa-heart" style="color: red;"></i>';
            btn.classList.add('in-wishlist');
        } else {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.classList.remove('in-wishlist');
        }
    });
}