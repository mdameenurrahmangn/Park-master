import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { computeRange } from '../pages/reports/reportConfig';

export default function useReports() {
  const [reportType, setReportType] = useState('collection');
  const [period, setPeriod] = useState('monthly');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const range = useMemo(
    () => computeRange(period, customRange),
    [period, customRange]
  );

  const isValidRange = Boolean(range.start && range.end);

  const fetchReport = useCallback(async () => {
    if (!isValidRange) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reports', {
        params: { type: reportType, startDate: range.start, endDate: range.end }
      });
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [reportType, range.start, range.end, isValidRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    reportType, setReportType,
    period, setPeriod,
    customRange, setCustomRange,
    range, data, loading, error,
    refetch: fetchReport
  };
}