import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useRemovedMembers(initialParams = {}) {
  const [removedMembers, setRemovedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    ...initialParams
  });

  const fetchRemovedMembers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const { data } = await api.get(`/removed-members?${queryParams.toString()}`);
      setRemovedMembers(data.removedMembers || []);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch removed members');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRemovedMembers();
  }, [fetchRemovedMembers]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  };

  const deleteRemovedMember = async (id) => {
    await api.delete(`/removed-members/${id}`);
    await fetchRemovedMembers();
  };

  const clearAllRemovedMembers = async () => {
    await api.delete('/removed-members');
    await fetchRemovedMembers();
  };

  return {
    removedMembers,
    loading,
    error,
    pagination,
    params,
    updateParams,
    deleteRemovedMember,
    clearAllRemovedMembers,
    refetch: fetchRemovedMembers
  };
}
