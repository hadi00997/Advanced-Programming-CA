const BASE_URL = 'http://localhost:5000';
const token = localStorage.getItem('token') || null;
const pageRoute = window.location.pathname;

const API_ENDPOINTS = {
    login: `${BASE_URL}/api/users/login`,
    register: `${BASE_URL}/api/users/register`,
    allUsers: `${BASE_URL}/api/users/`,
    products: `${BASE_URL}/api/products`,
    cart: `${BASE_URL}/api/cart/`,
};

const showMessage = (message) => {
    console.log("Message:", message);
    // alert(message);
}

const logout = () => {
    localStorage.clear();
    window.location.href = './index.html';
}

const loadNavbar = () => {
    const navbarHTML = `
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <a class="navbar-brand" href="./welcome.html">E-Commerce</a>
          <div class="d-flex align-items-center">
            <button id="viewCartBtn" onclick="viewCart()" class="btn btn-warning btn-sm me-2 d-flex align-items-center">
              Cart <span id="cartCount" class="badge bg-dark ms-1">0</span>
            </button>
  
            <a href="./profile.html" class="btn btn-info btn-sm me-2">Profile</a>
  
            <button onclick="logout()" class="btn btn-light btn-sm">Logout</button>
          </div>
        </div>
      </nav>
    `;
    document.getElementById("navbar").innerHTML = navbarHTML;
};


const POST_API = async (endPoint, body) => {
    try {
        const response = await fetch(endPoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message);
        return { success: false, message: error.message };
    }
};

const GET_API = async (endPoint) => {
    try {
        const response = await fetch(endPoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return await response.json();
    } catch (error) {
        showMessage(error.message);
        return { success: false, message: error.message };
    }
};

const PUT_API = async (endPoint, body) => {
    try {
        const response = await fetch(endPoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message);
        return { success: false, message: error.message };
    }
};


const DELETE_API = async (endpointBase, id, url = "") => {
    try {
        const response = await fetch(url ? url : `${endpointBase}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        return await response.json();
    } catch (error) {
        showMessage(error.message);
        return { success: false, message: error.message };
    }
};



// 
const loginUser = async (email, password) => {
    const res = await POST_API(API_ENDPOINTS.login, { email, password });
    if (res.success) {
        alert('Login successful!');
        localStorage.setItem('token', res.token);
        localStorage.setItem('data', JSON.stringify(res.data));
        window.location.href = 'welcome.html';
    } else {
        const loginErrorEl = document.getElementById('loginError');
        if (loginErrorEl) {
            loginErrorEl.textContent = res.message || 'Login failed.';
            loginErrorEl.style.display = 'block';
        }
    }
};

const registerUser = async (name, email, password) => {
    const res = await POST_API(API_ENDPOINTS.register, { name, email, password });
    if (res.success) {
        alert('Registration successful! Redirecting to login page...');
        window.location.href = './index.html';
    } else {
        const registerErrorEl = document.getElementById('registerError');
        if (registerErrorEl) {
            registerErrorEl.textContent = res.message || 'Registration failed.';
            registerErrorEl.style.display = 'block';
        }
    }
};

const fetchProducts = async () => {
    return await GET_API(API_ENDPOINTS.products);
};


const fetchProduct = async (id) => {
    updateCartCount();
    return await GET_API(`${API_ENDPOINTS.products}/${id}`);
};


const addProduct = async (payLoad) => {
    const res = await POST_API(API_ENDPOINTS.products, payLoad);
    const statusMsg = document.getElementById('statusMsg');
    if (res.success) {
        statusMsg.innerHTML = `<div class="alert alert-success">Product added successfully!</div>`;
        setTimeout(() => window.location.href = "./welcome.html", 1500);
    } else {
        statusMsg.innerHTML = `<div class="alert alert-danger">Error: ${res.message || 'Could not add product.'}</div>`;
    }
};

async function updateProduct(id, productData) {
    try {
        const res = await PUT_API(`${API_ENDPOINTS.products}/${id}`, productData);
        if (res.success) {
            statusMsg.innerHTML = `<div class="alert alert-success">Product updated successfully!</div>`;
            setTimeout(() => window.location.href = './welcome.html', 1500);
        } else {
            statusMsg.innerHTML = `<div class="alert alert-danger">Update failed. ${res.message || ''}</div>`;
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const res = await DELETE_API(`${API_ENDPOINTS.products}`, id);
    if (res.success) {
        alert('Product deleted successfully!');
        window.location.reload();
    } else {
        alert('Failed to delete product.');
    }
}


const addToCart = async (product) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(p => p.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    existingItem = cart.find(p => p.id === product.id);
    const res = await POST_API(API_ENDPOINTS.cart, { product_id: existingItem.id, quantity: existingItem.quantity });
    const statusMsg = document.getElementById('statusMsg');
    if (res.success) {
        statusMsg.innerHTML = `<div class="alert alert-success">Product added to cart successfully!</div>`;
        setTimeout(() => window.location.href = "./welcome.html", 1500);
        updateCartCount()
    } else {
        statusMsg.innerHTML = `<div class="alert alert-danger">Error: ${res.message || 'Could not add product.'}</div>`;
    }
};

const getCart = async () => {
    const res = await GET_API(API_ENDPOINTS.cart);
    if (res.success) {
        localStorage.setItem('cart', JSON.stringify(res.data));
        updateCartCount()
    }
}

const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

const removeFromCart = async (productData) => {
    try {
        const res = await PUT_API(`${API_ENDPOINTS.cart}/${productData.id}`, { quantity: productData.quantity - 1 });
        if (res.success) {
            getCart()
        }
    } catch (err) {
        console.error(err);
        showMessage(err.message);
    }
}

const removeCartItem = async (id) => {
    try {
        const res = await DELETE_API("", "", `${API_ENDPOINTS.cart}delete-one/${id}`);
        if (res.success) {
            location.reload()
        }
    } catch (err) {
        console.error(err);
        showMessage(err.message);
    }
}

const removeAllItemsFromcart = async () => {
    try {
        const res = await DELETE_API(API_ENDPOINTS.cart + 'clear', "");
        if (res.success) {
            location.reload()
        }
    } catch (err) {
        console.error(err);
        showMessage(err.message);
    }
}

const fetchAllUsers = async () => {
    return await GET_API(`${API_ENDPOINTS.allUsers}`);
}

const fetchUserById = async (id) => {
    return await GET_API(`${API_ENDPOINTS.allUsers}${id}`);
}

const updateUserProfile = async (data) => {
    return await PUT_API(`${API_ENDPOINTS.allUsers}profile`, data)
}





(async function init() {
    loadNavbar();
    await getCart();
})();
