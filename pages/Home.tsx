
import React from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Search, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
    const { state } = useStore();
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Extract Categories
  const categories = ['All', ...Array.from(new Set(state.products.map(p => p.category)))];

  const filteredProducts = state.products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header / Search Bar Area */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
         <h1 className="text-2xl font-bold text-gray-800">Groceries & Essentials</h1>
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
                type="text"
                placeholder="Search for 'milk', 'bread'..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow text-gray-900 placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar - Sticky Categories */}
        <aside className="w-full md:w-64 flex-shrink-0 sticky top-24 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-700">Categories</h2>
            </div>
            <ul className="divide-y divide-gray-100">
                {categories.map(c => (
                    <li key={c}>
                        <button
                            onClick={() => setSelectedCategory(c)}
                            className={`w-full text-left px-4 py-3 text-sm font-medium flex justify-between items-center transition-colors hover:bg-gray-50 ${
                                selectedCategory === c 
                                    ? 'text-green-600 bg-green-50 border-l-4 border-green-600' 
                                    : 'text-gray-600 border-l-4 border-transparent'
                            }`}
                        >
                            {c}
                            {selectedCategory === c && <ChevronRight size={16} />}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">
            
            {/* Promo Banner - Only show if not searching */}
            {!search && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 md:p-8 text-white mb-8 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">FREE DELIVERY</span>
                        <h2 className="text-3xl font-bold mb-2">Fresh Groceries in Minutes</h2>
                        <p className="text-emerald-50 max-w-md">Get fresh produce, dairy, and daily essentials delivered to your doorstep faster than ever.</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-1/4 translate-x-1/4">
                        <div className="w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    </div>
                </div>
            )}

            {/* Product Grid Header */}
            <div className="mb-4 flex items-baseline justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        {search ? `Search Results for "${search}"` : (selectedCategory === 'All' ? 'All Products' : selectedCategory)}
                    </h2>
                    {search && (
                        <button onClick={() => setSearch('')} className="text-sm text-red-500 hover:underline">Clear Search</button>
                    )}
                </div>
                <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                    <p className="text-gray-500">We couldn't find anything matching "{search}".</p>
                    <button onClick={() => setSearch('')} className="mt-4 text-green-600 font-bold hover:underline">View All Products</button>
                </div>
            )}

        </main>
      </div>
    </div>
  );
};

export default Home;
