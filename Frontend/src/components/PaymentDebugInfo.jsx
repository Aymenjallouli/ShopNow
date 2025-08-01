import React from 'react';
import { useSelector } from 'react-redux';

const PaymentDebugInfo = () => {
  const { user } = useSelector((state) => state.auth);
  
  const debugInfo = {
    userCountry: user?.country || 'Non défini',
    browserLanguage: window.navigator.language,
    showD17EnvVar: import.meta.env.VITE_SHOW_D17,
    nodeEnv: import.meta.env.NODE_ENV,
    isDevelopment: import.meta.env.NODE_ENV === 'development',
    stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Configuré' : 'Non configuré',
    apiUrl: import.meta.env.VITE_API_URL,
  };

  // Conditions pour afficher d17 (même logique que PaymentMethodSelector)
  const shouldShowD17 = 
    import.meta.env.VITE_SHOW_D17 === 'true' || 
    user?.country === 'TN' || 
    window.navigator.language.includes('ar') ||
    import.meta.env.NODE_ENV === 'development';

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        🐛 Debug Info - Méthodes de paiement
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-yellow-700 mb-2">Configuration utilisateur:</h4>
          <ul className="space-y-1 text-yellow-600">
            <li>• Pays: <span className="font-mono">{debugInfo.userCountry}</span></li>
            <li>• Langue navigateur: <span className="font-mono">{debugInfo.browserLanguage}</span></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-yellow-700 mb-2">Variables d'environnement:</h4>
          <ul className="space-y-1 text-yellow-600">
            <li>• VITE_SHOW_D17: <span className="font-mono">{debugInfo.showD17EnvVar}</span></li>
            <li>• NODE_ENV: <span className="font-mono">{debugInfo.nodeEnv}</span></li>
            <li>• Stripe: <span className="font-mono">{debugInfo.stripeKey}</span></li>
            <li>• API URL: <span className="font-mono">{debugInfo.apiUrl}</span></li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Résultat:</h4>
        <p className="text-yellow-700">
          d17 sera {shouldShowD17 ? '✅ AFFICHÉ' : '❌ MASQUÉ'}
        </p>
        {!shouldShowD17 && (
          <div className="mt-2 text-xs text-yellow-600">
            <p>Pour afficher d17, vous pouvez:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Définir VITE_SHOW_D17=true dans .env</li>
              <li>Définir le pays utilisateur à "TN"</li>
              <li>Utiliser un navigateur en arabe</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDebugInfo;
