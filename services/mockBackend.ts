
import { Product, User, UserRole, Order, Coupon, OrderStatus } from '../types';

// Mock Data with NPR Prices
// Replaced with specific user request: Lifebuoy, Dettol, Basmati Rice
const MOCK_PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'Lifebuoy Soap', 
    price: 45.00, 
    originalPrice: 50.00, 
    unit: '1 bar', 
    stock: 50, 
    category: 'Personal Care', 
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 2, 
    name: 'Dettol Antiseptic Liquid', 
    price: 100.00, 
    originalPrice: 110.00, 
    unit: '1 bottle', 
    stock: 40, 
    category: 'Personal Care', 
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' 
  },
  { 
    id: 3, 
    name: 'Premium Basmati Rice', 
    price: 170.00, 
    originalPrice: 200.00, 
    unit: '1 kg', 
    stock: 20, 
    category: 'Grains & Essentials', 
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    bulkRule: { qty: 5, price: 800.00 } // Example bulk rule for rice
  },
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

  // NEW: Simulate Google Login
  loginWithGoogle: async (): Promise<User> => {
    await new Promise(r => setTimeout(r, 1200)); // Simulate OAuth popup delay

    // Simulate data returned from Google
    const googleProfile = {
        email: 'siddharth@gmail.com', // Mock Google Email
        name: 'Siddharth', // Name updated as requested
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
    };

    const users = load<any[]>('users', []);
    let user = users.find(u => u.email === googleProfile.email);

    if (!user) {
        // Create new user from Google Profile if not exists
        user = {
            id: Date.now(),
            username: googleProfile.name,
            email: googleProfile.email,
            password: 'GOOGLE_OAUTH_USER', // Placeholder
            role: UserRole.USER,
            profilePicture: googleProfile.picture
        };
        users.push(user);
        save('users', users);
    } else {
        // Update profile picture and username if existing user logs in with Google
        user.profilePicture = googleProfile.picture;
        user.username = googleProfile.name; // Ensure username matches Google name
        // Update user in array
        const idx = users.findIndex(u => u.id === user.id);
        users[idx] = user;
        save('users', users);
    }

    return { ...user, token: 'mock_google_token_' + Date.now() };
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
