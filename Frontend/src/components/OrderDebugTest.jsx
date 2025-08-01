import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createOrder } from '../features/orders/ordersSlice';

const OrderDebugTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const testOrderCreation = async () => {
    setLoading(true);
    try {
      const testOrderData = {
        orderItems: [
          {
            product: 1,
            quantity: 2,
            price: 25.99,
          }
        ],
        shippingAddress: '123 Test Street, Test City, TS, 12345, US',
        phoneNumber: '+1234567890',
        totalPrice: 51.98,
        paymentMethod: 'test',
        paymentIntentId: 'test-payment-' + Date.now(),
      };

      console.log('Testing order creation with:', testOrderData);

      const result = await dispatch(createOrder(testOrderData)).unwrap();
      
      setTestResult(`✅ Order created successfully!
Response: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Order creation test failed:', error);
      setTestResult(`❌ Order creation failed:
Error: ${error}
Stack: ${error.stack || 'No stack trace'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const testOrderData = {
        orderItems: [{ product: 1, quantity: 1, price: 10.00 }],
        shippingAddress: '123 Test St, Test City, TS, 12345, US',
        phoneNumber: '+1234567890',
        totalPrice: 10.00,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testOrderData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Direct API test successful!
Status: ${response.status}
Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Direct API test failed!
Status: ${response.status}
Response: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ Direct API test error:
Error: ${error.message}
Stack: ${error.stack || 'No stack trace'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const accessToken = localStorage.getItem('access_token');
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;

    setTestResult(`🔍 Auth Status Check:
access_token: ${accessToken ? 'Present ✅' : 'Missing ❌'}
token (legacy): ${token ? 'Present ✅' : 'Missing ❌'}
API URL: ${apiUrl}
Current path: ${window.location.pathname}

Token details:
${accessToken ? `access_token length: ${accessToken.length}` : 'No access_token'}
${token ? `token length: ${token.length}` : 'No legacy token'}`);
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border border-orange-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        🛒 Order System Test
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          onClick={checkAuthStatus}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          🔐 Check Auth
        </button>
        
        <button
          onClick={testDirectAPI}
          disabled={loading}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {loading ? '⏳ Testing...' : '🔗 Direct API'}
        </button>

        <button
          onClick={testOrderCreation}
          disabled={loading}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {loading ? '⏳ Testing...' : '🛒 Redux Test'}
        </button>
      </div>
      
      {testResult && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
            {testResult}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p><strong>📝 Test sequence:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Check Auth - Verify authentication tokens</li>
          <li>Direct API - Test order endpoint directly</li>
          <li>Redux Test - Test through Redux store</li>
        </ol>
      </div>
    </div>
  );
};

export default OrderDebugTest;
