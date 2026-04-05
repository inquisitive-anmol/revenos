import { useCallback } from "react";
import { useApi } from "../lib/api";
import { useMeetingStore } from "../stores/meeting.store";

export const useMeetings = () => {
  const api = useApi();
  const { setMeetings, setLoading, setError } = useMeetingStore();

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/v1/meetings");
      setMeetings(res.data.data || res.data.meetings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  return { fetchMeetings };
};