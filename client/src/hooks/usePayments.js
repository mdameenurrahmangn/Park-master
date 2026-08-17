import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function usePayments(initialParams = {}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    status: '',
    month: '',
    year: '',
    ...initialParams
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const { data } = await api.get(`/payments?${queryParams.toString()}`);
      setPayments(data.payments);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  };

  return { payments, loading, error, pagination, params, updateParams, refetch: fetchPayments };
}