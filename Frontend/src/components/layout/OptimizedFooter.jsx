import React from 'react';
import { OptimizedSVG } from './OptimizedSVG';

/**
 * Footer optimisé pour éviter les décalages de mise en page (CLS)
 * Utilise des hauteurs fixes et des placeholders
 */
const OptimizedFooter = () => {
  return (
    <footer 
      className="bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      style={{
        // Hauteur minimale pour éviter le CLS
        minHeight: '320px'
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <OptimizedSVG 
                className="w-8 h-8 text-emerald-400" 
                width={32} 
                height={32}
                viewBox="0 0 24 24"
              >
                <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
              </OptimizedSVG>
              <span className="text-xl font-bold">ShopNow</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Votre plateforme e-commerce moderne pour une expérience d'achat exceptionnelle. 
              Livraison rapide, paiements sécurisés et service client de qualité.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              {['Accueil', 'Produits', 'À propos', 'Contact'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                    style={{ minHeight: '20px', display: 'block' }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {['FAQ', 'Livraison', 'Retours', 'Garantie'].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                    style={{ minHeight: '20px', display: 'block' }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Réseaux sociaux et copyright */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 sm:mb-0">
            {[
              { name: 'Facebook', viewBox: '0 0 24 24', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { name: 'Twitter', viewBox: '0 0 24 24', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
              { name: 'Instagram', viewBox: '0 0 24 24', path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.326-1.297C3.826 14.394 3.826 12.645 5.123 11.348c1.297-1.297 3.046-1.297 4.343 0 1.297 1.297 1.297 3.046 0 4.343-.878.807-2.029 1.297-3.326 1.297z' }
            ].map((social) => (
              <a
                key={social.name}
                href="#"
                className="text-slate-400 hover:text-white transition-colors duration-200"
                aria-label={social.name}
                style={{ minWidth: '24px', minHeight: '24px', display: 'block' }}
              >
                <OptimizedSVG 
                  className="w-6 h-6" 
                  width={24} 
                  height={24}
                  viewBox={social.viewBox}
                >
                  <path d={social.path} />
                </OptimizedSVG>
              </a>
            ))}
          </div>
          
          <p className="text-slate-400 text-sm">
            © 2025 ShopNow. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default OptimizedFooter;
