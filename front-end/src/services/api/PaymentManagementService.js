import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const API_URL = process.env.REACT_APP_API_URL || API_BASE_URL;

class PaymentManagementService {
  // Get orders for payment management
  static async getOrdersForPaymentManagement(params = {}) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/orders/payment-management`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status || 'held'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders for payment management:', error);
      throw error;
    }
  }

  // Release payment for an order
  static async releasePayment(orderId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/release-payment`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw error;
    }
  }

  // Refund payment to buyer
  static async refundPaymentToBuyer(orderId, reason) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/refund-payment`,
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error refunding payment to buyer:', error);
      throw error;
    }
  }
}

export default PaymentManagementService;
