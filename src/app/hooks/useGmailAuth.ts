'use client';

import { useState, useEffect, useCallback } from 'react';

interface GmailAuthState {
  isConnected: boolean;
  email: string | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'gmail_auth';

export function useGmailAuth() {
  const [state, setState] = useState<GmailAuthState>({
    isConnected: false,
    email: null,
    accessToken: null,
    isLoading: true,
    error: null,
  });

  // Load saved auth on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Check if token is still valid (expires_at is in the future)
        if (data.expires_at && Date.now() < data.expires_at) {
          setState({
            isConnected: true,
            email: data.email,
            accessToken: data.access_token,
            isLoading: false,
            error: null,
          });
          return;
        } else {
          // Token expired, clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  // Handle OAuth callback (check URL for code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('gmail_code');
    const error = params.get('gmail_error');

    if (error) {
      setState(prev => ({ ...prev, error: `Gmail auth failed: ${error}`, isLoading: false }));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (code) {
      // Exchange code for tokens
      exchangeCodeForTokens(code);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const exchangeCodeForTokens = async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/gmail/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const authData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        email: data.email,
        expires_at: Date.now() + (data.expires_in * 1000),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

      setState({
        isConnected: true,
        email: data.email,
        accessToken: data.access_token,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect Gmail',
      }));
    }
  };

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/gmail/auth');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Open Google OAuth in a popup or redirect
      window.location.href = data.authUrl;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start Gmail auth',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isConnected: false,
      email: null,
      accessToken: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
}

// Helper to get the current access token (for use in tool execution)
export function getGmailAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const data = JSON.parse(saved);
    if (data.expires_at && Date.now() < data.expires_at) {
      return data.access_token;
    }
  } catch {
    // Invalid data
  }
  return null;
}

