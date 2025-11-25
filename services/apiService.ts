// services/apiService.ts

const API_BASE = 'http://localhost:5000';

export const api = {
  // Get all products
  getProducts: async () => {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  // Register user
  register: async (data) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  // Login user
  login: async (data) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  // Get orders (requires JWT)
  getOrders: async (token) => {
    const res = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Place order (requires JWT)
  placeOrder: async (order, token) => {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error('Order failed');
    return res.json();
  },

  // Get coupons
  getCoupons: async () => {
    const res = await fetch(`${API_BASE}/api/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  }
};
