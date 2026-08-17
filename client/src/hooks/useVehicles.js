import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useVehicles(initialParams = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    memberId: '',
    ...initialParams
  });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const { data } = await api.get(`/vehicles?${queryParams.toString()}`);
      setVehicles(data.vehicles);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  };

  return { 
    vehicles, 
    loading, 
    error, 
    pagination, 
    params, 
    updateParams, 
    refetch: fetchVehicles 
  };
}

// Hook for expiring vehicles
export function useExpiringVehicles(days = 30) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/vehicles/expiring?days=${days}`);
        setVehicles(data);
      } catch (err) {
        console.error('Failed to fetch expiring vehicles', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [days]);

  return { vehicles, loading };
}