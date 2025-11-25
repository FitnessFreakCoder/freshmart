
import { Product, User, UserRole, Order, Coupon, OrderStatus } from '../types';

// Mock Data with NPR Prices
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Organic Bananas', price: 150.00, originalPrice: 180.00, unit: '1 dozen', stock: 100, category: 'Fresh Fruits', imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61c17a86271?auto=format&fit=crop&w=400&q=80', bulkRule: { qty: 2, price: 280.00 } },
  { id: 2, name: 'Whole Milk', price: 120.00, originalPrice: 130.00, unit: '1 L', stock: 50, category: 'Dairy, Bread & Eggs', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Sourdough Bread', price: 180.00, unit: '1 loaf', stock: 20, category: 'Dairy, Bread & Eggs', imageUrl: 'https://images.unsplash.com/photo-1585478259539-e6215b19066b?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Farm Fresh Eggs', price: 20.00, originalPrice: 25.00, unit: '1 pc', stock: 200, category: 'Dairy, Bread & Eggs', imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80', bulkRule: { qty: 6, price: 100.00 } },
  { id: 5, name: 'Avocado', price: 350.00, originalPrice: 400.00, unit: '1 pc', stock: 40, category: 'Fresh Fruits', imageUrl: 'https://images.unsplash.com/photo-1523049673856-6468baca2929?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Fresh Tomato', price: 60.00, originalPrice: 80.00, unit: '1 kg', stock: 60, category: 'Vegetables', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Coca Cola', price: 60.00, originalPrice: 65.00, unit: '250 ml', stock: 100, category: 'Cold Drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Lays Chips', price: 50.00, unit: '1 pack', stock: 80, category: 'Munchies', imageUrl: 'https://images.unsplash.com/photo-1566478919030-261443943943?auto=format&fit=crop&w=400&q=80' },
];

const MOCK_COUPONS: Coupon[] = [
  { code: 'NEPAL100', discountAmount: 100, expiry: '2025-12-31', minOrderAmount: 1000 },
  { code: 'FRESH200', discountAmount: 200, expiry: '2025-10-15', minOrderAmount: 5000 },
  { code: 'AUTO50', discountAmount: 50, expiry: '2099-12-31', minOrderAmount: 2000 } // Auto-apply example
];

// Simulation of Local Storage Persistence
const load = <T,>(key: string, def: T): T => {
  const s = localStorage.getItem(key);
  try {
      return s ? JSON.parse(s) : def;
  } catch(e) {
      return def;
  }
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockApi = {
  login: async (identifier: string, password: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 800)); // Latency
    
    // 1. Check Registered Users (Local Storage) FIRST to allow password overrides
    const users = load<any[]>('users', []);
    const foundUser = users.find((u: any) => (u.email === identifier || u.username === identifier) && u.password === password);
    
    if (foundUser) {
        return { ...foundUser, token: 'mock_jwt_' + Date.now() };
    }

    // 2. Check Hardcoded Defaults (Only if not found in LS)
    // Updated Admin Credentials
    if (identifier === 'SidasAdmin' && password === 'S!dd@17082003') {
      return { id: 1, username: 'SidasAdmin', email: 'admin@freshmart.com', role: UserRole.ADMIN, token: 'mock_admin_jwt' };
    }

    if (identifier === 'role' && password === 'role123') {
       return { id: 3, username: 'Store Manager', email: 'staff@freshmart.com', role: UserRole.STAFF, token: 'mock_staff_jwt' };
    }

    if ((identifier === 'user@freshmart.com' || identifier === 'user') && password === 'user') {
      return { id: 2, username: 'John Doe', email: 'user@freshmart.com', role: UserRole.USER, token: 'mock_user_jwt' };
    }
    
    throw new Error('Invalid credentials');
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 800));
    const users = load<any[]>('users', []);
    
    if (users.find(u => u.email === email || u.username === username)) {
        throw new Error('User/Email already exists');
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password, // In real backend, this is hashed
        role: UserRole.USER
    };
    
    users.push(newUser);
    save('users', users);
    
    return { ...newUser, token: 'mock_jwt_' + Date.now() };
  },

  resetPassword: async (identifier: string, newPassword: string): Promise<void> => {
      await new Promise(r => setTimeout(r, 800));
      const users = load<any[]>('users', []);
      const userIdx = users.findIndex(u => u.email === identifier || u.username === identifier);

      // If user exists in DB, update password
      if (userIdx !== -1) {
          users[userIdx].password = newPassword;
          save('users', users);
          return;
      }

      // If user is one of the hardcoded ones but not in DB yet, create an override entry
      // Updated to check EMAIL as well for hardcoded users
      if (identifier === 'role' || identifier === 'staff@freshmart.com') {
          const staffOverride = {
              id: 3, 
              username: 'role', 
              email: 'staff@freshmart.com', 
              password: newPassword,
              role: UserRole.STAFF
          };
          users.push(staffOverride);
          save('users', users);
          return;
      }

      // Updated Admin Override check
      if (identifier === 'SidasAdmin' || identifier === 'admin@freshmart.com') {
          const adminOverride = {
              id: 1, 
              username: 'SidasAdmin', 
              email: 'admin@freshmart.com', 
              password: newPassword,
              role: UserRole.ADMIN
          };
          users.push(adminOverride);
          save('users', users);
          return;
      }

       if (identifier === 'user' || identifier === 'user@freshmart.com') {
          const userOverride = {
              id: 2, 
              username: 'user', 
              email: 'user@freshmart.com', 
              password: newPassword,
              role: UserRole.USER
          };
          users.push(userOverride);
          save('users', users);
          return;
      }

      throw new Error('User not found');
  },

  getProducts: async (): Promise<Product[]> => {
    return load<Product[]>('products', MOCK_PRODUCTS);
  },

  saveProduct: async (product: Product): Promise<Product> => {
    const products = load<Product[]>('products', MOCK_PRODUCTS);
    
    if (product.id === 0) {
        product.id = Date.now();
        products.push(product);
    } else {
        const idx = products.findIndex(p => String(p.id) === String(product.id));
        if (idx !== -1) {
            products[idx] = product;
        } else {
            products.push(product);
        }
    }
    save('products', products);
    return product;
  },

  deleteProduct: async (id: number | string): Promise<void> => {
      let products = load<Product[]>('products', MOCK_PRODUCTS);
      const newProducts = products.filter(p => String(p.id) !== String(id));
      save('products', newProducts);
  },

  getOrders: async (userId?: number): Promise<Order[]> => {
    const orders = load<Order[]>('orders', []);
    const users = load<any[]>('users', []);

    const getUsername = (uid: number) => {
        if (uid === 1) return 'Admin User';
        if (uid === 2) return 'John Doe';
        if (uid === 3) return 'Store Manager';
        const u = users.find(user => user.id === uid);
        return u ? u.username : 'Unknown User';
    };

    const enrichedOrders = orders.map(o => ({
        ...o,
        username: getUsername(o.userId)
    }));

    if (userId) {
        return enrichedOrders.filter(o => o.userId === userId);
    }
    return enrichedOrders;
  },

  placeOrder: async (order: Order): Promise<Order> => {
    const orders = load<Order[]>('orders', []);
    orders.unshift(order);
    save('orders', orders);

    if (order.userId && order.mobileNumber) {
        const users = load<User[]>('users', []);
        const userIdx = users.findIndex(u => u.id === order.userId);
        if (userIdx !== -1) {
            const rawMobile = order.mobileNumber.replace('+977-', '');
            users[userIdx] = { ...users[userIdx], mobileNumber: rawMobile };
            save('users', users);
        }
    }

    return order;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    const orders = load<Order[]>('orders', []);
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = status;
        save('orders', orders);
    }
  },

  getCoupons: async (): Promise<Coupon[]> => {
      return load<Coupon[]>('coupons', MOCK_COUPONS);
  },

  createCoupon: async (coupon: Coupon): Promise<void> => {
      const coupons = load<Coupon[]>('coupons', MOCK_COUPONS);
      coupons.push(coupon);
      save('coupons', coupons);
  },

  // NEW: Update Coupon Logic
  updateCoupon: async (originalCode: string, updatedCoupon: Coupon): Promise<void> => {
      let coupons = load<Coupon[]>('coupons', MOCK_COUPONS);
      const index = coupons.findIndex(c => c.code === originalCode);
      if (index !== -1) {
          // Check if changing code results in duplicate
          if (updatedCoupon.code !== originalCode && coupons.find(c => c.code === updatedCoupon.code)) {
               throw new Error("Coupon code already exists");
          }
          coupons[index] = updatedCoupon;
          save('coupons', coupons);
      } else {
          throw new Error("Coupon not found");
      }
  },

  deleteCoupon: async (code: string): Promise<void> => {
      let coupons = load<Coupon[]>('coupons', MOCK_COUPONS);
      coupons = coupons.filter(c => c.code !== code);
      save('coupons', coupons);
  },

  validateCoupon: async (code: string, orderTotal: number = 0): Promise<{ isValid: boolean, coupon?: Coupon, error?: string }> => {
    const coupons = load<Coupon[]>('coupons', MOCK_COUPONS);
    const found = coupons.find(c => c.code === code);
    
    if (!found) {
        return { isValid: false, error: 'Invalid coupon code' };
    }
    
    if (new Date(found.expiry) < new Date()) {
        return { isValid: false, error: 'Coupon expired' };
    }

    if (found.minOrderAmount && orderTotal < found.minOrderAmount) {
        return { 
            isValid: false, 
            error: `Order must be at least Rs. ${found.minOrderAmount} to use this coupon.` 
        };
    }
    
    return { isValid: true, coupon: found };
  },

  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    await new Promise(r => setTimeout(r, 500));
    return `Detected Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
  }
};
