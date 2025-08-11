'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/api';
import { UserSale, UserOrder } from '@/lib/types';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const [sales, setSales] = useState<UserSale[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'orders'>('sales');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [salesData, ordersData] = await Promise.all([
          auth.getUserSales({ limit: 10 }),
          auth.getUserOrders({ limit: 10 })
        ]);
        
        setSales(salesData);
        setOrders(ordersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className={`p-6 ${className || ''}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className || ''}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number, currency: string = '€') => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`p-6 ${className || ''}`}>
      <h2 className="text-2xl font-bold mb-6">Your Account</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'sales'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sales ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Orders ({orders.length})
        </button>
      </div>

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Sales</h3>
          {sales.length === 0 ? (
            <p className="text-gray-500">No sales found.</p>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {sale.image && sale.image[0] && (
                      <img
                        src={sale.image[0].url_200 || sale.image[0].url}
                        alt={sale.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{sale.name}</h4>
                      {sale.brand && (
                        <p className="text-sm text-gray-500">{sale.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-green-600">
                          {sale.price_formatted || formatPrice(sale.price, sale.currency)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(sale.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sale.status === 'paid_out' ? 'bg-green-100 text-green-800' :
                          sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sale.status}
                        </span>
                        {sale.shipping_status && (
                          <span className="text-xs text-gray-500">
                            {sale.shipping_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {order.image && order.image[0] && (
                      <img
                        src={order.image[0].url_200 || order.image[0].url}
                        alt={order.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{order.name}</h4>
                      {order.brand && (
                        <p className="text-sm text-gray-500">{order.brand}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-blue-600">
                          {order.price_formatted || formatPrice(order.price, order.currency)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        {order.shipping_status && (
                          <span className="text-xs text-gray-500">
                            {order.shipping_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 