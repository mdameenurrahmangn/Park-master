import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (formData) => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSettings(data);
      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, updateSettings, refetch: fetchSettings };
}