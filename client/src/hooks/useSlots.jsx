import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await api.get('/slots');
        setSlots(data.slots);
      } catch (err) {
        console.error('Failed to fetch slots', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  return { slots, loading };
}