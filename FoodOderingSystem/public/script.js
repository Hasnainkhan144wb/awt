let isLogin = true;
let cart = [];
let editingFoodId = null;
let allFoods = []; // Menu search ke liye backup array

// --- AUTHENTICATION ---
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('name-box').classList.toggle('d-none');
    document.getElementById('auth-title').innerText = isLogin ? "Login" : "Register";
    document.getElementById('auth-btn').innerText = isLogin ? "Login" : "Register Now";
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;

    if (!email || !password || (!isLogin && !name)) {
        alert("Please fill all fields");
        return;
    }

    const route = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
        const res = await fetch(`http://localhost:5000${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();
        if (res.ok) {
            if (isLogin) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('name', data.name);
                localStorage.setItem('email', email);
                startApp();
            } else { 
                alert(data.msg); 
                toggleAuth(); 
            }
        } else { 
            alert(data.msg); 
        }
    } catch (err) {
        alert("Server not responding. Check if backend is running.");
    }
}

function startApp() {
    const role = localStorage.getItem('role');
    document.getElementById('auth-section').classList.add('d-none');
    document.getElementById('dashboard-section').classList.remove('d-none');
    document.getElementById('welcome-name').innerText = `${localStorage.getItem('name')} (${role})`;

    if (role === 'admin') {
        document.getElementById('admin-panel').classList.remove('d-none');
        document.getElementById('admin-orders-box').classList.remove('d-none');
        document.getElementById('cart-section').classList.add('d-none');
        document.getElementById('user-status-section').classList.add('d-none');
        fetchAdminOrders();
    } else {
        document.getElementById('admin-panel').classList.add('d-none');
        document.getElementById('admin-orders-box').classList.add('d-none');
        document.getElementById('cart-section').classList.remove('d-none');
        document.getElementById('user-status-section').classList.remove('d-none');
        fetchUserOrders();
    }
    fetchMenu();
}

// --- ADMIN: FOOD MANAGEMENT (WITH IMAGE SUPPORT) ---

async function saveFood() {
    const name = document.getElementById('foodName').value;
    const price = document.getElementById('foodPrice').value;
    const imageFile = document.getElementById('foodImage').files[0]; // Image file pakarna
    
    if (!name || !price) {
        alert("Please enter food name and price");
        return;
    }

    // Images ke liye FormData use karna zaroori hai
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const method = editingFoodId ? 'PUT' : 'POST';
    const url = editingFoodId ? `http://localhost:5000/api/foods/${editingFoodId}` : 'http://localhost:5000/api/foods';

    try {
        const res = await fetch(url, {
            method: method,
            // Note: FormData ke sath Headers mein Content-Type set nahi karte
            body: formData
        });

        if (res.ok) {
            alert(editingFoodId ? "Item Updated!" : "Item Added!");
            cancelEdit();
            fetchMenu();
        } else {
            alert("Failed to save item.");
        }
    } catch (err) {
        alert("Error connecting to server.");
    }
}

function editFood(id, name, price) {
    editingFoodId = id;
    document.getElementById('foodName').value = name;
    document.getElementById('foodPrice').value = price;
    document.getElementById('form-title').innerText = "Update Product";
    document.getElementById('save-food-btn').innerText = "Update Now";
    document.getElementById('cancel-edit-btn').classList.remove('d-none');
}

function cancelEdit() {
    editingFoodId = null;
    document.getElementById('foodName').value = '';
    document.getElementById('foodPrice').value = '';
    document.getElementById('foodImage').value = ''; // File input clear
    document.getElementById('form-title').innerText = "Add Food Item";
    document.getElementById('save-food-btn').innerText = "Add Item";
    document.getElementById('cancel-edit-btn').classList.add('d-none');
}

async function deleteFood(id) {
    if (confirm("Are you sure you want to delete this food item?")) {
        await fetch(`http://localhost:5000/api/foods/${id}`, { method: 'DELETE' });
        fetchMenu();
    }
}

// --- SHARED: MENU (WITH SEARCH & IMAGE DISPLAY) ---

async function fetchMenu() {
    const searchInput = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : "";
    
    try {
        const res = await fetch('http://localhost:5000/api/foods');
        allFoods = await res.json();

        // Search filtering logic
        const filteredFoods = allFoods.filter(f => f.name.toLowerCase().includes(searchInput));

        const grid = document.getElementById('food-grid');
        const role = localStorage.getItem('role');

        grid.innerHTML = filteredFoods.map(f => `
            <div class="col-md-6 mb-3">
                <div class="card border-0 shadow-sm h-100 overflow-hidden">
                    <div style="height: 160px; background: #f8f9fa;">
                        ${f.image ? 
                            `<img src="http://localhost:5000/uploads/${f.image}" class="w-100 h-100" style="object-fit: cover;">` : 
                            `<div class="h-100 d-flex align-items-center justify-content-center text-muted small">No Image</div>`
                        }
                    </div>
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="fw-bold m-0">${f.name}</h6>
                                <small class="text-success fw-bold">Rs. ${f.price}</small>
                            </div>
                            ${role === 'admin' ? 
                                `<div>
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editFood('${f._id}','${f.name}',${f.price})">Edit</button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFood('${f._id}')">Delete</button>
                                </div>` :
                                `<button class="btn btn-sm btn-success" onclick="addToCart('${f.name}', ${f.price})">Add +</button>`
                            }
                        </div>
                    </div>
                </div>
            </div>`).join('');
    } catch (err) {
        console.error("Menu fetch error:", err);
    }
}

// --- DYNAMIC CART ---

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.quantity++; } 
    else { cart.push({ name, price, quantity: 1 }); }
    updateCartUI();
}

function updateQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(i => i.name !== name);
    }
    updateCartUI();
}

function updateCartUI() {
    const box = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const btn = document.getElementById('place-order-btn');

    if (cart.length === 0) {
        box.innerHTML = "Empty.";
        totalEl.innerText = "Rs. 0";
        btn.classList.add('d-none');
        return;
    }

    box.innerHTML = cart.map(i => `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div><strong>${i.name}</strong><br><small>Rs.${i.price} x ${i.quantity}</small></div>
            <div>
                <button class="btn btn-sm btn-light border py-0" onclick="updateQty('${i.name}', -1)">-</button>
                <button class="btn btn-sm btn-light border py-0" onclick="updateQty('${i.name}', 1)">+</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    totalEl.innerText = `Rs. ${total}`;
    btn.classList.remove('d-none');
}

// --- ORDERING & HISTORY ---

async function placeOrder() {
    const userName = localStorage.getItem('name');
    const userEmail = localStorage.getItem('email');
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userEmail, items: cart, total })
    });
    if (res.ok) {
        alert("🎉 Order Placed Successfully!");
        cart = []; updateCartUI(); fetchUserOrders();
    }
}

async function fetchUserOrders() {
    const email = localStorage.getItem('email');
    const res = await fetch(`http://localhost:5000/api/orders/user/${email}`);
    const orders = await res.json();
    const list = document.getElementById('user-orders-list');

    list.innerHTML = orders.map((o, idx) => {
        const timeDiff = Date.now() - new Date(o.createdAt).getTime();
        const canCancel = timeDiff < 120000 && o.status === 'Pending';
        
        return `
        <div class="mb-3 p-2 bg-white rounded border-start border-success border-4 shadow-sm">
            <h6 class="fw-bold text-success small mb-1">Order #${orders.length - idx}</h6>
            <div style="font-size: 11px;">
                <strong>Items:</strong> ${o.items.map(i => `${i.name}(x${i.quantity})`).join(', ')}<br>
                <strong>Total:</strong> Rs. ${o.total}<br>
                <strong>Status:</strong> <span class="badge ${o.status==='Cancelled'?'bg-danger': o.status === 'Order Delivered' ? 'bg-success' : 'bg-warning text-dark'}">${o.status}</span>
            </div>
            <div class="mt-2 d-flex gap-1">
                ${canCancel ? `<button class="btn btn-xs btn-outline-danger py-0" onclick="cancelOrder('${o._id}')" style="font-size:10px">Cancel Order</button>` : ''}
                <button class="btn btn-xs btn-outline-secondary py-0" onclick="deleteHistory('${o._id}')" style="font-size:10px">Delete</button>
            </div>
        </div>`;
    }).join('');
}

async function cancelOrder(id) {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    const res = await fetch(`http://localhost:5000/api/orders/cancel/${id}`, { method: 'PUT' });
    const data = await res.json();
    alert(data.msg); 
    fetchUserOrders();
}

async function deleteHistory(id) {
    if (!confirm("Are you sure you want to delete this record from your history?")) return;
    await fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' });
    fetchUserOrders();
}

// --- ADMIN: ORDER MANAGEMENT ---

async function fetchAdminOrders() {
    const res = await fetch('http://localhost:5000/api/orders');
    const orders = await res.json();
    const list = document.getElementById('admin-orders-list');
    list.innerHTML = orders.map(o => `
        <div class="card p-2 mb-2 border-0 bg-light small shadow-sm">
            <div class="d-flex justify-content-between"><strong>${o.userName}</strong> <span>Rs.${o.total}</span></div>
            <div class="text-muted" style="font-size: 11px;">Items: ${o.items.map(i => `${i.name}(x${i.quantity})`).join(', ')}</div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="badge ${o.status === 'Cancelled' ? 'bg-danger' : 'bg-info'}">${o.status}</span>
                <select class="form-select form-select-sm w-50" onchange="updateStatus('${o._id}', this.value)">
                    <option disabled selected>Update Status</option>
                    <option value="Order Received">Order Received</option>
                    <option value="Order Prepared">Order Prepared</option>
                    <option value="Order Delivered">Order Delivered</option>
                </select>
            </div>
        </div>`).join('');
}

async function updateStatus(id, status) {
    await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT', 
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ status })
    });
    fetchAdminOrders();
}

function logout() { localStorage.clear(); location.reload(); }
if (localStorage.getItem('token')) startApp();