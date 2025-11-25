
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Navbar: React.FC = () => {
  const { state, dispatch, isAdmin } = useStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const cartCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    window.location.hash = '/login';
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo & Location */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight text-gray-900">Freshmart<span className="text-orange-500">.</span></span>
            </Link>
            
            {/* Location Mock */}
            <div className="hidden md:flex items-center gap-1 max-w-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                 <MapPin size={18} className="text-orange-500" />
                 <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold text-gray-800">Delivery to</span>
                    <span className="text-xs text-gray-500 truncate max-w-[150px]">Kathmandu, Nepal...</span>
                 </div>
            </div>
          </div>
          
          {/* Middle: Search (Optional placeholder for now, can be expanded) */}
          <div className="hidden lg:block flex-1 max-w-xl mx-8">
              <div className="relative">
                  {/* Input handled in Home.tsx */}
              </div>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-6">
             {state.user && (
                <Link to="/orders" className="text-gray-700 hover:text-orange-600 font-medium text-sm">
                    Orders
                </Link>
             )}

             {isAdmin && (
                 <Link to="/admin" className="text-gray-700 hover:text-orange-600 font-medium text-sm">
                    Admin
                 </Link>
             )}
             
             {state.user ? (
                <div className="flex items-center gap-4">
                   <span className="text-sm font-bold text-gray-700">{state.user.username}</span>
                   <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
                     <LogOut className="h-5 w-5" />
                   </button>
                </div>
             ) : (
                <Link to="/login" className="text-gray-700 hover:text-orange-600 flex items-center gap-1 font-medium text-sm">
                  <UserIcon className="h-5 w-5" /> Sign In
                </Link>
             )}

             <Link to="/cart" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-bold text-sm">{cartCount} items</span>
             </Link>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50">Shop</Link>
            <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50">Cart ({cartCount})</Link>
            {state.user && <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50">Orders</Link>}
            {isAdmin && <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50">Admin</Link>}
            {!state.user ? (
               <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50">Login</Link>
            ) : (
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
