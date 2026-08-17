import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useMembers(initialParams = {}) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialParams
  });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });
      
      const { data } = await api.get(`/members?${queryParams.toString()}`);
      setMembers(data.members);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateParams = (newParams) => {
    // Reset to page 1 when filters/search change
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  };

  return { members, loading, error, pagination, params, updateParams, refetch: fetchMembers };
}