// ============================================
// GlamGirl - Main JavaScript
// ============================================

// API Base URL
const API_URL = '/api';

// Get CSRF Token from cookie
function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = cookie.substring(10);
                break;
            }
        }
    }
    return cookieValue;
}

// ============================================
// Utility Functions
// ============================================

function formatPrice(price) {
    return '৳' + parseFloat(price).toFixed(0);
}

function showToast(message, type = 'success') {
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0 show" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.innerHTML = toastHtml;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

// ============================================
// API Functions
// ============================================

async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function fetchProducts(categoryId = null) {
    try {
        let url = `${API_URL}/products/`;
        if (categoryId) {
            url = `${API_URL}/products/category/${categoryId}/`;
        }
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function fetchProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}/`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function fetchCart() {
    try {
        const response = await fetch(`${API_URL}/cart/`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return { items: [], total: 0, total_items: 0 };
    }
}

async function addToCartAPI(productId, quantity = 1) {
    try {
        const response = await fetch(`${API_URL}/cart/add/`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });
        const data = await response.json();
        console.log('Add to cart response:', data);
        return data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        return null;
    }
}

async function updateCartItemAPI(itemId, quantity) {
    try {
        const response = await fetch(`${API_URL}/cart/update/${itemId}/`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ quantity: quantity })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating cart:', error);
        return null;
    }
}

async function removeFromCartAPI(itemId) {
    try {
        const response = await fetch(`${API_URL}/cart/remove/${itemId}/`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        return null;
    }
}

async function createOrderAPI(orderData) {
    try {
        const response = await fetch(`${API_URL}/orders/create/`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        return { success: response.ok, data: data };
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, data: null };
    }
}

// ============================================
// UI Functions
// ============================================

async function updateCartCount() {
    try {
        const cart = await fetchCart();
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            cartCountEl.textContent = cart.total_items || 0;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

async function loadNavCategories() {
    try {
        const categories = await fetchCategories();
        const dropdown = document.getElementById('categoryDropdown');
        const footerCategories = document.getElementById('footerCategories');
        
        if (dropdown && categories.length > 0) {
            dropdown.innerHTML = categories.map(cat => `
                <li><a class="dropdown-item" href="/products/?category=${cat.id}">${cat.name}</a></li>
            `).join('');
        }
        
        if (footerCategories && categories.length > 0) {
            footerCategories.innerHTML = categories.map(cat => `
                <li><a href="/products/?category=${cat.id}" class="text-muted">${cat.name}</a></li>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading nav categories:', error);
    }
}

function createProductCard(product) {
    const imageUrl = product.image || 'https://via.placeholder.com/300x300?text=No+Image';
    return `
        <div class="col-md-4 col-sm-6 mb-4">
            <div class="card product-card h-100 shadow-sm">
                <a href="/product/${product.id}/">
                    <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
                </a>
                <div class="card-body">
                    <span class="category-badge">${product.category_name}</span>
                    <h5 class="product-title mt-2">
                        <a href="/product/${product.id}/" class="text-decoration-none text-dark">
                            ${product.name}
                        </a>
                    </h5>
                    <p class="product-price">${formatPrice(product.price)}</p>
                    <button class="btn btn-pink w-100" onclick="quickAddToCart(${product.id})">
                        <i class="bi bi-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function quickAddToCart(productId) {
    try {
        const result = await addToCartAPI(productId, 1);
        if (result && result.items) {
            showToast('Product added to cart!', 'success');
            updateCartCount();
        } else if (result && result.error) {
            showToast(result.error, 'danger');
        } else {
            showToast('Failed to add product', 'danger');
        }
    } catch (error) {
        console.error('Error in quickAddToCart:', error);
        showToast('Failed to add product', 'danger');
    }
}


// ============================================
// Page: HOME
// ============================================

async function initHomePage() {
    console.log('Initializing Home Page...');
    
    try {
        const products = await fetchProducts();
        const container = document.getElementById('featuredProducts');
        
        if (container) {
            if (products && products.length > 0) {
                container.innerHTML = products.slice(0, 6).map(p => createProductCard(p)).join('');
            } else {
                container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No products found. Add products from admin panel.</p></div>';
            }
        }
        
        const categories = await fetchCategories();
        const catContainer = document.getElementById('categoriesContainer');
        
        if (catContainer) {
            if (categories && categories.length > 0) {
                catContainer.innerHTML = categories.map(cat => `
                    <div class="col-md-3 col-6 mb-4">
                        <a href="/products/?category=${cat.id}" class="text-decoration-none">
                            <div class="card border-0 shadow-sm text-center p-4 h-100">
                                <i class="bi bi-stars" style="font-size: 2rem; color: var(--pink);"></i>
                                <h5 class="mt-3 text-dark">${cat.name}</h5>
                            </div>
                        </a>
                    </div>
                `).join('');
            } else {
                catContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No categories found.</p></div>';
            }
        }
    } catch (error) {
        console.error('Error initializing home page:', error);
    }
}

// ============================================
// Page: PRODUCTS (with All Filters)
// ============================================

let allProducts = [];
let allCategories = [];
let filteredProducts = [];

async function initProductsPage() {
    console.log('Initializing Products Page...');
    
    try {
        // Get category from URL if exists
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        
        // Fetch all products and categories
        allProducts = await fetchProducts();
        allCategories = await fetchCategories();
        
        // Initial filter
        if (categoryId) {
            filteredProducts = allProducts.filter(p => p.category == categoryId);
        } else {
            filteredProducts = [...allProducts];
        }
        
        // Render products
        renderProducts(filteredProducts);
        
        // Render category filters
        renderCategoryFilters(categoryId);
        
        // Setup event listeners for sorting and price filter
        setupFilterListeners();
        
    } catch (error) {
        console.error('Error initializing products page:', error);
    }
}

function setupFilterListeners() {
    // Sort dropdown listener
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    // Price range listeners
    const priceRadios = document.querySelectorAll('input[name="priceRange"]');
    priceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            applyFilters();
        });
    });
}

function applyFilters() {
    // Get selected category
    const selectedCategory = document.querySelector('input[name="categoryFilter"]:checked');
    const categoryId = selectedCategory ? selectedCategory.value : '';
    
    // Get selected price range
    const selectedPrice = document.querySelector('input[name="priceRange"]:checked');
    const priceRange = selectedPrice ? selectedPrice.id : 'priceAll';
    
    // Get selected sort
    const sortSelect = document.getElementById('sortSelect');
    const sortValue = sortSelect ? sortSelect.value : 'newest';
    
    // Start with all products
    let results = [...allProducts];
    
    // Filter by category
    if (categoryId) {
        results = results.filter(p => p.category == categoryId);
    }
    
    // Filter by price range
    results = filterByPriceRange(results, priceRange);
    
    // Sort products
    results = sortProducts(results, sortValue);
    
    // Update filtered products
    filteredProducts = results;
    
    // Render
    renderProducts(filteredProducts);
}

function filterByPriceRange(products, priceRange) {
    switch(priceRange) {
        case 'price1': // Under ৳500
            return products.filter(p => parseFloat(p.price) < 500);
        case 'price2': // ৳500 - ৳1000
            return products.filter(p => parseFloat(p.price) >= 500 && parseFloat(p.price) <= 1000);
        case 'price3': // Above ৳1000
            return products.filter(p => parseFloat(p.price) > 1000);
        default: // All prices
            return products;
    }
}

function sortProducts(products, sortValue) {
    const sorted = [...products];
    
    switch(sortValue) {
        case 'price_low':
            return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        case 'price_high':
            return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
}

function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    const countEl = document.getElementById('productCount');
    
    if (container) {
        if (products && products.length > 0) {
            container.innerHTML = products.map(p => createProductCard(p)).join('');
        } else {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No products found matching your criteria.</p></div>';
        }
    }
    
    if (countEl) {
        countEl.textContent = `(${products ? products.length : 0} items)`;
    }
}

function renderCategoryFilters(selectedCategoryId = null) {
    const filterContainer = document.getElementById('categoryFilters');
    
    if (filterContainer && allCategories) {
        filterContainer.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="categoryFilter" 
                       id="catAll" value="" ${!selectedCategoryId ? 'checked' : ''}
                       onchange="filterByCategory('')">
                <label class="form-check-label" for="catAll">All Categories</label>
            </div>
        ` + allCategories.map(cat => `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="categoryFilter" 
                       id="cat${cat.id}" value="${cat.id}" 
                       ${selectedCategoryId == cat.id ? 'checked' : ''}
                       onchange="filterByCategory('${cat.id}')">
                <label class="form-check-label" for="cat${cat.id}">${cat.name}</label>
            </div>
        `).join('');
    }
}

function filterByCategory(categoryId) {
    // Update URL
    if (categoryId) {
        window.history.pushState({}, '', `/products/?category=${categoryId}`);
    } else {
        window.history.pushState({}, '', '/products/');
    }
    
    // Apply all filters
    applyFilters();
}

function clearFilters() {
    // Reset category filter
    const catAllRadio = document.getElementById('catAll');
    if (catAllRadio) {
        catAllRadio.checked = true;
    }
    
    // Reset price filter
    const priceAllRadio = document.getElementById('priceAll');
    if (priceAllRadio) {
        priceAllRadio.checked = true;
    }
    
    // Reset sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'newest';
    }
    
    // Update URL
    window.history.pushState({}, '', '/products/');
    
    // Show all products
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
}


// ============================================
// Page: PRODUCT DETAIL
// ============================================

let currentProduct = null;

async function initProductDetailPage(productId) {
    console.log('Initializing Product Detail Page for ID:', productId);
    
    try {
        currentProduct = await fetchProduct(productId);
        const container = document.getElementById('productDetail');
        
        if (!currentProduct || currentProduct.detail === 'Not found.') {
            if (container) {
                container.innerHTML = '<div class="col-12 text-center py-5"><h4>Product not found</h4><a href="/products/" class="btn btn-pink mt-3">Back to Products</a></div>';
            }
            return;
        }
        
        const imageUrl = currentProduct.image || 'https://via.placeholder.com/500x500?text=No+Image';
        
        if (container) {
            container.innerHTML = `
                <div class="col-md-6 mb-4">
                    <img src="${imageUrl}" alt="${currentProduct.name}" class="img-fluid rounded-4 shadow">
                </div>
                <div class="col-md-6">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="/">Home</a></li>
                            <li class="breadcrumb-item"><a href="/products/">Products</a></li>
                            <li class="breadcrumb-item active">${currentProduct.category_name || 'Category'}</li>
                        </ol>
                    </nav>
                    
                    <h1 class="mb-3">${currentProduct.name}</h1>
                    
                    <span class="category-badge mb-3 d-inline-block">${currentProduct.category_name || 'Category'}</span>
                    
                    <div class="mb-3">
                        <span class="product-price fs-2">${formatPrice(currentProduct.price)}</span>
                    </div>
                    
                    <p class="text-muted mb-4">${currentProduct.description || 'No description available.'}</p>
                    
                    <div class="mb-4">
                        ${currentProduct.stock > 0 
                            ? `<span class="badge bg-success">In Stock</span>
                               <span class="text-muted ms-2">(${currentProduct.stock} available)</span>`
                            : '<span class="badge bg-danger">Out of Stock</span>'
                        }
                    </div>
                    
                    <div class="mb-4">
                        <label class="form-label">Quantity:</label>
                        <div class="input-group" style="width: 150px;">
                            <button class="btn btn-outline-secondary" type="button" onclick="decreaseQty()">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" class="form-control text-center" id="quantity" value="1" min="1" max="${currentProduct.stock}">
                            <button class="btn btn-outline-secondary" type="button" onclick="increaseQty()">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button class="btn btn-pink btn-lg w-100 mb-3" onclick="addToCart()" ${currentProduct.stock <= 0 ? 'disabled' : ''}>
                        <i class="bi bi-cart-plus"></i> Add to Cart
                    </button>
                    
                    <div class="row mt-4">
                        <div class="col-6">
                            <div class="d-flex align-items-center text-muted">
                                <i class="bi bi-truck me-2"></i>
                                <small>Free Delivery in Dhaka</small>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="d-flex align-items-center text-muted">
                                <i class="bi bi-shield-check me-2"></i>
                                <small>100% Authentic</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error initializing product detail page:', error);
        const container = document.getElementById('productDetail');
        if (container) {
            container.innerHTML = '<div class="col-12 text-center py-5"><h4>Error loading product</h4></div>';
        }
    }
}

function decreaseQty() {
    const input = document.getElementById('quantity');
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function increaseQty() {
    const input = document.getElementById('quantity');
    if (input && currentProduct && parseInt(input.value) < currentProduct.stock) {
        input.value = parseInt(input.value) + 1;
    }
}

async function addToCart() {
    if (!currentProduct) {
        showToast('Product not found', 'danger');
        return;
    }
    
    try {
        const quantityInput = document.getElementById('quantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        const result = await addToCartAPI(currentProduct.id, quantity);
        
        if (result && result.items) {
            showToast('Product added to cart!', 'success');
            updateCartCount();
        } else if (result && result.error) {
            showToast(result.error, 'danger');
        } else {
            showToast('Failed to add product', 'danger');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add product', 'danger');
    }
}

// ============================================
// Page: CART
// ============================================

let cartData = null;

async function initCartPage() {
    console.log('Initializing Cart Page...');
    
    try {
        cartData = await fetchCart();
        console.log('Cart data received:', cartData);
        renderCart();
    } catch (error) {
        console.error('Error initializing cart page:', error);
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Check if cart is empty
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-cart-x" style="font-size: 4rem; color: #ddd;"></i>
                    <h4 class="mt-3">Your cart is empty</h4>
                    <p class="text-muted">Looks like you haven't added anything yet.</p>
                    <a href="/products/" class="btn btn-pink">
                        <i class="bi bi-bag"></i> Start Shopping
                    </a>
                </div>
            `;
        }
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        if (subtotalEl) subtotalEl.textContent = '৳0';
        if (shippingEl) shippingEl.textContent = '৳0';
        if (totalEl) totalEl.textContent = '৳0';
        return;
    }
    
    // Show checkout button
    if (checkoutBtn) checkoutBtn.style.display = 'block';
    
    // Render cart items
    if (container) {
        container.innerHTML = cartData.items.map(item => `
            <div class="cart-item d-flex align-items-center py-3 border-bottom">
                <img src="${item.product.image || 'https://via.placeholder.com/80x80?text=No+Image'}" 
                     alt="${item.product.name}" 
                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px;"
                     class="me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.product.name}</h6>
                    <small class="text-muted">${formatPrice(item.product.price)} each</small>
                </div>
                <div class="d-flex align-items-center">
                    <div class="input-group input-group-sm me-3" style="width: 120px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                    <span class="fw-bold me-3" style="min-width: 80px;">${formatPrice(item.subtotal)}</span>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeItem(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Update totals
    if (subtotalEl) subtotalEl.textContent = formatPrice(cartData.total);
    if (shippingEl) shippingEl.textContent = '৳0';
    if (totalEl) totalEl.textContent = formatPrice(cartData.total);
}

async function updateQuantity(itemId, newQuantity) {
    console.log('Updating quantity:', itemId, newQuantity);
    
    if (newQuantity <= 0) {
        await removeItem(itemId);
        return;
    }
    
    try {
        const result = await updateCartItemAPI(itemId, newQuantity);
        if (result) {
            cartData = result;
            renderCart();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Failed to update quantity', 'danger');
    }
}

async function removeItem(itemId) {
    console.log('Removing item:', itemId);
    
    try {
        const result = await removeFromCartAPI(itemId);
        if (result) {
            cartData = result;
            renderCart();
            updateCartCount();
            showToast('Item removed from cart', 'success');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showToast('Failed to remove item', 'danger');
    }
}

// ============================================
// Page: CHECKOUT
// ============================================

async function initCheckoutPage() {
    console.log('Initializing Checkout Page...');
    
    try {
        cartData = await fetchCart();
        
        if (!cartData || !cartData.items || cartData.items.length === 0) {
            window.location.href = '/cart/';
            return;
        }
        
        renderCheckoutItems();
    } catch (error) {
        console.error('Error initializing checkout page:', error);
    }
}

function renderCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    
    if (container && cartData && cartData.items) {
        container.innerHTML = cartData.items.map(item => `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.product.name} × ${item.quantity}</span>
                <span>${formatPrice(item.subtotal)}</span>
            </div>
        `).join('');
    }
    
    if (subtotalEl && cartData) {
        subtotalEl.textContent = formatPrice(cartData.total);
    }
    
    updateShipping();
}

function updateShipping() {
    const cityEl = document.getElementById('city');
    const city = cityEl ? cityEl.value : '';
    const shipping = (city && city.toLowerCase() === 'dhaka') ? 0 : 60;
    
    const shippingEl = document.getElementById('checkoutShipping');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (shippingEl) {
        shippingEl.textContent = formatPrice(shipping);
    }
    
    if (totalEl && cartData) {
        totalEl.textContent = formatPrice(cartData.total + shipping);
    }
}

async function placeOrder() {
    console.log('Placing order...');
    
    const form = document.getElementById('checkoutForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    try {
        const orderData = {
            customer_name: document.getElementById('customerName').value,
            customer_email: document.getElementById('customerEmail').value,
            customer_phone: document.getElementById('customerPhone').value,
            shipping_address: document.getElementById('shippingAddress').value,
            city: document.getElementById('city').value,
            postal_code: document.getElementById('postalCode').value || '',
            payment_method: document.querySelector('input[name="paymentMethod"]:checked').value,
            note: document.getElementById('orderNote').value || ''
        };
        
        console.log('Order data:', orderData);
        
        const result = await createOrderAPI(orderData);
        
        console.log('Order result:', result);
        
        if (result.success && result.data && result.data.order) {
            document.getElementById('orderId').textContent = '#' + result.data.order.id;
            const modal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
            modal.show();
            updateCartCount();
        } else {
            const errorMessage = result.data?.error || 'Failed to place order. Please try again.';
            showToast(errorMessage, 'danger');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showToast('Failed to place order. Please try again.', 'danger');
    }
}

// ============================================
// Initialize on page load
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('=================================');
    console.log('GlamGirl Main.js Loaded!');
    console.log('=================================');
    
    // Always update cart count and load nav categories
    updateCartCount();
    loadNavCategories();
});