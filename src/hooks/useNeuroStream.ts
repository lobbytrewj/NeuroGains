import { useEffect, useRef, useState } from 'react';

export interface NeuroData {
  timestamp: number;
  stability: number;
  tremor: number;
  fatigue: number;
  jitterFrequency: number;
}

export const useNeuroStream = (url: string = 'ws://localhost:8000/neuro-stream') => {
  const [data, setData] = useState<NeuroData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const neuroData: NeuroData = JSON.parse(event.data);
            setData(neuroData);
          } catch (err) {
            console.error('Failed to parse neuro data:', err);
          }
        };

        ws.onerror = () => {
          setError('WebSocket connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (err) {
        setError('Failed to establish WebSocket connection');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { data, isConnected, error };
};
