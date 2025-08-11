import apiClient from './api';

const creditService = {
  // Shop Owner: Marquer un crédit comme payé
  markCreditAsPaid: async (orderId) => {
    const response = await apiClient.patch(`/orders/credit/mark-paid/`, {
      order_id: orderId
    });
    return response.data;
  },

  // Shop Owner: Obtenir les statistiques des crédits
  getCreditStats: async () => {
    const response = await apiClient.get('/orders/shop-owner/credit-stats/');
    return response.data;
  },

  // Shop Owner: Obtenir les crédits par utilisateur
  getCreditsByUser: async () => {
    const response = await apiClient.get('/orders/shop-owner/credits-by-user/');
    return response.data;
  },

  // Customer: Obtenir tous ses crédits
  getMyCredits: async () => {
    const response = await apiClient.get('/orders/my-credits/');
    return response.data;
  },

  // Customer: Obtenir les crédits à payer bientôt (dans les 7 jours)
  getUpcomingCredits: async () => {
    const response = await apiClient.get('/orders/my-credits/?upcoming=true');
    return response.data;
  },

  // Helper: Calculer les statistiques côté client
  calculateCustomerStats: (credits) => {
    return credits.reduce((acc, credit) => {
      const amount = parseFloat(credit.total_price || 0);
      
      if (credit.credit_status === 'paid') {
        acc.paid += amount;
        acc.paidCount++;
      } else if (credit.credit_status === 'approved') {
        acc.unpaid += amount;
        acc.unpaidCount++;
        
        // Vérifier si c'est en retard
        if (credit.payment_due_date && new Date(credit.payment_due_date) < new Date()) {
          acc.overdue += amount;
          acc.overdueCount++;
        }
        
        // Vérifier si c'est bientôt dû (dans les 7 jours)
        if (credit.payment_due_date) {
          const daysUntilDue = Math.ceil((new Date(credit.payment_due_date) - new Date()) / (1000 * 60 * 60 * 24));
          if (daysUntilDue <= 7 && daysUntilDue > 0) {
            acc.dueSoon += amount;
            acc.dueSoonCount++;
          }
        }
      }
      
      acc.total += amount;
      acc.totalCount++;
      
      return acc;
    }, {
      total: 0, totalCount: 0,
      paid: 0, paidCount: 0,
      unpaid: 0, unpaidCount: 0,
      overdue: 0, overdueCount: 0,
      dueSoon: 0, dueSoonCount: 0
    });
  },

  // Helper: Filtrer les crédits selon le statut
  filterCredits: (credits, filter) => {
    switch (filter) {
      case 'paid':
        return credits.filter(credit => credit.credit_status === 'paid');
      case 'unpaid':
        return credits.filter(credit => 
          credit.credit_status === 'approved' && credit.credit_status !== 'paid'
        );
      case 'overdue':
        return credits.filter(credit => 
          credit.credit_status === 'approved' && 
          credit.credit_status !== 'paid' &&
          credit.payment_due_date && 
          new Date(credit.payment_due_date) < new Date()
        );
      case 'soon':
        return credits.filter(credit => {
          if (credit.credit_status !== 'approved' || credit.credit_status === 'paid') return false;
          if (!credit.payment_due_date) return false;
          const daysUntilDue = Math.ceil((new Date(credit.payment_due_date) - new Date()) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= 7 && daysUntilDue > 0;
        });
      default:
        return credits;
    }
  }
};

export default creditService;
