// Components/ProductsTable.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  image?: string;
}

interface ProductsTableProps {
  products: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  isLoading: boolean;
}

const statusConfig = {
  in_stock: { label: 'In Stock', color: 'green', icon: CheckCircle },
  low_stock: { label: 'Low Stock', color: 'orange', icon: AlertTriangle },
  out_of_stock: { label: 'Out of Stock', color: 'red', icon: XCircle }
};

const TableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="w-20 h-4 bg-slate-200 rounded"></div>
        <div className="w-20 h-4 bg-slate-200 rounded"></div>
        <div className="w-24 h-4 bg-slate-200 rounded"></div>
      </div>
    ))}
  </div>
);

const ProductsTable: React.FC<ProductsTableProps> = ({ products, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(products.current_page);

  const filteredProducts = products.data.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Trigger API call via Inertia
    router.get(route('admin.products.index', { page, per_page: products.per_page }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="p-4">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
    >
      {/* Table Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="font-bold text-slate-900">Top Selling Products</h3>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {products.total} total
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-48 sm:w-64"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="divide-y divide-slate-50">
        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No products found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredProducts.map((product, idx) => {
              const StatusIcon = statusConfig[product.status].icon;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: '#F8FAFC' }}
                  className="p-4 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image Placeholder */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/products/${product.id}`} className="hover:underline">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">By: {product.brand}</p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-slate-900">${product.price.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Price</p>
                    </div>
                    
                    {/* Quantity */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-semibold text-slate-900">{product.quantity}</p>
                      <p className="text-[10px] text-slate-400">Quantity</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="min-w-[100px]">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        product.status === 'in_stock' ? 'bg-green-50 text-green-700' :
                        product.status === 'low_stock' ? 'bg-orange-50 text-orange-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[product.status].label}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Link>
                      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {products.last_page > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {((currentPage - 1) * products.per_page) + 1} to {Math.min(currentPage * products.per_page, products.total)} of {products.total} products
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, products.last_page) }, (_, i) => {
              let pageNum = currentPage;
              if (products.last_page <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= products.last_page - 2) {
                pageNum = products.last_page - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === products.last_page}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductsTable;