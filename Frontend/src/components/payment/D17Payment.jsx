import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const D17Payment = ({ amount, orderId, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const { t } = useTranslation();

  const initiateD17Payment = async () => {
    setProcessing(true);
    try {
      // Appel à votre backend pour initier le paiement d17
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/d17/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          amount: amount,
          order_id: orderId,
          currency: 'TND', // Dinar Tunisien
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentUrl(data.payment_url);
        // Rediriger vers d17 ou ouvrir dans une nouvelle fenêtre
        window.open(data.payment_url, '_blank');
        
        // Commencer à vérifier le statut du paiement
        checkPaymentStatus(data.payment_id);
      } else {
  throw new Error(data.error || t('d17Payment.initError', 'Erreur lors de l\'initialisation du paiement'));
      }
    } catch (error) {
      console.error('Erreur d17:', error);
  toast.error(t('d17Payment.error', 'Erreur lors du paiement d17'));
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    const maxAttempts = 30; // 5 minutes maximum
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/d17/status/${paymentId}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        const data = await response.json();

        if (data.status === 'completed') {
          toast.success(t('d17Payment.success', 'Paiement réussi !'));
          onSuccess(data);
        } else if (data.status === 'failed') {
          toast.error(t('d17Payment.failed', 'Paiement échoué'));
          onError(data);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000); // Vérifier toutes les 10 secondes
        } else {
          toast.warning(t('d17Payment.timeout', 'Temps d\'attente dépassé. Veuillez vérifier votre paiement.'));
          onError({ error: 'Timeout' });
        }
      } catch (error) {
        console.error('Erreur vérification statut:', error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 10000);
        }
      }
    };

    checkStatus();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">d17</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {t('d17Payment.title', 'Paiement d17')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('d17Payment.secureTunisia', 'Paiement sécurisé en Tunisie')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">{t('d17Payment.amountToPay', 'Montant à payer:')}</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {amount} TND
            </span>
          </div>
        </div>

        {paymentUrl && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              {t('d17Payment.newWindow', "Une nouvelle fenêtre s'est ouverte pour effectuer le paiement.")}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-300">
              {t('d17Payment.ifNotOpen', "Si la fenêtre ne s'ouvre pas,")}
              <a 
                href={paymentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                {t('d17Payment.clickHere', 'cliquez ici')}
              </a>
            </p>
          </div>
        )}

        <button
          onClick={initiateD17Payment}
          disabled={processing}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {t('d17Payment.processing', 'Traitement...')}
            </>
          ) : (
            <>
              <span>💳</span>
              {t('d17Payment.payWithD17', 'Payer avec d17')}
            </>
          )}
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          <p>{t('d17Payment.secureByD17', '✓ Paiement sécurisé par d17')}</p>
          <p>{t('d17Payment.tunisianCards', '✓ Cartes bancaires tunisiennes acceptées')}</p>
        </div>
      </div>
    </div>
  );
};

export default D17Payment;
