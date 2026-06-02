import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../lib/utils';
import socket from '../lib/socket';

export function useActivities(dateOrRange) {
  const [activities, setActivities] = useState([]);
  const [dayData, setDayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch activities for a single date
  const fetchDay = useCallback(async (date) => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/activities/${date}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDayData(data);
      setActivities(data.activities || []);
    } catch (err) {
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch activities for a date range
  const fetchRange = useCallback(async (start, end) => {
    if (!start || !end) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/activities/range/${start}/${end}`);
      if (!res.ok) throw new Error('Failed to fetch range');
      const data = await res.json();

      // Aggregate all activities from the range
      const allActivities = data.flatMap((day) => day.activities || []);
      setActivities(allActivities);
      setDayData(data);
    } catch (err) {
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new activity
  const addActivity = useCallback(async (date, activity) => {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, activity }),
      });
      if (!res.ok) throw new Error('Failed to add activity');
      const data = await res.json();
      setDayData(data);
      setActivities(data.activities || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update an activity
  const updateActivity = useCallback(async (date, activityId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/activities/${date}/${activityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update activity');
      const data = await res.json();
      setDayData(data);
      setActivities(data.activities || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete an activity
  const deleteActivity = useCallback(async (date, activityId) => {
    try {
      const res = await fetch(`${API_BASE}/activities/${date}/${activityId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete activity');
      const data = await res.json();
      setDayData(data);
      setActivities(data.activities || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Listen for socket updates
  useEffect(() => {
    const handleUpdate = (data) => {
      if (dateOrRange && data.date === dateOrRange) {
        setDayData(data.day);
        setActivities(data.day.activities || []);
      }
    };

    socket.on('activity-updated', handleUpdate);
    return () => socket.off('activity-updated', handleUpdate);
  }, [dateOrRange]);

  return {
    activities,
    dayData,
    loading,
    error,
    fetchDay,
    fetchRange,
    addActivity,
    updateActivity,
    deleteActivity,
  };
}

export default useActivities;
