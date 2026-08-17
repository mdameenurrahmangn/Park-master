import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useParkingSlots() {
  const [slots, setSlots] = useState([]);
  const [groupedSlots, setGroupedSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/slots');
      setSlots(data.slots);
      setGroupedSlots(data.groupedSlots);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, groupedSlots, loading, error, refetch: fetchSlots };
}