import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_MOBILE = Platform.OS !== 'web';

const getLocalUrl = () => {
  if (Platform.OS !== 'web') return 'http://localhost:3005';
  return 'http://localhost:3005';
};

export const connectionUrl = IS_PRODUCTION || IS_MOBILE ? 'https://api.mindset.com' : getLocalUrl();

export const newRequest = axios.create({
  baseURL: `${connectionUrl}/api`,
  withCredentials: true,
});

newRequest.interceptors.request.use(async (config) => {
  // For mobile, we'll use AsyncStorage instead of localStorage
  const token = IS_MOBILE
    ? await AsyncStorage.getItem('authToken')
    : typeof window !== 'undefined'
    ? localStorage.getItem('authToken')
    : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add workspace header for web environment
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1]) {
      config.headers.workspace = pathParts[1];
    }
  }

  return config;
});

newRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      // You might want to use your navigation solution here
    }
    return Promise.reject(error);
  },
);

/**
 * Creates a streaming connection using fetch API for Server-Sent Events
 * @param endpoint The endpoint URL to stream from
 * @param method The HTTP method to use
 * @param data Request payload
 * @param onChunk Callback for processing each data chunk
 * @param onStart Callback for stream start event
 * @param onEnd Callback for stream end event
 * @param onError Callback for stream errors
 */
export const streamRequest = async ({
  endpoint,
  method = 'POST',
  data = {},
  onChunk,
  onStart,
  onEnd,
  onError,
}: {
  endpoint: string;
  method?: 'POST' | 'GET';
  data?: any;
  onChunk?: (chunk: any) => void;
  onStart?: (data: any) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}) => {
  let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const url = `${connectionUrl}/api${endpoint}`;
    const token = IS_MOBILE
      ? await AsyncStorage.getItem('authToken')
      : localStorage.getItem('authToken');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add workspace header for web environment
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 1 && pathParts[1]) {
        headers.workspace = pathParts[1];
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Stream request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Cannot read response body');
    }

    readerRef = reader;
    const decoder = new TextDecoder();
    let buffer = '';

    const processChunks = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onEnd?.();
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          let boundaryIndex;
          while ((boundaryIndex = buffer.indexOf('\n\n')) !== -1) {
            const eventData = buffer.slice(0, boundaryIndex);
            buffer = buffer.slice(boundaryIndex + 2);

            if (eventData.startsWith('data: ')) {
              try {
                const data = JSON.parse(eventData.substring(6));

                switch (data.type) {
                  case 'start':
                    onStart?.(data);
                    break;
                  case 'chunk':
                    onChunk?.(data);
                    break;
                  case 'error':
                    onError?.(data);
                    reader.cancel();
                    return;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (error) {
        onError?.(error);
        reader.cancel();
      }
    };

    processChunks();

    return {
      cancel: () => {
        if (readerRef) {
          readerRef.cancel();
        }
      },
    };
  } catch (error) {
    onError?.(error);
    return { cancel: () => {} };
  }
};
