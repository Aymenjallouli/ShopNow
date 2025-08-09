import React, { useState } from 'react';

const PaymentConnectionTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      if (!token) {
        setTestResult('❌ No authentication token found. Please login first.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-payment-intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          amount: 1000, // $10.00 for test
          currency: 'usd' 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ Backend connection successful! 
Client Secret: ${data.clientSecret ? 'Received ✅' : 'Missing ❌'}
Payment Intent ID: ${data.paymentIntentId || 'N/A'}
Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Backend error (${response.status}): 
${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error.message}
Stack: ${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  const testEnvVariables = () => {
    const envInfo = {
      'VITE_API_URL': import.meta.env.VITE_API_URL,
      'VITE_STRIPE_PUBLISHABLE_KEY': import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Set ✅' : 'Missing ❌',
      'VITE_SHOW_D17': import.meta.env.VITE_SHOW_D17,
      'Access Token': localStorage.getItem('access_token') ? 'Present ✅' : 'Missing ❌',
      'Token (legacy)': localStorage.getItem('token') ? 'Present ✅' : 'Missing ❌',
    };
    
    setTestResult(`🔧 Environment Variables & Auth:
${Object.entries(envInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

🔄 Current URL: ${window.location.href}
🌐 Base API URL: ${import.meta.env.VITE_API_URL}`);
  };

  const showTestCards = () => {
    setTestResult(`💳 STRIPE TEST CARDS (Safe to use):

✅ SUCCESSFUL PAYMENTS:
• Visa: 4242424242424242
• Visa (debit): 4000056655665556  
• Mastercard: 5555555555554444
• American Express: 378282246310005

❌ FAILED PAYMENTS (for testing errors):
• Declined: 4000000000000002
• Insufficient funds: 4000000000009995
• Expired card: 4000000000000069

📋 OTHER INFO (use any):
• Expiry: Any future date (12/25)
• CVC: Any 3 digits (123)
• ZIP: Any code (12345)

⚠️ IMPORTANT: These only work in TEST MODE!`);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl shadow-lg p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        🧪 Payment System Diagnostics
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          onClick={testEnvVariables}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          🔧 Check Config
        </button>
        
        <button
          onClick={testBackendConnection}
          disabled={loading}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {loading ? '⏳ Testing...' : '🔌 Test API'}
        </button>

        <button
          onClick={showTestCards}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          💳 Test Cards
        </button>
      </div>
      
      {testResult && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono overflow-x-auto">
            {testResult}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-slate-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p><strong>💡 Quick Test Steps:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>Click "Check Config" to verify setup</li>
          <li>Click "Test API" to check backend connection</li>
          <li>Click "Test Cards" to see safe test card numbers</li>
          <li>Use test cards in the payment form below</li>
        </ol>
      </div>
    </div>
  );
};

export default PaymentConnectionTest;
